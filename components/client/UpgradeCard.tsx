"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface UpgradeCardProps {
  /** Destino do CTA de upgrade (seção de planos). */
  href: string;
}

/** Sugestão de upgrade — mais usos e dias incluídos num plano superior. */
export function UpgradeCard({ href }: UpgradeCardProps) {
  return (
    <Card className="bg-surface-raised border border-brand/30 ring-0">
      <CardContent className="flex items-center gap-3">
        <Star className="size-5 text-brand shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-brand">Quer mais liberdade?</p>
          <p className="text-[11px] text-muted-foreground">
            Faça upgrade do seu plano e tenha mais usos e dias incluídos.
          </p>
        </div>
        <Link
          href={href}
          className="h-9 px-3 rounded-md bg-brand text-brand-foreground hover:bg-brand-hover transition-colors flex items-center text-xs font-bold whitespace-nowrap shrink-0"
        >
          Sugerir upgrade
        </Link>
      </CardContent>
    </Card>
  );
}
