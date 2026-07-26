"use client";

import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface InfoTooltipProps {
  text: string;
  className?: string;
}

/**
 * Ícone circular "i" que exibe um texto explicativo em um tooltip ao passar o
 * mouse ou focar via teclado. Usado ao lado de botões/labels que precisam de
 * um contexto adicional (ex.: botão "Novo" em telas de Registros Ativos).
 */
export function InfoTooltip({ text, className }: InfoTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          type="button"
          aria-label={text}
          className={cn(
            "inline-flex size-4 items-center justify-center rounded-full text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 transition-colors",
            className,
          )}
        >
          <Info className="size-4" />
        </TooltipTrigger>
        <TooltipContent>{text}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
