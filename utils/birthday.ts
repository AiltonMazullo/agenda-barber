/** Início (segunda 00:00) e fim (domingo 23:59:59.999) da semana vigente. */
export function currentWeekRange(ref: Date = new Date()): {
  start: Date;
  end: Date;
} {
  const start = new Date(ref);
  const day = start.getDay(); // 0=domingo … 6=sábado
  const diffToMonday = (day + 6) % 7; // domingo → 6, segunda → 0, …
  start.setDate(start.getDate() - diffToMonday);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

/** True se o aniversário (mês/dia) cai na semana vigente (segunda a domingo). */
export function isBirthdayInCurrentWeek(
  birthDate: string | null | undefined,
  ref: Date = new Date(),
): boolean {
  if (!birthDate) return false;
  const b = new Date(birthDate);
  if (Number.isNaN(b.getTime())) return false;

  const { start } = currentWeekRange(ref);
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    if (d.getMonth() === b.getMonth() && d.getDate() === b.getDate()) {
      return true;
    }
  }
  return false;
}
