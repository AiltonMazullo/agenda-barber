"use client";

import { useCallback, useMemo, useState } from "react";
import { useServices } from "@/hooks/useServices";
import { useEmployees } from "@/hooks/useEmployees";
import { useClients } from "@/hooks/useClients";
import { useAppointments } from "@/hooks/useAppointments";
import { initials, isoToMin } from "@/components/schedule/helpers";
import type {
  AgendamentoVM,
  NovoAgendamentoInput,
  ProfissionalVM,
  QuickClientInput,
  ServicoVM,
} from "@/components/schedule/types";
import type { Appointment } from "@/types/appointment.types";
import type { Client } from "@/types/client.types";

const DEFAULT_HEX = "#f5b82e";

/** Overlay puramente visual aplicado por drag-drop / resize (não persiste). */
interface Overlay {
  inicioMin?: number;
  profissionalId?: string;
  customDuracao?: number;
}

function sameDay(iso: string, date: Date): boolean {
  const d = new Date(iso);
  return (
    d.getFullYear() === date.getFullYear() &&
    d.getMonth() === date.getMonth() &&
    d.getDate() === date.getDate()
  );
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
  } = useAppointments(barbershopId);

  const [overlay, setOverlay] = useState<Record<string, Overlay>>({});

  // ─── Serviços VM ──────────────────────────────────────────────────────────
  const servicos = useMemo<ServicoVM[]>(
    () =>
      services.map((s) => ({
        id: s.id,
        nome: s.name,
        cor: s.hex ?? DEFAULT_HEX,
        tempoPadrao: s.durationMin,
        preco: s.priceInCents / 100,
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
          ativo: true,
        })),
    [employees, branchId],
  );

  /** Nome de qualquer profissional (independente da filial), para a lista. */
  const employeeNameById = useMemo(() => {
    const m = new Map<string, string>();
    employees.forEach((e) => m.set(e.id, e.appName || e.name));
    return m;
  }, [employees]);

  // ─── Agendamentos VM (do dia, com overlay) ──────────────────────────────────
  const agendamentos = useMemo<AgendamentoVM[]>(() => {
    return appointments
      .filter((a) => sameDay(a.scheduledAt, selectedDate))
      .map((a) => {
        const ov = overlay[a.id] ?? {};
        const servico = servicoById.get(a.serviceId);
        const baseDur = servico?.tempoPadrao ?? 30;
        const profId =
          ov.profissionalId ?? a.employeeId ?? a.employee?.id ?? "sem-prof";
        const profNome =
          employeeNameById.get(profId) ??
          a.employee?.appName ??
          a.employee?.name ??
          "Sem profissional";
        return {
          id: a.id,
          servicoId: a.serviceId,
          profissionalId: profId,
          profissionalNome: profNome,
          cliente: a.client?.name ?? "Cliente",
          telefone: a.client?.phone ?? "",
          inicioMin: ov.inicioMin ?? isoToMin(a.scheduledAt),
          duracao: ov.customDuracao ?? baseDur,
          status: a.status,
          origem: "recepcao",
        } satisfies AgendamentoVM;
      });
  }, [appointments, selectedDate, overlay, servicoById, employeeNameById]);

  // ─── Ações ──────────────────────────────────────────────────────────────────
  /**
   * Cria um agendamento por serviço (executados em sequência a partir do
   * horário). Retorna o primeiro agendamento criado. O backend trata cada
   * serviço como um Appointment próprio.
   */
  const createAgendamento = useCallback(
    async (input: NovoAgendamentoInput): Promise<Appointment | null> => {
      const [h, m] = input.hora.split(":").map(Number);
      let cursorMin = h * 60 + (m || 0);
      let first: Appointment | null = null;

      for (const sv of input.servicos) {
        const dt = new Date(input.data);
        dt.setHours(0, 0, 0, 0);
        dt.setMinutes(cursorMin);
        const created = await create({
          clientId: input.clientId,
          serviceId: sv.servicoId,
          employeeId: sv.profissionalId || undefined,
          scheduledAt: dt.toISOString(),
        });
        if (created) {
          // Enriquece localmente (employeeId/employee/client) pra o card
          // aparecer imediatamente na coluna correta do kanban.
          const emp = employees.find((e) => e.id === sv.profissionalId);
          const cli = clients.find((c) => c.id === input.clientId);
          replaceLocal(created.id, {
            employeeId: sv.profissionalId || null,
            employee: emp
              ? { id: emp.id, name: emp.name, appName: emp.appName }
              : null,
            client: cli
              ? { id: cli.id, name: cli.name, email: cli.email, phone: cli.phone }
              : created.client,
          });
          if (!first) first = created;
        }
        cursorMin += sv.duracao;
      }
      return first;
    },
    [create, replaceLocal, employees, clients],
  );

  /**
   * Criação rápida de cliente (mini-form do dialog). Preenche defaults para os
   * campos que o backend exige mas não são coletados no cadastro rápido.
   */
  const createClient = useCallback(
    async (input: QuickClientInput): Promise<Client | null> => {
      const digits = input.phone.replace(/\D/g, "");
      return createClientRaw({
        name: input.name,
        email: input.email || `${digits || Date.now()}@sememail.cliente`,
        password: `${Math.random().toString(36).slice(2, 10)}A1!`,
        phone: digits,
        birthDate: "2000-01-01T00:00:00.000Z",
        howMet: "Recepção",
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

  const isLoading =
    loadingServices || loadingEmployees || loadingClients || loadingAppts;

  return {
    servicos,
    profissionais,
    agendamentos,
    clients,
    servicoById,
    isLoading,
    createAgendamento,
    createClient,
    updateStatus,
    cancel,
    moveLocal,
    resizeLocal,
  };
}
