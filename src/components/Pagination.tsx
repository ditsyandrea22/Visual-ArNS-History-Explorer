import React from 'react';

interface PaginationProps {
  itemsPerPage: number;
  totalItems: number;
  currentPage: number;
  paginate: (pageNumber: number) => void; // Explicitly define parameter type here
  totalPages: number;
}

const Pagination: React.FC<PaginationProps> = ({ 
  itemsPerPage, 
  totalItems, 
  currentPage, 
  paginate, 
  totalPages 
}) => {
  const pageNumbers: number[] = []; // Explicitly type the array

  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="pagination">
      <div className="pagination-info">
        Page {currentPage} of {totalPages}
      </div>
      
      <nav>
        <ul className="pagination-list">
          <li>
            <button
              onClick={() => paginate(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
          </li>
          
          {pageNumbers.map(number => (
            <li key={number}>
              <button
                onClick={() => paginate(number)}
                className={currentPage === number ? 'active' : ''}
              >
                {number}
              </button>
            </li>
          ))}
          
          <li>
            <button
              onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Pagination;