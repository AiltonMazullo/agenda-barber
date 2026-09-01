"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Users,
  CalendarCheck,
  Mail,
  Phone,
  Clock,
  Trophy,
  Pencil,
  Eye,
  UserPlus,
  UserX,
  Cake,
  Download,
  Copy,
  Upload,
} from "lucide-react";
import { exportToCsv } from "@/utils/csv-export";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initials } from "@/components/schedule/helpers";
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
  EmptyState,
  DataTablePagination,
  ConfirmDialog,
  Loading,
  Can,
} from "@/components/shared";
import { DialogNovoCliente } from "@/components/clients/DialogNovoCliente";
import { DialogEditarCliente } from "@/components/clients/DialogEditarCliente";
import { DialogImportarClientes } from "@/components/clients/DialogImportarClientes";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useClients } from "@/hooks/useClients";
import { useAppointments } from "@/hooks/useAppointments";
import { useDeactivatedClients } from "@/hooks/useDeactivatedClients";
import { usePagination } from "@/hooks/usePagination";
import { formatBRL, formatDate, toWallClockDate } from "@/utils/format";
import { isBirthdayInCurrentWeek } from "@/utils/birthday";
import type {
  Client,
  CreateClientPayload,
  UpdateClientPayload,
} from "@/types/client.types";

interface ClientStats {
  totalAppointments: number;
  completedAppointments: number;
  totalSpent: number;
  lastVisit: string | null;
  upcomingVisit: string | null;
}

interface EnrichedClient extends Client {
  stats: ClientStats;
}

const EMPTY_STATS: ClientStats = {
  totalAppointments: 0,
  completedAppointments: 0,
  totalSpent: 0,
  lastVisit: null,
  upcomingVisit: null,
};

// ─── Página ──────────────────────────────────────────────────────────────────

function ClientesContent() {
  const { barbershop } = useAuth();
  const { clients, isLoading, create, update, uploadPhoto, refetch } = useClients(
    barbershop?.id,
  );
  const { appointments } = useAppointments(barbershop?.id);
  const { ids: deactivatedIds, deactivate } = useDeactivatedClients(
    barbershop?.id,
  );

  const searchParams = useSearchParams();
  const aniversariantesSemana =
    searchParams.get("aniversariantes") === "semana";

  const [search, setSearch] = useState("");
  const [editDialog, setEditDialog] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [novoDialog, setNovoDialog] = useState(false);
  const [importDialog, setImportDialog] = useState(false);
  const [toDeactivate, setToDeactivate] = useState<Client | null>(null);

  // Enriquece clientes com estatísticas de appointments
  const enriched = useMemo<EnrichedClient[]>(() => {
    const statsMap = new Map<string, ClientStats>();
    for (const a of appointments) {
      const prev = statsMap.get(a.clientId) ?? { ...EMPTY_STATS };
      prev.totalAppointments += 1;
      if (a.status === "COMPLETED") {
        prev.completedAppointments += 1;
        prev.totalSpent += a.service.priceInCents / 100;
      }
      const dt = toWallClockDate(a.scheduledAt);
      const now = new Date();
      if (dt < now) {
        if (!prev.lastVisit || dt > toWallClockDate(prev.lastVisit)) {
          prev.lastVisit = a.scheduledAt;
        }
      } else if (a.status !== "CANCELLED") {
        if (!prev.upcomingVisit || dt < toWallClockDate(prev.upcomingVisit)) {
          prev.upcomingVisit = a.scheduledAt;
        }
      }
      statsMap.set(a.clientId, prev);
    }

    return clients
      .filter((c) => !deactivatedIds.includes(c.id))
      .map((c) => ({
        ...c,
        stats: statsMap.get(c.id) ?? EMPTY_STATS,
      }));
  }, [clients, appointments, deactivatedIds]);

  const filtered = useMemo(() => {
    let base = enriched;
    if (aniversariantesSemana) {
      base = base.filter((c) => isBirthdayInCurrentWeek(c.birthDate));
    }
    const q = search.trim().toLowerCase();
    if (!q) return base;
    return base.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.phone?.toLowerCase().includes(q) ?? false),
    );
  }, [enriched, search, aniversariantesSemana]);

  const pag = usePagination(filtered, 10);

  const summary = useMemo(() => {
    const total = enriched.length;
    const totalSpent = enriched.reduce(
      (acc, c) => acc + c.stats.totalSpent,
      0,
    );
    const totalAppts = enriched.reduce(
      (acc, c) => acc + c.stats.totalAppointments,
      0,
    );
    const topClient = [...enriched].sort(
      (a, b) => b.stats.completedAppointments - a.stats.completedAppointments,
    )[0];
    return { total, totalSpent, totalAppts, topClient };
  }, [enriched]);

  function openEdit(c: Client) {
    setEditing(c);
    setEditDialog(true);
  }

  async function handleSaveEdit(id: string, payload: UpdateClientPayload) {
    await update(id, payload);
  }

  async function handleCreate(payload: CreateClientPayload) {
    return create(payload);
  }

  function doDeactivate() {
    if (!toDeactivate) return;
    deactivate(toDeactivate.id);
    toast.success("Cliente desativado.");
  }

  function handleExportCsv() {
    exportToCsv(
      "clientes",
      filtered.map((c) => ({
        id: c.id,
        nome: c.name,
        email: c.email,
        telefone: c.phone ?? "",
        atendimentosConcluidos: c.stats.completedAppointments,
        totalAtendimentos: c.stats.totalAppointments,
        totalGasto: c.stats.totalSpent.toFixed(2),
        ultimaVisita: c.stats.lastVisit ? formatDate(toWallClockDate(c.stats.lastVisit)) : "",
        proximaVisita: c.stats.upcomingVisit
          ? formatDate(toWallClockDate(c.stats.upcomingVisit))
          : "",
        criadoEm: formatDate(c.createdAt),
        atualizadoEm: formatDate(c.updatedAt),
      })),
      [
        { key: "id", label: "ID" },
        { key: "nome", label: "Nome" },
        { key: "email", label: "E-mail" },
        { key: "telefone", label: "Telefone" },
        { key: "atendimentosConcluidos", label: "Atendimentos concluídos" },
        { key: "totalAtendimentos", label: "Total de atendimentos" },
        { key: "totalGasto", label: "Total gasto (R$)" },
        { key: "ultimaVisita", label: "Última visita" },
        { key: "proximaVisita", label: "Próxima visita" },
        { key: "criadoEm", label: "Criado em" },
        { key: "atualizadoEm", label: "Atualizado em" },
      ],
    );
  }

  function copyId(id: string) {
    navigator.clipboard.writeText(id);
    toast.success("ID copiado.");
  }

  return (
    <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
      <PageHeader
        title="Clientes"
        subtitle="Base de clientes da barbearia"
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCsv}
              className="h-9 px-4 rounded-md border border-border bg-surface-raised text-sm text-foreground hover:bg-surface-elevated transition-colors flex items-center gap-1.5"
            >
              <Download className="size-3.5" />
              CSV
            </button>
            <Link
              href="/clients/desativados"
              className="h-9 px-4 rounded-md border border-border bg-surface-raised text-sm text-foreground hover:bg-surface-elevated transition-colors flex items-center gap-1.5"
            >
              <UserX className="size-3.5" />
              Desativados
              {deactivatedIds.length > 0 ? ` (${deactivatedIds.length})` : ""}
            </Link>
            <Can permission="cliente.cadastrar">
              <button
                type="button"
                onClick={() => setImportDialog(true)}
                className="h-9 px-4 rounded-md border border-border bg-surface-raised text-sm text-foreground hover:bg-surface-elevated transition-colors flex items-center gap-1.5"
              >
                <Upload className="size-3.5" />
                Importar
              </button>
            </Can>
            <Can permission="cliente.cadastrar">
              <button
                type="button"
                onClick={() => setNovoDialog(true)}
                className="h-9 px-4 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors flex items-center gap-1.5"
              >
                <UserPlus className="size-3.5" />
                Novo cliente
              </button>
            </Can>
          </div>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard
          label="Clientes"
          value={isLoading ? "…" : String(summary.total)}
          icon={<Users className="size-3.5" />}
          tone="brand"
          emphasized
        />
        <SummaryCard
          label="Atendimentos"
          value={isLoading ? "…" : String(summary.totalAppts)}
          icon={<CalendarCheck className="size-3.5" />}
          tone="info"
        />
        <SummaryCard
          label="Faturamento"
          value={isLoading ? "…" : formatBRL(summary.totalSpent)}
          tone="success"
        />
        <SummaryCard
          label="Top Cliente"
          value={summary.topClient?.name ?? "—"}
          subtitle={
            summary.topClient
              ? `${summary.topClient.stats.completedAppointments} atendimentos`
              : "Sem dados"
          }
          icon={<Trophy className="size-3.5" />}
        />
      </div>

      {aniversariantesSemana && (
        <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-md bg-brand/10 border border-brand/30 text-xs text-foreground">
          <span className="flex items-center gap-1.5">
            <Cake className="size-3.5 text-brand" />
            Mostrando aniversariantes da semana
          </span>
          <Link href="/clients" className="text-brand font-medium hover:underline">
            Limpar filtro
          </Link>
        </div>
      )}

      <Card className="bg-surface-raised border-border">
        <CardContent className="p-0">
          <div className="px-4 py-4 border-b border-border-subtle">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, e-mail ou telefone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-surface-base border-border text-foreground placeholder:text-muted-foreground h-9 text-sm focus-visible:ring-brand/40"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="border-t border-border">
                <TableRow className="border-border hover:bg-transparent">
                  {[
                    "Cliente",
                    "Contato",
                    "Atendimentos",
                    "Total gasto",
                    "Visitas",
                    "Histórico",
                    "",
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
                {isLoading ? (
                  <TableRow className="border-border hover:bg-transparent">
                    <TableCell colSpan={7} className="py-4">
                      <Loading />
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow className="border-border hover:bg-transparent">
                    <TableCell colSpan={7} className="py-4">
                      <EmptyState
                        message={
                          clients.length === 0
                            ? "Nenhum cliente cadastrado ainda."
                            : "Nenhum cliente corresponde à busca."
                        }
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  pag.pageItems.map((c) => (
                    <TableRow
                      key={c.id}
                      className="group border-border hover:bg-surface-elevated/50 transition-colors"
                    >
                      <TableCell className="px-4 py-4 font-semibold text-sm">
                        <Link
                          href={`/clients/${c.id}`}
                          className="flex items-center gap-2 text-foreground hover:text-brand transition-colors"
                        >
                          <Avatar size="sm">
                            <AvatarImage src={c.photoUrl ?? undefined} alt={c.name} />
                            <AvatarFallback>{initials(c.name)}</AvatarFallback>
                          </Avatar>
                          <span>{c.name}</span>
                          {c.isBlocked && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-danger/10 text-danger-foreground shrink-0">
                              Bloqueado
                            </span>
                          )}
                        </Link>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            copyId(c.id);
                          }}
                          title="Copiar ID (suporte técnico)"
                          className="opacity-0 group-hover:opacity-100 size-5 rounded flex items-center justify-center text-text-faint hover:text-brand transition-opacity ml-1 inline-flex"
                        >
                          <Copy className="size-3" />
                        </button>
                      </TableCell>
                      <TableCell className="px-4 py-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Mail className="size-3" />
                          {c.email}
                        </div>
                        {c.phone && (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Phone className="size-3" />
                            {c.phone}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-muted-foreground text-sm">
                        <span className="font-semibold text-foreground">
                          {c.stats.completedAppointments}
                        </span>
                        <span className="text-text-faint">
                          {" "}/ {c.stats.totalAppointments}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-4 text-success-foreground font-semibold text-sm">
                        {formatBRL(c.stats.totalSpent)}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-sm">
                        <div className="text-muted-foreground">
                          <span className="text-[10px] uppercase tracking-wider text-text-faint mr-1">
                            Última:
                          </span>
                          {c.stats.lastVisit ? formatDate(toWallClockDate(c.stats.lastVisit)) : "—"}
                        </div>
                        <div className="mt-0.5">
                          <span className="text-[10px] uppercase tracking-wider text-text-faint mr-1">
                            Próxima:
                          </span>
                          {c.stats.upcomingVisit ? (
                            <span className="inline-flex items-center gap-1 text-info-foreground">
                              <Clock className="size-3" />
                              {formatDate(toWallClockDate(c.stats.upcomingVisit))}
                            </span>
                          ) : (
                            <span className="text-text-faint">—</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-4 text-muted-foreground text-xs whitespace-nowrap">
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-text-faint mr-1">
                            Criado:
                          </span>
                          {formatDate(c.createdAt)}
                        </div>
                        <div className="mt-0.5">
                          <span className="text-[10px] uppercase tracking-wider text-text-faint mr-1">
                            Atualizado:
                          </span>
                          {formatDate(c.updatedAt)}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Can permission="cliente.atualizar">
                            <button
                              type="button"
                              onClick={() => openEdit(c)}
                              className="size-7 rounded-md border border-border bg-surface-base text-muted-foreground flex items-center justify-center hover:border-brand/40 hover:text-brand transition-colors"
                            >
                              <Pencil className="size-3" />
                            </button>
                          </Can>
                          <Can permission="cliente.visualizar">
                            <Link
                              href={`/clients/${c.id}`}
                              title="Ver ficha"
                              className="size-7 rounded-md border border-border bg-surface-base text-muted-foreground flex items-center justify-center hover:border-brand/40 hover:text-brand transition-colors"
                            >
                              <Eye className="size-3" />
                            </Link>
                          </Can>
                          <Can permission="cliente.remover">
                            <button
                              type="button"
                              onClick={() => setToDeactivate(c)}
                              title="Desativar cliente"
                              className="size-7 rounded-md border border-danger/30 bg-transparent text-danger-foreground flex items-center justify-center hover:bg-danger/10 transition-colors"
                            >
                              <UserX className="size-3" />
                            </button>
                          </Can>
                        </div>
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

      <DialogEditarCliente
        open={editDialog}
        onOpenChange={setEditDialog}
        client={editing}
        onSave={handleSaveEdit}
        onUploadPhoto={uploadPhoto}
      />

      <DialogNovoCliente
        open={novoDialog}
        onOpenChange={setNovoDialog}
        onCreate={handleCreate}
        onUploadPhoto={uploadPhoto}
      />

      <DialogImportarClientes
        open={importDialog}
        onOpenChange={setImportDialog}
        barbershopId={barbershop?.id}
        onImported={() => void refetch()}
      />

      <ConfirmDialog
        open={toDeactivate !== null}
        onOpenChange={(v) => !v && setToDeactivate(null)}
        title="Desativar cliente?"
        description={
          toDeactivate
            ? `"${toDeactivate.name}" vai para a lista de Clientes Desativados. Não será excluído e pode ser reativado depois.`
            : undefined
        }
        confirmLabel="Desativar"
        tone="danger"
        onConfirm={doDeactivate}
      />
    </div>
  );
}

export default function ClientesPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ClientesContent />
    </Suspense>
  );
}
