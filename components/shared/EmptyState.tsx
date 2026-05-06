import type { ReactNode } from "react";
import { Inbox } from "lucide-react";

interface EmptyStateProps {
  message: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  message,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={
        className ??
        "flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground"
      }
    >
      <div className="opacity-30">{icon ?? <Inbox className="size-10" />}</div>
      <p className="text-sm">{message}</p>
      {action}
    </div>
  );
}
