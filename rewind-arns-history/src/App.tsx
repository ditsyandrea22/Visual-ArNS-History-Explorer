import React, { useEffect, useState } from "react";

const API = "https://ans-api.ar.io/graphql";

// Shorten long strings for display
function shorten(str: string, n = 8) {
  if (!str) return "";
  return str.length <= 2 * n ? str : `${str.slice(0, n)}...${str.slice(-n)}`;
}

// Copy to clipboard helper
function copyToClipboard(text: string, cb: () => void) {
  navigator.clipboard.writeText(text);
  cb();
}

// Fetch ArNS profile and history from ar.io public API
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
            records {
              key
              value
            }
            history {
              txID
              type
              timestamp
              owner
              address
            }
          }
        }
      `,
      variables: { name: name?.toLowerCase() },
    }),
  });
  const { data } = await res.json();
  return data?.ansProfile;
}

export default function App() {
  const [query, setQuery] = useState("alice.arns");
  const [search, setSearch] = useState("alice.arns");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string>("");

  // Profile and history
  const [profile, setProfile] = useState<any | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [error, setError] = useState<string>("");

  // Fetch on search
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
          setHistory(ans.history?.slice().sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0)) || []);
        }
        setLoading(false);
      })
      .catch(() => {
        if (!ignore) {
          setError("Could not fetch from ArNS API. Service may be down.");
          setProfile(null);
          setHistory([]);
          setLoading(false);
        }
      });
    return () => {
      ignore = true;
    };
  }, [search]);

  return (
    <div>
      {/* HEADER */}
      <header className="flex flex-col md:flex-row items-center justify-between px-6 py-4 bg-[#171923] border-b border-[#23283A]">
        <div className="flex items-center gap-3">
          <svg width={32} height={32} viewBox="0 0 32 32">
            <circle cx="16" cy="16" r="16" fill="#D946EF" />
            <text x="16" y="22" textAnchor="middle" fontWeight="bold" fontSize="16" fill="#fff">
              R
            </text>
          </svg>
          <span className="text-2xl font-extrabold tracking-tight text-white">
            Rewind <span className="text-fuchsia-400">ArNS Explorer</span>
          </span>
        </div>
        <form
          className="mt-4 md:mt-0 w-full max-w-xs"
          onSubmit={e => {
            e.preventDefault();
            setSearch(query.trim() || "alice.arns");
          }}
        >
          <input
            className="w-full py-2 px-4 rounded-lg bg-[#23283A] text-white placeholder-gray-400 border border-[#2E3445] focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search ArNS name (e.g. alice.arns)"
            spellCheck={false}
            autoFocus
          />
        </form>
      </header>

      <main className="max-w-4xl mx-auto mt-10 px-4">
        {/* CARD */}
        <section className="bg-[#23283A] rounded-2xl p-6 flex flex-col items-center shadow-lg border border-[#2E3445] mb-8">
          <img
            src={
              profile?.avatar
                ? profile.avatar
                : `https://avatars.dicebear.com/api/identicon/${search}.svg`
            }
            alt={`${search} avatar`}
            className="w-20 h-20 rounded-full border-4 border-fuchsia-400 mb-4 bg-[#171923]"
            onError={e => (e.currentTarget.src = "https://avatars.dicebear.com/api/identicon/404.svg")}
          />
          <h1 className="text-2xl font-bold mb-1">{search}</h1>
          <p className="text-fuchsia-400 mb-2">Arweave Name Service</p>
          <p className="text-gray-300 text-center">
            Explore the full, immutable, visual history of any ArNS name powered by Arweave.
          </p>
        </section>

        {/* ERROR */}
        {error && (
          <div className="bg-red-900 text-red-100 rounded-lg px-6 py-3 mb-8 text-center">{error}</div>
        )}

        {/* TIMELINE */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-4 text-fuchsia-300">
            History Timeline
          </h2>
          {loading ? (
            <div className="text-center text-fuchsia-200">Loading events…</div>
          ) : !history.length ? (
            <div className="text-center text-gray-500 italic">
              No history found for this name.
            </div>
          ) : (
            <div className="flex flex-col md:flex-row md:items-start gap-8">
              {/* Timeline dots */}
              <div className="flex flex-col items-center relative">
                {history.map((item, idx) => (
                  <React.Fragment key={item.txID}>
                    <div
                      className="w-6 h-6 rounded-full border-4 border-fuchsia-400 bg-[#23283A] flex items-center justify-center relative cursor-pointer"
                      title={item.txID}
                    >
                      <span className="text-xs text-fuchsia-300">{history.length - idx}</span>
                    </div>
                    {idx < history.length - 1 && <div className="w-1 h-16 bg-fuchsia-400 mx-auto" />}
                  </React.Fragment>
                ))}
              </div>
              {/* Timeline entries */}
              <div className="flex-1">
                {history.map((item, idx) => (
                  <div
                    key={item.txID}
                    className="mb-6 pb-6 border-b border-[#2E3445] last:border-none last:mb-0 last:pb-0"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-fuchsia-300 font-semibold">
                        {item.timestamp
                          ? new Date(item.timestamp * 1000).toISOString().slice(0, 10)
                          : ""}
                      </span>
                      <span className="text-sm text-gray-400">{item.type}</span>
                      <span
                        className="ml-3 cursor-pointer underline"
                        onClick={() => copyToClipboard(item.txID, () => setCopied(item.txID))}
                        title="Copy TxID"
                      >
                        {shorten(item.txID)}
                      </span>
                      {copied === item.txID && (
                        <span className="inline-flex items-center px-2 py-1 rounded bg-fuchsia-600 text-xs text-white ml-2">
                          Copied!
                        </span>
                      )}
                    </div>
                    <div className="text-gray-300 mt-1 flex items-center gap-2">
                      <span>Owner:</span>
                      <span
                        className="underline cursor-pointer"
                        onClick={() => copyToClipboard(item.owner, () => setCopied(item.owner))}
                        title="Copy owner"
                      >
                        {shorten(item.owner)}
                      </span>
                      {copied === item.owner && (
                        <span className="inline-flex items-center px-2 py-1 rounded bg-fuchsia-600 text-xs text-white ml-2">
                          Copied!
                        </span>
                      )}
                      <span className="ml-4">Tx:</span>
                      <a
                        href={`https://viewblock.io/arweave/tx/${item.txID}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-fuchsia-200"
                      >
                        {shorten(item.txID)}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* RECORDS */}
        <section>
          <h2 className="text-lg font-semibold mb-4 text-fuchsia-300">
            Records & Metadata
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {profile?.records && profile.records.length > 0 ? (
              profile.records.map((rec: any) => (
                <div
                  key={rec.key}
                  className="bg-[#23283A] rounded-xl p-4 border border-[#2E3445] flex flex-col"
                >
                  <div className="text-gray-400 text-xs mb-1">{rec.key}</div>
                  <div className="text-white font-mono break-all flex items-center">
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
              <div className="text-gray-500 italic">
                No records found for this name.
              </div>
            )}
          </div>
        </section>
      </main>
      <footer className="text-center mt-16 mb-8 text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} Rewind — Visual ArNS History Explorer
      </footer>
    </div>
  );
}