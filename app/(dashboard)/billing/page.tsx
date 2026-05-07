"use client";

import type { ReactNode } from "react";
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
import { PageHeader } from "@/components/shared";
import { formatBRL } from "@/utils/format";

// ─── Dados ────────────────────────────────────────────────────────────────────

interface PlanoSistema {
  key: string;
  nome: string;
  icon: ReactNode;
  subtitulo: string;
  preco: number;
  features: string[];
  atual: boolean;
}

const PLANO_ATUAL = {
  nome: "Pro",
  status: "Ativa",
  renovacao: "07/06/2026",
  filiaisUsadas: 1,
  filiaisTotal: 4,
};

const PLANOS: PlanoSistema[] = [
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
    <div className="space-y-8 p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
      <PageHeader
        title="Assinatura do Sistema"
        subtitle="Gerencie o plano da sua empresa"
        actions={
          <button
            type="button"
            onClick={() =>
              toast.success("Redirecionando para o portal de pagamento...")
            }
            className="h-9 px-4 rounded-md border border-border bg-surface-raised text-sm text-foreground flex items-center gap-2 hover:border-brand/40 transition-colors"
          >
            <ExternalLink className="size-3.5 text-muted-foreground" />
            Gerenciar Pagamento
          </button>
        }
      />

      {/* Status Atual */}
      <Card className="bg-surface-raised border-border">
        <CardContent className="p-5 space-y-5">
          <div className="flex items-center gap-2">
            <CreditCard className="size-4 text-brand" />
            <h2 className="text-sm font-bold text-foreground">Status Atual</h2>
          </div>

          <div className="flex flex-wrap items-center gap-8">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                Status
              </p>
              <Badge className="bg-success/15 text-success-foreground border border-success/30 text-xs font-semibold px-2.5 py-1">
                {PLANO_ATUAL.status}
              </Badge>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                Plano
              </p>
              <p className="text-sm font-bold text-foreground">
                {PLANO_ATUAL.nome}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                Próxima renovação
              </p>
              <p className="text-sm font-bold text-foreground">
                {PLANO_ATUAL.renovacao}
              </p>
            </div>
          </div>

          {/* Barra de uso de filiais */}
          <div className="bg-surface-base border border-border rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="size-3.5 text-muted-foreground" />
                <span className="text-sm text-foreground font-medium">
                  Filiais
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {PLANO_ATUAL.filiaisUsadas} / {PLANO_ATUAL.filiaisTotal}
              </span>
            </div>
            <div className="w-full h-2 bg-surface-elevated rounded-full overflow-hidden">
              <div
                className="h-full bg-brand rounded-full transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Planos Disponíveis */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-foreground">
          Planos Disponíveis
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PLANOS.map((plano) => (
            <div
              key={plano.key}
              className={cn(
                "rounded-xl border p-6 flex flex-col gap-5 transition-all",
                plano.atual
                  ? "bg-surface-raised border-brand/60 shadow-[0_0_24px_rgba(245,184,46,0.1)]"
                  : "bg-surface-raised border-border hover:border-border/80",
              )}
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-brand">{plano.icon}</span>
                  <h3 className="text-xl font-bold text-foreground">
                    {plano.nome}
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  {plano.subtitulo}
                </p>
              </div>

              <div>
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-bold text-foreground">
                    {formatBRL(plano.preco)}
                  </span>
                </div>
                <p className="text-xs text-text-subtle mt-0.5">/mês</p>
              </div>

              <ul className="space-y-2 flex-1">
                {plano.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <Check className="size-3.5 text-brand shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                disabled={plano.atual}
                onClick={() =>
                  !plano.atual &&
                  toast.success(
                    `Iniciando troca para o plano ${plano.nome}...`,
                  )
                }
                className={cn(
                  "w-full h-11 rounded-md text-sm font-bold transition-all",
                  plano.atual
                    ? "bg-surface-elevated text-muted-foreground cursor-default border border-border"
                    : "bg-brand text-brand-foreground hover:bg-brand-hover hover:shadow-[0_0_16px_rgba(245,184,46,0.35)]",
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
