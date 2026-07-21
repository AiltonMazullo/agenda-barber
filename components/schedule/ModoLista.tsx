"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Scissors,
  ChevronDown,
  User,
  Wifi,
  UserCheck,
  Filter,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DropdownButton } from "./Primitives";
import { minToTime } from "./helpers";
import { STATUS_COR, STATUS_ROTULO } from "./status";
import { AgendamentoIcones } from "./AgendamentoIcones";
import type {
  AgendamentoVM,
  ProfissionalVM,
  ServicoVM,
} from "./types";

export function ModoLista({
  agendamentos,
  servicos,
  profissionais,
  servicoById,
  profById,
  onCardClick,
}: {
  agendamentos: AgendamentoVM[];
  servicos: ServicoVM[];
  profissionais: ProfissionalVM[];
  servicoById: Map<string, ServicoVM>;
  profById: Map<string, ProfissionalVM>;
  onCardClick: (ag: AgendamentoVM) => void;
}) {
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
      {/* Filtros */}
      <div className="flex items-center gap-2 px-4 md:px-6 py-3 border-b border-border-subtle shrink-0 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-[160px]">
          <Search className="size-3.5 text-text-faint shrink-0" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar cliente..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-text-faint outline-none min-w-0"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger>
            <DropdownButton className="h-8 px-3 rounded-md border border-border bg-surface-raised text-xs text-foreground flex items-center gap-1.5 cursor-pointer">
              <Scissors className="size-3 text-muted-foreground" />
              {filtroServico === "todos"
                ? "Todos serviços"
                : servicoById.get(filtroServico)?.nome}
              <ChevronDown className="size-3 text-muted-foreground" />
            </DropdownButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-surface-raised border-border text-foreground">
            <DropdownMenuItem
              onClick={() => setFiltroServico("todos")}
              className="text-xs hover:bg-surface-elevated"
            >
              Todos
            </DropdownMenuItem>
            {servicos.map((s) => (
              <DropdownMenuItem
                key={s.id}
                onClick={() => setFiltroServico(s.id)}
                className="text-xs hover:bg-surface-elevated"
              >
                <span
                  className="size-2 rounded-full mr-2"
                  style={{ backgroundColor: s.cor }}
                />
                {s.nome}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger>
            <DropdownButton className="h-8 px-3 rounded-md border border-border bg-surface-raised text-xs text-foreground flex items-center gap-1.5 cursor-pointer">
              <User className="size-3 text-muted-foreground" />
              {filtroProf === "todos"
                ? "Todos prof."
                : profById.get(filtroProf)?.nome}
              <ChevronDown className="size-3 text-muted-foreground" />
            </DropdownButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-surface-raised border-border text-foreground">
            <DropdownMenuItem
              onClick={() => setFiltroProf("todos")}
              className="text-xs hover:bg-surface-elevated"
            >
              Todos
            </DropdownMenuItem>
            {profissionais.map((p) => (
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
            <DropdownButton className="h-8 px-3 rounded-md border border-border bg-surface-raised text-xs text-foreground flex items-center gap-1.5 cursor-pointer">
              {filtroOrigem === "todos"
                ? "Todas origens"
                : filtroOrigem === "online"
                  ? "Online"
                  : "Recepção"}
              <ChevronDown className="size-3 text-muted-foreground" />
            </DropdownButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-surface-raised border-border text-foreground">
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

        <span className="text-[11px] text-text-faint ml-auto shrink-0">
          {filtrados.length} resultado{filtrados.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Tabela */}
      <div className="flex-1 overflow-auto schedule-scroll px-4 md:px-6 py-4">
        {filtrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-text-faint">
            <Filter className="size-8 mb-3 opacity-40" />
            <p className="text-sm">Nenhum agendamento encontrado.</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {filtrados.map((ag) => {
              const s = servicoById.get(ag.servicoId);
              if (!s) return null;
              return (
                <button
                  key={ag.id}
                  type="button"
                  onClick={() => onCardClick(ag)}
                  className="w-full text-left rounded-lg border border-border-subtle bg-surface-raised hover:border-border hover:bg-surface-elevated transition-colors p-3 flex items-center gap-3"
                >
                  <div
                    className="w-0.5 self-stretch rounded-full shrink-0"
                    style={{ backgroundColor: s.cor }}
                  />
                  <div className="flex-1 grid grid-cols-4 gap-2 items-center min-w-0">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {ag.cliente}
                      </p>
                      {ag.telefone && (
                        <p className="text-xs text-text-faint truncate">
                          {ag.telefone}
                        </p>
                      )}
                      <div className="mt-1">
                        <AgendamentoIcones agendamento={ag} iconClassName="size-3" />
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="size-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: s.cor }}
                        />
                        <p className="text-xs text-muted-foreground truncate">
                          {s.nome}
                        </p>
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground truncate">
                        {ag.profissionalNome}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 justify-end">
                      <span className="text-xs text-foreground font-mono">
                        {minToTime(ag.inicioMin)}
                      </span>
                      <span className="text-[10px] text-text-faint">
                        {ag.duracao}min
                      </span>
                      {ag.origem === "online" ? (
                        <Wifi className="size-3 text-text-faint" />
                      ) : (
                        <UserCheck className="size-3 text-text-faint" />
                      )}
                    </div>
                  </div>
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0"
                    style={{
                      backgroundColor: `${STATUS_COR[ag.status]}22`,
                      color: STATUS_COR[ag.status],
                    }}
                  >
                    {STATUS_ROTULO[ag.status]}
                  </span>
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
