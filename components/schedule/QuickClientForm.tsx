"use client";

import { useState } from "react";
import { User, Phone, Mail, UserPlus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { maskPhone } from "@/utils/format";
import { toast } from "sonner";
import type { QuickClientInput } from "./types";

const inputClass =
  "bg-surface-base border-border text-foreground placeholder:text-text-faint focus-visible:ring-brand/30 h-9 pl-9";

export function QuickClientForm({
  onSubmit,
  onCancel,
  submitting,
}: {
  onSubmit: (data: QuickClientInput) => void;
  onCancel: () => void;
  submitting?: boolean;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  function handle() {
    if (name.trim().length < 2) {
      toast.error("Informe o nome do cliente.");
      return;
    }
    if (phone.replace(/\D/g, "").length < 10) {
      toast.error("Informe um telefone válido.");
      return;
    }
    onSubmit({
      name: name.trim(),
      phone: phone.replace(/\D/g, ""),
      email: email.trim() || undefined,
    });
  }

  return (
    <div className="rounded-lg border border-brand/30 bg-brand/5 p-3 space-y-2.5">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-widest text-brand flex items-center gap-1.5">
          <UserPlus className="size-3.5" />
          Novo cliente
        </p>
        <button
          type="button"
          onClick={onCancel}
          className="size-6 rounded grid place-items-center text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors"
        >
          <X className="size-3.5" />
        </button>
      </div>

      <div className="relative">
        <User className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-text-faint" />
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome *"
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-text-faint" />
          <Input
            value={phone}
            onChange={(e) => setPhone(maskPhone(e.target.value))}
            placeholder="Telefone *"
            inputMode="numeric"
            className={inputClass}
          />
        </div>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-text-faint" />
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-mail (opcional)"
            type="email"
            className={inputClass}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={handle}
        disabled={submitting}
        className="w-full h-9 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5"
      >
        <UserPlus className="size-3.5" />
        {submitting ? "Cadastrando…" : "Cadastrar e selecionar"}
      </button>
    </div>
  );
}
