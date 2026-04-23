/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  CreditCard,
  Zap,
  Crown,
  ExternalLink,
  Check,
  Building2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ─── Dados ────────────────────────────────────────────────────────────────────

const PLANO_ATUAL = {
  nome: "Pro",
  status: "Ativa",
  renovacao: "07/06/2026",
  filiaisUsadas: 1,
  filiaisTotal: 4,
};

const PLANOS = [
  {
    key: "essential",
    nome: "Essential",
    icon: <Zap className="size-5" />,
    subtitulo: "Até 2 filiais",
    preco: 99,
    features: ["Sistema completo", "Até 2 filiais", "Suporte por e-mail"],
    atual: false,
  },
  {
    key: "pro",
    nome: "Pro",
    icon: <Zap className="size-5" />,
    subtitulo: "Até 4 filiais",
    preco: 199,
    features: ["Sistema completo", "Até 4 filiais", "Suporte prioritário"],
    atual: true,
  },
  {
    key: "max",
    nome: "Max",
    icon: <Crown className="size-5" />,
    subtitulo: "Até 10 filiais",
    preco: 399,
    features: ["Sistema completo", "Até 10 filiais", "Suporte VIP dedicado"],
    atual: false,
  },
];

// ─── Página ───────────────────────────────────────────────────────────────────

export default function BillingPage() {
  const percent = Math.round(
    (PLANO_ATUAL.filiaisUsadas / PLANO_ATUAL.filiaisTotal) * 100,
  );

  return (
    <div className="space-y-8 p-4 md:p-6 bg-[#0d1117] min-h-screen text-white">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Assinatura do Sistema
          </h1>
          <p className="text-[#8b949e] text-sm mt-1">
            Gerencie o plano da sua empresa
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            toast.success("Redirecionando para o portal de pagamento...")
          }
          className="h-9 px-4 rounded-md border border-[#30363d] bg-[#161b22] text-sm text-white flex items-center gap-2 hover:border-[#f5b82e]/40 transition-colors self-start sm:self-auto"
        >
          <ExternalLink className="size-3.5 text-[#8b949e]" />
          Gerenciar Pagamento
        </button>
      </div>

      {/* ── Status Atual ── */}
      <Card className="bg-[#161b22] border-[#30363d]">
        <CardContent className="p-5 space-y-5">
          <div className="flex items-center gap-2">
            <CreditCard className="size-4 text-[#f5b82e]" />
            <h2 className="text-sm font-bold text-white">Status Atual</h2>
          </div>

          <div className="flex flex-wrap items-center gap-8">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#8b949e] mb-1">
                Status
              </p>
              <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-semibold px-2.5 py-1">
                {PLANO_ATUAL.status}
              </Badge>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#8b949e] mb-1">
                Plano
              </p>
              <p className="text-sm font-bold text-white">{PLANO_ATUAL.nome}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#8b949e] mb-1">
                Próxima renovação
              </p>
              <p className="text-sm font-bold text-white">
                {PLANO_ATUAL.renovacao}
              </p>
            </div>
          </div>

          {/* Barra de uso de filiais */}
          <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="size-3.5 text-[#8b949e]" />
                <span className="text-sm text-white font-medium">Filiais</span>
              </div>
              <span className="text-xs text-[#8b949e]">
                {PLANO_ATUAL.filiaisUsadas} / {PLANO_ATUAL.filiaisTotal}
              </span>
            </div>
            <div className="w-full h-2 bg-[#21262d] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#f5b82e] rounded-full transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Planos Disponíveis ── */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white">Planos Disponíveis</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PLANOS.map((plano) => (
            <div
              key={plano.key}
              className={cn(
                "rounded-xl border p-6 flex flex-col gap-5 transition-all",
                plano.atual
                  ? "bg-[#161b22] border-[#f5b82e]/60 shadow-[0_0_24px_rgba(245,184,46,0.1)]"
                  : "bg-[#161b22] border-[#30363d] hover:border-[#30363d]/80",
              )}
            >
              {/* Header */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[#f5b82e]">{plano.icon}</span>
                  <h3 className="text-xl font-bold text-white">{plano.nome}</h3>
                </div>
                <p className="text-xs text-[#8b949e]">{plano.subtitulo}</p>
              </div>

              {/* Preço */}
              <div>
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-bold text-white">
                    R$ {plano.preco.toLocaleString("pt-BR")},00
                  </span>
                </div>
                <p className="text-xs text-[#4d5562] mt-0.5">/mês</p>
              </div>

              {/* Features */}
              <ul className="space-y-2 flex-1">
                {plano.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2 text-sm text-[#8b949e]"
                  >
                    <Check className="size-3.5 text-[#f5b82e] shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                type="button"
                disabled={plano.atual}
                onClick={() =>
                  !plano.atual &&
                  toast.success(`Iniciando troca para o plano ${plano.nome}...`)
                }
                className={cn(
                  "w-full h-11 rounded-md text-sm font-bold transition-all",
                  plano.atual
                    ? "bg-[#21262d] text-[#8b949e] cursor-default border border-[#30363d]"
                    : "bg-[#f5b82e] text-black hover:bg-[#d9a326] hover:shadow-[0_0_16px_rgba(245,184,46,0.35)]",
                )}
              >
                {plano.atual ? "Plano Atual" : "Trocar Plano"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
