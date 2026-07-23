"use client";

import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, CalendarOff, Download, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader, EmptyState, ConfirmDialog, Loading } from "@/components/shared";
import { useAuth } from "@/hooks/useAuth";
import { useBranches } from "@/hooks/useBranches";
import { useHolidays } from "@/hooks/useHolidays";
import { DialogFeriado } from "@/components/holidays/DialogFeriado";
import { HOLIDAY_STATUS_LABEL, HOLIDAY_STATUS_COLOR } from "@/components/holidays/status";
import { formatIsoDate } from "@/components/holidays/helpers";
import { exportToCsv } from "@/utils/csv-export";
import type { Holiday, HolidayPayload } from "@/types/holiday.types";

export default function FeriadosPage() {
  const { barbershop } = useAuth();
  const { branches } = useBranches(barbershop?.id);
  const { holidays, isLoading, create, update, remove, refetch } = useHolidays(
    barbershop?.id,
  );

  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState<Holiday | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Holiday | null>(null);

  const branchNameById = useMemo(() => {
    const m = new Map<string, string>();
    branches.forEach((b) => m.set(b.id, b.name));
    return m;
  }, [branches]);

  const sortedHolidays = useMemo(
    () => [...holidays].sort((a, b) => a.date.localeCompare(b.date)),
    [holidays],
  );

  async function handleSave(payload: HolidayPayload) {
    if (editing) {
      await update(editing.id, payload);
    } else {
      await create(payload);
    }
  }

  function handleExportCsv() {
    exportToCsv(
      "feriados",
      sortedHolidays.map((h) => ({
        nome: h.name,
        data: formatIsoDate(h.date),
        status: HOLIDAY_STATUS_LABEL[h.status],
        horarioInicio: h.startTime ?? "",
        horarioFim: h.endTime ?? "",
        filial: h.branchId
          ? (branchNameById.get(h.branchId) ?? "Filial removida")
          : "Todas as filiais",
      })),
      [
        { key: "nome", label: "Nome" },
        { key: "data", label: "Data" },
        { key: "status", label: "Status" },
        { key: "horarioInicio", label: "Horário Início" },
        { key: "horarioFim", label: "Horário Fim" },
        { key: "filial", label: "Filial" },
      ],
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Horário de Feriados"
        subtitle="Cadastre feriados e dias especiais — refletem na agenda e no agendamento do cliente"
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isLoading}
              className="size-9 rounded-md border border-border bg-surface-raised text-foreground hover:bg-surface-elevated transition-colors flex items-center justify-center disabled:opacity-50"
              title="Atualizar lista"
            >
              <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
            </button>
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={sortedHolidays.length === 0}
              className="h-9 px-4 rounded-md border border-border bg-surface-raised text-sm text-foreground hover:bg-surface-elevated transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <Download className="size-3.5" />
              CSV
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setDialog(true);
              }}
              className="h-9 px-4 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-all flex items-center gap-1.5"
            >
              <Plus className="size-3.5" />
              Novo Feriado
            </button>
          </div>
        }
      />

      <Card className="bg-surface-raised border-border">
        <CardContent className="p-0">
          {isLoading ? (
            <Loading />
          ) : sortedHolidays.length === 0 ? (
            <EmptyState
              icon={<CalendarOff className="size-10" />}
              message="Nenhum feriado cadastrado."
            />
          ) : (
            <div className="divide-y divide-border-subtle">
              {sortedHolidays.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between px-5 py-4 hover:bg-surface-elevated/40 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-white">
                        {h.name}
                      </p>
                      <span
                        className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${HOLIDAY_STATUS_COLOR[h.status]}26`,
                          color: HOLIDAY_STATUS_COLOR[h.status],
                        }}
                      >
                        {HOLIDAY_STATUS_LABEL[h.status]}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatIsoDate(h.date)} ·{" "}
                      {h.branchId
                        ? (branchNameById.get(h.branchId) ?? "Filial removida")
                        : "Todas as filiais"}
                    </p>
                    <p className="text-xs text-text-faint mt-0.5">
                      {h.status === "OPEN" && h.startTime && h.endTime
                        ? `${h.startTime} – ${h.endTime}`
                        : "Dia todo"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(h);
                        setDialog(true);
                      }}
                      className="size-7 rounded-md border border-border bg-surface-base text-muted-foreground flex items-center justify-center hover:border-[#f5b82e]/40 hover:text-brand transition-colors"
                    >
                      <Pencil className="size-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(h)}
                      className="size-7 rounded-md border border-red-500/30 bg-transparent text-red-400 flex items-center justify-center hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <DialogFeriado
        open={dialog}
        onOpenChange={setDialog}
        holiday={editing}
        branches={branches}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={!!confirmDelete}
        onOpenChange={(v) => !v && setConfirmDelete(null)}
        title="Remover feriado?"
        description={`O feriado "${confirmDelete?.name ?? ""}" será removido. Essa ação não pode ser desfeita.`}
        tone="danger"
        confirmLabel="Remover"
        onConfirm={() => confirmDelete && void remove(confirmDelete.id)}
      />
    </div>
  );
}
