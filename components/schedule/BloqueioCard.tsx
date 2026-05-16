import { Ban, X } from "lucide-react";
import {
  START_HOUR,
  type BloqueioHorario,
  type SlotSize,
} from "@/types/schedule.types";

interface BloqueioCardProps {
  bloqueio: BloqueioHorario;
  slotSize: SlotSize;
  slotHeightPx: number;
  onDelete: (id: string) => void;
}

export function BloqueioCard({
  bloqueio,
  slotSize,
  slotHeightPx,
  onDelete,
}: BloqueioCardProps) {
  const heightPx = (bloqueio.duracaoMin / slotSize) * slotHeightPx;
  const topPx =
    ((bloqueio.inicioMin - START_HOUR * 60) / slotSize) * slotHeightPx;

  return (
    <div
      style={{
        position: "absolute",
        top: topPx,
        left: 0,
        right: 0,
        height: heightPx - 2,
        zIndex: 5,
      }}
      className="opacity-80"
    >
      <div
        className="absolute left-0.5 right-0.5 rounded-md border border-red-500/40 bg-red-500/10 flex flex-col overflow-hidden group"
        style={{ height: "100%" }}
      >
        <div className="h-0.5 w-full bg-red-500/60" />
        <div className="flex-1 flex items-center justify-between px-2 py-1 overflow-hidden">
          <div className="flex items-center gap-1 truncate">
            <Ban className="size-2.5 text-red-400 shrink-0" />
            {heightPx >= 36 && (
              <span className="text-[9px] font-bold text-red-400/80 uppercase tracking-wide truncate">
                {bloqueio.motivo || "Bloqueado"}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(bloqueio.id);
            }}
            className="size-4 rounded flex items-center justify-center text-red-400/60 hover:text-red-400 hover:bg-red-500/20 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
          >
            <X className="size-2.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
