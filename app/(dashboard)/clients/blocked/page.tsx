"use client";

import { useState } from "react";
import { ArrowLeft, Ban, Unlock, Search, UserX } from "lucide-react";
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

export default function ClientesBloqueadosPage() {
  const [clientes, setClientes] = useState<Cliente[]>(CLIENTES_MOCK);
  const [search, setSearch] = useState("");

  const bloqueados = clientes.filter((c) => c.status === "bloqueado");
  const filtrados = bloqueados.filter((c) =>
    [c.nome, c.email, c.telefone, c.cpf]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  function handleDesbloquear(id: string) {
    setClientes((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: "ativo",
              motivoBloqueio: undefined,
              bloqueadoEm: undefined,
              atualizadoEm: new Date().toLocaleDateString("pt-BR"),
            }
          : c,
      ),
    );
    toast.success("Cliente desbloqueado.");
  }

  return (
    <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
      <PageHeader
        title="Clientes Bloqueados"
        subtitle={`${bloqueados.length} cliente${bloqueados.length !== 1 ? "s" : ""} bloqueado${bloqueados.length !== 1 ? "s" : ""}`}
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

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Buscar nome, email, telefone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-surface-raised border-border text-foreground placeholder:text-muted-foreground h-9 text-sm focus-visible:ring-brand/40"
        />
      </div>

      <Card className="bg-surface-raised border-border">
        <CardContent className="p-0">
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  {[
                    "Cliente",
                    "Telefone",
                    "Motivo",
                    "Bloqueado em",
                    "Status",
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
                        message={
                          bloqueados.length === 0
                            ? "Nenhum cliente bloqueado."
                            : "Nenhum cliente encontrado com esses critérios."
                        }
                        icon={<UserX className="size-10" />}
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  filtrados.map((c) => (
                    <TableRow
                      key={c.id}
                      className="border-border hover:bg-surface-elevated/50 transition-colors"
                    >
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-full bg-danger/15 border border-danger/30 flex items-center justify-center shrink-0">
                            <Ban className="size-3.5 text-danger-foreground" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground text-sm">
                              {c.nome}
                            </p>
                            <p className="text-[10px] text-text-subtle">
                              {c.email || "—"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-muted-foreground text-sm">
                        {c.telefone}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-muted-foreground text-sm max-w-xs">
                        <span className="line-clamp-2">
                          {c.motivoBloqueio || "—"}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-muted-foreground text-sm">
                        {c.bloqueadoEm ? formatDate(c.bloqueadoEm) : "—"}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <StatusBadge tone="danger">Bloqueado</StatusBadge>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => handleDesbloquear(c.id)}
                          className="h-8 px-3 rounded-md border border-success/30 bg-success/10 text-xs font-semibold text-success-foreground hover:bg-success/20 transition-colors flex items-center gap-1.5"
                        >
                          <Unlock className="size-3.5" />
                          Desbloquear
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
                message={
                  bloqueados.length === 0
                    ? "Nenhum cliente bloqueado."
                    : "Nenhum cliente encontrado."
                }
                icon={<UserX className="size-10" />}
              />
            ) : (
              filtrados.map((c) => (
                <div
                  key={c.id}
                  className="bg-surface-base rounded-lg p-4 border border-border space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-full bg-danger/15 border border-danger/30 flex items-center justify-center shrink-0">
                        <Ban className="size-4 text-danger-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm">
                          {c.nome}
                        </p>
                        <p className="text-[10px] text-text-subtle">
                          {c.telefone}
                        </p>
                      </div>
                    </div>
                    <StatusBadge tone="danger">Bloqueado</StatusBadge>
                  </div>
                  {c.motivoBloqueio && (
                    <p className="text-xs text-muted-foreground italic">
                      `{c.motivoBloqueio}`
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-text-subtle">
                    <span>
                      {c.bloqueadoEm
                        ? `Bloqueado em ${formatDate(c.bloqueadoEm)}`
                        : "—"}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDesbloquear(c.id)}
                      className="h-7 px-2 rounded-md border border-success/30 bg-success/10 text-[10px] font-semibold text-success-foreground hover:bg-success/20 transition-colors flex items-center gap-1"
                    >
                      <Unlock className="size-3" />
                      Desbloquear
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
