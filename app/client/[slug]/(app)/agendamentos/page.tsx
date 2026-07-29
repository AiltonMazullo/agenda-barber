/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarCheck, AlertCircle, CalendarPlus } from "lucide-react";
import { toast } from "sonner";
import { AppointmentItem } from "@/components/client/AppointmentItem";
import { AgendamentosHelpCard } from "@/components/client/AgendamentosHelpCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loading } from "@/components/shared/Loading";
import { EmptyState, ListPaginationBar } from "@/components/shared";
import { clientAppointmentsService } from "@/services/client-appointments.service";
import { clientCatalogService } from "@/services/client-catalog.service";
import { usePublicBarbershop } from "@/contexts/PublicBarbershopContext";
import { useLocalProfessionalPhotos } from "@/hooks/useLocalProfessionalPhotos";
import { useAppointmentEmployeeMap } from "@/hooks/useAppointmentEmployeeMap";
import { usePagination } from "@/hooks/usePagination";
import { groupAppointments } from "@/utils/groupAppointments";
import { toWallClockDate } from "@/utils/format";
import type { ClientAppointment } from "@/types/appointment.types";
import type { Employee } from "@/types/employee.types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function AgendamentosPage({ params }: PageProps) {
  const { slug } = use(params);
  const router = useRouter();
  const { barbershop } = usePublicBarbershop();

  const [appointments, setAppointments] = useState<ClientAppointment[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { map: apptEmployeeMap } = useAppointmentEmployeeMap();

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(null);
    clientAppointmentsService
      .listMine()
      .then((data) => {
        if (active) setAppointments(data);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(
          err instanceof Error ? err.message : "Falha ao carregar agendamentos.",
        );
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  // Lista de profissionais (via catálogo público) para resolver o nome a partir
  // do `employeeId` — o backend não retorna o profissional em /me/appointments.
  useEffect(() => {
    let active = true;
    clientCatalogService
      .listEmployees(slug)
      .then((list) => {
        if (active) setEmployees(list);
      })
      .catch(() => {
        /* silencioso — sem a lista, cai em "Sem preferência" */
      });
    return () => {
      active = false;
    };
  }, [slug]);

  const empNameById = useMemo(() => {
    const m = new Map<string, string>();
    employees.forEach((e) => m.set(e.id, e.appName || e.name));
    return m;
  }, [employees]);

  /** Profissional efetivo: do backend, senão do vínculo local (cadastro). */
  function resolveEmployeeId(a: ClientAppointment): string | null {
    return a.employeeId ?? apptEmployeeMap[a.id] ?? null;
  }

  // Agendamentos combo (múltiplos serviços numa mesma reserva) compartilham
  // `groupId` — agrupamos aqui pra renderizar um único card por reserva.
  const groups = useMemo(() => groupAppointments(appointments), [appointments]);

  const { agendados, historico } = useMemo(() => {
    const now = new Date();
    const agendados: typeof groups = [];
    const historico: typeof groups = [];
    for (const g of groups) {
      const isFuture = toWallClockDate(g.primary.scheduledAt) >= now;
      const isOpen = g.primary.status === "PENDING" || g.primary.status === "CONFIRMED";
      if (isFuture && isOpen) {
        agendados.push(g);
      } else {
        historico.push(g);
      }
    }
    agendados.sort(
      (a, b) =>
        new Date(a.primary.scheduledAt).getTime() -
        new Date(b.primary.scheduledAt).getTime(),
    );
    historico.sort(
      (a, b) =>
        new Date(b.primary.scheduledAt).getTime() -
        new Date(a.primary.scheduledAt).getTime(),
    );
    return { agendados, historico };
  }, [groups]);

  // Fotos locais (cadastro do dono) por profissional — fallback de exibição.
  const employeeIds = useMemo(
    () =>
      Array.from(
        new Set(
          appointments
            .map((a) => a.employeeId ?? apptEmployeeMap[a.id] ?? null)
            .filter((x): x is string => !!x),
        ),
      ),
    [appointments, apptEmployeeMap],
  );
  const localPhotos = useLocalProfessionalPhotos(barbershop?.id, employeeIds);

  const agendadosPg = usePagination(agendados, 10);
  const historicoPg = usePagination(historico, 10);

  async function handleCancel(id: string) {
    const appt = appointments.find((a) => a.id === id);
    if (!appt) return;
    const ok = window.confirm("Deseja cancelar este agendamento?");
    if (!ok) return;
    try {
      await clientAppointmentsService.cancel(appt.barbershopId, id);
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "CANCELLED" } : a)),
      );
      toast.success("Agendamento cancelado.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao cancelar.");
    }
  }

  function goToAgendar() {
    router.push(`/client/${slug}/agendar`);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Meus agendamentos</h1>
        <Button
          type="button"
          onClick={goToAgendar}
          className="bg-brand hover:bg-brand-hover text-brand-foreground font-bold cursor-pointer"
        >
          <CalendarPlus className="size-4 mr-1.5" />
          Novo agendamento
        </Button>
      </div>

      {isLoading ? (
        <Loading />
      ) : error ? (
        <div className="rounded-lg border border-danger/30 bg-danger/5 p-6 text-center space-y-2">
          <AlertCircle className="size-6 text-danger-foreground mx-auto" />
          <p className="text-sm text-foreground">{error}</p>
        </div>
      ) : (
        <Tabs defaultValue="agendados" className="gap-6">
          <TabsList
            variant="line"
            className="w-full justify-start rounded-none border-b border-border-subtle p-0"
          >
            <TabsTrigger
              value="agendados"
              className="flex-1 rounded-none px-1.5 pb-3 data-active:text-foreground after:bottom-0 after:bg-brand"
            >
              Agendados ({agendados.length})
            </TabsTrigger>
            <TabsTrigger
              value="historico"
              className="flex-1 rounded-none px-1.5 pb-3 data-active:text-foreground after:bottom-0 after:bg-brand"
            >
              Histórico ({historico.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="agendados" className="space-y-4">
            {agendados.length === 0 ? (
              <EmptyState
                message="Você não tem agendamentos futuros."
                icon={<CalendarCheck className="size-10" />}
              />
            ) : (
              <>
                <div className="space-y-3">
                  {agendadosPg.paged.map((g) => {
                    const empId = resolveEmployeeId(g.primary);
                    return (
                      <AppointmentItem
                        key={g.primary.id}
                        group={g}
                        variant="upcoming"
                        professionalName={
                          empId ? empNameById.get(empId) ?? null : null
                        }
                        photoUrl={empId ? localPhotos[empId] ?? null : null}
                        onCancel={handleCancel}
                        onReschedule={goToAgendar}
                      />
                    );
                  })}
                </div>

                <AgendamentosHelpCard href={`/client/${slug}/agendar`} />

                <ListPaginationBar
                  page={agendadosPg.page}
                  pageSize={agendadosPg.pageSize}
                  totalPages={agendadosPg.totalPages}
                  total={agendadosPg.total}
                  from={agendadosPg.from}
                  to={agendadosPg.to}
                  itemLabel="agendamentos"
                  onPageChange={agendadosPg.goTo}
                  onPageSizeChange={agendadosPg.changePageSize}
                />
              </>
            )}
          </TabsContent>

          <TabsContent value="historico" className="space-y-4">
            {historico.length === 0 ? (
              <EmptyState
                message="Você ainda não tem histórico de agendamentos."
                icon={<CalendarCheck className="size-10" />}
              />
            ) : (
              <>
                <div className="space-y-3">
                  {historicoPg.paged.map((g) => {
                    const empId = resolveEmployeeId(g.primary);
                    return (
                      <AppointmentItem
                        key={g.primary.id}
                        group={g}
                        variant="past"
                        professionalName={
                          empId ? empNameById.get(empId) ?? null : null
                        }
                        photoUrl={empId ? localPhotos[empId] ?? null : null}
                        onRebook={goToAgendar}
                      />
                    );
                  })}
                </div>

                <ListPaginationBar
                  page={historicoPg.page}
                  pageSize={historicoPg.pageSize}
                  totalPages={historicoPg.totalPages}
                  total={historicoPg.total}
                  from={historicoPg.from}
                  to={historicoPg.to}
                  itemLabel="agendamentos"
                  onPageChange={historicoPg.goTo}
                  onPageSizeChange={historicoPg.changePageSize}
                />
              </>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
