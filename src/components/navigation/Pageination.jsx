// client/src/components/common/Pagination.jsx (continued from where it left off)
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  className = '',
  showPageNumbers = true,
  maxPageLinks = 5
}) => {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    
    if (totalPages <= maxPageLinks) {
      // If total pages is less than max links, show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always include first and last page
      pages.push(1);
      
      // Calculate start and end of page range
      let startPage = Math.max(2, currentPage - Math.floor(maxPageLinks / 2));
      let endPage = Math.min(totalPages - 1, startPage + maxPageLinks - 3);
      
      // Adjust if we're near the start
      if (startPage === 2) {
        endPage = Math.min(totalPages - 1, startPage + maxPageLinks - 2);
      }
      
      // Adjust if we're near the end
      if (endPage === totalPages - 1) {
        startPage = Math.max(2, endPage - (maxPageLinks - 2));
      }
      
      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pages.push('...');
      }
      
      // Add page numbers
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pages.push('...');
      }
      
      // Add last page if not already included
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav className={`flex justify-center items-center space-x-1 ${className}`}>
      {/* Previous button */}
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 ${
          currentPage === 1
            ? 'text-dark-500 cursor-not-allowed'
            : 'text-dark-400 hover:text-dark-200 hover:bg-dark-800'
        }`}
        aria-label="Previous page"
      >
        <ChevronLeftIcon className="h-5 w-5" />
      </button>
      
      {/* Page numbers */}
      {showPageNumbers && getPageNumbers().map((page, index) => (
        page === '...' ? (
          <span key={`ellipsis-${index}`} className="px-3 py-2 text-dark-500">
            ...
          </span>
        ) : (
          <button
            key={`page-${page}`}
            onClick={() => handlePageChange(page)}
            className={`px-3 py-1 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 ${
              currentPage === page
                ? 'bg-primary-900/30 text-primary-400 font-medium'
                : 'text-dark-400 hover:text-dark-200 hover:bg-dark-800'
            }`}
            aria-label={`Page ${page}`}
            aria-current={currentPage === page ? 'page' : undefined}
          >
            {page}
          </button>
        )
      ))}
      
      {/* Next button */}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 ${
          currentPage === totalPages
            ? 'text-dark-500 cursor-not-allowed'
            : 'text-dark-400 hover:text-dark-200 hover:bg-dark-800'
        }`}
        aria-label="Next page"
      >
        <ChevronRightIcon className="h-5 w-5" />
      </button>
    </nav>
  );
};

export default Pagination;