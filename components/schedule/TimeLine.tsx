import { START_HOUR, type SlotSize } from "@/types/schedule.types";
import { minToTime } from "@/utils/schedule.utils";

interface TimeLineProps {
  slotSize: SlotSize;
  slotHeightPx: number;
  totalSlots: number;
}

export function TimeLine({ slotSize, slotHeightPx, totalSlots }: TimeLineProps) {
  return (
    <div className="flex flex-col w-14 shrink-0">
      <div className="sticky top-0 z-20 bg-surface-base border-b border-border-subtle h-[92px]" />
      <div className="relative" style={{ height: totalSlots * slotHeightPx }}>
        {Array.from({ length: totalSlots }).map((_, i) => {
          const min = START_HOUR * 60 + i * slotSize;
          return (
            <div
              key={i}
              className="absolute right-2 flex items-start"
              style={{ top: i * slotHeightPx - 7 }}
            >
              {min % 60 === 0 && (
                <span className="text-[9px] text-text-subtle font-mono">
                  {minToTime(min)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
