"use client";

import { useState, useMemo } from "react";
import {
  ArrowLeft,
  Search,
  Repeat,
  MessageSquare,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader, EmptyState, StatusBadge } from "@/components/shared";
import { CLIENTES_MOCK } from "@/mock/clients";
import { formatDate } from "@/utils/format";
import type { Cliente } from "@/types/client.types";
import type { Tone } from "@/types/common.types";

type Periodo = "hoje" | "semana" | "mes" | "atrasados" | "todos";

interface RecompraInfo {
  cliente: Cliente;
  recompraDate: Date;
  diasRestantes: number;
}

function parseBRDate(s: string): Date {
  const [d, m, y] = s.split("/");
  return new Date(Number(y), Number(m) - 1, Number(d));
}

function diferencaEmDias(target: Date): number {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const t = new Date(target);
  t.setHours(0, 0, 0, 0);
  return Math.round((t.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
}

function periodoTone(dias: number): Tone {
  if (dias < 0) return "danger";
  if (dias <= 3) return "warning";
  if (dias <= 14) return "info";
  return "neutral";
}

function periodoLabel(dias: number): string {
  if (dias < 0) return `${Math.abs(dias)}d atrasado`;
  if (dias === 0) return "Hoje";
  if (dias === 1) return "Amanhã";
  return `Em ${dias}d`;
}

export default function ClientesRecompraPage() {
  const [search, setSearch] = useState("");
  const [periodo, setPeriodo] = useState<Periodo>("todos");

  const recompras = useMemo<RecompraInfo[]>(() => {
    return CLIENTES_MOCK.filter((c) => c.recompraEm && c.status === "ativo")
      .map((c) => {
        const recompraDate = parseBRDate(c.recompraEm!);
        return {
          cliente: c,
          recompraDate,
          diasRestantes: diferencaEmDias(recompraDate),
        };
      })
      .sort((a, b) => a.diasRestantes - b.diasRestantes);
  }, []);

  const filtrados = recompras.filter((r) => {
    const matchSearch = [
      r.cliente.nome,
      r.cliente.email,
      r.cliente.telefone,
      r.cliente.recompraServico ?? "",
    ]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchPeriodo = (() => {
      switch (periodo) {
        case "hoje":
          return r.diasRestantes === 0;
        case "semana":
          return r.diasRestantes >= 0 && r.diasRestantes <= 7;
        case "mes":
          return r.diasRestantes >= 0 && r.diasRestantes <= 30;
        case "atrasados":
          return r.diasRestantes < 0;
        default:
          return true;
      }
    })();

    return matchSearch && matchPeriodo;
  });

  const totalAtrasados = recompras.filter((r) => r.diasRestantes < 0).length;
  const totalSemana = recompras.filter(
    (r) => r.diasRestantes >= 0 && r.diasRestantes <= 7,
  ).length;

  function handleNotificar(nome: string) {
    toast.success(`Lembrete enviado para ${nome}.`);
  }

  return (
    <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
      <PageHeader
        title="Recompra Programada"
        subtitle={`${recompras.length} cliente${recompras.length !== 1 ? "s" : ""} com recompra agendada`}
        actions={
          <Link href="/clients">
            <button
              type="button"
              className="h-9 px-4 rounded-md border border-border bg-surface-raised text-sm text-foreground flex items-center gap-2 hover:border-brand/40 transition-colors"
            >
              <ArrowLeft className="size-3.5 text-muted-foreground" />
              Voltar
            </button>
          </Link>
        }
      />

      {/* Resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-surface-raised border-border shadow-none">
          <CardContent className="p-4">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
              Total
            </p>
            <p className="text-xl font-bold text-foreground">
              {recompras.length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-danger-bg border-border shadow-none">
          <CardContent className="p-4">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
              Atrasados
            </p>
            <p className="text-xl font-bold text-danger-foreground">
              {totalAtrasados}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-warning-bg border-border shadow-none">
          <CardContent className="p-4">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
              Próximos 7 dias
            </p>
            <p className="text-xl font-bold text-warning-foreground">
              {totalSemana}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-success-bg border-border shadow-none">
          <CardContent className="p-4">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
              Hoje
            </p>
            <p className="text-xl font-bold text-success-foreground">
              {recompras.filter((r) => r.diasRestantes === 0).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-surface-raised border-border text-foreground placeholder:text-muted-foreground h-9 text-sm focus-visible:ring-brand/40"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          {(
            [
              { key: "todos", label: "Todos" },
              { key: "hoje", label: "Hoje" },
              { key: "semana", label: "7 dias" },
              { key: "mes", label: "30 dias" },
              { key: "atrasados", label: "Atrasados" },
            ] as { key: Periodo; label: string }[]
          ).map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => setPeriodo(p.key)}
              className={`h-9 px-3 rounded-md text-xs font-semibold transition-colors ${
                periodo === p.key
                  ? "bg-brand text-brand-foreground"
                  : "bg-surface-raised border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      <Card className="bg-surface-raised border-border">
        <CardContent className="p-0">
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  {[
                    "Cliente",
                    "Telefone",
                    "Serviço",
                    "Data programada",
                    "Quando",
                    "Ações",
                  ].map((col) => (
                    <TableHead
                      key={col}
                      className="text-muted-foreground text-xs uppercase tracking-wider font-semibold px-4 py-3 h-auto"
                    >
                      {col}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtrados.length === 0 ? (
                  <TableRow className="border-border hover:bg-transparent">
                    <TableCell colSpan={6} className="py-16">
                      <EmptyState
                        message="Nenhuma recompra encontrada."
                        icon={<Repeat className="size-10" />}
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  filtrados.map((r) => (
                    <TableRow
                      key={r.cliente.id}
                      className="border-border hover:bg-surface-elevated/50 transition-colors"
                    >
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-full bg-brand/15 border border-brand/30 flex items-center justify-center shrink-0">
                            <Repeat className="size-3.5 text-brand" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground text-sm">
                              {r.cliente.nome}
                            </p>
                            <p className="text-[10px] text-text-subtle">
                              {r.cliente.email || "—"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-muted-foreground text-sm">
                        {r.cliente.telefone}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-muted-foreground text-sm">
                        {r.cliente.recompraServico || "—"}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-muted-foreground text-sm">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="size-3 text-text-subtle" />
                          {formatDate(r.recompraDate)}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <StatusBadge tone={periodoTone(r.diasRestantes)}>
                          {periodoLabel(r.diasRestantes)}
                        </StatusBadge>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => handleNotificar(r.cliente.nome)}
                          className="h-8 px-3 rounded-md border border-brand/30 bg-brand/10 text-xs font-semibold text-brand hover:bg-brand/20 transition-colors flex items-center gap-1.5"
                        >
                          <MessageSquare className="size-3.5" />
                          Notificar
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile */}
          <div className="md:hidden px-4 py-4 space-y-3">
            {filtrados.length === 0 ? (
              <EmptyState
                message="Nenhuma recompra encontrada."
                icon={<Repeat className="size-10" />}
              />
            ) : (
              filtrados.map((r) => (
                <div
                  key={r.cliente.id}
                  className="bg-surface-base rounded-lg p-4 border border-border space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-full bg-brand/15 border border-brand/30 flex items-center justify-center shrink-0">
                        <Repeat className="size-4 text-brand" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm">
                          {r.cliente.nome}
                        </p>
                        <p className="text-[10px] text-text-subtle">
                          {r.cliente.telefone}
                        </p>
                      </div>
                    </div>
                    <StatusBadge tone={periodoTone(r.diasRestantes)}>
                      {periodoLabel(r.diasRestantes)}
                    </StatusBadge>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>
                      <span className="text-text-subtle">Serviço: </span>
                      {r.cliente.recompraServico || "—"}
                    </span>
                    <span>
                      <span className="text-text-subtle">Data: </span>
                      {formatDate(r.recompraDate)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleNotificar(r.cliente.nome)}
                    className="w-full h-8 rounded-md border border-brand/30 bg-brand/10 text-xs font-semibold text-brand hover:bg-brand/20 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <MessageSquare className="size-3.5" />
                    Notificar
                  </button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
