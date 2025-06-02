import React, { useState, useEffect } from "react";

const API = "https://ans-api.ar.io/graphql";

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

function shorten(str: string, n=8) {
  if (!str) return "";
  return str.length <= 2 * n ? str : `${str.slice(0, n)}...${str.slice(-n)}`;
}

const demoNames = [
  "iamscott.arns",
  "arweave.arns",
  "ar.io.arns",
  "sam.arns",
  "mirror.arns",
  "permaweb.arns"
];

function getStats(history: any[]) {
  if (!history?.length) return null;
  const sorted = history.slice().sort((a: any, b: any) => (a.timestamp || 0) - (b.timestamp || 0));
  const created = sorted[0]?.timestamp ? new Date(sorted[0].timestamp * 1000) : null;
  const updated = sorted[sorted.length-1]?.timestamp ? new Date(sorted[sorted.length-1].timestamp * 1000) : null;
  return {
    created,
    updated,
    updates: history.length
  };
}

export const ArnsExplorerFull: React.FC = () => {
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [copied, setCopied] = useState<string>("");

  useEffect(() => {
    if (!search) return;
    setLoading(true);
    setProfile(null);
    setError("");
    fetchAnsProfile(search)
      .then(ans => {
        if (!ans) {
          setProfile(null);
          setError("No results found for this name.");
        } else {
          setProfile(ans);
          setError("");
        }
        setLoading(false);
      })
      .catch(() => {
        setProfile(null);
        setError("Error fetching ArNS profile.");
        setLoading(false);
      });
  }, [search]);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(""), 1400);
    return () => clearTimeout(t);
  }, [copied]);

  const stats = profile?.history ? getStats(profile.history) : null;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="w-full py-6 bg-gradient-to-r from-fuchsia-500 via-blue-400 to-cyan-400 shadow">
        <h1 className="text-3xl md:text-4xl font-extrabold text-center text-white tracking-tight drop-shadow">
          Arweave Name Service Explorer
        </h1>
        <p className="text-center text-white opacity-90 mt-2 text-lg">
          Search any ArNS username and view its full profile, stats, and history.
        </p>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        <form
          className="w-full max-w-xl mt-12"
          onSubmit={e => {
            e.preventDefault();
            setSearch(query.trim());
          }}
        >
          <div className="flex items-center rounded-xl bg-white border border-gray-300 shadow-md px-2 py-1">
            <input
              className="flex-1 px-4 py-3 text-lg outline-none bg-transparent"
              placeholder="Search ArNS name (e.g. iamscott.arns)"
              value={query}
              spellCheck={false}
              autoFocus
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") {
                  setSearch(query.trim());
                }
              }}
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-fuchsia-500 to-cyan-400 text-white font-bold rounded-lg ml-2 hover:from-fuchsia-600 hover:to-cyan-500 transition"
            >
              Search
            </button>
          </div>
          <div className="text-center text-gray-500 mt-2">
            Try: {demoNames.map(name =>
              <button
                key={name}
                className="text-fuchsia-600 underline mx-1 hover:text-blue-400 transition"
                onClick={e => { e.preventDefault(); setQuery(name); setSearch(name); }}
              >{name}</button>
            )}
          </div>
        </form>
        <div className="w-full max-w-xl mt-8">
          {loading &&
            <div className="text-center py-6 text-lg text-fuchsia-600 font-bold animate-pulse">Loading…</div>
          }
          {error &&
            <div className="bg-gray-100 rounded-xl py-8 px-6 text-center text-gray-700 text-lg mt-2 border border-gray-200 shadow">
              <span className="font-semibold">{error}</span>
            </div>
          }
          {profile &&
            <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-8 flex flex-col items-center transition mt-4">
              <img
                src={
                  profile.avatar
                  || `https://avatars.dicebear.com/api/identicon/${profile.name}.svg`
                }
                alt={`${profile.name} avatar`}
                className="w-24 h-24 rounded-full border-4 border-fuchsia-500 shadow mb-4"
                onError={e => (e.currentTarget.src = "https://avatars.dicebear.com/api/identicon/404.svg")}
              />
              <div className="text-2xl font-bold text-fuchsia-700 mb-2">{profile.name}</div>
              <div className="flex flex-col sm:flex-row gap-4 w-full justify-center items-center mb-2">
                <div className="text-gray-700">
                  <span className="font-semibold">Address:</span>
                  <span className="font-mono text-blue-600 ml-1">{shorten(profile.address, 16)}</span>
                  <button
                    className="ml-1 text-xs text-fuchsia-700 bg-fuchsia-100 px-2 py-1 rounded hover:bg-fuchsia-200 transition"
                    onClick={() => {
                      navigator.clipboard.writeText(profile.address);
                      setCopied("address");
                    }}
                  >Copy</button>
                  <a
                    className="text-blue-400 ml-2 underline"
                    href={`https://viewblock.io/arweave/address/${profile.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >ViewBlock</a>
                  {copied === "address" && <span className="ml-2 text-emerald-600 text-xs">Copied!</span>}
                </div>
                <div className="text-gray-700">
                  <span className="font-semibold">Owner:</span>
                  <span className="font-mono text-gray-500 ml-1">{shorten(profile.owner, 16)}</span>
                  <button
                    className="ml-1 text-xs text-fuchsia-700 bg-fuchsia-100 px-2 py-1 rounded hover:bg-fuchsia-200 transition"
                    onClick={() => {
                      navigator.clipboard.writeText(profile.owner);
                      setCopied("owner");
                    }}
                  >Copy</button>
                  {copied === "owner" && <span className="ml-2 text-emerald-600 text-xs">Copied!</span>}
                </div>
              </div>
              {stats &&
                <div className="w-full flex flex-wrap gap-4 justify-center mt-2 text-gray-600">
                  <div className="bg-gray-50 rounded px-3 py-1 border border-gray-200 text-sm">
                    <span className="font-bold text-fuchsia-700">Registered:</span>{" "}
                    {stats.created?.toLocaleDateString() || "?"}
                  </div>
                  <div className="bg-gray-50 rounded px-3 py-1 border border-gray-200 text-sm">
                    <span className="font-bold text-fuchsia-700">Last Update:</span>{" "}
                    {stats.updated?.toLocaleDateString() || "?"}
                  </div>
                  <div className="bg-gray-50 rounded px-3 py-1 border border-gray-200 text-sm">
                    <span className="font-bold text-fuchsia-700">Updates:</span>{" "}
                    {stats.updates}
                  </div>
                </div>
              }
              {profile.records && profile.records.length > 0 &&
                <div className="w-full mt-5">
                  <div className="text-fuchsia-600 font-semibold mb-2">Records</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.records.map((rec: any) =>
                      <div key={rec.key} className="bg-gray-100 rounded-lg p-3 text-gray-700">
                        <div className="text-xs uppercase text-gray-400">{rec.key}</div>
                        <div className="font-mono break-all flex items-center gap-2">
                          {rec.value}
                          <button
                            className="text-xs text-fuchsia-700 bg-fuchsia-100 px-2 py-1 rounded hover:bg-fuchsia-200 transition"
                            onClick={() => {
                              navigator.clipboard.writeText(rec.value);
                              setCopied(rec.key);
                            }}
                          >Copy</button>
                          {copied === rec.key && <span className="ml-1 text-emerald-600 text-xs">Copied!</span>}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              }
              {profile.history && profile.history.length > 0 &&
                <div className="w-full mt-8">
                  <div className="text-fuchsia-600 font-semibold mb-2 text-lg">History Timeline</div>
                  <div className="space-y-4">
                    {profile.history
                      .slice()
                      .sort((a: any, b: any) => (a.timestamp || 0) - (b.timestamp || 0))
                      .map((item: any, idx: number) => (
                      <div key={item.txID} className="flex items-start gap-3">
                        <div className="w-4 h-4 mt-1 rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="text-gray-800 font-semibold">
                            {item.type}{" "}
                            <span className="text-gray-500 font-normal text-sm">
                              {item.timestamp ? new Date(item.timestamp * 1000).toLocaleString() : ""}
                            </span>
                          </div>
                          <div className="text-gray-600 text-sm">
                            <span className="font-bold">Owner:</span>{" "}
                            <span className="font-mono">{shorten(item.owner, 12)}</span>{" "}
                            <button
                              className="text-xs text-fuchsia-700 bg-fuchsia-100 px-1 py-0.5 rounded hover:bg-fuchsia-200 transition"
                              onClick={() => {
                                navigator.clipboard.writeText(item.owner);
                                setCopied("hist-owner-"+item.txID);
                              }}
                            >Copy</button>
                            {copied === "hist-owner-"+item.txID && <span className="ml-1 text-emerald-600 text-xs">Copied!</span>}
                          </div>
                          <a
                            className="text-blue-500 underline text-xs"
                            href={`https://viewblock.io/arweave/tx/${item.txID}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >View Transaction</a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              }
            </div>
          }
        </div>
      </main>
      <footer className="w-full py-6 text-center text-gray-400 text-sm mt-10">
        Powered by <a href="https://ar.io" target="_blank" rel="noopener noreferrer" className="underline text-fuchsia-500">ar.io</a> &middot; Open source demo
      </footer>
    </div>
  );
};