"use client";

import type { ReactNode } from "react";
import { GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface SortableRowProps {
  id: string;
  children: ReactNode;
  className?: string;
}

/**
 * Linha de tabela arrastável genérica (dnd-kit). Renderiza uma `TableRow`
 * com a primeira célula contendo o handle de arrastar (`GripVertical`) e o
 * restante das células (`children`) em seguida — mesmo padrão usado em
 * `professionals`, `settings` (Serviços) e `subscriptions` (Planos).
 */
export function SortableRow({ id, children, className }: SortableRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  return (
    <TableRow
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
      className={cn(
        "border-border hover:bg-surface-elevated/50 transition-colors",
        className,
      )}
    >
      <TableCell className="px-3 py-4 w-8">
        <button
          type="button"
          {...listeners}
          {...attributes}
          className="cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-muted-foreground transition-colors touch-none"
          aria-label="Arrastar para reordenar"
        >
          <GripVertical className="size-4" />
        </button>
      </TableCell>
      {children}
    </TableRow>
  );
}
