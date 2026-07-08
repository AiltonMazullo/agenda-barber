"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, Check, NotebookPen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog, Loading } from "@/components/shared";
import { useComandaForm } from "@/hooks/useComandaForm";
import { formatBRL } from "@/utils/format";
import { TipoSection } from "./TipoSection";
import { ItensSection } from "./ItensSection";
import { FormSection } from "./FormSection";
import type { Comanda, ComandaDraft, ComandaTipo } from "@/types/orders.types";

export interface ComandaFormProps {
  barbershopId: string | undefined;
  /** Comanda existente (edição). Ausente na criação. */
  comanda?: Comanda;
  submitLabel: string;
  onSubmit: (draft: ComandaDraft) => void;
}

export function ComandaForm({
  barbershopId,
  comanda,
  submitLabel,
  onSubmit,
}: ComandaFormProps) {
  const router = useRouter();
  const form = useComandaForm(barbershopId, comanda);
  const [tipoPendente, setTipoPendente] = useState<ComandaTipo | null>(null);

  function handleSubmit() {
    const draft = form.buildDraft();
    if (draft) onSubmit(draft);
  }

  function handleTipoChange(next: ComandaTipo) {
    if (next === form.tipo) return;
    if (form.hasComposicao) {
      setTipoPendente(next);
    } else {
      form.setTipo(next);
    }
  }

  if (form.isLoadingCatalog) {
    return <Loading />;
  }

  return (
    <div className="space-y-5">
      <TipoSection
        tipo={form.tipo}
        onTipoChange={handleTipoChange}
        clienteAvulso={form.clienteAvulso}
        onClienteAvulsoChange={form.setClienteAvulso}
      />

      <ItensSection
        tipo="PRODUTO"
        comandaTipo={form.tipo}
        agendamentos={form.agendamentoOptions}
        categorias={form.categoriasProdutos}
        catalogo={form.produtos}
        itens={form.itens}
        onAdd={form.addItem}
        onRemove={form.removeItem}
      />

      <ItensSection
        tipo="SERVICO"
        comandaTipo={form.tipo}
        agendamentos={form.agendamentoOptions}
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
          placeholder="Ex.: cliente pediu para cobrar o produto na próxima visita..."
          className="min-h-18 resize-none bg-surface-base border-border text-foreground placeholder:text-text-faint focus-visible:ring-brand/30"
        />
      </FormSection>

      {form.erro && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-md border border-danger/30 bg-danger-bg px-4 py-2.5 text-sm font-medium text-danger-foreground"
        >
          <AlertCircle className="size-4 shrink-0" />
          {form.erro}
        </div>
      )}

      <Card className="bg-surface-raised border-border py-0">
        <CardContent className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 px-4 md:px-5 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/orders")}
            className="h-10 cursor-pointer border-border bg-transparent text-foreground hover:bg-surface-elevated"
          >
            <ArrowLeft className="size-4" />
            Voltar
          </Button>

          <div className="flex items-center justify-between sm:justify-end gap-4">
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Total da comanda
              </p>
              <p className="text-lg font-bold text-brand leading-tight">
                {formatBRL(form.totalInCents / 100)}
              </p>
            </div>
            <Button
              type="button"
              onClick={handleSubmit}
              className="h-10 cursor-pointer bg-brand text-brand-foreground font-bold hover:bg-brand-hover hover:shadow-[0_0_16px_rgba(245,184,46,0.35)] transition-all"
            >
              <Check className="size-4" />
              {submitLabel}
            </Button>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={tipoPendente !== null}
        onOpenChange={(v) => !v && setTipoPendente(null)}
        title="Trocar o tipo da comanda?"
        description="Os itens adicionados serão descartados."
        confirmLabel="Trocar tipo"
        tone="danger"
        onConfirm={() => {
          if (tipoPendente) form.setTipo(tipoPendente);
          setTipoPendente(null);
        }}
      />
    </div>
  );
}
