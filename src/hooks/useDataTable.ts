import { useState, useMemo, useCallback } from "react";
import { useDebounce } from "./useDebounce";
import { usePagination, UsePaginationReturn } from "./usePagination";

export type SortOrder = "asc" | "desc" | null;

export interface UseDataTableOptions<T> {
  data: T[];
  searchFields?: (keyof T | ((item: T) => string | undefined | null))[];
  initialSearch?: string;
  debounceMs?: number;
  initialPage?: number;
  pageSize?: number;
  filterFn?: (item: T, searchTerm: string) => boolean;
  initialSortKey?: keyof T | null;
  initialSortOrder?: SortOrder;
}

export interface UseDataTableReturn<T> {
  // Búsqueda
  searchTerm: string;
  debouncedSearchTerm: string;
  setSearchTerm: (term: string) => void;
  resetSearch: () => void;

  // Datos procesados
  filteredData: T[];
  paginatedData: T[];
  totalFiltered: number;
  totalRaw: number;

  // Paginación
  pagination: UsePaginationReturn;

  // Ordenamiento
  sortKey: keyof T | null;
  sortOrder: SortOrder;
  setSort: (key: keyof T) => void;
  resetSort: () => void;
}

export function useDataTable<T extends Record<string, any>>({
  data = [],
  searchFields = [],
  initialSearch = "",
  debounceMs = 250,
  initialPage = 1,
  pageSize = 10,
  filterFn,
  initialSortKey = null,
  initialSortOrder = null,
}: UseDataTableOptions<T>): UseDataTableReturn<T> {
  const [searchTerm, setSearchTerm] = useState<string>(initialSearch);
  const debouncedSearchTerm = useDebounce(searchTerm, debounceMs);

  const [sortKey, setSortKey] = useState<keyof T | null>(initialSortKey);
  const [sortOrder, setSortOrder] = useState<SortOrder>(initialSortOrder);

  const resetSearch = useCallback(() => {
    setSearchTerm("");
  }, []);

  // 1. Filtrado
  const filteredData = useMemo(() => {
    const term = debouncedSearchTerm.trim().toLowerCase();

    return data.filter((item) => {
      // Si hay un custom filterFn
      if (filterFn) {
        if (!filterFn(item, term)) return false;
      }

      if (!term) return true;

      // Si se especificaron searchFields
      if (searchFields.length > 0) {
        return searchFields.some((field) => {
          let val: any = "";
          if (typeof field === "function") {
            val = field(item);
          } else {
            val = item[field];
          }
          return val !== null && val !== undefined && String(val).toLowerCase().includes(term);
        });
      }

      // Si no hay searchFields, buscar en todos los valores de primer nivel
      return Object.values(item).some(
        (val) => val !== null && val !== undefined && String(val).toLowerCase().includes(term)
      );
    });
  }, [data, debouncedSearchTerm, searchFields, filterFn]);

  // 2. Ordenamiento
  const sortedData = useMemo(() => {
    if (!sortKey || !sortOrder) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      return sortOrder === "asc" ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });
  }, [filteredData, sortKey, sortOrder]);

  // 3. Paginación
  const pagination = usePagination({
    initialPage,
    pageSize,
    totalItems: sortedData.length,
  });

  const paginatedData = useMemo(() => {
    return sortedData.slice(pagination.startIndex, pagination.endIndex);
  }, [sortedData, pagination.startIndex, pagination.endIndex]);

  const setSort = useCallback((key: keyof T) => {
    setSortKey((prevKey) => {
      if (prevKey === key) {
        setSortOrder((prevOrder) => {
          if (prevOrder === "asc") return "desc";
          if (prevOrder === "desc") return null;
          return "asc";
        });
        return key;
      }
      setSortOrder("asc");
      return key;
    });
  }, []);

  const resetSort = useCallback(() => {
    setSortKey(null);
    setSortOrder(null);
  }, []);

  return {
    searchTerm,
    debouncedSearchTerm,
    setSearchTerm,
    resetSearch,
    filteredData: sortedData,
    paginatedData,
    totalFiltered: sortedData.length,
    totalRaw: data.length,
    pagination,
    sortKey,
    sortOrder,
    setSort,
    resetSort,
  };
}
