"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useClientAuth } from "@/hooks/useClientAuth";
import { maskPhone, maskCpf, maskCep } from "@/utils/format";
import type { Client, UpdateMePayload } from "@/types/client.types";

interface ClientProfileFormProps {
  client: Client;
  onCancel: () => void;
  onSaved: () => void;
}

/** ISO ("2000-01-01T00:00:00.000Z") -> "2000-01-01" para <input type="date">. */
function isoToDateInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

/** "2000-01-01" -> ISO UTC. */
function dateInputToIso(value: string): string {
  return new Date(`${value}T00:00:00.000Z`).toISOString();
}

function digits(value: string): string {
  return value.replace(/\D/g, "");
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors cursor-pointer ${
          checked ? "bg-brand" : "bg-surface-base border border-border"
        }`}
      >
        <span
          className={`absolute top-0.5 size-5 rounded-full bg-white transition-transform ${
            checked ? "translate-x-[22px]" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border-subtle bg-surface-raised p-5 space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-widest text-brand">
        {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
    </section>
  );
}

const inputClass =
  "bg-surface-base border-border text-foreground placeholder:text-text-faint focus-visible:ring-brand/30 h-10";

export function ClientProfileForm({
  client,
  onCancel,
  onSaved,
}: ClientProfileFormProps) {
  const { updateProfile } = useClientAuth();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: client.name ?? "",
    email: client.email ?? "",
    phone: client.phone ? maskPhone(client.phone) : "",
    birthDate: isoToDateInput(client.birthDate),
    cpf: client.cpf ? maskCpf(client.cpf) : "",
    howMet: client.howMet ?? "",
    password: "",
    cep: client.cep ? maskCep(client.cep) : "",
    street: client.street ?? "",
    number: client.number ?? "",
    complement: client.complement ?? "",
    neighborhood: client.neighborhood ?? "",
    city: client.city ?? "",
    uf: client.uf ?? "",
    remindInSchedule: client.remindInSchedule,
  });

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  /** Monta o payload só com o que mudou em relação ao cadastro atual. */
  function buildPayload(): UpdateMePayload {
    const payload: UpdateMePayload = {};
    const addText = (
      key: Exclude<keyof UpdateMePayload, "remindInSchedule">,
      value: string,
      original: string | null,
    ) => {
      const trimmed = value.trim();
      if (trimmed !== (original ?? "")) {
        payload[key] = trimmed;
      }
    };

    addText("name", form.name, client.name);
    addText("email", form.email, client.email);
    addText("howMet", form.howMet, client.howMet);
    addText("street", form.street, client.street);
    addText("number", form.number, client.number);
    addText("complement", form.complement, client.complement);
    addText("neighborhood", form.neighborhood, client.neighborhood);
    addText("city", form.city, client.city);
    addText("uf", form.uf, client.uf);

    const phoneDigits = digits(form.phone);
    if (phoneDigits !== (client.phone ?? "")) payload.phone = phoneDigits;

    const cpfDigits = digits(form.cpf);
    if (cpfDigits !== (client.cpf ?? "")) payload.cpf = cpfDigits;

    const cepDigits = digits(form.cep);
    if (cepDigits !== (client.cep ?? "")) payload.cep = cepDigits;

    const originalBirth = isoToDateInput(client.birthDate);
    if (form.birthDate && form.birthDate !== originalBirth) {
      payload.birthDate = dateInputToIso(form.birthDate);
    }

    if (form.password.trim()) payload.password = form.password;

    if (form.remindInSchedule !== client.remindInSchedule) {
      payload.remindInSchedule = form.remindInSchedule;
    }

    return payload;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.name.trim().length < 2) {
      toast.error("Informe seu nome.");
      return;
    }
    const payload = buildPayload();
    if (Object.keys(payload).length === 0) {
      toast.info("Nenhuma alteração para salvar.");
      onCancel();
      return;
    }
    setSaving(true);
    try {
      await updateProfile(payload);
      toast.success("Perfil atualizado.");
      onSaved();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Falha ao atualizar perfil.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Section title="Dados pessoais">
        <Field label="Nome">
          <Input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="E-mail">
          <Input
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Telefone">
          <Input
            value={form.phone}
            onChange={(e) => set("phone", maskPhone(e.target.value))}
            inputMode="numeric"
            placeholder="(00) 00000-0000"
            className={inputClass}
          />
        </Field>
        <Field label="Nascimento">
          <Input
            type="date"
            value={form.birthDate}
            onChange={(e) => set("birthDate", e.target.value)}
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
        <Field label="Como conheceu">
          <Input
            value={form.howMet}
            onChange={(e) => set("howMet", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Nova senha (opcional)">
          <Input
            type="password"
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            placeholder="Deixe em branco para manter"
            className={inputClass}
          />
        </Field>
      </Section>

      <Section title="Endereço">
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
        <Field label="Complemento">
          <Input
            value={form.complement}
            onChange={(e) => set("complement", e.target.value)}
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
      </Section>

      <section className="rounded-xl border border-border-subtle bg-surface-raised p-5">
        <h3 className="text-xs font-bold uppercase tracking-widest text-brand mb-4">
          Notificações
        </h3>
        <ToggleRow
          label="Lembretes de agendamento"
          description="Receba lembretes sobre seus próximos agendamentos."
          checked={form.remindInSchedule}
          onChange={(value) => set("remindInSchedule", value)}
        />
      </section>

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
          {saving ? "Salvando…" : "Salvar alterações"}
        </button>
      </div>
    </form>
  );
}
