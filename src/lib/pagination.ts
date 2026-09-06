export interface PaginatedResponse<T = unknown> {
  count: number;
  total_pages?: number;
  current_page?: number;
  next?: string | null;
  previous?: string | null;
  results: T[];
}

export interface PaginationMeta {
  count: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  rangeStart: number;
  rangeEnd: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export function getPaginationMeta(
  data: PaginatedResponse | undefined,
  requestedPage: number,
  resultsCount: number,
  defaultPageSize = 10
): PaginationMeta {
  const count = data?.count ?? 0;
  const apiTotalPages = data?.total_pages;
  const currentPage = data?.current_page ?? requestedPage;

  let pageSize = defaultPageSize;
  if (apiTotalPages && apiTotalPages > 0 && count > 0) {
    pageSize = Math.ceil(count / apiTotalPages);
  } else if (resultsCount > 0 && currentPage === 1 && !data?.next) {
    pageSize = resultsCount;
  }

  const totalPages =
    apiTotalPages ?? (count > 0 ? Math.max(1, Math.ceil(count / pageSize)) : 1);

  const rangeStart = count === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = count === 0 ? 0 : Math.min(currentPage * pageSize, count);

  return {
    count,
    totalPages,
    currentPage,
    pageSize,
    rangeStart,
    rangeEnd,
    hasNext: Boolean(data?.next) || currentPage < totalPages,
    hasPrevious: Boolean(data?.previous) || currentPage > 1,
  };
}

export function getPageNumbers(currentPage: number, totalPages: number): (number | "ellipsis")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | "ellipsis")[] = [1];
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  if (start > 2) pages.push("ellipsis");
  for (let p = start; p <= end; p++) pages.push(p);
  if (end < totalPages - 1) pages.push("ellipsis");
  pages.push(totalPages);

  return pages;
}
