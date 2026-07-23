"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Receipt } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useProducts } from "@/hooks/useProducts";
import { ItensSection, LabeledSelect } from "@/components/orders";
import type { CatalogoOption, NovoItemInput } from "@/hooks/useComandaForm";
import type { ProfissionalVM } from "./types";
import type { Client } from "@/types/client.types";
import type { Branch } from "@/types/branch.types";
import type { Comanda, ComandaDraft, ComandaItem } from "@/types/orders.types";
import type { SelectOption } from "@/types/common.types";

/** Categorias existentes no catálogo informado (únicas, ordenadas). */
function categoriasDe(catalogo: CatalogoOption[]): SelectOption<string>[] {
  const map = new Map<string, string>();
  catalogo.forEach((c) => {
    if (c.categoriaId && c.categoriaNome) map.set(c.categoriaId, c.categoriaNome);
  });
  return [...map.entries()]
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

/**
 * Comanda de consumo: para clientes **sem agendamento** que consomem produtos
 * do bar/estoque. Vinculada a um cliente, filial e (opcionalmente) um
 * profissional — mas não a um agendamento real.
 */
export function DialogNovaComanda({
  open,
  onOpenChange,
  barbershopId,
  clients,
  branches,
  profissionais,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  barbershopId: string | undefined;
  clients: Client[];
  branches: Branch[];
  profissionais: ProfissionalVM[];
  onCreate: (draft: ComandaDraft) => Promise<Comanda | null>;
}) {
  const { products } = useProducts(barbershopId);

  const [clienteId, setClienteId] = useState("");
  const [filialId, setFilialId] = useState("");
  const [profissionalId, setProfissionalId] = useState("");
  const [itens, setItens] = useState<ComandaItem[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setClienteId("");
    setFilialId("");
    setProfissionalId("");
    setItens([]);
  }, [open]);

  const clienteOptions = useMemo<SelectOption<string>[]>(
    () => clients.map((c) => ({ value: c.id, label: c.name })),
    [clients],
  );

  const filialOptions = useMemo<SelectOption<string>[]>(
    () => branches.map((b) => ({ value: b.id, label: b.name })),
    [branches],
  );

  const profissionalOptions = useMemo<SelectOption<string>[]>(
    () =>
      profissionais
        .filter((p) => !filialId || p.branchId === filialId)
        .map((p) => ({ value: p.id, label: p.nome })),
    [profissionais, filialId],
  );

  const produtos = useMemo<CatalogoOption[]>(
    () =>
      products
        .filter((p) => p.status === "ACTIVE")
        .map((p) => ({
          id: p.id,
          nome: p.name,
          categoriaId: p.category?.id ?? null,
          categoriaNome: p.category?.name ?? null,
          valorInCents: p.priceInCents,
        })),
    [products],
  );

  const categoriasProdutos = useMemo(() => categoriasDe(produtos), [produtos]);

  function handleAddItem(input: NovoItemInput): boolean {
    const ref = produtos.find((p) => p.id === input.refId);
    if (!ref || input.quantidade < 1) return false;
    setItens((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        tipo: "PRODUTO",
        refId: ref.id,
        nome: ref.nome,
        categoriaNome: ref.categoriaNome,
        appointmentId: null,
        quantidade: input.quantidade,
        valorUnitarioInCents: input.valorUnitarioInCents,
      },
    ]);
    return true;
  }

  function handleRemoveItem(id: string) {
    setItens((prev) => prev.filter((i) => i.id !== id));
  }

  async function handleSalvar() {
    const cliente = clients.find((c) => c.id === clienteId);
    if (!cliente) {
      toast.error("Selecione o cliente.");
      return;
    }
    if (!filialId) {
      toast.error("Selecione a filial.");
      return;
    }
    if (itens.length === 0) {
      toast.error("Adicione ao menos um produto.");
      return;
    }
    setSubmitting(true);
    try {
      const created = await onCreate({
        tipo: "AVULSA",
        clienteAvulso: cliente.name,
        agendamentos: [],
        itens,
        observacoes: "",
        branchId: filialId,
        employeeId: profissionalId || null,
      });
      if (created) onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface-raised border border-border text-foreground max-w-2xl p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border-subtle">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="size-4 text-brand" />
              <DialogTitle className="text-base font-bold">
                Nova comanda de consumo
              </DialogTitle>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <LabeledSelect
              label="Cliente"
              required
              placeholder={
                clients.length === 0 ? "Nenhum cliente cadastrado" : "Selecionar cliente"
              }
              value={clienteId}
              onValueChange={setClienteId}
              options={clienteOptions}
            />
            <LabeledSelect
              label="Filial"
              required
              value={filialId}
              onValueChange={(v) => {
                setFilialId(v);
                setProfissionalId("");
              }}
              options={filialOptions}
            />
            <LabeledSelect
              label="Profissional"
              placeholder="Selecionar (opcional)"
              value={profissionalId}
              onValueChange={setProfissionalId}
              options={profissionalOptions}
            />
          </div>

          <ItensSection
            tipo="PRODUTO"
            comandaTipo="AVULSA"
            agendamentos={[]}
            categorias={categoriasProdutos}
            catalogo={produtos}
            itens={itens}
            onAdd={handleAddItem}
            onRemove={handleRemoveItem}
          />
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
            onClick={() => void handleSalvar()}
            disabled={submitting}
            className="h-9 px-5 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors flex items-center gap-1.5 disabled:opacity-60"
          >
            <Receipt className="size-3.5" />
            {submitting ? "Salvando…" : "Salvar comanda"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
