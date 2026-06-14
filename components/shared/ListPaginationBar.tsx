"use client";

import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { PAGE_SIZE_OPTIONS } from "@/hooks/usePagination";
import { cn } from "@/lib/utils";

interface ListPaginationBarProps {
  page: number;
  pageSize: number;
  totalPages: number;
  total: number;
  from: number;
  to: number;
  /** Substantivo plural exibido no contador (ex.: "agendamentos"). */
  itemLabel?: string;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  className?: string;
}

/** Janela de páginas a exibir, com elipses quando há muitas. */
function pageWindow(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out: (number | "ellipsis")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) out.push("ellipsis");
  for (let p = start; p <= end; p++) out.push(p);
  if (end < total - 1) out.push("ellipsis");
  out.push(total);
  return out;
}

/**
 * Rodapé de paginação para listas (cards): "Itens por página" + contador
 * "x–y de N" + navegação. Reaproveita o `Pagination` (shadcn) e o seletor de
 * tamanho. Página ativa destacada na cor da marca.
 */
export function ListPaginationBar({
  page,
  pageSize,
  totalPages,
  total,
  from,
  to,
  itemLabel = "itens",
  onPageChange,
  onPageSizeChange,
  className,
}: ListPaginationBarProps) {
  const pages = pageWindow(page, totalPages);

  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="whitespace-nowrap">Itens por página:</span>
        <DropdownMenu>
          <DropdownMenuTrigger className="h-8 px-2.5 rounded-md border border-border bg-surface-base text-xs font-medium text-foreground flex items-center gap-1.5 hover:border-brand/40 transition-colors outline-none cursor-pointer">
            {pageSize}
            <ChevronDown className="size-3 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-surface-raised border-border text-foreground min-w-[5rem]">
            {PAGE_SIZE_OPTIONS.map((size) => (
              <DropdownMenuItem
                key={size}
                onClick={() => onPageSizeChange(size)}
                className="text-xs cursor-pointer hover:bg-surface-elevated"
              >
                {size}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <p className="text-xs text-muted-foreground whitespace-nowrap text-center">
        {from}–{to} de {total} {itemLabel}
      </p>

      <Pagination className="mx-0 w-auto justify-end">
        <PaginationContent className="gap-1">
          <PaginationItem>
            <PaginationPrevious
              text=""
              aria-label="Página anterior"
              aria-disabled={page <= 1}
              className={cn(
                "size-9 p-0 justify-center rounded-full border border-border cursor-pointer",
                page <= 1 && "pointer-events-none opacity-50",
              )}
              onClick={(e) => {
                e.preventDefault();
                if (page > 1) onPageChange(page - 1);
              }}
            />
          </PaginationItem>

          {pages.map((p, i) =>
            p === "ellipsis" ? (
              <PaginationItem key={`ellipsis-${i}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={p}>
                <PaginationLink
                  isActive={p === page}
                  className={cn(
                    "size-9 rounded-full cursor-pointer",
                    p === page &&
                      "bg-brand text-brand-foreground border-brand hover:bg-brand-hover hover:text-brand-foreground",
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange(p);
                  }}
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            ),
          )}

          <PaginationItem>
            <PaginationNext
              text=""
              aria-label="Próxima página"
              aria-disabled={page >= totalPages}
              className={cn(
                "size-9 p-0 justify-center rounded-full border border-border cursor-pointer",
                page >= totalPages && "pointer-events-none opacity-50",
              )}
              onClick={(e) => {
                e.preventDefault();
                if (page < totalPages) onPageChange(page + 1);
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
