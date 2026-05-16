"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Scissors,
  ChevronDown,
  User,
  UserCheck,
  Wifi,
  Filter,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  SERVICOS,
  PROFISSIONAIS,
  type Agendamento,
} from "@/mock/schedule";
import { getDuracao, minToTime } from "@/utils/schedule.utils";
import { DropdownButton } from "@/components/schedule/DropdownButton";

interface ModoListaProps {
  agendamentos: Agendamento[];
  onCardClick: (ag: Agendamento) => void;
}

export function ModoLista({ agendamentos, onCardClick }: ModoListaProps) {
  const [filtroServico, setFiltroServico] = useState("todos");
  const [filtroProf, setFiltroProf] = useState("todos");
  const [filtroOrigem, setFiltroOrigem] = useState("todos");
  const [busca, setBusca] = useState("");

  const filtrados = useMemo(() => {
    return agendamentos
      .filter((ag) => {
        if (filtroServico !== "todos" && ag.servicoId !== filtroServico)
          return false;
        if (filtroProf !== "todos" && ag.profissionalId !== filtroProf)
          return false;
        if (filtroOrigem !== "todos" && ag.origem !== filtroOrigem)
          return false;
        if (busca && !ag.cliente.toLowerCase().includes(busca.toLowerCase()))
          return false;
        return true;
      })
      .sort((a, b) => a.inicioMin - b.inicioMin);
  }, [agendamentos, filtroServico, filtroProf, filtroOrigem, busca]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center gap-2 px-4 md:px-6 py-3 border-b border-border-subtle shrink-0 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-[160px]">
          <Search className="size-3.5 text-text-subtle shrink-0" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar cliente..."
            className="flex-1 bg-transparent text-sm text-white placeholder:text-text-subtle outline-none min-w-0"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger>
            <DropdownButton className="h-8 px-3 rounded-md border border-border bg-surface-raised text-xs text-white flex items-center gap-1.5 cursor-pointer">
              <Scissors className="size-3 text-muted-foreground" />
              {filtroServico === "todos"
                ? "Todos serviços"
                : SERVICOS.find((s) => s.id === filtroServico)?.nome}
              <ChevronDown className="size-3 text-muted-foreground" />
            </DropdownButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-surface-raised border-border text-white">
            <DropdownMenuItem
              onClick={() => setFiltroServico("todos")}
              className="text-xs hover:bg-surface-elevated"
            >
              Todos
            </DropdownMenuItem>
            {SERVICOS.map((s) => (
              <DropdownMenuItem
                key={s.id}
                onClick={() => setFiltroServico(s.id)}
                className="text-xs hover:bg-surface-elevated"
              >
                <span className={cn("size-2 rounded-full mr-2", s.cor)} />
                {s.nome}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger>
            <DropdownButton className="h-8 px-3 rounded-md border border-border bg-surface-raised text-xs text-white flex items-center gap-1.5 cursor-pointer">
              <User className="size-3 text-muted-foreground" />
              {filtroProf === "todos"
                ? "Todos prof."
                : PROFISSIONAIS.find((p) => p.id === filtroProf)?.nome}
              <ChevronDown className="size-3 text-muted-foreground" />
            </DropdownButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-surface-raised border-border text-white">
            <DropdownMenuItem
              onClick={() => setFiltroProf("todos")}
              className="text-xs hover:bg-surface-elevated"
            >
              Todos
            </DropdownMenuItem>
            {PROFISSIONAIS.filter((p) => p.ativo).map((p) => (
              <DropdownMenuItem
                key={p.id}
                onClick={() => setFiltroProf(p.id)}
                className="text-xs hover:bg-surface-elevated"
              >
                {p.nome}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger>
            <DropdownButton className="h-8 px-3 rounded-md border border-border bg-surface-raised text-xs text-white flex items-center gap-1.5 cursor-pointer">
              {filtroOrigem === "todos"
                ? "Todas origens"
                : filtroOrigem === "online"
                  ? "Online"
                  : "Recepção"}
              <ChevronDown className="size-3 text-muted-foreground" />
            </DropdownButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-surface-raised border-border text-white">
            <DropdownMenuItem
              onClick={() => setFiltroOrigem("todos")}
              className="text-xs hover:bg-surface-elevated"
            >
              Todas
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setFiltroOrigem("recepcao")}
              className="text-xs hover:bg-surface-elevated"
            >
              Recepção
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setFiltroOrigem("online")}
              className="text-xs hover:bg-surface-elevated"
            >
              Online
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <span className="text-[11px] text-text-subtle ml-auto shrink-0">
          {filtrados.length} resultado{filtrados.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="flex-1 overflow-auto schedule-scroll px-4 md:px-6 py-4">
        {filtrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-text-subtle">
            <Filter className="size-8 mb-3 opacity-40" />
            <p className="text-sm">Nenhum agendamento encontrado.</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {filtrados.map((ag) => {
              const s = SERVICOS.find((sv) => sv.id === ag.servicoId)!;
              const p = PROFISSIONAIS.find(
                (pr) => pr.id === ag.profissionalId,
              )!;
              const d = getDuracao(ag);
              return (
                <button
                  key={ag.id}
                  type="button"
                  onClick={() => onCardClick(ag)}
                  className="w-full text-left rounded-lg border border-border-subtle bg-surface-raised hover:border-border hover:bg-surface-elevated transition-colors p-3 flex items-center gap-3"
                >
                  <div
                    className={cn(
                      "w-0.5 self-stretch rounded-full shrink-0",
                      s.cor,
                    )}
                  />
                  <div className="flex-1 grid grid-cols-4 gap-2 items-center min-w-0">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">
                        {ag.cliente}
                      </p>
                      {ag.telefone && (
                        <p className="text-xs text-text-subtle truncate">
                          {ag.telefone}
                        </p>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            "size-1.5 rounded-full shrink-0",
                            s.cor,
                          )}
                        />
                        <p className="text-xs text-muted-foreground truncate">
                          {s.nome}
                        </p>
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground truncate">
                        {p.nome}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 justify-end">
                      <span className="text-xs text-white font-mono">
                        {minToTime(ag.inicioMin)}
                      </span>
                      <span className="text-[10px] text-text-subtle">
                        {d}min
                      </span>
                      {ag.origem === "online" ? (
                        <Wifi className="size-3 text-text-subtle" />
                      ) : (
                        <UserCheck className="size-3 text-text-subtle" />
                      )}
                    </div>
                  </div>
                  <div className="text-xs font-bold text-emerald-400 shrink-0">
                    R$ {s.preco.toFixed(2)}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
