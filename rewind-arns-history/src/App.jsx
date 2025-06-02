import React, { useState } from 'react';
import axios from 'axios';
import { useWallet } from '@arweave-wallet-kit/react';

const formatDate = (timestamp) => {
  if (!timestamp) return '-';
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleDateString();
};

const shortenAddr = (addr) =>
  addr ? addr.slice(0, 6) + '...' + addr.slice(-6) : '';

const resolveArnsName = async (arName) => {
  // ARNS API to resolve .ar name to address
  try {
    const resp = await axios.get(
      `https://api.arns.app/v1/name/${encodeURIComponent(arName)}`
    );
    if (resp.data?.address) return resp.data.address;
    return null;
  } catch {
    return null;
  }
};

const App = () => {
  const { connect, connected, address, disconnect, connecting } = useWallet();
  const [input, setInput] = useState('');
  const [resolved, setResolved] = useState('');
  const [names, setNames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [filter, setFilter] = useState('');

  const fetchNames = async (searchAddress) => {
    setLoading(true);
    setErr('');
    setNames([]);
    try {
      const resp = await axios.get(
        `https://api.arns.app/v1/user/${encodeURIComponent(searchAddress)}/names`
      );
      if (resp.data?.names?.length) {
        setNames(resp.data.names);
      } else {
        setErr('No ArNS names found for this address.');
      }
    } catch (e) {
      setErr('Failed to fetch names. Invalid address or network error.');
    }
    setLoading(false);
  };

  const handleSearch = async (useWalletAddr = false) => {
    setErr('');
    setNames([]);
    setResolved('');
    let searchVal = useWalletAddr ? address : input.trim();

    if (!searchVal) {
      setErr('Please connect your wallet or enter a search input.');
      return;
    }

    // If AR.IO/ArNS name (ends with .ar), resolve it
    if (/\.ar$/i.test(searchVal)) {
      setLoading(true);
      const resolvedAddr = await resolveArnsName(searchVal);
      setLoading(false);
      if (!resolvedAddr) {
        setErr('Could not resolve .ar name to a wallet address.');
        return;
      }
      setResolved(resolvedAddr);
      searchVal = resolvedAddr;
    } else {
      setResolved('');
    }

    await fetchNames(searchVal);
  };

  const filteredNames = names.filter((n) =>
    n.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="arns-app-root">
      <header>
        <h1>ArNS Name Search (Wallet Compatible)</h1>
        <p>
          Search Arweave Name Service (ArNS) and AR.IO addresses.<br />
          Connect your wallet or enter a wallet address / <code>yourname.ar</code> below.
        </p>
        <div className="wallet-section">
          {connected ? (
            <div className="wallet-info">
              <span>
                <b>Wallet:</b> {shortenAddr(address)}{' '}
                <button className="wallet-btn" onClick={disconnect}>Disconnect</button>
              </span>
            </div>
          ) : (
            <button className="wallet-btn" onClick={connect} disabled={connecting}>
              {connecting ? "Connecting..." : "Connect Wallet"}
            </button>
          )}
        </div>
      </header>
      <main>
        <div className="search-bar-section">
          <input
            type="text"
            placeholder="Wallet address or .ar name"
            value={input}
            onChange={e => setInput(e.target.value)}
            autoFocus
            onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
            disabled={loading}
          />
          <button onClick={() => handleSearch(false)} disabled={loading || !input}>
            {loading ? 'Searching…' : 'Search'}
          </button>
          <button
            onClick={() => handleSearch(true)}
            disabled={loading || !connected}
            style={{ marginLeft: '0.5em' }}
            title={connected ? "Use connected wallet address" : "Connect wallet first"}
          >
            Search My Wallet
          </button>
        </div>
        {resolved && (
          <div className="info-message">
            <b>Resolved address:</b> <code>{resolved}</code>
          </div>
        )}
        {names.length > 0 && (
          <div className="filter-section">
            <input
              type="text"
              placeholder="Filter names…"
              value={filter}
              onChange={e => setFilter(e.target.value)}
              disabled={loading}
            />
            <span>{filteredNames.length} found</span>
          </div>
        )}
        {err && <div className="error-message">{err}</div>}

        {filteredNames.length > 0 && (
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
              {filteredNames.map((n) => (
                <tr key={n.name}>
                  <td>
                    <b>{n.name}</b>
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
                      '-'
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
                      '-'
                    )}
                  </td>
                  <td>
                    <a
                      href={`https://arns.ar.io/#/names/${n.name}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="action-link"
                    >
                      View
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!loading && !err && names.length === 0 && (
          <div className="info-message">
            Enter your Arweave wallet address, .ar name, or connect your wallet to view your ArNS names.
          </div>
        )}
      </main>
      <footer>
        <p>
          Powered by <a href="https://arns.ar.io" target="_blank" rel="noopener noreferrer">Arweave Name Service</a>
        </p>
      </footer>
    </div>
  );
};

export default App;