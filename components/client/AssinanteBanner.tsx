"use client";

import { Crown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface AssinanteBannerProps {
  planName: string;
}

/** Faixa exibida no topo do passo Serviço quando o cliente é assinante ativo. */
export function AssinanteBanner({ planName }: AssinanteBannerProps) {
  return (
    <Card className="border border-brand/40 bg-gradient-to-br from-brand/10 to-brand/[0.03] ring-0">
      <CardContent className="flex items-center gap-4">
        <div className="size-12 rounded-full border-2 border-brand/50 bg-brand/15 grid place-items-center shrink-0">
          <Crown className="size-6 text-brand" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-base font-bold text-foreground">
              Você é assinante do {planName}
            </p>
            <span className="inline-flex items-center rounded-full border border-green-500/40 bg-green-500/10 px-2 py-0.5 text-[11px] font-semibold text-green-500">
              Plano ativo
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Aproveite seus benefícios e agende com mais vantagens!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
