import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalElements?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, totalElements, pageSize = 10, onPageChange }) => {
  if (totalPages <= 0) return null;

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | '...')[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible + 2) {
      // Show all pages
      for (let i = 0; i < totalPages; i++) pages.push(i);
    } else {
      // Always show first page
      pages.push(0);
      
      if (currentPage > 2) pages.push('...');
      
      // Show pages around current
      const start = Math.max(1, currentPage - 1);
      const end = Math.min(totalPages - 2, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      
      if (currentPage < totalPages - 3) pages.push('...');
      
      // Always show last page
      pages.push(totalPages - 1);
    }
    return pages;
  };

  const startItem = currentPage * pageSize + 1;
  const endItem = totalElements ? Math.min((currentPage + 1) * pageSize, totalElements) : (currentPage + 1) * pageSize;

  return (
    <div className="flex items-center justify-between border-t border-zinc-200/80 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/50 px-4 py-3 sm:px-6 mt-4 rounded-b-xl">
      {/* Mobile */}
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0}
          className="relative inline-flex items-center rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Trước
        </button>
        <span className="inline-flex items-center text-sm text-zinc-500 dark:text-zinc-400">
          {currentPage + 1} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages - 1}
          className="relative ml-3 inline-flex items-center rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Sau
        </button>
      </div>

      {/* Desktop */}
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {totalElements !== undefined ? (
              <>
                Hiển thị <span className="font-medium text-zinc-800 dark:text-zinc-200">{startItem}</span> đến{' '}
                <span className="font-medium text-zinc-800 dark:text-zinc-200">{endItem}</span> trên{' '}
                <span className="font-medium text-zinc-800 dark:text-zinc-200">{totalElements}</span> kết quả
              </>
            ) : (
              <>
                Trang <span className="font-medium text-zinc-800 dark:text-zinc-200">{currentPage + 1}</span> /{' '}
                <span className="font-medium text-zinc-800 dark:text-zinc-200">{totalPages}</span>
              </>
            )}
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-lg shadow-sm" aria-label="Pagination">
            {/* Previous */}
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="relative inline-flex items-center rounded-l-lg px-2.5 py-2 text-zinc-500 dark:text-zinc-400 ring-1 ring-inset ring-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-800 dark:hover:text-zinc-200 focus:z-20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Page numbers */}
            {getPageNumbers().map((pageNum, idx) =>
              pageNum === '...' ? (
                <span
                  key={`ellipsis-${idx}`}
                  className="relative inline-flex items-center px-3 py-2 text-sm text-zinc-500 ring-1 ring-inset ring-zinc-700"
                >
                  …
                </span>
              ) : (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`relative inline-flex items-center px-3.5 py-2 text-sm font-medium ring-1 ring-inset ring-zinc-700 transition-colors focus:z-20 ${
                    pageNum === currentPage
                      ? 'bg-emerald-500/20 text-emerald-400 z-10 ring-emerald-500/40'
                      : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  {pageNum + 1}
                </button>
              )
            )}

            {/* Next */}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages - 1}
              className="relative inline-flex items-center rounded-r-lg px-2.5 py-2 text-zinc-500 dark:text-zinc-400 ring-1 ring-inset ring-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-800 dark:hover:text-zinc-200 focus:z-20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};
