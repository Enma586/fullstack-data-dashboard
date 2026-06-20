import type { ReactNode } from "react";
import styles from "./Table.module.css";

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: T, index: number) => ReactNode;
  align?: "left" | "right" | "center";
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  sortKey?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (key: string) => void;
  emptyMessage?: string;
  className?: string;
}

export function Table<T>({
  columns,
  data,
  sortKey,
  sortDirection,
  onSort,
  emptyMessage = "Sin datos disponibles",
  className = "",
}: TableProps<T>) {
  return (
    <div className={`${styles.tableWrapper} ${className}`.trim()}>
      <table className={styles.table}>
        <thead>
          <tr className={styles.headerRow}>
            {columns.map((col) => {
              const isSortable = col.sortable && onSort;
              const isActive = sortKey === col.key;
              const cellClasses = [
                styles.headerCell,
                isSortable ? styles.headerCellSortable : "",
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <th
                  key={col.key}
                  className={cellClasses}
                  onClick={isSortable ? () => onSort(col.key) : undefined}
                  style={{ textAlign: col.align ?? "left" }}
                >
                  {col.label}
                  {isSortable && (
                    <span
                      className={`${styles.sortIcon} ${isActive ? styles.sortIconActive : ""}`}
                    >
                      {isActive && sortDirection === "asc"
                        ? " ▲"
                        : isActive && sortDirection === "desc"
                          ? " ▼"
                          : " ▾"}
                    </span>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className={styles.emptyState}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={rowIndex} className={styles.bodyRow}>
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={styles.bodyCell}
                    style={{ textAlign: col.align ?? "left" }}
                  >
                    {col.render ? col.render(row, rowIndex) : String((row as Record<string, unknown>)[col.key] ?? "")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
