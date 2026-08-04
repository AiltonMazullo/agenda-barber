"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, DatePickerField, SelectField } from "@/components/shared";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useBranches } from "@/hooks/useBranches";
import { useEmployees } from "@/hooks/useEmployees";
import { usePlans } from "@/hooks/usePlans";
import { useCommissionClub } from "@/hooks/useCommissionClub";
import { commissionClubService } from "@/services/commission-club.service";
import { formatBRL } from "@/utils/format";

type Step = 1 | 2 | 3;

/** O date-picker devolve meia-noite local do dia escolhido. Sem isso,
 *  "período final = 31/07" vira 31/07 00:00 — excluindo o próprio dia 31 dos
 *  dados puxados e deixando a fronteira com o próximo mês colada em vez de
 *  coberta. Empurra para o último instante do dia local antes de mandar pro
 *  backend. */
function endOfLocalDay(date: Date): Date {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
}

export default function NovoCalculoComissaoPage() {
  const router = useRouter();
  const { barbershop } = useAuth();
  const { branches } = useBranches(barbershop?.id);
  const { employees } = useEmployees(barbershop?.id);
  const { plans } = usePlans(barbershop?.id);
  const { create } = useCommissionClub(barbershop?.id);

  // Apenas serviços vinculados a pelo menos um plano ativo (§4.4 — bug
  // confirmado: a tela listava todos os serviços da barbearia, inclusive os
  // que não pertencem a nenhum plano).
  const services = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>();
    for (const plan of plans) {
      for (const ps of plan.planServices) {
        map.set(ps.service.id, ps.service);
      }
    }
    return Array.from(map.values());
  }, [plans]);

  const [step, setStep] = useState<Step>(1);
  const [branchId, setBranchId] = useState("");
  const now = new Date();
  const [periodStart, setPeriodStart] = useState<Date | undefined>(
    new Date(now.getFullYear(), now.getMonth(), 1),
  );
  const [periodEnd, setPeriodEnd] = useState<Date | undefined>(now);
  const [totalServicesByCategory, setTotalServicesByCategory] = useState<Record<string, number>>(
    {},
  );
  const [servicesByEmployee, setServicesByEmployee] = useState<
    Record<string, Record<string, number>>
  >({});
  const [subscriptionRevenue, setSubscriptionRevenue] = useState("");
  const [commissionPercent, setCommissionPercent] = useState("");
  const [saving, setSaving] = useState(false);
  const [suggesting, setSuggesting] = useState(false);

  const branchEmployees = useMemo(
    () => employees.filter((e) => e.branchId === branchId),
    [employees, branchId],
  );

  // Puxa automaticamente os dados (serviços concluídos + receita de
  // assinaturas do período) assim que filial e período estiverem definidos —
  // os valores continuam editáveis manualmente depois de pré-preenchidos.
  useEffect(() => {
    if (!barbershop?.id || !branchId || !periodStart || !periodEnd) return;
    let cancelled = false;
    setSuggesting(true);
    commissionClubService
      .suggest(barbershop.id, {
        branchId,
        periodStart: periodStart.toISOString(),
        periodEnd: endOfLocalDay(periodEnd).toISOString(),
      })
      .then((data) => {
        if (cancelled) return;
        setTotalServicesByCategory(data.totalServicesByCategory);
        setServicesByEmployee(data.servicesByEmployee);
        setSubscriptionRevenue(
          data.subscriptionRevenueInCents > 0
            ? (data.subscriptionRevenueInCents / 100).toFixed(2).replace(".", ",")
            : "",
        );
      })
      .catch((err) => {
        if (!cancelled) {
          toast.error(err instanceof Error ? err.message : "Falha ao puxar dados automaticamente.");
        }
      })
      .finally(() => {
        if (!cancelled) setSuggesting(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só refaz a busca quando filial/período mudam, não a cada edição manual
  }, [barbershop?.id, branchId, periodStart, periodEnd]);

  const totalFichas = Object.values(totalServicesByCategory).reduce((sum, v) => sum + v, 0);
  const poolInCents = Math.round(
    (Number(subscriptionRevenue.replace(",", ".")) || 0) *
      100 *
      ((Number(commissionPercent) || 0) / 100),
  );

  async function handleSubmit() {
    if (!branchId || !periodStart || !periodEnd) return;
    setSaving(true);
    const created = await create({
      branchId,
      periodStart: periodStart.toISOString(),
      periodEnd: endOfLocalDay(periodEnd).toISOString(),
      totalServicesByCategory,
      servicesByEmployee,
      subscriptionRevenueInCents: Math.round(
        (Number(subscriptionRevenue.replace(",", ".")) || 0) * 100,
      ),
      commissionPercent: Number(commissionPercent) || 0,
    });
    setSaving(false);
    if (created) router.push("/subscriptions/comissao");
  }

  return (
    <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-foreground max-w-3xl">
      <PageHeader
        title="Soma e divisão"
        subtitle="Cálculo do pote de comissão de assinaturas de clube"
        actions={
          <Link
            href="/subscriptions/comissao"
            className="h-9 px-4 rounded-md border border-border bg-surface-raised text-sm text-foreground hover:bg-surface-elevated transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="size-3.5" />
            Voltar
          </Link>
        }
      />

      <div className="rounded-xl border border-border bg-surface-raised overflow-hidden">
        <div className="divide-y divide-border-subtle">
          {(
            [
              { id: 1, label: "Serviços totais da barbearia (Club)" },
              { id: 2, label: "Serviços por barbeiros" },
              { id: 3, label: "Faturamento mensal das assinaturas" },
            ] as const
          ).map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setStep(s.id)}
              className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${
                step === s.id ? "bg-brand/10" : "hover:bg-surface-elevated/50"
              }`}
            >
              <span
                className={`text-sm font-semibold ${step === s.id ? "text-brand" : "text-foreground"}`}
              >
                {s.id}. {s.label}
              </span>
              <span className="text-xs text-muted-foreground">{s.id}/3</span>
            </button>
          ))}
        </div>

        <div className="p-5 border-t border-border-subtle space-y-4">
          {step === 1 && (
            <>
              <div className="flex flex-col sm:flex-row gap-3">
                <SelectField
                  id="branch"
                  label="Filial"
                  value={branchId}
                  onChange={setBranchId}
                  placeholder="Selecione a filial"
                  options={branches.map((b) => ({ value: b.id, label: b.name }))}
                />
                <DatePickerField
                  id="periodStart"
                  label="Período inicial"
                  date={periodStart}
                  onChange={setPeriodStart}
                />
                <DatePickerField
                  id="periodEnd"
                  label="Período final"
                  date={periodEnd}
                  onChange={setPeriodEnd}
                />
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Wand2 className="size-3.5" />
                {suggesting
                  ? "Puxando quantidade de serviços e receita de assinaturas automaticamente…"
                  : "Selecione a filial e o período para puxar os dados automaticamente — os valores continuam editáveis."}
              </p>
              <div className="space-y-2">
                {services.map((svc) => (
                  <div key={svc.id} className="flex items-center gap-3">
                    <span className="flex-1 text-sm text-foreground">{svc.name}</span>
                    <Input
                      type="number"
                      min={0}
                      className="w-28 bg-surface-base border-border text-foreground"
                      value={totalServicesByCategory[svc.name] ?? ""}
                      onChange={(e) =>
                        setTotalServicesByCategory((prev) => ({
                          ...prev,
                          [svc.name]: Number(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground pt-2">
                Total de serviços realizados: <strong>{totalFichas}</strong>
              </p>
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!branchId}
                className="h-9 px-4 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors disabled:opacity-50"
              >
                Continuar
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <p className="text-xs text-muted-foreground">
                Distribuição dos serviços do clube por barbeiro
              </p>
              {branchEmployees.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhum profissional cadastrado nesta filial.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {branchEmployees.map((emp) => (
                    <div key={emp.id} className="space-y-2">
                      <p className="text-sm font-bold text-foreground">{emp.name}</p>
                      {services.map((svc) => (
                        <Field key={svc.id}>
                          <FieldLabel className="text-[10px] text-muted-foreground">
                            {svc.name}
                          </FieldLabel>
                          <Input
                            type="number"
                            min={0}
                            className="bg-surface-base border-border text-foreground"
                            value={servicesByEmployee[emp.id]?.[svc.name] ?? ""}
                            onChange={(e) =>
                              setServicesByEmployee((prev) => ({
                                ...prev,
                                [emp.id]: {
                                  ...prev[emp.id],
                                  [svc.name]: Number(e.target.value) || 0,
                                },
                              }))
                            }
                          />
                        </Field>
                      ))}
                    </div>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={() => setStep(3)}
                className="h-9 px-4 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors"
              >
                Continuar
              </button>
            </>
          )}

          {step === 3 && (
            <>
              <p className="text-xs text-muted-foreground">
                Informe o faturamento mensal com assinaturas
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Field className="flex-1">
                  <FieldLabel className="text-[10px] font-bold uppercase tracking-widest text-brand">
                    Valor ganho em assinaturas
                  </FieldLabel>
                  <Input
                    value={subscriptionRevenue}
                    onChange={(e) => setSubscriptionRevenue(e.target.value)}
                    placeholder="R$ 0,00"
                    className="bg-surface-base border-border text-foreground"
                  />
                </Field>
                <Field className="flex-1">
                  <FieldLabel className="text-[10px] font-bold uppercase tracking-widest text-brand">
                    Percentagem de comissão
                  </FieldLabel>
                  <Input
                    value={commissionPercent}
                    onChange={(e) => setCommissionPercent(e.target.value)}
                    placeholder="%"
                    className="bg-surface-base border-border text-foreground"
                  />
                </Field>
              </div>
              <p className="text-sm text-foreground">
                Valor total do pote: <strong>{formatBRL(poolInCents / 100)}</strong>
              </p>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving || !branchId}
                className="h-10 px-5 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors disabled:opacity-50"
              >
                Enviar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
