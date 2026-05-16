/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  X,
  ChevronDown,
  Timer,
  UserCheck,
  Wifi,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  SERVICOS,
  PROFISSIONAIS,
  type Agendamento,
} from "@/mock/schedule";
import { DropdownButton } from "@/components/schedule/DropdownButton";

interface DialogNovoAgendamentoProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: (ag: Omit<Agendamento, "id">) => void;
  prefilledHora?: string;
  prefilledProfId?: string;
}

export function DialogNovoAgendamento({
  open,
  onOpenChange,
  onConfirm,
  prefilledHora,
  prefilledProfId,
}: DialogNovoAgendamentoProps) {
  const [cliente, setCliente] = useState("");
  const [telefone, setTelefone] = useState("");
  const [servicoId, setServicoId] = useState(SERVICOS[0].id);
  const [profissionalId, setProfissionalId] = useState(
    prefilledProfId ?? PROFISSIONAIS[0].id,
  );
  const [hora, setHora] = useState(prefilledHora ?? "09:00");
  const [observacao, setObservacao] = useState("");
  const [origem, setOrigem] = useState<"online" | "recepcao">("recepcao");

  useEffect(() => {
    if (open) {
      if (prefilledHora) setHora(prefilledHora);
      if (prefilledProfId) setProfissionalId(prefilledProfId);
    }
  }, [open, prefilledHora, prefilledProfId]);

  const servico = SERVICOS.find((s) => s.id === servicoId)!;
  const prof = PROFISSIONAIS.find((p) => p.id === profissionalId)!;
  const duracao = prof.tempos[servicoId] ?? servico.tempoPadrao;

  const handleConfirm = () => {
    if (!cliente.trim()) {
      toast.error("Informe o nome do cliente.");
      return;
    }
    const [h, m] = hora.split(":").map(Number);
    onConfirm({
      cliente,
      telefone,
      servicoId,
      profissionalId,
      inicioMin: h * 60 + (m || 0),
      observacao,
      origem,
    });
    onOpenChange(false);
    setCliente("");
    setTelefone("");
    setObservacao("");
    setHora("09:00");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface-raised border border-border text-white max-w-md p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border-subtle">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-bold">
              Novo Agendamento
            </DialogTitle>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="size-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-white hover:bg-surface-elevated transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-brand">
              Cliente
            </label>
            <Input
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              placeholder="Nome do cliente"
              className="bg-surface-base border-border text-white placeholder:text-text-subtle focus-visible:ring-[#f5b82e]/30 h-10"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Telefone
            </label>
            <Input
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="(81) 99999-0000"
              className="bg-surface-base border-border text-white placeholder:text-text-subtle focus-visible:ring-[#f5b82e]/30 h-10"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-brand">
                Serviço
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger className="w-full">
                  <DropdownButton className="w-full h-10 px-3 rounded-md border border-border bg-surface-base text-sm text-white flex items-center justify-between gap-2 hover:border-[#f5b82e]/40 transition-colors cursor-pointer">
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className={cn(
                          "size-2 rounded-full shrink-0",
                          servico.cor,
                        )}
                      />
                      <span className="truncate text-sm">{servico.nome}</span>
                    </div>
                    <ChevronDown className="size-3.5 text-muted-foreground shrink-0" />
                  </DropdownButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-surface-raised border-border text-white w-48">
                  {SERVICOS.map((s) => (
                    <DropdownMenuItem
                      key={s.id}
                      onClick={() => setServicoId(s.id)}
                      className="text-xs hover:bg-surface-elevated cursor-pointer"
                    >
                      <span
                        className={cn(
                          "size-2 rounded-full mr-2 shrink-0",
                          s.cor,
                        )}
                      />
                      {s.nome}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-brand">
                Profissional
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger className="w-full">
                  <DropdownButton className="w-full h-10 px-3 rounded-md border border-border bg-surface-base text-sm text-white flex items-center justify-between gap-2 hover:border-[#f5b82e]/40 transition-colors cursor-pointer">
                    <span className="truncate text-sm">{prof.nome}</span>
                    <ChevronDown className="size-3.5 text-muted-foreground shrink-0" />
                  </DropdownButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-surface-raised border-border text-white">
                  {PROFISSIONAIS.filter((p) => p.ativo).map((p) => (
                    <DropdownMenuItem
                      key={p.id}
                      onClick={() => setProfissionalId(p.id)}
                      className="text-xs hover:bg-surface-elevated cursor-pointer"
                    >
                      {p.nome}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-brand">
              Horário
            </label>
            <Input
              type="time"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              className="bg-surface-base border-border text-white focus-visible:ring-[#f5b82e]/30 h-10"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Origem
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(["recepcao", "online"] as const).map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => setOrigem(o)}
                  className={cn(
                    "h-9 rounded-md border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors",
                    origem === o
                      ? "bg-[#f5b82e]/15 border-[#f5b82e]/60 text-brand"
                      : "border-border bg-surface-base text-muted-foreground hover:border-[#f5b82e]/30",
                  )}
                >
                  {o === "recepcao" ? (
                    <UserCheck className="size-3.5" />
                  ) : (
                    <Wifi className="size-3.5" />
                  )}
                  {o === "recepcao" ? "Recepção" : "Online"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-surface-base border border-border-subtle">
            <Timer className="size-3.5 text-brand" />
            <span className="text-xs text-muted-foreground">
              Duração estimada:
            </span>
            <span className="text-xs font-bold text-white">{duracao} min</span>
            <span className="text-xs text-text-subtle ml-auto">
              R$ {servico.preco.toFixed(2).replace(".", ",")}
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Observação
            </label>
            <Textarea
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Opcional"
              className="bg-surface-base border-border text-white placeholder:text-text-subtle focus-visible:ring-[#f5b82e]/30 resize-none min-h-[70px]"
            />
          </div>
        </div>

        <div className="px-6 pb-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-9 px-5 rounded-md border border-border bg-transparent text-sm text-white hover:bg-surface-elevated transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="h-9 px-5 rounded-md text-sm font-bold bg-[#f5b82e] text-black hover:bg-[#d9a326] transition-colors"
          >
            Agendar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
