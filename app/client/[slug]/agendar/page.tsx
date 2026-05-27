"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Scissors,
  Users,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { servicesService } from "@/services/services.service";
import { employeesService } from "@/services/employees.service";
import { clientAppointmentsService } from "@/services/client-appointments.service";
import { ClientHeader } from "@/components/client/ClientHeader";
import { ServicoSelectCard } from "@/components/client/ServicoSelectCard";
import { ProfissionalSelectCard } from "@/components/client/ProfissionalSelectCard";
import { HoraGrid } from "@/components/client/HoraGrid";
import { usePublicBarbershop } from "@/contexts/PublicBarbershopContext";
import { useAppointmentEmployeeMap } from "@/hooks/useAppointmentEmployeeMap";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Service } from "@/types/service.types";
import type { Employee } from "@/types/employee.types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

type Step = 1 | 2 | 3 | 4;

const SLOT_START_HOUR = 8;
const SLOT_END_HOUR = 20;
const SLOT_INTERVAL_MIN = 30;

function generateSlots(): string[] {
  const out: string[] = [];
  for (let h = SLOT_START_HOUR; h < SLOT_END_HOUR; h++) {
    for (let m = 0; m < 60; m += SLOT_INTERVAL_MIN) {
      out.push(
        `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
      );
    }
  }
  return out;
}

function formatBRLFromCents(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function todayISO(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function AgendarPage({ params }: PageProps) {
  const { slug } = use(params);
  const router = useRouter();
  const { barbershop, isLoading: loadingBarbershop } = usePublicBarbershop();
  const { setEmployee: setLocalEmployee } = useAppointmentEmployeeMap();

  const [step, setStep] = useState<Step>(1);
  const [services, setServices] = useState<Service[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );
  const [anyEmployee, setAnyEmployee] = useState(false);

  const [date, setDate] = useState<string>(todayISO());
  const [time, setTime] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!barbershop) return;
    let active = true;
    setLoadingCatalog(true);

    Promise.allSettled([
      servicesService.list(barbershop.id),
      employeesService.list(barbershop.id),
    ]).then(([sRes, eRes]) => {
      if (!active) return;
      if (sRes.status === "fulfilled") setServices(sRes.value);
      if (eRes.status === "fulfilled") setEmployees(eRes.value);
      setLoadingCatalog(false);
    });

    return () => {
      active = false;
    };
  }, [barbershop]);

  const slots = useMemo(generateSlots, []);
  // Sem endpoint de disponibilidade público, o front não sabe quais slots
  // estão ocupados. Mantém todos disponíveis (gap conhecido, ver plano).
  const busy = useMemo(() => new Set<string>(), []);

  function nextStep() {
    setStep((s) => (s < 4 ? ((s + 1) as Step) : s));
  }
  function prevStep() {
    setStep((s) => (s > 1 ? ((s - 1) as Step) : s));
  }

  async function handleConfirm() {
    if (!barbershop || !selectedService || !date || !time) return;
    setSubmitting(true);
    try {
      const [hh, mm] = time.split(":").map((n) => parseInt(n, 10));
      const [yyyy, mo, dd] = date.split("-").map((n) => parseInt(n, 10));
      const scheduledAt = new Date(
        yyyy,
        mo - 1,
        dd,
        hh,
        mm,
        0,
        0,
      ).toISOString();

      const appt = await clientAppointmentsService.create(barbershop.id, {
        serviceId: selectedService.id,
        scheduledAt,
      });

      // Gambiarra: vincula o profissional escolhido localmente (backend
      // ainda não tem employeeId em Appointment).
      if (!anyEmployee && selectedEmployee) {
        setLocalEmployee(appt.id, selectedEmployee.id);
      }

      toast.success("Agendamento confirmado!");
      router.push(`/client/${slug}/me`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Falha ao confirmar agendamento.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const canAdvance =
    (step === 1 && selectedService !== null) ||
    (step === 2 && (anyEmployee || selectedEmployee !== null)) ||
    (step === 3 && date !== "" && time !== null) ||
    step === 4;

  return (
    <div className="min-h-screen bg-surface-base text-foreground">
      <ClientHeader slug={slug} barbershopName={barbershop?.name} />

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <Stepper step={step} />

        {loadingBarbershop || loadingCatalog ? (
          <div className="text-center py-20 text-muted-foreground text-sm">
            Carregando…
          </div>
        ) : (
          <>
            {step === 1 && (
              <StepWrapper
                icon={<Scissors className="size-4" />}
                title="Escolha o serviço"
              >
                {services.length === 0 ? (
                  <EmptyState message="Esta barbearia ainda não cadastrou serviços." />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {services.map((s) => (
                      <ServicoSelectCard
                        key={s.id}
                        service={s}
                        selected={selectedService?.id === s.id}
                        onSelect={() => setSelectedService(s)}
                      />
                    ))}
                  </div>
                )}
              </StepWrapper>
            )}

            {step === 2 && (
              <StepWrapper
                icon={<Users className="size-4" />}
                title="Escolha o profissional"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <ProfissionalSelectCard
                    employee={null}
                    selected={anyEmployee}
                    onSelect={() => {
                      setAnyEmployee(true);
                      setSelectedEmployee(null);
                    }}
                  />
                  {employees.map((e) => (
                    <ProfissionalSelectCard
                      key={e.id}
                      employee={e}
                      selected={!anyEmployee && selectedEmployee?.id === e.id}
                      onSelect={() => {
                        setAnyEmployee(false);
                        setSelectedEmployee(e);
                      }}
                    />
                  ))}
                </div>
                {employees.length === 0 && !anyEmployee && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Esta barbearia ainda não cadastrou profissionais — selecione
                    “Sem preferência” para continuar.
                  </p>
                )}
              </StepWrapper>
            )}

            {step === 3 && (
              <StepWrapper
                icon={<CalendarDays className="size-4" />}
                title="Escolha a data e o horário"
              >
                <div className="space-y-4">
                  <div className="max-w-xs">
                    <label className="text-xs text-muted-foreground block mb-1.5">
                      Data
                    </label>
                    <Input
                      type="date"
                      value={date}
                      min={todayISO()}
                      onChange={(e) => {
                        setDate(e.target.value);
                        setTime(null);
                      }}
                      className="bg-surface-raised border-border-subtle"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground block mb-2">
                      Horário
                    </label>
                    <HoraGrid
                      slots={slots}
                      busy={busy}
                      selected={time}
                      onSelect={setTime}
                    />
                  </div>
                </div>
              </StepWrapper>
            )}

            {step === 4 && selectedService && (
              <StepWrapper
                icon={<CheckCircle2 className="size-4" />}
                title="Confirme seu agendamento"
              >
                <div className="rounded-lg border border-border-subtle bg-surface-raised p-5 space-y-3">
                  <ResumoLine label="Barbearia" value={barbershop?.name ?? "—"} />
                  <ResumoLine label="Serviço" value={selectedService.name} />
                  <ResumoLine
                    label="Profissional"
                    value={
                      anyEmployee
                        ? "Sem preferência"
                        : selectedEmployee?.appName ??
                          selectedEmployee?.name ??
                          "—"
                    }
                  />
                  <ResumoLine
                    label="Data"
                    value={new Date(`${date}T00:00:00`).toLocaleDateString(
                      "pt-BR",
                      { weekday: "long", day: "2-digit", month: "long" },
                    )}
                  />
                  <ResumoLine label="Horário" value={time ?? "—"} />
                  <ResumoLine
                    label="Duração"
                    value={`${selectedService.durationMin} min`}
                  />
                  <div className="pt-3 border-t border-border-subtle flex items-center justify-between">
                    <span className="text-sm font-bold">Total</span>
                    <span className="text-lg font-bold text-brand">
                      {formatBRLFromCents(selectedService.priceInCents)}
                    </span>
                  </div>
                </div>
              </StepWrapper>
            )}

            <div className="flex items-center justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={step === 1 || submitting}
                className="gap-1 cursor-pointer"
              >
                <ChevronLeft className="size-4" />
                Voltar
              </Button>

              {step < 4 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={!canAdvance}
                  className="gap-1 bg-brand hover:bg-brand-hover text-brand-foreground font-bold cursor-pointer disabled:opacity-50"
                >
                  Avançar
                  <ChevronRight className="size-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={() => void handleConfirm()}
                  disabled={submitting}
                  className="bg-brand hover:bg-brand-hover text-brand-foreground font-bold cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "Confirmando…" : "Confirmar agendamento"}
                </Button>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function Stepper({ step }: { step: Step }) {
  const steps: Array<{ n: Step; label: string }> = [
    { n: 1, label: "Serviço" },
    { n: 2, label: "Profissional" },
    { n: 3, label: "Data/Hora" },
    { n: 4, label: "Confirmação" },
  ];
  return (
    <ol className="flex items-center gap-1.5 text-xs">
      {steps.map((s, idx) => {
        const active = step === s.n;
        const done = step > s.n;
        return (
          <li key={s.n} className="flex items-center gap-1.5 flex-1">
            <div
              className={`size-6 rounded-full grid place-items-center text-[10px] font-bold shrink-0 ${
                done
                  ? "bg-brand/30 text-brand"
                  : active
                    ? "bg-brand text-brand-foreground"
                    : "bg-surface-raised text-muted-foreground border border-border-subtle"
              }`}
            >
              {s.n}
            </div>
            <span
              className={`hidden sm:inline truncate ${
                active ? "text-foreground font-bold" : "text-muted-foreground"
              }`}
            >
              {s.label}
            </span>
            {idx < steps.length - 1 && (
              <div
                className={`flex-1 h-px ${done ? "bg-brand/40" : "bg-border-subtle"}`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function StepWrapper({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2 text-brand">
        {icon}
        <h2 className="text-sm font-bold uppercase tracking-widest text-foreground">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-border-subtle bg-surface-raised p-8 text-center space-y-2">
      <AlertCircle className="size-6 text-text-faint mx-auto" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

function ResumoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground capitalize">{value}</span>
    </div>
  );
}
