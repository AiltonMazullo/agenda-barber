"use client";

import Link from "next/link";
import {
  ArrowLeft,
  DollarSign,
  CalendarCheck,
  TrendingUp,
  Scissors,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PageHeader,
  SummaryCard,
  DataTablePagination,
} from "@/components/shared";
import { useAuth } from "@/hooks/useAuth";
import { useReports } from "@/hooks/useReports";
import { usePagination } from "@/hooks/usePagination";
import { formatBRL } from "@/utils/format";

export default function TicketMedioReportPage() {
  const { barbershop } = useAuth();
  const {
    isLoading,
    ticketMedioGeral,
    totalAtendimentos,
    faturamentoTotal,
    servicosMaisVendidos,
  } = useReports(barbershop?.id);

  const pag = usePagination(servicosMaisVendidos, 10);

  return (
    <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
      <PageHeader
        title="Ticket Médio"
        subtitle="Ticket médio geral e ranking de serviços por volume"
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

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <SummaryCard
          label="Ticket Médio"
          value={isLoading ? "…" : formatBRL(ticketMedioGeral)}
          icon={<DollarSign className="size-3.5" />}
          tone="brand"
          emphasized
        />
        <SummaryCard
          label="Atendimentos"
          value={isLoading ? "…" : String(totalAtendimentos)}
          icon={<CalendarCheck className="size-3.5" />}
        />
        <SummaryCard
          label="Faturamento"
          value={isLoading ? "…" : formatBRL(faturamentoTotal)}
          icon={<TrendingUp className="size-3.5" />}
          tone="success"
        />
      </div>

      <Card className="bg-surface-raised border-border">
        <CardContent className="p-5 flex flex-col items-center text-center gap-4">
          <DollarSign className="size-12 text-brand" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
              Ticket Médio por Atendimento
            </p>
            <p className="text-4xl font-bold text-brand">
              {formatBRL(ticketMedioGeral)}
            </p>
          </div>
          <p className="text-xs text-text-faint max-w-md">
            Ticket médio = Faturamento total ÷ Quantidade de atendimentos
            concluídos.
          </p>
        </CardContent>
      </Card>

      <Card className="bg-surface-raised border-border">
        <CardContent className="p-0">
          <div className="px-4 py-4 border-b border-border-subtle flex items-center gap-2">
            <Scissors className="size-3.5 text-brand" />
            <h2 className="text-sm font-bold text-foreground">
              Serviços por Volume
            </h2>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  {[
                    "Serviço",
                    "Preço Unit.",
                    "Atendimentos",
                    "Faturamento",
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
                {servicosMaisVendidos.length === 0 ? (
                  <TableRow className="border-border hover:bg-transparent">
                    <TableCell
                      colSpan={4}
                      className="px-4 py-12 text-center text-sm text-text-faint"
                    >
                      Sem dados. Marque agendamentos como concluídos para
                      popular o relatório.
                    </TableCell>
                  </TableRow>
                ) : (
                  pag.pageItems.map((row) => (
                    <TableRow
                      key={row.service.id}
                      className="border-border hover:bg-surface-elevated/50 transition-colors"
                    >
                      <TableCell className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className="size-2 rounded-full"
                            style={{
                              backgroundColor: row.service.hex ?? "#f5b82e",
                            }}
                          />
                          <span className="font-semibold text-foreground text-sm">
                            {row.service.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-4 text-muted-foreground text-sm">
                        {formatBRL(row.service.priceInCents / 100)}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-info-foreground font-semibold text-sm">
                        {row.atendimentos}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-brand font-bold text-sm">
                        {formatBRL(row.faturamento)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {pag.total > 0 && (
            <DataTablePagination
              page={pag.page}
              pageSize={pag.pageSize}
              totalPages={pag.totalPages}
              total={pag.total}
              from={pag.from}
              to={pag.to}
              onPageChange={pag.setPage}
              onPageSizeChange={pag.setPageSize}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
