"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Ticket, CheckCircle2, Store, Lock } from "lucide-react";
import { Loading, EmptyState } from "@/components/shared";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { usePublicBarbershop } from "@/contexts/PublicBarbershopContext";
import { useClientAuth } from "@/hooks/useClientAuth";
import { useClientSubscription } from "@/hooks/useClientSubscription";
import { useMyCoupons } from "@/hooks/useMyCoupons";
import { formatDate } from "@/utils/format";

/**
 * Autoatendimento do "Clube do Assinante": o cliente digita o código que
 * recebeu (ex.: da empresa parceira) e resgata sozinho, sem depender do
 * staff marcar como usado pelo dashboard.
 */
export default function CupomClientePage() {
  const { barbershop } = usePublicBarbershop();
  const { isAuthenticated } = useClientAuth();
  const { mySubscription, isLoading: isLoadingSubscription } =
    useClientSubscription(isAuthenticated ? barbershop?.id : undefined);
  const hasActivePlan =
    mySubscription?.subscription.status === "ACTIVE" &&
    !mySubscription.pendingAuthorization;
  const { coupons, isLoading, isRedeeming, redeem } = useMyCoupons(
    hasActivePlan ? barbershop?.id : undefined,
  );
  const [code, setCode] = useState("");

  async function handleRedeem(e: FormEvent) {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) return;
    const redeemed = await redeem(trimmed);
    if (redeemed) setCode("");
  }

  // Cupons são benefício de quem tem plano ativo — sem assinatura, manda
  // pra tela do Plano em vez de mostrar o autoatendimento.
  if (!isAuthenticated || (!isLoadingSubscription && !hasActivePlan)) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <EmptyState
          icon={<Lock className="size-10" />}
          message="Essa área é exclusiva para assinantes do plano ativo."
          action={
            barbershop ? (
              <Link
                href={`/client/${barbershop.slug}/plano`}
                className="inline-flex h-9 px-4 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors items-center"
              >
                Ver planos
              </Link>
            ) : undefined
          }
        />
      </div>
    );
  }

  if (isLoadingSubscription) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Loading />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Cupons</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Resgate o cupom das empresas parceiras do{" "}
          {barbershop?.clubName || "Clube do Assinante"} digitando o código
          recebido.
        </p>
      </div>

      <form onSubmit={(e) => void handleRedeem(e)} className="flex gap-2">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Digite o código do cupom"
          className="flex-1 uppercase"
          disabled={isRedeeming}
        />
        <button
          type="submit"
          disabled={isRedeeming || !code.trim()}
          className="h-10 px-4 rounded-lg text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors disabled:opacity-50 shrink-0"
        >
          {isRedeeming ? "Resgatando…" : "Resgatar"}
        </button>
      </form>

      {isLoading ? (
        <Loading />
      ) : coupons.length === 0 ? (
        <EmptyState
          icon={<Ticket className="size-10" />}
          message="Você ainda não resgatou nenhum cupom."
        />
      ) : (
        <div className="space-y-3">
          {coupons.map((c) => (
            <Card key={c.id} className="bg-surface-raised border-border">
              <CardContent className="p-4 flex items-start gap-3">
                <div className="size-10 rounded-lg bg-brand/10 grid place-items-center shrink-0">
                  <Store className="size-5 text-brand" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-foreground truncate">
                      {c.partnerCompany.name}
                    </p>
                    {c.usedAt && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-green-500/30 bg-green-500/10 px-2 py-0.5 text-[11px] font-bold uppercase text-green-500 shrink-0">
                        <CheckCircle2 className="size-3" />
                        Resgatado
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Código <span className="font-mono font-semibold">{c.code}</span>{" "}
                    · {c.discount}
                  </p>
                  {c.usedAt && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Resgatado em{" "}
                      {formatDate(c.usedAt, {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
