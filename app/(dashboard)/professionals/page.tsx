"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Sparkles, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Can, ConfirmDialog } from "@/components/shared";
import {
  RegistrosAtivosTable,
  type Column,
} from "@/components/shared/RegistrosAtivosTable";
import { useAuth } from "@/hooks/useAuth";
import { useEmployees } from "@/hooks/useEmployees";
import { formatDate } from "@/utils/format";
import { exportToCsv } from "@/utils/csv-export";
import type { Employee } from "@/types/employee.types";

export default function ProfessionalsPage() {
  const router = useRouter();
  const { barbershop } = useAuth();
  const { employees, isLoading, remove } = useEmployees(barbershop?.id);

  // Não há, hoje, um campo de status ativo/inativo para Employee no backend
  // (ver types/employee.types.ts e employees.service.ts) — o único conceito de
  // visibilidade existente é `hidden` (oculta o profissional do app do
  // cliente). Por isso o checkbox abaixo reaproveita `hidden` como proxy de
  // "inativo": desmarcado (padrão), a lista some com os profissionais
  // ocultos; marcado, mostra todos.
  const [showHidden, setShowHidden] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);

  const visibleEmployees = useMemo(
    () => (showHidden ? employees : employees.filter((e) => !e.hidden)),
    [employees, showHidden],
  );

  const columns: Column<Employee>[] = [
    {
      key: "id",
      label: "ID",
      render: (e) => (
        <span className="font-mono text-xs text-muted-foreground" title={e.id}>
          {e.id.slice(0, 8)}…
        </span>
      ),
    },
    {
      key: "name",
      label: "Nome",
      render: (e) => (
        <Link
          href={`/professionals/${e.id}`}
          className="font-semibold text-foreground hover:text-brand transition-colors"
        >
          {e.name}
        </Link>
      ),
    },
    { key: "email", label: "E-mail" },
    {
      key: "hidden",
      label: "Status",
      render: (e) => (
        <span
          className={
            e.hidden
              ? "text-muted-foreground/70"
              : "text-success-foreground font-medium"
          }
        >
          {e.hidden ? "Oculto" : "Visível"}
        </span>
      ),
    },
    {
      key: "tipo",
      label: "Tipo",
      render: () => "PROFISSIONAL",
    },
    {
      key: "createdAt",
      label: "Criado em",
      render: (e) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {formatDate(e.createdAt)}
        </span>
      ),
    },
    {
      key: "updatedAt",
      label: "Atualizado em",
      render: (e) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {formatDate(e.updatedAt)}
        </span>
      ),
    },
  ];

  function handleExportAll() {
    exportToCsv(
      "profissionais",
      employees.map((e) => ({
        id: e.id,
        nome: e.name,
        email: e.email,
        status: e.hidden ? "Oculto" : "Visível",
        tipo: "PROFISSIONAL",
        criadoEm: formatDate(e.createdAt),
        atualizadoEm: formatDate(e.updatedAt),
      })),
      [
        { key: "id", label: "ID" },
        { key: "nome", label: "Nome" },
        { key: "email", label: "E-mail" },
        { key: "status", label: "Status" },
        { key: "tipo", label: "Tipo" },
        { key: "criadoEm", label: "Criado em" },
        { key: "atualizadoEm", label: "Atualizado em" },
      ],
    );
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    await remove(deleteTarget.id);
    setDeleteTarget(null);
  }

  return (
    <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm text-muted-foreground select-none">
          <Checkbox
            checked={showHidden}
            onCheckedChange={(c) => setShowHidden(c === true)}
          />
          Mostrar registros inativos?
        </label>

        <div className="flex items-center gap-2">
          <Link
            href="/professionals/destaque"
            className="h-9 px-4 rounded-md border border-border bg-surface-raised text-sm text-foreground hover:bg-surface-elevated transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="size-3.5" />
            Profissional destaque
          </Link>
          <button
            type="button"
            onClick={handleExportAll}
            className="h-9 px-4 rounded-md border border-border bg-surface-raised text-sm text-foreground hover:bg-surface-elevated transition-colors flex items-center gap-1.5"
          >
            Exportar todos
          </button>
        </div>
      </div>

      <RegistrosAtivosTable<Employee>
        title="Profissionais"
        subtitle="Equipe e configurações de atendimento"
        columns={columns}
        rows={visibleEmployees}
        isLoading={isLoading}
        emptyLabel="Nenhum profissional cadastrado."
        searchPlaceholder="Buscar por nome ou e-mail..."
        csvFilename="profissionais-filtrados"
        csvColumns={[
          { key: "id", label: "ID" },
          { key: "name", label: "Nome" },
          { key: "email", label: "E-mail" },
          { key: "createdAt", label: "Criado em" },
          { key: "updatedAt", label: "Atualizado em" },
        ]}
        onCreate={() => router.push("/professionals/new")}
        createLabel="Novo profissional"
        createTooltip="Cadastre um novo profissional da equipe."
        renderActions={(e) => (
          <>
            <Can permission="usuario.atualizar">
              <Link
                href={`/professionals/${e.id}`}
                title="Editar profissional"
                className="size-7 rounded-md border border-border bg-surface-base text-muted-foreground flex items-center justify-center hover:border-brand/40 hover:text-brand transition-colors"
              >
                <Pencil className="size-3" />
              </Link>
            </Can>
            <Can permission="usuario.remover">
              <button
                type="button"
                onClick={() => setDeleteTarget(e)}
                title="Remover profissional"
                className="size-7 rounded-md border border-danger/30 bg-transparent text-danger-foreground flex items-center justify-center hover:bg-danger/10 transition-colors"
              >
                <Trash2 className="size-3" />
              </button>
            </Can>
          </>
        )}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Remover profissional"
        description={
          deleteTarget
            ? `Remover ${deleteTarget.name}? Essa ação não pode ser desfeita.`
            : undefined
        }
        confirmLabel="Remover"
        tone="danger"
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
