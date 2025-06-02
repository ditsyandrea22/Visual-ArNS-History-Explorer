import React, { useState } from "react";
import { ArnsExplorerFull } from "./components/ArnsExplorerFull";
import { ArnsSearchView } from "./components/ArnsSearchView";
import { ArnsHistoryExplorer } from "./components/ArnsHistoryExplorer";
import { DetailsPanel } from "./components/DetailsPanel";
import { TimelineView } from "./components/TimelineView";

// ---- MOCK DATA for DetailsPanel and TimelineView ---- //
const mockEvent = {
  txID: "abc123",
  type: "register",
  timestamp: Math.floor(Date.now() / 1000),
  owner: "MockOwnerAddress",
  address: "MockArNSAddress",
  summary: "Mock registration event"
};

const mockEvents = [
  { ...mockEvent },
  { 
    ...mockEvent, 
    txID: "def456", 
    type: "update", 
    timestamp: Math.floor(Date.now() / 1000) - 1000,
    summary: "Mock update event"
  },
];

// Toggle UI for all explorers, including alternate implementations
const explorers = [
  { label: "Full Explorer", value: "full", component: <ArnsExplorerFull /> },
  { label: "Search View", value: "search", component: <ArnsSearchView /> },
  { label: "History Explorer", value: "history", component: <ArnsHistoryExplorer /> },
  { label: "Details Panel", value: "details", component: <DetailsPanel event={mockEvent} /> },
  { 
    label: "Timeline View", 
    value: "timeline", 
    component: (
      <TimelineView 
        events={mockEvents} 
        selectedIdx={0} 
        onSelect={() => {}} 
      />
    ) 
  },
];

export default function App() {
  const [selected, setSelected] = useState("full");
  const [selectedEventIdx, setSelectedEventIdx] = useState(0);

  // Update the timeline view with proper state management
  const updatedExplorers = explorers.map(explorer => {
    if (explorer.value === "timeline") {
      return {
        ...explorer,
        component: (
          <TimelineView 
            events={mockEvents} 
            selectedIdx={selectedEventIdx} 
            onSelect={setSelectedEventIdx} 
          />
        )
      };
    }
    return explorer;
  });

  const explorer = updatedExplorers.find(e => e.value === selected);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="w-full flex justify-center gap-2 p-4 bg-gray-100 border-b border-gray-200 z-10 sticky top-0">
        {updatedExplorers.map(e => (
          <button
            key={e.value}
            className={`px-4 py-2 rounded font-bold transition ${
              selected === e.value
                ? "bg-gradient-to-r from-fuchsia-500 to-cyan-400 text-white shadow"
                : "bg-white text-gray-800 border border-gray-300 hover:bg-fuchsia-50"
            }`}
            onClick={() => setSelected(e.value)}
          >
            {e.label}
          </button>
        ))}
      </nav>
      <div className="p-4">
        {explorer?.component}
        {selected === "details" && (
          <div className="max-w-md mx-auto mt-8">
            <DetailsPanel event={mockEvents[selectedEventIdx]} />
          </div>
        )}
      </div>
    </div>
  );
}