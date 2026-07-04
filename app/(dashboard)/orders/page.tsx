"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ClipboardList,
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
  EmptyState,
  Loading,
  PageHeader,
  SelectField,
  StatusBadge,
  SummaryCard,
} from "@/components/shared";
import { useAuth } from "@/hooks/useAuth";
import { useComandas } from "@/hooks/useComandas";
import { usePagination } from "@/hooks/usePagination";
import { comandaClienteLabel, comandaTotalInCents } from "@/utils/comanda";
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

export default function ComandasPage() {
  const { barbershop } = useAuth();
  const { comandas, isLoading, setStatus, remove } = useComandas(
    barbershop?.id,
  );

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [deleteTarget, setDeleteTarget] = useState<Comanda | null>(null);

  const stats = useMemo(() => {
    const abertas = comandas.filter((c) => c.status === "ABERTA").length;
    const fechadas = comandas.filter((c) => c.status === "FECHADA").length;
    const canceladas = comandas.filter((c) => c.status === "CANCELADA").length;
    const faturadoInCents = comandas
      .filter((c) => c.status === "FECHADA")
      .reduce((acc, c) => acc + comandaTotalInCents(c.itens), 0);
    return { abertas, fechadas, canceladas, faturadoInCents };
  }, [comandas]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return comandas.filter((c) => {
      if (statusFilter !== "ALL" && c.status !== statusFilter) return false;
      if (!q) return true;
      return (
        String(c.numero).includes(q) ||
        comandaClienteLabel(c).toLowerCase().includes(q)
      );
    });
  }, [comandas, search, statusFilter]);

  const pag = usePagination(filtered, 10);

  function handleConfirmDelete() {
    if (!deleteTarget) return;
    remove(deleteTarget.id);
    setDeleteTarget(null);
  }

  return (
    <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
      <PageHeader
        title="Comandas"
        subtitle="Consumo de produtos e serviços vinculado aos agendamentos"
        actions={
          <Button
            render={<Link href="/orders/new" />}
            className="cursor-pointer bg-brand hover:bg-brand-hover hover:shadow-[0_0_16px_rgba(245,184,46,0.35)] text-brand-foreground font-bold h-9 text-xs transition-all"
          >
            <Plus className="size-3.5 mr-1.5" />
            Nova Comanda
          </Button>
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
        </div>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-10">
              <Loading />
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<ClipboardList className="size-10" />}
              message={
                comandas.length === 0
                  ? "Nenhuma comanda registrada ainda."
                  : "Nenhuma comanda encontrada com esses filtros."
              }
              action={
                comandas.length === 0 ? (
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
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pag.pageItems.map((comanda) => (
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
                                  onClick={() =>
                                    setStatus(comanda.id, "FECHADA")
                                  }
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
                page={pag.page}
                pageSize={pag.pageSize}
                totalPages={pag.totalPages}
                total={pag.total}
                from={pag.from}
                to={pag.to}
                onPageChange={pag.setPage}
                onPageSizeChange={pag.setPageSize}
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
    </div>
  );
}
