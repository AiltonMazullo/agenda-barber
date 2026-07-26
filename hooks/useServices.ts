/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { servicesService } from "@/services/services.service";
import type {
  CreateServicePayload,
  Service,
  ServiceStatus,
  UpdateServicePayload,
} from "@/types/service.types";

/**
 * `status` é opcional: quando omitido, traz serviços de todos os status;
 * passe `"ACTIVE"` para ocultar registros inativos numa listagem.
 */
export function useServices(
  barbershopId: string | undefined,
  status?: ServiceStatus,
) {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!barbershopId) {
      setIsLoading(false);
      return;
    }
    let active = true;
    setIsLoading(true);
    servicesService
      .list(barbershopId, status)
      .then((data) => {
        if (active) setServices(data);
      })
      .catch((err: unknown) => {
        if (!active) return;
        toast.error(
          err instanceof Error ? err.message : "Falha ao carregar serviços.",
        );
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [barbershopId, status, refreshKey]);

  const refetch = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const create = useCallback(
    async (payload: CreateServicePayload) => {
      if (!barbershopId) return null;
      try {
        const created = await servicesService.create(barbershopId, payload);
        setServices((prev) => [...prev, created]);
        toast.success("Serviço criado.");
        return created;
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Falha ao criar serviço.",
        );
        return null;
      }
    },
    [barbershopId],
  );

  const update = useCallback(
    async (id: string, payload: UpdateServicePayload) => {
      if (!barbershopId) return null;
      try {
        const updated = await servicesService.update(barbershopId, id, payload);
        setServices((prev) => {
          // Se a listagem atual está filtrada por status e o registro
          // atualizado deixou de atender o filtro, remove da lista local.
          if (status && updated.status !== status) {
            return prev.filter((s) => s.id !== id);
          }
          return prev.map((s) => (s.id === id ? updated : s));
        });
        toast.success("Serviço atualizado.");
        return updated;
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Falha ao atualizar serviço.",
        );
        return null;
      }
    },
    [barbershopId, status],
  );

  const remove = useCallback(
    async (id: string) => {
      if (!barbershopId) return false;
      try {
        await servicesService.remove(barbershopId, id);
        setServices((prev) => prev.filter((s) => s.id !== id));
        toast.success("Serviço removido.");
        return true;
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Falha ao remover serviço.",
        );
        return false;
      }
    },
    [barbershopId],
  );

  const setFeatured = useCallback(
    async (id: string, featured: boolean) => {
      if (!barbershopId) return null;
      try {
        const updated = await servicesService.setFeatured(
          barbershopId,
          id,
          featured,
        );
        setServices((prev) => prev.map((s) => (s.id === id ? updated : s)));
        return updated;
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Falha ao alterar destaque.",
        );
        return null;
      }
    },
    [barbershopId],
  );

  const reorder = useCallback(
    async (orderedIds: string[]) => {
      if (!barbershopId) return;
      setServices((prev) => {
        const map = new Map(prev.map((s) => [s.id, s]));
        return orderedIds.map((id) => map.get(id)!).filter(Boolean);
      });
      try {
        await servicesService.reorder(barbershopId, orderedIds);
        toast.success("Ordem dos serviços atualizada.");
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Falha ao reordenar serviços.",
        );
      }
    },
    [barbershopId],
  );

  return {
    services,
    isLoading,
    create,
    update,
    remove,
    setFeatured,
    reorder,
    refetch,
  };
}
