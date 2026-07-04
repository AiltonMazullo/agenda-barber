"use client";

import { useCallback, useMemo, useState } from "react";
import { useAppointments } from "@/hooks/useAppointments";
import { useEmployees } from "@/hooks/useEmployees";
import { useProducts } from "@/hooks/useProducts";
import { useServices } from "@/hooks/useServices";
import { comandaTotalInCents } from "@/utils/comanda";
import { formatDate, formatTime } from "@/utils/format";
import type { Appointment } from "@/types/appointment.types";
import type {
  Comanda,
  ComandaAgendamento,
  ComandaDraft,
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

/** Categorias existentes no catálogo informado (únicas, ordenadas). */
function categoriasDe(catalogo: CatalogoOption[]): SelectOption<string>[] {
  const map = new Map<string, string>();
  catalogo.forEach((c) => {
    if (c.categoriaId && c.categoriaNome) map.set(c.categoriaId, c.categoriaNome);
  });
  return [...map.entries()]
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

/**
 * Estado e regras do formulário de comanda (criação e edição).
 *
 * Compõe os hooks reais de agendamentos/produtos/serviços e expõe apenas o
 * que a UI precisa: opções para os selects, a composição atual (agendamentos
 * vinculados + itens) e as ações com validação. Nenhuma regra fica no JSX.
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

  const [tipo, setTipoState] = useState<ComandaTipo>(
    comanda?.tipo ?? "AGENDAMENTO",
  );
  const [clienteAvulso, setClienteAvulso] = useState(
    comanda?.clienteAvulso ?? "",
  );
  const [agendamentos, setAgendamentos] = useState<ComandaAgendamento[]>(
    comanda?.agendamentos ?? [],
  );
  const [itens, setItens] = useState<ComandaItem[]>(comanda?.itens ?? []);
  const [observacoes, setObservacoes] = useState(comanda?.observacoes ?? "");
  const [erro, setErro] = useState<string | null>(null);

  const isLoadingCatalog =
    loadingAppointments || loadingProducts || loadingServices;

  // ─── Agendamentos ───────────────────────────────────────────────────────────
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

  /** Agendamentos disponíveis para vincular (exclui cancelados e já vinculados). */
  const agendamentoOptions = useMemo<SelectOption<string>[]>(() => {
    const vinculados = new Set(agendamentos.map((a) => a.appointmentId));
    return appointments
      .filter((a) => a.status !== "CANCELLED" && !vinculados.has(a.id))
      .sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt))
      .map((a) => ({
        value: a.id,
        label: `${a.client?.name ?? "Cliente"} · ${a.service?.name ?? "Serviço"} · ${formatDate(
          a.scheduledAt,
          { day: "2-digit", month: "2-digit" },
        )} ${formatTime(a.scheduledAt)}`,
      }));
  }, [appointments, agendamentos]);

  /** Agendamentos já vinculados, como opções para atrelar itens. */
  const agendamentosVinculados = useMemo<SelectOption<string>[]>(
    () =>
      agendamentos.map((a) => ({
        value: a.appointmentId,
        label: `${a.clienteNome} · ${a.servicoNome}`,
      })),
    [agendamentos],
  );

  const addAgendamento = useCallback(
    (appointmentId: string) => {
      const appt = appointments.find((a) => a.id === appointmentId);
      if (!appt) return;
      setAgendamentos((prev) =>
        prev.some((a) => a.appointmentId === appointmentId)
          ? prev
          : [...prev, toSnapshot(appt)],
      );
      setErro(null);
    },
    [appointments, toSnapshot],
  );

  /** Quantos itens estão atrelados a um agendamento (para confirmar remoção). */
  const linkedItemCount = useCallback(
    (appointmentId: string) =>
      itens.filter((i) => i.appointmentId === appointmentId).length,
    [itens],
  );

  /** Remove o agendamento e, em cascata, os itens atrelados a ele. */
  const removeAgendamento = useCallback((appointmentId: string) => {
    setAgendamentos((prev) =>
      prev.filter((a) => a.appointmentId !== appointmentId),
    );
    setItens((prev) => prev.filter((i) => i.appointmentId !== appointmentId));
  }, []);

  // ─── Tipo da comanda ────────────────────────────────────────────────────────
  /** Há algo que seria perdido ao trocar o tipo? (a UI confirma antes) */
  const hasComposicao = agendamentos.length > 0 || itens.length > 0;

  /** Troca o tipo zerando a composição — os vínculos deixam de fazer sentido. */
  const setTipo = useCallback((next: ComandaTipo) => {
    setTipoState(next);
    setAgendamentos([]);
    setItens([]);
    setErro(null);
  }, []);

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

  const categoriasProdutos = useMemo(() => categoriasDe(produtos), [produtos]);
  const categoriasServicos = useMemo(() => categoriasDe(servicos), [servicos]);

  // ─── Itens ──────────────────────────────────────────────────────────────────
  const addItem = useCallback(
    (input: NovoItemInput): boolean => {
      const catalogo = input.tipo === "PRODUTO" ? produtos : servicos;
      const ref = catalogo.find((c) => c.id === input.refId);
      if (!ref || input.quantidade < 1) return false;
      // Em comanda de agendamento, o item precisa apontar para um
      // agendamento efetivamente vinculado.
      if (
        tipo === "AGENDAMENTO" &&
        !agendamentos.some((a) => a.appointmentId === input.appointmentId)
      ) {
        return false;
      }
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
          valorUnitarioInCents: input.valorUnitarioInCents,
        },
      ]);
      setErro(null);
      return true;
    },
    [produtos, servicos, tipo, agendamentos],
  );

  const removeItem = useCallback((id: string) => {
    setItens((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const totalInCents = useMemo(() => comandaTotalInCents(itens), [itens]);

  // ─── Submissão ──────────────────────────────────────────────────────────────
  /** Valida e monta o draft; em caso de erro, define `erro` e retorna null. */
  const buildDraft = useCallback((): ComandaDraft | null => {
    if (tipo === "AGENDAMENTO" && agendamentos.length === 0) {
      setErro("Adicione ao menos um agendamento à comanda.");
      return null;
    }
    if (itens.length === 0) {
      setErro("Adicione ao menos um produto ou serviço.");
      return null;
    }
    setErro(null);
    return {
      tipo,
      clienteAvulso: tipo === "AVULSA" ? clienteAvulso.trim() || null : null,
      agendamentos,
      itens,
      observacoes: observacoes.trim(),
    };
  }, [tipo, clienteAvulso, agendamentos, itens, observacoes]);

  return {
    // estado
    tipo,
    clienteAvulso,
    setClienteAvulso,
    observacoes,
    setObservacoes,
    agendamentos,
    itens,
    erro,
    totalInCents,
    isLoadingCatalog,
    hasComposicao,
    // opções
    agendamentoOptions,
    agendamentosVinculados,
    produtos,
    servicos,
    categoriasProdutos,
    categoriasServicos,
    // ações
    setTipo,
    addAgendamento,
    removeAgendamento,
    linkedItemCount,
    addItem,
    removeItem,
    buildDraft,
  };
}

export type ComandaFormState = ReturnType<typeof useComandaForm>;
