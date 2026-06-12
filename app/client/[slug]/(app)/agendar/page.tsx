"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Scissors,
  Users,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { clientCatalogService } from "@/services/client-catalog.service";
import { clientAppointmentsService } from "@/services/client-appointments.service";
import { availabilityService } from "@/services/availability.service";
import { FilialSelectCard } from "@/components/client/FilialSelectCard";
import { ServicoSelectCard } from "@/components/client/ServicoSelectCard";
import { ProfissionalSelectCard } from "@/components/client/ProfissionalSelectCard";
import { HoraGrid } from "@/components/client/HoraGrid";
import { usePublicBarbershop } from "@/contexts/PublicBarbershopContext";
import { useClientAuth } from "@/hooks/useClientAuth";
import { useAppointmentEmployeeMap } from "@/hooks/useAppointmentEmployeeMap";
import { useLocalProfessionalPhotos } from "@/hooks/useLocalProfessionalPhotos";
import { apiAssetUrl } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { DatePickerField } from "@/components/shared";
import { Loading } from "@/components/shared/Loading";
import { getClientIdFromToken } from "@/lib/client-api";
import type { Service } from "@/types/service.types";
import type { Employee } from "@/types/employee.types";
import type { Branch } from "@/types/branch.types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Fluxo: Filial → Profissional → Serviço → Data/Hora → Confirmação
type Step = 1 | 2 | 3 | 4 | 5;

const SLOT_START_HOUR = 8;
const SLOT_END_HOUR = 20;
const SLOT_INTERVAL_MIN = 30;

function generateSlots(): string[] {
  const out: string[] = [];
  for (let h = SLOT_START_HOUR; h < SLOT_END_HOUR; h++) {
    for (let m = 0; m < 60; m += SLOT_INTERVAL_MIN) {
      out.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
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

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function slotToMinutes(slot: string): number {
  const [h, m] = slot.split(":").map((n) => parseInt(n, 10));
  return h * 60 + m;
}

function dateToISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export default function AgendarPage({ params }: PageProps) {
  const { slug } = use(params);
  const router = useRouter();
  const { barbershop, isLoading: loadingBarbershop } = usePublicBarbershop();
  const { client, isLoading: loadingAuth } = useClientAuth();
  const { setEmployee: setLocalEmployee } = useAppointmentEmployeeMap();

  const [step, setStep] = useState<Step>(1);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [branchesError, setBranchesError] = useState<string | null>(null);
  const [employeesError, setEmployeesError] = useState<string | null>(null);

  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );
  const [anyEmployee, setAnyEmployee] = useState(false);

  const [date, setDate] = useState<Date | undefined>(() => new Date());
  const [time, setTime] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!barbershop) return;
    let active = true;
    setLoadingCatalog(true);
    setBranchesError(null);
    setEmployeesError(null);

    async function loadCatalog(bs: NonNullable<typeof barbershop>) {
      // `GET /barbershops/:slug` já traz `branches`, `services` e `employees`
      // aninhados (visão do cliente). Usamos esses; se algo não veio aninhado
      // (ex.: o contexto caiu no fallback da listagem), refazemos a busca pelo
      // slug — é a única rota que expõe o catálogo para o token de cliente.
      let brs = bs.branches ?? [];
      let svc = bs.services ?? [];
      let emp = bs.employees ?? [];

      if (brs.length === 0 || svc.length === 0 || emp.length === 0) {
        try {
          const catalog = await clientCatalogService.getCatalog(bs.slug);
          if (brs.length === 0) brs = catalog.branches;
          if (svc.length === 0) svc = catalog.services;
          if (emp.length === 0) emp = catalog.employees;
        } catch (err) {
          const msg =
            err instanceof Error ? err.message : "Falha ao carregar o catálogo.";
          if (brs.length === 0) setBranchesError(msg);
          if (emp.length === 0) setEmployeesError(msg);
        }
      }

      if (!active) return;
      setBranches(brs);
      setServices(svc);
      setEmployees(emp);
      // Se só há uma filial, já seleciona.
      if (brs.length === 1) setSelectedBranch(brs[0]);
      setLoadingCatalog(false);
    }

    void loadCatalog(barbershop);

    return () => {
      active = false;
    };
  }, [barbershop]);

  // Foto local (cadastro do dono) como fallback enquanto o backend não
  // persiste o avatarUrl — válida quando dono e cliente usam o mesmo navegador.
  const localPhotos = useLocalProfessionalPhotos(
    barbershop?.id,
    employees.map((e) => e.id),
  );

  // Há filiais? Se não (caso raro), o passo "Filial" é pulado e todos os
  // profissionais ficam disponíveis.
  const hasBranches = branches.length > 0;
  const minStep: Step = hasBranches ? 1 : 2;

  // Profissionais da filial escolhida (Employee.branchId). Sem filiais →
  // todos os profissionais da barbearia.
  const branchEmployees = useMemo(() => {
    if (!hasBranches) return employees;
    if (!selectedBranch) return [];
    return employees.filter((e) => e.branchId === selectedBranch.id);
  }, [employees, selectedBranch, hasBranches]);

  // Sem filiais: não fica parado no passo 1 (Filial).
  useEffect(() => {
    if (!loadingCatalog && !hasBranches && step === 1) setStep(2);
  }, [loadingCatalog, hasBranches, step]);

  // Horários livres vindos da API (por profissional + serviço + dia).
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    const firstService = selectedServices[0];
    if (step !== 4 || !barbershop || !firstService || !date) return;
    let active = true;
    setLoadingSlots(true);
    availabilityService
      .getAvailableSlots(barbershop.id, {
        employeeId: anyEmployee ? undefined : selectedEmployee?.id,
        serviceId: firstService.id,
        date: dateToISODate(date),
      })
      .then((s) => {
        if (active) setAvailableSlots(s);
      })
      .catch(() => {
        if (active) setAvailableSlots(generateSlots());
      })
      .finally(() => {
        if (active) setLoadingSlots(false);
      });
    return () => {
      active = false;
    };
  }, [step, barbershop, selectedServices, selectedEmployee, anyEmployee, date]);

  // Salvaguarda: se a data é hoje, desabilita horários que já passaram.
  const busy = useMemo(() => {
    const s = new Set<string>();
    if (date && isSameDay(date, new Date())) {
      const now = new Date();
      const nowMin = now.getHours() * 60 + now.getMinutes();
      for (const slot of availableSlots) {
        if (slotToMinutes(slot) <= nowMin) s.add(slot);
      }
    }
    return s;
  }, [availableSlots, date]);

  function nextStep() {
    setStep((s) => (s < 5 ? ((s + 1) as Step) : s));
  }
  function prevStep() {
    setStep((s) => (s > minStep ? ((s - 1) as Step) : s));
  }

  async function handleConfirm() {
    if (!barbershop || selectedServices.length === 0 || !date || !time) return;

    // "Sem preferência" → sorteia um profissional da filial (o backend exige
    // employeeId). Caso específico → usa o escolhido.
    const effectiveEmployee = anyEmployee
      ? branchEmployees[Math.floor(Math.random() * branchEmployees.length)]
      : selectedEmployee;
    if (!effectiveEmployee) {
      toast.error("Selecione um profissional.");
      return;
    }

    // Garante que há sessão de cliente; o `clientId` em si NÃO vai no payload —
    // o backend usa `req.user.sub` (token). Enviar clientId é ignorado.
    const clientId = client?.id ?? getClientIdFromToken();
    if (!clientId) {
      toast.error("Sua sessão expirou. Faça login novamente.");
      router.push(`/client/${slug}/login`);
      return;
    }

    const [hh, mm] = time.split(":").map((n) => parseInt(n, 10));
    const baseStart = new Date(date);
    baseStart.setHours(hh, mm, 0, 0);

    if (baseStart.getTime() < Date.now()) {
      toast.error("Não é possível agendar em um horário que já passou.");
      return;
    }

    setSubmitting(true);
    try {
      // O backend cria um agendamento por serviço; encadeamos os serviços em
      // sequência a partir do horário escolhido (cada um após o anterior).
      let cursor = new Date(baseStart);
      for (const svc of selectedServices) {
        const appt = await clientAppointmentsService.create(barbershop.id, {
          serviceId: svc.id,
          employeeId: effectiveEmployee.id,
          scheduledAt: cursor.toISOString(),
        });
        setLocalEmployee(appt.id, effectiveEmployee.id);
        cursor = new Date(cursor.getTime() + svc.durationMin * 60000);
      }
      toast.success(
        selectedServices.length > 1
          ? "Agendamentos confirmados!"
          : "Agendamento confirmado!",
      );
      router.push(`/client/${slug}/agendamentos`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Falha ao confirmar agendamento.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const canAdvance =
    (step === 1 && selectedBranch !== null) ||
    (step === 2 && (anyEmployee || selectedEmployee !== null)) ||
    (step === 3 && selectedServices.length > 0) ||
    (step === 4 && date !== undefined && time !== null) ||
    step === 5;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <Stepper step={step} hasBranches={hasBranches} />

      {loadingBarbershop || loadingCatalog ? (
        <Loading />
      ) : (
        <>
          {step === 1 && (
            <StepWrapper
              icon={<Building2 className="size-4" />}
              title="Escolha a filial"
            >
              {branchesError ? (
                <EmptyState
                  message={`Não foi possível carregar as filiais: ${branchesError}`}
                />
              ) : branches.length === 0 ? (
                <EmptyState message="Esta barbearia ainda não cadastrou filiais." />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {branches.map((b) => (
                    <FilialSelectCard
                      key={b.id}
                      branch={b}
                      selected={selectedBranch?.id === b.id}
                      onSelect={() => {
                        setSelectedBranch(b);
                        // Reseta profissional ao trocar de filial.
                        setSelectedEmployee(null);
                        setAnyEmployee(false);
                      }}
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
              {employeesError ? (
                <EmptyState
                  message={`Não foi possível carregar os profissionais: ${employeesError}`}
                />
              ) : branchEmployees.length === 0 ? (
                <EmptyState message="Esta filial ainda não tem profissionais cadastrados." />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <ProfissionalSelectCard
                    employee={null}
                    selected={anyEmployee}
                    onSelect={() => {
                      setAnyEmployee(true);
                      setSelectedEmployee(null);
                    }}
                  />
                  {branchEmployees.map((e) => (
                    <ProfissionalSelectCard
                      key={e.id}
                      employee={e}
                      photoUrl={
                        apiAssetUrl(e.avatarUrl) ?? localPhotos[e.id] ?? null
                      }
                      selected={!anyEmployee && selectedEmployee?.id === e.id}
                      onSelect={() => {
                        setAnyEmployee(false);
                        setSelectedEmployee(e);
                      }}
                    />
                  ))}
                </div>
              )}
            </StepWrapper>
          )}

          {step === 3 && (
            <StepWrapper
              icon={<Scissors className="size-4" />}
              title="Escolha os serviços"
            >
              {services.length === 0 ? (
                <EmptyState message="Esta barbearia ainda não cadastrou serviços." />
              ) : (
                <>
                  <p className="text-xs text-muted-foreground -mt-1">
                    Você pode escolher mais de um serviço.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {services.map((s) => (
                      <ServicoSelectCard
                        key={s.id}
                        service={s}
                        selected={selectedServices.some((x) => x.id === s.id)}
                        onSelect={() =>
                          setSelectedServices((prev) =>
                            prev.some((x) => x.id === s.id)
                              ? prev.filter((x) => x.id !== s.id)
                              : [...prev, s],
                          )
                        }
                      />
                    ))}
                  </div>
                </>
              )}
            </StepWrapper>
          )}

          {step === 4 && (
            <StepWrapper
              icon={<CalendarDays className="size-4" />}
              title="Escolha a data e o horário"
            >
              <div className="space-y-4">
                <div className="max-w-xs">
                  <DatePickerField
                    id="agendar-data"
                    label="Data"
                    date={date}
                    onChange={(d) => {
                      setDate(d);
                      setTime(null);
                    }}
                    disabled={{ before: startOfToday() }}
                    defaultMonth={date}
                  />
                </div>

                <div>
                  <label className="text-xs text-muted-foreground block mb-2">
                    Horário
                  </label>
                  {loadingSlots ? (
                    <div className="rounded-lg border border-border-subtle bg-surface-raised p-8 text-center text-sm text-muted-foreground">
                      Buscando horários…
                    </div>
                  ) : (
                    <HoraGrid
                      slots={availableSlots}
                      busy={busy}
                      selected={time}
                      onSelect={setTime}
                    />
                  )}
                </div>
              </div>
            </StepWrapper>
          )}

          {step === 5 && selectedServices.length > 0 && (
            <StepWrapper
              icon={<CheckCircle2 className="size-4" />}
              title="Confirme seu agendamento"
            >
              <div className="rounded-lg border border-border-subtle bg-surface-raised p-5 space-y-3">
                <ResumoLine label="Barbearia" value={barbershop?.name ?? "—"} />
                {hasBranches && (
                  <ResumoLine
                    label="Filial"
                    value={selectedBranch?.name ?? "—"}
                  />
                )}
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
                  label={selectedServices.length > 1 ? "Serviços" : "Serviço"}
                  value={selectedServices.map((s) => s.name).join(", ")}
                />
                <ResumoLine
                  label="Data"
                  value={
                    date
                      ? date.toLocaleDateString("pt-BR", {
                          weekday: "long",
                          day: "2-digit",
                          month: "long",
                        })
                      : "—"
                  }
                />
                <ResumoLine label="Horário" value={time ?? "—"} />
                <ResumoLine
                  label="Duração"
                  value={`${selectedServices.reduce(
                    (a, s) => a + s.durationMin,
                    0,
                  )} min`}
                />
                <div className="pt-3 border-t border-border-subtle flex items-center justify-between">
                  <span className="text-sm font-bold">Total</span>
                  <span className="text-lg font-bold text-brand">
                    {formatBRLFromCents(
                      selectedServices.reduce((a, s) => a + s.priceInCents, 0),
                    )}
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
              disabled={step === minStep || submitting}
              className="gap-1 cursor-pointer"
            >
              <ChevronLeft className="size-4" />
              Voltar
            </Button>

            {step < 5 ? (
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
                disabled={submitting || loadingAuth}
                className="bg-brand hover:bg-brand-hover text-brand-foreground font-bold cursor-pointer disabled:opacity-50"
              >
                {loadingAuth
                  ? "Carregando..."
                  : submitting
                    ? "Confirmando…"
                    : "Confirmar agendamento"}
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function Stepper({ step, hasBranches }: { step: Step; hasBranches: boolean }) {
  const allSteps: Array<{ n: Step; label: string }> = [
    { n: 1, label: "Filial" },
    { n: 2, label: "Profissional" },
    { n: 3, label: "Serviço" },
    { n: 4, label: "Data/Hora" },
    { n: 5, label: "Confirmação" },
  ];
  // Sem filiais, o passo "Filial" é pulado e não aparece no indicador.
  const steps = hasBranches ? allSteps : allSteps.filter((s) => s.n !== 1);
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
