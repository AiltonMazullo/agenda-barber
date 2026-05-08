"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  LayoutList,
  Check,
  CircleSlash,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader, EmptyState, StatusBadge } from "@/components/shared";
import { PlanoDialog } from "@/components/subscriptions";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { formatBRL } from "@/utils/format";
import type { Plano } from "@/types/subscription.types";

const CICLO_LABEL: Record<Plano["ciclo"], string> = {
  mensal: "Mensal",
  trimestral: "Trimestral",
  semestral: "Semestral",
  anual: "Anual",
};

export default function PlanosPage() {
  const { planos, contratos, criarPlano, atualizarPlano, removerPlano } =
    useSubscriptions();
  const [dialog, setDialog] = useState(false);
  const [edicao, setEdicao] = useState<Plano | null>(null);

  function abrirNovo() {
    setEdicao(null);
    setDialog(true);
  }

  function abrirEdicao(p: Plano) {
    setEdicao(p);
    setDialog(true);
  }

  function handleSave(dados: Omit<Plano, "id">, id?: string) {
    if (id) {
      atualizarPlano(id, dados);
      toast.success("Plano atualizado.");
    } else {
      criarPlano(dados);
      toast.success(`Plano "${dados.nome}" criado.`);
    }
  }

  function handleRemover(plano: Plano) {
    const ativos = contratos.filter(
      (c) => c.planoId === plano.id && c.status === "ativo",
    ).length;
    if (ativos > 0) {
      toast.error(
        `Não é possível remover: ${ativos} contrato(s) ativo(s) usam este plano.`,
      );
      return;
    }
    removerPlano(plano.id);
    toast.success("Plano removido.");
  }

  function toggleAtivo(plano: Plano) {
    atualizarPlano(plano.id, { ativo: !plano.ativo });
    toast.success(plano.ativo ? "Plano desativado." : "Plano reativado.");
  }

  return (
    <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
      <PageHeader
        title="Planos de Assinatura"
        subtitle={`${planos.length} plano${planos.length !== 1 ? "s" : ""} cadastrado${planos.length !== 1 ? "s" : ""}`}
        actions={
          <>
            <Link href="/subscriptions">
              <button
                type="button"
                className="h-9 px-4 rounded-md border border-border bg-surface-raised text-sm text-foreground flex items-center gap-2 hover:border-brand/40 transition-colors"
              >
                <ArrowLeft className="size-3.5 text-muted-foreground" />
                Voltar
              </button>
            </Link>
            <button
              type="button"
              onClick={abrirNovo}
              className="h-9 px-4 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover hover:shadow-[0_0_16px_rgba(245,184,46,0.3)] transition-all flex items-center gap-1.5"
            >
              <Plus className="size-3.5" />
              Novo Plano
            </button>
          </>
        }
      />

      {planos.length === 0 ? (
        <EmptyState
          message="Nenhum plano cadastrado."
          icon={<LayoutList className="size-10" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {planos.map((plano) => {
            const contratosAtivos = contratos.filter(
              (c) => c.planoId === plano.id && c.status === "ativo",
            ).length;
            return (
              <Card
                key={plano.id}
                className={`bg-surface-raised border-border shadow-none transition-colors ${
                  plano.ativo ? "" : "opacity-60"
                }`}
              >
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">
                        {plano.nome}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {CICLO_LABEL[plano.ciclo]}
                      </p>
                    </div>
                    <StatusBadge tone={plano.ativo ? "success" : "neutral"}>
                      {plano.ativo ? "Ativo" : "Inativo"}
                    </StatusBadge>
                  </div>

                  <div>
                    <div className="text-2xl font-bold text-brand">
                      {formatBRL(plano.preco)}
                    </div>
                    <p className="text-[11px] text-text-subtle">
                      por {CICLO_LABEL[plano.ciclo].toLowerCase()}
                    </p>
                  </div>

                  {plano.beneficios.length > 0 && (
                    <ul className="space-y-1.5">
                      {plano.beneficios.map((b, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-2 text-xs text-muted-foreground"
                        >
                          <Check className="size-3 text-brand shrink-0" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-text-subtle pt-2 border-t border-border-subtle">
                    <span>
                      {contratosAtivos} contrato{contratosAtivos !== 1 ? "s" : ""}{" "}
                      ativo{contratosAtivos !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => abrirEdicao(plano)}
                      className="flex-1 h-8 rounded-md border border-border bg-surface-base text-xs font-semibold text-foreground hover:border-brand/40 hover:text-brand transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Pencil className="size-3" />
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleAtivo(plano)}
                      className="size-8 rounded-md border border-border bg-surface-base text-muted-foreground flex items-center justify-center hover:border-brand/40 hover:text-brand transition-colors"
                      title={plano.ativo ? "Desativar" : "Reativar"}
                    >
                      <CircleSlash className="size-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemover(plano)}
                      className="size-8 rounded-md border border-border bg-surface-base text-muted-foreground flex items-center justify-center hover:text-danger-foreground hover:border-danger/40 transition-colors"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <PlanoDialog
        open={dialog}
        onOpenChange={setDialog}
        planoEdicao={edicao}
        onSave={handleSave}
      />
    </div>
  );
}
