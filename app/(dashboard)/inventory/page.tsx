"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Download,
  Package,
  TrendingUp,
  AlertTriangle,
  ChevronDown,
  FileText,
  ShoppingCart,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  PageHeader,
  EmptyState,
  StatusBadge,
  DatePickerField,
  SelectField,
} from "@/components/shared";
import { formatBRL, formatDate } from "@/utils/format";
import {
  PRODUTOS_MOCK,
  MOVIMENTACOES_MOCK,
  VENDAS_PRODUTO_MOCK,
} from "@/mock/inventory";
import type {
  Produto,
  ProdutoStatus,
  Movimentacao,
} from "@/types/inventory.types";
import type { Tone } from "@/types/common.types";

// ─── Configuração ─────────────────────────────────────────────────────────────

type TabKey = "estoque_atual" | "entrada_saida" | "relatorio" | "vendas";

const TABS: { key: TabKey; label: string }[] = [
  { key: "estoque_atual", label: "Estoque Atual" },
  { key: "entrada_saida", label: "Entrada/Saída" },
  { key: "relatorio", label: "Relatório" },
  { key: "vendas", label: "Vendas" },
];

const PRODUTO_STATUS_LABELS: Record<ProdutoStatus, string> = {
  ok: "Ok",
  baixo: "Baixo",
  critico: "Crítico",
};

const PRODUTO_STATUS_TONE: Record<ProdutoStatus, Tone> = {
  ok: "success",
  baixo: "warning",
  critico: "danger",
};

const MOV_TIPO_LABEL: Record<Movimentacao["tipo"], string> = {
  entrada: "Entrada",
  saida: "Saída",
};

const MOV_TIPO_TONE: Record<Movimentacao["tipo"], Tone> = {
  entrada: "success",
  saida: "danger",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function deriveStatus(p: Produto): ProdutoStatus {
  if (p.qtdAtual === 0 || p.qtdAtual < p.qtdMinima * 0.5) return "critico";
  if (p.qtdAtual < p.qtdMinima) return "baixo";
  return "ok";
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function EstoquePage() {
  const [activeTab, setActiveTab] = useState<TabKey>("estoque_atual");
  const [search, setSearch] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<ProdutoStatus | "todos">(
    "todos",
  );

  const [searchMovimento, setSearchMovimento] = useState("");

  const [relDataInicial, setRelDataInicial] = useState<Date | undefined>();
  const [relDataFinal, setRelDataFinal] = useState<Date | undefined>();
  const [relProduto, setRelProduto] = useState("Todos");
  const [relTipo, setRelTipo] = useState("Todos");

  const [vendDataInicial, setVendDataInicial] = useState<Date | undefined>();
  const [vendDataFinal, setVendDataFinal] = useState<Date | undefined>();
  const [vendProduto, setVendProduto] = useState("Todos");
  const [vendProfissional, setVendProfissional] = useState("Todos");

  const produtosNomes = ["Todos", ...PRODUTOS_MOCK.map((p) => p.nome)];

  const filteredProdutos = PRODUTOS_MOCK.filter((p) => {
    const matchSearch = p.nome.toLowerCase().includes(search.toLowerCase());
    const status = deriveStatus(p);
    const matchStatus = filtroStatus === "todos" || status === filtroStatus;
    return matchSearch && matchStatus;
  });

  const filteredMovimentos = MOVIMENTACOES_MOCK.filter((m) =>
    m.produtoNome.toLowerCase().includes(searchMovimento.toLowerCase()),
  );

  return (
    <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
      <PageHeader
        title="Estoque"
        subtitle="Controle de produtos e movimentações"
        actions={
          <Button className="cursor-pointer bg-brand hover:bg-brand-hover hover:shadow-[0_0_16px_rgba(245,184,46,0.35)] text-brand-foreground font-bold h-9 text-xs transition-all">
            <Plus className="size-3.5 mr-1.5" />
            Nova Movimentação
          </Button>
        }
      />

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="bg-surface-raised border-border shadow-none">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Total em Estoque
              </p>
              <Package className="size-3.5 text-brand" />
            </div>
            <div className="text-xl md:text-2xl font-bold text-foreground">
              0 un.
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface-raised border-border shadow-none">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Valor do Estoque
              </p>
              <TrendingUp className="size-3.5 text-info-foreground" />
            </div>
            <div className="text-xl md:text-2xl font-bold text-info-foreground">
              {formatBRL(0)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface-raised border-border shadow-none">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Potencial de Venda
              </p>
              <TrendingUp className="size-3.5 text-success-foreground" />
            </div>
            <div className="text-xl md:text-2xl font-bold text-success-foreground">
              {formatBRL(0)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-danger-bg border-border shadow-none">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Estoque Baixo
              </p>
              <AlertTriangle className="size-3.5 text-danger-foreground" />
            </div>
            <div className="text-xl md:text-2xl font-bold text-danger-foreground">
              0
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Painel principal */}
      <Card className="bg-surface-raised border-border">
        <CardContent className="p-0">
          {/* Tabs */}
          <div className="px-4 pt-4 flex gap-1 flex-wrap border-b border-border-subtle pb-0">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  setSearch("");
                  setSearchMovimento("");
                }}
                className={`px-4 py-2.5 text-xs font-semibold transition-colors rounded-t-md -mb-px ${
                  activeTab === tab.key
                    ? "bg-brand text-brand-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface-elevated"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab: Estoque Atual */}
          {activeTab === "estoque_atual" && (
            <>
              <div className="p-4 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar produto..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 bg-surface-base border-border text-foreground placeholder:text-muted-foreground h-9 text-sm focus-visible:ring-brand/40"
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <button
                      type="button"
                      className="h-9 px-3 rounded-md border border-border bg-surface-base text-sm text-foreground flex items-center gap-2 hover:border-brand/40 transition-colors min-w-28"
                    >
                      <span className="capitalize">{filtroStatus}</span>
                      <ChevronDown className="size-3.5 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-surface-raised border-border text-foreground">
                    {(
                      ["todos", "ok", "baixo", "critico"] as Array<
                        ProdutoStatus | "todos"
                      >
                    ).map((s) => (
                      <DropdownMenuItem
                        key={s}
                        onClick={() => setFiltroStatus(s)}
                        className="text-xs hover:bg-surface-elevated cursor-pointer capitalize"
                      >
                        {s}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <button
                  type="button"
                  className="h-9 px-3 rounded-md border border-border bg-surface-base text-sm text-muted-foreground flex items-center gap-2 hover:border-brand/40 hover:text-foreground transition-colors"
                >
                  <Download className="size-3.5" />
                  CSV
                </button>
              </div>

              <div className="hidden md:block">
                <Table>
                  <TableHeader className="border-t border-border">
                    <TableRow className="border-border hover:bg-transparent">
                      {[
                        "Produto",
                        "Qtd. Atual",
                        "Qtd. Mínima",
                        "Valor Estoque",
                        "Pot. Venda",
                        "Status",
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
                    {filteredProdutos.length === 0 ? (
                      <TableRow className="border-border hover:bg-transparent">
                        <TableCell colSpan={6} className="py-4">
                          <EmptyState message="Nenhum produto encontrado." />
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredProdutos.map((p) => {
                        const status = deriveStatus(p);
                        return (
                          <TableRow
                            key={p.id}
                            className="border-border hover:bg-surface-elevated/50 transition-colors"
                          >
                            <TableCell className="px-4 py-4 font-semibold text-foreground text-sm">
                              {p.nome}
                            </TableCell>
                            <TableCell className="px-4 py-4 text-muted-foreground text-sm">
                              {p.qtdAtual}
                            </TableCell>
                            <TableCell className="px-4 py-4 text-muted-foreground text-sm">
                              {p.qtdMinima}
                            </TableCell>
                            <TableCell className="px-4 py-4 text-muted-foreground text-sm">
                              {formatBRL(p.qtdAtual * p.precoCusto)}
                            </TableCell>
                            <TableCell className="px-4 py-4 text-success-foreground font-semibold text-sm">
                              {formatBRL(p.qtdAtual * p.precoVenda)}
                            </TableCell>
                            <TableCell className="px-4 py-4">
                              <StatusBadge tone={PRODUTO_STATUS_TONE[status]}>
                                {PRODUTO_STATUS_LABELS[status]}
                              </StatusBadge>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile */}
              <div className="md:hidden px-4 pb-4 space-y-3">
                {filteredProdutos.length === 0 ? (
                  <EmptyState message="Nenhum produto encontrado." />
                ) : (
                  filteredProdutos.map((p) => {
                    const status = deriveStatus(p);
                    return (
                      <div
                        key={p.id}
                        className="bg-surface-base rounded-lg p-4 border border-border space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-semibold text-foreground text-sm">
                            {p.nome}
                          </span>
                          <StatusBadge tone={PRODUTO_STATUS_TONE[status]}>
                            {PRODUTO_STATUS_LABELS[status]}
                          </StatusBadge>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span>
                            <span className="text-text-subtle">
                              Qtd. Atual:{" "}
                            </span>
                            {p.qtdAtual}
                          </span>
                          <span>
                            <span className="text-text-subtle">
                              Qtd. Mín.:{" "}
                            </span>
                            {p.qtdMinima}
                          </span>
                          <span>
                            <span className="text-text-subtle">
                              Valor Est.:{" "}
                            </span>
                            {formatBRL(p.qtdAtual * p.precoCusto)}
                          </span>
                          <span className="text-success-foreground font-bold">
                            {formatBRL(p.qtdAtual * p.precoVenda)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}

          {/* Tab: Entrada/Saída */}
          {activeTab === "entrada_saida" && (
            <>
              <div className="p-4 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar movimentação..."
                    value={searchMovimento}
                    onChange={(e) => setSearchMovimento(e.target.value)}
                    className="pl-9 bg-surface-base border-border text-foreground placeholder:text-muted-foreground h-9 text-sm focus-visible:ring-brand/40"
                  />
                </div>
                <Button className="bg-brand hover:bg-brand-hover text-brand-foreground font-bold h-9 text-xs shrink-0">
                  <Plus className="size-3.5 mr-1.5" />
                  Novo
                </Button>
                <button
                  type="button"
                  className="h-9 px-3 rounded-md border border-border bg-surface-base text-sm text-muted-foreground flex items-center gap-2 hover:border-brand/40 hover:text-foreground transition-colors"
                >
                  <Download className="size-3.5" />
                  CSV
                </button>
              </div>

              <div className="hidden md:block">
                <Table>
                  <TableHeader className="border-t border-border">
                    <TableRow className="border-border hover:bg-transparent">
                      {[
                        "ID",
                        "Produto",
                        "Tipo",
                        "Qtd.",
                        "Criado em",
                        "Observação",
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
                    {filteredMovimentos.length === 0 ? (
                      <TableRow className="border-border hover:bg-transparent">
                        <TableCell colSpan={6} className="py-4">
                          <EmptyState message="Nenhuma movimentação." />
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredMovimentos.map((m) => (
                        <TableRow
                          key={m.id}
                          className="border-border hover:bg-surface-elevated/50 transition-colors"
                        >
                          <TableCell className="px-4 py-4 text-muted-foreground text-sm font-mono">
                            {m.id}
                          </TableCell>
                          <TableCell className="px-4 py-4 font-semibold text-foreground text-sm">
                            {m.produtoNome}
                          </TableCell>
                          <TableCell className="px-4 py-4">
                            <StatusBadge tone={MOV_TIPO_TONE[m.tipo]}>
                              {MOV_TIPO_LABEL[m.tipo]}
                            </StatusBadge>
                          </TableCell>
                          <TableCell className="px-4 py-4 text-muted-foreground text-sm">
                            {m.quantidade}
                          </TableCell>
                          <TableCell className="px-4 py-4 text-muted-foreground text-sm">
                            {formatDate(m.criadoEm)}
                          </TableCell>
                          <TableCell className="px-4 py-4 text-muted-foreground text-sm">
                            {m.observacao}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile */}
              <div className="md:hidden px-4 pb-4 space-y-3">
                {filteredMovimentos.map((m) => (
                  <div
                    key={m.id}
                    className="bg-surface-base rounded-lg p-4 border border-border space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-foreground text-sm">
                        {m.produtoNome}
                      </span>
                      <StatusBadge tone={MOV_TIPO_TONE[m.tipo]}>
                        {MOV_TIPO_LABEL[m.tipo]}
                      </StatusBadge>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span>
                        <span className="text-text-subtle">ID: </span>
                        {m.id}
                      </span>
                      <span>
                        <span className="text-text-subtle">Qtd.: </span>
                        {m.quantidade}
                      </span>
                      <span>
                        <span className="text-text-subtle">Data: </span>
                        {formatDate(m.criadoEm)}
                      </span>
                      <span>
                        <span className="text-text-subtle">Obs.: </span>
                        {m.observacao}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Tab: Relatório */}
          {activeTab === "relatorio" && (
            <>
              <div className="p-4 flex flex-wrap gap-4 items-end">
                <DatePickerField
                  id="rel-data-inicial"
                  label="Data Inicial"
                  date={relDataInicial}
                  onChange={setRelDataInicial}
                />
                <DatePickerField
                  id="rel-data-final"
                  label="Data Final"
                  date={relDataFinal}
                  onChange={setRelDataFinal}
                />
                <SelectField
                  id="rel-produto"
                  label="Produto"
                  value={relProduto}
                  options={produtosNomes}
                  onChange={setRelProduto}
                />
                <SelectField
                  id="rel-tipo"
                  label="Tipo"
                  value={relTipo}
                  options={["Todos", "Entrada", "Saída"]}
                  onChange={setRelTipo}
                />
              </div>

              <div className="hidden md:block">
                <Table>
                  <TableHeader className="border-t border-border">
                    <TableRow className="border-border hover:bg-transparent">
                      {[
                        "Produto",
                        "Qtd.",
                        "Valor Unit.",
                        "Tipo",
                        "Observação",
                        "Data",
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
                    {MOVIMENTACOES_MOCK.length === 0 ? (
                      <TableRow className="border-border hover:bg-transparent">
                        <TableCell colSpan={6} className="py-4">
                          <EmptyState
                            message="Nenhum dado encontrado."
                            icon={<FileText className="size-10" />}
                          />
                        </TableCell>
                      </TableRow>
                    ) : (
                      MOVIMENTACOES_MOCK.map((m) => (
                        <TableRow
                          key={m.id}
                          className="border-border hover:bg-surface-elevated/50 transition-colors"
                        >
                          <TableCell className="px-4 py-4 font-semibold text-foreground text-sm">
                            {m.produtoNome}
                          </TableCell>
                          <TableCell className="px-4 py-4 text-muted-foreground text-sm">
                            {m.quantidade}
                          </TableCell>
                          <TableCell className="px-4 py-4 text-muted-foreground text-sm">
                            {m.valorUnit ? formatBRL(m.valorUnit) : "—"}
                          </TableCell>
                          <TableCell className="px-4 py-4">
                            <StatusBadge tone={MOV_TIPO_TONE[m.tipo]}>
                              {MOV_TIPO_LABEL[m.tipo]}
                            </StatusBadge>
                          </TableCell>
                          <TableCell className="px-4 py-4 text-muted-foreground text-sm">
                            {m.observacao}
                          </TableCell>
                          <TableCell className="px-4 py-4 text-muted-foreground text-sm">
                            {formatDate(m.criadoEm)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </>
          )}

          {/* Tab: Vendas */}
          {activeTab === "vendas" && (
            <>
              <div className="p-4 flex flex-wrap gap-4 items-end">
                <DatePickerField
                  id="vend-data-inicial"
                  label="Data Inicial"
                  date={vendDataInicial}
                  onChange={setVendDataInicial}
                />
                <DatePickerField
                  id="vend-data-final"
                  label="Data Final"
                  date={vendDataFinal}
                  onChange={setVendDataFinal}
                />
                <SelectField
                  id="vend-produto"
                  label="Produto"
                  value={vendProduto}
                  options={produtosNomes}
                  onChange={setVendProduto}
                />
                <SelectField
                  id="vend-profissional"
                  label="Profissional"
                  value={vendProfissional}
                  options={["Todos", "Carlos", "Marcus"]}
                  onChange={setVendProfissional}
                />
              </div>

              <div className="hidden md:block">
                <Table>
                  <TableHeader className="border-t border-border">
                    <TableRow className="border-border hover:bg-transparent">
                      {[
                        "Produto",
                        "Cliente",
                        "Telefone",
                        "Profissional",
                        "Data",
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
                    {VENDAS_PRODUTO_MOCK.length === 0 ? (
                      <TableRow className="border-border hover:bg-transparent">
                        <TableCell colSpan={5} className="py-4">
                          <EmptyState
                            message="Nenhuma venda encontrada."
                            icon={<ShoppingCart className="size-10" />}
                          />
                        </TableCell>
                      </TableRow>
                    ) : (
                      VENDAS_PRODUTO_MOCK.map((v) => (
                        <TableRow
                          key={v.id}
                          className="border-border hover:bg-surface-elevated/50 transition-colors"
                        >
                          <TableCell className="px-4 py-4 font-semibold text-foreground text-sm">
                            {v.produtoNome}
                          </TableCell>
                          <TableCell className="px-4 py-4 text-muted-foreground text-sm">
                            {v.clienteNome}
                          </TableCell>
                          <TableCell className="px-4 py-4 text-muted-foreground text-sm">
                            {v.clienteTelefone}
                          </TableCell>
                          <TableCell className="px-4 py-4 text-muted-foreground text-sm">
                            {v.profissionalNome}
                          </TableCell>
                          <TableCell className="px-4 py-4 text-muted-foreground text-sm">
                            {formatDate(v.data)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
