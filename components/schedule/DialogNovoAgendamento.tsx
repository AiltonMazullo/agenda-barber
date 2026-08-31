"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Search,
  Check,
  UserPlus,
  CalendarCheck,
  BadgeCheck,
  AlertCircle,
  CreditCard,
  History,
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
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { DatePickerField, SelectField } from "@/components/shared";
import { QuickClientForm } from "./QuickClientForm";
import { DialogNovaAssinatura } from "@/components/plans/DialogNovaAssinatura";
import { usePlans } from "@/hooks/usePlans";
import { ServicoSelector } from "./ServicoSelector";
import {
  DialogHorarioSobreposto,
  type ConflitoHorario,
} from "./DialogHorarioSobreposto";
import { HoraSelect, defaultHoraParaData } from "./HoraSelect";
import {
  findConflicts,
  isBloqueio,
  minToTime,
  timeToMin,
  isSameDay,
} from "./helpers";
import { maskCpf, formatPhone } from "@/utils/format";
import { useAuth } from "@/hooks/useAuth";
import { useClientRecentAppointments } from "@/hooks/useClientRecentAppointments";
import { subscriptionsService } from "@/services/subscriptions.service";
import type {
  AgendamentoVM,
  BloqueioHorario,
  NovoAgendamentoInput,
  ProfissionalVM,
  QuickClientInput,
  ServicoSelecionado,
  ServicoVM,
} from "./types";
import type { AppointmentStatus } from "@/types/appointment.types";
import type { Client } from "@/types/client.types";
import type { Branch } from "@/types/branch.types";
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

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

/** "yyyy-MM-dd" → "dd/MM", sem depender do fuso do navegador. */
function diaMes(dataIso: string): string {
  const [, m, d] = dataIso.split("-");
  return `${d}/${m}`;
}

export function DialogNovoAgendamento({
  open,
  onOpenChange,
  onConfirm,
  onCreateClient,
  servicos,
  profissionaisTodos,
  branches,
  defaultBranchId,
  agendamentos,
  bloqueios,
  clients,
  clientActivePlans,
  clientDelinquency,
  defaultDate,
  prefilledHora,
  prefilledProfId,
  submitting,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: (ag: NovoAgendamentoInput) => void;
  /** Criação rápida de cliente. Retorna o cliente criado ou null. */
  onCreateClient: (data: QuickClientInput) => Promise<Client | null>;
  servicos: ServicoVM[];
  /** Profissionais de TODAS as filiais — filtrados aqui pela filial escolhida no modal. */
  profissionaisTodos: ProfissionalVM[];
  /** Filiais disponíveis para o seletor do modal (item 1.6). */
  branches: Branch[];
  /** Filial pré-selecionada ao abrir (a filial ativa na página da Agenda). */
  defaultBranchId?: string;
  agendamentos: AgendamentoVM[];
  /** Bloqueios de horário do dia atualmente carregado na agenda. */
  bloqueios: BloqueioHorario[];
  clients: Client[];
  /** Nomes dos planos ativos por cliente — indicador "Cliente possui plano X ativo" abaixo da seleção. */
  clientActivePlans: Map<string, string[]>;
  /** Clientes com assinatura em atraso — indicador de inadimplência no modal (spec-ajustes-escopo-3 §6). */
  clientDelinquency?: Map<string, boolean>;
  defaultDate: Date;
  prefilledHora?: string;
  prefilledProfId?: string;
  submitting?: boolean;
}) {
  const { barbershop } = useAuth();
  const [clientId, setClientId] = useState("");
  const [buscaCliente, setBuscaCliente] = useState("");
  const [clientDropdownOpen, setClientDropdownOpen] = useState(false);
  const [showQuickClient, setShowQuickClient] = useState(false);
  const [creatingClient, setCreatingClient] = useState(false);

  const [rows, setRows] = useState<ServicoSelecionado[]>([]);
  const [data, setData] = useState<Date | undefined>(defaultDate);
  const [hora, setHora] = useState(prefilledHora ?? "09:00");
  const [observacao, setObservacao] = useState("");
  const [branchId, setBranchId] = useState<string>(defaultBranchId ?? "");

  // Horário final (§2.1): pré-calculado a partir da soma das durações dos
  // serviços selecionados (já editáveis por linha no ServicoSelector) — mas
  // também editável diretamente aqui. Editar o horário final ajusta a
  // duração do ÚLTIMO serviço da lista para fechar o total pedido.
  const duracaoTotalMin = useMemo(
    () => rows.reduce((sum, r) => sum + r.duracao, 0),
    [rows],
  );
  const horaFinal = useMemo(
    () => minToTime(timeToMin(hora) + duracaoTotalMin),
    [hora, duracaoTotalMin],
  );
  function handleHoraFinalChange(novaHoraFinal: string) {
    if (rows.length === 0) return;
    const novoTotal = timeToMin(novaHoraFinal) - timeToMin(hora);
    const outrasDuracoes = rows
      .slice(0, -1)
      .reduce((sum, r) => sum + r.duracao, 0);
    const novaDuracaoUltimo = novoTotal - outrasDuracoes;
    if (novaDuracaoUltimo < 5) {
      toast.error(
        "Horário final muito próximo do início para a duração dos serviços.",
      );
      return;
    }
    setRows((prev) =>
      prev.map((r, i) =>
        i === prev.length - 1 ? { ...r, duracao: novaDuracaoUltimo } : r,
      ),
    );
  }

  /** Profissionais visíveis no seletor de serviço, filtrados pela filial escolhida acima. */
  const profissionais = useMemo(
    () =>
      profissionaisTodos.filter(
        (p) => !branchId || !p.branchId || p.branchId === branchId,
      ),
    [profissionaisTodos, branchId],
  );

  // Ativação de plano (spec-revisao-cliente-4.md §5.1): antes coletava dados
  // soltos (data início/vencimento/CPF) que nunca chegavam ao backend — a
  // "ativação" não fazia nada. Agora abre o mesmo fluxo real de assinatura
  // (DialogNovaAssinatura), que já sabe gerar o link de checkout.
  const { plans } = usePlans(barbershop?.id);
  const [assinaturaDialogOpen, setAssinaturaDialogOpen] = useState(false);

  // Sobreposição
  const [sobrepostoOpen, setSobrepostoOpen] = useState(false);
  const [conflitos, setConflitos] = useState<ConflitoHorario[]>([]);

  const servicoMap = useMemo(() => {
    const m = new Map<string, ServicoVM>();
    servicos.forEach((s) => m.set(s.id, s));
    return m;
  }, [servicos]);

  const cliente = useMemo(
    () => clients.find((c) => c.id === clientId),
    [clients, clientId],
  );

  // Reset ao abrir
  useEffect(() => {
    if (!open) return;
    // Horário vindo de um clique direto num slot da agenda é respeitado tal
    // qual (inclusive retroativo); só aplica o horário padrão/"próximo
    // disponível" quando o modal é aberto sem um slot pré-selecionado.
    setHora(
      prefilledHora ?? defaultHoraParaData(defaultDate, "09:00"),
    );
    setData(defaultDate);
    // Abre em branco — o usuário escolhe e aplica um serviço explicitamente
    // (spec-revisao-cliente-4.md §2.1: antes vinha pré-selecionado com o
    // primeiro serviço do catálogo, dando a impressão de "lembrar" o último
    // agendamento quando coincidia com o mais usado).
    setRows([
      {
        servicoId: "",
        profissionalId: prefilledProfId,
        duracao: 30,
        valor: 0,
      },
    ]);
    setAssinaturaDialogOpen(false);
    setBranchId(defaultBranchId ?? "");
    setClientId("");
    setBuscaCliente("");
    setClientDropdownOpen(false);
  }, [open, prefilledHora, prefilledProfId, defaultDate, servicos, defaultBranchId]);

  // Sugestões de cliente: aparecem já no primeiro clique (os 5 primeiros
  // cadastrados) e vão refinando conforme o usuário digita — sempre no
  // máximo 5 por vez (busca por nome, e-mail, telefone ou CPF).
  const clientesFiltrados = useMemo(() => {
    const q = buscaCliente.trim().toLowerCase();
    if (!q) return clients.slice(0, 5);
    const digits = buscaCliente.replace(/\D/g, "");
    const base = clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (digits.length >= 3 && (c.phone ?? "").includes(digits)) ||
        (digits.length >= 3 && (c.cpf ?? "").includes(digits)),
    );
    return base.slice(0, 5);
  }, [clients, buscaCliente]);

  const planosAtivos = clientId ? (clientActivePlans.get(clientId) ?? []) : [];
  const clienteInadimplente = clientId ? (clientDelinquency?.get(clientId) ?? false) : false;

  // Últimos 3 agendamentos do cliente selecionado — mesmo histórico rápido já
  // usado no modal de detalhe (`DialogDetalhe`), aqui pra recepção ver o
  // padrão do cliente antes de confirmar o novo agendamento.
  const { appointments: ultimosAgendamentos, isLoading: loadingUltimos } =
    useClientRecentAppointments(barbershop?.id, clientId || undefined, !!clientId, 3);

  // ── Preço/duração dinâmicos ──
  // O preço e a duração do serviço nunca são digitados manualmente: vêm do
  // cadastro do serviço, aplicando o desconto/gratuidade do plano ativo do
  // cliente selecionado (mesma regra de `getServicePricing` usada no fluxo
  // do cliente e na comanda).
  const [pricingByService, setPricingByService] = useState<
    Map<string, ServicePricing>
  >(new Map());

  const servicoIdsAtuais = useMemo(
    () =>
      Array.from(new Set(rows.map((r) => r.servicoId).filter(Boolean))).join(
        ",",
      ),
    [rows],
  );

  useEffect(() => {
    if (!clientId || !barbershop?.id || !servicoIdsAtuais) {
      setPricingByService(new Map());
      return;
    }
    let active = true;
    const servicoIds = servicoIdsAtuais.split(",");
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
  }, [clientId, barbershop?.id, servicoIdsAtuais]);

  // Reaplica o valor vigente (base ou de plano) sempre que a precificação ou
  // o cadastro dos serviços mudar — mantém `rows` como fonte única de
  // verdade sem permitir edição manual.
  useEffect(() => {
    setRows((prev) => {
      let changed = false;
      const next = prev.map((r) => {
        const servico = servicoMap.get(r.servicoId);
        const baseValor = servico?.preco ?? r.valor;
        const baseDuracao = servico?.tempoPadrao ?? r.duracao;
        const pricing = pricingByService.get(r.servicoId);
        const valor =
          pricing && pricing.covered
            ? pricing.free
              ? 0
              : pricing.priceInCents / 100
            : baseValor;
        if (valor !== r.valor || baseDuracao !== r.duracao) {
          changed = true;
          return { ...r, valor, duracao: baseDuracao };
        }
        return r;
      });
      return changed ? next : prev;
    });
  }, [pricingByService, servicoMap]);

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

  function handleDataChange(d: Date | undefined) {
    setData(d);
    // Se trocar para hoje e o horário escolhido já passou, ajusta para o
    // próximo horário válido.
    if (d && isSameDay(d, new Date())) {
      const nowMin = (() => {
        const n = new Date();
        return n.getHours() * 60 + n.getMinutes();
      })();
      if (timeToMin(hora) <= nowMin) {
        setHora(defaultHoraParaData(d, hora));
      }
    }
  }

  /** Calcula conflitos por profissional (serviços executados em sequência). */
  function computeConflitos(): ConflitoHorario[] {
    const [h, m] = hora.split(":").map(Number);
    let cursor = h * 60 + (m || 0);
    const out: ConflitoHorario[] = [];
    for (const row of rows) {
      if (row.profissionalId) {
        const conflicts = findConflicts(
          agendamentos,
          row.profissionalId,
          cursor,
          row.duracao,
          undefined,
          bloqueios,
        );
        for (const c of conflicts) {
          if (isBloqueio(c)) {
            out.push({
              profissionalNome:
                profissionais.find((p) => p.id === row.profissionalId)?.nome ??
                "profissional",
              horario: `${minToTime(c.inicioMin)} – ${minToTime(c.inicioMin + c.duracaoMin)}`,
              servicoNome: c.motivo || "Bloqueado",
              tipo: "bloqueio",
            });
            continue;
          }
          out.push({
            profissionalNome: c.profissionalNome,
            horario: `${minToTime(c.inicioMin)} – ${minToTime(c.inicioMin + c.duracao)}`,
            servicoNome: servicoMap.get(c.servicoId)?.nome ?? "serviço",
          });
        }
      }
      cursor += row.duracao;
    }
    return out;
  }

  function handleVerificar() {
    if (!data) {
      toast.error("Selecione a data.");
      return;
    }
    const c = computeConflitos();
    if (c.length === 0) {
      toast.success("Nenhuma sobreposição. Horário disponível.");
      return;
    }
    setConflitos(c);
    setSobrepostoOpen(true);
  }

  function validar(): boolean {
    if (!clientId) {
      toast.error("Selecione o cliente.");
      return false;
    }
    if (rows.length === 0 || rows.some((r) => !r.servicoId)) {
      toast.error("Selecione ao menos um serviço.");
      return false;
    }
    if (!data) {
      toast.error("Selecione a data.");
      return false;
    }
    // Diferente do agendamento online (cliente), a recepção pode registrar
    // um agendamento em horário retroativo (ex.: atendimento walk-in já
    // realizado) — ver spec-revisao-cliente-1.md §5.2. Por isso não há
    // validação de "data/horário no passado" aqui.
    return true;
  }

  function doConfirm() {
    if (!data) return;
    onConfirm({
      clientId,
      servicos: rows,
      data,
      hora,
      observacao,
      // Situação sempre "Agendado" na criação (spec-revisao-cliente-4.md
      // §2.4) — mudar pra Confirmado/Finalizado/Cancelado só pelos fluxos
      // reais (confirmar, fechar comanda, marcar falta, cancelar), nunca
      // direto na criação.
      origem: "recepcao", // definida automaticamente
      branchId: branchId || undefined,
    });
    // Reset parcial
    setClientId("");
    setBuscaCliente("");
    setObservacao("");
    setHora("09:00");
  }

  function handleAgendar() {
    if (!validar()) return;
    const c = computeConflitos();
    if (c.length > 0) {
      setConflitos(c);
      setSobrepostoOpen(true);
      return;
    }
    doConfirm();
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-surface-raised border border-border text-foreground max-w-2xl p-0 gap-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border-subtle">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-base font-bold">
                Novo Agendamento
              </DialogTitle>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="size-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>
          </DialogHeader>

          <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto schedule-scroll">
            {/* ── Filial ── */}
            {branches.length > 1 && (
              <SelectField
                id="ag-filial"
                label="Filial"
                value={branchId}
                options={branches.map((b) => ({ value: b.id, label: b.name }))}
                onChange={(v) => {
                  setBranchId(v);
                  // Profissional escolhido pode não pertencer à nova filial.
                  setRows((prev) =>
                    prev.map((r) => ({ ...r, profissionalId: undefined })),
                  );
                }}
              />
            )}

            {/* ── Cliente ── */}
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

              <AnimatePresence initial={false}>
                {showQuickClient && (
                  <motion.div
                    key="quick-client"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <div className="pb-2">
                      <QuickClientForm
                        onSubmit={(d) => void handleCreateClient(d)}
                        onCancel={() => setShowQuickClient(false)}
                        submitting={creatingClient}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-text-faint" />
                <Input
                  value={buscaCliente}
                  onChange={(e) => {
                    setBuscaCliente(e.target.value);
                    // Editar o texto depois de já ter um cliente selecionado
                    // reabre a busca — a seleção anterior só é confirmada de
                    // novo se o usuário clicar em um resultado.
                    if (clientId) setClientId("");
                  }}
                  onFocus={() => setClientDropdownOpen(true)}
                  onBlur={() =>
                    // Delay pra deixar o clique num item da lista disparar
                    // antes do dropdown fechar (blur do input acontece antes
                    // do click do botão).
                    setTimeout(() => setClientDropdownOpen(false), 150)
                  }
                  placeholder="Buscar por nome, e-mail, telefone ou CPF"
                  className="bg-surface-base border-border text-foreground placeholder:text-text-faint focus-visible:ring-brand/30 h-10 pl-9"
                />
              </div>
              {clientDropdownOpen && (
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
                          setBuscaCliente(c.name);
                          setClientDropdownOpen(false);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-2 flex items-center justify-between gap-2 transition-colors",
                          clientId === c.id
                            ? "bg-brand/10"
                            : "hover:bg-surface-elevated",
                        )}
                      >
                        <p className="text-sm text-foreground truncate">
                          {c.name}
                          {c.phone && (
                            <span className="text-text-faint">
                              {" "}
                              - {formatPhone(c.phone)}
                            </span>
                          )}
                          {c.cpf && (
                            <span className="text-text-faint">
                              {" "}
                              - {maskCpf(c.cpf)}
                            </span>
                          )}
                        </p>
                        {clientId === c.id && (
                          <Check className="size-3.5 text-brand shrink-0" />
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}

              {/* Cliente confirmado — deixa claro o que foi selecionado. */}
              {cliente && !clientDropdownOpen && (
                <div className="flex items-center gap-2 rounded-md border border-brand/30 bg-brand/5 px-3 py-2">
                  <Check className="size-3.5 text-brand shrink-0" />
                  <p className="text-[11px] text-muted-foreground truncate flex-1">
                    <span className="text-foreground font-semibold">
                      {cliente.name}
                    </span>
                    {cliente.phone && ` · ${formatPhone(cliente.phone)}`}
                    {cliente.cpf && ` · ${maskCpf(cliente.cpf)}`}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setClientId("");
                      setBuscaCliente("");
                    }}
                    className="text-[11px] font-bold text-brand hover:text-brand-hover transition-colors shrink-0"
                  >
                    Trocar
                  </button>
                </div>
              )}
            </div>

            {/* ── Plano (quando há cliente selecionado) ── */}
            {clientId &&
              (planosAtivos.length > 0 ? (
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
              ) : (
                <div className="flex items-center gap-2.5 rounded-lg border border-warning/30 bg-warning/5 p-3">
                  <AlertCircle className="size-4 text-warning-foreground shrink-0" />
                  <p className="text-xs text-muted-foreground flex-1">
                    Este cliente não possui plano ativo.
                  </p>
                  <button
                    type="button"
                    onClick={() => setAssinaturaDialogOpen(true)}
                    className="h-7 px-3 rounded-md text-xs font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors flex items-center gap-1.5 shrink-0"
                  >
                    <CreditCard className="size-3" />
                    Ativar plano
                  </button>
                </div>
              ))}

            {/* ── Inadimplência (spec-ajustes-escopo-3 §6) — agendar
                continua permitido mesmo assim, é só um alerta. ── */}
            {clientId && clienteInadimplente && (
              <div className="flex items-center gap-2 rounded-md border border-danger-foreground/30 bg-danger/10 px-3 py-2">
                <CircleAlert className="size-3.5 text-danger-foreground shrink-0" />
                <p className="text-[11px] text-danger-foreground">
                  Cliente com assinatura em atraso.
                </p>
              </div>
            )}

            {/* ── Últimos 3 agendamentos do cliente ── */}
            {clientId && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <History className="size-3.5 text-muted-foreground" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Últimos agendamentos
                  </span>
                </div>
                {loadingUltimos ? (
                  <p className="text-xs text-text-faint">Carregando…</p>
                ) : ultimosAgendamentos.length === 0 ? (
                  <p className="text-xs text-text-faint">
                    Nenhum agendamento anterior encontrado.
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
                        {ultimosAgendamentos.slice(0, 3).map((a) => (
                          <tr key={a.id}>
                            <td className="px-2 py-1.5 whitespace-nowrap text-foreground">
                              {diaMes(a.scheduledAt.slice(0, 10))}
                            </td>
                            <td className="px-2 py-1.5 text-foreground truncate max-w-[90px]">
                              {a.service?.name ?? "Serviço"}
                            </td>
                            <td className="px-2 py-1.5 text-muted-foreground truncate max-w-[90px]">
                              {a.products.length > 0
                                ? a.products.map((p) => p.nome).join(", ")
                                : "—"}
                            </td>
                            <td className="px-2 py-1.5 text-muted-foreground truncate max-w-[80px]">
                              {a.employee?.appName ?? a.employee?.name ?? "—"}
                            </td>
                            <td className="px-2 py-1.5 text-muted-foreground truncate max-w-[70px]">
                              {STATUS_LABEL[a.status]}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ── Serviços (múltiplos) ── */}
            <ServicoSelector
              value={rows}
              onChange={setRows}
              servicos={servicos}
              profissionais={profissionais}
              editablePricing={false}
              editableDuration
              pricingByService={pricingByService}
            />

            {/* ── Data / Horário ── */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-brand">
                  Data
                </label>
                <DatePickerField
                  id="ag-data"
                  date={data}
                  onChange={handleDataChange}
                  defaultMonth={defaultDate}
                  disabled={{ before: startOfDay(new Date()) }}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-brand">
                  Horário
                </label>
                <HoraSelect value={hora} onChange={setHora} date={data} />
              </div>
            </div>

            {/* ── Horário final (§2.1): pré-calculado a partir da duração dos
                serviços selecionados, mas editável — editar aqui ajusta a
                duração do último serviço da lista pra fechar o total. ── */}
            {rows.length > 0 && rows.every((r) => r.servicoId) && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-brand">
                  Horário final
                </label>
                <HoraSelect value={horaFinal} onChange={handleHoraFinalChange} date={data} />
              </div>
            )}

            {/* ── Verificar horário ── */}
            <button
              type="button"
              onClick={handleVerificar}
              className="w-full h-9 rounded-md border border-brand/40 bg-brand/5 text-sm font-semibold text-brand hover:bg-brand/10 transition-colors flex items-center justify-center gap-1.5"
            >
              <CalendarCheck className="size-3.5" />
              Verificar Horário
            </button>

            {/* ── Observação ── */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Observação
              </label>
              <Textarea
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                placeholder="Opcional"
                className="bg-surface-base border-border text-foreground placeholder:text-text-faint focus-visible:ring-brand/30 resize-none min-h-[70px]"
              />
            </div>
          </div>

          <div className="px-6 pb-6 pt-4 border-t border-border-subtle flex justify-end gap-3">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="h-9 px-5 rounded-md border border-border bg-transparent text-sm text-foreground hover:bg-surface-elevated transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleAgendar}
              disabled={submitting}
              className="h-9 px-5 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors disabled:opacity-60"
            >
              {submitting ? "Agendando…" : "Agendar"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <DialogHorarioSobreposto
        open={sobrepostoOpen}
        onOpenChange={setSobrepostoOpen}
        conflitos={conflitos}
        onAgendarMesmoAssim={() => {
          setSobrepostoOpen(false);
          doConfirm();
        }}
      />

      {barbershop?.id && (
        <DialogNovaAssinatura
          open={assinaturaDialogOpen}
          onOpenChange={setAssinaturaDialogOpen}
          barbershopId={barbershop.id}
          plans={plans}
          initialClientId={clientId}
          onCreated={() => {}}
        />
      )}
    </>
  );
}
