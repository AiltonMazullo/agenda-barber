"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Search,
  Check,
  UserPlus,
  BadgeCheck,
  History,
  Settings2,
  Trash2,
  Loader2,
  CircleAlert,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { SelectField, DatePickerField } from "@/components/shared";
import { QuickClientForm } from "./QuickClientForm";
import { ServicoSelector } from "./ServicoSelector";
import { HoraSelect } from "./HoraSelect";
import { minToTime, timeToMin } from "./helpers";
import { useAuth } from "@/hooks/useAuth";
import { useWhatsappSettings } from "@/hooks/useWhatsappSettings";
import { useClientRecentAppointments } from "@/hooks/useClientRecentAppointments";
import { useClientDueRepurchases } from "@/hooks/useClientDueRepurchases";
import { auditLogService } from "@/services/audit-log.service";
import { subscriptionsService } from "@/services/subscriptions.service";
import { buildWhatsappLink, renderWhatsappMessage } from "@/utils/whatsapp-template";
import { formatPhone, maskCpf } from "@/utils/format";
import type {
  AgendamentoVM,
  ProfissionalVM,
  QuickClientInput,
  ServicoSelecionado,
  ServicoVM,
} from "./types";
import type {
  AppointmentStatus,
  UpdatableAppointmentStatus,
  UpdateAppointmentPayload,
} from "@/types/appointment.types";
import type { AuditLog } from "@/types/audit-log.types";
import type { Client } from "@/types/client.types";
import type { Branch } from "@/types/branch.types";
import type { Comanda } from "@/types/orders.types";
import type { ServicePricing } from "@/types/subscription.types";

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
  PENDING: "bg-amber-500/15 text-amber-400",
  CONFIRMED: "bg-brand/15 text-brand",
  ARRIVED: "bg-orange-500/15 text-orange-400",
  IN_PROGRESS: "bg-yellow-500/15 text-yellow-400",
  COMPLETED: "bg-emerald-500/15 text-emerald-400",
  CANCELLED: "bg-red-500/15 text-red-400",
  NO_SHOW: "bg-pink-500/15 text-pink-400",
};

/** "yyyy-MM-dd" → "dd/MM", sem depender do fuso do navegador. */
function diaMes(dataIso: string): string {
  const [, m, d] = dataIso.split("-");
  return `${d}/${m}`;
}

/** "yyyy-MM-dd" (fuso local, ver `dataIso`) + minutos do dia → ISO UTC (mesma convenção de `scheduledAt`). */
function dateAndMinToIso(dataIso: string, min: number): string {
  const d = new Date(`${dataIso}T00:00:00.000Z`);
  d.setUTCMinutes(min);
  return d.toISOString();
}

/** "yyyy-MM-dd" local → `Date` à meia-noite local (pro `DatePickerField`). */
function localIsoToDate(dataIso: string): Date {
  const [y, m, d] = dataIso.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

/** `Date` (fuso local) → "yyyy-MM-dd", pra recompor o ISO ao salvar. */
function dateToLocalIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function DialogDetalhe({
  open,
  onOpenChange,
  agendamento,
  servico,
  profissional,
  servicos,
  profissionaisTodos,
  branches,
  clients,
  clientActivePlans,
  clientDelinquency,
  onDelete,
  onUpdateStatus,
  onSave,
  onTransferClient,
  onCreateClient,
  onAbrirComanda,
  onFecharComanda,
  comandaAberta,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  agendamento: AgendamentoVM | null;
  servico: ServicoVM | null;
  profissional: ProfissionalVM | null;
  /** Todos os serviços da barbearia — seletor de serviços (item 7). */
  servicos: ServicoVM[];
  /** Profissionais de todas as filiais — filtrados aqui pela filial escolhida no modal. */
  profissionaisTodos: ProfissionalVM[];
  /** Filiais disponíveis para o seletor de filial (item 3). */
  branches: Branch[];
  clients: Client[];
  /** Nomes dos planos ativos por cliente — indicador "Cliente possui plano X + Y ativo" (item 2). */
  clientActivePlans: Map<string, string[]>;
  /** Clientes com assinatura em atraso — indicador de inadimplência no modal (spec-ajustes-escopo-3 §6). */
  clientDelinquency?: Map<string, boolean>;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: UpdatableAppointmentStatus) => void;
  /** Salva as mudanças do formulário — `PATCH /appointments/:id` unificado. */
  onSave: (id: string, payload: UpdateAppointmentPayload) => Promise<boolean>;
  /** Troca o cliente do agendamento (endpoint dedicado `transfer`, cascateia pro grupo). */
  onTransferClient: (id: string, clientId: string) => Promise<boolean>;
  /** Criação rápida de cliente — mesmo formulário do modal de novo agendamento. */
  onCreateClient: (data: QuickClientInput) => Promise<Client | null>;
  /** Cria uma comanda do tipo AGENDAMENTO pré-preenchida com este agendamento. */
  onAbrirComanda?: (agendamento: AgendamentoVM) => void | Promise<void>;
  /** Pula direto pra tela de fechamento (pagamento) de uma comanda ABERTA já vinculada, sem passar pela composição. */
  onFecharComanda?: (comanda: Comanda) => void;
  /** Comanda ainda aberta já vinculada a este agendamento, se houver. */
  comandaAberta?: Comanda | null;
}) {
  const router = useRouter();
  const { barbershop } = useAuth();
  const { data: whatsappSettings } = useWhatsappSettings(barbershop?.id);
  const [abrindoComanda, setAbrindoComanda] = useState(false);
  const [saving, setSaving] = useState(false);

  // ── Cliente ──
  const [clientId, setClientId] = useState("");
  const [buscaCliente, setBuscaCliente] = useState("");
  const [showQuickClient, setShowQuickClient] = useState(false);
  const [creatingClient, setCreatingClient] = useState(false);

  // ── Data/horário/filial/profissional ──
  const [data, setData] = useState<Date | undefined>(undefined);
  const [horaInicio, setHoraInicio] = useState("09:00");
  const [horaFim, setHoraFim] = useState("09:30");
  const [branchId, setBranchId] = useState("");
  const [profissionalId, setProfissionalId] = useState("");
  const [semPreferencia, setSemPreferencia] = useState(false);

  // ── Serviços ──
  const [rows, setRows] = useState<ServicoSelecionado[]>([]);

  // ── Observação ──
  const [observacao, setObservacao] = useState("");

  // ── Histórico (auditoria) ──
  const [historico, setHistorico] = useState<AuditLog[]>([]);
  const [loadingHistorico, setLoadingHistorico] = useState(false);

  const { appointments: ultimosAgendamentos, isLoading: loadingUltimos } =
    useClientRecentAppointments(barbershop?.id, agendamento?.clientId, open, 3);
  const { repurchases: itensRecompra, isLoading: loadingRecompra } =
    useClientDueRepurchases(barbershop?.id, agendamento?.clientId, open);

  const servicoMap = useMemo(() => {
    const m = new Map<string, ServicoVM>();
    servicos.forEach((s) => m.set(s.id, s));
    return m;
  }, [servicos]);

  const profissionaisFiltrados = useMemo(
    () =>
      profissionaisTodos.filter(
        (p) => !branchId || !p.branchId || p.branchId === branchId,
      ),
    [profissionaisTodos, branchId],
  );

  const cliente = useMemo(
    () => clients.find((c) => c.id === clientId),
    [clients, clientId],
  );

  const clientesFiltrados = useMemo(() => {
    const q = buscaCliente.trim().toLowerCase();
    const digits = buscaCliente.replace(/\D/g, "");
    const base = q
      ? clients.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.email.toLowerCase().includes(q) ||
            (digits.length >= 3 && (c.phone ?? "").includes(digits)) ||
            (digits.length >= 3 && (c.cpf ?? "").includes(digits)),
        )
      : clients;
    return base.slice(0, 50);
  }, [clients, buscaCliente]);

  const planosAtivos = clientId ? (clientActivePlans.get(clientId) ?? []) : [];
  const clienteInadimplente = clientId ? (clientDelinquency?.get(clientId) ?? false) : false;

  // Recalcula o valor com desconto de plano sempre que o dialog abre — o
  // preço não é persistido no agendamento (spec-revisao-cliente-4.md §1.2),
  // então precisa ser recalculado aqui do mesmo jeito que no dialog de
  // criação, senão volta a exibir o preço cheio do catálogo.
  const [pricingByService, setPricingByService] = useState<
    Map<string, ServicePricing>
  >(new Map());

  useEffect(() => {
    if (!open || !clientId || !barbershop?.id || !agendamento) {
      setPricingByService(new Map());
      return;
    }
    let active = true;
    const servicoIds = Array.from(new Set(agendamento.servicos.map((s) => s.id)));
    Promise.all(
      servicoIds.map((id) =>
        subscriptionsService
          .getServicePricing(barbershop.id, clientId, id)
          .then((p) => [id, p] as const)
          .catch(() => [id, { covered: false as const }] as const),
      ),
    ).then((entries) => {
      if (!active) return;
      setPricingByService(new Map(entries));
    });
    return () => {
      active = false;
    };
  }, [open, clientId, barbershop?.id, agendamento]);

  // ── Reset ao abrir ──
  useEffect(() => {
    if (!open || !agendamento) return;
    setClientId(agendamento.clientId);
    setBuscaCliente("");
    setShowQuickClient(false);
    setData(localIsoToDate(agendamento.dataIso));
    setHoraInicio(minToTime(agendamento.inicioMin));
    setHoraFim(minToTime(agendamento.inicioMin + agendamento.duracao));
    setBranchId(agendamento.branchId ?? "");
    setObservacao(agendamento.observacao ?? "");
    setSemPreferencia(agendamento.semPreferencia);
    setProfissionalId(agendamento.semPreferencia ? "" : agendamento.profissionalId);
    setRows(
      agendamento.servicos.length > 0
        ? agendamento.servicos.map((s) => {
            const vm = servicoMap.get(s.id);
            return {
              servicoId: s.id,
              // Herda o profissional do próprio agendamento — antes vinha
              // sempre "Sem preferência" no seletor por serviço, mesmo com
              // um profissional já atribuído no campo acima.
              profissionalId: agendamento.semPreferencia
                ? undefined
                : agendamento.profissionalId,
              duracao:
                vm?.tempoPadrao ??
                Math.round(agendamento.duracao / agendamento.servicos.length),
              valor: vm?.preco ?? 0,
            };
          })
        : [],
    );
    setHistorico([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, agendamento?.id]);

  // Reaplica o valor com desconto de plano assim que `pricingByService`
  // resolve (mesmo padrão de DialogNovoAgendamento) — roda depois do reset
  // acima, sem re-disparar o reset inteiro a cada nova precificação.
  useEffect(() => {
    if (pricingByService.size === 0) return;
    setRows((prev) =>
      prev.map((r) => {
        const pricing = pricingByService.get(r.servicoId);
        if (!pricing || !pricing.covered) return r;
        const valor = pricing.free ? 0 : pricing.priceInCents / 100;
        return valor !== r.valor ? { ...r, valor } : r;
      }),
    );
  }, [pricingByService]);

  const mensagemConfirmacao = useMemo(() => {
    if (!agendamento || !servico) return "";
    const template =
      whatsappSettings?.confirmationTemplate ??
      "Olá #cliente_primeiro_nome! Confirmando seu horário em #nome_empresa dia #data às #hora com #nome_profissional.";
    return renderWhatsappMessage(template, {
      nome_cliente: agendamento.cliente,
      cliente_primeiro_nome: agendamento.cliente.split(" ")[0],
      nome_profissional: profissional?.nome,
      profissional_primeiro_nome: profissional?.nome?.split(" ")[0],
      data: diaMes(agendamento.dataIso),
      hora: minToTime(agendamento.inicioMin),
      nome_empresa: barbershop?.name,
      telefone_empresa: barbershop?.phone ?? undefined,
    });
  }, [agendamento, servico, profissional, whatsappSettings, barbershop]);

  if (!agendamento || !servico) return null;
  const status = agendamento.status;

  async function handleCreateClient(input: QuickClientInput) {
    setCreatingClient(true);
    try {
      const created = await onCreateClient(input);
      if (created) {
        setClientId(created.id);
        setBuscaCliente("");
        setShowQuickClient(false);
      }
    } finally {
      setCreatingClient(false);
    }
  }

  function handleEnviarWhatsapp() {
    if (!agendamento) return;
    if (!agendamento.telefone) {
      toast.error("Este cliente não tem telefone cadastrado.");
      return;
    }
    const link = buildWhatsappLink(agendamento.telefone, mensagemConfirmacao);
    window.open(link, "_blank", "noopener,noreferrer");
  }

  async function handleAbrirComanda() {
    if (comandaAberta) {
      router.push(`/orders/${comandaAberta.id}`);
      return;
    }
    if (!agendamento || !onAbrirComanda) return;
    setAbrindoComanda(true);
    try {
      await onAbrirComanda(agendamento);
    } finally {
      setAbrindoComanda(false);
    }
  }

  async function handleAbrirHistorico() {
    if (!barbershop?.id || !agendamento) return;
    setLoadingHistorico(true);
    try {
      const entityIds = agendamento.memberIds.join(",");
      const logs = await auditLogService.list(barbershop.id, {
        entityType: "AGENDAMENTO",
        entityIds,
      });
      setHistorico(logs);
    } catch {
      setHistorico([]);
    } finally {
      setLoadingHistorico(false);
    }
  }

  async function handleSalvar() {
    if (!agendamento || !barbershop?.id) return;
    if (!clientId) {
      toast.error("Selecione o cliente.");
      return;
    }
    if (rows.length === 0 || rows.some((r) => !r.servicoId)) {
      toast.error("Selecione ao menos um serviço.");
      return;
    }
    if (!data) {
      toast.error("Selecione a data.");
      return;
    }
    if (!semPreferencia && !profissionalId) {
      toast.error('Selecione o profissional ou marque "sem preferência".');
      return;
    }
    if (timeToMin(horaFim) <= timeToMin(horaInicio)) {
      toast.error("Horário de fim deve ser após o início.");
      return;
    }

    setSaving(true);
    try {
      // Cliente muda pelo endpoint dedicado de transferência (cascateia
      // regras próprias já implementadas no backend) — feito antes do PATCH
      // unificado pra não misturar as duas responsabilidades.
      if (clientId !== agendamento.clientId) {
        const ok = await onTransferClient(agendamento.id, clientId);
        if (!ok) return;
      }

      const payload: UpdateAppointmentPayload = {};
      const dataIso = dateToLocalIso(data);

      const newServiceIds = rows.map((r) => r.servicoId).filter(Boolean);
      const originalServiceIds = agendamento.servicos.map((s) => s.id);
      const servicesChanged =
        newServiceIds.length !== originalServiceIds.length ||
        newServiceIds.some((id, i) => id !== originalServiceIds[i]);
      if (servicesChanged) payload.serviceIds = newServiceIds;

      const newStartIso = dateAndMinToIso(dataIso, timeToMin(horaInicio));
      const originalStartIso = dateAndMinToIso(agendamento.dataIso, agendamento.inicioMin);
      if (newStartIso !== originalStartIso) payload.startAt = newStartIso;

      // Horário de fim (resize) — só faz sentido comparar contra o original
      // quando a composição de serviços NÃO mudou (senão a duração já vem
      // recomputada pelos novos serviços no backend).
      if (!servicesChanged) {
        const originalEndMin = agendamento.inicioMin + agendamento.duracao;
        if (timeToMin(horaFim) !== originalEndMin) {
          payload.endAt = dateAndMinToIso(dataIso, timeToMin(horaFim));
        }
      }

      if (branchId !== (agendamento.branchId ?? "")) {
        payload.branchId = branchId || null;
      }

      if (semPreferencia) {
        // §3.1: o backend sorteia um profissional disponível — não grava
        // mais `employeeId: null` (isso tornava o agendamento invisível na
        // agenda). Só envia quando a origem realmente muda pra "sem
        // preferência" (senão reenviaria o sorteio a cada salvamento).
        if (!agendamento.semPreferencia) payload.noPreference = true;
      } else if (profissionalId && profissionalId !== agendamento.profissionalId) {
        payload.employeeId = profissionalId;
      }

      const observacaoTrimmed = observacao.trim();
      if (observacaoTrimmed !== (agendamento.observacao ?? "").trim()) {
        payload.notes = observacaoTrimmed || null;
      }

      if (Object.keys(payload).length > 0) {
        const ok = await onSave(agendamento.id, payload);
        if (!ok) return;
      }

      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface-raised border border-border text-foreground max-w-2xl p-0 gap-0">
        <div
          className="h-1 w-full rounded-t-lg"
          style={{ backgroundColor: servico.cor }}
        />
        <DialogHeader className="px-6 pt-4 pb-4 border-b border-border-subtle">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: servico.cor }}
              />
              <DialogTitle className="text-base font-bold">
                Detalhe do agendamento
              </DialogTitle>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                  STATUS_TONE[status],
                )}
              >
                {STATUS_LABEL[status]}
              </span>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="size-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4 max-h-[75vh] overflow-y-auto schedule-scroll">
          {/* ── 1. Cliente ── */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase tracking-widest text-brand">
                Cliente
              </label>
              {!showQuickClient && (
                <button
                  type="button"
                  onClick={() => setShowQuickClient(true)}
                  className="text-[11px] font-bold text-brand hover:text-brand-hover transition-colors flex items-center gap-1"
                >
                  <UserPlus className="size-3" />
                  Novo cliente
                </button>
              )}
            </div>

            {showQuickClient && (
              <div className="pb-2">
                <QuickClientForm
                  onSubmit={(d) => void handleCreateClient(d)}
                  onCancel={() => setShowQuickClient(false)}
                  submitting={creatingClient}
                />
              </div>
            )}

            {!showQuickClient && (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-text-faint" />
                  <Input
                    value={buscaCliente}
                    onChange={(e) => setBuscaCliente(e.target.value)}
                    placeholder={
                      cliente ? cliente.name : "Buscar por nome, telefone ou CPF"
                    }
                    className="bg-surface-base border-border text-foreground placeholder:text-text-faint focus-visible:ring-brand/30 h-10 pl-9"
                  />
                </div>
                {buscaCliente.trim().length > 0 && (
                  <div className="max-h-40 overflow-y-auto schedule-scroll rounded-md border border-border-subtle divide-y divide-border-subtle">
                    {clientesFiltrados.length === 0 ? (
                      <p className="text-xs text-text-faint text-center py-4">
                        Nenhum cliente encontrado.
                      </p>
                    ) : (
                      clientesFiltrados.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setClientId(c.id);
                            setBuscaCliente("");
                          }}
                          className={cn(
                            "w-full text-left px-3 py-2 flex items-center justify-between gap-2 transition-colors",
                            clientId === c.id ? "bg-brand/10" : "hover:bg-surface-elevated",
                          )}
                        >
                          <div className="min-w-0">
                            <p className="text-sm text-foreground truncate">{c.name}</p>
                            <p className="text-[11px] text-text-faint truncate">
                              {c.phone ? formatPhone(c.phone) : c.email}
                              {c.cpf && ` · ${maskCpf(c.cpf)}`}
                            </p>
                          </div>
                          {clientId === c.id && <Check className="size-3.5 text-brand shrink-0" />}
                        </button>
                      ))
                    )}
                  </div>
                )}

                {/* Cliente selecionado — nome + telefone sempre visíveis (antes
                    o telefone só aparecia no placeholder do campo de busca,
                    somindo assim que o usuário digitava algo). */}
                {cliente && buscaCliente.trim().length === 0 && (
                  <div className="flex items-center gap-2 rounded-md border border-brand/30 bg-brand/5 px-3 py-2">
                    <Check className="size-3.5 text-brand shrink-0" />
                    <p className="text-[11px] text-muted-foreground truncate flex-1">
                      <span className="text-foreground font-semibold">{cliente.name}</span>
                      {cliente.phone && ` · ${formatPhone(cliente.phone)}`}
                      {cliente.cpf && ` · ${maskCpf(cliente.cpf)}`}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── 2. Indicador de plano ativo ── */}
          {clientId && planosAtivos.length > 0 && (
            <div className="flex items-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2">
              <BadgeCheck className="size-3.5 text-emerald-400 shrink-0" />
              <p className="text-[11px] text-muted-foreground">
                ✓ Cliente possui plano{" "}
                <span className="text-emerald-400 font-semibold">
                  {planosAtivos.join(" + ")}
                </span>{" "}
                ativo.
              </p>
            </div>
          )}

          {/* ── 2b. Indicador de inadimplência (spec-ajustes-escopo-3 §6) —
              agendar continua permitido mesmo assim, é só um alerta. ── */}
          {clientId && clienteInadimplente && (
            <div className="flex items-center gap-2 rounded-md border border-danger-foreground/30 bg-danger/10 px-3 py-2">
              <CircleAlert className="size-3.5 text-danger-foreground shrink-0" />
              <p className="text-[11px] text-danger-foreground">
                Cliente com assinatura em atraso.
              </p>
            </div>
          )}

          {/* ── 3. Data / Horário início / Horário fim / Filial ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-brand">
                Data *
              </label>
              <DatePickerField id="det-data" date={data} onChange={setData} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-brand">
                Filial *
              </label>
              <SelectField
                id="det-filial"
                value={branchId}
                options={branches.map((b) => ({ value: b.id, label: b.name }))}
                onChange={(v) => {
                  setBranchId(v);
                  setProfissionalId("");
                }}
                placeholder="Selecione"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-brand">
                Horário de início *
              </label>
              <HoraSelect value={horaInicio} onChange={setHoraInicio} date={data} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-brand">
                Horário de fim *
              </label>
              <HoraSelect value={horaFim} onChange={setHoraFim} date={data} />
            </div>
          </div>

          {/* ── 4. Profissional + Sem preferência ── */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-brand">
              Profissional *
            </label>
            <SelectField
              id="det-profissional"
              value={profissionalId}
              options={profissionaisFiltrados.map((p) => ({ value: p.id, label: p.nome }))}
              onChange={setProfissionalId}
              placeholder="Selecione"
              className={cn(semPreferencia && "opacity-50 pointer-events-none")}
            />
            <label className="flex items-center gap-2 cursor-pointer select-none pt-0.5">
              <Checkbox
                checked={semPreferencia}
                onCheckedChange={(c) => {
                  const checked = c === true;
                  setSemPreferencia(checked);
                  if (checked) setProfissionalId("");
                }}
              />
              <span className="text-xs text-muted-foreground">
                Sem preferência por profissional
              </span>
            </label>
          </div>

          {/* ── 4b. Observação ── */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-brand">
              Observação
            </label>
            <Textarea
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Opcional"
              rows={2}
              className="bg-surface-base border-border text-foreground placeholder:text-text-faint focus-visible:ring-brand/30 resize-none"
            />
          </div>

          {/* ── 5. Últimos 3 agendamentos ── */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <History className="size-3.5 text-muted-foreground" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Últimos agendamentos
              </span>
            </div>
            {loadingUltimos ? (
              <p className="text-xs text-text-faint">Carregando…</p>
            ) : ultimosAgendamentos.filter((a) => a.id !== agendamento.id).length === 0 ? (
              <p className="text-xs text-text-faint">
                Nenhum outro agendamento encontrado.
              </p>
            ) : (
              <div className="rounded-md border border-border-subtle divide-y divide-border-subtle overflow-x-auto">
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="text-text-faint">
                      <th className="text-left font-medium px-2 py-1">Data</th>
                      <th className="text-left font-medium px-2 py-1">Serviço</th>
                      <th className="text-left font-medium px-2 py-1">Produtos</th>
                      <th className="text-left font-medium px-2 py-1">Profissional</th>
                      <th className="text-left font-medium px-2 py-1">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {ultimosAgendamentos
                      .filter((a) => a.id !== agendamento.id)
                      .slice(0, 3)
                      .map((a) => (
                        <tr key={a.id}>
                          <td className="px-2 py-1.5 whitespace-nowrap text-foreground">
                            {diaMes(a.scheduledAt.slice(0, 10))}
                          </td>
                          <td className="px-2 py-1.5 text-foreground truncate max-w-[100px]">
                            {a.service?.name ?? "Serviço"}
                          </td>
                          <td className="px-2 py-1.5 text-muted-foreground truncate max-w-[100px]">
                            {a.products.length > 0
                              ? a.products.map((p) => p.nome).join(", ")
                              : "—"}
                          </td>
                          <td className="px-2 py-1.5 text-muted-foreground truncate max-w-[90px]">
                            {a.employee?.appName ?? a.employee?.name ?? "—"}
                          </td>
                          <td className="px-2 py-1.5 whitespace-nowrap">
                            <span
                              className={cn(
                                "text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full",
                                STATUS_TONE[a.status],
                              )}
                            >
                              {STATUS_LABEL[a.status]}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ── 6. Itens para recompra ── */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Itens para recompra
            </span>
            {loadingRecompra ? (
              <p className="text-xs text-text-faint">Carregando…</p>
            ) : itensRecompra.length === 0 ? (
              <p className="text-xs text-text-faint">Nenhum item vencendo ou vencido.</p>
            ) : (
              <div className="rounded-md border border-border-subtle divide-y divide-border-subtle overflow-x-auto">
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="text-text-faint">
                      <th className="text-left font-medium px-2 py-1">Data</th>
                      <th className="text-left font-medium px-2 py-1">Item</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {itensRecompra.slice(0, 3).map((r) => (
                      <tr key={r.id}>
                        <td className="px-2 py-1.5 whitespace-nowrap text-foreground">
                          {diaMes(r.repurchaseAt.slice(0, 10))}
                        </td>
                        <td
                          className={cn(
                            "px-2 py-1.5",
                            new Date(r.repurchaseAt) < new Date()
                              ? "text-red-400"
                              : "text-amber-400",
                          )}
                        >
                          {r.service?.name ?? r.product?.name ?? "Item"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* Máximo 3 linhas exibidas — a lista completa segue a
                    configuração de dias de recompra de cada serviço/produto. */}
                {itensRecompra.length > 3 && (
                  <p className="text-[10px] text-text-faint text-center py-1 border-t border-border-subtle">
                    +{itensRecompra.length - 3} outro(s) item(ns) vencendo
                  </p>
                )}
              </div>
            )}
          </div>

          {/* ── 7. Serviços ── */}
          <ServicoSelector
            value={rows}
            onChange={setRows}
            servicos={servicos}
            profissionais={profissionaisFiltrados}
          />

          {/* ── Ações rápidas ── */}
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={handleEnviarWhatsapp}
              className="h-8 px-3 rounded-md border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-400 hover:bg-emerald-500/20 transition-colors flex items-center gap-1.5"
            >
              Enviar confirmação
            </button>
            {(onAbrirComanda || comandaAberta) && (
              <button
                type="button"
                onClick={() => void handleAbrirComanda()}
                disabled={abrindoComanda}
                className="h-8 px-3 rounded-md border border-border bg-surface-elevated text-xs text-foreground hover:border-brand/40 transition-colors flex items-center gap-1.5 disabled:opacity-60"
              >
                {abrindoComanda ? "Abrindo…" : comandaAberta ? "Ver comanda" : "Abrir comanda"}
              </button>
            )}
            {onFecharComanda && comandaAberta?.status === "ABERTA" && (
              <button
                type="button"
                onClick={() => onFecharComanda(comandaAberta)}
                className="h-8 px-3 rounded-md border border-brand/40 bg-brand/10 text-xs text-brand hover:bg-brand/20 transition-colors flex items-center gap-1.5"
              >
                Fechar comanda
              </button>
            )}
          </div>
        </div>

        {/* ── 8. Rodapé ── */}
        <div className="px-6 pb-6 pt-4 flex items-center justify-between gap-2 border-t border-border-subtle">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-9 px-4 rounded-md border border-border bg-transparent text-sm text-foreground hover:bg-surface-elevated transition-colors"
          >
            Cancelar
          </button>

          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger
                onClick={() => void handleAbrirHistorico()}
                className="h-9 px-2 rounded-md text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
              >
                <History className="size-3.5" />
                Histórico
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="w-80 bg-surface-raised border-border text-foreground p-0"
              >
                <div className="max-h-72 overflow-y-auto schedule-scroll p-3 space-y-2">
                  {loadingHistorico ? (
                    <p className="text-xs text-text-faint text-center py-4">Carregando…</p>
                  ) : historico.length === 0 ? (
                    <p className="text-xs text-text-faint text-center py-4">
                      Nenhum evento registrado.
                    </p>
                  ) : (
                    historico.map((log) => (
                      <div
                        key={log.id}
                        className="rounded-md border border-border-subtle p-2 text-[11px] space-y-0.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-foreground">{log.action}</span>
                          <span className="text-text-faint">
                            {new Date(log.createdAt).toLocaleString("pt-BR")}
                          </span>
                        </div>
                        <p className="text-muted-foreground">
                          {log.field}: {log.oldValue ?? "—"} → {log.newValue ?? "—"}
                        </p>
                        <p className="text-text-faint">{log.actorName}</p>
                      </div>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover>

            <DropdownMenu>
              <DropdownMenuTrigger className="h-9 px-3 rounded-md border border-border bg-surface-elevated text-xs text-foreground hover:border-brand/40 transition-colors flex items-center gap-1.5">
                <Settings2 className="size-3.5" />
                Opções
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-surface-raised border-border text-foreground">
                {status === "PENDING" && (
                  <DropdownMenuItem onClick={() => onUpdateStatus(agendamento.id, "CONFIRMED")}>
                    Confirmar
                  </DropdownMenuItem>
                )}
                {(status === "PENDING" || status === "CONFIRMED") && (
                  <DropdownMenuItem onClick={() => onUpdateStatus(agendamento.id, "ARRIVED")}>
                    Cliente chegou
                  </DropdownMenuItem>
                )}
                {status === "ARRIVED" && (
                  <DropdownMenuItem onClick={() => onUpdateStatus(agendamento.id, "IN_PROGRESS")}>
                    Iniciar atendimento
                  </DropdownMenuItem>
                )}
                {(status === "PENDING" ||
                  status === "CONFIRMED" ||
                  status === "ARRIVED" ||
                  status === "IN_PROGRESS") && (
                  <>
                    <DropdownMenuItem onClick={() => onUpdateStatus(agendamento.id, "COMPLETED")}>
                      Concluir atendimento
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onUpdateStatus(agendamento.id, "NO_SHOW")}>
                      Marcar falta
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onUpdateStatus(agendamento.id, "CANCELLED")}
                      className="text-red-400"
                    >
                      Cancelar agendamento
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuItem
                  onClick={() => {
                    onDelete(agendamento.id);
                    onOpenChange(false);
                  }}
                  className="text-red-400"
                >
                  <Trash2 className="size-3.5 mr-1.5" />
                  Remover
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <button
              type="button"
              onClick={() => void handleSalvar()}
              disabled={saving}
              className="h-9 px-5 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors disabled:opacity-60 flex items-center gap-1.5"
            >
              {saving && <Loader2 className="size-3.5 animate-spin" />}
              {saving ? "Salvando…" : "Salvar agendamento"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
