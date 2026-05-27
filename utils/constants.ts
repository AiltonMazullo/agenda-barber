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
