import { useState, useMemo, useCallback } from "react";

export interface UsePaginationOptions {
  initialPage?: number;
  pageSize?: number;
  totalItems: number;
}

export interface UsePaginationReturn {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  firstPage: () => void;
  lastPage: () => void;
}

export function usePagination({
  initialPage = 1,
  pageSize: initialPageSize = 10,
  totalItems,
}: UsePaginationOptions): UsePaginationReturn {
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [pageSize, setPageSize] = useState<number>(initialPageSize);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(totalItems / pageSize));
  }, [totalItems, pageSize]);

  const safeCurrentPage = useMemo(() => {
    if (currentPage > totalPages) return totalPages;
    if (currentPage < 1) return 1;
    return currentPage;
  }, [currentPage, totalPages]);

  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  const setPage = useCallback(
    (page: number) => {
      setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    },
    [totalPages]
  );

  const nextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  }, []);

  const firstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const lastPage = useCallback(() => {
    setCurrentPage(totalPages);
  }, [totalPages]);

  return {
    currentPage: safeCurrentPage,
    pageSize,
    totalPages,
    totalItems,
    startIndex,
    endIndex,
    hasPrevPage: safeCurrentPage > 1,
    hasNextPage: safeCurrentPage < totalPages,
    setPage,
    setPageSize,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
  };
}
