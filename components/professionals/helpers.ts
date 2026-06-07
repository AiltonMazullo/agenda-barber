import type { ProfessionalPermissions } from "@/types/professional-config.types";

/** Dias da semana na ordem de exibição (segunda → domingo). */
export const WEEKDAYS: { value: number; label: string }[] = [
  { value: 1, label: "Segunda-feira" },
  { value: 2, label: "Terça-feira" },
  { value: 3, label: "Quarta-feira" },
  { value: 4, label: "Quinta-feira" },
  { value: 5, label: "Sexta-feira" },
  { value: 6, label: "Sábado" },
  { value: 0, label: "Domingo" },
];

export const DAY_LABEL: Record<number, string> = Object.fromEntries(
  WEEKDAYS.map((d) => [d.value, d.label]),
);

/** Itens de permissão do sistema (item #7), na ordem da imagem. */
export const PERMISSION_ITEMS: {
  key: keyof ProfessionalPermissions;
  label: string;
}[] = [
  { key: "cadastroAgendamento", label: "Cadastro de agendamento" },
  { key: "edicaoAgendamento", label: "Edição de agendamento" },
  { key: "gerenciarProdutosComanda", label: "Gerenciar produtos na comanda" },
  { key: "gerenciarServicosComanda", label: "Gerenciar serviços na comanda" },
  { key: "bloquearHorario", label: "Bloquear horário" },
  { key: "removerFolgas", label: "Remoção de folgas" },
  { key: "edicaoNotas", label: "Edição de notas" },
];

/** Opções de horário (30 em 30 min), de 06:00 a 23:00. */
export const TIME_OPTIONS: string[] = (() => {
  const out: string[] = [];
  for (let h = 6; h <= 23; h++) {
    out.push(`${String(h).padStart(2, "0")}:00`);
    if (h < 23) out.push(`${String(h).padStart(2, "0")}:30`);
  }
  return out;
})();

/** Opções de periodicidade de atendimento (dias). */
export const PERIOD_OPTIONS: { value: string; label: string }[] = [
  { value: "7", label: "7 dias" },
  { value: "14", label: "14 dias" },
  { value: "15", label: "15 dias" },
  { value: "21", label: "21 dias" },
  { value: "30", label: "30 dias" },
  { value: "45", label: "45 dias" },
  { value: "60", label: "60 dias" },
];

/** Formata uma data ISO "yyyy-mm-dd" como dd/mm/aaaa (sem fuso). */
export function formatIsoDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

/** Hoje em ISO "yyyy-mm-dd" (local). */
export function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}
