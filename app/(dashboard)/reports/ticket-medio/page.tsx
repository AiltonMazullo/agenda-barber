"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Users,
  Scissors,
  DollarSign,
  TrendingUp,
} from "lucide-react";
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
import {
  TICKET_PROFISSIONAL_MOCK,
  TICKET_CLIENTE_MOCK,
} from "@/mock/reports";
import { formatBRL, formatDate } from "@/utils/format";

type Tab = "profissional" | "cliente" | "geral";

const TABS: { key: Tab; label: string; subtitle: string }[] = [
  {
    key: "profissional",
    label: "Por Profissional",
    subtitle: "KAN-132",
  },
  {
    key: "cliente",
    label: "Por Cliente",
    subtitle: "KAN-133",
  },
  {
    key: "geral",
    label: "Geral (Atendimento)",
    subtitle: "KAN-134",
  },
];

export default function TicketMedioReportPage() {
  const [tab, setTab] = useState<Tab>("profissional");

  const totalAtendimentos = TICKET_PROFISSIONAL_MOCK.reduce(
    (acc, p) => acc + p.atendimentos,
    0,
  );
  const totalFaturamento = TICKET_PROFISSIONAL_MOCK.reduce(
    (acc, p) => acc + p.faturamento,
    0,
  );
  const ticketGeral =
    totalAtendimentos > 0 ? totalFaturamento / totalAtendimentos : 0;

  const totalClientesDistintos = new Set(
    TICKET_PROFISSIONAL_MOCK.flatMap((p) =>
      Array.from({ length: p.clientesDistintos }, (_, i) => `${p.profissionalId}_${i}`),
    ),
  ).size;
  const ticketPorCliente =
    totalClientesDistintos > 0 ? totalFaturamento / totalClientesDistintos : 0;

  return (
    <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
      <PageHeader
        title="Ticket Médio"
        subtitle="Por profissional, por cliente e por atendimento"
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
          label="Ticket Médio Geral"
          value={formatBRL(ticketGeral)}
          icon={<DollarSign className="size-3.5" />}
          tone="brand"
          emphasized
        />
        <SummaryCard
          label="Atendimentos"
          value={String(totalAtendimentos)}
          icon={<Scissors className="size-3.5" />}
        />
        <SummaryCard
          label="Faturamento"
          value={formatBRL(totalFaturamento)}
          icon={<TrendingUp className="size-3.5" />}
          tone="success"
        />
        <SummaryCard
          label="Ticket / Cliente"
          value={formatBRL(ticketPorCliente)}
          icon={<Users className="size-3.5" />}
          tone="info"
        />
      </div>

      <Card className="bg-surface-raised border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto border-b border-border">
            <div className="flex min-w-max">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`px-4 py-3 text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2 ${
                    tab === t.key
                      ? "text-brand border-b-2 border-brand"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t.label}
                  <span className="text-[9px] text-text-subtle">
                    {t.subtitle}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {tab === "profissional" && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    {[
                      "Profissional",
                      "Atendimentos",
                      "Clientes Distintos",
                      "Faturamento",
                      "Ticket Médio",
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
                  {TICKET_PROFISSIONAL_MOCK.map((p) => (
                    <TableRow
                      key={p.profissionalId}
                      className="border-border hover:bg-surface-elevated/50 transition-colors"
                    >
                      <TableCell className="px-4 py-4 font-semibold text-foreground text-sm">
                        {p.profissionalNome}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-muted-foreground text-sm">
                        {p.atendimentos}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-muted-foreground text-sm">
                        {p.clientesDistintos}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-success-foreground font-semibold text-sm">
                        {formatBRL(p.faturamento)}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-brand font-bold text-sm">
                        {formatBRL(p.ticketMedio)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {tab === "cliente" && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    {[
                      "Cliente",
                      "Visitas",
                      "Total Gasto",
                      "Ticket Médio",
                      "Última Visita",
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
                  {TICKET_CLIENTE_MOCK.map((c) => (
                    <TableRow
                      key={c.clienteId}
                      className="border-border hover:bg-surface-elevated/50 transition-colors"
                    >
                      <TableCell className="px-4 py-4 font-semibold text-foreground text-sm">
                        {c.clienteNome}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-muted-foreground text-sm">
                        {c.visitas}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-success-foreground font-semibold text-sm">
                        {formatBRL(c.totalGasto)}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-brand font-bold text-sm">
                        {formatBRL(c.ticketMedio)}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-muted-foreground text-sm">
                        {formatDate(c.ultimaVisita)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {tab === "geral" && (
            <div className="p-8 flex flex-col items-center gap-4 text-center">
              <DollarSign className="size-12 text-brand" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                  Ticket Médio por Atendimento (período)
                </p>
                <p className="text-4xl font-bold text-brand">
                  {formatBRL(ticketGeral)}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 w-full max-w-md mt-4">
                <div className="bg-surface-base border border-border rounded-lg p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Atendimentos
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {totalAtendimentos}
                  </p>
                </div>
                <div className="bg-surface-base border border-border rounded-lg p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Faturamento Total
                  </p>
                  <p className="text-2xl font-bold text-success-foreground">
                    {formatBRL(totalFaturamento)}
                  </p>
                </div>
              </div>
              <p className="text-xs text-text-subtle max-w-md mt-2">
                Ticket médio = Faturamento total ÷ Quantidade de atendimentos
                no período.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
