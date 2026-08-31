"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ClipboardList,
  Download,
  EllipsisVertical,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  Wallet,
  XCircle,
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ConfirmDialog,
  DataTablePagination,
  DatePickerField,
  EmptyState,
  Loading,
  PageHeader,
  SelectField,
  StatusBadge,
  SummaryCard,
} from "@/components/shared";
import { DialogFecharComanda } from "@/components/orders";
import { useAuth } from "@/hooks/useAuth";
import { useComandas } from "@/hooks/useComandas";
import { useEmployees } from "@/hooks/useEmployees";
import type { PageSize } from "@/hooks/usePagination";
import { comandasService } from "@/services/comandas.service";
import { comandaClienteLabel, comandaToDraft, comandaTotalInCents } from "@/utils/comanda";
import { exportToCsv } from "@/utils/csv-export";
import { formatBRL, formatDate } from "@/utils/format";
import type { Tone } from "@/types/common.types";
import type { Comanda, ComandaStatus } from "@/types/orders.types";

type StatusFilter = "ALL" | ComandaStatus;

const STATUS_LABEL: Record<ComandaStatus, string> = {
  ABERTA: "Aberta",
  FECHADA: "Fechada",
  CANCELADA: "Cancelada",
};

const STATUS_TONE: Record<ComandaStatus, Tone> = {
  ABERTA: "brand",
  FECHADA: "success",
  CANCELADA: "danger",
};

const STATUS_FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "ALL", label: "Todos os status" },
  { value: "ABERTA", label: "Abertas" },
  { value: "FECHADA", label: "Fechadas" },
  { value: "CANCELADA", label: "Canceladas" },
];

function toISODate(d: Date | undefined): string | undefined {
  if (!d) return undefined;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function ComandasPage() {
  const { barbershop } = useAuth();
  const { employees } = useEmployees(barbershop?.id);

  // Resolve o profissional da comanda (spec-revisao-cliente-4.md §4.2): em
  // comandas de agendamento, os nomes vêm do snapshot de cada agendamento
  // vinculado; em comandas avulsas, do `employeeId` da própria comanda.
  const comandaProfissionalLabel = (comanda: Comanda): string => {
    if (comanda.tipo === "AVULSA") {
      const nome = employees.find((e) => e.id === comanda.employeeId)?.name;
      return nome ?? "—";
    }
    const nomes = Array.from(
      new Set(comanda.agendamentos.map((a) => a.profissionalNome).filter(Boolean)),
    );
    return nomes.length > 0 ? nomes.join(", ") : "—";
  };
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const isoDateFrom = toISODate(dateFrom);
  const isoDateTo = toISODate(dateTo);

  const [search, setSearch] = useState("");
  // Debounce simples pra não disparar uma busca no servidor a cada tecla.
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(id);
  }, [search]);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [deleteTarget, setDeleteTarget] = useState<Comanda | null>(null);
  const [fecharTarget, setFecharTarget] = useState<Comanda | null>(null);

  // spec-ajustes-escopo-2 §2.4: listagem paginada no servidor — status/busca
  // e paginação viajam nos filtros da própria requisição, em vez de filtrar
  // e fatiar no cliente sobre a lista inteira.
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(10);
  // Volta pra página 1 quando os filtros mudam — ajuste de estado durante o
  // render (padrão recomendado pelo React em vez de um Effect só pra isso),
  // já que senão a página atual pode ficar além do novo total.
  const filtersKey = `${isoDateFrom ?? ""}|${isoDateTo ?? ""}|${statusFilter}|${debouncedSearch}`;
  const [prevFiltersKey, setPrevFiltersKey] = useState(filtersKey);
  if (filtersKey !== prevFiltersKey) {
    setPrevFiltersKey(filtersKey);
    setPage(1);
  }

  const {
    comandas,
    total,
    isLoading,
    update: updateRaw,
    setStatus: setStatusRaw,
    remove: removeRaw,
  } = useComandas(
    barbershop?.id,
    {
      dateFrom: isoDateFrom,
      dateTo: isoDateTo,
      status: statusFilter === "ALL" ? undefined : statusFilter,
      search: debouncedSearch || undefined,
    },
    { page, pageSize },
  );

  // Estatísticas do topo: independem do filtro de status/busca da tabela
  // (só do período), por isso buscadas à parte, sem paginação.
  const { comandas: comandasForStats, refetch: refetchStats } = useComandas(
    barbershop?.id,
    { dateFrom: isoDateFrom, dateTo: isoDateTo },
  );

  // Ações que mudam status/conteúdo já reconsultam a lista paginada
  // (`useComandas`) — aqui só encadeamos o refetch das estatísticas, que
  // vêm de uma segunda consulta independente.
  const update: typeof updateRaw = async (...args) => {
    const result = await updateRaw(...args);
    refetchStats();
    return result;
  };
  const setStatus: typeof setStatusRaw = async (...args) => {
    const result = await setStatusRaw(...args);
    refetchStats();
    return result;
  };
  const remove: typeof removeRaw = async (...args) => {
    await removeRaw(...args);
    refetchStats();
  };

  const stats = useMemo(() => {
    const abertas = comandasForStats.filter((c) => c.status === "ABERTA").length;
    const fechadas = comandasForStats.filter((c) => c.status === "FECHADA").length;
    const canceladas = comandasForStats.filter((c) => c.status === "CANCELADA").length;
    const faturadoInCents = comandasForStats
      .filter((c) => c.status === "FECHADA")
      .reduce((acc, c) => acc + comandaTotalInCents(c.itens), 0);
    return { abertas, fechadas, canceladas, faturadoInCents };
  }, [comandasForStats]);

  const totalPages = Math.max(1, Math.ceil((total ?? 0) / pageSize));
  const from = (total ?? 0) === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total ?? 0);

  function changePageSize(size: number) {
    setPageSize(size as PageSize);
    setPage(1);
  }

  function handleConfirmDelete() {
    if (!deleteTarget) return;
    remove(deleteTarget.id);
    setDeleteTarget(null);
  }

  async function handleExportCsv() {
    if (!barbershop?.id) return;
    // Exporta todas as comandas que batem com os filtros atuais, não só a
    // página exibida — busca a lista inteira sob demanda, sem paginação.
    const { data: rows } = await comandasService.list(barbershop.id, {
      dateFrom: isoDateFrom,
      dateTo: isoDateTo,
      status: statusFilter === "ALL" ? undefined : statusFilter,
      search: debouncedSearch || undefined,
    });
    exportToCsv(
      "comandas",
      rows.map((c) => ({
        numero: c.numero,
        cliente: comandaClienteLabel(c),
        tipo: c.tipo === "AVULSA" ? "Avulsa" : "Agendamento",
        status: STATUS_LABEL[c.status],
        agendamentos: c.tipo === "AVULSA" ? 0 : c.agendamentos.length,
        itens: c.itens.length,
        totalInReais: (comandaTotalInCents(c.itens) / 100).toFixed(2),
        criadaEm: formatDate(c.createdAt),
      })),
      [
        { key: "numero", label: "Número" },
        { key: "cliente", label: "Cliente" },
        { key: "tipo", label: "Tipo" },
        { key: "status", label: "Status" },
        { key: "agendamentos", label: "Agendamentos" },
        { key: "itens", label: "Itens" },
        { key: "totalInReais", label: "Total (R$)" },
        { key: "criadaEm", label: "Criada em" },
      ],
    );
  }

  return (
    <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
      <PageHeader
        title="Comandas"
        subtitle="Consumo de produtos e serviços vinculado aos agendamentos"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleExportCsv}
              disabled={(total ?? comandas.length) === 0}
              className="cursor-pointer border-border bg-surface-raised text-foreground hover:bg-surface-elevated font-semibold h-9 text-xs"
            >
              <Download className="size-3.5 mr-1.5" />
              CSV
            </Button>
            <Button
              render={<Link href="/orders/new" />}
              className="cursor-pointer bg-brand hover:bg-brand-hover hover:shadow-[0_0_16px_rgba(245,184,46,0.35)] text-brand-foreground font-bold h-9 text-xs transition-all"
            >
              <Plus className="size-3.5 mr-1.5" />
              Nova Comanda
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <SummaryCard
          label="Abertas"
          value={isLoading ? "…" : String(stats.abertas)}
          icon={<ClipboardList className="size-4" />}
          tone="brand"
        />
        <SummaryCard
          label="Fechadas"
          value={isLoading ? "…" : String(stats.fechadas)}
          icon={<CheckCircle2 className="size-4" />}
          tone="success"
        />
        <SummaryCard
          label="Canceladas"
          value={isLoading ? "…" : String(stats.canceladas)}
          icon={<XCircle className="size-4" />}
          tone="danger"
        />
        <SummaryCard
          label="Faturado (fechadas)"
          value={isLoading ? "…" : formatBRL(stats.faturadoInCents / 100)}
          icon={<Wallet className="size-4" />}
          tone="brand"
          emphasized
        />
      </div>

      <Card className="bg-surface-raised border-border py-0 gap-0">
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-border-subtle">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por cliente ou número..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-surface-base border-border text-foreground placeholder:text-muted-foreground h-9 text-sm focus-visible:ring-brand/40"
            />
          </div>
          <SelectField
            id="filtro-status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={STATUS_FILTER_OPTIONS}
            className="sm:max-w-45 flex-none"
          />
          <DatePickerField
            id="filtro-data-de"
            label=""
            date={dateFrom}
            onChange={setDateFrom}
            placeholder="De"
            className="sm:max-w-40 flex-none"
          />
          <DatePickerField
            id="filtro-data-ate"
            label=""
            date={dateTo}
            onChange={setDateTo}
            placeholder="Até"
            className="sm:max-w-40 flex-none"
          />
        </div>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-10">
              <Loading />
            </div>
          ) : comandas.length === 0 ? (
            <EmptyState
              icon={<ClipboardList className="size-10" />}
              message={
                comandasForStats.length === 0
                  ? "Nenhuma comanda registrada ainda."
                  : "Nenhuma comanda encontrada com esses filtros."
              }
              action={
                comandasForStats.length === 0 ? (
                  <Link
                    href="/orders/new"
                    className="text-xs font-semibold text-brand hover:underline"
                  >
                    Criar a primeira comanda
                  </Link>
                ) : undefined
              }
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="border-border-subtle hover:bg-transparent">
                    <TableHead>Comanda</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Agendamentos
                    </TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Itens
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">
                      Profissional
                    </TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comandas.map((comanda) => (
                    <TableRow
                      key={comanda.id}
                      className="border-border-subtle"
                    >
                      <TableCell>
                        <p className="font-mono text-xs text-muted-foreground">
                          #{comanda.numero}
                        </p>
                        <p className="text-xs text-text-faint">
                          {formatDate(comanda.createdAt)}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-foreground">
                          {comandaClienteLabel(comanda)}
                        </p>
                        {comanda.tipo === "AVULSA" && (
                          <p className="text-xs text-muted-foreground">
                            Consumo avulso
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {comanda.tipo === "AVULSA"
                          ? "—"
                          : comanda.agendamentos.length}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">
                        {comanda.itens.length}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        {comandaProfissionalLabel(comanda)}
                      </TableCell>
                      <TableCell className="font-semibold text-foreground">
                        {formatBRL(comandaTotalInCents(comanda.itens) / 100)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge tone={STATUS_TONE[comanda.status]}>
                          {STATUS_LABEL[comanda.status]}
                        </StatusBadge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            aria-label={`Ações da comanda #${comanda.numero}`}
                            className="size-8 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-surface-elevated hover:text-foreground transition-colors cursor-pointer outline-none"
                          >
                            <EllipsisVertical className="size-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="bg-surface-raised border-border text-foreground min-w-44"
                          >
                            <DropdownMenuItem
                              render={<Link href={`/orders/${comanda.id}`} />}
                              className="text-xs cursor-pointer hover:bg-surface-elevated"
                            >
                              <Pencil className="size-3.5" />
                              Editar
                            </DropdownMenuItem>
                            {comanda.status === "ABERTA" ? (
                              <>
                                <DropdownMenuItem
                                  onClick={() => setFecharTarget(comanda)}
                                  className="text-xs cursor-pointer hover:bg-surface-elevated"
                                >
                                  <CheckCircle2 className="size-3.5" />
                                  Fechar comanda
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    setStatus(comanda.id, "CANCELADA")
                                  }
                                  className="text-xs cursor-pointer hover:bg-surface-elevated"
                                >
                                  <XCircle className="size-3.5" />
                                  Cancelar comanda
                                </DropdownMenuItem>
                              </>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => setStatus(comanda.id, "ABERTA")}
                                className="text-xs cursor-pointer hover:bg-surface-elevated"
                              >
                                <RotateCcw className="size-3.5" />
                                Reabrir comanda
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator className="bg-border-subtle" />
                            <DropdownMenuItem
                              onClick={() => setDeleteTarget(comanda)}
                              className="text-xs cursor-pointer text-danger-foreground hover:bg-danger/10"
                            >
                              <Trash2 className="size-3.5" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <DataTablePagination
                page={page}
                pageSize={pageSize}
                totalPages={totalPages}
                total={total ?? 0}
                from={from}
                to={to}
                onPageChange={setPage}
                onPageSizeChange={changePageSize}
              />
            </>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Excluir comanda?"
        description={
          deleteTarget
            ? `A comanda #${deleteTarget.numero} será excluída permanentemente. Essa ação não pode ser desfeita.`
            : undefined
        }
        confirmLabel="Excluir"
        tone="danger"
        onConfirm={handleConfirmDelete}
      />

      <DialogFecharComanda
        open={fecharTarget !== null}
        onOpenChange={(v) => !v && setFecharTarget(null)}
        barbershopId={barbershop?.id}
        comanda={fecharTarget}
        onConfirm={async ({ itens, pagamentos }) => {
          if (!fecharTarget) return;
          await update(fecharTarget.id, { ...comandaToDraft(fecharTarget), itens });
          return setStatus(fecharTarget.id, "FECHADA", pagamentos);
        }}
      />
    </div>
  );
}
