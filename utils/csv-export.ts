/**
 * Exporta um array de objetos como arquivo CSV baixado no browser.
 * Uso client-side apenas — não depende de nenhum endpoint de export no backend.
 */
export function exportToCsv<T extends Record<string, unknown>>(
  filename: string,
  rows: T[],
  columns: { key: keyof T; label: string }[],
): void {
  const escapeCell = (value: unknown): string => {
    if (value === null || value === undefined) return "";
    const str = String(value);
    if (/[",\n;]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const header = columns.map((col) => escapeCell(col.label)).join(";");
  const body = rows
    .map((row) => columns.map((col) => escapeCell(row[col.key])).join(";"))
    .join("\n");
  const csvContent = `${header}\n${body}`;

  const blob = new Blob([`﻿${csvContent}`], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
