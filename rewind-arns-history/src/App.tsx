import React, { useState, useEffect } from "react";
import axios from "axios";
import "./app.css";

// Use the arns.ar.io API for .ar.io names only!
const ARNS_API = "https://arns.ar.io/api/proxy/arns";

interface NameInfo {
  name: string;
  expiry: string;
  resolver: string;
  txId: string;
}
interface HistoryEvent {
  type: string;
  block: number;
  timestamp: number;
  owner: string;
  txid: string;
  summary: string;
}
interface HistoryResponse {
  history: HistoryEvent[];
}
interface OwnerResponse {
  names: NameInfo[];
}

function formatDate(expiry: string) {
  if (!expiry || isNaN(Number(expiry))) return "-";
  const d = new Date(Number(expiry) * 1000);
  return d.toLocaleDateString();
}
function shortenAddr(addr: string) {
  if (!addr) return "-";
  return addr.length > 12 ? addr.slice(0, 6) + "..." + addr.slice(-4) : addr;
}

// Only allow .ar.io names and Arweave addresses
function isArIoName(val: string) {
  return val.trim().toLowerCase().endsWith(".ar.io");
}
function arIoToAr(val: string) {
  // Converts permaweb.ar.io -> permaweb.ar for backend
  return val.trim().toLowerCase().replace(/\.ar\.io$/, ".ar");
}
function arIoToManageName(val: string) {
  // Converts permaweb.ar.io -> permaweb for manage link
  return val.trim().toLowerCase().replace(/\.ar\.io$/, "");
}
function arToArIo(val: string) {
  // Converts permaweb.ar -> permaweb.ar.io for display
  return val.trim().toLowerCase().endsWith(".ar")
    ? val.trim().slice(0, -3) + ".ar.io"
    : val.trim();
}
function arToManageName(val: string) {
  // Converts permaweb.ar -> permaweb for manage link
  return val.trim().toLowerCase().endsWith(".ar")
    ? val.trim().slice(0, -3)
    : val.trim();
}
function isArweaveAddress(val: string) {
  return /^[a-z0-9_-]{43,}$/i.test(val.trim());
}

const App: React.FC = () => {
  // Wallet state
  const [walletDetected, setWalletDetected] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // Search/filter state
  const [input, setInput] = useState("");
  const [filterResolver, setFilterResolver] = useState("");
  const [filterExpiryFrom, setFilterExpiryFrom] = useState("");
  const [filterExpiryTo, setFilterExpiryTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [names, setNames] = useState<NameInfo[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEvent[]>([]);
  const [selectedName, setSelectedName] = useState<string | null>(null);

  // Detect ArConnect wallet
  useEffect(() => {
    if (window.arweaveWallet) {
      setWalletDetected(true);
    } else {
      const timer = setInterval(() => {
        if (window.arweaveWallet) {
          setWalletDetected(true);
          clearInterval(timer);
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, []);

  // Connect wallet
  const connectWallet = async () => {
    setErr(null);
    try {
      await window.arweaveWallet?.connect(["ACCESS_ADDRESS"]);
      const address = await window.arweaveWallet?.getActiveAddress();
      setWalletConnected(true);
      setWalletAddress(address ?? null);
      setInput(address ?? "");
    } catch {
      setErr("Failed to connect ArConnect wallet.");
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setWalletConnected(false);
    setWalletAddress(null);
    setInput("");
  };

  // Autofill search when wallet is connected
  useEffect(() => {
    if (walletConnected && walletAddress) {
      setInput(walletAddress);
    }
  }, [walletConnected, walletAddress]);

  // Main search logic (.ar.io only or address)
  const handleSearch = async () => {
    setErr(null);
    setNames([]);
    setHistory([]);
    setSelectedName(null);

    const query = input.trim();
    if (!query) {
      setErr("Enter an ArNS (.ar.io) name or Arweave wallet address.");
      return;
    }

    setLoading(true);

    try {
      // 1. If .ar.io: lookup by name (convert to .ar for backend)
      if (isArIoName(query)) {
        try {
          const arName = arIoToAr(query);
          const url = `${ARNS_API}/names/${encodeURIComponent(arName)}`;
          const { data } = await axios.get<NameInfo>(url, { timeout: 10000 });
          setNames([
            {
              name: data.name,
              expiry: data.expiry,
              resolver: data.resolver,
              txId: data.txId
            }
          ]);
          setSelectedName(data.name);
          await fetchHistory(data.name);
        } catch (e: any) {
          if (e.response?.status === 404) {
            setErr(`No ArNS record found for "${query}". Try searching for the wallet address that owns it.`);
          } else if (e.response?.status === 400) {
            setErr("Invalid .ar.io name format.");
          } else {
            setErr("Failed to fetch data: " + (e.response?.data?.message || e.message || "Unknown error"));
          }
        }
      }
      // 2. If looks like an Arweave address: lookup by address
      else if (isArweaveAddress(query)) {
        try {
          const url = `${ARNS_API}/names?owner=${encodeURIComponent(query)}`;
          const { data } = await axios.get<OwnerResponse>(url, { timeout: 10000 });
          if (data.names && data.names.length > 0) {
            setNames(data.names.map(n => ({
              name: n.name,
              expiry: n.expiry,
              resolver: n.resolver,
              txId: n.txId
            })));
          } else {
            setErr("No ArNS (.ar.io) names found for this wallet address.");
          }
        } catch (e: any) {
          if (e.response?.status === 404) {
            setErr("No ArNS (.ar.io) names found for this wallet address.");
          } else if (e.response?.status === 400) {
            setErr("Invalid wallet address format.");
          } else {
            setErr("Failed to fetch data: " + (e.response?.data?.message || e.message || "Unknown error"));
          }
        }
      }
      // 3. Otherwise: error
      else {
        setErr("Please enter a valid .ar.io name or Arweave wallet address.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Get history for a .ar name (with fallback)
  const fetchHistory = async (name: string) => {
    setHistory([]);
    try {
      const url = `${ARNS_API}/names/${encodeURIComponent(name)}/history`;
      const { data } = await axios.get<HistoryResponse>(url, { timeout: 10000 });
      setHistory(data?.history ?? []);
    } catch {
      setHistory([]);
    }
  };

  // Advanced filters
  const filteredNames = names.filter((n) => {
    if (
      filterResolver &&
      (!n.resolver ||
        !n.resolver.toLowerCase().includes(filterResolver.toLowerCase()))
    )
      return false;
    if (filterExpiryFrom) {
      const expiryDate = new Date(Number(n.expiry) * 1000);
      const fromDate = new Date(filterExpiryFrom);
      if (expiryDate < fromDate) return false;
    }
    if (filterExpiryTo) {
      const expiryDate = new Date(Number(n.expiry) * 1000);
      const toDate = new Date(filterExpiryTo);
      if (expiryDate > toDate) return false;
    }
    return true;
  });

  return (
    <div className="container">
      <header>
        <h1 style={{ color: "#6e8efb" }}>Visual ArNS History Explorer</h1>
        <p>
          Search for an <b>Arweave Name (.ar.io)</b> or wallet address.<br />
          Connect your wallet to autofill your address and quickly view your names.
        </p>
        <div className="wallet-section">
          {walletDetected ? (
            walletConnected && walletAddress ? (
              <div>
                <span>
                  <b>Wallet:</b> {shortenAddr(walletAddress)}{" "}
                </span>
                <button className="wallet-btn" onClick={disconnectWallet}>
                  Disconnect
                </button>
              </div>
            ) : (
              <button className="wallet-btn" onClick={connectWallet}>
                Connect ArConnect Wallet
              </button>
            )
          ) : (
            <span style={{ color: "#888" }}>
              <a
                href="https://arconnect.io/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Install ArConnect
              </a>{" "}
              to connect wallet
            </span>
          )}
        </div>
      </header>
      <main>
        <div className="search-bar-section">
          <input
            type="text"
            placeholder=".ar.io name or wallet address"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
            autoFocus
            disabled={loading}
          />
          <button onClick={handleSearch} disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
        {/* Advanced Filters */}
        <div className="filter-section">
          <input
            type="text"
            placeholder="Resolver address filter"
            value={filterResolver}
            onChange={(e) => setFilterResolver(e.target.value)}
            disabled={names.length === 0}
            style={{ width: 180 }}
          />
          <span style={{ marginLeft: 10, marginRight: 8 }}>Expiry from:</span>
          <input
            type="date"
            value={filterExpiryFrom}
            onChange={(e) => setFilterExpiryFrom(e.target.value)}
            disabled={names.length === 0}
          />
          <span style={{ marginLeft: 10, marginRight: 8 }}>to</span>
          <input
            type="date"
            value={filterExpiryTo}
            onChange={(e) => setFilterExpiryTo(e.target.value)}
            disabled={names.length === 0}
          />
          <button
            style={{ marginLeft: 12 }}
            onClick={() => {
              setFilterResolver("");
              setFilterExpiryFrom("");
              setFilterExpiryTo("");
            }}
            disabled={names.length === 0}
          >
            Clear Filters
          </button>
        </div>
        {err && <div className="error-message">{err}</div>}

        {filteredNames.length > 0 && (
          <div>
            <h2>ArNS Names</h2>
            <table className="names-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Expiry</th>
                  <th>Resolver</th>
                  <th>TxID</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredNames.map((n, idx) => {
                  const displayName = n.name
                    ? arToArIo(n.name)
                    : '';
                  const manageName = n.name
                    ? arToManageName(n.name)
                    : '';
                  return (
                    <tr key={n.name || n.txId || idx}>
                      <td>
                        <button
                          className={`link-btn${
                            selectedName === n.name ? " selected" : ""
                          }`}
                          onClick={() => {
                            setSelectedName(n.name);
                            fetchHistory(n.name);
                          }}
                        >
                          {displayName}
                        </button>
                      </td>
                      <td>{formatDate(n.expiry)}</td>
                      <td>
                        {n.resolver ? (
                          <a
                            href={`https://viewblock.io/arweave/address/${n.resolver}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {shortenAddr(n.resolver)}
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td>
                        {n.txId ? (
                          <a
                            href={`https://viewblock.io/arweave/tx/${n.txId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {shortenAddr(n.txId)}
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td>
                        {manageName && (
                          <a
                            href={`https://arns.ar.io/#/manage/names/${encodeURIComponent(manageName)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "#6e8efb", fontWeight: 500 }}
                          >
                            Manage
                          </a>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div style={{ margin: "1em 0", color: "#888" }}>
              Showing {filteredNames.length} of {names.length} total
            </div>
          </div>
        )}

        {selectedName && (
          <section style={{ marginTop: 32 }}>
            <h2>
              History for{" "}
              <span style={{ color: "#6e8efb" }}>
                {selectedName && selectedName.toLowerCase().endsWith('.ar')
                  ? selectedName.slice(0, -3) + '.ar.io'
                  : selectedName}
              </span>
            </h2>
            {history.length === 0 && (
              <div>No history found for this name.</div>
            )}
            {history.length > 0 && (
              <table className="names-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Block</th>
                    <th>When</th>
                    <th>Owner</th>
                    <th>TxID</th>
                    <th>Summary</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((ev, idx) => (
                    <tr key={ev.txid ? ev.txid + String(ev.timestamp) : idx}>
                      <td>{ev.type}</td>
                      <td>{ev.block}</td>
                      <td>
                        {ev.timestamp
                          ? new Date(ev.timestamp * 1000).toLocaleString()
                          : "-"}
                      </td>
                      <td>
                        <a
                          href={`https://viewblock.io/arweave/address/${ev.owner}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {shortenAddr(ev.owner)}
                        </a>
                      </td>
                      <td>
                        <a
                          href={`https://viewblock.io/arweave/tx/${ev.txid}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {shortenAddr(ev.txid)}
                        </a>
                      </td>
                      <td>{ev.summary || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}

        {!loading && !err && names.length === 0 && (
          <div className="info-message">
            Enter an ArNS (.ar.io) name or Arweave wallet address, then click Search.<br />
            Example: <code>permaweb.ar.io</code> or <code>9d9i9Xr3V...</code>
          </div>
        )}
      </main>
      <footer>
        <p>
          Powered by{" "}
          <a
            href="https://arns.ar.io"
            target="_blank"
            rel="noopener noreferrer"
          >
            Arweave Name Service (AR.IO)
          </a>
        </p>
      </footer>
    </div>
  );
};

export default App;