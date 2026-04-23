/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  Shield,
  ChevronDown,
  ChevronRight,
  Check,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Permissao = {
  key: string;
  label: string;
};

type ModuloPermissao = {
  key: string;
  label: string;
  permissoes: Permissao[];
};

type Grupo = {
  id: string;
  nome: string;
  permissoes: Set<string>;
};

// ─── Módulos e permissões ─────────────────────────────────────────────────────

const MODULOS: ModuloPermissao[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    permissoes: [{ key: "dashboard.ver", label: "Visualizar dashboard" }],
  },
  {
    key: "agenda",
    label: "Agenda",
    permissoes: [
      { key: "agenda.ver", label: "Visualizar agenda" },
      { key: "agenda.criar", label: "Criar agendamentos" },
      { key: "agenda.editar", label: "Editar agendamentos" },
      { key: "agenda.excluir", label: "Excluir agendamentos" },
    ],
  },
  {
    key: "clientes",
    label: "Clientes",
    permissoes: [
      { key: "clientes.ver", label: "Visualizar clientes" },
      { key: "clientes.criar", label: "Cadastrar clientes" },
      { key: "clientes.editar", label: "Editar clientes" },
      { key: "clientes.excluir", label: "Excluir clientes" },
    ],
  },
  {
    key: "financeiro",
    label: "Financeiro",
    permissoes: [
      { key: "financeiro.ver", label: "Visualizar financeiro" },
      { key: "financeiro.criar", label: "Criar lançamentos" },
      { key: "financeiro.editar", label: "Editar lançamentos" },
    ],
  },
  {
    key: "caixa",
    label: "Caixa",
    permissoes: [
      { key: "caixa.ver", label: "Visualizar caixa" },
      { key: "caixa.abrir", label: "Abrir caixa" },
      { key: "caixa.fechar", label: "Fechar caixa" },
      { key: "caixa.movimentar", label: "Registrar movimentações" },
    ],
  },
  {
    key: "estoque",
    label: "Estoque",
    permissoes: [
      { key: "estoque.ver", label: "Visualizar estoque" },
      { key: "estoque.movimentar", label: "Registrar movimentações" },
    ],
  },
  {
    key: "assinaturas",
    label: "Assinaturas",
    permissoes: [
      { key: "assinaturas.ver", label: "Visualizar assinaturas" },
      { key: "assinaturas.gerenciar", label: "Gerenciar assinaturas" },
    ],
  },
  {
    key: "relatorios",
    label: "Relatórios",
    permissoes: [
      { key: "relatorios.ver", label: "Visualizar relatórios" },
      { key: "relatorios.exportar", label: "Exportar relatórios" },
    ],
  },
  {
    key: "configuracoes",
    label: "Configurações",
    permissoes: [
      { key: "config.empresa", label: "Editar dados da empresa" },
      { key: "config.filiais", label: "Gerenciar filiais" },
      { key: "config.profissionais", label: "Gerenciar profissionais" },
      { key: "config.servicos", label: "Gerenciar serviços" },
    ],
  },
];

// ─── Mock ─────────────────────────────────────────────────────────────────────

const GRUPOS_MOCK: Grupo[] = [
  {
    id: "g1",
    nome: "Administrador",
    permissoes: new Set(MODULOS.flatMap((m) => m.permissoes.map((p) => p.key))),
  },
  {
    id: "g2",
    nome: "Recepcionista",
    permissoes: new Set([
      "dashboard.ver",
      "agenda.ver",
      "agenda.criar",
      "agenda.editar",
      "clientes.ver",
      "clientes.criar",
      "clientes.editar",
    ]),
  },
  { id: "g3", nome: "teste", permissoes: new Set() },
];

// ─── ModuloRow ────────────────────────────────────────────────────────────────

function ModuloRow({
  modulo,
  permissoes,
  onChange,
}: {
  modulo: ModuloPermissao;
  permissoes: Set<string>;
  onChange: (key: string, val: boolean) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const total = modulo.permissoes.length;
  const marcados = modulo.permissoes.filter((p) =>
    permissoes.has(p.key),
  ).length;
  const allChecked = marcados === total;
  const someChecked = marcados > 0 && marcados < total;

  const toggleAll = () => {
    const newVal = !allChecked;
    modulo.permissoes.forEach((p) => onChange(p.key, newVal));
  };

  return (
    <div className="border border-[#21262d] rounded-lg overflow-hidden">
      <div
        className="flex items-center justify-between px-4 py-3 bg-[#0d1117] cursor-pointer hover:bg-[#21262d]/40 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleAll();
            }}
            className={cn(
              "size-5 rounded border flex items-center justify-center transition-colors shrink-0",
              allChecked
                ? "bg-[#f5b82e] border-[#f5b82e]"
                : someChecked
                  ? "bg-[#f5b82e]/30 border-[#f5b82e]/50"
                  : "border-[#30363d] bg-transparent hover:border-[#f5b82e]/40",
            )}
          >
            {allChecked && <Check className="size-3 text-black" />}
            {someChecked && !allChecked && (
              <div className="size-2 rounded-sm bg-[#f5b82e]" />
            )}
          </button>
          <span className="text-sm font-semibold text-white">
            {modulo.label}
          </span>
          <span className="text-[10px] text-[#4d5562]">
            {marcados}/{total}
          </span>
        </div>
        {expanded ? (
          <ChevronDown className="size-3.5 text-[#4d5562]" />
        ) : (
          <ChevronRight className="size-3.5 text-[#4d5562]" />
        )}
      </div>

      {expanded && (
        <div className="px-4 py-3 space-y-2.5 bg-[#161b22]">
          {modulo.permissoes.map((perm) => (
            <div key={perm.key} className="flex items-center gap-3">
              <Checkbox
                id={perm.key}
                checked={permissoes.has(perm.key)}
                onCheckedChange={(v) => onChange(perm.key, !!v)}
                className="border-[#30363d] data-[state=checked]:bg-[#f5b82e] data-[state=checked]:border-[#f5b82e] data-[state=checked]:text-black"
              />
              <label
                htmlFor={perm.key}
                className="text-xs text-[#8b949e] cursor-pointer select-none hover:text-white transition-colors"
              >
                {perm.label}
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function ControleAcessoPage() {
  const [grupos, setGrupos] = useState<Grupo[]>(GRUPOS_MOCK);
  const [grupoAtivo, setGrupoAtivo] = useState<string | null>(null);
  const [novoNome, setNovoNome] = useState("");

  const grupoSelecionado = grupos.find((g) => g.id === grupoAtivo) ?? null;

  const handleCriarGrupo = () => {
    if (!novoNome.trim()) return;
    const novo: Grupo = {
      id: `g_${Date.now()}`,
      nome: novoNome.trim(),
      permissoes: new Set(),
    };
    setGrupos((prev) => [...prev, novo]);
    setNovoNome("");
    setGrupoAtivo(novo.id);
    toast.success(`Grupo "${novo.nome}" criado.`);
  };

  const handleDeletarGrupo = (id: string) => {
    setGrupos((prev) => prev.filter((g) => g.id !== id));
    if (grupoAtivo === id) setGrupoAtivo(null);
    toast.success("Grupo removido.");
  };

  const handleTogglePermissao = (key: string, val: boolean) => {
    if (!grupoAtivo) return;
    setGrupos((prev) =>
      prev.map((g) => {
        if (g.id !== grupoAtivo) return g;
        const novas = new Set(g.permissoes);
        val ? novas.add(key) : novas.delete(key);
        return { ...g, permissoes: novas };
      }),
    );
  };

  const handleSalvar = () => {
    toast.success(`Permissões de "${grupoSelecionado?.nome}" salvas.`);
  };

  return (
    <div className="space-y-6 p-4 md:p-6 bg-[#0d1117] min-h-screen text-white">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Controle de Acesso
        </h1>
        <p className="text-[#8b949e] text-sm mt-1">
          Gerencie grupos e permissões por área do sistema
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ── Painel de grupos ── */}
        <Card className="bg-[#161b22] border-[#30363d] lg:col-span-1">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="size-4 text-[#f5b82e]" />
              <h2 className="text-sm font-bold text-white">Grupos</h2>
            </div>

            {/* Input novo grupo */}
            <div className="flex gap-2">
              <Input
                value={novoNome}
                onChange={(e) => setNovoNome(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCriarGrupo()}
                placeholder="Nome do grupo"
                className="bg-[#0d1117] border-[#30363d] text-white placeholder:text-[#4d5562] focus-visible:ring-[#f5b82e]/30 h-9 text-sm"
              />
              <button
                type="button"
                onClick={handleCriarGrupo}
                className="size-9 rounded-md bg-[#f5b82e] text-black flex items-center justify-center hover:bg-[#d9a326] transition-colors shrink-0"
              >
                <Plus className="size-4" />
              </button>
            </div>

            {/* Lista de grupos */}
            <div className="space-y-1">
              {grupos.map((g) => (
                <div
                  key={g.id}
                  className={cn(
                    "flex items-center justify-between px-3 py-2.5 rounded-md cursor-pointer transition-colors group",
                    grupoAtivo === g.id
                      ? "bg-[#f5b82e]/10 border border-[#f5b82e]/30"
                      : "hover:bg-[#21262d] border border-transparent",
                  )}
                  onClick={() => setGrupoAtivo(g.id)}
                >
                  <span
                    className={cn(
                      "text-sm font-medium transition-colors",
                      grupoAtivo === g.id ? "text-[#f5b82e]" : "text-white",
                    )}
                  >
                    {g.nome}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletarGrupo(g.id);
                    }}
                    className="size-6 rounded flex items-center justify-center text-[#4d5562] hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
              ))}
              {grupos.length === 0 && (
                <p className="text-xs text-[#4d5562] text-center py-4">
                  Nenhum grupo criado.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ── Painel de permissões ── */}
        <Card className="bg-[#161b22] border-[#30363d] lg:col-span-2">
          <CardContent className="p-4">
            {!grupoSelecionado ? (
              <div className="flex flex-col items-center justify-center h-64 gap-3 text-[#4d5562]">
                <Shield className="size-10 opacity-30" />
                <p className="text-sm">
                  Selecione um grupo à esquerda para configurar permissões
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-white">
                      {grupoSelecionado.nome}
                    </h2>
                    <p className="text-[11px] text-[#4d5562] mt-0.5">
                      {grupoSelecionado.permissoes.size} permissão(ões) ativa(s)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSalvar}
                    className="h-9 px-4 rounded-md text-xs font-bold bg-[#f5b82e] text-black hover:bg-[#d9a326] hover:shadow-[0_0_16px_rgba(245,184,46,0.3)] transition-all"
                  >
                    Salvar permissões
                  </button>
                </div>

                <div
                  className="space-y-3 max-h-[60vh] overflow-y-auto pr-1"
                  style={{
                    scrollbarWidth: "thin",
                    scrollbarColor: "#30363d transparent",
                  }}
                >
                  {MODULOS.map((modulo) => (
                    <ModuloRow
                      key={modulo.key}
                      modulo={modulo}
                      permissoes={grupoSelecionado.permissoes}
                      onChange={handleTogglePermissao}
                    />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
