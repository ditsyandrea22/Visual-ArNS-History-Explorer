import axios from "axios";

// Remove TypeScript interface, use JSDoc for documentation if needed
// /**
//  * @typedef {Object} ContractHistoryItem
//  * @property {string} txId
//  * @property {string} function
//  * @property {any} input
//  * @property {string} timestamp
//  */

export const fetchContractHistory = async (contractId) => {
  try {
    const response = await axios.get(
      `https://api.arns.app/v1/contract/${contractId}/history`
    );
    return response.data?.history || [];
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

export const filterHistory = (history, searchTerm) => {
  if (!searchTerm.trim()) return history;

  const termLower = searchTerm.toLowerCase();
  return history.filter((item) =>
    (item.function && item.function.toLowerCase().includes(termLower)) ||
    (item.input && JSON.stringify(item.input).toLowerCase().includes(termLower)) ||
    (item.txId && item.txId.toLowerCase().includes(termLower)) ||
    (item.timestamp && item.timestamp.toLowerCase().includes(termLower))
  );
};