"use client";

import { Clock, Check } from "lucide-react";
import { FeaturedFlag } from "./FeaturedFlag";
import type { Service } from "@/types/service.types";

interface ServicoSelectCardProps {
  service: Service;
  selected: boolean;
  onSelect: () => void;
}

function formatBRLFromCents(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function ServicoSelectCard({
  service,
  selected,
  onSelect,
}: ServicoSelectCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group relative text-left rounded-lg border p-4 transition-all cursor-pointer ${
        selected
          ? "border-brand bg-brand/5"
          : "border-border-subtle bg-surface-raised hover:border-brand/40"
      }`}
    >
      {service.featured && <FeaturedFlag label="Em alta" />}
      <div className="flex items-start gap-3">
        <div
          className="size-3 rounded-full mt-1.5 shrink-0"
          style={{ backgroundColor: service.hex ?? "#f5b82e" }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base font-bold text-foreground truncate">
              {service.name}
            </h3>
            <span className="text-base font-bold text-brand whitespace-nowrap">
              {formatBRLFromCents(service.priceInCents)}
            </span>
          </div>
          {service.description && (
            <p className="text-xs text-muted-foreground mt-1">
              {service.description}
            </p>
          )}
          <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
            <Clock className="size-3" />
            <span>{service.durationMin} minutos</span>
          </div>
        </div>
        {selected && (
          <Check className="size-4 text-brand shrink-0 mt-1" />
        )}
      </div>
    </button>
  );
}
