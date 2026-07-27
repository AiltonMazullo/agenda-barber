"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  Scissors,
  Clock,
  AlertCircle,
  CalendarPlus,
  CalendarDays,
} from "lucide-react";
import { servicesService } from "@/services/services.service";
import { clientAppointmentsService } from "@/services/client-appointments.service";
import { clientCatalogService } from "@/services/client-catalog.service";
import { BarbershopHero } from "@/components/client/BarbershopHero";
import { FeaturedFlag } from "@/components/client/FeaturedFlag";
import { AppointmentItem } from "@/components/client/AppointmentItem";
import { Loading } from "@/components/shared/Loading";
import { usePublicBarbershop } from "@/contexts/PublicBarbershopContext";
import { useClientAuth } from "@/hooks/useClientAuth";
import { useAppointmentEmployeeMap } from "@/hooks/useAppointmentEmployeeMap";
import type { Service } from "@/types/service.types";
import type { ClientAppointment } from "@/types/appointment.types";
import type { Employee } from "@/types/employee.types";
import { formatServicePrice } from "@/utils/format";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function BarbershopPublicPage({ params }: PageProps) {
  const { slug } = use(params);
  const { barbershop, isLoading, error, notFound } = usePublicBarbershop();
  const { isAuthenticated } = useClientAuth();

  const [services, setServices] = useState<Service[]>([]);
  const [appointments, setAppointments] = useState<ClientAppointment[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const { map: apptEmployeeMap } = useAppointmentEmployeeMap();

  useEffect(() => {
    if (!barbershop) return;
    let active = true;
    servicesService
      .list(barbershop.id)
      .then((list) => {
        if (active) setServices(list);
      })
      .catch(() => {
        /* silencioso — serviços são complemento */
      });
    return () => {
      active = false;
    };
  }, [barbershop]);

  useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;
    clientAppointmentsService
      .listMine()
      .then((list) => {
        if (active) setAppointments(list);
      })
      .catch(() => {
        /* silencioso — widget é complemento da home */
      });
    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  // Lista de profissionais (via catálogo público) para popular `employee` a
  // partir do vínculo local — o backend não retorna o profissional em
  // /me/appointments.
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

  const empById = useMemo(() => {
    const m = new Map<string, Employee>();
    employees.forEach((e) => m.set(e.id, e));
    return m;
  }, [employees]);

  const resolvedAppointments = useMemo(
    () =>
      appointments.map((a) => {
        if (a.employee) return a;
        const empId = a.employeeId ?? apptEmployeeMap[a.id] ?? null;
        const emp = empId ? empById.get(empId) : undefined;
        if (!emp) return a;
        return {
          ...a,
          employee: { id: emp.id, name: emp.name, appName: emp.appName },
        };
      }),
    [appointments, apptEmployeeMap, empById],
  );

  const now = Date.now();
  const allUpcomingAppointments = resolvedAppointments
    .filter(
      (a) =>
        (a.status === "PENDING" || a.status === "CONFIRMED") &&
        new Date(a.scheduledAt).getTime() >= now,
    )
    .sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
    );
  const upcomingAppointments = allUpcomingAppointments.slice(0, 5);

  const agendarHref = isAuthenticated
    ? `/client/${slug}/agendar`
    : `/client/${slug}/login?from=/client/${slug}/agendar`;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {isLoading && <Loading />}

      {notFound && !isLoading && (
        <div className="rounded-lg border border-warning/30 bg-warning/5 p-8 text-center space-y-3">
          <AlertCircle className="size-8 text-warning-foreground mx-auto" />
          <p className="text-sm text-foreground">Barbearia não encontrada.</p>
          <Link
            href="/"
            className="inline-flex h-9 px-5 rounded-md bg-brand text-brand-foreground text-sm font-bold hover:bg-brand-hover transition-colors items-center"
          >
            Voltar à listagem
          </Link>
        </div>
      )}

      {error && !isLoading && !notFound && (
        <div className="rounded-lg border border-danger/30 bg-danger/5 p-8 text-center space-y-2">
          <AlertCircle className="size-8 text-danger-foreground mx-auto" />
          <p className="text-sm text-foreground">{error}</p>
        </div>
      )}

      {barbershop && !isLoading && (
        <>
          <BarbershopHero barbershop={barbershop} />

          <section className="rounded-xl border border-brand/40 bg-linear-to-br from-brand/10 to-brand/5 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <CalendarPlus className="size-6 text-brand shrink-0 mt-0.5" />
              <div>
                <p className="text-base font-bold text-foreground">
                  Pronto para agendar?
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Escolha o serviço, o profissional e o melhor horário em poucos
                  cliques.
                </p>
              </div>
            </div>
            <Link
              href={agendarHref}
              className="inline-flex h-10 px-5 rounded-md bg-brand text-brand-foreground text-sm font-bold hover:bg-brand-hover transition-colors items-center whitespace-nowrap"
            >
              Agendar agora →
            </Link>
          </section>

          {upcomingAppointments.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CalendarDays className="size-4 text-brand" />
                  <h2 className="text-sm font-bold uppercase tracking-widest">
                    Próximos agendamentos
                  </h2>
                </div>
                {allUpcomingAppointments.length > upcomingAppointments.length && (
                  <Link
                    href={`/client/${slug}/agendamentos`}
                    className="text-xs font-medium text-brand hover:underline whitespace-nowrap"
                  >
                    Ver todos
                  </Link>
                )}
              </div>
              <div className="space-y-3">
                {upcomingAppointments.map((appointment) => (
                  <AppointmentItem
                    key={appointment.id}
                    appointment={appointment}
                    variant="upcoming"
                  />
                ))}
              </div>
            </section>
          )}

          <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-lg bg-surface-raised border border-border-subtle p-4 flex items-start gap-3">
              <Mail className="size-4 text-brand shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  E-mail
                </p>
                <p className="text-sm text-foreground truncate">
                  {barbershop.email}
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-surface-raised border border-border-subtle p-4 flex items-start gap-3">
              <Phone className="size-4 text-brand shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Telefone
                </p>
                <p className="text-sm text-foreground">
                  {barbershop.phone ?? "—"}
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-surface-raised border border-border-subtle p-4 flex items-start gap-3">
              <MapPin className="size-4 text-brand shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Endereço
                </p>
                <p className="text-sm text-foreground">
                  {barbershop.address ?? "—"}
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Scissors className="size-4 text-brand" />
              <h2 className="text-sm font-bold uppercase tracking-widest">
                Serviços oferecidos
              </h2>
            </div>

            {services.length === 0 ? (
              <div className="rounded-lg border border-border-subtle bg-surface-raised p-8 text-center text-sm text-muted-foreground">
                Esta barbearia ainda não cadastrou serviços.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {services.map((s) => (
                  <div
                    key={s.id}
                    className="relative rounded-lg border border-border-subtle bg-surface-raised p-4 hover:border-brand/40 transition-colors"
                  >
                    {s.featured && <FeaturedFlag label="Em alta" />}
                    <div className="flex items-start gap-3">
                      <div
                        className="size-3 rounded-full mt-1.5 shrink-0"
                        style={{ backgroundColor: s.hex ?? "#f5b82e" }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-base font-bold text-foreground">
                            {s.name}
                          </h3>
                          <span className="text-base font-bold text-brand whitespace-nowrap">
                            {formatServicePrice(s.priceInCents, s.startingFrom)}
                          </span>
                        </div>
                        {s.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {s.description}
                          </p>
                        )}
                        <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                          <Clock className="size-3" />
                          <span>{s.durationMin} minutos</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
