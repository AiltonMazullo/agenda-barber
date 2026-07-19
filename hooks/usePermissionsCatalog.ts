/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { accessGroupsService } from "@/services/access-groups.service";
import type { PermissionCatalogModule } from "@/types/access-group.types";

export function usePermissionsCatalog(barbershopId: string | undefined) {
  const [catalog, setCatalog] = useState<PermissionCatalogModule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!barbershopId) {
      setIsLoading(false);
      return;
    }
    let active = true;
    setIsLoading(true);
    accessGroupsService
      .listPermissions(barbershopId)
      .then((data) => {
        if (active) setCatalog(data);
      })
      .catch((err: unknown) => {
        if (!active) return;
        toast.error(
          err instanceof Error
            ? err.message
            : "Falha ao carregar catálogo de permissões.",
        );
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [barbershopId]);

  return { catalog, isLoading };
}
