/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { accessGroupsService } from "@/services/access-groups.service";
import type {
  AccessGroup,
  CreateAccessGroupPayload,
  UpdateAccessGroupPayload,
} from "@/types/access-group.types";

export function useAccessGroups(barbershopId: string | undefined) {
  const [groups, setGroups] = useState<AccessGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!barbershopId) {
      setIsLoading(false);
      return;
    }
    let active = true;
    setIsLoading(true);
    accessGroupsService
      .list(barbershopId)
      .then((data) => {
        if (active) setGroups(data);
      })
      .catch((err: unknown) => {
        if (!active) return;
        toast.error(
          err instanceof Error
            ? err.message
            : "Falha ao carregar grupos de acesso.",
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
    async (payload: CreateAccessGroupPayload) => {
      if (!barbershopId) return null;
      try {
        const created = await accessGroupsService.create(barbershopId, payload);
        setGroups((prev) => [...prev, created]);
        toast.success("Grupo de acesso criado.");
        return created;
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Falha ao criar grupo.",
        );
        return null;
      }
    },
    [barbershopId],
  );

  const update = useCallback(
    async (id: string, payload: UpdateAccessGroupPayload) => {
      if (!barbershopId) return null;
      try {
        const updated = await accessGroupsService.update(
          barbershopId,
          id,
          payload,
        );
        setGroups((prev) => prev.map((g) => (g.id === id ? updated : g)));
        toast.success("Grupo de acesso atualizado.");
        return updated;
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Falha ao atualizar grupo.",
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
        await accessGroupsService.remove(barbershopId, id);
        setGroups((prev) => prev.filter((g) => g.id !== id));
        toast.success("Grupo de acesso removido.");
        return true;
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Falha ao remover grupo.",
        );
        return false;
      }
    },
    [barbershopId],
  );

  return { groups, isLoading, create, update, remove };
}
