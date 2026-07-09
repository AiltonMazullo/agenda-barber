/** "YYYY-MM-DD" (fuso local) ↔ Date, usado pelo formulário de feriado. */
export function dateToIsoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export function isoDateToDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

/** Formata "YYYY-MM-DD" como dd/mm/aaaa (sem fuso). */
export function formatIsoDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

/** Sentinela usado no select de filial para representar "todas as filiais". */
export const ALL_BRANCHES_VALUE = "all";
