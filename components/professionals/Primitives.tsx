import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const INPUT_CLS =
  "bg-surface-base border-border text-foreground placeholder:text-text-faint focus-visible:ring-brand/30 h-10";

/** Bloco de seção do cadastro (título + descrição opcional + conteúdo). */
export function SectionShell({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-xl border border-border bg-surface-raised p-5",
        className,
      )}
    >
      <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">
        {title}
      </h3>
      {description && (
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
          {description}
        </p>
      )}
      <div className="mt-4">{children}</div>
    </section>
  );
}

/** Rótulo de campo padrão. */
export function FieldLabel({
  children,
  required,
}: {
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
      {children}
      {required && <span className="text-brand">*</span>}
    </label>
  );
}
