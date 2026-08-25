"use client";

import { useCallback, useMemo, useState } from "react";
import { useAppointments } from "@/hooks/useAppointments";
import { useBranches } from "@/hooks/useBranches";
import { useCategories } from "@/hooks/useCategories";
import { useClients } from "@/hooks/useClients";
import { useEmployees } from "@/hooks/useEmployees";
import { useProducts } from "@/hooks/useProducts";
import { useServices } from "@/hooks/useServices";
import { subscriptionsService } from "@/services/subscriptions.service";
import { comandaTotalInCents } from "@/utils/comanda";
import { formatDate, formatTime, toWallClockDate } from "@/utils/format";
import type { Appointment } from "@/types/appointment.types";
import type {
  Comanda,
  ComandaAgendamento,
  ComandaDraft,
  ComandaFormaPagamento,
  ComandaItem,
  ComandaItemTipo,
  ComandaTipo,
} from "@/types/orders.types";
import type { SelectOption } from "@/types/common.types";

/** Item do catálogo (produto ou serviço) normalizado para os pickers. */
export interface CatalogoOption {
  id: string;
  nome: string;
  categoriaId: string | null;
  categoriaNome: string | null;
  valorInCents: number;
}

export interface NovoItemInput {
  tipo: ComandaItemTipo;
  refId: string;
  appointmentId: string | null;
  quantidade: number;
  valorUnitarioInCents: number;
}

/** Todas as categorias cadastradas (não só as usadas por algum produto/serviço), ordenadas. */
function toOptions(categories: { id: string; name: string }[]): SelectOption<string>[] {
  return [...categories]
    .map((c) => ({ value: c.id, label: c.name }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

/**
 * Estado e regras do formulário de comanda (criação e edição).
 *
 * Compõe os hooks reais de agendamentos/produtos/serviços/clientes/filiais e
 * expõe apenas o que a UI precisa: opções para os selects, a composição
 * atual (agendamentos vinculados, itens, cada um podendo apontar direto para
 * um agendamento vinculado) e as ações com validação. Nenhuma regra fica no
 * JSX.
 */
export function useComandaForm(
  barbershopId: string | undefined,
  comanda?: Comanda,
) {
  const { appointments, isLoading: loadingAppointments } =
    useAppointments(barbershopId);
  const { employees } = useEmployees(barbershopId);
  const { products, isLoading: loadingProducts } = useProducts(barbershopId);
  const { services, isLoading: loadingServices } = useServices(barbershopId);
  const { clients } = useClients(barbershopId);
  const { branches } = useBranches(barbershopId);
  const { categories: categoriasProdutosRaw } = useCategories(
    barbershopId,
    "PRODUTO",
  );
  const { categories: categoriasServicosRaw } = useCategories(
    barbershopId,
    "SERVICO",
  );

  const [tipo, setTipoState] = useState<ComandaTipo>(
    comanda?.tipo ?? "AGENDAMENTO",
  );
  const [linkedAppointmentIds, setLinkedAppointmentIds] = useState<string[]>(
    comanda?.agendamentos.map((a) => a.appointmentId) ?? [],
  );
  const [clienteId, setClienteId] = useState("");
  const [branchId, setBranchId] = useState(comanda?.branchId ?? "");
  const [employeeId, setEmployeeId] = useState(comanda?.employeeId ?? "");
  const [itens, setItens] = useState<ComandaItem[]>(comanda?.itens ?? []);
  const [observacoes, setObservacoes] = useState(comanda?.observacoes ?? "");
  const [formaPagamento, setFormaPagamento] = useState<ComandaFormaPagamento | "">(
    comanda?.formaPagamento ?? "",
  );
  const [erro, setErro] = useState<string | null>(null);

  /** Comanda travada para edição — só permite reabrir, não editar diretamente. */
  const isLocked = comanda != null && comanda.status !== "ABERTA";

  const isLoadingCatalog =
    loadingAppointments || loadingProducts || loadingServices;

  // ─── Agendamentos (vêm direto do backend, um seletor por item) ─────────────
  const employeeNameById = useMemo(() => {
    const m = new Map<string, string>();
    employees.forEach((e) => m.set(e.id, e.appName || e.name));
    return m;
  }, [employees]);

  const toSnapshot = useCallback(
    (a: Appointment): ComandaAgendamento => ({
      appointmentId: a.id,
      clienteNome: a.client?.name ?? "Cliente",
      servicoNome: a.service?.name ?? "Serviço",
      profissionalNome:
        employeeNameById.get(a.employeeId ?? a.employee?.id ?? "") ??
        a.employee?.appName ??
        a.employee?.name ??
        null,
      scheduledAt: a.scheduledAt,
    }),
    [employeeNameById],
  );

  /** Agendamentos reais da barbearia disponíveis para atrelar à comanda (exclui cancelados). */
  const agendamentoOptions = useMemo<SelectOption<string>[]>(
    () =>
      appointments
        .filter((a) => a.status !== "CANCELLED")
        .sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt))
        .map((a) => ({
          value: a.id,
          label: `${a.client?.name ?? "Cliente"} · ${a.service?.name ?? "Serviço"} · ${formatDate(
            toWallClockDate(a.scheduledAt),
            { day: "2-digit", month: "2-digit" },
          )} ${formatTime(toWallClockDate(a.scheduledAt))}`,
        })),
    [appointments],
  );

  /** Agendamentos já vinculados a esta comanda — únicos que os itens podem referenciar. */
  const linkedOptions = useMemo<SelectOption<string>[]>(
    () => agendamentoOptions.filter((o) => linkedAppointmentIds.includes(o.value)),
    [agendamentoOptions, linkedAppointmentIds],
  );

  /**
   * Profissional de um item da comanda — resolve pelo agendamento vinculado
   * (`appointmentId`) e cai pro profissional responsável da comanda quando o
   * item não está atrelado a um agendamento específico (AVULSA). Usado pra
   * listar o profissional em cada linha de `ItensSection` (mesmo padrão de
   * `DialogFecharComanda`).
   *
   * Prioriza o snapshot persistido em `comanda.agendamentos[].profissionalNome`
   * (mesma fonte que `DialogFecharComanda` usa) — o lookup ao vivo em
   * `appointments` só serve de fallback para agendamentos recém-vinculados
   * nesta sessão, que ainda não têm snapshot. Sem essa prioridade, a tela de
   * editar/ver comanda ficava sem mostrar o profissional sempre que o
   * agendamento ao vivo não era encontrado (ex.: cancelado/alterado depois),
   * exatamente o cenário que o snapshot existe para blindar.
   */
  const profissionalResponsavel = useMemo(
    () => (comanda?.employeeId ? (employeeNameById.get(comanda.employeeId) ?? null) : null),
    [comanda, employeeNameById],
  );
  const profissionalSnapshotByAppointment = useMemo(() => {
    const m = new Map<string, string | null>();
    comanda?.agendamentos.forEach((a) => m.set(a.appointmentId, a.profissionalNome));
    return m;
  }, [comanda]);
  const resolveItemProfissional = useCallback(
    (appointmentId: string | null) => {
      if (appointmentId) {
        const snapshot = profissionalSnapshotByAppointment.get(appointmentId);
        if (snapshot) return snapshot;
        const appointment = appointments.find((a) => a.id === appointmentId);
        const empId = appointment?.employeeId ?? appointment?.employee?.id ?? "";
        const nome =
          employeeNameById.get(empId) ??
          appointment?.employee?.appName ??
          appointment?.employee?.name ??
          null;
        if (nome) return nome;
      }
      return profissionalResponsavel;
    },
    [appointments, employeeNameById, profissionalResponsavel, profissionalSnapshotByAppointment],
  );

  /**
   * Agendamentos ainda não vinculados, disponíveis para adicionar — ver
   * spec-revisao-cliente-1.md §6.2. Restrito ao mesmo dia e ao mesmo cliente
   * do primeiro agendamento já vinculado (o que originou a comanda),
   * priorizando o caso de uso "pai + filho, dois profissionais" — sem
   * agendamento algum vinculado ainda, não há o que restringir.
   */
  const availableToLinkOptions = useMemo<SelectOption<string>[]>(() => {
    const notLinked = agendamentoOptions.filter(
      (o) => !linkedAppointmentIds.includes(o.value),
    );
    const seed = appointments.find((a) => a.id === linkedAppointmentIds[0]);
    if (!seed) return notLinked;
    const seedDay = toWallClockDate(seed.scheduledAt).toDateString();
    const sameDayClientIds = new Set(
      appointments
        .filter(
          (a) =>
            a.clientId === seed.clientId &&
            toWallClockDate(a.scheduledAt).toDateString() === seedDay,
        )
        .map((a) => a.id),
    );
    return notLinked.filter((o) => sameDayClientIds.has(o.value));
  }, [agendamentoOptions, linkedAppointmentIds, appointments]);

  const addLinkedAppointment = useCallback(
    (appointmentId: string) => {
      if (isLocked) return;
      setLinkedAppointmentIds((prev) =>
        prev.includes(appointmentId) ? prev : [...prev, appointmentId],
      );
    },
    [isLocked],
  );

  /** Remove o vínculo e também os itens que apontavam para aquele agendamento. */
  const removeLinkedAppointment = useCallback(
    (appointmentId: string) => {
      if (isLocked) return;
      setLinkedAppointmentIds((prev) => prev.filter((id) => id !== appointmentId));
      setItens((prev) => prev.filter((i) => i.appointmentId !== appointmentId));
    },
    [isLocked],
  );

  const clienteOptions = useMemo<SelectOption<string>[]>(
    () => clients.map((c) => ({ value: c.id, label: c.name })),
    [clients],
  );

  const branchOptions = useMemo<SelectOption<string>[]>(
    () => branches.map((b) => ({ value: b.id, label: b.name })),
    [branches],
  );

  const employeeOptions = useMemo<SelectOption<string>[]>(
    () => employees.map((e) => ({ value: e.id, label: e.appName || e.name })),
    [employees],
  );

  // ─── Tipo da comanda ────────────────────────────────────────────────────────
  /** Há composição que seria perdida ao trocar o tipo? (a UI confirma antes) */
  const hasComposicao = itens.length > 0 || linkedAppointmentIds.length > 0;

  /** Troca o tipo zerando itens e agendamentos vinculados — os vínculos deixam de fazer sentido. */
  const setTipo = useCallback(
    (next: ComandaTipo) => {
      if (isLocked) return;
      setTipoState(next);
      setItens([]);
      setLinkedAppointmentIds([]);
      setErro(null);
    },
    [isLocked],
  );

  // ─── Catálogo ───────────────────────────────────────────────────────────────
  const produtos = useMemo<CatalogoOption[]>(
    () =>
      products
        .filter((p) => p.status === "ACTIVE")
        .map((p) => ({
          id: p.id,
          nome: p.name,
          categoriaId: p.category?.id ?? null,
          categoriaNome: p.category?.name ?? null,
          valorInCents: p.priceInCents,
        })),
    [products],
  );

  const servicos = useMemo<CatalogoOption[]>(
    () =>
      services.map((s) => ({
        id: s.id,
        nome: s.name,
        categoriaId: s.category?.id ?? null,
        categoriaNome: s.category?.name ?? null,
        valorInCents: s.priceInCents,
      })),
    [services],
  );

  const categoriasProdutos = useMemo(
    () => toOptions(categoriasProdutosRaw),
    [categoriasProdutosRaw],
  );
  const categoriasServicos = useMemo(
    () => toOptions(categoriasServicosRaw),
    [categoriasServicosRaw],
  );

  // ─── Itens ──────────────────────────────────────────────────────────────────
  /**
   * Preço de um item de serviço vinculado a agendamento: se o cliente do
   * agendamento tiver assinatura ativa cobrindo o serviço, sobrescreve pelo
   * valor calculado (grátis dentro da cota mensal, com desconto depois dela)
   * em vez do preço cheio do catálogo — único ponto de cobrança de serviço
   * do sistema é a Comanda, não há preço por agendamento.
   */
  const resolveServicoPrice = useCallback(
    async (input: NovoItemInput): Promise<number> => {
      const ref = servicos.find((c) => c.id === input.refId);
      const precoBase = ref?.valorInCents ?? input.valorUnitarioInCents;
      if (tipo !== "AGENDAMENTO" || !input.appointmentId || !barbershopId) {
        return precoBase;
      }
      const appointment = appointments.find((a) => a.id === input.appointmentId);
      if (!appointment) return precoBase;
      try {
        const pricing = await subscriptionsService.getServicePricing(
          barbershopId,
          appointment.clientId,
          input.refId,
        );
        return pricing.covered ? pricing.priceInCents : precoBase;
      } catch {
        return precoBase;
      }
    },
    [servicos, tipo, barbershopId, appointments],
  );

  const addItem = useCallback(
    async (input: NovoItemInput): Promise<boolean> => {
      if (isLocked) return false;
      const catalogo = input.tipo === "PRODUTO" ? produtos : servicos;
      const ref = catalogo.find((c) => c.id === input.refId);
      if (!ref || input.quantidade < 1) return false;
      // Em comanda de agendamento, o item precisa apontar para um
      // agendamento já vinculado à comanda (seção "Agendamentos").
      if (
        tipo === "AGENDAMENTO" &&
        !linkedAppointmentIds.includes(input.appointmentId ?? "")
      ) {
        return false;
      }
      const valorUnitarioInCents =
        input.tipo === "SERVICO" ? await resolveServicoPrice(input) : input.valorUnitarioInCents;
      setItens((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          tipo: input.tipo,
          refId: ref.id,
          nome: ref.nome,
          categoriaNome: ref.categoriaNome,
          appointmentId: tipo === "AVULSA" ? null : input.appointmentId,
          quantidade: input.quantidade,
          valorUnitarioInCents,
          descontoInCents: 0,
        },
      ]);
      setErro(null);
      return true;
    },
    [produtos, servicos, tipo, linkedAppointmentIds, resolveServicoPrice, isLocked],
  );

  const removeItem = useCallback(
    (id: string) => {
      if (isLocked) return;
      setItens((prev) => prev.filter((i) => i.id !== id));
    },
    [isLocked],
  );

  /**
   * Vincula um ou mais agendamentos e já adiciona o item de serviço
   * correspondente a cada um — usado para pré-preencher a comanda aberta a
   * partir do detalhe do agendamento (inclusive combos com vários serviços).
   * Feito num único fluxo (em vez de `addLinkedAppointment` + `addItem` em
   * sequência) porque `addItem` valida o vínculo contra `linkedAppointmentIds`
   * lido do state, que ainda não reflete um `addLinkedAppointment` chamado no
   * mesmo tick.
   */
  const seedAppointments = useCallback(
    async (entries: { appointmentId: string; servicoId: string }[]) => {
      if (isLocked || entries.length === 0) return;
      setLinkedAppointmentIds((prev) => {
        const merged = [...prev];
        entries.forEach(({ appointmentId }) => {
          if (!merged.includes(appointmentId)) merged.push(appointmentId);
        });
        return merged;
      });
      const seededItems = await Promise.all(
        entries.map(async ({ appointmentId, servicoId }) => {
          const ref = servicos.find((s) => s.id === servicoId);
          if (!ref) return null;
          const valorUnitarioInCents = await resolveServicoPrice({
            tipo: "SERVICO",
            refId: servicoId,
            appointmentId,
            quantidade: 1,
            valorUnitarioInCents: ref.valorInCents,
          });
          const item: ComandaItem = {
            id: crypto.randomUUID(),
            tipo: "SERVICO",
            refId: ref.id,
            nome: ref.nome,
            categoriaNome: ref.categoriaNome,
            appointmentId,
            quantidade: 1,
            valorUnitarioInCents,
            descontoInCents: 0,
          };
          return item;
        }),
      );
      setItens((prev) => [
        ...prev,
        ...seededItems.filter((i): i is ComandaItem => i !== null),
      ]);
      setErro(null);
    },
    [isLocked, servicos, resolveServicoPrice],
  );

  const totalInCents = useMemo(() => comandaTotalInCents(itens), [itens]);

  // ─── Submissão ──────────────────────────────────────────────────────────────
  /** Valida e monta o draft; em caso de erro, define `erro` e retorna null. */
  const buildDraft = useCallback((): ComandaDraft | null => {
    if (isLocked) {
      setErro("Reabra a comanda para editar.");
      return null;
    }
    if (!branchId) {
      setErro("Selecione a filial.");
      return null;
    }
    if (tipo === "AGENDAMENTO" && linkedAppointmentIds.length === 0) {
      setErro("Adicione ao menos um agendamento à comanda.");
      return null;
    }
    if (itens.length === 0) {
      setErro("Adicione ao menos um produto ou serviço.");
      return null;
    }
    setErro(null);

    if (tipo === "AVULSA") {
      const cliente = clients.find((c) => c.id === clienteId);
      return {
        tipo,
        clienteAvulso: cliente?.name ?? null,
        agendamentos: [],
        itens,
        observacoes: observacoes.trim(),
        branchId: branchId || null,
        employeeId: employeeId || null,
        formaPagamento: formaPagamento || null,
      };
    }

    // O snapshot de agendamentos da comanda vem dos agendamentos vinculados
    // na seção "Agendamentos" (independente de terem item associado ainda).
    const agendamentos = linkedAppointmentIds
      .map((id) => appointments.find((a) => a.id === id))
      .filter((a): a is Appointment => a !== undefined)
      .map(toSnapshot);

    return {
      tipo,
      clienteAvulso: null,
      agendamentos,
      itens,
      observacoes: observacoes.trim(),
      branchId: branchId || null,
      employeeId: employeeId || null,
      formaPagamento: formaPagamento || null,
    };
  }, [
    tipo,
    linkedAppointmentIds,
    clients,
    clienteId,
    itens,
    observacoes,
    branchId,
    employeeId,
    formaPagamento,
    appointments,
    toSnapshot,
    isLocked,
  ]);

  return {
    // estado
    tipo,
    clienteId,
    setClienteId,
    branchId,
    setBranchId,
    employeeId,
    setEmployeeId,
    observacoes,
    setObservacoes,
    formaPagamento,
    setFormaPagamento,
    itens,
    linkedAppointmentIds,
    erro,
    totalInCents,
    isLoadingCatalog,
    hasComposicao,
    isLocked,
    // opções
    agendamentoOptions,
    linkedOptions,
    availableToLinkOptions,
    resolveItemProfissional,
    clienteOptions,
    /** Lista crua de clientes — usada pela busca com autocomplete (spec-revisao-cliente-4.md §4.4). */
    clients,
    branchOptions,
    employeeOptions,
    /** Lista crua de profissionais, para derivar a filial de um agendamento. */
    employees,
    produtos,
    servicos,
    categoriasProdutos,
    categoriasServicos,
    // ações
    setTipo,
    addLinkedAppointment,
    removeLinkedAppointment,
    addItem,
    removeItem,
    seedAppointments,
    buildDraft,
  };
}

export type ComandaFormState = ReturnType<typeof useComandaForm>;
