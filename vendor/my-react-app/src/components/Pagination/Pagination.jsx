import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./Pagination.css";

/**
 * Reusable Pagination Component
 * @param {Object} props
 * @param {number} props.currentPage - Current page number
 * @param {number} props.totalPages - Total number of pages
 * @param {function} props.onPageChange - Callback when page changes
 * @param {boolean} props.loading - Loading state
 * @param {string} props.variant - Style variant ('default', 'dots', 'compact')
 */
export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  loading = false,
  variant = "default",
  className = "",
}) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      // Show pages around current
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      // Always show last page
      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const handlePrevious = () => {
    if (currentPage > 1 && !loading) {
      onPageChange(currentPage - 1);
      // Scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages && !loading) {
      onPageChange(currentPage + 1);
      // Scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePageClick = (page) => {
    if (page !== "..." && page !== currentPage && !loading) {
      onPageChange(page);
      // Scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className={`pagination-container ${variant} ${className}`}>
      {/* Previous Button */}
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1 || loading}
        className="pagination-btn pagination-prev"
        aria-label="Previous page"
        title={currentPage === 1 ? "No previous page" : "Go to previous page"}
      >
        <ChevronLeft size={18} />
        <span className="hidden-mobile">Previous</span>
      </button>

      {/* Page Numbers */}
      <div className="pagination-numbers">
        {pageNumbers.map((page, index) => (
          <button
            key={index}
            onClick={() => handlePageClick(page)}
            disabled={page === "..." || loading}
            className={`pagination-page-btn ${
              page === currentPage ? "active" : ""
            } ${page === "..." ? "dots" : ""}`}
            aria-label={page === "..." ? "More pages" : `Go to page ${page}`}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </button>
        ))}
      </div>

      {/* Info Text */}
      <div className="pagination-info">
        Page {currentPage} of {totalPages}
      </div>

      {/* Next Button */}
      <button
        onClick={handleNext}
        disabled={currentPage === totalPages || loading}
        className="pagination-btn pagination-next"
        aria-label="Next page"
        title={
          currentPage === totalPages
            ? "No next page"
            : "Go to next page"
        }
      >
        <span className="hidden-mobile">Next</span>
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
