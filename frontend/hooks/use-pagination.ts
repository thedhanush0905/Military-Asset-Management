import { useState, useMemo } from "react";

export function usePagination(initialPage = 1, initialLimit = 10) {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  return useMemo(() => ({
    page,
    setPage,
    limit,
    setLimit,
  }), [page, limit]);
}
