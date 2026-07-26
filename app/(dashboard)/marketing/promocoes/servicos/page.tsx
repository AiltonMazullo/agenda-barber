"use client";

import { useEffect, useMemo, useState } from "react";
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
import { ConfirmDialog, DatePickerField, SelectField } from "@/components/shared";
import { useAuth } from "@/hooks/useAuth";
import { useServices } from "@/hooks/useServices";
import { useServicePromotions } from "@/hooks/useServicePromotions";
import { formatDate } from "@/utils/format";
import type { ServicePromotion } from "@/types/service-promotion.types";
import type { SelectOption } from "@/types/common.types";

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

interface PromotionDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  promotion: ServicePromotion | null;
  serviceOptions: SelectOption<string>[];
  onCreate: (payload: {
    serviceId: string;
    discountValue: number;
    startAt: string;
    endAt: string;
  }) => Promise<unknown>;
  onUpdate: (
    id: string,
    payload: { discountValue?: number; startAt?: string; endAt?: string },
  ) => Promise<unknown>;
}

function PromotionDialog({
  open,
  onOpenChange,
  promotion,
  serviceOptions,
  onCreate,
  onUpdate,
}: PromotionDialogProps) {
  const [serviceId, setServiceId] = useState<string>("");
  const [discountValue, setDiscountValue] = useState("");
  const [startAt, setStartAt] = useState<Date | undefined>();
  const [endAt, setEndAt] = useState<Date | undefined>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setServiceId(promotion?.serviceId ?? serviceOptions[0]?.value ?? "");
    setDiscountValue(promotion ? String(promotion.discountValue) : "");
    setStartAt(promotion ? new Date(promotion.startAt) : undefined);
    setEndAt(promotion ? new Date(promotion.endAt) : undefined);
  }, [open, promotion, serviceOptions]);

  async function handleSave() {
    const discount = parseInt(discountValue, 10);
    if (!promotion && !serviceId) {
      toast.error("Selecione um serviço.");
      return;
    }
    if (!Number.isFinite(discount) || discount <= 0) {
      toast.error("Informe um valor de desconto válido.");
      return;
    }
    if (!startAt || !endAt) {
      toast.error("Informe as datas de início e fim.");
      return;
    }
    if (endAt <= startAt) {
      toast.error("A data final deve ser depois da data inicial.");
      return;
    }
    setSaving(true);
    try {
      const result = promotion
        ? await onUpdate(promotion.id, {
            discountValue: discount,
            startAt: startAt.toISOString(),
            endAt: endAt.toISOString(),
          })
        : await onCreate({
            serviceId,
            discountValue: discount,
            startAt: startAt.toISOString(),
            endAt: endAt.toISOString(),
          });
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
              {promotion ? "Editar Promoção" : "Nova Promoção"}
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
          {!promotion && (
            <SelectField
              id="serviceId"
              label="Serviço"
              value={serviceId}
              options={serviceOptions}
              onChange={setServiceId}
            />
          )}

          <div className="space-y-1.5">
            <FormLabel required>Valor do desconto</FormLabel>
            <Input
              type="number"
              min={1}
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              className="bg-surface-base border-border text-foreground focus-visible:ring-brand/30 h-10"
            />
          </div>

          <div className="flex gap-3">
            <DatePickerField
              id="startAt"
              label="Início *"
              date={startAt}
              onChange={setStartAt}
            />
            <DatePickerField
              id="endAt"
              label="Fim *"
              date={endAt}
              onChange={setEndAt}
            />
          </div>
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

export default function PromocoesServicosPage() {
  const { barbershop } = useAuth();
  const { services } = useServices(barbershop?.id);
  const { promotions, isLoading, refresh, create, update, remove } =
    useServicePromotions(barbershop?.id);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ServicePromotion | null>(null);
  const [toRemove, setToRemove] = useState<ServicePromotion | null>(null);

  const serviceNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of services) map.set(s.id, s.name);
    return map;
  }, [services]);

  const serviceOptions: SelectOption<string>[] = useMemo(
    () => services.map((s) => ({ value: s.id, label: s.name })),
    [services],
  );

  const rows = useMemo(
    () =>
      promotions.map((p) => ({
        ...p,
        serviceName: serviceNameMap.get(p.serviceId) ?? p.serviceId,
      })),
    [promotions, serviceNameMap],
  );

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(p: ServicePromotion) {
    setEditing(p);
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
        title="Promoções — Serviços"
        subtitle="Promoções de desconto aplicadas a serviços"
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
          { key: "serviceName", label: "Serviço" },
          {
            key: "discountValue",
            label: "Valor do desconto",
            render: (r) => r.discountValue,
          },
          {
            key: "startAt",
            label: "Início",
            render: (r) => formatDate(r.startAt),
          },
          {
            key: "endAt",
            label: "Fim",
            render: (r) => formatDate(r.endAt),
          },
        ]}
        rows={rows}
        isLoading={isLoading}
        emptyLabel="Nenhuma promoção cadastrada."
        searchPlaceholder="Buscar por serviço..."
        onRefresh={() => void refresh()}
        csvFilename="promocoes-servicos"
        csvColumns={[
          { key: "id", label: "ID" },
          { key: "serviceName", label: "Serviço" },
          { key: "discountValue", label: "Valor do desconto" },
          { key: "startAt", label: "Início" },
          { key: "endAt", label: "Fim" },
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
              title="Remover"
              className="size-7 rounded-md border border-danger/30 bg-transparent text-danger-foreground flex items-center justify-center hover:bg-danger/10 transition-colors"
            >
              <Trash2 className="size-3" />
            </button>
          </>
        )}
      />

      <PromotionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        promotion={editing}
        serviceOptions={serviceOptions}
        onCreate={create}
        onUpdate={update}
      />

      <ConfirmDialog
        open={toRemove !== null}
        onOpenChange={(v) => !v && setToRemove(null)}
        title="Remover promoção?"
        description={
          toRemove
            ? `A promoção do serviço "${serviceNameMap.get(toRemove.serviceId) ?? toRemove.serviceId}" será removida permanentemente.`
            : undefined
        }
        confirmLabel="Remover"
        tone="danger"
        onConfirm={doRemove}
      />
    </div>
  );
}
