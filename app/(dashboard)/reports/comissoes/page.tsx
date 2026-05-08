"use client";

import { useState } from "react";
import {
  ArrowLeft,
  TrendingUp,
  Scissors,
  Package,
  DollarSign,
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
  COMISSAO_SERVICO_MOCK,
  COMISSAO_PRODUTO_MOCK,
} from "@/mock/reports";
import { formatBRL } from "@/utils/format";

type Tab = "servicos" | "produtos";

export default function ComissoesReportPage() {
  const [tab, setTab] = useState<Tab>("servicos");

  const totalComissaoServicos = COMISSAO_SERVICO_MOCK.reduce(
    (acc, c) => acc + c.valorComissao,
    0,
  );
  const totalComissaoProdutos = COMISSAO_PRODUTO_MOCK.reduce(
    (acc, c) => acc + c.valorComissao,
    0,
  );
  const totalGeral = totalComissaoServicos + totalComissaoProdutos;

  const totalServicos = COMISSAO_SERVICO_MOCK.reduce(
    (acc, c) => acc + c.servicosCount,
    0,
  );
  const totalProdutos = COMISSAO_PRODUTO_MOCK.reduce(
    (acc, c) => acc + c.produtosCount,
    0,
  );

  return (
    <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
      <PageHeader
        title="Relatório de Comissões"
        subtitle="Comissões por profissional — serviços e produtos"
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
          label="Total Geral"
          value={formatBRL(totalGeral)}
          icon={<DollarSign className="size-3.5" />}
          tone="brand"
          emphasized
        />
        <SummaryCard
          label="Serviços"
          value={formatBRL(totalComissaoServicos)}
          icon={<Scissors className="size-3.5" />}
          tone="success"
        />
        <SummaryCard
          label="Produtos"
          value={formatBRL(totalComissaoProdutos)}
          icon={<Package className="size-3.5" />}
          tone="info"
        />
        <SummaryCard
          label="Profissionais"
          value={String(COMISSAO_SERVICO_MOCK.length)}
          icon={<TrendingUp className="size-3.5" />}
        />
      </div>

      <Card className="bg-surface-raised border-border">
        <CardContent className="p-0">
          <div className="border-b border-border">
            <div className="flex">
              <button
                onClick={() => setTab("servicos")}
                className={`px-4 py-3 text-xs font-semibold transition-colors flex items-center gap-2 ${
                  tab === "servicos"
                    ? "text-brand border-b-2 border-brand"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Scissors className="size-3.5" />
                Serviços
                <span className="text-[9px] text-text-subtle">KAN-119</span>
              </button>
              <button
                onClick={() => setTab("produtos")}
                className={`px-4 py-3 text-xs font-semibold transition-colors flex items-center gap-2 ${
                  tab === "produtos"
                    ? "text-brand border-b-2 border-brand"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Package className="size-3.5" />
                Produtos
                <span className="text-[9px] text-text-subtle">KAN-120</span>
              </button>
            </div>
          </div>

          {tab === "servicos" ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    {[
                      "Profissional",
                      "Serviços",
                      "Faturamento Bruto",
                      "Taxa",
                      "Valor da Comissão",
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
                  {COMISSAO_SERVICO_MOCK.map((c) => (
                    <TableRow
                      key={c.profissionalId}
                      className="border-border hover:bg-surface-elevated/50 transition-colors"
                    >
                      <TableCell className="px-4 py-4 font-semibold text-foreground text-sm">
                        {c.profissionalNome}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-muted-foreground text-sm">
                        {c.servicosCount}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-muted-foreground text-sm">
                        {formatBRL(c.faturamentoBruto)}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-info-foreground font-semibold text-sm">
                        {c.taxa}%
                      </TableCell>
                      <TableCell className="px-4 py-4 text-brand font-bold text-sm">
                        {formatBRL(c.valorComissao)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="border-t-2 border-border bg-surface-elevated/30 hover:bg-transparent">
                    <TableCell className="px-4 py-4 font-bold text-brand text-sm">
                      Total
                    </TableCell>
                    <TableCell className="px-4 py-4 font-semibold text-foreground text-sm">
                      {totalServicos}
                    </TableCell>
                    <TableCell colSpan={2} className="px-4 py-4" />
                    <TableCell className="px-4 py-4 text-brand font-bold text-base">
                      {formatBRL(totalComissaoServicos)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    {[
                      "Profissional",
                      "Produtos",
                      "Faturamento Bruto",
                      "Taxa",
                      "Valor da Comissão",
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
                  {COMISSAO_PRODUTO_MOCK.map((c) => (
                    <TableRow
                      key={c.profissionalId}
                      className="border-border hover:bg-surface-elevated/50 transition-colors"
                    >
                      <TableCell className="px-4 py-4 font-semibold text-foreground text-sm">
                        {c.profissionalNome}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-muted-foreground text-sm">
                        {c.produtosCount}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-muted-foreground text-sm">
                        {formatBRL(c.faturamentoBruto)}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-info-foreground font-semibold text-sm">
                        {c.taxa}%
                      </TableCell>
                      <TableCell className="px-4 py-4 text-brand font-bold text-sm">
                        {formatBRL(c.valorComissao)}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="border-t-2 border-border bg-surface-elevated/30 hover:bg-transparent">
                    <TableCell className="px-4 py-4 font-bold text-brand text-sm">
                      Total
                    </TableCell>
                    <TableCell className="px-4 py-4 font-semibold text-foreground text-sm">
                      {totalProdutos}
                    </TableCell>
                    <TableCell colSpan={2} className="px-4 py-4" />
                    <TableCell className="px-4 py-4 text-brand font-bold text-base">
                      {formatBRL(totalComissaoProdutos)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
