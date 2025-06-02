import React from "react";
import { ArnsEvent } from "../hooks/useArnsHistory";

interface Props {
  event: ArnsEvent | null;
}

export default function DetailsPanel({ event }: Props) {
  if (!event)
    return (
      <div className="border rounded-lg bg-white/90 shadow p-4 text-gray-400 text-center">
        <div className="text-2xl mb-2">ℹ️</div>
        <div>Select an event to see details</div>
      </div>
    );

  return (
    <div className="border rounded-lg bg-white/90 shadow p-4">
      <h2 className="font-bold text-blue-700 text-xl mb-2">Event Details</h2>
      <div className="mb-2">
        <span className="font-medium">Type:</span> {event.type}
      </div>
      <div className="mb-2">
        <span className="font-medium">Date:</span> {new Date(event.timestamp * 1000).toLocaleString()}
      </div>
      <div className="mb-2">
        <span className="font-medium">Summary:</span> {event.summary}
      </div>
      <div className="mb-2">
        <span className="font-medium">TxID:</span> <a href={`https://viewblock.io/arweave/tx/${event.txid}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{event.txid.slice(0, 8)}…</a>
      </div>
      <div className="mb-2">
        <span className="font-medium">Owner:</span> <span className="font-mono">{event.owner}</span>
      </div>
      {event.records && (
        <div className="mb-2">
          <span className="font-medium">Records:</span>
          <pre className="bg-gray-50 border p-2 rounded text-xs overflow-x-auto">{JSON.stringify(event.records, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}