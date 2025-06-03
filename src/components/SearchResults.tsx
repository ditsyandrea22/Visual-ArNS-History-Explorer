import React from 'react';
import ResultItem from './ResultItem';

const SearchResults = ({ results, isLoading, totalResults }) => {
  if (isLoading) {
    return <div className="loading">Loading contract history...</div>;
  }

  if (results.length === 0 && totalResults === 0) {
    return (
      <div className="no-results">
        <p>No results to display. Enter a contract ID and click Search.</p>
      </div>
    );
  }

  return (
    <div className="results-container">
      {totalResults > 0 && (
        <div className="results-summary">
          Showing {results.length} of {totalResults} transactions
        </div>
      )}
      
      <div className="results-list">
        {results.map((item, index) => (
          <ResultItem key={index} item={item} />
        ))}
      </div>
    </div>
  );
};

export default SearchResults;