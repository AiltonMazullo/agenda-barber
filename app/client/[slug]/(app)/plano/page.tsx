"use client";

import { CreditCard } from "lucide-react";

export default function PlanoClientePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Planos</h1>

      <div className="rounded-xl border border-border-subtle bg-surface-raised p-12 text-center space-y-3">
        <CreditCard className="size-8 text-text-faint mx-auto" />
        <p className="text-base font-bold text-foreground">Planos em breve</p>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Em breve você poderá assinar planos e pacotes de serviços desta
          barbearia direto por aqui.
        </p>
      </div>
    </div>
  );
}
