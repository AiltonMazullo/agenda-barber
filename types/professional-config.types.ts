/**
 * Configuração estendida do profissional — camada **local** (localStorage).
 *
 * O modelo `Employee` do backend só guarda dados cadastrais básicos
 * (nome, contato, pix, endereço, grupo de acesso, filial). Toda a configuração
 * rica do "Cadastro do Profissional" (foto, contrato, periodicidade,
 * permissões, serviços + comissão, horários, intervalos, folgas e regras de
 * comissão) não existe no backend e é persistida no frontend por profissional.
 */

export type ProfessionalType = "admin" | "profissional";

/** Serviço que o profissional realiza + comissão (%) específica. */
export interface ServiceCommission {
  serviceId: string;
  commissionPercent: number;
}

/** Horário de atendimento por dia da semana (0=domingo … 6=sábado). */
export interface WorkingHour {
  day: number;
  enabled: boolean;
  start: string; // "08:00"
  end: string; // "18:00"
}

/** Intervalo (almoço/outros) por dia da semana. */
export interface ProfessionalInterval {
  id: string;
  day: number;
  start: string;
  end: string;
}

/** Período de folga. */
export interface TimeOff {
  id: string;
  start: string; // ISO date "2025-06-22"
  end: string;
}

/** (a) Comissões sobre produtos: uma regra independente por linha (categoria + valor mínimo + comissão). */
export interface ProductCommissionRuleItem {
  id: string;
  category: string; // "" = todas as categorias
  minSaleValue: number;
  percent: number;
}

export type ProductCommissionRule = ProductCommissionRuleItem[];

/** (b) Adicional de comissão diferenciada (assinantes). */
export interface DifferentiatedCommission {
  additionalPercent: number;
  subscriberPercent: number;
}

export interface ProfessionalConfig {
  type: ProfessionalType;
  active: boolean;
  hidden: boolean;
  photoDataUrl: string | null;
  emergencyContactName: string;
  emergencyContactPhone: string;
  contractFileName: string | null;
  attendancePeriodDays: number | null;
  defaultBonusInCents: number | null;
  defaultValeInCents: number | null;
  services: ServiceCommission[];
  workingHours: WorkingHour[];
  intervals: ProfessionalInterval[];
  timeOff: TimeOff[];
  productCommission: ProductCommissionRule;
  differentiated: DifferentiatedCommission;
  /**
   * Permissões do profissional (tipo "com agenda"), como `key`s do catálogo
   * de permissões — ver `PermissoesProfissional`. A fonte de verdade real é
   * sempre o `AccessGroup` pessoal do profissional (`Employee.accessGroupId`);
   * este campo só existe pra alimentar o checklist na tela, é recalculado a
   * partir do grupo real a cada carregamento (nunca vem só do localStorage).
   */
  permissions: string[];
}

export function defaultWorkingHours(): WorkingHour[] {
  // Segunda a sábado habilitados 08:00–18:00; domingo desabilitado.
  return [0, 1, 2, 3, 4, 5, 6].map((day) => ({
    day,
    enabled: day !== 0,
    start: "08:00",
    end: "18:00",
  }));
}

export function defaultProfessionalConfig(): ProfessionalConfig {
  return {
    type: "profissional",
    active: true,
    hidden: false,
    photoDataUrl: null,
    emergencyContactName: "",
    emergencyContactPhone: "",
    contractFileName: null,
    attendancePeriodDays: null,
    defaultBonusInCents: null,
    defaultValeInCents: null,
    services: [],
    workingHours: defaultWorkingHours(),
    intervals: [],
    timeOff: [],
    productCommission: [],
    differentiated: { additionalPercent: 0, subscriberPercent: 0 },
    permissions: [],
  };
}
