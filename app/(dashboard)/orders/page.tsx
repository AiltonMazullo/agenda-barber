/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ClipboardList,
  Pencil,
  Plus,
  Trash2,
  Wallet,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  PageHeader,
  SummaryCard,
  StatusBadge,
  Loading,
} from "@/components/shared";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  getAgendamento,
  mockComandasStore,
  calcularTotal,
} from "@/components/orders/mocks";
import type { Comanda, ComandaStatus } from "@/types/orders.types";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const STATUS_LABEL: Record<ComandaStatus, string> = {
  ABERTA: "Aberta",
  FECHADA: "Fechada",
  CANCELADA: "Cancelada",
};

const STATUS_TONE: Record<ComandaStatus, "brand" | "success" | "danger"> = {
  ABERTA: "brand",
  FECHADA: "success",
  CANCELADA: "danger",
};

const MotionTableRow = motion(TableRow);

const cardEntrance = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};

export default function ComandasPage() {
  const [comandas, setComandas] = useState<Comanda[] | null>(null);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState<string | null>(
    null,
  );

  useEffect(() => {
    setComandas(mockComandasStore.list());
  }, []);

  const stats = useMemo(() => {
    const list = comandas ?? [];
    const abertas = list.filter((c) => c.status === "ABERTA").length;
    const fechadas = list.filter((c) => c.status === "FECHADA").length;
    const canceladas = list.filter((c) => c.status === "CANCELADA").length;
    const faturado = list
      .filter((c) => c.status === "FECHADA")
      .reduce((acc, c) => acc + calcularTotal(c), 0);
    return { abertas, fechadas, canceladas, faturado };
  }, [comandas]);

  function handleDelete(id: string) {
    mockComandasStore.remove(id);
    setComandas(mockComandasStore.list());
    setConfirmandoExclusao(null);
  }

  const summaryCards = [
    {
      label: "Abertas",
      value: comandas ? String(stats.abertas) : "…",
      icon: <ClipboardList className="size-4" />,
    },
    {
      label: "Fechadas",
      value: comandas ? String(stats.fechadas) : "…",
      icon: <CheckCircle2 className="size-4" />,
    },
    {
      label: "Canceladas",
      value: comandas ? String(stats.canceladas) : "…",
      icon: <XCircle className="size-4" />,
    },
    {
      label: "Faturado (fechadas)",
      value: comandas ? currency.format(stats.faturado) : "…",
      icon: <Wallet className="size-4" />,
      emphasized: true,
    },
  ];

  return (
    <div className="space-y-6 p-6 bg-surface-base min-h-screen text-foreground">
      <PageHeader
        title="Comandas"
        subtitle="Gerencie as comandas vinculadas aos agendamentos"
        actions={
          <motion.div whileTap={{ scale: 0.96 }} className="inline-block">
            <Button className="cursor-pointer">
              <Link href="/orders/new" className="flex items-center gap-2">
                <Plus className="size-4" />
                Nova Comanda
              </Link>
            </Button>
          </motion.div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {summaryCards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={cardEntrance.initial}
            animate={cardEntrance.animate}
            transition={{ duration: 0.3, delay: index * 0.05, ease: "easeOut" }}
          >
            <SummaryCard
              label={card.label}
              value={card.value}
              icon={card.icon}
              tone="brand"
              emphasized={card.emphasized}
            />
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={cardEntrance.initial}
        animate={cardEntrance.animate}
        transition={{ duration: 0.3, delay: 0.2, ease: "easeOut" }}
      >
        <Card className="bg-surface-raised border-border">
          <CardContent className="pt-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-widest text-foreground">
                Todas as comandas
              </h2>
            </div>

            {!comandas ? (
              <Loading />
            ) : comandas.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                <ClipboardList className="size-6 mb-2" />
                <p className="text-sm">Nenhuma comanda encontrada.</p>
                <Link
                  href="/orders/new"
                  className="mt-2 cursor-pointer text-xs font-semibold text-brand hover:underline"
                >
                  Criar a primeira comanda
                </Link>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Comanda</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Profissional</TableHead>
                    <TableHead>Itens</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="popLayout" initial={false}>
                    {comandas.map((comanda, index) => {
                      const agendamento = getAgendamento(comanda.agendamentoId);
                      return (
                        <MotionTableRow
                          key={comanda.id}
                          layout
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{
                            opacity: 0,
                            x: -16,
                            transition: { duration: 0.15 },
                          }}
                          transition={{
                            duration: 0.25,
                            delay: index * 0.03,
                            ease: "easeOut",
                          }}
                        >
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            #{comanda.numero}
                          </TableCell>
                          <TableCell className="font-medium text-foreground">
                            {agendamento?.clienteNome ?? "—"}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {agendamento?.profissionalNome ?? "—"}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {comanda.itens.length}
                          </TableCell>
                          <TableCell className="font-semibold text-foreground">
                            {currency.format(calcularTotal(comanda))}
                          </TableCell>
                          <TableCell>
                            <StatusBadge tone={STATUS_TONE[comanda.status]}>
                              {STATUS_LABEL[comanda.status]}
                            </StatusBadge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="cursor-pointer"
                              >
                                <Link
                                  href={`/orders/${comanda.id}`}
                                  aria-label="Editar comanda"
                                >
                                  <Pencil className="size-4" />
                                </Link>
                              </Button>

                              <AnimatePresence mode="wait" initial={false}>
                                {confirmandoExclusao === comanda.id ? (
                                  <motion.div
                                    key="confirm"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.15 }}
                                    className="flex items-center gap-1"
                                  >
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      className="cursor-pointer"
                                      onClick={() => handleDelete(comanda.id)}
                                    >
                                      Confirmar
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="cursor-pointer"
                                      onClick={() =>
                                        setConfirmandoExclusao(null)
                                      }
                                    >
                                      Cancelar
                                    </Button>
                                  </motion.div>
                                ) : (
                                  <motion.div
                                    key="trigger"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.15 }}
                                  >
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="cursor-pointer text-muted-foreground hover:bg-danger/10 hover:text-danger"
                                      onClick={() =>
                                        setConfirmandoExclusao(comanda.id)
                                      }
                                      aria-label="Excluir comanda"
                                    >
                                      <Trash2 className="size-4" />
                                    </Button>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </TableCell>
                        </MotionTableRow>
                      );
                    })}
                  </AnimatePresence>
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
