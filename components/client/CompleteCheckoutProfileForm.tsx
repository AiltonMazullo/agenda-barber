"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useClientAuth } from "@/hooks/useClientAuth";
import { maskPhone, maskCpf, maskCep } from "@/utils/format";
import type { Client, UpdateMePayload } from "@/types/client.types";

interface CompleteCheckoutProfileFormProps {
  client: Client;
  onCancel: () => void;
  onSaved: () => void;
}

function digits(value: string): string {
  return value.replace(/\D/g, "");
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "bg-surface-base border-border text-foreground placeholder:text-text-faint focus-visible:ring-brand/30 h-10";

/**
 * Versão enxuta de `ClientProfileForm` — coleta só os campos que a ASAAS
 * exige pra gerar a cobrança (CPF, telefone, endereço; ver
 * `isProfileCompleteForCheckout` em `plano/page.tsx`), sem os demais campos
 * do cadastro completo (nascimento, senha, notificações etc.). Reaproveita o
 * mesmo `PUT /clients/me` — atualiza o cadastro de verdade, não é um form à parte.
 */
export function CompleteCheckoutProfileForm({
  client,
  onCancel,
  onSaved,
}: CompleteCheckoutProfileFormProps) {
  const { updateProfile } = useClientAuth();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    phone: client.phone ? maskPhone(client.phone) : "",
    cpf: client.cpf ? maskCpf(client.cpf) : "",
    cep: client.cep ? maskCep(client.cep) : "",
    street: client.street ?? "",
    number: client.number ?? "",
    neighborhood: client.neighborhood ?? "",
    city: client.city ?? "",
    uf: client.uf ?? "",
  });

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function buildPayload(): UpdateMePayload {
    const payload: UpdateMePayload = {};
    const addText = (
      key: "street" | "number" | "neighborhood" | "city" | "uf",
      value: string,
      original: string | null,
    ) => {
      const trimmed = value.trim();
      if (trimmed !== (original ?? "")) payload[key] = trimmed;
    };

    addText("street", form.street, client.street);
    addText("number", form.number, client.number);
    addText("neighborhood", form.neighborhood, client.neighborhood);
    addText("city", form.city, client.city);
    addText("uf", form.uf, client.uf);

    const phoneDigits = digits(form.phone);
    if (phoneDigits !== (client.phone ?? "")) payload.phone = phoneDigits;

    const cpfDigits = digits(form.cpf);
    if (cpfDigits !== (client.cpf ?? "")) payload.cpf = cpfDigits;

    const cepDigits = digits(form.cep);
    if (cepDigits !== (client.cep ?? "")) payload.cep = cepDigits;

    return payload;
  }

  function validate(): string | null {
    if (digits(form.phone).length < 10) return "Informe um telefone válido.";
    if (digits(form.cpf).length !== 11) return "Informe um CPF válido.";
    if (digits(form.cep).length !== 8) return "Informe um CEP válido.";
    if (!form.street.trim()) return "Informe o logradouro.";
    if (!form.number.trim()) return "Informe o número.";
    if (!form.neighborhood.trim()) return "Informe o bairro.";
    if (!form.city.trim()) return "Informe a cidade.";
    if (form.uf.trim().length !== 2) return "Informe a UF (2 letras).";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }
    const payload = buildPayload();
    if (Object.keys(payload).length === 0) {
      onSaved();
      return;
    }
    setSaving(true);
    try {
      await updateProfile(payload);
      toast.success("Cadastro completo!");
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao atualizar cadastro.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Telefone">
          <Input
            value={form.phone}
            onChange={(e) => set("phone", maskPhone(e.target.value))}
            inputMode="numeric"
            placeholder="(00) 00000-0000"
            className={inputClass}
          />
        </Field>
        <Field label="CPF">
          <Input
            value={form.cpf}
            onChange={(e) => set("cpf", maskCpf(e.target.value))}
            inputMode="numeric"
            placeholder="000.000.000-00"
            className={inputClass}
          />
        </Field>
        <Field label="CEP">
          <Input
            value={form.cep}
            onChange={(e) => set("cep", maskCep(e.target.value))}
            inputMode="numeric"
            placeholder="00000-000"
            className={inputClass}
          />
        </Field>
        <Field label="Logradouro">
          <Input
            value={form.street}
            onChange={(e) => set("street", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Número">
          <Input
            value={form.number}
            onChange={(e) => set("number", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Bairro">
          <Input
            value={form.neighborhood}
            onChange={(e) => set("neighborhood", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Cidade">
          <Input
            value={form.city}
            onChange={(e) => set("city", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="UF">
          <Input
            value={form.uf}
            onChange={(e) => set("uf", e.target.value.toUpperCase().slice(0, 2))}
            maxLength={2}
            placeholder="SP"
            className={inputClass}
          />
        </Field>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="h-10 px-5 rounded-md border border-border bg-transparent text-sm text-foreground hover:bg-surface-elevated transition-colors disabled:opacity-60"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving}
          className="h-10 px-5 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors disabled:opacity-60"
        >
          {saving ? "Salvando…" : "Salvar e continuar"}
        </button>
      </div>
    </form>
  );
}
