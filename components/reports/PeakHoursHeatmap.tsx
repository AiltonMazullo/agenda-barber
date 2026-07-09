"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { DIAS_SEMANA, type HeatmapGrid } from "@/hooks/useHorariosPico";
import { EmptyState, Loading } from "@/components/shared";

/** Faixas de intensidade (percentual da célula mais cheia do grid). */
const INTENSITY_BUCKETS = [
  { max: 20, label: "0% - 20%", className: "bg-[#2a78d6] dark:bg-[#3987e5]" },
  { max: 40, label: "21% - 40%", className: "bg-[#1baf7a] dark:bg-[#199e70]" },
  { max: 60, label: "41% - 60%", className: "bg-[#eda100] dark:bg-[#c98500]" },
  { max: 80, label: "61% - 80%", className: "bg-[#eb6834] dark:bg-[#d95926]" },
  { max: 100, label: "81% - 100%", className: "bg-[#e34948] dark:bg-[#e66767]" },
] as const;

function bucketFor(pct: number) {
  return (
    INTENSITY_BUCKETS.find((b) => pct <= b.max) ??
    INTENSITY_BUCKETS[INTENSITY_BUCKETS.length - 1]
  );
}

function formatHour(hour: number): string {
  return `${String(hour).padStart(2, "0")}h`;
}

interface PeakHoursHeatmapProps {
  grid: HeatmapGrid;
  isLoading: boolean;
}

export function PeakHoursHeatmap({ grid, isLoading }: PeakHoursHeatmapProps) {
  if (isLoading) return <Loading label="Carregando agendamentos" />;

  if (grid.total === 0) {
    return (
      <EmptyState message="Nenhum agendamento nos últimos 30 dias para os filtros selecionados." />
    );
  }

  return (
    <TooltipProvider delay={150}>
      <div className="space-y-4">
        {/* Legenda */}
        <div className="flex justify-end">
          <div className="flex flex-wrap gap-4">
            {INTENSITY_BUCKETS.map((b) => (
              <div key={b.label} className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                  {b.label}
                </span>
                <span className={cn("h-3 w-10 rounded-sm", b.className)} />
              </div>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="overflow-x-auto">
          <div className="min-w-[640px]">
            {/* Cabeçalho: dias da semana */}
            <div
              className="grid gap-1"
              style={{
                gridTemplateColumns: `56px repeat(${DIAS_SEMANA.length}, minmax(0, 1fr))`,
              }}
            >
              <div />
              {DIAS_SEMANA.map((dia) => (
                <div
                  key={dia}
                  className="text-center text-xs font-medium text-muted-foreground py-2"
                >
                  {dia}
                </div>
              ))}
            </div>

            {/* Linhas: uma por hora */}
            <div className="space-y-1">
              {grid.hours.map((hour) => (
                <div
                  key={hour}
                  className="grid gap-1"
                  style={{
                    gridTemplateColumns: `56px repeat(${DIAS_SEMANA.length}, minmax(0, 1fr))`,
                  }}
                >
                  <div className="flex items-center justify-end pr-2 text-xs text-muted-foreground">
                    {formatHour(hour)}
                  </div>
                  {DIAS_SEMANA.map((dia, dayIndex) => {
                    const count = grid.counts.get(`${dayIndex}-${hour}`) ?? 0;
                    const pct =
                      count > 0 && grid.maxCount > 0
                        ? Math.round((count / grid.maxCount) * 100)
                        : 0;
                    const bucket = count > 0 ? bucketFor(pct) : null;

                    return (
                      <Tooltip key={`${dayIndex}-${hour}`}>
                        <TooltipTrigger
                          render={
                            <div
                              className={cn(
                                "h-9 rounded-sm transition-opacity hover:opacity-80",
                                bucket ? bucket.className : "bg-surface-elevated",
                              )}
                            />
                          }
                        />
                        <TooltipContent>
                          {dia} · {formatHour(hour)} —{" "}
                          {count === 0
                            ? "Nenhum agendamento"
                            : `${count} agendamento${count > 1 ? "s" : ""} (${pct}%)`}
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
