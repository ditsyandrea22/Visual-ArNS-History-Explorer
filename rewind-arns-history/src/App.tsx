import { useState } from 'react';
import axios from 'axios';
import SearchBar from './components/SearchBar';
import SearchResults from './components/SearchResults';
import Pagination from './components/Pagination';
import './App.css';

function App() {
  const [contractId, setContractId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleSearch = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!contractId.trim()) {
        setError('Please enter a valid contract ID');
        return;
      }

      const response = await axios.get(
        `https://api.arns.app/v1/contract/${contractId}/history`
      );

      if (response.data?.history) {
        const filteredResults = filterResults(response.data.history, searchTerm);
        setSearchResults(filteredResults);
        setCurrentPage(1);
      } else {
        setSearchResults([]);
        setError('No history found for this contract');
      }
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.message || 'Failed to fetch data. Please check the contract ID and try again.');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterResults = (results: any[], term: string) => {
    if (!term.trim()) return results;
    
    const termLower = term.toLowerCase();
    return results.filter(item => 
      (item.function?.toLowerCase().includes(termLower)) ||
      (item.input && JSON.stringify(item.input).toLowerCase().includes(termLower)) ||
      (item.txId?.toLowerCase().includes(termLower)) ||
      (item.timestamp?.toLowerCase().includes(termLower))
    );
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = searchResults.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(searchResults.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="container">
      <header>
        <h1>Visual ArNS History Explorer</h1>
        <p>Explore transaction history for any ArNS contract</p>
      </header>
      
      <SearchBar 
        contractId={contractId}
        setContractId={setContractId}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        handleSearch={handleSearch}
        isLoading={isLoading}
      />

      {error && <div className="error-message">{error}</div>}

      <SearchResults 
        results={currentItems} 
        isLoading={isLoading} 
        totalResults={searchResults.length}
      />

      {searchResults.length > 0 && (
        <Pagination
          itemsPerPage={itemsPerPage}
          totalItems={searchResults.length}
          currentPage={currentPage}
          paginate={paginate}
          totalPages={totalPages}
        />
      )}
    </div>
  );
}

export default App;