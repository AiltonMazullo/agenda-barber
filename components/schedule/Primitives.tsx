import type { ReactNode } from "react";

/** Botão "fake" para usar dentro de DropdownMenuTrigger sem aninhar <button>. */
export function DropdownButton({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div role="button" tabIndex={0} className={className}>
      {children}
    </div>
  );
}

/** Linha label/valor usada no dialog de detalhe. */
export function InfoRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="text-text-faint mt-0.5 shrink-0">{icon}</span>
      <div className="flex flex-col min-w-0">
        <span className="text-[9px] font-bold uppercase tracking-widest text-text-faint">
          {label}
        </span>
        <span className="text-sm text-foreground leading-tight">{value}</span>
      </div>
    </div>
  );
}
