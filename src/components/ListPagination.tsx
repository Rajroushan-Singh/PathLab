import { ChevronLeft, ChevronRight } from "lucide-react";
import { getPageNumbers, PaginationMeta } from "@/lib/pagination";

interface ListPaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  itemLabel?: string;
}

const ListPagination = ({ meta, onPageChange, itemLabel = "items" }: ListPaginationProps) => {
  if (meta.totalPages <= 1) return null;

  const pageNumbers = getPageNumbers(meta.currentPage, meta.totalPages);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <p className="text-xs text-muted-foreground">
        Showing {meta.rangeStart} to {meta.rangeEnd} of {meta.count} {itemLabel}
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(meta.currentPage - 1)}
          disabled={!meta.hasPrevious}
          className="p-2 rounded-lg border border-border hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {pageNumbers.map((item, index) =>
          item === "ellipsis" ? (
            <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              className={`min-w-8 h-8 px-2 rounded-lg text-xs font-medium transition-all ${
                item === meta.currentPage
                  ? "bg-primary text-primary-foreground"
                  : "border border-border hover:bg-secondary"
              }`}
            >
              {item}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => onPageChange(meta.currentPage + 1)}
          disabled={!meta.hasNext}
          className="p-2 rounded-lg border border-border hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ListPagination;
