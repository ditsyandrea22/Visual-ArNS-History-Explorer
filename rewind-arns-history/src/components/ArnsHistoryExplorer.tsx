import React, { useEffect, useState } from "react";
import Arweave from "arweave";
import { ArweaveWebWallet } from "arweave-wallet-connector";

// --- Styles for confetti animation ---
const confettiCSS = `
@keyframes confetti-fall {
  0% {transform: translateY(-100vh) scale(1);}
  100% {transform: translateY(100vh) scale(1);}
}
.confetti {
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  pointer-events: none;
  z-index: 100;
  height: 0;
}
.confetti-piece {
  position: absolute;
  width: 12px;
  height: 12px;
  border-radius: 2px;
  opacity: 0.8;
  animation: confetti-fall 2.5s linear forwards;
}
`;

const API = "https://ans-api.ar.io/graphql";

const arweave = Arweave.init({
  host: "arweave.net",
  port: 443,
  protocol: "https",
});

function shorten(str: string, n = 6) {
  if (!str) return "";
  return str.length <= 2 * n ? str : `${str.slice(0, n)}...${str.slice(-n)}`;
}

function copyToClipboard(text: string, cb: () => void) {
  navigator.clipboard.writeText(text);
  cb();
}

async function fetchAnsProfile(name: string) {
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
        query GetProfile($name: String!) {
          ansProfile(name: $name) {
            name
            address
            owner
            avatar
            records { key value }
            history { txID type timestamp owner address }
          }
        }
      `,
      variables: { name: name?.toLowerCase() },
    }),
  });
  const { data } = await res.json();
  return data?.ansProfile;
}

const demoNames = [
  "iamscott.arns",
  "ar.io.arns",
  "sam.arns",
  "arweave.arns",
  "mirror.arns",
  "permaweb.arns"
];

function getRandomPastel() {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 70%, 80%)`;
}

type ConfettiPiece = {
  left: number;
  delay: number;
  color: string;
  rotate: number;
};

function Confetti({ trigger }: { trigger: number }) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  useEffect(() => {
    if (!trigger) return;
    const arr: ConfettiPiece[] = [];
    for (let i = 0; i < 50; i++) {
      arr.push({
        left: Math.random() * 100,
        delay: Math.random() * 1.5,
        color: getRandomPastel(),
        rotate: Math.random() * 360,
      });
    }
    setPieces(arr);
    const timeout = setTimeout(() => setPieces([]), 2500);
    return () => clearTimeout(timeout);
  }, [trigger]);
  return (
    <>
      <style>{confettiCSS}</style>
      <div className="confetti">
        {pieces.map((p, i) =>
          <div
            key={i}
            className="confetti-piece"
            style={{
              left: `${p.left}vw`,
              background: p.color,
              animationDelay: `${p.delay}s`,
              transform: `rotate(${p.rotate}deg)`,
            }}
          />
        )}
      </div>
    </>
  );
}

export const ArnsHistoryExplorer: React.FC = () => {
  const [wallet, setWallet] = useState<any>(null);
  const [address, setAddress] = useState<string>("");
  const [balance, setBalance] = useState<string>("");
  const [connecting, setConnecting] = useState(false);

  const [query, setQuery] = useState(demoNames[0]);
  const [search, setSearch] = useState(demoNames[0]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string>("");
  const [profile, setProfile] = useState<any | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [error, setError] = useState<string>("");
  const [confetti, setConfetti] = useState<number>(0);

  const handleConnect = async () => {
    setConnecting(true);
    const w = new ArweaveWebWallet({
      name: "Rewind ArNS Explorer",
      logo: "https://arweave.net/h12nGl0qQF8vK4a8uQ08t3Nw3y5zvO4yC2rZzHzKewA",
    });
    w.setUrl("arweave.app");
    w.on("connect", async (addr: string) => {
      setAddress(addr);
      setWallet(w);
      const raw = await arweave.wallets.getBalance(addr);
      setBalance(arweave.ar.winstonToAr(raw));
      setConnecting(false);
      setConfetti(Date.now());
    });
    w.on("disconnect", () => {
      setAddress("");
      setBalance("");
      setWallet(null);
    });
    await w.connect();
  };

  const handleDisconnect = () => {
    wallet?.disconnect();
    setWallet(null);
    setAddress("");
    setBalance("");
  };

  useEffect(() => {
    if (!address) return;
    arweave.wallets.getBalance(address).then(raw =>
      setBalance(arweave.ar.winstonToAr(raw))
    );
  }, [address]);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError("");
    setProfile(null);
    setHistory([]);
    fetchAnsProfile(search)
      .then((ans) => {
        if (ignore) return;
        if (!ans) {
          setError("No ArNS data found for this name.");
          setProfile(null);
          setHistory([]);
        } else {
          setProfile(ans);
          setHistory(
            ans.history?.slice().sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0)) ||
            []
          );
        }
        setLoading(false);
        setConfetti(Date.now());
      })
      .catch(() => {
        if (!ignore) {
          setError("Could not fetch from ArNS API. Service may be down.");
          setProfile(null);
          setHistory([]);
          setLoading(false);
        }
      });
    return () => { ignore = true; };
  }, [search]);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(""), 1300);
    return () => clearTimeout(t);
  }, [copied]);

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-[#201940] via-[#1e293b] to-[#0f172a]">
      <Confetti trigger={confetti} />

      {/* HEADER with wallet connect */}
      <header className="flex flex-col md:flex-row items-center justify-between px-6 py-6 bg-gradient-to-r from-[#0ea5e9] via-[#a21caf] to-[#f472b6] border-b border-[#23283A] shadow-xl">
        <div className="flex items-center gap-3">
          <svg width={44} height={44} viewBox="0 0 44 44">
            <circle cx="22" cy="22" r="22" fill="#D946EF" />
            <text x="22" y="30" textAnchor="middle" fontWeight="bold" fontSize="22" fill="#fff">
              R
            </text>
          </svg>
          <span className="text-3xl font-black tracking-tight bg-gradient-to-r from-[#a21caf] via-[#f472b6] to-[#0ea5e9] bg-clip-text text-transparent">
            Rewind <span className="drop-shadow-md">ArNS Explorer</span>
          </span>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-center mt-4 md:mt-0">
          {address ? (
            <div className="flex items-center gap-2 bg-[#18181b] px-4 py-2 rounded-xl shadow">
              <span className="font-mono text-emerald-400 text-base" title={address}>
                {shorten(address, 7)}
              </span>
              <span className="text-sm text-amber-400 font-bold">{Number(balance).toFixed(4)} AR</span>
              <button
                className="ml-2 rounded-lg px-3 py-1 text-white bg-gradient-to-r from-fuchsia-600 to-pink-500 hover:from-fuchsia-700 hover:to-pink-600 font-bold shadow transition"
                onClick={handleDisconnect}
              >Disconnect</button>
            </div>
          ) : (
            <button
              className="rounded-lg px-5 py-2 text-white bg-gradient-to-r from-pink-600 via-fuchsia-600 to-cyan-500 hover:from-pink-700 hover:to-cyan-600 font-bold shadow-lg transition"
              onClick={handleConnect}
              disabled={connecting}
            >
              {connecting ? "Connecting..." : "Connect Wallet"}
            </button>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto mt-10 px-2 sm:px-4 pb-10">
        {/* CARD */}
        <section className="bg-[#23283A]/90 rounded-3xl p-8 flex flex-col items-center shadow-2xl border border-[#2E3445] mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-fuchsia-500 via-cyan-400 to-pink-500 blur-sm opacity-60" />
          <img
            src={
              profile?.avatar
                ? profile.avatar
                : `https://avatars.dicebear.com/api/identicon/${search}.svg`
            }
            alt={`${search} avatar`}
            className="w-24 h-24 rounded-full border-4 border-fuchsia-400 mb-5 bg-[#171923] shadow-lg"
            onError={e => (e.currentTarget.src = "https://avatars.dicebear.com/api/identicon/404.svg")}
          />
          <h1 className="text-3xl font-extrabold mb-2 bg-gradient-to-r from-pink-400 via-fuchsia-300 to-cyan-400 bg-clip-text text-transparent">
            {search}
          </h1>
          <p className="text-lg text-amber-300 mb-2 font-bold tracking-widest drop-shadow">Arweave Name Service</p>
          <p className="text-gray-200 text-center font-medium">
            Explore the full, immutable, visual history of any ArNS name powered by Arweave.
          </p>
        </section>

        {/* SEARCH */}
        <form
          className="w-full max-w-md mx-auto mb-6"
          onSubmit={e => { e.preventDefault(); setSearch(query.trim() || demoNames[0]); }}
        >
          <div className="flex rounded-xl shadow-lg overflow-hidden border border-fuchsia-500 bg-[#171923]/50 focus-within:ring-2 ring-fuchsia-400 transition">
            <input
              className="flex-1 py-3 px-4 bg-transparent text-white placeholder-gray-400 border-0 focus:outline-none text-lg"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={`Search ArNS name (e.g. ${demoNames[0]})`}
              spellCheck={false}
            />
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-pink-600 via-fuchsia-600 to-cyan-500 text-white text-lg font-bold hover:from-pink-700 hover:to-cyan-600 transition"
              aria-label="Search"
            >
              🔍
            </button>
          </div>
        </form>

        {/* ERROR */}
        {error && (
          <div className="bg-pink-900/80 text-pink-100 rounded-xl px-6 py-4 mb-6 text-center shadow">
            <span className="font-bold">{error}</span>
            <div className="mt-2 text-fuchsia-300 text-base">
              Try:{' '}
              {demoNames.map(name =>
                <button
                  key={name}
                  onClick={() => { setQuery(name); setSearch(name); }}
                  className="underline hover:text-blue-300 mx-1 font-mono text-base"
                >{name}</button>
              )}
            </div>
          </div>
        )}

        {/* TIMELINE */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-5 text-center bg-gradient-to-r from-fuchsia-400 to-cyan-400 text-transparent bg-clip-text">
            <span className="drop-shadow">History Timeline</span>
          </h2>
          {loading ? (
            <div className="text-center text-fuchsia-200 font-bold text-xl animate-pulse">Loading events…</div>
          ) : !history.length ? (
            <div className="text-center text-gray-500 italic">
              No history found for this name.
            </div>
          ) : (
            <div className="flex flex-col md:flex-row md:items-start gap-10">
              {/* Timeline dots */}
              <div className="flex flex-col items-center relative">
                {history.map((item, idx) => (
                  <React.Fragment key={item.txID}>
                    <div
                      className="w-8 h-8 rounded-full border-4 border-pink-400 bg-gradient-to-br from-fuchsia-600 to-pink-400 flex items-center justify-center relative cursor-pointer shadow-lg"
                      title={item.txID}
                    >
                      <span className="text-base text-fuchsia-100 font-bold drop-shadow">{history.length - idx}</span>
                    </div>
                    {idx < history.length - 1 &&
                      <div className="w-1 h-20 bg-gradient-to-b from-fuchsia-400 to-cyan-400 mx-auto" />}
                  </React.Fragment>
                ))}
              </div>
              {/* Timeline entries */}
              <div className="flex-1">
                {history.map((item, idx) => (
                  <div
                    key={item.txID}
                    className="mb-8 pb-6 border-b border-[#2E3445] last:border-none last:mb-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-fuchsia-300 font-bold text-lg">
                        {item.timestamp
                          ? new Date(item.timestamp * 1000).toLocaleDateString()
                          : ""}
                      </span>
                      <span className="text-sm text-gray-400 uppercase font-bold tracking-wide">{item.type}</span>
                      <span
                        className="ml-3 cursor-pointer underline font-mono text-blue-200"
                        onClick={() => copyToClipboard(item.txID, () => setCopied(item.txID))}
                        title="Copy TxID"
                      >
                        {shorten(item.txID, 8)}
                      </span>
                      {copied === item.txID && (
                        <span className="inline-flex items-center px-2 py-1 rounded bg-emerald-500 text-xs text-white ml-2 animate-bounce shadow">
                          Copied!
                        </span>
                      )}
                    </div>
                    <div className="text-gray-300 mt-1 flex items-center gap-2 flex-wrap text-base">
                      <span>Owner:</span>
                      <span
                        className="underline cursor-pointer font-mono text-blue-300"
                        onClick={() => copyToClipboard(item.owner, () => setCopied(item.owner))}
                        title="Copy owner"
                      >
                        {shorten(item.owner, 8)}
                      </span>
                      {copied === item.owner && (
                        <span className="inline-flex items-center px-2 py-1 rounded bg-emerald-500 text-xs text-white ml-2 animate-bounce shadow">
                          Copied!
                        </span>
                      )}
                      <span className="ml-4">Tx:</span>
                      <a
                        href={`https://viewblock.io/arweave/tx/${item.txID}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-fuchsia-200 font-mono"
                      >
                        {shorten(item.txID, 8)}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* RECORDS */}
        <section className="mt-10">
          <h2 className="text-2xl font-bold mb-5 text-center bg-gradient-to-r from-amber-300 via-fuchsia-400 to-cyan-400 text-transparent bg-clip-text">
            <span className="drop-shadow">Records & Metadata</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {profile?.records && profile.records.length > 0 ? (
              profile.records.map((rec: any) => (
                <div
                  key={rec.key}
                  className="bg-gradient-to-br from-fuchsia-900/70 via-[#23283A] to-pink-900/60 rounded-2xl p-6 border border-fuchsia-700 flex flex-col shadow-lg hover:scale-105 transition-transform"
                >
                  <div className="text-gray-400 text-xs mb-1 font-bold uppercase tracking-wide">{rec.key}</div>
                  <div className="text-white font-mono break-all flex items-center text-lg">
                    {rec.value}
                    <button
                      className="inline-flex items-center px-2 py-1 rounded bg-fuchsia-600 text-xs text-white ml-2 hover:bg-fuchsia-500 transition"
                      onClick={() => copyToClipboard(rec.value, () => setCopied(rec.key))}
                    >
                      {copied === rec.key ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-500 italic col-span-2 text-center py-6 text-lg">
                No records found for this name.
              </div>
            )}
          </div>
        </section>
      </main>
      <footer className="text-center mt-16 mb-8 text-gray-300 text-base opacity-80">
        &copy; {new Date().getFullYear()} <span className="font-bold text-fuchsia-400">Rewind</span> — Visual ArNS History Explorer
      </footer>
    </div>
  );
};