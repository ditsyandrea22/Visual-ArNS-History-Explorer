import React, { useState, useEffect } from "react";
import axios from "axios";
import "./app.css";

// Use the arns.ar.io API for .ar.io names only!
const ARNS_API = "https://arns.ar.io/api/proxy/arns";

interface NameInfo {
  name: string;
  expiry: string | number | null | undefined;
  resolver: string | null | undefined;
  txId: string | null | undefined;
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

function formatDate(expiry: string | number | null | undefined) {
  if (!expiry || isNaN(Number(expiry))) return "-";
  const d = new Date(Number(expiry) * 1000);
  if (d.getFullYear() < 1975) return "-";
  return d.toLocaleDateString();
}
function shortenAddr(addr: string | null | undefined) {
  if (!addr) return "-";
  return addr.length > 12 ? addr.slice(0, 6) + "..." + addr.slice(-4) : addr;
}
function isArIoName(val: string) {
  return val.trim().toLowerCase().endsWith(".ar.io");
}
function arIoToAr(val: string) {
  return val.trim().toLowerCase().replace(/\.ar\.io$/, ".ar");
}
function arIoToManageName(val: string) {
  return val.trim().toLowerCase().replace(/\.ar\.io$/, "");
}
function arToArIo(val: string) {
  return val.trim().toLowerCase().endsWith(".ar")
    ? val.trim().slice(0, -3) + ".ar.io"
    : val.trim();
}
function arToManageName(val: string) {
  return val.trim().toLowerCase().endsWith(".ar")
    ? val.trim().slice(0, -3)
    : val.trim();
}
function isArweaveAddress(val: string) {
  return /^[a-z0-9_-]{43,}$/i.test(val.trim());
}

const Spinner: React.FC<{ darkMode: boolean }> = ({ darkMode }) => (
  <span className={`spinner${darkMode ? " dark" : ""}`} aria-label="Loading" />
);

const App: React.FC = () => {
  const [walletDetected, setWalletDetected] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const [input, setInput] = useState("");
  const [filterResolver, setFilterResolver] = useState("");
  const [filterExpiryFrom, setFilterExpiryFrom] = useState("");
  const [filterExpiryTo, setFilterExpiryTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [names, setNames] = useState<NameInfo[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEvent[]>([]);
  const [selectedName, setSelectedName] = useState<string | null>(null);

  // Dark mode
  const [darkMode, setDarkMode] = useState(
    () =>
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  useEffect(() => {
    const listener = (e: MediaQueryListEvent) => setDarkMode(e.matches);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // Wallet detection
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

  const disconnectWallet = () => {
    setWalletConnected(false);
    setWalletAddress(null);
    setInput("");
  };

  useEffect(() => {
    if (walletConnected && walletAddress) {
      setInput(walletAddress);
    }
  }, [walletConnected, walletAddress]);

  // Interactive effect: focus search input after Connect/Disconnect
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!walletConnected) searchInputRef.current?.focus();
  }, [walletConnected]);

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
      if (isArIoName(query)) {
        try {
          const arName = arIoToAr(query);
          const url = `${ARNS_API}/names/${encodeURIComponent(arName)}`;
          const { data } = await axios.get<NameInfo>(url, { timeout: 10000 });
          setNames([
            {
              name: data.name ?? "",
              expiry: data.expiry ?? "",
              resolver: data.resolver ?? "",
              txId: data.txId ?? "",
            },
          ]);
          setSelectedName(data.name ?? "");
          await fetchHistory(data.name ?? "");
        } catch (e: any) {
          if (e.response?.status === 404) {
            setErr(
              `No ArNS record found for "${query}". Try searching for the wallet address that owns it.`
            );
          } else if (e.response?.status === 400) {
            setErr("Invalid .ar.io name format.");
          } else {
            setErr(
              "Failed to fetch data: " +
                (e.response?.data?.message || e.message || "Unknown error")
            );
          }
        }
      } else if (isArweaveAddress(query)) {
        try {
          const url = `${ARNS_API}/names?owner=${encodeURIComponent(query)}`;
          const { data } = await axios.get<OwnerResponse>(url, { timeout: 10000 });
          if (data.names && data.names.length > 0) {
            setNames(
              data.names.map((n) => ({
                name: n.name ?? "",
                expiry: n.expiry ?? "",
                resolver: n.resolver ?? "",
                txId: n.txId ?? "",
              }))
            );
          } else {
            setErr("No ArNS (.ar.io) names found for this wallet address.");
          }
        } catch (e: any) {
          if (e.response?.status === 404) {
            setErr("No ArNS (.ar.io) names found for this wallet address.");
          } else if (e.response?.status === 400) {
            setErr("Invalid wallet address format.");
          } else {
            setErr(
              "Failed to fetch data: " +
                (e.response?.data?.message || e.message || "Unknown error")
            );
          }
        }
      } else {
        setErr("Please enter a valid .ar.io name or Arweave wallet address.");
      }
    } finally {
      setLoading(false);
    }
  };

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

  // --- DEBUG: log raw names for troubleshooting ---
  useEffect(() => {
    if (names.length) {
      // eslint-disable-next-line no-console
      console.log("NAMES RAW DATA:", names);
    }
  }, [names]);

  const filteredNames = names.filter((n) => {
    // Defensive: Ensure resolver is string
    const resolver = (n.resolver ?? "").toString().toLowerCase();
    if (
      filterResolver &&
      (!resolver || !resolver.includes(filterResolver.toLowerCase()))
    )
      return false;

    // Defensive: Ensure expiry is a valid number
    let expiryNum = Number(n.expiry);
    if (isNaN(expiryNum) || !n.expiry) expiryNum = 0;

    if (filterExpiryFrom) {
      const expiryDate = new Date(expiryNum * 1000);
      const fromDate = new Date(filterExpiryFrom);
      if (expiryDate < fromDate) return false;
    }
    if (filterExpiryTo) {
      const expiryDate = new Date(expiryNum * 1000);
      const toDate = new Date(filterExpiryTo);
      if (expiryDate > toDate) return false;
    }
    return true;
  });

  return (
    <div className={`container${darkMode ? " dark" : ""}`}>
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
        <div style={{ position: "absolute", top: 18, right: 22 }}>
          <button
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            aria-label="Toggle dark mode"
            className="dark-toggle"
            onClick={() => setDarkMode((d) => !d)}
          >
            {darkMode ? "🌙" : "☀️"}
          </button>
        </div>
      </header>
      <main>
        <div className="search-bar-section">
          <input
            ref={searchInputRef}
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
            {loading ? <Spinner darkMode={darkMode} /> : "Search"}
          </button>
        </div>
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
                  const displayName = n.name ? arToArIo(n.name) : "";
                  const manageName = n.name ? arToManageName(n.name) : "";
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
                            href={`https://arns.ar.io/#/manage/names/${encodeURIComponent(
                              manageName
                            )}`}
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
            <div style={{ margin: "1em 0", color: darkMode ? "#eee" : "#888" }}>
              Showing {filteredNames.length} of {names.length} total
            </div>
          </div>
        )}

        {selectedName && (
          <section style={{ marginTop: 32 }}>
            <h2>
              History for{" "}
              <span style={{ color: "#6e8efb" }}>
                {selectedName && selectedName.toLowerCase().endsWith(".ar")
                  ? selectedName.slice(0, -3) + ".ar.io"
                  : selectedName}
              </span>
            </h2>
            {history.length === 0 && (
              <div className="info-message">No history found for this name.</div>
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