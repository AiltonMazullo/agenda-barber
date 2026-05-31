/**
 * Constantes compartilhadas de domínio.
 */

/** Unidades federativas do Brasil (siglas de 2 letras). */
export const UF_OPTIONS = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
] as const;

export type UF = (typeof UF_OPTIONS)[number];

/** Opções de "Como conheceu a barbearia" — backend recebe a string escolhida. */
export const HOW_MET_OPTIONS = [
  "Instagram",
  "Indicação de amigo",
  "Google",
  "Passei em frente",
  "Facebook",
  "TikTok",
  "Outro",
] as const;

export type HowMet = (typeof HOW_MET_OPTIONS)[number];

/**
 * Módulos do sistema usados nas permissões dos grupos de acesso.
 * A `key` é enviada ao backend no campo `module`; o `label` é exibido na UI.
 */
export const ACCESS_MODULES = [
  { key: "appointments", label: "Agenda" },
  { key: "clients", label: "Clientes" },
  { key: "employees", label: "Profissionais" },
  { key: "services", label: "Serviços" },
  { key: "branches", label: "Filiais" },
  { key: "products", label: "Estoque" },
  { key: "cash-registers", label: "Caixa" },
  { key: "reports", label: "Relatórios" },
  { key: "access-groups", label: "Grupos de acesso" },
  { key: "payment-data", label: "Pagamento" },
] as const;

export type AccessModuleKey = (typeof ACCESS_MODULES)[number]["key"];
