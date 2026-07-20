"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader, Loading, SelectField } from "@/components/shared";
import { useAuth } from "@/hooks/useAuth";
import { useSubscriptionCalendar } from "@/hooks/useSubscriptionCalendar";
import { formatBRL } from "@/utils/format";
import type { SubscriptionBillingType } from "@/types/subscription.types";

const WEEKDAYS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

const TYPE_OPTIONS: { value: SubscriptionBillingType | "TODOS"; label: string }[] = [
  { value: "TODOS", label: "Todos" },
  { value: "GATEWAY", label: "Cel Cash" },
  { value: "MANUAL", label: "Manual" },
];

export default function CalendarioAssinaturasPage() {
  const { barbershop } = useAuth();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [type, setType] = useState<SubscriptionBillingType | "TODOS">("TODOS");

  const { calendar, isLoading } = useSubscriptionCalendar(
    barbershop?.id,
    month,
    year,
    type === "TODOS" ? undefined : type,
  );

  const monthLabel = useMemo(
    () =>
      new Date(year, month - 1, 1).toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
      }),
    [year, month],
  );

  const days = useMemo(() => {
    const firstWeekday = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();
    const cells: (number | null)[] = Array.from({ length: firstWeekday }, () => null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  }, [year, month]);

  function goToMonth(delta: number) {
    let m = month + delta;
    let y = year;
    if (m < 1) {
      m = 12;
      y -= 1;
    } else if (m > 12) {
      m = 1;
      y += 1;
    }
    setMonth(m);
    setYear(y);
  }

  function valueForDay(day: number): number | undefined {
    const iso = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return calendar[iso];
  }

  return (
    <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
      <PageHeader
        title="Calendário de assinaturas"
        subtitle="Previsão de valores por dia de cobrança"
        actions={
          <Link
            href="/subscriptions"
            className="h-9 px-4 rounded-md border border-border bg-surface-raised text-sm text-foreground hover:bg-surface-elevated transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="size-3.5" />
            Voltar
          </Link>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <SelectField
          id="billingType"
          label="Tipo de assinatura"
          value={type}
          onChange={setType}
          options={TYPE_OPTIONS}
        />
      </div>

      <div className="rounded-xl border border-border bg-surface-raised p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => goToMonth(-1)}
            className="size-8 rounded-md border border-border flex items-center justify-center hover:bg-surface-elevated transition-colors"
          >
            <ChevronLeft className="size-4" />
          </button>
          <p className="text-sm font-bold text-foreground capitalize">{monthLabel}</p>
          <button
            type="button"
            onClick={() => goToMonth(1)}
            className="size-8 rounded-md border border-border flex items-center justify-center hover:bg-surface-elevated transition-colors"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        {isLoading ? (
          <Loading />
        ) : (
          <div className="grid grid-cols-7 gap-1.5">
            {WEEKDAYS.map((w) => (
              <div
                key={w}
                className="text-center text-[10px] font-bold uppercase text-muted-foreground py-1"
              >
                {w}
              </div>
            ))}
            {days.map((day, idx) => {
              const value = day != null ? valueForDay(day) : undefined;
              return (
                <div
                  key={idx}
                  className="min-h-[72px] rounded-md border border-border-subtle p-1.5 bg-surface-base"
                >
                  {day != null && (
                    <>
                      <p className="text-[11px] text-muted-foreground">{day}</p>
                      {value != null && value > 0 && (
                        <p className="text-[10px] font-bold text-brand mt-1 break-words">
                          {formatBRL(value / 100)}
                        </p>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
