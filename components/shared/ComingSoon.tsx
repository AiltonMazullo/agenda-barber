import type { ReactNode } from "react";
import { Hammer, Check } from "lucide-react";

interface ComingSoonProps {
  title: string;
  description?: string;
  features?: string[];
  icon?: ReactNode;
}

export function ComingSoon({
  title,
  description,
  features,
  icon,
}: ComingSoonProps) {
  return (
    <div className="flex items-center justify-center min-h-100 py-12">
      <div className="max-w-xl w-full bg-surface-raised border border-border-subtle rounded-2xl p-8 md:p-10 text-center space-y-5">
        <div className="size-14 mx-auto rounded-2xl bg-brand/15 border border-brand/30 flex items-center justify-center text-brand">
          {icon ?? <Hammer className="size-6" />}
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-foreground">{title}</h2>
          {description && (
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
              {description}
            </p>
          )}
        </div>
        {features && features.length > 0 && (
          <ul className="text-left max-w-sm mx-auto space-y-2 pt-2">
            {features.map((f) => (
              <li
                key={f}
                className="flex items-start gap-2 text-sm text-foreground"
              >
                <Check className="size-3.5 text-brand shrink-0 mt-1" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        )}
        <p className="text-[10px] uppercase tracking-widest text-text-faint pt-2">
          Em breve
        </p>
      </div>
    </div>
  );
}
