import React from 'react';

type SearchBarProps = {
  contractId: string;
  setContractId: (id: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  handleSearch: () => void;
  isLoading: boolean;
};

const SearchBar: React.FC<SearchBarProps> = ({ 
  contractId, 
  setContractId, 
  searchTerm, 
  setSearchTerm, 
  handleSearch, 
  isLoading 
}) => {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="search-container">
      <div className="input-group">
        <label htmlFor="contractId">Contract ID</label>
        <input
          id="contractId"
          type="text"
          value={contractId}
          onChange={(e) => setContractId(e.target.value)}
          placeholder="Enter Contract ID (e.g. abc123)"
          onKeyPress={handleKeyPress}
        />
      </div>

      <div className="input-group">
        <label htmlFor="searchTerm">Search Filter</label>
        <input
          id="searchTerm"
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter results (function, input, txId)"
          onKeyPress={handleKeyPress}
        />
      </div>

      <button 
        onClick={handleSearch} 
        disabled={isLoading}
        className="search-button"
      >
        {isLoading ? (
          <>
            <span className="spinner"></span> Searching...
          </>
        ) : (
          'Search History'
        )}
      </button>
    </div>
  );
};

export default SearchBar;