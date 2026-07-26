"use client";

import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { RegistrosAtivosTable } from "@/components/shared/RegistrosAtivosTable";
import { ConfirmDialog } from "@/components/shared";
import { useAuth } from "@/hooks/useAuth";
import { useClients } from "@/hooks/useClients";
import { useServices } from "@/hooks/useServices";
import { useProducts } from "@/hooks/useProducts";
import { useClientRepurchases } from "@/hooks/useClientRepurchases";
import { formatDate } from "@/utils/format";
import type { ClientRepurchase } from "@/types/client-repurchase.types";

export default function ClientesRecomprasPage() {
  const { barbershop } = useAuth();
  const { clients } = useClients(barbershop?.id);
  const { services } = useServices(barbershop?.id);
  const { products } = useProducts(barbershop?.id);
  const { repurchases, isLoading, refresh, remove } = useClientRepurchases(
    barbershop?.id,
  );

  const [toRemove, setToRemove] = useState<ClientRepurchase | null>(null);

  const clientNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of clients) map.set(c.id, c.name);
    return map;
  }, [clients]);

  const serviceNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of services) map.set(s.id, s.name);
    return map;
  }, [services]);

  const productNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of products) map.set(p.id, p.name);
    return map;
  }, [products]);

  const rows = useMemo(
    () =>
      repurchases.map((r) => ({
        ...r,
        clientName: clientNameMap.get(r.clientId) ?? r.clientId,
        itemName: r.serviceId
          ? (serviceNameMap.get(r.serviceId) ?? r.serviceId)
          : r.productId
            ? (productNameMap.get(r.productId) ?? r.productId)
            : "—",
      })),
    [repurchases, clientNameMap, serviceNameMap, productNameMap],
  );

  function doRemove() {
    if (!toRemove) return;
    void remove(toRemove.id);
    setToRemove(null);
  }

  return (
    <div className="p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
      <RegistrosAtivosTable
        title="Clientes Recompras"
        subtitle="Recompras sugeridas de serviços e produtos por cliente"
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
          { key: "clientName", label: "Cliente" },
          { key: "itemName", label: "Serviço / Produto" },
          {
            key: "purchasedAt",
            label: "Data da compra",
            render: (r) => formatDate(r.purchasedAt),
          },
          {
            key: "repurchaseAt",
            label: "Data da recompra",
            render: (r) => formatDate(r.repurchaseAt),
          },
        ]}
        rows={rows}
        isLoading={isLoading}
        emptyLabel="Nenhuma recompra registrada."
        searchPlaceholder="Buscar por cliente ou item..."
        onRefresh={() => void refresh()}
        csvFilename="clientes-recompras"
        csvColumns={[
          { key: "id", label: "ID" },
          { key: "clientName", label: "Cliente" },
          { key: "itemName", label: "Serviço / Produto" },
          { key: "purchasedAt", label: "Data da compra" },
          { key: "repurchaseAt", label: "Data da recompra" },
        ]}
        renderActions={(r) => (
          <button
            type="button"
            onClick={() => setToRemove(r)}
            title="Excluir recompra"
            className="size-7 rounded-md border border-danger/30 bg-transparent text-danger-foreground flex items-center justify-center hover:bg-danger/10 transition-colors"
          >
            <Trash2 className="size-3" />
          </button>
        )}
      />

      <ConfirmDialog
        open={toRemove !== null}
        onOpenChange={(v) => !v && setToRemove(null)}
        title="Excluir recompra?"
        description="Este registro de recompra sugerida será removido permanentemente."
        confirmLabel="Excluir"
        tone="danger"
        onConfirm={doRemove}
      />
    </div>
  );
}
