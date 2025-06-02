import React, { useState, useEffect } from "react";
import axios from "axios";
import "./app.css";

// Gateway base URL (from https://docs.ar.io/arns)
const ARNS_GATEWAY = "https://ar-io.dev/arns";

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

function formatDate(expiry: string) {
  if (!expiry) return "-";
  const d = new Date(Number(expiry) * 1000);
  return d.toLocaleDateString();
}
function shortenAddr(addr: string) {
  if (!addr) return "-";
  return addr.length > 12 ? addr.slice(0, 6) + "..." + addr.slice(-4) : addr;
}

const App: React.FC = () => {
  // Wallet state
  const [walletDetected, setWalletDetected] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // Search/filter state
  const [input, setInput] = useState(""); // Raw input
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
      setWalletAddress(address ?? null); // FIX: ensure type matches string | null
      setInput(address ?? "");           // FIX: ensure type matches string
    } catch (e: any) {
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

  // Search ArNS names (GATEWAY-based)
  const handleSearch = async () => {
    setErr(null);
    setNames([]);
    setHistory([]);
    setSelectedName(null);
    if (!input.trim()) {
      setErr("Enter a .ar name or owner address");
      return;
    }
    setLoading(true);
    try {
      let response;
      // .ar name
      if (input.endsWith(".ar")) {
        response = await axios.get(`${ARNS_GATEWAY}/names/${input.toLowerCase()}`);
        if (response.data?.name) {
          setNames([{
            name: response.data.name,
            expiry: response.data.expiry,
            resolver: response.data.resolver,
            txId: response.data.txId,
          }]);
          setSelectedName(response.data.name);
          await fetchHistory(response.data.name);
        } else {
          setErr("No record found for that name.");
        }
      } else {
        // Owner address (returns all names for that owner)
        response = await axios.get(`${ARNS_GATEWAY}/names?owner=${input}`);
        if (response.data?.names?.length > 0) {
          const nList: NameInfo[] = response.data.names.map((n: any) => ({
            name: n.name,
            expiry: n.expiry,
            resolver: n.resolver,
            txId: n.txId,
          }));
          setNames(nList);
        } else {
          setErr("No ArNS names found for this address.");
        }
      }
    } catch (e: any) {
      setErr("Failed to fetch data: " + (e.response?.data?.message || e.message));
    } finally {
      setLoading(false);
    }
  };

  // Get history for a .ar name
  const fetchHistory = async (name: string) => {
    setHistory([]);
    try {
      const resp = await axios.get(`${ARNS_GATEWAY}/names/${name}/history`);
      setHistory(resp.data?.history ?? []);
    } catch {
      setHistory([]);
    }
  };

  // Advanced filters
  const filteredNames = names.filter(n => {
    if (filterResolver && (!n.resolver || !n.resolver.toLowerCase().includes(filterResolver.toLowerCase()))) return false;
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
        <h1>Visual ArNS History Explorer</h1>
        <p>
          Search for an <b>Arweave Name (.ar)</b> or owner address.<br />
          Connect your wallet to autofill your address and quickly view your names.
        </p>
        <div className="wallet-section">
          {walletDetected ? (
            walletConnected && walletAddress ? (
              <div>
                <span><b>Wallet:</b> {shortenAddr(walletAddress)} </span>
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
              <a href="https://arconnect.io/" target="_blank" rel="noopener noreferrer">
                Install ArConnect
              </a> to connect wallet
            </span>
          )}
        </div>
      </header>
      <main>
        <div className="search-bar-section">
          <input
            type="text"
            placeholder=".ar name or owner address"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleSearch(); }}
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
            onChange={e => setFilterResolver(e.target.value)}
            disabled={names.length === 0}
            style={{ width: 180 }}
          />
          <span style={{ marginLeft: 10, marginRight: 8 }}>Expiry from:</span>
          <input
            type="date"
            value={filterExpiryFrom}
            onChange={e => setFilterExpiryFrom(e.target.value)}
            disabled={names.length === 0}
          />
          <span style={{ marginLeft: 10, marginRight: 8 }}>to</span>
          <input
            type="date"
            value={filterExpiryTo}
            onChange={e => setFilterExpiryTo(e.target.value)}
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
                {filteredNames.map(n => (
                  <tr key={n.name}>
                    <td>
                      <button
                        className={`link-btn${selectedName === n.name ? " selected" : ""}`}
                        onClick={() => { setSelectedName(n.name); fetchHistory(n.name); }}
                      >
                        {n.name}
                      </button>
                    </td>
                    <td>{formatDate(n.expiry)}</td>
                    <td>
                      {n.resolver ?
                        <a href={`https://viewblock.io/arweave/address/${n.resolver}`} target="_blank" rel="noopener noreferrer">{shortenAddr(n.resolver)}</a>
                        : "-"}
                    </td>
                    <td>
                      {n.txId ?
                        <a href={`https://viewblock.io/arweave/tx/${n.txId}`} target="_blank" rel="noopener noreferrer">{shortenAddr(n.txId)}</a>
                        : "-"}
                    </td>
                    <td>
                      <a href={`https://arns.ar.io/#/names/${n.name}`} target="_blank" rel="noopener noreferrer">View</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ margin: "1em 0", color: "#888" }}>
              Showing {filteredNames.length} of {names.length} total
            </div>
          </div>
        )}

        {selectedName && (
          <section style={{ marginTop: 32 }}>
            <h2>History for <span style={{ color: "#6e8efb" }}>{selectedName}</span></h2>
            {history.length === 0 && <div>No history found for this name.</div>}
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
                  {history.map(ev => (
                    <tr key={ev.txid + ev.timestamp}>
                      <td>{ev.type}</td>
                      <td>{ev.block}</td>
                      <td>{ev.timestamp ? new Date(ev.timestamp * 1000).toLocaleString() : "-"}</td>
                      <td>
                        <a href={`https://viewblock.io/arweave/address/${ev.owner}`} target="_blank" rel="noopener noreferrer">
                          {shortenAddr(ev.owner)}
                        </a>
                      </td>
                      <td>
                        <a href={`https://viewblock.io/arweave/tx/${ev.txid}`} target="_blank" rel="noopener noreferrer">
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
            Enter an ArNS (.ar) name or Arweave wallet address, then click Search.<br />
            Example: <code>ardrive.ar</code> or <code>9d9i9Xr3V...</code>
          </div>
        )}
      </main>
      <footer>
        <p>
          Powered by <a href="https://arns.ar.io" target="_blank" rel="noopener noreferrer">Arweave Name Service (AR.IO)</a>
        </p>
      </footer>
    </div>
  );
};

export default App;