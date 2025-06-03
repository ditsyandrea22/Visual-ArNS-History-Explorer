import React, { createContext, useContext, useState } from "react";

// Define ArNSRecord type as needed
type ArNSRecord = {
  id: string;
  domain: string;
  data: any;
};

type HistoryContextType = {
  history: ArNSRecord[];
  loading: boolean;
  error: string | null;
  loadHistory: (domain: string) => Promise<void>;
};

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

async function fetchHistory(domain: string): Promise<ArNSRecord[]> {
  // Replace this with your actual fetching logic
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