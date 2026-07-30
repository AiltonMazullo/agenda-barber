/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { scheduleBlocksService } from "@/services/schedule-blocks.service";
import type {
  CreateScheduleBlockPayload,
  ScheduleBlock,
} from "@/types/schedule-block.types";

/** Bloqueios de horário da barbearia — persistidos no backend (ver ajustes/Módulo Agenda.md). */
export function useScheduleBlocks(barbershopId: string | undefined) {
  const [blocks, setBlocks] = useState<ScheduleBlock[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!barbershopId) {
      setIsLoading(false);
      return;
    }
    let active = true;
    setIsLoading(true);
    scheduleBlocksService
      .list(barbershopId)
      .then((data) => {
        if (active) setBlocks(data);
      })
      .catch((err: unknown) => {
        if (!active) return;
        toast.error(
          err instanceof Error ? err.message : "Falha ao carregar bloqueios.",
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
    async (payload: CreateScheduleBlockPayload) => {
      if (!barbershopId) return null;
      try {
        const created = await scheduleBlocksService.create(
          barbershopId,
          payload,
        );
        setBlocks((prev) => [...prev, created]);
        toast.success("Bloqueio criado.");
        return created;
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Falha ao criar bloqueio.",
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
        await scheduleBlocksService.remove(barbershopId, id);
        setBlocks((prev) => prev.filter((b) => b.id !== id));
        toast.success("Bloqueio removido.");
        return true;
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Falha ao remover bloqueio.",
        );
        return false;
      }
    },
    [barbershopId],
  );

  /** Arrastar/redimensionar um bloqueio na agenda (ver spec-revisao-cliente-1.md §5.5). */
  const update = useCallback(
    async (id: string, payload: { startAt: string; endAt: string }) => {
      if (!barbershopId) return null;
      try {
        const updated = await scheduleBlocksService.update(barbershopId, id, payload);
        setBlocks((prev) => prev.map((b) => (b.id === id ? updated : b)));
        return updated;
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Falha ao mover o bloqueio.",
        );
        return null;
      }
    },
    [barbershopId],
  );

  return { blocks, isLoading, create, remove, update };
}
