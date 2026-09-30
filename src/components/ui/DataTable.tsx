import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type Column<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
};

/** Accessible dark data table with caption + scoped headers. */
export function DataTable<T extends { id: string }>({
  caption,
  columns,
  rows,
  className,
}: {
  caption: string;
  columns: Array<Column<T>>;
  rows: T[];
  className?: string;
}) {
  return (
    <div className={cn("overflow-x-auto rounded-xl border border-white/10", className)}>
      <table className="w-full border-collapse text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="bg-white/[0.04] font-mono text-xs uppercase tracking-wider text-zinc-400">
            {columns.map((col) => (
              <th key={col.key} scope="col" className={cn("px-4 py-3 font-medium", col.className)}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10 text-zinc-200">
          {rows.map((row) => (
            <tr key={row.id} className="transition-colors hover:bg-white/[0.03]">
              {columns.map((col) => (
                <td key={col.key} className={cn("px-4 py-3", col.className)}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
