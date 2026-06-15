/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { servicesService } from "@/services/services.service";
import type {
  CreateServicePayload,
  Service,
  UpdateServicePayload,
} from "@/types/service.types";

export function useServices(barbershopId: string | undefined) {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!barbershopId) {
      setIsLoading(false);
      return;
    }
    let active = true;
    setIsLoading(true);
    servicesService
      .list(barbershopId)
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
  }, [barbershopId]);

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
        setServices((prev) => prev.map((s) => (s.id === id ? updated : s)));
        toast.success("Serviço atualizado.");
        return updated;
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Falha ao atualizar serviço.",
        );
        return null;
      }
    },
    [barbershopId],
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

  return { services, isLoading, create, update, remove, setFeatured, reorder };
}
