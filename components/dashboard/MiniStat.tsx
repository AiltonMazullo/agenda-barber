interface MiniStatProps {
  label: string;
  value: string;
  tone: "success" | "danger" | "warning" | "neutral";
}

const MINI_STAT_BG: Record<MiniStatProps["tone"], string> = {
  success: "bg-success-bg",
  danger: "bg-danger-bg",
  warning: "bg-warning-bg",
  neutral: "bg-surface-elevated",
};

const MINI_STAT_TEXT: Record<MiniStatProps["tone"], string> = {
  success: "text-success-foreground",
  danger: "text-danger-foreground",
  warning: "text-warning-foreground",
  neutral: "text-muted-foreground",
};

export function MiniStat({ label, value, tone }: MiniStatProps) {
  return (
    <div
      className={`${MINI_STAT_BG[tone]} rounded-md p-4 flex flex-col items-center justify-center text-center`}
    >
      <span className={`text-2xl font-bold ${MINI_STAT_TEXT[tone]}`}>
        {value}
      </span>
      <span className="text-[10px] text-muted-foreground font-medium uppercase mt-1">
        {label}
      </span>
    </div>
  );
}
