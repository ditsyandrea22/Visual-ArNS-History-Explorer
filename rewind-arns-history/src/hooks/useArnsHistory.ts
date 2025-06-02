import { useEffect, useState } from "react";
import axios from "axios";

// Types for ArNS event
export type ArnsEvent = {
  type: "ownership" | "record" | "created" | "other";
  timestamp: number; // unix epoch
  summary: string;
  txid: string;
  owner: string;
  records?: any;
};

export function useArnsHistory(name: string) {
  const [events, setEvents] = useState<ArnsEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!name) {
      setEvents([]);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    setEvents([]);

    // --- Stubbed fetching logic ---
    // TODO: Replace with real Arweave/ArNS fetch.
    // Simulate fetching with timeout.
    const timer = setTimeout(() => {
      // Simulated results for demo
      if (name.toLowerCase() === "rewind") {
        setEvents([
          {
            type: "created",
            timestamp: 1700000000,
            summary: "Name registered",
            txid: "0xabc123",
            owner: "ownerABC",
            records: { arweave: "rewind.ar" },
          },
          {
            type: "ownership",
            timestamp: 1710000000,
            summary: "Ownership transferred to newOwnerXYZ",
            txid: "0xdef456",
            owner: "newOwnerXYZ",
          },
          {
            type: "record",
            timestamp: 1720000000,
            summary: "Records updated",
            txid: "0xaaa999",
            owner: "newOwnerXYZ",
            records: { ipfs: "bafy..." },
          },
        ]);
      } else {
        setEvents([]);
      }
      setLoading(false);
    }, 1200);

    // Example: For real data, use Arweave GraphQL or the ar-io API here.
    // axios.post("https://arweave.net/graphql", {...})
    //   .then(...)
    //   .catch(...)

    return () => clearTimeout(timer);
  }, [name]);

  return { events, loading, error };
}