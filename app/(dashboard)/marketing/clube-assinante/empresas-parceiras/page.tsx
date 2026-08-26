"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Copy, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { RegistrosAtivosTable } from "@/components/shared/RegistrosAtivosTable";
import { ConfirmDialog, StatusBadge } from "@/components/shared";
import { useAuth } from "@/hooks/useAuth";
import { usePartnerCompanies } from "@/hooks/usePartnerCompanies";
import { formatDate } from "@/utils/format";
import type { PartnerCompany } from "@/types/partner-company.types";

/** Link público (sem login) onde a empresa parceira confere quem resgatou qual cupom dela. */
function partnerLink(slug: string): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/parceiro/${slug}`;
}

async function copyPartnerLink(slug: string) {
  try {
    await navigator.clipboard.writeText(partnerLink(slug));
    toast.success("Link copiado.");
  } catch {
    toast.error("Não foi possível copiar o link.");
  }
}

export default function EmpresasParceirasPage() {
  const router = useRouter();
  const { barbershop } = useAuth();
  const { companies, isLoading, refresh, remove } =
    usePartnerCompanies(barbershop?.id);

  const [toRemove, setToRemove] = useState<PartnerCompany | null>(null);

  function openCreate() {
    router.push("/marketing/clube-assinante/empresas-parceiras/novo");
  }

  function openEdit(c: PartnerCompany) {
    router.push(`/marketing/clube-assinante/empresas-parceiras/${c.id}`);
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
        subtitle={`Empresas parceiras do ${barbershop?.clubName || "Clube do Assinante"}`}
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
            key: "slug",
            label: "Link de validação",
            render: (r) =>
              r.slug ? (
                <button
                  type="button"
                  onClick={() => void copyPartnerLink(r.slug!)}
                  title="Copiar link — a empresa parceira usa para conferir os cupons resgatados, sem login"
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-brand hover:underline"
                >
                  <Copy className="size-3" />
                  /parceiro/{r.slug}
                </button>
              ) : (
                <span className="text-xs text-muted-foreground">
                  Edite para gerar o link
                </span>
              ),
          },
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
          { key: "slug", label: "Slug do link" },
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
