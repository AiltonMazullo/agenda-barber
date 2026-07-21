import { api } from "@/lib/api";
import type {
  AgendamentoReportRow,
  AniversarianteRow,
  CaptacaoRow,
  ClienteAusenteRow,
  ClientePeriodoServicoRow,
  ClienteSemPreferenciaRow,
  ComissaoProdutoRow,
  ComissaoServicoRow,
  FaturamentoDetalheRow,
  FaturamentoVisaoGeral,
  FormaPagamentoRow,
  FrequenciaClienteKpis,
  FrequenciaClienteRow,
  HistoricoVendaProdutoRow,
  MovimentacaoRow,
  NovoClienteRow,
  ReportFilters,
  ReviewRow,
  ServicoVendidoRow,
  SubscriptionReportRow,
  TicketMedioAgendamento,
  TicketMedioClienteRow,
  TicketMedioProfissionalRow,
  VendaItemRow,
  VendaPorOrigemRow,
} from "@/types/report.types";

const base = (barbershopId: string) => `/barbershops/${barbershopId}/reports`;

function params(filters: ReportFilters): Record<string, string | number> {
  const out: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== "") out[key] = value;
  }
  return out;
}

export const reportsService = {
  async vendasPorItem(barbershopId: string, filters: ReportFilters): Promise<VendaItemRow[]> {
    const { data } = await api.get<VendaItemRow[]>(`${base(barbershopId)}/vendas-por-item`, {
      params: params(filters),
    });
    return data;
  },

  async formasPagamento(barbershopId: string, filters: ReportFilters): Promise<FormaPagamentoRow[]> {
    const { data } = await api.get<FormaPagamentoRow[]>(`${base(barbershopId)}/formas-pagamento`, {
      params: params(filters),
    });
    return data;
  },

  async faturamentoVisaoGeral(
    barbershopId: string,
    filters: ReportFilters,
  ): Promise<FaturamentoVisaoGeral> {
    const { data } = await api.get<FaturamentoVisaoGeral>(
      `${base(barbershopId)}/faturamento-visao-geral`,
      { params: params(filters) },
    );
    return data;
  },

  async faturamentoDetalhes(
    barbershopId: string,
    filters: ReportFilters,
  ): Promise<FaturamentoDetalheRow[]> {
    const { data } = await api.get<FaturamentoDetalheRow[]>(
      `${base(barbershopId)}/faturamento-detalhes`,
      { params: params(filters) },
    );
    return data;
  },

  async historicoMovimentacoes(
    barbershopId: string,
    filters: ReportFilters,
  ): Promise<MovimentacaoRow[]> {
    const { data } = await api.get<MovimentacaoRow[]>(
      `${base(barbershopId)}/historico-movimentacoes`,
      { params: params(filters) },
    );
    return data;
  },

  async frequenciaCliente(
    barbershopId: string,
    filters: ReportFilters,
  ): Promise<FrequenciaClienteRow[]> {
    const { data } = await api.get<FrequenciaClienteRow[]>(
      `${base(barbershopId)}/frequencia-cliente`,
      { params: params(filters) },
    );
    return data;
  },

  async frequenciaClienteKpis(
    barbershopId: string,
    filters: ReportFilters,
  ): Promise<FrequenciaClienteKpis> {
    const { data } = await api.get<FrequenciaClienteKpis>(
      `${base(barbershopId)}/frequencia-cliente-kpis`,
      { params: params(filters) },
    );
    return data;
  },

  async clientePorPeriodoServico(
    barbershopId: string,
    filters: ReportFilters,
  ): Promise<ClientePeriodoServicoRow[]> {
    const { data } = await api.get<ClientePeriodoServicoRow[]>(
      `${base(barbershopId)}/cliente-periodo-servico`,
      { params: params(filters) },
    );
    return data;
  },

  async servicosVendidos(barbershopId: string, filters: ReportFilters): Promise<ServicoVendidoRow[]> {
    const { data } = await api.get<ServicoVendidoRow[]>(`${base(barbershopId)}/servicos-vendidos`, {
      params: params(filters),
    });
    return data;
  },

  async historicoAgendamentos(
    barbershopId: string,
    filters: ReportFilters,
  ): Promise<AgendamentoReportRow[]> {
    const { data } = await api.get<AgendamentoReportRow[]>(
      `${base(barbershopId)}/historico-agendamentos`,
      { params: params(filters) },
    );
    return data;
  },

  async historicoVendaProdutos(
    barbershopId: string,
    filters: ReportFilters,
  ): Promise<HistoricoVendaProdutoRow[]> {
    const { data } = await api.get<HistoricoVendaProdutoRow[]>(
      `${base(barbershopId)}/historico-venda-produtos`,
      { params: params(filters) },
    );
    return data;
  },

  async ticketMedioPorProfissional(
    barbershopId: string,
    filters: ReportFilters,
  ): Promise<TicketMedioProfissionalRow[]> {
    const { data } = await api.get<TicketMedioProfissionalRow[]>(
      `${base(barbershopId)}/ticket-medio-profissional`,
      { params: params(filters) },
    );
    return data;
  },

  async ticketMedioAtendimento(
    barbershopId: string,
    filters: ReportFilters,
  ): Promise<TicketMedioProfissionalRow[]> {
    const { data } = await api.get<TicketMedioProfissionalRow[]>(
      `${base(barbershopId)}/ticket-medio-atendimento`,
      { params: params(filters) },
    );
    return data;
  },

  async ticketMedioPorAgendamento(
    barbershopId: string,
    filters: ReportFilters,
  ): Promise<TicketMedioAgendamento> {
    const { data } = await api.get<TicketMedioAgendamento>(
      `${base(barbershopId)}/ticket-medio-por-agendamento`,
      { params: params(filters) },
    );
    return data;
  },

  async ticketMedioClientesDistintos(
    barbershopId: string,
    filters: ReportFilters,
  ): Promise<TicketMedioClienteRow[]> {
    const { data } = await api.get<TicketMedioClienteRow[]>(
      `${base(barbershopId)}/ticket-medio-clientes-distintos`,
      { params: params(filters) },
    );
    return data;
  },

  async ticketMedioCliente(
    barbershopId: string,
    filters: ReportFilters,
  ): Promise<TicketMedioClienteRow[]> {
    const { data } = await api.get<TicketMedioClienteRow[]>(
      `${base(barbershopId)}/ticket-medio-cliente`,
      { params: params(filters) },
    );
    return data;
  },

  async comissoesServicos(barbershopId: string, filters: ReportFilters): Promise<ComissaoServicoRow[]> {
    const { data } = await api.get<ComissaoServicoRow[]>(`${base(barbershopId)}/comissoes-servicos`, {
      params: params(filters),
    });
    return data;
  },

  async comissoesProdutos(barbershopId: string, filters: ReportFilters): Promise<ComissaoProdutoRow[]> {
    const { data } = await api.get<ComissaoProdutoRow[]>(`${base(barbershopId)}/comissoes-produtos`, {
      params: params(filters),
    });
    return data;
  },

  async captacaoClientes(barbershopId: string): Promise<CaptacaoRow[]> {
    const { data } = await api.get<CaptacaoRow[]>(`${base(barbershopId)}/captacao-clientes`);
    return data;
  },

  async novosClientes(barbershopId: string, filters: ReportFilters): Promise<NovoClienteRow[]> {
    const { data } = await api.get<NovoClienteRow[]>(`${base(barbershopId)}/novos-clientes`, {
      params: params(filters),
    });
    return data;
  },

  async clientesAusentes(barbershopId: string, filters: ReportFilters): Promise<ClienteAusenteRow[]> {
    const { data } = await api.get<ClienteAusenteRow[]>(`${base(barbershopId)}/clientes-ausentes`, {
      params: params(filters),
    });
    return data;
  },

  async aniversariantes(barbershopId: string, filters: ReportFilters): Promise<AniversarianteRow[]> {
    const { data } = await api.get<AniversarianteRow[]>(`${base(barbershopId)}/aniversariantes`, {
      params: params(filters),
    });
    return data;
  },

  async clientesSemPreferencia(barbershopId: string): Promise<ClienteSemPreferenciaRow[]> {
    const { data } = await api.get<ClienteSemPreferenciaRow[]>(
      `${base(barbershopId)}/clientes-sem-preferencia`,
    );
    return data;
  },

  async assinantes(barbershopId: string, filters: ReportFilters): Promise<SubscriptionReportRow[]> {
    const { data } = await api.get<SubscriptionReportRow[]>(`${base(barbershopId)}/assinantes`, {
      params: params(filters),
    });
    return data;
  },

  async assinaturasCanceladas(
    barbershopId: string,
    filters: ReportFilters,
  ): Promise<SubscriptionReportRow[]> {
    const { data } = await api.get<SubscriptionReportRow[]>(
      `${base(barbershopId)}/assinaturas-canceladas`,
      { params: params(filters) },
    );
    return data;
  },

  async assinaturasNovas(
    barbershopId: string,
    filters: ReportFilters,
  ): Promise<SubscriptionReportRow[]> {
    const { data } = await api.get<SubscriptionReportRow[]>(`${base(barbershopId)}/assinaturas-novas`, {
      params: params(filters),
    });
    return data;
  },

  async assinaturasPorOrigem(
    barbershopId: string,
    filters: ReportFilters,
  ): Promise<VendaPorOrigemRow[]> {
    const { data } = await api.get<VendaPorOrigemRow[]>(
      `${base(barbershopId)}/assinaturas-por-origem`,
      { params: params(filters) },
    );
    return data;
  },

  async avaliacoes(barbershopId: string, filters: ReportFilters): Promise<ReviewRow[]> {
    const { data } = await api.get<ReviewRow[]>(`/barbershops/${barbershopId}/reviews`, {
      params: params(filters),
    });
    return data;
  },
};
