"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Download, Plus, RefreshCw, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InfoTooltip } from "@/components/shared/InfoTooltip";
import { EmptyState } from "@/components/shared/EmptyState";
import { Loading } from "@/components/shared/Loading";
import { DataTablePagination } from "@/components/shared/DataTablePagination";
import { usePagination, type PageSize } from "@/hooks/usePagination";
import { exportToCsv } from "@/utils/csv-export";

export interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => ReactNode;
  className?: string;
}

interface CsvColumn<T> {
  key: keyof T;
  label: string;
}

export interface RegistrosAtivosTableProps<T extends { id: string }> {
  /** Título do card. @default "Registros Ativos" */
  title?: string;
  /** Subtítulo exibido abaixo do título. */
  subtitle: string;
  columns: Column<T>[];
  rows: T[];
  isLoading?: boolean;
  emptyLabel?: string;
  searchPlaceholder?: string;
  /**
   * Quando fornecido, delega a busca para o consumidor (ex.: busca no
   * servidor). Quando omitido, filtra `rows` localmente por todos os campos
   * de texto (string) de cada item.
   */
  onSearch?: (term: string) => void;
  /** Quando fornecido, exibe o botão de refresh. */
  onRefresh?: () => void;
  /** Nome do arquivo exportado (sem extensão). Requer `csvColumns`. */
  csvFilename?: string;
  /** Colunas usadas para montar o CSV. Requer `csvFilename`. */
  csvColumns?: CsvColumn<T>[];
  /** Quando fornecido, exibe o botão "Novo". */
  onCreate?: () => void;
  /** Rótulo do botão "Novo". @default "Novo" */
  createLabel?: string;
  /** Quando fornecido, exibe um InfoTooltip ao lado do botão "Novo". */
  createTooltip?: string;
  /** Conteúdo customizado da coluna "Opções" (ex.: editar/apagar). */
  renderActions?: (row: T) => ReactNode;
  pageSize?: PageSize;
}

function defaultCellValue<T>(row: T, key: string): ReactNode {
  const value = (row as Record<string, unknown>)[key];
  if (value === null || value === undefined) return "—";
  return String(value);
}

/**
 * Listagem genérica no padrão "Registros Ativos": título + subtítulo, botão
 * "Novo" (com tooltip de info opcional), busca, exportação CSV, refresh,
 * tabela paginada com coluna final "Opções".
 */
export function RegistrosAtivosTable<T extends { id: string }>({
  title = "Registros Ativos",
  subtitle,
  columns,
  rows,
  isLoading = false,
  emptyLabel = "Nenhum registro encontrado.",
  searchPlaceholder = "Buscar...",
  onSearch,
  onRefresh,
  csvFilename,
  csvColumns,
  onCreate,
  createLabel = "Novo",
  createTooltip,
  renderActions,
  pageSize = 10,
}: RegistrosAtivosTableProps<T>) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (onSearch) return rows;
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      Object.values(row as Record<string, unknown>).some(
        (value) => typeof value === "string" && value.toLowerCase().includes(q),
      ),
    );
  }, [rows, search, onSearch]);

  const pag = usePagination(filtered, pageSize);

  function handleSearchChange(value: string) {
    setSearch(value);
    onSearch?.(value);
  }

  function handleExportCsv() {
    if (!csvFilename || !csvColumns) return;
    exportToCsv(
      csvFilename,
      filtered as Record<string, unknown>[],
      csvColumns as { key: string; label: string }[],
    );
  }

  const showCsvButton = Boolean(csvFilename && csvColumns);
  const columnCount = columns.length + (renderActions ? 1 : 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>
        </div>

        {onCreate && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCreate}
              className="h-9 px-4 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors flex items-center gap-1.5"
            >
              <Plus className="size-3.5" />
              {createLabel}
            </button>
            {createTooltip && <InfoTooltip text={createTooltip} />}
          </div>
        )}
      </div>

      <Card className="bg-surface-raised border-border">
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-4 border-b border-border-subtle">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9 bg-surface-base border-border text-foreground placeholder:text-muted-foreground h-9 text-sm focus-visible:ring-brand/40"
              />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {showCsvButton && (
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="h-9 px-4 rounded-md border border-border bg-surface-raised text-sm text-foreground hover:bg-surface-elevated transition-colors flex items-center gap-1.5"
                >
                  <Download className="size-3.5" />
                  CSV
                </button>
              )}
              {onRefresh && (
                <button
                  type="button"
                  onClick={onRefresh}
                  aria-label="Atualizar"
                  title="Atualizar"
                  className="size-9 rounded-md border border-border bg-surface-raised text-muted-foreground flex items-center justify-center hover:border-brand/40 hover:text-brand transition-colors"
                >
                  <RefreshCw className="size-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="border-t border-border">
                <TableRow className="border-border hover:bg-transparent">
                  {columns.map((col) => (
                    <TableHead
                      key={col.key}
                      className={
                        col.className ??
                        "text-muted-foreground text-xs uppercase tracking-wider font-semibold px-4 py-3 h-auto"
                      }
                    >
                      {col.label}
                    </TableHead>
                  ))}
                  {renderActions && (
                    <TableHead className="text-muted-foreground text-xs uppercase tracking-wider font-semibold px-4 py-3 h-auto">
                      Opções
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow className="border-border hover:bg-transparent">
                    <TableCell colSpan={columnCount} className="py-4">
                      <Loading />
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow className="border-border hover:bg-transparent">
                    <TableCell colSpan={columnCount} className="py-4">
                      <EmptyState
                        message={
                          rows.length === 0
                            ? emptyLabel
                            : "Nenhum registro corresponde à busca."
                        }
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  pag.pageItems.map((row) => (
                    <TableRow
                      key={row.id}
                      className="border-border hover:bg-surface-elevated/50 transition-colors"
                    >
                      {columns.map((col) => (
                        <TableCell key={col.key} className="px-4 py-4 text-sm">
                          {col.render
                            ? col.render(row)
                            : defaultCellValue(row, col.key)}
                        </TableCell>
                      ))}
                      {renderActions && (
                        <TableCell className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            {renderActions(row)}
                          </div>
                        </TableCell>
                      )}
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
