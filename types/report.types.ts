export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  branchId?: string;
  employeeId?: string;
  categoryId?: string;
  serviceId?: string;
  productId?: string;
  planId?: string;
  diasSemVisita?: number;
  groupBy?: "origin" | "vendedor";
}

interface RefLite {
  id: string;
  name: string;
}

export interface VendaItemRow {
  itemId: string;
  comandaId: string;
  comandaNumero: number;
  data: string | null;
  tipo: "PRODUTO" | "SERVICO";
  nome: string;
  categoriaNome: string | null;
  quantidade: number;
  valorUnitarioInCents: number;
  totalInCents: number;
  filial: RefLite | null;
  profissional: RefLite | null;
}

export interface FormaPagamentoRow {
  formaPagamento: string;
  quantidade: number;
  totalInCents: number;
}

export interface FaturamentoVisaoGeral {
  porMes: { mes: string; comandasInCents: number; assinaturasInCents: number }[];
  totalComandasInCents: number;
  totalAssinaturasInCents: number;
  totalAssinaturaGatewayInCents: number;
  totalAssinaturaManualInCents: number;
  totalGeralInCents: number;
  quantidadeComandas: number;
  quantidadeAssinaturasAtivas: number;
}

export interface FaturamentoDetalheRow {
  comandaId: string;
  comandaNumero: number;
  data: string | null;
  cliente: string;
  profissional: string | null;
  tipo: "AGENDAMENTO" | "AVULSA";
  formaPagamento: string | null;
  valorInCents: number;
}

export interface MovimentacaoRow {
  tipo: "VENDA";
  data: string | null;
  cliente: string;
  profissional: string | null;
  operacao: string;
  formaPagamento: string | null;
  valorInCents: number;
}

export interface FrequenciaClienteRow {
  clientId: string;
  name: string;
  visitas: number;
  ultimaVisita: string | null;
  proximaVisita: string | null;
}

export interface FrequenciaClienteKpis {
  totalClientes: number;
  totalVisitas: number;
  comAgendaFutura: number;
  semAgendaFutura: number;
  recorrentes: number;
  taxaMedia: number;
}

export interface ClientePeriodoServicoRow {
  serviceId: string;
  nome: string;
  clientesComClube: number;
  clientesSemClube: number;
}

export interface ServicoVendidoRow {
  serviceId: string;
  nome: string;
  hex: string | null;
  priceInCents: number;
  quantidade: number;
  faturamentoInCents: number;
}

export interface AgendamentoReportRow {
  id: string;
  scheduledAt: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  clientId: string;
  serviceId: string;
  employeeId: string | null;
  client: { id: string; name: string; email: string; phone: string | null };
  service: { id: string; name: string; priceInCents: number; categoryId: string | null; hex: string | null };
  employee: { id: string; name: string; branchId: string } | null;
}

export interface HistoricoVendaProdutoRow {
  itemId: string;
  data: string | null;
  cliente: string;
  profissional: string | null;
  produto: string;
  categoria: string | null;
  quantidade: number;
  valorUnitarioInCents: number;
  totalInCents: number;
}

export interface TicketMedioProfissionalRow {
  employeeId: string | null;
  nome: string;
  atendimentos: number;
  totalInCents: number;
  ticketMedioInCents: number;
}

export interface TicketMedioClienteRow {
  clientId: string;
  nome: string;
  atendimentos: number;
  totalInCents: number;
  ticketMedioInCents: number;
}

export interface TicketMedioAgendamento {
  faturamentoInCents: number;
  quantidadeAtendimentos: number;
  ticketMedioInCents: number;
}

export interface ComissaoServicoRow {
  employeeId: string | null;
  profissional: string | null;
  servico: string;
  data: string;
  comClube: boolean;
  valorInCents: number;
  commissionPercent: number;
  comissaoInCents: number;
}

export interface ComissaoProdutoRow {
  itemId: string;
  data: string | null;
  profissional: string | null;
  produto: string;
  categoria: string | null;
  quantidade: number;
  totalInCents: number;
  commissionPercent: number | null;
  comissaoInCents: number;
}

export interface CaptacaoRow {
  origem: string;
  total: number;
  clientes: RefLite[];
}

export interface NovoClienteRow {
  clientId: string;
  nome: string;
  email: string;
  telefone: string | null;
  profissional: string | null;
  primeiraVisita: string;
}

export interface ClienteAusenteRow {
  id: string;
  nome: string;
  email: string;
  ultimaVisita: string | null;
  temAgendaFutura: boolean;
}

export interface AniversarianteRow {
  id: string;
  nome: string;
  telefone: string | null;
  email: string;
  dataNascimento: string;
}

export interface ClienteSemPreferenciaRow {
  id: string;
  nome: string;
  email: string;
  atendimentos: number;
}

export interface SubscriptionReportRow {
  id: string;
  clientId: string;
  planId: string;
  status: "ACTIVE" | "CANCELLED";
  startedAt: string;
  cancelledAt: string | null;
  origin: string | null;
  cancelReason: string | null;
  client: { id: string; name: string; email: string; phone: string | null };
  plan: { id: string; name: string; priceInCents: number };
}

export interface VendaPorOrigemRow {
  origem: string;
  quantidade: number;
  totalInCents: number;
  clientes: RefLite[];
}

export interface ReviewRow {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  client: { id: string; name: string };
  employee: { id: string; name: string } | null;
}

export interface AlteracaoAssinaturaRow {
  id: string;
  data: string;
  assinaturaId: string;
  cliente: { id: string; name: string } | null;
  acao: string;
  campoAlterado: string;
  valorAnterior: string | null;
  valorNovo: string | null;
  responsavel: string;
}

export interface TransacaoAssinaturaRow {
  id: string;
  subscriptionId: string;
  cliente: { id: string; name: string; email: string; phone: string | null };
  plano: { id: string; name: string; priceInCents: number };
  dataVencimento: string;
  dataPagamento: string | null;
  status: "PENDING" | "PAID" | "OVERDUE" | "FAILED";
  valorInCents: number;
  gatewayChargeId: string | null;
  gatewayProvider: string | null;
}

export interface ListaEsperaPlanoRow {
  id: string;
  data: string;
  cliente: { id: string; name: string; email: string; phone: string | null } | null;
  plano: { id: string; name: string } | null;
}

export interface DocumentoProfissionalRow {
  id: string;
  data: string;
  profissional: { id: string; name: string } | null;
  nome: string;
  fileUrl: string;
}
