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
  ServicoVM,
} from "@/components/schedule/types";
import type { Appointment } from "@/types/appointment.types";

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
  const { clients, isLoading: loadingClients } = useClients(barbershopId);
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
  const createAgendamento = useCallback(
    async (input: NovoAgendamentoInput): Promise<Appointment | null> => {
      const [h, m] = input.hora.split(":").map(Number);
      const dt = new Date(input.data);
      dt.setHours(h, m || 0, 0, 0);
      const created = await create({
        clientId: input.clientId,
        serviceId: input.serviceId,
        employeeId: input.employeeId || undefined,
        scheduledAt: dt.toISOString(),
      });
      if (created) {
        // Enriquece localmente o que o backend pode não estar ecoando no POST
        // (employeeId, employee, client) usando o que já temos em memória, pra
        // o card aparecer imediatamente na coluna correta do kanban. Não fazemos
        // refetch porque o GET pode não devolver `employeeId` ainda — e isso
        // sobrescreveria a enriquecimento, escondendo o card do kanban.
        const emp = employees.find((e) => e.id === input.employeeId);
        const cli = clients.find((c) => c.id === input.clientId);
        replaceLocal(created.id, {
          employeeId: input.employeeId || null,
          employee: emp
            ? { id: emp.id, name: emp.name, appName: emp.appName }
            : null,
          client: cli
            ? {
                id: cli.id,
                name: cli.name,
                email: cli.email,
                phone: cli.phone,
              }
            : created.client,
        });
      }
      return created;
    },
    [create, replaceLocal, employees, clients],
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
    updateStatus,
    cancel,
    moveLocal,
    resizeLocal,
  };
}
