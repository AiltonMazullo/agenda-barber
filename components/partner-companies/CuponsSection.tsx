"use client";

import { useState } from "react";
import { Pencil, Trash2, TicketPercent } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ConfirmDialog, DatePickerField } from "@/components/shared";
import { formatDate } from "@/utils/format";
import type {
  Coupon,
  CreateCouponPayload,
  UpdateCouponPayload,
} from "@/types/partner-company.types";
import { SectionShell, FieldLabel, INPUT_CLS } from "./Primitives";

const EMPTY_FORM = {
  name: "",
  code: "",
  description: "",
  discount: "",
  expiresAt: undefined as Date | undefined,
};

/** "Cadastrar cupons" + "Cupons cadastrados" — CRUD de promoções da empresa parceira. */
export function CuponsSection({
  coupons,
  isLoading,
  onAdd,
  onUpdate,
  onRemove,
}: {
  coupons: Coupon[];
  isLoading?: boolean;
  onAdd: (payload: CreateCouponPayload) => Promise<Coupon | null>;
  onUpdate: (id: string, payload: UpdateCouponPayload) => Promise<Coupon | null>;
  onRemove: (id: string) => Promise<boolean>;
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toRemove, setToRemove] = useState<Coupon | null>(null);

  function update<K extends keyof typeof EMPTY_FORM>(key: K, value: (typeof EMPTY_FORM)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function startEdit(coupon: Coupon) {
    setEditingId(coupon.id);
    setForm({
      name: coupon.name ?? "",
      code: coupon.code,
      description: coupon.description ?? "",
      discount: coupon.discount,
      expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt) : undefined,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function handleSubmit() {
    if (!form.name.trim()) return toast.error("Informe o nome da promoção.");
    if (!form.code.trim()) return toast.error("Informe o código do cupom.");
    if (!form.description.trim()) return toast.error("Informe a descrição.");
    if (!form.discount.trim()) return toast.error("Informe a porcentagem de desconto.");

    const payload = {
      name: form.name.trim(),
      code: form.code.trim(),
      description: form.description.trim(),
      discount: form.discount.trim(),
      expiresAt: form.expiresAt?.toISOString(),
    };

    setSaving(true);
    try {
      const result = editingId
        ? await onUpdate(editingId, payload)
        : await onAdd(payload as CreateCouponPayload);
      if (result) cancelEdit();
    } finally {
      setSaving(false);
    }
  }

  function doRemove() {
    if (!toRemove) return;
    void onRemove(toRemove.id);
    setToRemove(null);
  }

  return (
    <>
      <SectionShell
        title="Cadastrar cupons"
        description="Gerencie seus cupons."
      >
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <FieldLabel required>Nome da promoção</FieldLabel>
              <Input
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Ex.: Promoção verão"
                className={INPUT_CLS}
              />
            </div>
            <div className="space-y-1.5">
              <FieldLabel required>Código</FieldLabel>
              <Input
                value={form.code}
                onChange={(e) => update("code", e.target.value.toUpperCase())}
                placeholder="PROMO20"
                className={INPUT_CLS}
              />
            </div>
            <div className="space-y-1.5">
              <FieldLabel>Data de expiração</FieldLabel>
              <DatePickerField
                id="cupom-expiracao"
                date={form.expiresAt}
                onChange={(d) => update("expiresAt", d)}
                className="min-w-0"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <FieldLabel required>Descrição</FieldLabel>
            <Textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Descreva as condições da promoção"
              className="bg-surface-base border-border text-foreground placeholder:text-text-faint focus-visible:ring-brand/30 min-h-[72px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <FieldLabel required>Porcentagem de desconto</FieldLabel>
              <div className="relative">
                <Input
                  value={form.discount}
                  onChange={(e) => update("discount", e.target.value.replace(/[^0-9]/g, ""))}
                  inputMode="numeric"
                  placeholder="15"
                  className={`${INPUT_CLS} pr-8`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  %
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="h-9 px-4 rounded-md border border-border bg-transparent text-sm text-foreground hover:bg-surface-elevated transition-colors"
              >
                Cancelar edição
              </button>
            )}
            <Button
              type="button"
              disabled={saving}
              onClick={handleSubmit}
              className="h-9 px-5 bg-brand hover:bg-brand-hover text-brand-foreground font-bold disabled:opacity-60"
            >
              <TicketPercent className="size-3.5 mr-1.5" />
              {saving
                ? "Salvando…"
                : editingId
                  ? "Salvar promoção"
                  : "Adicionar promoção"}
            </Button>
          </div>
        </div>
      </SectionShell>

      <SectionShell title="Cupons cadastrados" description="Gerencie seus cupons.">
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b border-border-subtle">
                <th className="py-2 pr-3">ID</th>
                <th className="py-2 pr-3">Nome</th>
                <th className="py-2 pr-3">Código</th>
                <th className="py-2 pr-3">Desconto</th>
                <th className="py-2 pr-3">Data de expiração</th>
                <th className="py-2 pr-3">Descrição</th>
                <th className="py-2 pr-3 text-right">Opções</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-muted-foreground">
                    Carregando…
                  </td>
                </tr>
              )}
              {!isLoading && coupons.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-muted-foreground">
                    Nenhum cupom cadastrado.
                  </td>
                </tr>
              )}
              {coupons.map((c) => (
                <tr key={c.id} className="border-b border-border-subtle last:border-0">
                  <td className="py-2.5 pr-3 font-mono text-xs text-muted-foreground">
                    {c.id.slice(0, 8)}…
                  </td>
                  <td className="py-2.5 pr-3 text-foreground">{c.name ?? "—"}</td>
                  <td className="py-2.5 pr-3 font-mono text-xs text-foreground">{c.code}</td>
                  <td className="py-2.5 pr-3 text-foreground">{c.discount}%</td>
                  <td className="py-2.5 pr-3 text-muted-foreground">
                    {c.expiresAt ? formatDate(c.expiresAt) : "—"}
                  </td>
                  <td className="py-2.5 pr-3 text-muted-foreground max-w-[220px] truncate">
                    {c.description ?? "—"}
                  </td>
                  <td className="py-2.5 pr-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(c)}
                        className="size-7 rounded-md border border-border bg-surface-base text-muted-foreground flex items-center justify-center hover:border-brand/40 hover:text-brand transition-colors"
                      >
                        <Pencil className="size-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setToRemove(c)}
                        title="Apagar"
                        className="size-7 rounded-md border border-danger/30 bg-transparent text-danger-foreground flex items-center justify-center hover:bg-danger/10 transition-colors"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionShell>

      <ConfirmDialog
        open={toRemove !== null}
        onOpenChange={(v) => !v && setToRemove(null)}
        title="Apagar cupom?"
        description={
          toRemove
            ? `O cupom "${toRemove.code}" será removido permanentemente.`
            : undefined
        }
        confirmLabel="Apagar"
        tone="danger"
        onConfirm={doRemove}
      />
    </>
  );
}
