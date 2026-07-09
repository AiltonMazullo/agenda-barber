/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { holidaysService } from "@/services/holidays.service";
import type {
  Holiday,
  CreateHolidayPayload,
  UpdateHolidayPayload,
} from "@/types/holiday.types";

export function useHolidays(barbershopId: string | undefined) {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!barbershopId) {
      setIsLoading(false);
      return;
    }
    let active = true;
    setIsLoading(true);
    holidaysService
      .list(barbershopId)
      .then((data) => {
        if (active) setHolidays(data);
      })
      .catch((err: unknown) => {
        if (!active) return;
        toast.error(
          err instanceof Error ? err.message : "Falha ao carregar feriados.",
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
    async (payload: CreateHolidayPayload) => {
      if (!barbershopId) return null;
      try {
        const created = await holidaysService.create(barbershopId, payload);
        setHolidays((prev) => [...prev, created]);
        toast.success("Feriado criado.");
        return created;
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Falha ao criar feriado.",
        );
        return null;
      }
    },
    [barbershopId],
  );

  const update = useCallback(
    async (id: string, payload: UpdateHolidayPayload) => {
      if (!barbershopId) return null;
      try {
        const updated = await holidaysService.update(barbershopId, id, payload);
        setHolidays((prev) => prev.map((h) => (h.id === id ? updated : h)));
        toast.success("Feriado atualizado.");
        return updated;
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Falha ao atualizar feriado.",
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
        await holidaysService.remove(barbershopId, id);
        setHolidays((prev) => prev.filter((h) => h.id !== id));
        toast.success("Feriado removido.");
        return true;
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Falha ao remover feriado.",
        );
        return false;
      }
    },
    [barbershopId],
  );

  return { holidays, isLoading, create, update, remove };
}
