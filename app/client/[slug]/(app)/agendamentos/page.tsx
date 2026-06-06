/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarCheck, AlertCircle, CalendarPlus } from "lucide-react";
import { toast } from "sonner";
import { AppointmentItem } from "@/components/client/AppointmentItem";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loading } from "@/components/shared/Loading";
import { clientAppointmentsService } from "@/services/client-appointments.service";
import type { ClientAppointment } from "@/types/appointment.types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function AgendamentosPage({ params }: PageProps) {
  const { slug } = use(params);
  const router = useRouter();

  const [appointments, setAppointments] = useState<ClientAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const { agendados, historico } = useMemo(() => {
    const now = new Date();
    const agendados: ClientAppointment[] = [];
    const historico: ClientAppointment[] = [];
    for (const a of appointments) {
      const isFuture = new Date(a.scheduledAt) >= now;
      const isOpen = a.status === "PENDING" || a.status === "CONFIRMED";
      if (isFuture && isOpen) {
        agendados.push(a);
      } else {
        historico.push(a);
      }
    }
    agendados.sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
    );
    historico.sort(
      (a, b) =>
        new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime(),
    );
    return { agendados, historico };
  }, [appointments]);

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

  function handleRebook() {
    router.push(`/client/${slug}/agendar`);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Meus agendamentos</h1>
        <Button
          type="button"
          onClick={() => router.push(`/client/${slug}/agendar`)}
          className="bg-brand hover:bg-brand-hover text-brand-foreground font-bold cursor-pointer"
        >
          <CalendarPlus className="size-4 mr-1.5" />
          Novo
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
        <Tabs defaultValue="agendados">
          <TabsList className="w-full">
            <TabsTrigger value="agendados">
              Agendados ({agendados.length})
            </TabsTrigger>
            <TabsTrigger value="historico">
              Histórico ({historico.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="agendados">
            {agendados.length === 0 ? (
              <EmptyAppointments message="Você não tem agendamentos futuros." />
            ) : (
              <div className="space-y-3">
                {agendados.map((a) => (
                  <AppointmentItem
                    key={a.id}
                    appointment={a}
                    variant="upcoming"
                    onCancel={handleCancel}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="historico">
            {historico.length === 0 ? (
              <EmptyAppointments message="Você ainda não tem histórico de agendamentos." />
            ) : (
              <div className="space-y-3">
                {historico.map((a) => (
                  <AppointmentItem
                    key={a.id}
                    appointment={a}
                    variant="past"
                    onRebook={handleRebook}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function EmptyAppointments({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-border-subtle bg-surface-raised p-12 text-center space-y-2">
      <CalendarCheck className="size-8 text-text-faint mx-auto" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
