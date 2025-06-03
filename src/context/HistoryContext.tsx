import React, { createContext, useContext, useState } from "react";

// AR.IO ARNS registry contract endpoint
const ARNS_CONTRACT_URL =
  "https://arweave.net/contract/C9W_ihKf4UoLFjLLP0nIUZ3fXnNq_sQFAZpqtF6jQWg";

// Record structure as returned by the ARNS registry
export type ArNSRecord = {
  domain: string;                // The ARNS domain, e.g. "ditsy.ar"
  owner: string;
  expires: number;
  resolver: string;
  address: string;
};

type HistoryContextType = {
  history: ArNSRecord[];
  loading: boolean;
  error: string | null;
  loadHistory: (domain: string) => Promise<void>;
};

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

async function fetchHistory(domain: string): Promise<ArNSRecord[]> {
  const res = await fetch(ARNS_CONTRACT_URL);
  if (!res.ok) throw new Error("Failed to fetch ARNS registry data");
  const json = await res.json();
  const records = json.records as Record<string, Omit<ArNSRecord, "domain">>;
  // Find the record for the given domain
  if (records[domain]) {
    // Return a single-record array for consistency
    return [
      { domain, ...records[domain] }
    ];
  }
  // Not found: return an empty array (or handle differently if you wish)
  return [];
}

export const HistoryProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [history, setHistory] = useState<ArNSRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = async (domain: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchHistory(domain);
      setHistory(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history');
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <HistoryContext.Provider value={{ history, loading, error, loadHistory }}>
      {children}
    </HistoryContext.Provider>
  );
};

export const useHistory = () => {
  const context = useContext(HistoryContext);
  if (!context) throw new Error("useHistory must be used within a HistoryProvider");
  return context;
};