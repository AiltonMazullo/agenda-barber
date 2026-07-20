"use client";

import { useState } from "react";
import { Shield, Scissors, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePickerField } from "@/components/shared";
import { cn } from "@/lib/utils";
import { maskCpf, maskPhone } from "@/utils/format";
import type { ProfessionalType } from "@/types/professional-config.types";
import type { ProfessionalBasic } from "./types";
import { SectionShell, FieldLabel, INPUT_CLS } from "./Primitives";

const TYPES: {
  value: ProfessionalType;
  label: string;
  hint: string;
  icon: typeof Shield;
}[] = [
  {
    value: "admin",
    label: "Admin",
    hint: "Gerência, Recepção, Financeiro…",
    icon: Shield,
  },
  {
    value: "profissional",
    label: "Profissional",
    hint: "Barbeiro, Cabeleireiro, Manicure…",
    icon: Scissors,
  },
];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function IdentificacaoTipo({
  basic,
  onBasic,
  type,
  onType,
  isEditing,
}: {
  basic: ProfessionalBasic;
  onBasic: (patch: Partial<ProfessionalBasic>) => void;
  type: ProfessionalType;
  onType: (t: ProfessionalType) => void;
  /** Na edição a senha é opcional (em branco mantém a atual). */
  isEditing?: boolean;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const birthDate = basic.birthDate
    ? new Date(`${basic.birthDate}T00:00:00`)
    : undefined;

  return (
    <SectionShell title="Identificação e tipo">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <FieldLabel required>Nome completo</FieldLabel>
            <Input
              value={basic.name}
              onChange={(e) => onBasic({ name: e.target.value })}
              placeholder="João da Silva"
              className={INPUT_CLS}
            />
          </div>
          <div className="space-y-1.5">
            <FieldLabel required>Nome no app</FieldLabel>
            <Input
              value={basic.appName}
              onChange={(e) => onBasic({ appName: e.target.value })}
              placeholder="João"
              className={INPUT_CLS}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <FieldLabel required>CPF</FieldLabel>
            <Input
              value={basic.cpf}
              onChange={(e) => onBasic({ cpf: maskCpf(e.target.value) })}
              inputMode="numeric"
              placeholder="000.000.000-00"
              className={INPUT_CLS}
            />
          </div>
          <div className="space-y-1.5">
            <FieldLabel required>Data de nascimento</FieldLabel>
            <DatePickerField
              id="prof-nascimento"
              date={birthDate}
              onChange={(d) =>
                onBasic({
                  birthDate: d
                    ? `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
                    : "",
                })
              }
              startMonth={new Date(1940, 0)}
              endMonth={new Date()}
              defaultMonth={new Date(1995, 0)}
              className="min-w-0"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <FieldLabel required>E-mail</FieldLabel>
            <Input
              type="email"
              value={basic.email}
              onChange={(e) => onBasic({ email: e.target.value })}
              placeholder="joao@email.com"
              className={INPUT_CLS}
            />
          </div>
          <div className="space-y-1.5">
            <FieldLabel required>Telefone</FieldLabel>
            <Input
              value={basic.phone}
              onChange={(e) => onBasic({ phone: maskPhone(e.target.value) })}
              inputMode="numeric"
              maxLength={15}
              placeholder="(81) 99999-0000"
              className={INPUT_CLS}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <FieldLabel required={!isEditing}>Senha de acesso</FieldLabel>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              value={basic.password}
              onChange={(e) => onBasic({ password: e.target.value })}
              placeholder={
                isEditing ? "Deixe em branco para manter a atual" : "Mínimo 6 caracteres"
              }
              className={`${INPUT_CLS} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="size-3.5" />
              ) : (
                <Eye className="size-3.5" />
              )}
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Usada pelo profissional para entrar no painel.
          </p>
        </div>

        <div className="space-y-1.5">
          <FieldLabel>Chave Pix</FieldLabel>
          <Input
            value={basic.pixKey}
            onChange={(e) => onBasic({ pixKey: e.target.value })}
            placeholder="CPF, e-mail, telefone ou chave aleatória"
            className={INPUT_CLS}
          />
        </div>

        <div className="space-y-1.5">
          <FieldLabel required>Tipo de profissional</FieldLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {TYPES.map((t) => {
              const Icon = t.icon;
              const selected = type === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => onType(t.value)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border p-3 text-left transition-colors",
                    selected
                      ? "border-brand/60 bg-brand/10"
                      : "border-border bg-surface-base hover:border-brand/30",
                  )}
                >
                  <span
                    className={cn(
                      "size-8 rounded-full grid place-items-center shrink-0",
                      selected
                        ? "bg-brand/20 text-brand"
                        : "bg-surface-elevated text-muted-foreground",
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                  <span className="flex flex-col">
                    <span
                      className={cn(
                        "text-sm font-semibold",
                        selected ? "text-brand" : "text-foreground",
                      )}
                    >
                      {t.label}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {t.hint}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <label className="flex items-center gap-2.5 cursor-pointer">
          <Checkbox
            checked={basic.hasBranchAccess}
            onCheckedChange={(c) => onBasic({ hasBranchAccess: c === true })}
          />
          <span className="text-sm text-foreground">
            Possui acesso a dados de filiais
          </span>
        </label>
      </div>
    </SectionShell>
  );
}
