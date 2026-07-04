import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface FormSectionProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  /** Conteúdo extra alinhado à direita do header (ex.: contador). */
  aside?: ReactNode;
  children: ReactNode;
}

/** Card de seção do formulário de comanda: header com ícone + conteúdo. */
export function FormSection({
  icon,
  title,
  subtitle,
  aside,
  children,
}: FormSectionProps) {
  return (
    <Card className="bg-surface-raised border-border py-0 gap-0">
      <div className="flex items-center justify-between gap-3 px-4 md:px-5 py-4 border-b border-border-subtle">
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-brand/10 text-brand [&_svg]:size-4">
            {icon}
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-foreground leading-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-muted-foreground truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {aside}
      </div>
      <CardContent className="px-4 md:px-5 py-4">{children}</CardContent>
    </Card>
  );
}
