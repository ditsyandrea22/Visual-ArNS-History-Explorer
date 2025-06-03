/**
 * Fetch and search ARNS (Arweave Name Service) records from AR.IO programmatically.
 * No API key required. Works in Node.js and browser (if CORS allowed).
 *
 * Usage:
 *   npx ts-node fetchArns.ts ditsy
 *   // or import and use fetchArnsRecords(searchTerm) in your app
 */

const ARNS_CONTRACT_URL =
  "https://arweave.net/contract/C9W_ihKf4UoLFjLLP0nIUZ3fXnNq_sQFAZpqtF6jQWg";

export interface ARNSData {
  name: string;
  owner: string;
  expires: number;
  resolver: string;
  address: string;
}

/**
 * Fetch all ARNS records, or filter by search term (case-insensitive, substring match).
 */
export async function fetchArnsRecords(
  searchTerm?: string
): Promise<ARNSData[]> {
  const res = await fetch(ARNS_CONTRACT_URL);
  if (!res.ok) throw new Error("Failed to fetch ARNS records");
  const data = await res.json();

  const records = data.records as Record<string, Omit<ARNSData, "name">>;
  let arnsList = Object.entries(records).map(([name, info]) => ({
    name,
    ...info,
  }));

  if (searchTerm) {
    const lower = searchTerm.toLowerCase();
    arnsList = arnsList.filter((r) => r.name.toLowerCase().includes(lower));
  }

  return arnsList;
}

// ---- Standalone CLI usage ----
if (require.main === module) {
  // If run directly, allow searching from command line
  // Usage: npx ts-node fetchArns.ts [searchTerm]
  // Example: npx ts-node fetchArns.ts ditsy
  const search = process.argv[2];
  fetchArnsRecords(search)
    .then((results) => {
      if (!results.length) {
        console.log("No ARNS records found.");
        return;
      }
      for (const r of results) {
        console.log(
          `Name: ${r.name}\n  Owner: ${r.owner}\n  Address: ${r.address}\n  Resolver: ${r.resolver}\n  Expires: ${r.expires}\n`
        );
      }
    })
    .catch((err) => {
      console.error("Error:", err);
    });
}