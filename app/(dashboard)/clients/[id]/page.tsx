/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { use, useEffect, useMemo, useState } from "react";
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
  BadgeCheck,
  Inbox,
  StickyNote,
  Ban,
  QrCode,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmDialog, DataTablePagination, Loading, SelectField } from "@/components/shared";
import { DialogEditarCliente } from "@/components/clients/DialogEditarCliente";
import { PixQrCodePanel } from "@/components/subscription/PixQrCodePanel";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useClients } from "@/hooks/useClients";
import { useClientAppointmentsPaginated } from "@/hooks/useClientAppointmentsPaginated";
import { useDeactivatedClients } from "@/hooks/useDeactivatedClients";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { formatBRL, formatDate, formatTime, toWallClockDate } from "@/utils/format";
import { comandasService } from "@/services/comandas.service";
import { subscriptionsService } from "@/services/subscriptions.service";
import { CANCEL_REASON_OPTIONS, type CancelReasonCode } from "@/types/pre-cancelled-client.types";
import type { UpdateClientPayload } from "@/types/client.types";
import type { AppointmentStatus } from "@/types/appointment.types";
import type { Comanda } from "@/types/orders.types";
import type { SubscriptionCharge } from "@/types/subscription.types";

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmado",
  ARRIVED: "Chegou",
  IN_PROGRESS: "Em andamento",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
  NO_SHOW: "Faltou",
};
const STATUS_TONE: Record<AppointmentStatus, string> = {
  PENDING: "bg-warning/15 text-warning-foreground",
  CONFIRMED: "bg-brand/15 text-brand",
  ARRIVED: "bg-orange-500/15 text-orange-400",
  IN_PROGRESS: "bg-yellow-500/15 text-yellow-400",
  COMPLETED: "bg-success/15 text-success-foreground",
  CANCELLED: "bg-danger/15 text-danger-foreground",
  NO_SHOW: "bg-danger/15 text-danger-foreground",
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
  const { clients, isLoading, update, updateNotes, uploadPhoto } = useClients(barbershop?.id);
  const {
    appointments: clientAppts,
    isLoading: apptsLoading,
    page: apptsPage,
    pageSize: apptsPageSize,
    total: apptsTotal,
    totalPages: apptsTotalPages,
    from: apptsFrom,
    to: apptsTo,
    setPage: setApptsPage,
    changePageSize: changeApptsPageSize,
  } = useClientAppointmentsPaginated(barbershop?.id, id);
  const { deactivate, isDeactivated } = useDeactivatedClients(barbershop?.id);
  const { subscriptions, cancel: cancelSubscription } = useSubscriptions(
    barbershop?.id,
  );

  const [activeTab, setActiveTab] = useState("agendamentos");
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDesativar, setConfirmDesativar] = useState(false);
  const [notesDraft, setNotesDraft] = useState<string | null>(null);
  const [savingNotes, setSavingNotes] = useState(false);

  const [comandas, setComandas] = useState<Comanda[]>([]);
  const [comandasLoading, setComandasLoading] = useState(true);
  const [charges, setCharges] = useState<SubscriptionCharge[]>([]);
  const [chargesLoading, setChargesLoading] = useState(true);
  const [pixChargeToShow, setPixChargeToShow] = useState<SubscriptionCharge | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState<CancelReasonCode | "">("");
  const [cancelling, setCancelling] = useState(false);

  const client = useMemo(
    () => clients.find((c) => c.id === id) ?? null,
    [clients, id],
  );

  // Inadimplência (spec-ajustes-escopo-3 §6) — mesmo critério do relatório
  // "Contratos ativos" (getContracts/computeOverdueInfo no backend),
  // aplicado aqui client-side sobre as cobranças já carregadas na aba
  // Financeiro. A mais antiga em aberto é a que teria disparado o
  // cancelamento automático (job de 8 dias) e é a exibida no CTA do banner.
  const oldestOverdueCharge = useMemo(() => {
    const now = new Date();
    const overdue = charges.filter(
      (c) =>
        c.status === "OVERDUE" || (c.status === "PENDING" && new Date(c.dueDate) < now),
    );
    if (overdue.length === 0) return null;
    return overdue.reduce((a, b) => (new Date(a.dueDate) < new Date(b.dueDate) ? a : b));
  }, [charges]);

  const activeSubscription = useMemo(
    () =>
      subscriptions.find((s) => s.clientId === id && s.status === "ACTIVE") ??
      null,
    [subscriptions, id],
  );

  useEffect(() => {
    if (!barbershop?.id) return;
    let active = true;
    setComandasLoading(true);
    comandasService
      .list(barbershop.id, { clientId: id })
      .then(({ data }) => {
        if (active) setComandas(data);
      })
      .catch(() => {
        if (active) toast.error("Falha ao carregar comandas do cliente.");
      })
      .finally(() => {
        if (active) setComandasLoading(false);
      });
    return () => {
      active = false;
    };
  }, [barbershop?.id, id]);

  useEffect(() => {
    if (!barbershop?.id) return;
    let active = true;
    setChargesLoading(true);
    subscriptionsService
      .getClientCharges(barbershop.id, id)
      .then((data) => {
        if (active) setCharges(data);
      })
      .catch(() => {
        if (active) toast.error("Falha ao carregar cobranças do cliente.");
      })
      .finally(() => {
        if (active) setChargesLoading(false);
      });
    return () => {
      active = false;
    };
  }, [barbershop?.id, id]);

  async function handleSaveEdit(cid: string, payload: UpdateClientPayload) {
    await update(cid, payload);
  }

  async function handleSaveNotes() {
    if (!client) return;
    setSavingNotes(true);
    const trimmed = (notesDraft ?? "").trim();
    const updated = await updateNotes(client.id, trimmed || null);
    setSavingNotes(false);
    if (updated) toast.success("Observação salva.");
  }

  function doDesativar() {
    if (!client) return;
    deactivate(client.id);
    toast.success("Cliente desativado.");
    router.push("/clients");
  }

  async function handleCancelSubscription() {
    if (!activeSubscription || !cancelReason) return;
    setCancelling(true);
    const ok = await cancelSubscription(activeSubscription.id, cancelReason);
    setCancelling(false);
    if (ok) {
      setCancelDialogOpen(false);
      setCancelReason("");
    }
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

      {/* Banner de inadimplência — spec-ajustes-escopo-3 §6: antes não havia
          nenhum alerta no topo do painel, só o badge OVERDUE/FAILED perdido
          na lista da aba Financeiro. Agendar continua permitido mesmo
          inadimplente (nenhum bloqueio adicionado aqui). */}
      {oldestOverdueCharge && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-danger-foreground/30 bg-danger/10 px-4 py-3">
          <div className="flex items-center gap-2">
            <Ban className="size-4 text-danger-foreground shrink-0" />
            <p className="text-sm text-danger-foreground">
              Cliente com cobrança em atraso desde{" "}
              <span className="font-semibold">{formatDate(oldestOverdueCharge.dueDate)}</span>.
            </p>
          </div>
          {oldestOverdueCharge.pixPayload && (
            <button
              type="button"
              onClick={() => {
                setActiveTab("financeiro");
                setPixChargeToShow(oldestOverdueCharge);
              }}
              className="h-8 px-3 rounded-md text-xs font-semibold border border-danger-foreground/40 text-danger-foreground hover:bg-danger/20 transition-colors flex items-center gap-1.5 shrink-0"
            >
              <QrCode className="size-3.5" />
              Ver Pix
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5 items-start">
        {/* ── Ficha (esquerda) ── */}
        <div className="rounded-xl border border-border bg-surface-raised p-5 space-y-4">
          <div className="flex items-center gap-3">
            <Avatar size="lg" className="shrink-0">
              <AvatarImage src={client.photoUrl ?? undefined} alt={client.name} />
              <AvatarFallback className="bg-brand/15 text-brand text-lg font-bold">
                {initials(client.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-base font-bold text-foreground truncate">
                {client.name}
              </p>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <span
                  className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    ativo
                      ? "bg-success/15 text-success-foreground"
                      : "bg-surface-elevated text-muted-foreground"
                  }`}
                >
                  {ativo ? "Ativo" : "Inativo"}
                </span>
                {client.isBlocked && (
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-danger/15 text-danger-foreground">
                    Bloqueado
                  </span>
                )}
              </div>
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

          <div className="space-y-1.5 pt-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <StickyNote className="size-3.5" />
              Observações internas
            </div>
            <textarea
              value={notesDraft ?? client.notes ?? ""}
              onChange={(e) => setNotesDraft(e.target.value)}
              placeholder="Anotações visíveis só para a equipe..."
              rows={3}
              className="w-full rounded-md border border-border bg-surface-base text-sm text-foreground placeholder:text-text-faint p-2 outline-none focus:border-brand transition-colors resize-none"
            />
            {notesDraft !== null && notesDraft !== (client.notes ?? "") && (
              <button
                type="button"
                onClick={() => void handleSaveNotes()}
                disabled={savingNotes}
                className="h-8 px-3 rounded-md bg-brand text-brand-foreground text-xs font-bold hover:bg-brand-hover transition-colors disabled:opacity-50"
              >
                {savingNotes ? "Salvando..." : "Salvar observação"}
              </button>
            )}
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
        <Tabs value={activeTab} onValueChange={setActiveTab}>
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
          </TabsList>

          <TabsContent value="agendamentos" className="pt-3">
            {apptsLoading ? (
              <Loading label="Carregando agendamentos" />
            ) : clientAppts.length === 0 ? (
              <EmptyTab message="Nenhum agendamento para este cliente." />
            ) : (
              <>
                <div className="space-y-2">
                  {clientAppts.map((a) => {
                    const start = toWallClockDate(a.scheduledAt);
                    const end = new Date(
                      start.getTime() + (a.service?.durationMin ?? 0) * 60000,
                    );
                    const prof =
                      a.employee?.appName ?? a.employee?.name ?? null;
                    const produtosVendidos = comandas
                      .flatMap((c) => c.itens)
                      .filter(
                        (item) =>
                          item.tipo === "PRODUTO" && item.appointmentId === a.id,
                      );
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
                            {formatDate(start)} {formatTime(start)} –{" "}
                            {formatTime(end)}
                            {prof ? ` • ${prof}` : ""}
                          </p>
                          {produtosVendidos.length > 0 && (
                            <p className="text-xs text-muted-foreground truncate">
                              Produtos:{" "}
                              {produtosVendidos
                                .map((item) =>
                                  item.quantidade > 1
                                    ? `${item.nome} (${item.quantidade}x)`
                                    : item.nome,
                                )
                                .join(", ")}
                            </p>
                          )}
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
                <DataTablePagination
                  page={apptsPage}
                  pageSize={apptsPageSize}
                  totalPages={apptsTotalPages}
                  total={apptsTotal}
                  from={apptsFrom}
                  to={apptsTo}
                  onPageChange={setApptsPage}
                  onPageSizeChange={changeApptsPageSize}
                  className="border-t-0 px-0"
                />
              </>
            )}
          </TabsContent>

          <TabsContent value="comandas" className="pt-3">
            {comandasLoading ? (
              <Loading label="Carregando comandas" />
            ) : comandas.length === 0 ? (
              <EmptyTab message="Nenhuma comanda vinculada a este cliente." />
            ) : (
              <div className="space-y-2">
                {comandas.map((c) => {
                  const totalInCents = c.itens.reduce(
                    (sum, item) => sum + item.quantidade * item.valorUnitarioInCents,
                    0,
                  );
                  return (
                    <div
                      key={c.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => router.push(`/orders/${c.id}`)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          router.push(`/orders/${c.id}`);
                        }
                      }}
                      className="flex items-center gap-3 rounded-lg border border-border-subtle bg-surface-raised p-3 cursor-pointer hover:bg-surface-elevated transition-colors"
                    >
                      <Receipt className="size-4 text-brand shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          Comanda #{c.numero}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(c.createdAt)} • {formatBRL(totalInCents / 100)}
                        </p>
                      </div>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
                          c.status === "ABERTA"
                            ? "bg-brand/15 text-brand"
                            : c.status === "FECHADA"
                              ? "bg-success/15 text-success-foreground"
                              : "bg-danger/15 text-danger-foreground"
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="financeiro" className="pt-3">
            {chargesLoading ? (
              <Loading label="Carregando cobranças" />
            ) : charges.length === 0 ? (
              <EmptyTab message="Nenhum lançamento financeiro para este cliente." />
            ) : (
              <div className="space-y-2">
                {charges.map((charge) => (
                  <div
                    key={charge.id}
                    className="flex items-center gap-3 rounded-lg border border-border-subtle bg-surface-raised p-3"
                  >
                    <DollarSign className="size-4 text-brand shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {charge.subscription.plan.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Venc. {formatDate(charge.dueDate)}
                        {charge.paidAt ? ` • Pago em ${formatDate(charge.paidAt)}` : ""}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-foreground shrink-0">
                      {formatBRL(charge.amountInCents / 100)}
                    </span>
                    {(charge.status === "PENDING" || charge.status === "OVERDUE") &&
                      charge.pixPayload && (
                        <button
                          type="button"
                          onClick={() => setPixChargeToShow(charge)}
                          className="h-7 px-2.5 rounded-md text-xs font-semibold border border-border-subtle hover:bg-surface-elevated transition-colors flex items-center gap-1 shrink-0"
                        >
                          <QrCode className="size-3.5" />
                          Ver Pix
                        </button>
                      )}
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
                        charge.status === "PAID"
                          ? "bg-success/15 text-success-foreground"
                          : charge.status === "OVERDUE" || charge.status === "FAILED"
                            ? "bg-danger/15 text-danger-foreground"
                            : "bg-warning/15 text-warning-foreground"
                      }`}
                    >
                      {charge.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="assinatura" className="pt-3">
            {!activeSubscription ? (
              <EmptyTab message="Este cliente não possui assinatura ativa." />
            ) : (
              <div className="rounded-lg border border-border-subtle bg-surface-raised p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-foreground">
                      {activeSubscription.plan.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Ativo desde {formatDate(activeSubscription.startedAt)}
                    </p>
                  </div>
                  <span className="text-base font-bold text-foreground">
                    {formatBRL(
                      (activeSubscription.priceOverrideInCents ??
                        activeSubscription.plan.priceInCents) / 100,
                    )}
                    <span className="text-xs font-normal text-muted-foreground">/mês</span>
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm border-t border-border-subtle pt-3">
                  <span className="text-muted-foreground">Dia de cobrança</span>
                  <span className="text-foreground">
                    {activeSubscription.billingDay ?? "—"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setCancelDialogOpen(true)}
                  className="w-full h-9 rounded-md border border-danger/30 bg-transparent text-sm font-semibold text-danger-foreground hover:bg-danger/10 transition-colors flex items-center justify-center gap-2"
                >
                  <Ban className="size-3.5" />
                  Cancelar plano atual
                </button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <DialogEditarCliente
        open={editOpen}
        onOpenChange={setEditOpen}
        client={client}
        onSave={handleSaveEdit}
        onUploadPhoto={uploadPhoto}
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

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="bg-surface-raised border border-border text-foreground max-w-md p-0 gap-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border-subtle">
            <DialogTitle className="text-base font-bold">
              Cancelar plano atual
            </DialogTitle>
          </DialogHeader>

          <div className="px-6 py-5 space-y-4">
            <p className="text-sm text-muted-foreground">
              Informe o motivo do cancelamento da assinatura de{" "}
              <span className="font-semibold text-foreground">{client.name}</span>.
            </p>
            <SelectField
              id="cancelReason"
              label="Motivo do cancelamento"
              value={cancelReason}
              onChange={(v) => setCancelReason(v as CancelReasonCode)}
              placeholder="Selecione o motivo"
              options={CANCEL_REASON_OPTIONS}
            />
          </div>

          <div className="px-6 pb-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setCancelDialogOpen(false)}
              className="h-9 px-5 rounded-md border border-border bg-transparent text-sm text-foreground hover:bg-surface-elevated transition-colors"
            >
              Voltar
            </button>
            <button
              type="button"
              disabled={!cancelReason || cancelling}
              onClick={() => void handleCancelSubscription()}
              className="h-9 px-5 rounded-md text-sm font-bold bg-danger text-white hover:bg-danger/90 transition-colors disabled:opacity-60"
            >
              {cancelling ? "Cancelando…" : "Confirmar cancelamento"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={pixChargeToShow !== null} onOpenChange={(v) => !v && setPixChargeToShow(null)}>
        <DialogContent className="bg-surface-raised border border-border text-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cobrança Pix — {pixChargeToShow?.subscription.plan.name}</DialogTitle>
          </DialogHeader>
          {pixChargeToShow?.pixPayload && (
            <PixQrCodePanel
              qrCode={{
                payload: pixChargeToShow.pixPayload,
                encodedImage: pixChargeToShow.pixEncodedImage,
                expirationDate: pixChargeToShow.pixExpirationAt,
              }}
            />
          )}
        </DialogContent>
      </Dialog>
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
