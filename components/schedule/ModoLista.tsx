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
      <div className="flex items-center gap-2 px-4 md:px-6 py-3 border-b border-[#21262d] shrink-0 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-[160px]">
          <Search className="size-3.5 text-[#4d5562] shrink-0" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar cliente..."
            className="flex-1 bg-transparent text-sm text-white placeholder:text-[#4d5562] outline-none min-w-0"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger>
            <DropdownButton className="h-8 px-3 rounded-md border border-[#30363d] bg-[#161b22] text-xs text-white flex items-center gap-1.5 cursor-pointer">
              <Scissors className="size-3 text-[#8b949e]" />
              {filtroServico === "todos"
                ? "Todos serviços"
                : servicoById.get(filtroServico)?.nome}
              <ChevronDown className="size-3 text-[#8b949e]" />
            </DropdownButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#161b22] border-[#30363d] text-white">
            <DropdownMenuItem
              onClick={() => setFiltroServico("todos")}
              className="text-xs hover:bg-[#21262d]"
            >
              Todos
            </DropdownMenuItem>
            {servicos.map((s) => (
              <DropdownMenuItem
                key={s.id}
                onClick={() => setFiltroServico(s.id)}
                className="text-xs hover:bg-[#21262d]"
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
            <DropdownButton className="h-8 px-3 rounded-md border border-[#30363d] bg-[#161b22] text-xs text-white flex items-center gap-1.5 cursor-pointer">
              <User className="size-3 text-[#8b949e]" />
              {filtroProf === "todos"
                ? "Todos prof."
                : profById.get(filtroProf)?.nome}
              <ChevronDown className="size-3 text-[#8b949e]" />
            </DropdownButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#161b22] border-[#30363d] text-white">
            <DropdownMenuItem
              onClick={() => setFiltroProf("todos")}
              className="text-xs hover:bg-[#21262d]"
            >
              Todos
            </DropdownMenuItem>
            {profissionais.map((p) => (
              <DropdownMenuItem
                key={p.id}
                onClick={() => setFiltroProf(p.id)}
                className="text-xs hover:bg-[#21262d]"
              >
                {p.nome}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger>
            <DropdownButton className="h-8 px-3 rounded-md border border-[#30363d] bg-[#161b22] text-xs text-white flex items-center gap-1.5 cursor-pointer">
              {filtroOrigem === "todos"
                ? "Todas origens"
                : filtroOrigem === "online"
                  ? "Online"
                  : "Recepção"}
              <ChevronDown className="size-3 text-[#8b949e]" />
            </DropdownButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#161b22] border-[#30363d] text-white">
            <DropdownMenuItem
              onClick={() => setFiltroOrigem("todos")}
              className="text-xs hover:bg-[#21262d]"
            >
              Todas
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setFiltroOrigem("recepcao")}
              className="text-xs hover:bg-[#21262d]"
            >
              Recepção
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setFiltroOrigem("online")}
              className="text-xs hover:bg-[#21262d]"
            >
              Online
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <span className="text-[11px] text-[#4d5562] ml-auto shrink-0">
          {filtrados.length} resultado{filtrados.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Tabela */}
      <div className="flex-1 overflow-auto schedule-scroll px-4 md:px-6 py-4">
        {filtrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#4d5562]">
            <Filter className="size-8 mb-3 opacity-40" />
            <p className="text-sm">Nenhum agendamento encontrado.</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {filtrados.map((ag) => {
              const s = servicoById.get(ag.servicoId);
              const p = profById.get(ag.profissionalId);
              if (!s) return null;
              return (
                <button
                  key={ag.id}
                  type="button"
                  onClick={() => onCardClick(ag)}
                  className="w-full text-left rounded-lg border border-[#21262d] bg-[#161b22] hover:border-[#30363d] hover:bg-[#1c2128] transition-colors p-3 flex items-center gap-3"
                >
                  <div
                    className="w-0.5 self-stretch rounded-full shrink-0"
                    style={{ backgroundColor: s.cor }}
                  />
                  <div className="flex-1 grid grid-cols-4 gap-2 items-center min-w-0">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">
                        {ag.cliente}
                      </p>
                      {ag.telefone && (
                        <p className="text-xs text-[#4d5562] truncate">
                          {ag.telefone}
                        </p>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="size-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: s.cor }}
                        />
                        <p className="text-xs text-[#8b949e] truncate">
                          {s.nome}
                        </p>
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-[#8b949e] truncate">
                        {p?.nome ?? "—"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 justify-end">
                      <span className="text-xs text-white font-mono">
                        {minToTime(ag.inicioMin)}
                      </span>
                      <span className="text-[10px] text-[#4d5562]">
                        {ag.duracao}min
                      </span>
                      {ag.origem === "online" ? (
                        <Wifi className="size-3 text-[#4d5562]" />
                      ) : (
                        <UserCheck className="size-3 text-[#4d5562]" />
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
