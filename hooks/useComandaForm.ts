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
 * que a UI precisa: opções para os selects, a composição atual (itens, cada
 * um podendo apontar direto para um agendamento real do backend) e as ações
 * com validação. O snapshot de agendamentos da comanda (`agendamentos`) é
 * derivado automaticamente dos agendamentos referenciados pelos itens — não
 * existe um passo separado de "vincular agendamento". Nenhuma regra fica no
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

  const [tipo, setTipoState] = useState<ComandaTipo>(
    comanda?.tipo ?? "AGENDAMENTO",
  );
  const [clienteAvulso, setClienteAvulso] = useState(
    comanda?.clienteAvulso ?? "",
  );
  const [itens, setItens] = useState<ComandaItem[]>(comanda?.itens ?? []);
  const [observacoes, setObservacoes] = useState(comanda?.observacoes ?? "");
  const [erro, setErro] = useState<string | null>(null);

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

  /** Agendamentos reais da barbearia disponíveis para atrelar a um item (exclui cancelados). */
  const agendamentoOptions = useMemo<SelectOption<string>[]>(
    () =>
      appointments
        .filter((a) => a.status !== "CANCELLED")
        .sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt))
        .map((a) => ({
          value: a.id,
          label: `${a.client?.name ?? "Cliente"} · ${a.service?.name ?? "Serviço"} · ${formatDate(
            a.scheduledAt,
            { day: "2-digit", month: "2-digit" },
          )} ${formatTime(a.scheduledAt)}`,
        })),
    [appointments],
  );

  // ─── Tipo da comanda ────────────────────────────────────────────────────────
  /** Há itens que seriam perdidos ao trocar o tipo? (a UI confirma antes) */
  const hasComposicao = itens.length > 0;

  /** Troca o tipo zerando os itens — os vínculos deixam de fazer sentido. */
  const setTipo = useCallback((next: ComandaTipo) => {
    setTipoState(next);
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
      // agendamento real (não cancelado) da barbearia.
      if (
        tipo === "AGENDAMENTO" &&
        !agendamentoOptions.some((a) => a.value === input.appointmentId)
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
    [produtos, servicos, tipo, agendamentoOptions],
  );

  const removeItem = useCallback((id: string) => {
    setItens((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const totalInCents = useMemo(() => comandaTotalInCents(itens), [itens]);

  // ─── Submissão ──────────────────────────────────────────────────────────────
  /** Valida e monta o draft; em caso de erro, define `erro` e retorna null. */
  const buildDraft = useCallback((): ComandaDraft | null => {
    if (itens.length === 0) {
      setErro("Adicione ao menos um produto ou serviço.");
      return null;
    }
    setErro(null);

    if (tipo === "AVULSA") {
      return {
        tipo,
        clienteAvulso: clienteAvulso.trim() || null,
        agendamentos: [],
        itens,
        observacoes: observacoes.trim(),
      };
    }

    // O snapshot de agendamentos da comanda é derivado dos agendamentos
    // efetivamente referenciados pelos itens (cada item já aponta para um
    // agendamento real, escolhido direto no seletor).
    const uniqueIds = [...new Set(itens.map((i) => i.appointmentId))].filter(
      (id): id is string => id !== null,
    );
    const agendamentos = uniqueIds
      .map((id) => appointments.find((a) => a.id === id))
      .filter((a): a is Appointment => a !== undefined)
      .map(toSnapshot);

    return {
      tipo,
      clienteAvulso: null,
      agendamentos,
      itens,
      observacoes: observacoes.trim(),
    };
  }, [tipo, clienteAvulso, itens, observacoes, appointments, toSnapshot]);

  return {
    // estado
    tipo,
    clienteAvulso,
    setClienteAvulso,
    observacoes,
    setObservacoes,
    itens,
    erro,
    totalInCents,
    isLoadingCatalog,
    hasComposicao,
    // opções
    agendamentoOptions,
    produtos,
    servicos,
    categoriasProdutos,
    categoriasServicos,
    // ações
    setTipo,
    addItem,
    removeItem,
    buildDraft,
  };
}

export type ComandaFormState = ReturnType<typeof useComandaForm>;
