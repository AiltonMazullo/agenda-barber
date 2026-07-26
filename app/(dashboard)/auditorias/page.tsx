"use client";

import { Fragment, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Download, Play } from "lucide-react";
import {
  PageHeader,
  SelectField,
  DatePickerField,
  Loading,
  EmptyState,
} from "@/components/shared";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useAuditLogs } from "@/hooks/useAuditLogs";
import { useClients } from "@/hooks/useClients";
import { exportToCsv } from "@/utils/csv-export";
import { formatDate } from "@/utils/format";
import type { AuditEntityType, AuditLog } from "@/types/audit-log.types";
import type { SelectOption } from "@/types/common.types";

type EntityTypeFilter = "TODOS" | AuditEntityType;

const ENTITY_TYPE_OPTIONS: SelectOption<EntityTypeFilter>[] = [
  { value: "TODOS", label: "Todos" },
  { value: "AGENDAMENTO", label: "Agendamentos" },
  { value: "BLOQUEIO", label: "Agendamentos bloqueados" },
  { value: "ASSINATURA", label: "Assinaturas" },
];

interface EntityGroup {
  entityId: string;
  entityType: AuditEntityType;
  clientId: string | null;
  /** Data do evento — createdAt da entrada mais recente do grupo. */
  latestAt: string;
  entries: AuditLog[];
}

function groupByEntity(logs: AuditLog[]): EntityGroup[] {
  const map = new Map<string, EntityGroup>();
  for (const log of logs) {
    const existing = map.get(log.entityId);
    if (existing) {
      existing.entries.push(log);
      if (new Date(log.createdAt) > new Date(existing.latestAt)) {
        existing.latestAt = log.createdAt;
      }
    } else {
      map.set(log.entityId, {
        entityId: log.entityId,
        entityType: log.entityType,
        clientId: log.clientId,
        latestAt: log.createdAt,
        entries: [log],
      });
    }
  }
  return Array.from(map.values()).sort(
    (a, b) => new Date(b.latestAt).getTime() - new Date(a.latestAt).getTime(),
  );
}

export default function AuditoriasPage() {
  const { barbershop } = useAuth();
  const { clients } = useClients(barbershop?.id);
  const { logs, isLoading, hasSearched, search } = useAuditLogs(
    barbershop?.id,
  );

  const [entityType, setEntityType] = useState<EntityTypeFilter>("TODOS");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const clientNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of clients) map.set(c.id, c.name);
    return map;
  }, [clients]);

  const groups = useMemo(() => groupByEntity(logs), [logs]);

  function toggleExpanded(entityId: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(entityId)) next.delete(entityId);
      else next.add(entityId);
      return next;
    });
  }

  function handleFilter() {
    void search({
      entityType: entityType === "TODOS" ? undefined : entityType,
      startDate: startDate ? startDate.toISOString() : undefined,
      endDate: endDate ? endDate.toISOString() : undefined,
    });
  }

  function handleExportCsv() {
    exportToCsv(
      "auditorias",
      logs.map((l) => ({
        id: l.id,
        entidade: l.entityId,
        tipo: l.entityType,
        cliente: l.clientId ? (clientNameMap.get(l.clientId) ?? l.clientId) : "",
        responsavel: l.actorName,
        operacao: l.action,
        campo: l.field,
        valorAntigo: l.oldValue ?? "",
        valorNovo: l.newValue ?? "",
        data: formatDate(l.createdAt, {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      })),
      [
        { key: "id", label: "ID" },
        { key: "entidade", label: "Entidade" },
        { key: "tipo", label: "Tipo" },
        { key: "cliente", label: "Cliente" },
        { key: "responsavel", label: "Responsável" },
        { key: "operacao", label: "Operação" },
        { key: "campo", label: "Campo alterado" },
        { key: "valorAntigo", label: "Valor antigo" },
        { key: "valorNovo", label: "Valor novo" },
        { key: "data", label: "Data" },
      ],
    );
  }

  return (
    <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
      <PageHeader
        title="Auditorias"
        subtitle="Histórico de alterações em agendamentos, bloqueios e assinaturas"
        actions={
          groups.length > 0 && (
            <button
              type="button"
              onClick={handleExportCsv}
              className="h-9 px-4 rounded-md border border-border bg-surface-raised text-sm text-foreground hover:bg-surface-elevated transition-colors flex items-center gap-1.5"
            >
              <Download className="size-3.5" />
              CSV
            </button>
          )
        }
      />

      <div className="flex flex-wrap items-end gap-3">
        <SelectField
          id="entityType"
          label="Tipo"
          value={entityType}
          options={ENTITY_TYPE_OPTIONS}
          onChange={setEntityType}
        />
        <DatePickerField
          id="startDate"
          label="Data Inicial"
          date={startDate}
          onChange={setStartDate}
        />
        <DatePickerField
          id="endDate"
          label="Data Final"
          date={endDate}
          onChange={setEndDate}
        />
        <button
          type="button"
          onClick={handleFilter}
          disabled={isLoading}
          className="h-10 px-4 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors flex items-center gap-1.5 disabled:opacity-50"
        >
          <Play className="size-3.5" />
          Filtrar
        </button>
      </div>

      {isLoading ? (
        <Loading />
      ) : !hasSearched ? (
        <EmptyState message="Escolha os filtros e clique em Filtrar para ver o histórico de auditorias." />
      ) : groups.length === 0 ? (
        <EmptyState message="Nenhum registro de auditoria encontrado." />
      ) : (
        <Card className="bg-surface-raised border-border">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="border-t border-border">
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground text-xs uppercase tracking-wider font-semibold px-4 py-3 h-auto" />
                    <TableHead className="text-muted-foreground text-xs uppercase tracking-wider font-semibold px-4 py-3 h-auto">
                      ID
                    </TableHead>
                    <TableHead className="text-muted-foreground text-xs uppercase tracking-wider font-semibold px-4 py-3 h-auto">
                      Cliente
                    </TableHead>
                    <TableHead className="text-muted-foreground text-xs uppercase tracking-wider font-semibold px-4 py-3 h-auto">
                      Início do agendamento
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groups.map((g) => {
                    const isOpen = expanded.has(g.entityId);
                    return (
                      <Fragment key={g.entityId}>
                        <TableRow
                          className="border-border hover:bg-surface-elevated/50 transition-colors cursor-pointer"
                          onClick={() => toggleExpanded(g.entityId)}
                        >
                          <TableCell className="px-4 py-4 w-8">
                            {isOpen ? (
                              <ChevronDown className="size-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="size-4 text-muted-foreground" />
                            )}
                          </TableCell>
                          <TableCell className="px-4 py-4 text-xs font-mono text-muted-foreground">
                            {g.entityId.slice(0, 10)}…
                          </TableCell>
                          <TableCell className="px-4 py-4 text-sm font-semibold">
                            {g.clientId
                              ? (clientNameMap.get(g.clientId) ?? g.clientId)
                              : "—"}
                          </TableCell>
                          <TableCell className="px-4 py-4 text-sm text-muted-foreground">
                            {formatDate(g.latestAt, {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </TableCell>
                        </TableRow>
                        {isOpen && (
                          <TableRow className="border-border hover:bg-transparent">
                            <TableCell colSpan={4} className="px-4 pb-4 pt-0">
                              <div className="rounded-md border border-border-subtle overflow-hidden">
                                <table className="w-full text-xs">
                                  <thead>
                                    <tr className="bg-surface-elevated text-left text-muted-foreground uppercase tracking-wider">
                                      <th className="px-3 py-2 font-semibold">
                                        Responsável
                                      </th>
                                      <th className="px-3 py-2 font-semibold">
                                        Operação
                                      </th>
                                      <th className="px-3 py-2 font-semibold">
                                        Data
                                      </th>
                                      <th className="px-3 py-2 font-semibold">
                                        Campo alterado
                                      </th>
                                      <th className="px-3 py-2 font-semibold">
                                        Valor antigo
                                      </th>
                                      <th className="px-3 py-2 font-semibold">
                                        Valor novo
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {g.entries
                                      .slice()
                                      .sort(
                                        (a, b) =>
                                          new Date(b.createdAt).getTime() -
                                          new Date(a.createdAt).getTime(),
                                      )
                                      .map((e) => (
                                        <tr
                                          key={e.id}
                                          className="border-t border-border-subtle"
                                        >
                                          <td className="px-3 py-2">
                                            {e.actorName}
                                          </td>
                                          <td className="px-3 py-2">
                                            {e.action}
                                          </td>
                                          <td className="px-3 py-2 whitespace-nowrap">
                                            {formatDate(e.createdAt, {
                                              day: "2-digit",
                                              month: "2-digit",
                                              year: "numeric",
                                              hour: "2-digit",
                                              minute: "2-digit",
                                            })}
                                          </td>
                                          <td className="px-3 py-2 font-medium">
                                            {e.field}
                                          </td>
                                          <td className="px-3 py-2 text-muted-foreground">
                                            {e.oldValue ?? "—"}
                                          </td>
                                          <td className="px-3 py-2 text-foreground">
                                            {e.newValue ?? "—"}
                                          </td>
                                        </tr>
                                      ))}
                                  </tbody>
                                </table>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
