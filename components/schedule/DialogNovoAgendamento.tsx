"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Search, Check, UserPlus, CalendarCheck } from "lucide-react";
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
import { DatePickerField } from "@/components/shared";
import { QuickClientForm } from "./QuickClientForm";
import { PlanoAtivacao } from "./PlanoAtivacao";
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
import { maskCpf } from "@/utils/format";
import type {
  AgendamentoVM,
  NovoAgendamentoInput,
  ProfissionalVM,
  QuickClientInput,
  ServicoSelecionado,
  ServicoVM,
} from "./types";
import type { Client } from "@/types/client.types";

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function DialogNovoAgendamento({
  open,
  onOpenChange,
  onConfirm,
  onCreateClient,
  servicos,
  profissionais,
  agendamentos,
  clients,
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
  profissionais: ProfissionalVM[];
  agendamentos: AgendamentoVM[];
  clients: Client[];
  defaultDate: Date;
  prefilledHora?: string;
  prefilledProfId?: string;
  submitting?: boolean;
}) {
  const [clientId, setClientId] = useState("");
  const [buscaCliente, setBuscaCliente] = useState("");
  const [showQuickClient, setShowQuickClient] = useState(false);
  const [creatingClient, setCreatingClient] = useState(false);

  const [rows, setRows] = useState<ServicoSelecionado[]>([]);
  const [data, setData] = useState<Date | undefined>(defaultDate);
  const [hora, setHora] = useState(prefilledHora ?? "09:00");
  const [observacao, setObservacao] = useState("");

  // Plano (UI local — ativado após confirmação)
  const [ativarPlano, setAtivarPlano] = useState(false);
  const [planoDataInicio, setPlanoDataInicio] = useState<Date | undefined>(
    new Date(),
  );
  const [planoForma, setPlanoForma] = useState("DINHEIRO");
  const [planoVencimento, setPlanoVencimento] = useState("");
  const [planoCpf, setPlanoCpf] = useState("");

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
    setHora(defaultHoraParaData(defaultDate, prefilledHora ?? "09:00"));
    setData(defaultDate);
    const s0 = servicos[0];
    setRows([
      {
        servicoId: s0?.id ?? "",
        profissionalId: prefilledProfId,
        duracao: s0?.tempoPadrao ?? 30,
        valor: s0?.preco ?? 0,
      },
    ]);
    setAtivarPlano(false);
    setPlanoVencimento("");
    setPlanoDataInicio(new Date());
    setPlanoForma("DINHEIRO");
  }, [open, prefilledHora, prefilledProfId, defaultDate, servicos]);

  // Prefill CPF do plano com o CPF do cliente selecionado
  useEffect(() => {
    setPlanoCpf(cliente?.cpf ? maskCpf(cliente.cpf) : "");
  }, [cliente]);

  const clientesFiltrados = useMemo(() => {
    const q = buscaCliente.trim().toLowerCase();
    const base = q
      ? clients.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.email.toLowerCase().includes(q),
        )
      : clients;
    return base.slice(0, 50);
  }, [clients, buscaCliente]);

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
        );
        for (const c of conflicts) {
          if (isBloqueio(c)) continue;
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
    const [h, m] = hora.split(":").map(Number);
    const quando = new Date(data);
    quando.setHours(h, m || 0, 0, 0);
    if (quando.getTime() < Date.now()) {
      toast.error("Não é possível agendar em uma data/horário no passado.");
      return false;
    }
    if (ativarPlano && planoCpf.replace(/\D/g, "").length !== 11) {
      toast.error("Informe o CPF do cliente para ativar o plano.");
      return false;
    }
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
      origem: "recepcao", // definida automaticamente
      planoAtivacao:
        ativarPlano && planoDataInicio
          ? {
              dataInicio: planoDataInicio,
              formaPagamento: planoForma,
              vencimento: parseInt(planoVencimento || "0", 10),
              cpf: planoCpf.replace(/\D/g, ""),
            }
          : undefined,
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
        <DialogContent className="bg-surface-raised border border-border text-foreground max-w-md p-0 gap-0">
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
                  onChange={(e) => setBuscaCliente(e.target.value)}
                  placeholder={
                    cliente ? cliente.name : "Buscar cliente por nome ou e-mail"
                  }
                  className="bg-surface-base border-border text-foreground placeholder:text-text-faint focus-visible:ring-brand/30 h-10 pl-9"
                />
              </div>
              <div className="max-h-40 overflow-y-auto schedule-scroll rounded-md border border-border-subtle divide-y divide-border-subtle">
                {clientesFiltrados.length === 0 ? (
                  <p className="text-xs text-text-faint text-center py-4">
                    {clients.length === 0
                      ? "Nenhum cliente cadastrado."
                      : "Nenhum cliente encontrado."}
                  </p>
                ) : (
                  clientesFiltrados.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setClientId(c.id)}
                      className={cn(
                        "w-full text-left px-3 py-2 flex items-center justify-between gap-2 transition-colors",
                        clientId === c.id
                          ? "bg-brand/10"
                          : "hover:bg-surface-elevated",
                      )}
                    >
                      <div className="min-w-0">
                        <p className="text-sm text-foreground truncate">
                          {c.name}
                        </p>
                        <p className="text-[11px] text-text-faint truncate">
                          {c.email}
                        </p>
                      </div>
                      {clientId === c.id && (
                        <Check className="size-3.5 text-brand shrink-0" />
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* ── Plano (quando há cliente selecionado) ── */}
            {clientId && (
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

            {/* ── Serviços (múltiplos) ── */}
            <ServicoSelector
              value={rows}
              onChange={setRows}
              servicos={servicos}
              profissionais={profissionais}
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
    </>
  );
}
