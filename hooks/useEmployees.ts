/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { employeesService } from "@/services/employees.service";
import type {
  CreateEmployeePayload,
  Employee,
  UpdateEmployeePayload,
} from "@/types/employee.types";

export function useEmployees(barbershopId: string | undefined) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!barbershopId) {
      setIsLoading(false);
      return;
    }
    let active = true;
    setIsLoading(true);
    employeesService
      .list(barbershopId)
      .then((data) => {
        if (active) setEmployees(data);
      })
      .catch((err: unknown) => {
        if (!active) return;
        toast.error(
          err instanceof Error
            ? err.message
            : "Falha ao carregar profissionais.",
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
    async (payload: CreateEmployeePayload) => {
      if (!barbershopId) return null;
      try {
        const created = await employeesService.create(barbershopId, payload);
        setEmployees((prev) => [...prev, created]);
        toast.success("Profissional criado.");
        return created;
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Falha ao criar profissional.",
        );
        return null;
      }
    },
    [barbershopId],
  );

  const update = useCallback(
    async (id: string, payload: UpdateEmployeePayload) => {
      if (!barbershopId) return null;
      try {
        const updated = await employeesService.update(
          barbershopId,
          id,
          payload,
        );
        setEmployees((prev) => prev.map((e) => (e.id === id ? updated : e)));
        toast.success("Profissional atualizado.");
        return updated;
      } catch (err) {
        toast.error(
          err instanceof Error
            ? err.message
            : "Falha ao atualizar profissional.",
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
        await employeesService.remove(barbershopId, id);
        setEmployees((prev) => prev.filter((e) => e.id !== id));
        toast.success("Profissional removido.");
        return true;
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Falha ao remover profissional.",
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
        const updated = await employeesService.setFeatured(
          barbershopId,
          id,
          featured,
        );
        setEmployees((prev) =>
          prev.map((e) => (e.id === id ? updated : e)),
        );
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

  return { employees, isLoading, create, update, remove, setFeatured };
}
