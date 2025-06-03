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

/**
 * Fetches the ARNS event history for a given domain name (e.g., "rewind.ar").
 * Uses Arweave's official GraphQL endpoint.
 */
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

    // ARNS registry contract ID as of 2024
    const CONTRACT_ID = "C9W_ihKf4UoLFjLLP0nIUZ3fXnNq_sQFAZpqtF6jQWg";

    // GraphQL to find all transactions for this ARNS name
    const query = {
      query: `
        query($name: String!, $contractId: String!) {
          transactions(
            tags: [
              { name: "App-Name", values: ["arweave-name-system"] },
              { name: "Contract", values: [$contractId] },
              { name: "ArNS-Name", values: [$name] }
            ]
            first: 20
          ) {
            edges {
              node {
                id
                owner { address }
                block { timestamp }
                tags {
                  name
                  value
                }
              }
            }
          }
        }
      `,
      variables: {
        name,
        contractId: CONTRACT_ID,
      },
    };

    axios
      .post("https://arweave.net/graphql", query)
      .then((res) => {
        const txs = res.data?.data?.transactions?.edges || [];
        if (!txs.length) {
          setEvents([]);
          setLoading(false);
          return;
        }

        // Parse transactions into ArnsEvent[]
        const parsed: ArnsEvent[] = txs.map((t: any) => {
          const tags = t.node.tags.reduce(
            (acc: Record<string, string>, tag: { name: string; value: string }) => {
              acc[tag.name] = tag.value;
              return acc;
            },
            {}
          );
          let type: ArnsEvent["type"] = "other";
          let summary = "";
          if (tags["Action"] === "register") {
            type = "created";
            summary = "Name registered";
          } else if (tags["Action"] === "transfer") {
            type = "ownership";
            summary = `Ownership transferred to ${tags["Recipient"] || "unknown"}`;
          } else if (tags["Action"] === "update") {
            type = "record";
            summary = "Records updated";
          } else {
            summary = tags["Action"] || "Unknown event";
          }
          return {
            type,
            timestamp: t.node.block?.timestamp || 0,
            summary,
            txid: t.node.id,
            owner: t.node.owner.address,
            records: tags,
          };
        });

        // Sort by most recent first
        parsed.sort((a, b) => b.timestamp - a.timestamp);

        setEvents(parsed);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : String(err));
        setEvents([]);
        setLoading(false);
      });
  }, [name]);

  return { events, loading, error };
}