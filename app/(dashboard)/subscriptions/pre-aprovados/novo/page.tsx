"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { PageHeader, DatePickerField, SelectField } from "@/components/shared";
import { useAuth } from "@/hooks/useAuth";
import { useClients } from "@/hooks/useClients";
import { usePlans } from "@/hooks/usePlans";
import { useEmployees } from "@/hooks/useEmployees";
import { usePreApprovedClients } from "@/hooks/usePreApprovedClients";

export default function NovoPreAprovadoPage() {
  const router = useRouter();
  const { barbershop } = useAuth();
  const { clients } = useClients(barbershop?.id);
  const { plans } = usePlans(barbershop?.id);
  const { employees } = useEmployees(barbershop?.id);
  const { create } = usePreApprovedClients(barbershop?.id);

  const [clientId, setClientId] = useState("");
  const [planId, setPlanId] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [soldByEmployeeId, setSoldByEmployeeId] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (!clientId || !planId || !startDate) return;
    setSaving(true);
    const created = await create({
      clientId,
      planId,
      startDate: startDate.toISOString(),
      soldByEmployeeId: soldByEmployeeId || undefined,
    });
    setSaving(false);
    if (created) router.push("/subscriptions/pre-aprovados");
  }

  return (
    <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
      <PageHeader
        title="Novo cliente pré-aprovado"
        subtitle="Criar novo cliente com plano pré-aprovado"
        actions={
          <Link
            href="/subscriptions/pre-aprovados"
            className="h-9 px-4 rounded-md border border-border bg-surface-raised text-sm text-foreground hover:bg-surface-elevated transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="size-3.5" />
            Voltar
          </Link>
        }
      />

      <div className="rounded-xl border border-border bg-surface-raised p-5 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <SelectField
            id="client"
            label="Cliente *"
            value={clientId}
            onChange={setClientId}
            placeholder="Selecione o cliente"
            options={clients.map((c) => ({ value: c.id, label: c.name }))}
          />
          <SelectField
            id="plan"
            label="Plano *"
            value={planId}
            onChange={setPlanId}
            placeholder="Selecione o plano"
            options={plans.map((p) => ({ value: p.id, label: p.name }))}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <DatePickerField id="startDate" label="Data início" date={startDate} onChange={setStartDate} />
          <SelectField
            id="soldBy"
            label="Quem vendeu? *"
            value={soldByEmployeeId}
            onChange={setSoldByEmployeeId}
            placeholder="Selecione o vendedor"
            options={employees.map((e) => ({ value: e.id, label: e.name }))}
          />
        </div>

        <p className="text-xs text-muted-foreground">
          Ao salvar, uma sessão de checkout é gerada no gateway ativo da barbearia — use
          &quot;Enviar link&quot; na listagem para copiar a URL e mandar pro cliente.
        </p>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!clientId || !planId || !startDate || saving}
            className="h-10 px-5 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <Save className="size-3.5" />
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}
