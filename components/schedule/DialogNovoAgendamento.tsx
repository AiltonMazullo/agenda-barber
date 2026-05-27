/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  X,
  ChevronDown,
  Timer,
  UserCheck,
  Wifi,
  Search,
  Check,
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
import { toast } from "sonner";
import { DropdownButton } from "./Primitives";
import type {
  NovoAgendamentoInput,
  Origem,
  ProfissionalVM,
  ServicoVM,
} from "./types";
import type { Client } from "@/types/client.types";

export function DialogNovoAgendamento({
  open,
  onOpenChange,
  onConfirm,
  servicos,
  profissionais,
  clients,
  prefilledHora,
  prefilledProfId,
  submitting,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: (ag: NovoAgendamentoInput) => void;
  servicos: ServicoVM[];
  profissionais: ProfissionalVM[];
  clients: Client[];
  prefilledHora?: string;
  prefilledProfId?: string;
  submitting?: boolean;
}) {
  const [clientId, setClientId] = useState("");
  const [buscaCliente, setBuscaCliente] = useState("");
  const [servicoId, setServicoId] = useState("");
  const [profissionalId, setProfissionalId] = useState("");
  const [hora, setHora] = useState(prefilledHora ?? "09:00");
  const [observacao, setObservacao] = useState("");
  const [origem, setOrigem] = useState<Origem>("recepcao");

  useEffect(() => {
    if (!open) return;
    setHora(prefilledHora ?? "09:00");
    setProfissionalId(prefilledProfId ?? profissionais[0]?.id ?? "");
    setServicoId((prev) => prev || servicos[0]?.id || "");
  }, [open, prefilledHora, prefilledProfId, profissionais, servicos]);

  const servico = useMemo(
    () => servicos.find((s) => s.id === servicoId),
    [servicos, servicoId],
  );
  const prof = useMemo(
    () => profissionais.find((p) => p.id === profissionalId),
    [profissionais, profissionalId],
  );
  const cliente = useMemo(
    () => clients.find((c) => c.id === clientId),
    [clients, clientId],
  );
  const duracao = servico?.tempoPadrao ?? 30;

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

  const handleConfirm = () => {
    if (!clientId) {
      toast.error("Selecione o cliente.");
      return;
    }
    if (!servicoId) {
      toast.error("Selecione o serviço.");
      return;
    }
    if (!profissionalId) {
      toast.error("Selecione o profissional.");
      return;
    }
    onConfirm({
      clientId,
      serviceId: servicoId,
      employeeId: profissionalId,
      hora,
      observacao,
      origem,
    });
    setClientId("");
    setBuscaCliente("");
    setObservacao("");
    setHora("09:00");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#161b22] border border-[#30363d] text-white max-w-md p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-[#21262d]">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-bold">
              Novo Agendamento
            </DialogTitle>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="size-7 rounded-md flex items-center justify-center text-[#8b949e] hover:text-white hover:bg-[#21262d] transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto schedule-scroll">
          {/* Cliente: busca + seleção da lista */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#f5b82e]">
              Cliente
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-[#4d5562]" />
              <Input
                value={buscaCliente}
                onChange={(e) => setBuscaCliente(e.target.value)}
                placeholder={
                  cliente ? cliente.name : "Buscar cliente por nome ou e-mail"
                }
                className="bg-[#0d1117] border-[#30363d] text-white placeholder:text-[#4d5562] focus-visible:ring-[#f5b82e]/30 h-10 pl-9"
              />
            </div>
            <div className="max-h-40 overflow-y-auto schedule-scroll rounded-md border border-[#21262d] divide-y divide-[#21262d]">
              {clientesFiltrados.length === 0 ? (
                <p className="text-xs text-[#4d5562] text-center py-4">
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
                        ? "bg-[#f5b82e]/10"
                        : "hover:bg-[#21262d]",
                    )}
                  >
                    <div className="min-w-0">
                      <p className="text-sm text-white truncate">{c.name}</p>
                      <p className="text-[11px] text-[#4d5562] truncate">
                        {c.email}
                      </p>
                    </div>
                    {clientId === c.id && (
                      <Check className="size-3.5 text-[#f5b82e] shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#f5b82e]">
                Serviço
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger className="w-full">
                  <DropdownButton className="w-full h-10 px-3 rounded-md border border-[#30363d] bg-[#0d1117] text-sm text-white flex items-center justify-between gap-2 hover:border-[#f5b82e]/40 transition-colors cursor-pointer">
                    <div className="flex items-center gap-2 truncate">
                      {servico && (
                        <span
                          className="size-2 rounded-full shrink-0"
                          style={{ backgroundColor: servico.cor }}
                        />
                      )}
                      <span className="truncate text-sm">
                        {servico?.nome ?? "Selecione"}
                      </span>
                    </div>
                    <ChevronDown className="size-3.5 text-[#8b949e] shrink-0" />
                  </DropdownButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-[#161b22] border-[#30363d] text-white w-48">
                  {servicos.map((s) => (
                    <DropdownMenuItem
                      key={s.id}
                      onClick={() => setServicoId(s.id)}
                      className="text-xs hover:bg-[#21262d] cursor-pointer"
                    >
                      <span
                        className="size-2 rounded-full mr-2 shrink-0"
                        style={{ backgroundColor: s.cor }}
                      />
                      {s.nome}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#f5b82e]">
                Profissional
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger className="w-full">
                  <DropdownButton className="w-full h-10 px-3 rounded-md border border-[#30363d] bg-[#0d1117] text-sm text-white flex items-center justify-between gap-2 hover:border-[#f5b82e]/40 transition-colors cursor-pointer">
                    <span className="truncate text-sm">
                      {prof?.nome ?? "Selecione"}
                    </span>
                    <ChevronDown className="size-3.5 text-[#8b949e] shrink-0" />
                  </DropdownButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-[#161b22] border-[#30363d] text-white">
                  {profissionais.map((p) => (
                    <DropdownMenuItem
                      key={p.id}
                      onClick={() => setProfissionalId(p.id)}
                      className="text-xs hover:bg-[#21262d] cursor-pointer"
                    >
                      {p.nome}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#f5b82e]">
              Horário
            </label>
            <Input
              type="time"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              className="bg-[#0d1117] border-[#30363d] text-white focus-visible:ring-[#f5b82e]/30 h-10"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#8b949e]">
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
                      ? "bg-[#f5b82e]/15 border-[#f5b82e]/60 text-[#f5b82e]"
                      : "border-[#30363d] bg-[#0d1117] text-[#8b949e] hover:border-[#f5b82e]/30",
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

          <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-[#0d1117] border border-[#21262d]">
            <Timer className="size-3.5 text-[#f5b82e]" />
            <span className="text-xs text-[#8b949e]">Duração estimada:</span>
            <span className="text-xs font-bold text-white">{duracao} min</span>
            {servico && (
              <span className="text-xs text-[#4d5562] ml-auto">
                R$ {servico.preco.toFixed(2).replace(".", ",")}
              </span>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#8b949e]">
              Observação
            </label>
            <Textarea
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Opcional"
              className="bg-[#0d1117] border-[#30363d] text-white placeholder:text-[#4d5562] focus-visible:ring-[#f5b82e]/30 resize-none min-h-[70px]"
            />
          </div>
        </div>

        <div className="px-6 pb-6 pt-4 border-t border-[#21262d] flex justify-end gap-3">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-9 px-5 rounded-md border border-[#30363d] bg-transparent text-sm text-white hover:bg-[#21262d] transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={submitting}
            className="h-9 px-5 rounded-md text-sm font-bold bg-[#f5b82e] text-black hover:bg-[#d9a326] transition-colors disabled:opacity-60"
          >
            {submitting ? "Agendando…" : "Agendar"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
