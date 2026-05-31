/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarCheck,
  AlertCircle,
  User as UserIcon,
} from "lucide-react";
import { toast } from "sonner";
import { ClientHeader } from "@/components/client/ClientHeader";
import { AppointmentItem } from "@/components/client/AppointmentItem";
import { ClientProfileCard } from "@/components/client/ClientProfileCard";
import { Button } from "@/components/ui/button";
import { clientAppointmentsService } from "@/services/client-appointments.service";
import { useClientAuth } from "@/hooks/useClientAuth";
import { usePublicBarbershop } from "@/contexts/PublicBarbershopContext";
import type { Appointment } from "@/types/appointment.types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

type MainTab = "perfil" | "agendamentos";
type ApptTab = "upcoming" | "past" | "cancelled";

export default function MeuPerfilPage({ params }: PageProps) {
  const { slug } = use(params);
  const router = useRouter();
  const { client, isLoading: loadingAuth } = useClientAuth();
  const { barbershop } = usePublicBarbershop();

  const [mainTab, setMainTab] = useState<MainTab>("perfil");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apptTab, setApptTab] = useState<ApptTab>("upcoming");

  useEffect(() => {
    if (!barbershop) return;
    let active = true;
    setIsLoading(true);
    setError(null);
    clientAppointmentsService
      .listMine(barbershop.id)
      .then((data) => {
        if (active) setAppointments(data);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(
          err instanceof Error
            ? err.message
            : "Falha ao carregar agendamentos.",
        );
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [barbershop]);

  const grouped = useMemo(() => {
    const now = new Date();
    const upcoming: Appointment[] = [];
    const past: Appointment[] = [];
    const cancelled: Appointment[] = [];
    for (const a of appointments) {
      if (a.status === "CANCELLED") {
        cancelled.push(a);
        continue;
      }
      if (new Date(a.scheduledAt) >= now && a.status !== "COMPLETED") {
        upcoming.push(a);
      } else {
        past.push(a);
      }
    }
    upcoming.sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
    );
    past.sort(
      (a, b) =>
        new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime(),
    );
    cancelled.sort(
      (a, b) =>
        new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime(),
    );
    return { upcoming, past, cancelled };
  }, [appointments]);

  const activeList = grouped[apptTab];

  async function handleCancel(id: string) {
    if (!barbershop) return;
    const ok = window.confirm("Deseja cancelar este agendamento?");
    if (!ok) return;
    try {
      await clientAppointmentsService.cancel(barbershop.id, id);
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

  const initials = client
    ? client.name
        .split(/\s+/)
        .slice(0, 2)
        .map((p) => p[0])
        .join("")
        .toUpperCase()
    : "?";

  return (
    <div className="min-h-screen bg-surface-base text-foreground">
      <ClientHeader slug={slug} barbershopName={barbershop?.name} />

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Cabeçalho comum */}
        <section className="rounded-xl border border-border-subtle bg-surface-raised p-5 flex items-center gap-4">
          <div className="size-12 rounded-full bg-brand text-brand-foreground grid place-items-center text-sm font-bold shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-foreground truncate">
              {client?.name ?? "Cliente"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {client?.email ?? ""}
            </p>
          </div>
          <Button
            type="button"
            onClick={() => router.push(`/client/${slug}/agendar`)}
            className="bg-brand hover:bg-brand-hover text-brand-foreground font-bold cursor-pointer"
          >
            <CalendarCheck className="size-4 mr-1.5" />
            Novo agendamento
          </Button>
        </section>

        {/* Abas principais */}
        <div className="flex items-center gap-1 border-b border-border-subtle">
          <MainTabButton
            active={mainTab === "perfil"}
            onClick={() => setMainTab("perfil")}
            icon={<UserIcon className="size-3.5" />}
          >
            Perfil
          </MainTabButton>
          <MainTabButton
            active={mainTab === "agendamentos"}
            onClick={() => setMainTab("agendamentos")}
            icon={<CalendarCheck className="size-3.5" />}
          >
            Agendamentos
          </MainTabButton>
        </div>

        {/* Aba Perfil */}
        {mainTab === "perfil" &&
          (loadingAuth ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              Carregando…
            </div>
          ) : client ? (
            <ClientProfileCard client={client} />
          ) : (
            <div className="rounded-lg border border-border-subtle bg-surface-raised p-12 text-center space-y-2">
              <UserIcon className="size-8 text-text-faint mx-auto" />
              <p className="text-sm text-muted-foreground">
                Sessão não encontrada. Faça login novamente.
              </p>
            </div>
          ))}

        {/* Aba Agendamentos */}
        {mainTab === "agendamentos" && (
          <section>
            <div className="flex items-center gap-1 border-b border-border-subtle mb-4">
              <ApptTabButton
                active={apptTab === "upcoming"}
                count={grouped.upcoming.length}
                onClick={() => setApptTab("upcoming")}
              >
                Próximos
              </ApptTabButton>
              <ApptTabButton
                active={apptTab === "past"}
                count={grouped.past.length}
                onClick={() => setApptTab("past")}
              >
                Passados
              </ApptTabButton>
              <ApptTabButton
                active={apptTab === "cancelled"}
                count={grouped.cancelled.length}
                onClick={() => setApptTab("cancelled")}
              >
                Cancelados
              </ApptTabButton>
            </div>

            {isLoading && (
              <div className="text-center py-12 text-muted-foreground text-sm">
                Carregando…
              </div>
            )}

            {error && !isLoading && (
              <div className="rounded-lg border border-danger/30 bg-danger/5 p-6 text-center space-y-2">
                <AlertCircle className="size-6 text-danger-foreground mx-auto" />
                <p className="text-sm text-foreground">{error}</p>
              </div>
            )}

            {!isLoading && !error && activeList.length === 0 && (
              <div className="rounded-lg border border-border-subtle bg-surface-raised p-12 text-center space-y-2">
                <CalendarCheck className="size-8 text-text-faint mx-auto" />
                <p className="text-sm text-muted-foreground">
                  {apptTab === "upcoming"
                    ? "Nenhum agendamento futuro."
                    : apptTab === "past"
                      ? "Nenhum agendamento passado."
                      : "Nenhum agendamento cancelado."}
                </p>
              </div>
            )}

            {!isLoading && !error && activeList.length > 0 && (
              <div className="space-y-3">
                {activeList.map((a) => (
                  <AppointmentItem
                    key={a.id}
                    appointment={a}
                    variant={apptTab}
                    onCancel={apptTab === "upcoming" ? handleCancel : undefined}
                    onRebook={apptTab === "past" ? handleRebook : undefined}
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

function MainTabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2.5 text-sm font-bold cursor-pointer border-b-2 transition-colors -mb-px flex items-center gap-2 ${
        active
          ? "border-brand text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

function ApptTabButton({
  active,
  count,
  onClick,
  children,
}: {
  active: boolean;
  count: number;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2.5 text-xs font-bold cursor-pointer border-b-2 transition-colors -mb-px flex items-center gap-2 ${
        active
          ? "border-brand text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
      <span
        className={`text-[10px] px-1.5 py-0.5 rounded-full ${
          active
            ? "bg-brand text-brand-foreground"
            : "bg-surface-base text-muted-foreground"
        }`}
      >
        {count}
      </span>
    </button>
  );
}
