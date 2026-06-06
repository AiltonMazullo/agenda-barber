"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MessageCircle,
  Pencil,
  Phone,
  Mail,
  UserX,
  Calendar,
  Receipt,
  DollarSign,
  CreditCard,
  BadgeCheck,
  Inbox,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ConfirmDialog, Loading } from "@/components/shared";
import { DialogEditarCliente } from "@/components/clients/DialogEditarCliente";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useClients } from "@/hooks/useClients";
import { useAppointments } from "@/hooks/useAppointments";
import { useDeactivatedClients } from "@/hooks/useDeactivatedClients";
import { formatDate, formatTime } from "@/utils/format";
import type { UpdateClientPayload } from "@/types/client.types";
import type { AppointmentStatus } from "@/types/appointment.types";

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmado",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
};
const STATUS_TONE: Record<AppointmentStatus, string> = {
  PENDING: "bg-warning/15 text-warning-foreground",
  CONFIRMED: "bg-brand/15 text-brand",
  COMPLETED: "bg-success/15 text-success-foreground",
  CANCELLED: "bg-danger/15 text-danger-foreground",
};

function initials(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0])
      .join("")
      .toUpperCase() || "?"
  );
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ClienteDetalhePage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { barbershop } = useAuth();
  const { clients, isLoading, update } = useClients(barbershop?.id);
  const { appointments } = useAppointments(barbershop?.id);
  const { deactivate, isDeactivated } = useDeactivatedClients(barbershop?.id);

  const [editOpen, setEditOpen] = useState(false);
  const [confirmDesativar, setConfirmDesativar] = useState(false);

  const client = useMemo(
    () => clients.find((c) => c.id === id) ?? null,
    [clients, id],
  );

  const clientAppts = useMemo(
    () =>
      appointments
        .filter((a) => a.clientId === id)
        .sort(
          (a, b) =>
            new Date(b.scheduledAt).getTime() -
            new Date(a.scheduledAt).getTime(),
        ),
    [appointments, id],
  );

  async function handleSaveEdit(cid: string, payload: UpdateClientPayload) {
    await update(cid, payload);
  }

  function doDesativar() {
    if (!client) return;
    deactivate(client.id);
    toast.success("Cliente desativado.");
    router.push("/clients");
  }

  if (isLoading) {
    return (
      <div className="p-6 bg-surface-base min-h-screen text-foreground">
        <Loading label="Carregando cliente" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-6 bg-surface-base min-h-screen text-foreground space-y-4">
        <p className="text-sm text-muted-foreground">Cliente não encontrado.</p>
        <Link
          href="/clients"
          className="inline-flex h-9 px-4 rounded-md border border-border bg-surface-raised text-sm items-center gap-1.5 hover:bg-surface-elevated transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Voltar
        </Link>
      </div>
    );
  }

  const ativo = !isDeactivated(client.id);
  const phoneDigits = client.phone?.replace(/\D/g, "") ?? "";

  return (
    <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{client.name}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Desde {formatDate(client.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/clients"
            className="h-9 px-4 rounded-md border border-border bg-surface-raised text-sm text-foreground hover:bg-surface-elevated transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="size-3.5" />
            Voltar
          </Link>
          {phoneDigits && (
            <a
              href={`https://wa.me/55${phoneDigits}`}
              target="_blank"
              rel="noopener noreferrer"
              className="h-9 px-4 rounded-md border border-success-foreground/40 bg-transparent text-sm text-success-foreground hover:bg-success/10 transition-colors flex items-center gap-1.5"
            >
              <MessageCircle className="size-3.5" />
              WhatsApp
            </a>
          )}
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="h-9 px-4 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors flex items-center gap-1.5"
          >
            <Pencil className="size-3.5" />
            Editar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5 items-start">
        {/* ── Ficha (esquerda) ── */}
        <div className="rounded-xl border border-border bg-surface-raised p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="size-14 rounded-full bg-brand/15 text-brand grid place-items-center text-lg font-bold shrink-0">
              {initials(client.name)}
            </div>
            <div className="min-w-0">
              <p className="text-base font-bold text-foreground truncate">
                {client.name}
              </p>
              <span
                className={`inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  ativo
                    ? "bg-success/15 text-success-foreground"
                    : "bg-surface-elevated text-muted-foreground"
                }`}
              >
                {ativo ? "Ativo" : "Inativo"}
              </span>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-foreground">
              <Phone className="size-3.5 text-muted-foreground shrink-0" />
              <span className="truncate">{client.phone || "—"}</span>
            </div>
            <div className="flex items-center gap-2 text-foreground">
              <Mail className="size-3.5 text-muted-foreground shrink-0" />
              <span className="truncate">{client.email}</span>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-sm border-b border-border-subtle pb-2">
              <span className="text-muted-foreground">Origem</span>
              <span className="text-foreground">{client.howMet || "—"}</span>
            </div>
            <div className="flex items-center justify-between text-sm border-b border-border-subtle pb-2">
              <span className="text-muted-foreground">Prof. Preferido</span>
              <span className="text-foreground">—</span>
            </div>
          </div>

          {ativo && (
            <button
              type="button"
              onClick={() => setConfirmDesativar(true)}
              className="w-full h-10 rounded-md border border-danger/30 bg-transparent text-sm font-semibold text-danger-foreground hover:bg-danger/10 transition-colors flex items-center justify-center gap-2"
            >
              <UserX className="size-4" />
              Desativar cliente
            </button>
          )}
        </div>

        {/* ── Abas (direita) ── */}
        <Tabs defaultValue="agendamentos">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="agendamentos">
              <Calendar className="size-3.5" />
              Agendamentos
            </TabsTrigger>
            <TabsTrigger value="comandas">
              <Receipt className="size-3.5" />
              Comandas
            </TabsTrigger>
            <TabsTrigger value="financeiro">
              <DollarSign className="size-3.5" />
              Financeiro
            </TabsTrigger>
            <TabsTrigger value="assinatura">
              <BadgeCheck className="size-3.5" />
              Assinatura
            </TabsTrigger>
            <TabsTrigger value="cartoes">
              <CreditCard className="size-3.5" />
              Cartões
            </TabsTrigger>
          </TabsList>

          <TabsContent value="agendamentos" className="pt-3">
            {clientAppts.length === 0 ? (
              <EmptyTab message="Nenhum agendamento para este cliente." />
            ) : (
              <div className="space-y-2">
                {clientAppts.map((a) => {
                  const start = new Date(a.scheduledAt);
                  const end = new Date(
                    start.getTime() + (a.service?.durationMin ?? 0) * 60000,
                  );
                  const prof =
                    a.employee?.appName ?? a.employee?.name ?? null;
                  return (
                    <div
                      key={a.id}
                      className="flex items-center gap-3 rounded-lg border border-border-subtle bg-surface-raised p-3"
                    >
                      <Calendar className="size-4 text-brand shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {a.service?.name ?? "Serviço"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(a.scheduledAt)} {formatTime(start)} –{" "}
                          {formatTime(end)}
                          {prof ? ` • ${prof}` : ""}
                        </p>
                      </div>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${STATUS_TONE[a.status]}`}
                      >
                        {STATUS_LABEL[a.status]}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="comandas" className="pt-3">
            <EmptyTab message="Nenhuma comanda vinculada a este cliente." />
          </TabsContent>
          <TabsContent value="financeiro" className="pt-3">
            <EmptyTab message="Nenhum lançamento financeiro para este cliente." />
          </TabsContent>
          <TabsContent value="assinatura" className="pt-3">
            <EmptyTab message="Este cliente não possui assinatura ativa." />
          </TabsContent>
          <TabsContent value="cartoes" className="pt-3">
            <EmptyTab message="Nenhum cartão cadastrado para este cliente." />
          </TabsContent>
        </Tabs>
      </div>

      <DialogEditarCliente
        open={editOpen}
        onOpenChange={setEditOpen}
        client={client}
        onSave={handleSaveEdit}
      />

      <ConfirmDialog
        open={confirmDesativar}
        onOpenChange={setConfirmDesativar}
        title="Desativar cliente?"
        description={`"${client.name}" vai para a lista de Clientes Desativados. Ele não será excluído e pode ser reativado depois.`}
        confirmLabel="Desativar"
        tone="danger"
        onConfirm={doDesativar}
      />
    </div>
  );
}

function EmptyTab({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-border-subtle bg-surface-raised p-10 text-center space-y-2">
      <Inbox className="size-8 text-text-faint mx-auto" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
