"use client";

import Link from "next/link";
import { MapPin, Phone, ChevronRight } from "lucide-react";
import type { Barbershop } from "@/types/barbershop.types";

interface BarbershopCardProps {
  barbershop: Barbershop;
}

export function BarbershopCard({ barbershop }: BarbershopCardProps) {
  const initials = barbershop.name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  return (
    <Link
      href={`/client/${barbershop.slug}`}
      className="group rounded-xl border border-border-subtle bg-surface-raised p-5 hover:border-brand/60 hover:bg-surface-raised/80 transition-all flex flex-col gap-4"
    >
      <div className="flex items-center gap-3">
        <div className="size-12 rounded-lg bg-brand/15 text-brand grid place-items-center text-base font-bold shrink-0">
          {initials || "??"}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-foreground truncate">
            {barbershop.name}
          </h3>
          <p className="text-[11px] font-mono text-muted-foreground truncate">
            /{barbershop.slug}
          </p>
        </div>
        <ChevronRight className="size-4 text-text-faint group-hover:text-brand transition-colors shrink-0" />
      </div>

      <div className="space-y-1.5 text-xs text-muted-foreground">
        {barbershop.address && (
          <div className="flex items-center gap-2">
            <MapPin className="size-3 shrink-0" />
            <span className="truncate">{barbershop.address}</span>
          </div>
        )}
        {barbershop.phone && (
          <div className="flex items-center gap-2">
            <Phone className="size-3 shrink-0" />
            <span>{barbershop.phone}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
