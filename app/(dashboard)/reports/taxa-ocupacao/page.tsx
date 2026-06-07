"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader, EmptyState, Loading } from "@/components/shared";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useAppointments } from "@/hooks/useAppointments";

type View = "todas" | "filial" | "profissional";

const VIEWS: { key: View; label: string }[] = [
  { key: "todas", label: "Todas as filiais" },
  { key: "filial", label: "Por filial" },
  { key: "profissional", label: "Por profissional" },
];

export default function TaxaOcupacaoPage() {
  const { barbershop } = useAuth();
  const { appointments, isLoading } = useAppointments(barbershop?.id);
  const [view, setView] = useState<View>("todas");

  /** Agrupamento por profissional (o backend não vincula filial ao agendamento). */
  const porProfissional = useMemo(() => {
    const map = new Map<string, { nome: string; total: number }>();
    for (const a of appointments) {
      const key = a.employee?.id ?? "sem";
      const nome = a.employee?.name ?? "Sem profissional";
      const entry = map.get(key) ?? { nome, total: 0 };
      entry.total += 1;
      map.set(key, entry);
    }
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [appointments]);

  return (
    <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
      <PageHeader
        title="Taxa de Ocupação"
        subtitle="Relatórios → Taxa de ocupação"
        actions={
          <Link
            href="/reports"
            className="h-9 px-4 rounded-md border border-border bg-surface-raised text-sm text-foreground flex items-center gap-2 hover:border-brand/40 transition-colors"
          >
            <ArrowLeft className="size-3.5 text-muted-foreground" />
            Voltar
          </Link>
        }
      />

      {/* Alternância de visão */}
      <div className="flex gap-1 flex-wrap">
        {VIEWS.map((v) => (
          <button
            key={v.key}
            type="button"
            onClick={() => setView(v.key)}
            className={cn(
              "px-4 py-2 text-xs font-semibold rounded-md transition-colors",
              view === v.key
                ? "bg-brand text-brand-foreground"
                : "border border-border bg-surface-raised text-muted-foreground hover:text-foreground hover:border-brand/30",
            )}
          >
            {v.label}
          </button>
        ))}
      </div>

      <div className="px-3 py-2 rounded-md bg-info-bg border border-info/30 text-xs text-info-foreground flex items-start gap-2">
        <AlertCircle className="size-3.5 shrink-0 mt-0.5" />
        <span>
          A taxa de ocupação real depende da carga horária/capacidade por filial
          e profissional, que o backend ainda não expõe. Abaixo mostramos o
          volume de agendamentos como base; quando a capacidade existir, o
          percentual é calculado automaticamente.
        </span>
      </div>

      <Card className="bg-surface-raised border-border">
        <CardContent className="p-4">
          {isLoading ? (
            <Loading />
          ) : view === "filial" ? (
            <EmptyState message="O backend ainda não vincula a filial ao agendamento, então não é possível segmentar a ocupação por filial." />
          ) : view === "todas" ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="rounded-lg bg-surface-base border border-border-subtle p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Agendamentos no total
                </p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {appointments.length}
                </p>
              </div>
              <div className="rounded-lg bg-surface-base border border-border-subtle p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Profissionais ativos
                </p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {porProfissional.filter((p) => p.nome !== "Sem profissional")
                    .length}
                </p>
              </div>
              <div className="rounded-lg bg-surface-base border border-border-subtle p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Taxa de ocupação
                </p>
                <p className="text-2xl font-bold text-brand mt-1">—</p>
              </div>
            </div>
          ) : porProfissional.length === 0 ? (
            <EmptyState message="Sem agendamentos no período." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  {["Profissional", "Agendamentos", "Ocupação"].map((c) => (
                    <TableHead
                      key={c}
                      className="text-muted-foreground text-xs uppercase tracking-wider font-semibold px-4 py-3 h-auto"
                    >
                      {c}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {porProfissional.map((p) => (
                  <TableRow
                    key={p.nome}
                    className="border-border hover:bg-surface-elevated/50"
                  >
                    <TableCell className="px-4 py-3 text-foreground font-semibold">
                      {p.nome}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-info-foreground font-semibold">
                      {p.total}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-muted-foreground">
                      —
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
