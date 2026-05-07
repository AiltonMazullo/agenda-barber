/**
 * Helpers genéricos para serialização e parse de CSV.
 * Suporta valores com vírgula, aspas e quebras de linha.
 */

/** Escapa um valor para CSV — envolve em aspas se contiver `,`, `"` ou `\n`. */
function escapeCSVValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Converte um array de objetos em string CSV com header.
 *
 * @param rows - lista de registros (objetos com chaves uniformes)
 * @param headers - colunas a exportar; se omitido, usa as chaves do primeiro registro
 */
export function toCSV<T extends Record<string, unknown>>(
  rows: T[],
  headers?: Array<keyof T>,
): string {
  if (rows.length === 0) return "";
  const cols = headers ?? (Object.keys(rows[0]) as Array<keyof T>);
  const headerLine = cols.map((c) => escapeCSVValue(c)).join(",");
  const lines = rows.map((row) =>
    cols.map((c) => escapeCSVValue(row[c])).join(","),
  );
  return [headerLine, ...lines].join("\n");
}

/**
 * Faz parse de uma string CSV em array de objetos.
 * A primeira linha é tratada como header.
 */
export function fromCSV(text: string): Record<string, string>[] {
  const lines = splitCSVLines(text);
  if (lines.length < 2) return [];
  const headers = parseCSVRow(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCSVRow(line);
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => {
      obj[h] = values[i] ?? "";
    });
    return obj;
  });
}

/** Quebra texto CSV em linhas, respeitando aspas com `\n` interno. */
function splitCSVLines(text: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
      current += ch;
    } else if ((ch === "\n" || ch === "\r") && !inQuotes) {
      if (current.length > 0) {
        result.push(current);
        current = "";
      }
      if (ch === "\r" && text[i + 1] === "\n") i++;
    } else {
      current += ch;
    }
  }
  if (current.length > 0) result.push(current);
  return result;
}

/** Faz parse de uma linha CSV em array de campos. */
function parseCSVRow(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

/** Dispara download de uma string CSV com o nome de arquivo informado. */
export function downloadCSV(filename: string, csv: string): void {
  if (typeof window === "undefined") return;
  const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
