"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { RegistrosAtivosTable } from "@/components/shared/RegistrosAtivosTable";
import { ConfirmDialog, SelectField, StatusBadge } from "@/components/shared";
import { useAuth } from "@/hooks/useAuth";
import { usePartnerCompanies } from "@/hooks/usePartnerCompanies";
import { formatDate } from "@/utils/format";
import type {
  PartnerCompany,
  PartnerCompanyStatus,
} from "@/types/partner-company.types";
import type { SelectOption } from "@/types/common.types";

const STATUS_OPTIONS: SelectOption<PartnerCompanyStatus>[] = [
  { value: "ACTIVE", label: "Ativo" },
  { value: "INACTIVE", label: "Inativo" },
];

function FormLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
      {children}
      {required && <span className="text-brand">*</span>}
    </label>
  );
}

interface PartnerCompanyDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  company: PartnerCompany | null;
  onCreate: (payload: {
    name: string;
    status?: PartnerCompanyStatus;
  }) => Promise<unknown>;
  onUpdate: (
    id: string,
    payload: { name?: string; status?: PartnerCompanyStatus },
  ) => Promise<unknown>;
}

function PartnerCompanyDialog({
  open,
  onOpenChange,
  company,
  onCreate,
  onUpdate,
}: PartnerCompanyDialogProps) {
  const [name, setName] = useState("");
  const [status, setStatus] = useState<PartnerCompanyStatus>("ACTIVE");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(company?.name ?? "");
    setStatus(company?.status ?? "ACTIVE");
  }, [open, company]);

  async function handleSave() {
    if (!name.trim()) {
      toast.error("Informe o nome da empresa.");
      return;
    }
    setSaving(true);
    try {
      const result = company
        ? await onUpdate(company.id, { name: name.trim(), status })
        : await onCreate({ name: name.trim(), status });
      if (result) onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface-raised border border-border text-foreground max-w-md p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border-subtle">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-bold">
              {company ? "Editar Empresa Parceira" : "Nova Empresa Parceira"}
            </DialogTitle>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="size-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4">
          <div className="space-y-1.5">
            <FormLabel required>Nome</FormLabel>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-surface-base border-border text-foreground focus-visible:ring-brand/30 h-10"
            />
          </div>

          <SelectField
            id="status"
            label="Status"
            value={status}
            options={STATUS_OPTIONS}
            onChange={setStatus}
          />
        </div>

        <div className="px-6 pb-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-9 px-5 rounded-md border border-border bg-transparent text-sm text-foreground hover:bg-surface-elevated transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="h-9 px-5 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors disabled:opacity-60"
          >
            {saving ? "Salvando…" : "Salvar"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function EmpresasParceirasPage() {
  const { barbershop } = useAuth();
  const { companies, isLoading, refresh, create, update, remove } =
    usePartnerCompanies(barbershop?.id);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PartnerCompany | null>(null);
  const [toRemove, setToRemove] = useState<PartnerCompany | null>(null);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(c: PartnerCompany) {
    setEditing(c);
    setDialogOpen(true);
  }

  function doRemove() {
    if (!toRemove) return;
    void remove(toRemove.id);
    setToRemove(null);
  }

  return (
    <div className="p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
      <RegistrosAtivosTable
        title="Empresas Parceiras"
        subtitle="Empresas parceiras do clube do assinante"
        columns={[
          {
            key: "id",
            label: "ID",
            render: (r) => (
              <span className="font-mono text-xs text-muted-foreground">
                {r.id.slice(0, 8)}…
              </span>
            ),
          },
          { key: "name", label: "Nome" },
          {
            key: "createdAt",
            label: "Criado em",
            render: (r) => formatDate(r.createdAt),
          },
          {
            key: "status",
            label: "Status",
            render: (r) => (
              <StatusBadge tone={r.status === "ACTIVE" ? "success" : "neutral"}>
                {r.status === "ACTIVE" ? "Ativo" : "Inativo"}
              </StatusBadge>
            ),
          },
        ]}
        rows={companies}
        isLoading={isLoading}
        emptyLabel="Nenhuma empresa parceira cadastrada."
        searchPlaceholder="Buscar por nome..."
        onRefresh={() => void refresh()}
        csvFilename="empresas-parceiras"
        csvColumns={[
          { key: "id", label: "ID" },
          { key: "name", label: "Nome" },
          { key: "status", label: "Status" },
          { key: "createdAt", label: "Criado em" },
        ]}
        onCreate={openCreate}
        createLabel="Novo"
        renderActions={(r) => (
          <>
            <button
              type="button"
              onClick={() => openEdit(r)}
              className="size-7 rounded-md border border-border bg-surface-base text-muted-foreground flex items-center justify-center hover:border-brand/40 hover:text-brand transition-colors"
            >
              <Pencil className="size-3" />
            </button>
            <button
              type="button"
              onClick={() => setToRemove(r)}
              title="Apagar"
              className="size-7 rounded-md border border-danger/30 bg-transparent text-danger-foreground flex items-center justify-center hover:bg-danger/10 transition-colors"
            >
              <Trash2 className="size-3" />
            </button>
          </>
        )}
      />

      <PartnerCompanyDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        company={editing}
        onCreate={create}
        onUpdate={update}
      />

      <ConfirmDialog
        open={toRemove !== null}
        onOpenChange={(v) => !v && setToRemove(null)}
        title="Apagar empresa parceira?"
        description={
          toRemove
            ? `A empresa "${toRemove.name}" será removida permanentemente.`
            : undefined
        }
        confirmLabel="Apagar"
        tone="danger"
        onConfirm={doRemove}
      />
    </div>
  );
}
