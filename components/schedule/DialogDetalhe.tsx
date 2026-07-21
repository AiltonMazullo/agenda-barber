"use client";

import { useMemo, useState } from "react";
import {
  X,
  User,
  Phone,
  Scissors,
  Clock,
  Wifi,
  UserCheck,
  FileText,
  Trash2,
  Check,
  CheckCheck,
  Ban,
  UserX,
  History,
  Receipt,
  MessageCircle,
  BadgeCheck,
  AlertTriangle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { InfoRow } from "./Primitives";
import { isoToMin, localDateIso, minToTime } from "./helpers";
import { PlanoAtivacao } from "./PlanoAtivacao";
import { useAuth } from "@/hooks/useAuth";
import { useWhatsappSettings } from "@/hooks/useWhatsappSettings";
import { useClientRecentAppointments } from "@/hooks/useClientRecentAppointments";
import { buildWhatsappLink, renderWhatsappMessage } from "@/utils/whatsapp-template";
import type { AgendamentoVM, ProfissionalVM, ServicoVM } from "./types";
import type {
  AppointmentStatus,
  UpdatableAppointmentStatus,
} from "@/types/appointment.types";

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmado",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
  NO_SHOW: "Faltou",
};

/** "yyyy-MM-dd" → "dd/MM", sem depender do fuso do navegador. */
function diaMes(dataIso: string): string {
  const [, m, d] = dataIso.split("-");
  return `${d}/${m}`;
}

const STATUS_TONE: Record<AppointmentStatus, string> = {
  PENDING: "bg-amber-500/15 text-amber-400",
  CONFIRMED: "bg-brand/15 text-brand",
  COMPLETED: "bg-emerald-500/15 text-emerald-400",
  CANCELLED: "bg-red-500/15 text-red-400",
  NO_SHOW: "bg-pink-500/15 text-pink-400",
};

export function DialogDetalhe({
  open,
  onOpenChange,
  agendamento,
  servico,
  profissional,
  onDelete,
  onUpdateStatus,
  onAbrirComanda,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  agendamento: AgendamentoVM | null;
  servico: ServicoVM | null;
  profissional: ProfissionalVM | null;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: UpdatableAppointmentStatus) => void;
  /** Cria uma comanda do tipo AGENDAMENTO pré-preenchida com este agendamento. */
  onAbrirComanda?: (agendamento: AgendamentoVM) => void | Promise<void>;
}) {
  const { barbershop } = useAuth();
  const { data: whatsappSettings } = useWhatsappSettings(barbershop?.id);
  const [abrindoComanda, setAbrindoComanda] = useState(false);

  // Plano de ativação (mesmo componente usado no modal de criação) — só
  // relevante quando o cliente ainda não é assinante; quando já é, mostramos
  // um indicador compacto em vez do formulário de ativação.
  const [ativarPlano, setAtivarPlano] = useState(false);
  const [planoDataInicio, setPlanoDataInicio] = useState<Date | undefined>(
    new Date(),
  );
  const [planoForma, setPlanoForma] = useState("DINHEIRO");
  const [planoVencimento, setPlanoVencimento] = useState("");
  const [planoCpf, setPlanoCpf] = useState("");

  const { appointments: ultimosAgendamentos, isLoading: loadingHistorico } =
    useClientRecentAppointments(barbershop?.id, agendamento?.clientId, open, 3);

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
  const duracao = agendamento.duracao;
  const status = agendamento.status;

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
    if (!agendamento || !onAbrirComanda) return;
    setAbrindoComanda(true);
    try {
      await onAbrirComanda(agendamento);
    } finally {
      setAbrindoComanda(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface-raised border border-border text-foreground max-w-sm p-0 gap-0">
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
                {servico.nome}
              </DialogTitle>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="size-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        </DialogHeader>
        <div className="px-6 py-5 space-y-3 max-h-[70vh] overflow-y-auto schedule-scroll">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Status</span>
            <span
              className={cn(
                "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                STATUS_TONE[status],
              )}
            >
              {STATUS_LABEL[status]}
            </span>
          </div>
          <InfoRow
            icon={<User className="size-3.5" />}
            label="Cliente"
            value={agendamento.cliente}
          />
          <InfoRow
            icon={<Phone className="size-3.5" />}
            label="Telefone"
            value={agendamento.telefone || "—"}
          />
          <InfoRow
            icon={<Scissors className="size-3.5" />}
            label="Profissional"
            value={profissional?.nome ?? "—"}
          />
          <InfoRow
            icon={<Clock className="size-3.5" />}
            label="Horário"
            value={`${minToTime(agendamento.inicioMin)} – ${minToTime(agendamento.inicioMin + duracao)} (${duracao}min)`}
          />
          <InfoRow
            icon={
              agendamento.origem === "online" ? (
                <Wifi className="size-3.5" />
              ) : (
                <UserCheck className="size-3.5" />
              )
            }
            label="Origem"
            value={agendamento.origem === "online" ? "Online" : "Recepção"}
          />
          {agendamento.observacao && (
            <InfoRow
              icon={<FileText className="size-3.5" />}
              label="Obs."
              value={agendamento.observacao}
            />
          )}
          <div className="pt-1 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Valor do serviço</span>
            <span className="text-sm font-bold text-emerald-400">
              R$ {servico.preco.toFixed(2).replace(".", ",")}
            </span>
          </div>

          {/* ── Plano do cliente ── */}
          <div className="pt-1">
            {agendamento.assinante === "ativo" ? (
              <div className="flex items-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2">
                <BadgeCheck className="size-3.5 text-emerald-400 shrink-0" />
                <p className="text-[11px] text-muted-foreground">
                  Cliente assinante <span className="text-emerald-400 font-semibold">ativo</span>.
                </p>
              </div>
            ) : agendamento.assinante === "inadimplente" ? (
              <div className="flex items-center gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2">
                <AlertTriangle className="size-3.5 text-amber-400 shrink-0" />
                <p className="text-[11px] text-muted-foreground">
                  Assinante com fatura <span className="text-amber-400 font-semibold">em atraso</span>.
                </p>
              </div>
            ) : (
              <PlanoAtivacao
                ativar={ativarPlano}
                onAtivarChange={setAtivarPlano}
                dataInicio={planoDataInicio}
                onDataInicioChange={setPlanoDataInicio}
                formaPagamento={planoForma}
                onFormaPagamentoChange={setPlanoForma}
                vencimento={planoVencimento}
                onVencimentoChange={setPlanoVencimento}
                cpf={planoCpf}
                onCpfChange={setPlanoCpf}
              />
            )}
          </div>

          {/* ── Últimos agendamentos do cliente ── */}
          <div className="pt-1 space-y-1.5">
            <div className="flex items-center gap-1.5">
              <History className="size-3.5 text-muted-foreground" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Últimos agendamentos
              </span>
            </div>
            {loadingHistorico ? (
              <p className="text-xs text-text-faint">Carregando…</p>
            ) : ultimosAgendamentos.length === 0 ? (
              <p className="text-xs text-text-faint">
                Nenhum outro agendamento encontrado.
              </p>
            ) : (
              <div className="rounded-md border border-border-subtle divide-y divide-border-subtle">
                {ultimosAgendamentos
                  .filter((a) => a.id !== agendamento.id)
                  .slice(0, 3)
                  .map((a) => (
                    <div
                      key={a.id}
                      className="px-3 py-1.5 flex items-center justify-between gap-2"
                    >
                      <span className="text-xs text-foreground truncate">
                        {a.service?.name ?? "Serviço"}
                      </span>
                      <span className="text-[11px] text-text-faint whitespace-nowrap">
                        {diaMes(localDateIso(a.scheduledAt))}{" "}
                        {minToTime(isoToMin(a.scheduledAt))}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* ── Ações rápidas ── */}
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={handleEnviarWhatsapp}
              className="h-8 px-3 rounded-md border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-400 hover:bg-emerald-500/20 transition-colors flex items-center gap-1.5"
            >
              <MessageCircle className="size-3.5" />
              Enviar confirmação
            </button>
            {onAbrirComanda && (
              <button
                type="button"
                onClick={() => void handleAbrirComanda()}
                disabled={abrindoComanda}
                className="h-8 px-3 rounded-md border border-border bg-surface-elevated text-xs text-foreground hover:border-brand/40 transition-colors flex items-center gap-1.5 disabled:opacity-60"
              >
                <Receipt className="size-3.5" />
                {abrindoComanda ? "Abrindo…" : "Abrir comanda"}
              </button>
            )}
          </div>

          {/* Ações de status */}
          {(status === "PENDING" || status === "CONFIRMED") && (
            <div className="flex flex-wrap gap-2 pt-2">
              {status === "PENDING" && (
                <button
                  type="button"
                  onClick={() => onUpdateStatus(agendamento.id, "CONFIRMED")}
                  className="h-8 px-3 rounded-md border border-brand/40 bg-brand/10 text-xs text-brand hover:bg-brand/20 transition-colors flex items-center gap-1.5"
                >
                  <Check className="size-3.5" />
                  Confirmar
                </button>
              )}
              <button
                type="button"
                onClick={() => onUpdateStatus(agendamento.id, "COMPLETED")}
                className="h-8 px-3 rounded-md border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-400 hover:bg-emerald-500/20 transition-colors flex items-center gap-1.5"
              >
                <CheckCheck className="size-3.5" />
                Concluir
              </button>
              <button
                type="button"
                onClick={() => onUpdateStatus(agendamento.id, "NO_SHOW")}
                className="h-8 px-3 rounded-md border border-pink-500/30 bg-pink-500/10 text-xs text-pink-400 hover:bg-pink-500/20 transition-colors flex items-center gap-1.5"
              >
                <UserX className="size-3.5" />
                Marcar falta
              </button>
              <button
                type="button"
                onClick={() => onUpdateStatus(agendamento.id, "CANCELLED")}
                className="h-8 px-3 rounded-md border border-red-500/30 bg-red-500/10 text-xs text-red-400 hover:bg-red-500/20 transition-colors flex items-center gap-1.5"
              >
                <Ban className="size-3.5" />
                Cancelar
              </button>
            </div>
          )}
        </div>
        <div className="px-6 pb-6 pt-4 flex justify-between gap-3 border-t border-border-subtle">
          <button
            type="button"
            onClick={() => {
              onDelete(agendamento.id);
              onOpenChange(false);
            }}
            className="h-9 px-4 rounded-md border border-red-500/30 bg-red-500/10 text-sm text-red-400 hover:bg-red-500/20 transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="size-3.5" />
            Remover
          </button>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-9 px-5 rounded-md border border-border bg-transparent text-sm text-foreground hover:bg-surface-elevated transition-colors"
          >
            Fechar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
