"use client";

import Link from "next/link";
import { CalendarClock, ChevronsRight } from "lucide-react";

interface AgendamentosHelpCardProps {
  /** Destino do botão "Saiba como funciona". */
  href: string;
}

/** Card de ajuda exibido abaixo da lista de agendamentos. */
export function AgendamentosHelpCard({ href }: AgendamentosHelpCardProps) {
  return (
    <div className="rounded-xl border border-border-subtle bg-surface-elevated/40 p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="size-11 rounded-full bg-brand/15 grid place-items-center shrink-0">
          <CalendarClock className="size-5 text-brand" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-foreground">
            Precisa mudar seus planos?
          </p>
          <p className="text-xs text-muted-foreground">
            Remarque seu horário com facilidade ou escolha um novo profissional.
          </p>
        </div>
      </div>

      <Link
        href={href}
        className="h-9 px-4 rounded-md border border-border bg-surface-base hover:border-brand/40 hover:text-brand transition-colors flex items-center justify-center gap-1.5 text-xs font-bold whitespace-nowrap"
      >
        <ChevronsRight className="size-4" />
        Saiba como funciona
      </Link>
    </div>
  );
}
