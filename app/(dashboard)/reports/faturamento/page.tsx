"use client";

import { ArrowLeft, DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader, SummaryCard } from "@/components/shared";
import { FATURAMENTO_MENSAL_MOCK } from "@/mock/reports";
import { formatBRL } from "@/utils/format";

export default function FaturamentoReportPage() {
  const dados = FATURAMENTO_MENSAL_MOCK;
  const ultimo = dados[dados.length - 1];
  const penultimo = dados[dados.length - 2];

  const totalAcumulado = dados.reduce((acc, m) => acc + m.total, 0);
  const totalServicos = dados.reduce((acc, m) => acc + m.servicos, 0);
  const totalProdutos = dados.reduce((acc, m) => acc + m.produtos, 0);
  const totalAssinaturas = dados.reduce((acc, m) => acc + m.assinaturas, 0);

  const variacao = penultimo
    ? ((ultimo.total - penultimo.total) / penultimo.total) * 100
    : 0;

  const maxTotal = Math.max(...dados.map((d) => d.total));

  return (
    <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
      <PageHeader
        title="Relatório de Faturamento"
        subtitle="Visão consolidada por mês — últimos 6 meses"
        actions={
          <Link href="/reports">
            <button
              type="button"
              className="h-9 px-4 rounded-md border border-border bg-surface-raised text-sm text-foreground flex items-center gap-2 hover:border-brand/40 transition-colors"
            >
              <ArrowLeft className="size-3.5 text-muted-foreground" />
              Voltar
            </button>
          </Link>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard
          label="Total Acumulado"
          value={formatBRL(totalAcumulado)}
          icon={<DollarSign className="size-3.5" />}
          tone="brand"
          emphasized
        />
        <SummaryCard
          label="Serviços"
          value={formatBRL(totalServicos)}
          tone="success"
        />
        <SummaryCard
          label="Produtos"
          value={formatBRL(totalProdutos)}
          tone="info"
        />
        <SummaryCard
          label="Assinaturas"
          value={formatBRL(totalAssinaturas)}
          tone="warning"
        />
      </div>

      {/* Gráfico de barras simples (CSS) */}
      <Card className="bg-surface-raised border-border">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground">
              Curva de Faturamento
            </h2>
            <div
              className={`flex items-center gap-1 text-xs font-bold ${variacao >= 0 ? "text-success-foreground" : "text-danger-foreground"}`}
            >
              {variacao >= 0 ? (
                <TrendingUp className="size-3.5" />
              ) : (
                <TrendingDown className="size-3.5" />
              )}
              {variacao >= 0 ? "+" : ""}
              {variacao.toFixed(1)}% vs. mês anterior
            </div>
          </div>

          <div className="grid grid-cols-6 gap-3 items-end h-40">
            {dados.map((m) => {
              const altura = (m.total / maxTotal) * 100;
              return (
                <div
                  key={m.mes}
                  className="flex flex-col items-center gap-1.5 h-full"
                >
                  <div className="text-[10px] font-bold text-foreground">
                    {formatBRL(m.total).replace("R$ ", "")}
                  </div>
                  <div className="w-full flex-1 flex items-end">
                    <div
                      className="w-full bg-brand/80 hover:bg-brand transition-colors rounded-t-md min-h-1"
                      style={{ height: `${altura}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {m.mesLabel}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tabela detalhada */}
      <Card className="bg-surface-raised border-border">
        <CardContent className="p-0">
          <div className="px-4 py-4 border-b border-border-subtle">
            <h2 className="text-sm font-bold text-foreground">
              Detalhamento Mensal
            </h2>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  {[
                    "Mês",
                    "Serviços",
                    "Produtos",
                    "Assinaturas",
                    "Total",
                  ].map((col) => (
                    <TableHead
                      key={col}
                      className="text-muted-foreground text-xs uppercase tracking-wider font-semibold px-4 py-3 h-auto"
                    >
                      {col}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {dados.map((m) => (
                  <TableRow
                    key={m.mes}
                    className="border-border hover:bg-surface-elevated/50 transition-colors"
                  >
                    <TableCell className="px-4 py-4 font-semibold text-foreground text-sm">
                      {m.mesLabel}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-muted-foreground text-sm">
                      {formatBRL(m.servicos)}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-muted-foreground text-sm">
                      {formatBRL(m.produtos)}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-muted-foreground text-sm">
                      {formatBRL(m.assinaturas)}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-brand font-bold text-sm">
                      {formatBRL(m.total)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="border-t-2 border-border bg-surface-elevated/30 hover:bg-transparent">
                  <TableCell className="px-4 py-4 font-bold text-brand text-sm">
                    Total
                  </TableCell>
                  <TableCell className="px-4 py-4 text-foreground font-semibold text-sm">
                    {formatBRL(totalServicos)}
                  </TableCell>
                  <TableCell className="px-4 py-4 text-foreground font-semibold text-sm">
                    {formatBRL(totalProdutos)}
                  </TableCell>
                  <TableCell className="px-4 py-4 text-foreground font-semibold text-sm">
                    {formatBRL(totalAssinaturas)}
                  </TableCell>
                  <TableCell className="px-4 py-4 text-brand font-bold text-base">
                    {formatBRL(totalAcumulado)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
