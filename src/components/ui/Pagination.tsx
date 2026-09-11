export interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  noun?: string;
}

/** Replaces the inert Previous/Next footers the tables shipped with. */
export default function Pagination({ page, pageSize, total, onPageChange, noun = "items" }: PaginationProps) {
  const lastPage = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="p-4 border-t border-gray-50 flex justify-between items-center text-[10px] font-bold text-gray-400">
      <span>{from} – {to} of {total} {noun}</span>
      <div className="flex gap-4">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="hover:text-slate-900 disabled:opacity-30 disabled:hover:text-gray-400 uppercase tracking-widest transition-colors"
        >
          ← Previous
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= lastPage}
          className="hover:text-slate-900 disabled:opacity-30 disabled:hover:text-gray-400 uppercase tracking-widest transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
