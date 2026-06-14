"use client";

import Link from "next/link";
import { Crown, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface PlanoCtaCardProps {
  /** Destino do CTA (seção de planos da barbearia). */
  href: string;
}

/**
 * Card promocional para clientes não assinantes — incentiva a assinatura de um
 * plano com benefícios e um CTA destacado.
 */
export function PlanoCtaCard({ href }: PlanoCtaCardProps) {
  return (
    <Card className="border border-brand/40 bg-gradient-to-br from-brand/10 to-brand/[0.03] ring-0 shadow-[0_0_24px_-6px_rgba(245,184,46,0.25)]">
      <CardContent className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="size-11 rounded-xl bg-brand/20 grid place-items-center shrink-0">
            <Crown className="size-6 text-brand" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-brand">
              Economize com nossos planos
            </p>
            <p className="text-base font-bold text-foreground leading-tight">
              Assine um plano e pague menos!
            </p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Descontos exclusivos e reservas prioritárias para assinantes.
        </p>

        <Link
          href={href}
          className="h-10 w-full rounded-md bg-brand text-brand-foreground hover:bg-brand-hover transition-colors flex items-center justify-center gap-1.5 text-sm font-bold"
        >
          Conhecer planos
          <ChevronRight className="size-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
