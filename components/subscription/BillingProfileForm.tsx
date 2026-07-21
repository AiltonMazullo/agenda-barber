"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { platformSubscriptionService } from "@/services/platform-subscription.service";
import { fetchAddressByCep } from "@/utils/cep";
import { maskCep, maskPhone } from "@/utils/format";
import type { BillingProfile } from "@/types/platform-subscription.types";

interface BillingProfileFormProps {
  profile: BillingProfile;
  onSaved: (profile: BillingProfile) => void;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
      {children}
    </label>
  );
}

/** Form inline pra completar telefone/endereço exigidos pela ASAAS antes de assinar. */
export function BillingProfileForm({ profile, onSaved }: BillingProfileFormProps) {
  const [form, setForm] = useState({
    phone: profile.phone,
    cep: profile.cep,
    street: profile.street,
    number: profile.number,
    neighborhood: profile.neighborhood,
    city: profile.city,
    uf: profile.uf,
  });
  const [cepLoading, setCepLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleCepBlur() {
    if (form.cep.replace(/\D/g, "").length !== 8) return;
    setCepLoading(true);
    try {
      const address = await fetchAddressByCep(form.cep);
      if (address) {
        setForm((prev) => ({
          ...prev,
          street: address.street || prev.street,
          neighborhood: address.neighborhood || prev.neighborhood,
          city: address.city || prev.city,
          uf: address.uf || prev.uf,
        }));
      } else {
        toast.error("CEP não encontrado.");
      }
    } finally {
      setCepLoading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (Object.values(form).some((v) => v.trim().length === 0)) {
      toast.error("Preencha todos os campos.");
      return;
    }
    if (form.uf.trim().length !== 2) {
      toast.error("UF inválida.");
      return;
    }
    setSaving(true);
    try {
      const updated = await platformSubscriptionService.updateBillingProfile({
        ...form,
        uf: form.uf.trim().toUpperCase(),
      });
      toast.success("Dados de cobrança salvos.");
      onSaved(updated);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-start gap-2 rounded-lg bg-brand/10 border border-brand/30 p-3 text-sm text-foreground">
        <MapPin className="size-4 shrink-0 mt-0.5 text-brand" />
        <p>
          A ASAAS exige telefone e endereço completos para processar a cobrança recorrente.
          Complete os dados abaixo para assinar.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <FieldLabel>Telefone</FieldLabel>
          <Input
            value={form.phone}
            onChange={(e) => update("phone", maskPhone(e.target.value))}
            placeholder="(11) 99999-0000"
          />
        </div>
        <div className="space-y-1.5">
          <FieldLabel>CEP</FieldLabel>
          <Input
            value={form.cep}
            onChange={(e) => update("cep", maskCep(e.target.value))}
            onBlur={handleCepBlur}
            placeholder="00000-000"
            disabled={cepLoading}
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <FieldLabel>Rua</FieldLabel>
          <Input value={form.street} onChange={(e) => update("street", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <FieldLabel>Número</FieldLabel>
          <Input value={form.number} onChange={(e) => update("number", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <FieldLabel>Bairro</FieldLabel>
          <Input
            value={form.neighborhood}
            onChange={(e) => update("neighborhood", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <FieldLabel>Cidade</FieldLabel>
          <Input value={form.city} onChange={(e) => update("city", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <FieldLabel>UF</FieldLabel>
          <Input
            value={form.uf}
            onChange={(e) => update("uf", e.target.value.toUpperCase().slice(0, 2))}
            placeholder="SP"
            maxLength={2}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="h-10 px-4 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors disabled:opacity-50"
      >
        {saving ? "Salvando…" : "Salvar dados de cobrança"}
      </button>
    </form>
  );
}
