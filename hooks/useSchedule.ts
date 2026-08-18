"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useServices } from "@/hooks/useServices";
import { useEmployees } from "@/hooks/useEmployees";
import { useClients } from "@/hooks/useClients";
import { useAppointments } from "@/hooks/useAppointments";
import { useLocalProfessionalPhotos } from "@/hooks/useLocalProfessionalPhotos";
import {
  initials,
  isoToMin,
  localDateIso,
  toDateInputValue,
} from "@/components/schedule/helpers";
import { apiAssetUrl } from "@/lib/api";
import { subscriptionsService } from "@/services/subscriptions.service";
import {
  SEM_PREFERENCIA_ID,
  type AgendamentoVM,
  type AssinanteSituacao,
  type NovoAgendamentoInput,
  type ProfissionalVM,
  type QuickClientInput,
  type ServicoVM,
} from "@/components/schedule/types";
import type { Appointment } from "@/types/appointment.types";
import type { Client } from "@/types/client.types";

const DEFAULT_HEX = "#f5b82e";

/** Domingo (0) que inicia a semana em que `date` cai. */
function startOfWeek(date: Date): Date {
  const s = new Date(date);
  s.setHours(0, 0, 0, 0);
  s.setDate(s.getDate() - s.getDay());
  return s;
}

/** Compara mês/dia do aniversário contra cada dia da semana corrente. */
function isBirthdayThisWeek(birthDateIso: string | null | undefined): boolean {
  if (!birthDateIso) return false;
  const birth = new Date(birthDateIso);
  const start = startOfWeek(new Date());
  for (let i = 0; i < 7; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    if (day.getMonth() === birth.getMonth() && day.getDate() === birth.getDate()) {
      return true;
    }
  }
  return false;
}

/** Overlay puramente visual aplicado por drag-drop / resize (não persiste). */
interface Overlay {
  inicioMin?: number;
  profissionalId?: string;
  customDuracao?: number;
}

export function useSchedule(
  barbershopId: string | undefined,
  selectedDate: Date,
  branchId: string | undefined,
) {
  const { services, isLoading: loadingServices } = useServices(barbershopId);
  const { employees, isLoading: loadingEmployees } = useEmployees(barbershopId);
  const {
    clients,
    isLoading: loadingClients,
    create: createClientRaw,
  } = useClients(barbershopId);
  const {
    appointments,
    isLoading: loadingAppts,
    create,
    updateStatus,
    cancel,
    replaceLocal,
    reschedule,
    resize,
    update,
    transfer,
    refetch,
  } = useAppointments(barbershopId);

  const [overlay, setOverlay] = useState<Record<string, Overlay>>({});

  // ─── Situação de assinatura por cliente (para os ícones da agenda) ──────────
  const [subscriberStatusByClient, setSubscriberStatusByClient] = useState<
    Map<string, AssinanteSituacao>
  >(new Map());
  /** Nomes dos planos ativos (status ACTIVE) de cada cliente — usado pelo indicador "Cliente possui plano X + Y ativo" do modal de detalhe. */
  const [clientActivePlans, setClientActivePlans] = useState<Map<string, string[]>>(
    new Map(),
  );

  useEffect(() => {
    if (!barbershopId) return;
    let active = true;
    subscriptionsService
      .getContracts(barbershopId)
      .then((res) => {
        if (!active) return;
        const statusMap = new Map<string, AssinanteSituacao>();
        const plansMap = new Map<string, string[]>();
        for (const contract of res.contracts) {
          const situacao: AssinanteSituacao =
            contract.contractStatus === "ATRASADO" ? "inadimplente" : "ativo";
          if (statusMap.get(contract.clientId) !== "inadimplente") {
            statusMap.set(contract.clientId, situacao);
          }
          if (contract.status === "ACTIVE") {
            const names = plansMap.get(contract.clientId) ?? [];
            names.push(contract.plan.name);
            plansMap.set(contract.clientId, names);
          }
        }
        setSubscriberStatusByClient(statusMap);
        setClientActivePlans(plansMap);
      })
      .catch(() => {
        // silencioso — ícone de assinante simplesmente não aparece
      });
    return () => {
      active = false;
    };
  }, [barbershopId]);

  // Foto local (cadastro) como fallback enquanto o backend não tem avatarUrl.
  const localPhotos = useLocalProfessionalPhotos(
    barbershopId,
    employees.map((e) => e.id),
  );

  // ─── Serviços VM ──────────────────────────────────────────────────────────
  const servicos = useMemo<ServicoVM[]>(
    () =>
      services.map((s) => ({
        id: s.id,
        nome: s.name,
        cor: s.hex ?? DEFAULT_HEX,
        tempoPadrao: s.durationMin,
        preco: s.priceInCents / 100,
        fitIn: s.fitIn,
      })),
    [services],
  );

  const servicoById = useMemo(() => {
    const m = new Map<string, ServicoVM>();
    servicos.forEach((s) => m.set(s.id, s));
    return m;
  }, [servicos]);

  // ─── Profissionais VM (filtrados pela filial) ───────────────────────────────
  const profissionais = useMemo<ProfissionalVM[]>(
    () =>
      employees
        .filter((e) => !branchId || e.branchId === branchId)
        .map((e) => ({
          id: e.id,
          nome: e.appName || e.name,
          avatar: initials(e.appName || e.name),
          fotoUrl: apiAssetUrl(e.avatarUrl) ?? localPhotos[e.id] ?? null,
          ativo: true,
          branchId: e.branchId ?? null,
        })),
    [employees, branchId, localPhotos],
  );

  /**
   * Profissionais de TODAS as filiais (sem o filtro da filial selecionada na
   * página) — usado pelo modal "Novo agendamento" (item 1.6), que agora tem
   * seu próprio seletor de filial e precisa poder listar/filtrar
   * profissionais de qualquer filial, não só a que está ativa na agenda.
   */
  const profissionaisTodos = useMemo<ProfissionalVM[]>(
    () =>
      employees.map((e) => ({
        id: e.id,
        nome: e.appName || e.name,
        avatar: initials(e.appName || e.name),
        fotoUrl: apiAssetUrl(e.avatarUrl) ?? localPhotos[e.id] ?? null,
        ativo: true,
        branchId: e.branchId ?? null,
      })),
    [employees, localPhotos],
  );

  /** Nome de qualquer profissional (independente da filial), para a lista. */
  const employeeNameById = useMemo(() => {
    const m = new Map<string, string>();
    employees.forEach((e) => m.set(e.id, e.appName || e.name));
    return m;
  }, [employees]);

  /** Cadastro completo do cliente (nascimento, nota) por id. */
  const clientById = useMemo(() => {
    const m = new Map<string, Client>();
    clients.forEach((c) => m.set(c.id, c));
    return m;
  }, [clients]);

  /** Id do primeiro agendamento (não cancelado) de cada cliente, entre TODOS
   * os agendamentos da barbearia — não só os do dia selecionado. */
  const firstAppointmentIdByClient = useMemo(() => {
    const earliest = new Map<string, { id: string; time: number }>();
    for (const a of appointments) {
      if (a.status === "CANCELLED") continue;
      const time = new Date(a.scheduledAt).getTime();
      const current = earliest.get(a.clientId);
      if (!current || time < current.time) {
        earliest.set(a.clientId, { id: a.id, time });
      }
    }
    return new Map(Array.from(earliest, ([clientId, v]) => [clientId, v.id]));
  }, [appointments]);

  // ─── Agendamentos VM (todos, com overlay) ───────────────────────────────────
  // Serve tanto o kanban do dia (filtrado abaixo) quanto a visão de mês, que
  // precisa do conjunto inteiro pra agrupar por `dataIso`. Agendamentos combo
  // (mesmo `groupId`, criados por `createAgendamento` a partir de múltiplos
  // serviços) são mesclados aqui num único card: o mais antigo do grupo vira
  // o "primário" (id/overlay/ações), a duração é a soma dos serviços e
  // `servicos` traz a lista completa pra exibição no card.
  const agendamentosTodos = useMemo<AgendamentoVM[]>(() => {
    const groups = new Map<string, Appointment[]>();
    for (const a of appointments) {
      const key = a.groupId ?? a.id;
      const list = groups.get(key) ?? [];
      list.push(a);
      groups.set(key, list);
    }

    return Array.from(groups.values()).map((members) => {
      const sorted = [...members].sort(
        (x, y) => new Date(x.scheduledAt).getTime() - new Date(y.scheduledAt).getTime(),
      );
      const primary = sorted[0];
      const ov = overlay[primary.id] ?? {};

      // Serviço de encaixe (§3.2) não abre bloco de tempo próprio quando
      // combinado com outro serviço no mesmo agendamento — só soma sua
      // duração normalmente quando é o único serviço do grupo.
      const totalDurFromServices =
        sorted.length > 1
          ? sorted.reduce((sum, m) => {
              const servico = servicoById.get(m.serviceId);
              if (servico?.fitIn) return sum;
              return sum + (servico?.tempoPadrao ?? 30);
            }, 0) || (servicoById.get(sorted[0].serviceId)?.tempoPadrao ?? 30)
          : (servicoById.get(sorted[0].serviceId)?.tempoPadrao ?? 30);
      // Resize persistido (§5.3): sobrescreve a soma dos serviços, mas só se
      // aplica ao membro "primário" — combos com múltiplos serviços não
      // cascateiam o resize pros demais (limitação documentada no backend).
      const totalDur = primary.durationOverrideMin ?? totalDurFromServices;
      const servicos = sorted.map((m) => ({
        id: m.serviceId,
        nome: servicoById.get(m.serviceId)?.nome ?? "Serviço",
      }));

      const profId =
        ov.profissionalId ??
        primary.employeeId ??
        primary.employee?.id ??
        SEM_PREFERENCIA_ID;
      const profNome =
        employeeNameById.get(profId) ??
        primary.employee?.appName ??
        primary.employee?.name ??
        "Sem profissional";
      const cli = clientById.get(primary.clientId);
      return {
        id: primary.id,
        clientId: primary.clientId,
        servicoId: primary.serviceId,
        servicos,
        memberIds: sorted.map((m) => m.id),
        groupId: primary.groupId,
        profissionalId: profId,
        profissionalNome: profNome,
        semPreferencia: !primary.employeeId,
        branchId: primary.branchId ?? null,
        cliente: primary.client?.name ?? "Cliente",
        telefone: primary.client?.phone ?? "",
        inicioMin: ov.inicioMin ?? isoToMin(primary.scheduledAt),
        duracao: ov.customDuracao ?? totalDur,
        dataIso: localDateIso(primary.scheduledAt),
        status: primary.status,
        origem: primary.origin === "CLIENT" ? "online" : "recepcao",
        primeiroAgendamento:
          firstAppointmentIdByClient.get(primary.clientId) === primary.id,
        assinante: subscriberStatusByClient.get(primary.clientId) ?? null,
        aniversarianteSemana: isBirthdayThisWeek(cli?.birthDate),
        temNota: !!cli?.notes?.trim(),
      } satisfies AgendamentoVM;
    });
  }, [
    appointments,
    overlay,
    servicoById,
    employeeNameById,
    clientById,
    firstAppointmentIdByClient,
    subscriberStatusByClient,
  ]);

  // ─── Agendamentos do dia selecionado (kanban) ───────────────────────────────
  const agendamentos = useMemo<AgendamentoVM[]>(() => {
    const selectedIso = toDateInputValue(selectedDate);
    return agendamentosTodos.filter((a) => a.dataIso === selectedIso);
  }, [agendamentosTodos, selectedDate]);

  // ─── Ações ──────────────────────────────────────────────────────────────────
  /**
   * Cria os agendamentos a partir dos serviços selecionados, agrupando em um
   * único Appointment (card, com duração somada) cada sequência de serviços
   * consecutivos atribuídos ao mesmo profissional — uma troca de
   * profissional no meio da seleção inicia um novo agendamento. Retorna o
   * primeiro agendamento criado.
   */
  const createAgendamento = useCallback(
    async (input: NovoAgendamentoInput): Promise<Appointment | null> => {
      const [h, m] = input.hora.split(":").map(Number);
      let cursorMin = h * 60 + (m || 0);
      let first: Appointment | null = null;

      let i = 0;
      let isFirstBatch = true;
      while (i < input.servicos.length) {
        const profissionalId = input.servicos[i].profissionalId;
        const batch = [];
        while (
          i < input.servicos.length &&
          input.servicos[i].profissionalId === profissionalId
        ) {
          batch.push(input.servicos[i]);
          i++;
        }

        const dt = new Date(input.data);
        dt.setUTCHours(0, 0, 0, 0);
        dt.setUTCMinutes(cursorMin);
        const created = await create({
          clientId: input.clientId,
          serviceIds: batch.map((sv) => sv.servicoId),
          employeeId: profissionalId || undefined,
          scheduledAt: dt.toISOString(),
          // Observação vai só no primeiro card do agendamento (mesmo padrão
          // do backend, que grava só no primeiro item do grupo).
          notes: isFirstBatch ? input.observacao || undefined : undefined,
        });
        isFirstBatch = false;
        if (created) {
          // Enriquece localmente (employeeId/employee/client) pra o card
          // aparecer imediatamente na coluna correta do kanban.
          const emp = employees.find((e) => e.id === profissionalId);
          const cli = clients.find((c) => c.id === input.clientId);
          replaceLocal(created.id, {
            employeeId: profissionalId || null,
            status: input.status ?? created.status,
            employee: emp
              ? { id: emp.id, name: emp.name, appName: emp.appName }
              : null,
            client: cli
              ? { id: cli.id, name: cli.name, email: cli.email, phone: cli.phone }
              : created.client,
          });
          // Persiste a situação escolhida (o backend cria como PENDING).
          if (input.status && input.status !== "PENDING") {
            await updateStatus(created.id, input.status);
          }
          if (!first) first = created;
        }
        cursorMin += batch.reduce((sum, sv) => sum + sv.duracao, 0);
      }
      return first;
    },
    [create, replaceLocal, updateStatus, employees, clients],
  );

  /** Criação rápida de cliente (mini-form do dialog de novo agendamento). */
  const createClient = useCallback(
    async (input: QuickClientInput): Promise<Client | null> => {
      const digits = input.phone.replace(/\D/g, "");
      return createClientRaw({
        name: input.name,
        email: input.email,
        password: input.password,
        phone: digits,
        birthDate: input.birthDate,
        howMet: input.howMet,
      });
    },
    [createClientRaw],
  );

  const moveLocal = useCallback(
    (id: string, patch: { inicioMin?: number; profissionalId?: string }) => {
      setOverlay((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
    },
    [],
  );

  const resizeLocal = useCallback((id: string, customDuracao: number) => {
    setOverlay((prev) => ({ ...prev, [id]: { ...prev[id], customDuracao } }));
  }, []);

  /** Remove o overlay visual de um agendamento (volta a refletir o dado real). */
  const clearOverlay = useCallback((id: string) => {
    setOverlay((prev) => {
      if (!(id in prev)) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  /**
   * Persiste o reagendamento feito por drag-and-drop (novo horário/profissional)
   * via `PATCH /appointments/:id/reschedule` — reaproveita a mesma checagem de
   * conflito de horário do backend usada em `GET /availability`. `moveLocal` já
   * aplicou a movimentação otimista antes desta chamada; aqui só confirmamos
   * (limpando o overlay, que passa a refletir o dado persistido) ou revertemos
   * (limpando o overlay também, mas sem o dado ter mudado de fato — volta ao
   * horário original) em caso de falha.
   */
  const rescheduleAgendamento = useCallback(
    async (
      id: string,
      novoInicioMin: number,
      novoProfissionalId: string,
    ): Promise<boolean> => {
      const dt = new Date(selectedDate);
      dt.setUTCHours(0, 0, 0, 0);
      dt.setUTCMinutes(novoInicioMin);
      const updated = await reschedule(id, {
        scheduledAt: dt.toISOString(),
        employeeId: novoProfissionalId,
      });
      clearOverlay(id);
      return updated !== null;
    },
    [selectedDate, reschedule, clearOverlay],
  );

  /**
   * Persiste o redimensionamento (arrastar a borda inferior do card) via
   * `PATCH /appointments/:id/resize` (ver spec-revisao-cliente-1.md §5.3).
   * `resizeLocal` já aplicou a prévia otimista; aqui confirmamos (limpando o
   * overlay) ou revertemos em caso de falha.
   */
  const resizeAgendamento = useCallback(
    async (id: string, novaDuracao: number): Promise<boolean> => {
      const updated = await resize(id, novaDuracao);
      clearOverlay(id);
      return updated !== null;
    },
    [resize, clearOverlay],
  );

  /**
   * Atualização unificada do modal de detalhe (`DialogDetalhe`): serviços,
   * data/horário, filial e profissional. Ver `AppointmentsService.update`
   * no backend e `useAppointments.update` no front.
   */
  const updateAgendamento = useCallback(
    async (id: string, payload: Parameters<typeof update>[1]) => {
      const updated = await update(id, payload);
      return updated !== null;
    },
    [update],
  );

  /** Troca o cliente do agendamento (modal de detalhe) — envolve `transfer` numa assinatura booleana, como `updateAgendamento`. */
  const transferAgendamento = useCallback(
    async (id: string, clientId: string) => {
      const updated = await transfer(id, { clientId });
      return updated !== null;
    },
    [transfer],
  );

  const isLoading =
    loadingServices || loadingEmployees || loadingClients || loadingAppts;

  return {
    servicos,
    profissionais,
    profissionaisTodos,
    agendamentos,
    agendamentosTodos,
    clients,
    servicoById,
    isLoading,
    createAgendamento,
    createClient,
    updateStatus,
    cancel,
    moveLocal,
    resizeLocal,
    rescheduleAgendamento,
    resizeAgendamento,
    updateAgendamento,
    transferAgendamento,
    clientActivePlans,
    refetchAgendamentos: refetch,
  };
}
