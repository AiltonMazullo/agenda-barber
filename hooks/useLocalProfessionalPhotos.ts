/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { professionalConfigStore } from "@/lib/professional-config-store";

/**
 * Fotos locais (localStorage) por profissional — fallback de exibição
 * enquanto o backend não persiste o `avatarUrl` (foto escolhida no cadastro
 * fica em `professionalConfigStore.photoDataUrl`).
 *
 * Lê em effect (não no render) para evitar mismatch de hidratação.
 */
export function useLocalProfessionalPhotos(
  barbershopId: string | undefined,
  employeeIds: string[],
): Record<string, string | null> {
  const [photos, setPhotos] = useState<Record<string, string | null>>({});
  const key = employeeIds.join(",");

  useEffect(() => {
    if (!barbershopId) return;
    const map: Record<string, string | null> = {};
    for (const id of key ? key.split(",") : []) {
      map[id] = professionalConfigStore.get(barbershopId, id).photoDataUrl;
    }
    setPhotos(map);
  }, [barbershopId, key]);

  return photos;
}
