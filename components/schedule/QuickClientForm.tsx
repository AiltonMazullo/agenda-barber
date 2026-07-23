"use client";

import { useState } from "react";
import { User, Phone, Mail, Lock, Cake, UserPlus, X, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { maskPhone } from "@/utils/format";
import { HOW_MET_OPTIONS } from "@/utils/constants";
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
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [birthDate, setBirthDate] = useState("");
  const [howMet, setHowMet] = useState("");

  function handle() {
    if (name.trim().length < 2) {
      toast.error("Informe o nome do cliente.");
      return;
    }
    if (phone.replace(/\D/g, "").length < 10) {
      toast.error("Informe um telefone válido.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      toast.error("Informe um e-mail válido.");
      return;
    }
    if (password.length < 6) {
      toast.error("A senha provisória deve ter ao menos 6 caracteres.");
      return;
    }
    if (!birthDate) {
      toast.error("Informe a data de nascimento.");
      return;
    }
    if (!howMet) {
      toast.error("Selecione como o cliente conheceu a empresa.");
      return;
    }
    onSubmit({
      name: name.trim(),
      phone: phone.replace(/\D/g, ""),
      email: email.trim(),
      password,
      birthDate: new Date(`${birthDate}T00:00:00`).toISOString(),
      howMet,
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
            placeholder="E-mail *"
            type="email"
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-text-faint" />
          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha provisória *"
            type={showPassword ? "text" : "password"}
            className={`${inputClass} pr-9`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-faint hover:text-foreground transition-colors"
          >
            {showPassword ? (
              <EyeOff className="size-3.5" />
            ) : (
              <Eye className="size-3.5" />
            )}
          </button>
        </div>
        <div className="relative">
          <Cake className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-text-faint" />
          <Input
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            type="date"
            max={new Date().toISOString().slice(0, 10)}
            className={inputClass}
          />
        </div>
      </div>

      <div className="space-y-1">
        <select
          value={howMet}
          onChange={(e) => setHowMet(e.target.value)}
          className="w-full h-9 rounded-md border border-border bg-surface-base text-sm text-foreground px-3 outline-none focus:border-brand transition-colors"
        >
          <option value="" disabled>
            Como conheceu a empresa *
          </option>
          {HOW_MET_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
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
