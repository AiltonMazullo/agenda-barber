/** Campos cadastrais do profissional que mapeiam para o `Employee` do backend. */
export interface ProfessionalBasic {
  name: string;
  appName: string;
  cpf: string;
  birthDate: string; // "yyyy-mm-dd"
  email: string;
  phone: string;
  pixKey: string;
  hasBranchAccess: boolean;
  accessGroupId: string;
  /** Senha de acesso ao painel. Obrigatória na criação; em branco na edição mantém a atual. */
  password: string;
}
