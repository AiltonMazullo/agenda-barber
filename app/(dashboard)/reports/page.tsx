"use client";

import Link from "next/link";
import {
  DollarSign,
  TrendingUp,
  CalendarCheck,
  ArrowRight,
  BarChart2,
  Trophy,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader, SummaryCard } from "@/components/shared";
import { useAuth } from "@/hooks/useAuth";
import { useReports } from "@/hooks/useReports";
import { formatBRL } from "@/utils/format";

interface RelatorioLinkProps {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

function RelatorioLink({ href, title, description, icon }: RelatorioLinkProps) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-lg border border-border-subtle bg-surface-raised p-4 hover:border-brand/40 transition-colors"
    >
      <div className="size-10 rounded-md bg-brand/15 border border-brand/30 flex items-center justify-center text-brand shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <ArrowRight className="size-4 text-text-faint group-hover:text-brand transition-colors" />
    </Link>
  );
}

export default function RelatoriosPage() {
  const { barbershop } = useAuth();
  const {
    isLoading,
    faturamentoTotal,
    totalAtendimentos,
    ticketMedioGeral,
    servicosMaisVendidos,
  } = useReports(barbershop?.id);

  const topServico = servicosMaisVendidos[0];

  return (
    <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
      <PageHeader
        title="Relatórios"
        subtitle="Visão consolidada do desempenho do seu negócio"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard
          label="Faturamento"
          value={isLoading ? "…" : formatBRL(faturamentoTotal)}
          icon={<DollarSign className="size-3.5" />}
          tone="brand"
          emphasized
        />
        <SummaryCard
          label="Atendimentos"
          value={isLoading ? "…" : String(totalAtendimentos)}
          icon={<CalendarCheck className="size-3.5" />}
          tone="info"
        />
        <SummaryCard
          label="Ticket Médio"
          value={isLoading ? "…" : formatBRL(ticketMedioGeral)}
          icon={<TrendingUp className="size-3.5" />}
          tone="success"
        />
        <SummaryCard
          label="Serviço Top"
          value={topServico?.service.name ?? "—"}
          subtitle={
            topServico ? `${topServico.atendimentos} atendimentos` : "Sem dados"
          }
          icon={<Trophy className="size-3.5" />}
        />
      </div>

      <Card className="bg-surface-raised border-border">
        <CardContent className="p-5 space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
            Relatórios Detalhados
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <RelatorioLink
              href="/reports/faturamento"
              title="Faturamento Mensal"
              description="Total faturado por mês nos últimos 6 meses"
              icon={<BarChart2 className="size-4" />}
            />
            <RelatorioLink
              href="/reports/ticket-medio"
              title="Ticket Médio"
              description="Ticket médio geral e ranking de serviços"
              icon={<TrendingUp className="size-4" />}
            />
          </div>
          <p className="text-[10px] text-text-faint pt-2">
            Os relatórios são calculados a partir dos atendimentos concluídos
            (status COMPLETED). Marque agendamentos como concluídos para
            popular os dados.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
