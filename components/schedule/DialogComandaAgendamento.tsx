"use client";

import { useEffect, useRef, useState } from "react";
import { X, Receipt, NotebookPen } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Loading } from "@/components/shared";
import { useComandaForm } from "@/hooks/useComandaForm";
import {
  ItensSection,
  FormSection,
  AgendamentosSection,
} from "@/components/orders";
import type { AgendamentoVM } from "./types";
import type { Comanda, ComandaDraft } from "@/types/orders.types";

/**
 * Comanda aberta a partir do detalhe de um agendamento (item 1.5 da spec) —
 * já vem atrelada ao agendamento que originou a abertura, e permite
 * adicionar produtos, serviços e outros agendamentos antes de salvar. Nada é
 * persistido enquanto o usuário não confirma (Salvar/Fechar comanda).
 */
export function DialogComandaAgendamento({
  open,
  onOpenChange,
  barbershopId,
  agendamento,
  onSave,
  onFechar,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  barbershopId: string | undefined;
  agendamento: AgendamentoVM | null;
  onSave: (draft: ComandaDraft) => Promise<Comanda | null>;
  onFechar: (draft: ComandaDraft) => Promise<Comanda | null>;
}) {
  const form = useComandaForm(barbershopId);
  const [submitting, setSubmitting] = useState<"salvar" | "fechar" | null>(null);
  const seededRef = useRef(false);

  useEffect(() => {
    if (!open || !agendamento || form.isLoadingCatalog || seededRef.current) return;
    seededRef.current = true;
    form.addLinkedAppointment(agendamento.id);
    const svc = form.servicos.find((s) => s.id === agendamento.servicoId);
    if (svc) {
      form.addItem({
        tipo: "SERVICO",
        refId: svc.id,
        appointmentId: agendamento.id,
        quantidade: 1,
        valorUnitarioInCents: svc.valorInCents,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, agendamento, form.isLoadingCatalog, form.servicos]);

  async function handleSubmit(kind: "salvar" | "fechar") {
    const draft = form.buildDraft();
    if (!draft) return;
    setSubmitting(kind);
    try {
      const created =
        kind === "fechar" ? await onFechar(draft) : await onSave(draft);
      if (created) onOpenChange(false);
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface-raised border border-border text-foreground max-w-2xl p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border-subtle">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="size-4 text-brand" />
              <DialogTitle className="text-base font-bold">Comanda</DialogTitle>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="size-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto schedule-scroll">
          {form.isLoadingCatalog ? (
            <Loading />
          ) : (
            <>
              <AgendamentosSection
                linkedOptions={form.linkedOptions}
                availableToLinkOptions={form.availableToLinkOptions}
                onAdd={form.addLinkedAppointment}
                onRemove={form.removeLinkedAppointment}
              />

              <ItensSection
                tipo="PRODUTO"
                comandaTipo="AGENDAMENTO"
                agendamentos={form.linkedOptions}
                categorias={form.categoriasProdutos}
                catalogo={form.produtos}
                itens={form.itens}
                onAdd={form.addItem}
                onRemove={form.removeItem}
              />

              <ItensSection
                tipo="SERVICO"
                comandaTipo="AGENDAMENTO"
                agendamentos={form.linkedOptions}
                categorias={form.categoriasServicos}
                catalogo={form.servicos}
                itens={form.itens}
                onAdd={form.addItem}
                onRemove={form.removeItem}
              />

              <FormSection
                icon={<NotebookPen />}
                title="Observações"
                subtitle="Anotações internas sobre esta comanda (opcional)"
              >
                <Textarea
                  value={form.observacoes}
                  onChange={(e) => form.setObservacoes(e.target.value)}
                  placeholder="Opcional"
                  className="min-h-18 resize-none bg-surface-base border-border text-foreground placeholder:text-text-faint focus-visible:ring-brand/30"
                />
              </FormSection>

              {form.erro && (
                <p className="text-xs text-danger-foreground">{form.erro}</p>
              )}
            </>
          )}
        </div>

        <div className="px-6 pb-6 flex justify-end gap-3 border-t border-border-subtle pt-4">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-9 px-5 rounded-md border border-border bg-transparent text-sm text-foreground hover:bg-surface-elevated transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => void handleSubmit("fechar")}
            disabled={submitting !== null}
            className="h-9 px-5 rounded-md border border-border bg-surface-elevated text-sm text-foreground hover:border-brand/40 transition-colors disabled:opacity-60"
          >
            {submitting === "fechar" ? "Fechando…" : "Fechar comanda"}
          </button>
          <button
            type="button"
            onClick={() => void handleSubmit("salvar")}
            disabled={submitting !== null}
            className="h-9 px-5 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors disabled:opacity-60"
          >
            {submitting === "salvar" ? "Salvando…" : "Salvar"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
