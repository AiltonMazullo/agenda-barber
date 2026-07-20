"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

/** Busca dados de um relatório sempre que `fetcher` mudar (deps controlam o refetch). */
export function useReportData<T>(
  fetcher: (() => Promise<T>) | null,
  deps: React.DependencyList,
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!fetcher) {
      setIsLoading(false);
      return;
    }
    let active = true;
    setIsLoading(true);
    fetcher()
      .then((result) => {
        if (active) setData(result);
      })
      .catch((err: unknown) => {
        if (!active) return;
        toast.error(
          err instanceof Error ? err.message : "Falha ao carregar relatório.",
        );
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, isLoading };
}
