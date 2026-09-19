import React from "react";
import { UsePaginationReturn } from "@/hooks/usePagination";

interface PaginationControlProps {
  pagination: UsePaginationReturn;
  totalItems: number;
  itemName?: string;
}

export const PaginationControl: React.FC<PaginationControlProps> = ({
  pagination,
  totalItems,
  itemName = "registros",
}) => {
  if (totalItems <= pagination.pageSize) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-white/5 text-xs text-body-color dark:text-gray-400">
      <div>
        Mostrando{" "}
        <span className="font-bold text-black dark:text-white">
          {pagination.startIndex + 1}
        </span>{" "}
        a{" "}
        <span className="font-bold text-black dark:text-white">
          {pagination.endIndex}
        </span>{" "}
        de{" "}
        <span className="font-bold text-black dark:text-white">
          {totalItems}
        </span>{" "}
        {itemName}
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={pagination.prevPage}
          disabled={!pagination.hasPrevPage}
          className="rounded-lg border border-black/10 dark:border-white/10 px-3 py-1.5 font-bold hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          Anterior
        </button>

        <span className="px-2 font-bold text-black dark:text-white">
          {pagination.currentPage} / {pagination.totalPages}
        </span>

        <button
          onClick={pagination.nextPage}
          disabled={!pagination.hasNextPage}
          className="rounded-lg border border-black/10 dark:border-white/10 px-3 py-1.5 font-bold hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};
