import React, { useState } from "react";
import ArnsSearch from "./components/ArnsSearch";
import TimelineView from "./components/TimelineView";
import DetailsPanel from "./components/DetailsPanel";
import { useArnsHistory, ArnsEvent } from "./hooks/useArnsHistory";

export default function App() {
  const [query, setQuery] = useState<string>("");
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const { events, loading, error } = useArnsHistory(query);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-100 flex flex-col items-center">
      <header className="w-full py-8 text-center bg-white/80 shadow">
        <h1 className="text-4xl font-bold tracking-tight text-blue-700 mb-2">Rewind</h1>
        <p className="text-gray-700">Visual ArNS History Explorer</p>
      </header>

      <main className="w-full max-w-4xl mt-6 p-4 flex flex-col items-center">
        <ArnsSearch
          value={query}
          onChange={name => {
            setQuery(name);
            setSelectedIdx(null);
          }}
          loading={loading}
        />

        {error && (
          <div className="mt-4 text-red-600 bg-red-100 rounded p-2">{error}</div>
        )}

        {loading && (
          <div className="mt-8 text-blue-700 animate-pulse text-lg">Loading history…</div>
        )}

        {!loading && events.length > 0 && (
          <div className="w-full flex flex-col md:flex-row mt-12 gap-6">
            <div className="flex-1">
              <TimelineView
                events={events}
                selectedIdx={selectedIdx}
                onSelect={setSelectedIdx}
              />
            </div>
            <div className="md:w-80 w-full">
              <DetailsPanel
                event={selectedIdx !== null ? events[selectedIdx] : null}
              />
            </div>
          </div>
        )}

        {!loading && query && events.length === 0 && !error && (
          <div className="mt-8 text-gray-400 text-lg">No history found for <span className="font-mono">{query}.ar</span></div>
        )}
      </main>

      <footer className="w-full py-4 mt-auto text-center text-sm text-gray-400">
        MIT License – <a href="https://github.com/ar-io/ar-io-grants" className="underline">ar-io Grants</a>
      </footer>
    </div>
  );
}