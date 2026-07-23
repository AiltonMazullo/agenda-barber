/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Ban, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { minToTime, timeToMin, toDateInputValue } from "./helpers";
import type { AgendamentoVM, ProfissionalVM } from "./types";
import type { Branch } from "@/types/branch.types";

const TODOS = "todos";

export interface NovoBloqueioInput {
  profissionalId: string;
  inicioMin: number;
  duracaoMin: number;
  motivo: string;
}

/**
 * Modal de criação de bloqueio de horário. Diferente do modo "arrastar no
 * grid", este fluxo pede os dados diretamente e avisa antecipadamente se o
 * horário escolhido colide com algum agendamento existente — o bloqueio é
 * criado mesmo assim, mas o usuário decide de olhos abertos.
 */
export function DialogNovoBloqueio({
  open,
  onOpenChange,
  branches,
  profissionais,
  agendamentos,
  selectedDate,
  defaultFilialId,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  branches: Branch[];
  profissionais: ProfissionalVM[];
  /** Agendamentos do dia/filial atualmente carregados na agenda. */
  agendamentos: AgendamentoVM[];
  selectedDate: Date;
  defaultFilialId: string;
  onSave: (input: NovoBloqueioInput) => void;
}) {
  const [data, setData] = useState(toDateInputValue(selectedDate));
  const [horaInicio, setHoraInicio] = useState("08:00");
  const [horaFim, setHoraFim] = useState("08:10");
  const [filialId, setFilialId] = useState(defaultFilialId);
  const [profissionalId, setProfissionalId] = useState(TODOS);
  const [observacoes, setObservacoes] = useState("");

  useEffect(() => {
    if (!open) return;
    setData(toDateInputValue(selectedDate));
    setHoraInicio("08:00");
    setHoraFim("08:10");
    setFilialId(defaultFilialId);
    setProfissionalId(TODOS);
    setObservacoes("");
  }, [open, selectedDate, defaultFilialId]);

  const profissionaisDaFilial = useMemo(
    () => profissionais.filter((p) => !filialId || p.branchId === filialId),
    [profissionais, filialId],
  );

  const inicioMin = timeToMin(horaInicio);
  const fimMin = timeToMin(horaFim);
  const duracaoMin = fimMin - inicioMin;

  const conflitos = useMemo(() => {
    if (duracaoMin <= 0) return [];
    return agendamentos.filter((ag) => {
      if (ag.dataIso !== data) return false;
      if (ag.status === "CANCELLED") return false;
      if (profissionalId !== TODOS && ag.profissionalId !== profissionalId)
        return false;
      const agFim = ag.inicioMin + ag.duracao;
      return inicioMin < agFim && inicioMin + duracaoMin > ag.inicioMin;
    });
  }, [agendamentos, data, duracaoMin, inicioMin, profissionalId]);

  function handleSave() {
    if (!filialId) {
      toast.error("Selecione a filial.");
      return;
    }
    if (duracaoMin <= 0) {
      toast.error("O horário de fim deve ser depois do horário de início.");
      return;
    }
    onSave({
      profissionalId,
      inicioMin,
      duracaoMin,
      motivo: observacoes.trim(),
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface-raised border border-border text-foreground max-w-md p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border-subtle">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ban className="size-4 text-red-400" />
              <DialogTitle className="text-base font-bold">
                Novo bloqueio
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

        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto schedule-scroll">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Tipo de agendamento *
            </label>
            <Input
              value="Bloqueado"
              disabled
              className="bg-surface-base border-border text-foreground h-10 opacity-70"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Data *
              </label>
              <Input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="bg-surface-base border-border text-foreground h-10"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Horário de início *
              </label>
              <Input
                type="time"
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                className="bg-surface-base border-border text-foreground h-10"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Horário de fim *
              </label>
              <Input
                type="time"
                value={horaFim}
                onChange={(e) => setHoraFim(e.target.value)}
                className="bg-surface-base border-border text-foreground h-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Filial *
              </label>
              <select
                value={filialId}
                onChange={(e) => {
                  setFilialId(e.target.value);
                  setProfissionalId(TODOS);
                }}
                className="w-full h-10 rounded-md border border-border bg-surface-base text-sm text-foreground px-3 outline-none focus:border-brand transition-colors"
              >
                <option value="" disabled>
                  Selecione
                </option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Profissional *
              </label>
              <select
                value={profissionalId}
                onChange={(e) => setProfissionalId(e.target.value)}
                className="w-full h-10 rounded-md border border-border bg-surface-base text-sm text-foreground px-3 outline-none focus:border-brand transition-colors"
              >
                <option value={TODOS}>Todos os profissionais</option>
                {profissionaisDaFilial.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Observações
            </label>
            <Textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Opcional"
              className="bg-surface-base border-border text-foreground placeholder:text-text-faint focus-visible:ring-brand/30 resize-none min-h-[70px]"
            />
          </div>

          {conflitos.length > 0 && (
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-md bg-red-500/5 border border-red-500/20">
              <AlertTriangle className="size-3.5 text-red-400 mt-0.5 shrink-0" />
              <div className="text-xs text-red-300/90 space-y-1">
                <p className="font-semibold">
                  {conflitos.length} agendamento
                  {conflitos.length > 1 ? "s" : ""} nesse horário será
                  {conflitos.length > 1 ? "ão" : ""} bloqueado
                  {conflitos.length > 1 ? "s" : ""}:
                </p>
                <ul className="space-y-0.5">
                  {conflitos.map((c) => (
                    <li key={c.id}>
                      {c.cliente} · {minToTime(c.inicioMin)}–
                      {minToTime(c.inicioMin + c.duracao)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 pb-6 flex justify-end gap-3 border-t border-border-subtle pt-4">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-9 px-5 rounded-md border border-border bg-transparent text-sm text-foreground hover:bg-surface-elevated transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="h-9 px-5 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors flex items-center gap-1.5"
          >
            <Ban className="size-3.5" />
            Salvar bloqueio
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
