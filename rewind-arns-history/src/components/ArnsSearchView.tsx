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
          }
        }
      `,
      variables: { name: name?.toLowerCase() },
    }),
  });
  const { data } = await res.json();
  return data?.ansProfile;
}

function shorten(str: string, n=6) {
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

export const ArnsSearchView: React.FC = () => {
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

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

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="w-full py-6 bg-gradient-to-r from-fuchsia-500 via-blue-400 to-cyan-400 shadow">
        <h1 className="text-3xl md:text-4xl font-extrabold text-center text-white tracking-tight">
          Arweave Name Service Lookup
        </h1>
        <p className="text-center text-white opacity-80 mt-2 text-lg">
          Search any ArNS username and view its profile & address.
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
              <div className="text-gray-700 mb-2">
                <span className="font-semibold">Address:</span><br/>
                <span className="font-mono text-blue-600">{shorten(profile.address, 12)}</span>
                <a
                  className="text-blue-400 ml-2 underline"
                  href={`https://viewblock.io/arweave/address/${profile.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >View on ViewBlock</a>
              </div>
              <div className="text-gray-600 mt-2">
                <span className="font-semibold">Owner:</span>
                <span className="font-mono text-gray-500 ml-1">{shorten(profile.owner, 12)}</span>
              </div>
              {profile.records && profile.records.length > 0 &&
                <div className="w-full mt-6">
                  <div className="text-fuchsia-600 font-semibold mb-2">Records</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.records.map((rec: any) =>
                      <div key={rec.key} className="bg-gray-100 rounded-lg p-3 text-gray-700">
                        <div className="text-xs uppercase text-gray-400">{rec.key}</div>
                        <div className="font-mono break-all">{rec.value}</div>
                      </div>
                    )}
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