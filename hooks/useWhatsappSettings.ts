"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { whatsappSettingsService } from "@/services/whatsapp-settings.service";
import type {
  UpdateWhatsappSettingsPayload,
  WhatsappSettings,
} from "@/types/whatsapp-settings.types";

export function useWhatsappSettings(barbershopId: string | undefined) {
  const [data, setData] = useState<WhatsappSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!barbershopId) {
      setIsLoading(false);
      return;
    }
    let active = true;
    setIsLoading(true);
    whatsappSettingsService
      .get(barbershopId)
      .then((d) => {
        if (active) setData(d);
      })
      .catch((err) => {
        if (active)
          toast.error(
            err instanceof Error
              ? err.message
              : "Falha ao carregar configurações de WhatsApp.",
          );
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [barbershopId]);

  const save = useCallback(
    async (
      payload: UpdateWhatsappSettingsPayload,
    ): Promise<WhatsappSettings | null> => {
      if (!barbershopId) return null;
      setIsSaving(true);
      try {
        const saved = await whatsappSettingsService.update(
          barbershopId,
          payload,
        );
        setData(saved);
        toast.success("Templates salvos.");
        return saved;
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Falha ao salvar templates.",
        );
        return null;
      } finally {
        setIsSaving(false);
      }
    },
    [barbershopId],
  );

  return { data, isLoading, isSaving, save };
}
