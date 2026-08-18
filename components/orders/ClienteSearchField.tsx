"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Check } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { maskCpf, formatPhone } from "@/utils/format";
import type { Client } from "@/types/client.types";

interface ClienteSearchFieldProps {
  clients: Client[];
  value: string;
  onValueChange: (clientId: string) => void;
  required?: boolean;
}

/**
 * Campo de cliente com busca por nome/e-mail/telefone/CPF — mesmo padrão do
 * seletor usado em `DialogNovoAgendamento` (spec-revisao-cliente-4.md §4.4:
 * a comanda de consumo avulsa usava um `<Select>` fechado, sem busca).
 */
export function ClienteSearchField({
  clients,
  value,
  onValueChange,
  required,
}: ClienteSearchFieldProps) {
  const [busca, setBusca] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const cliente = useMemo(
    () => clients.find((c) => c.id === value),
    [clients, value],
  );

  // Mantém o texto do input sincronizado com o cliente selecionado (ex.:
  // quando o valor vem de fora, como reset de formulário).
  useEffect(() => {
    setBusca(cliente ? cliente.name : "");
  }, [cliente?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const clientesFiltrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    const digits = busca.replace(/\D/g, "");
    const base = q
      ? clients.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            (c.email ?? "").toLowerCase().includes(q) ||
            (digits.length >= 3 && (c.phone ?? "").includes(digits)) ||
            (digits.length >= 3 && (c.cpf ?? "").includes(digits)),
        )
      : clients;
    return base.slice(0, 50);
  }, [clients, busca]);

  return (
    <div className="space-y-1.5">
      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        Cliente
        {required ? " *" : ""}
      </Label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
        <Input
          value={busca}
          onChange={(e) => {
            setBusca(e.target.value);
            if (value) onValueChange("");
          }}
          onFocus={() => setDropdownOpen(true)}
          onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
          placeholder={
            clients.length === 0
              ? "Nenhum cliente cadastrado"
              : "Buscar por nome, e-mail, telefone ou CPF"
          }
          className="pl-9"
        />
      </div>
      {dropdownOpen && (
        <div className="max-h-40 overflow-y-auto rounded-md border border-border divide-y divide-border">
          {clientesFiltrados.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              Nenhum cliente encontrado.
            </p>
          ) : (
            clientesFiltrados.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  onValueChange(c.id);
                  setBusca(c.name);
                  setDropdownOpen(false);
                }}
                className={cn(
                  "w-full text-left px-3 py-2 flex items-center justify-between gap-2 transition-colors",
                  value === c.id ? "bg-brand/10" : "hover:bg-accent",
                )}
              >
                <p className="text-sm truncate">
                  {c.name}
                  {c.phone && (
                    <span className="text-muted-foreground"> - {formatPhone(c.phone)}</span>
                  )}
                  {c.cpf && (
                    <span className="text-muted-foreground"> - {maskCpf(c.cpf)}</span>
                  )}
                </p>
                {value === c.id && <Check className="size-3.5 text-brand shrink-0" />}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
