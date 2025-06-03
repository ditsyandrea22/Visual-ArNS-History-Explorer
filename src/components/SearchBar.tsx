import React from 'react';

const SearchBar = ({ 
  contractId, 
  setContractId, 
  searchTerm, 
  setSearchTerm, 
  handleSearch, 
  isLoading 
}) => {
  const handleKeyPress = (e) => {
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