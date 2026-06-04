"use client";

import { useState, useMemo } from "react";

export const PAGE_SIZE_OPTIONS = [10, 25, 50, 75, 100] as const;
export type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];

export function usePagination<T>(items: T[], defaultPageSize: PageSize = 10) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(defaultPageSize);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const paged = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, safePage, pageSize]);

  // Aliases para compatibilidade com código legado que usa `pageItems`.
  const pageItems = paged;

  const from = items.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const to = Math.min(safePage * pageSize, items.length);

  function goTo(p: number) {
    setPage(Math.max(1, Math.min(p, totalPages)));
  }

  function changePageSize(size: number) {
    setPageSize(size as PageSize);
    setPage(1);
  }

  return {
    paged,
    pageItems,
    page: safePage,
    pageSize,
    totalPages,
    total: items.length,
    from,
    to,
    goTo,
    changePageSize,
    // aliases para código legado
    setPage: goTo,
    setPageSize: changePageSize,
    hasPrev: safePage > 1,
    hasNext: safePage < totalPages,
  };
}
