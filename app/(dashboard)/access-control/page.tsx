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
import { PageHeader } from "@/components/shared";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Permissao {
  key: string;
  label: string;
}

interface ModuloPermissao {
  key: string;
  label: string;
  permissoes: Permissao[];
}

interface Grupo {
  id: string;
  nome: string;
  permissoes: Set<string>;
}

// ─── Módulos ──────────────────────────────────────────────────────────────────

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

interface ModuloRowProps {
  modulo: ModuloPermissao;
  permissoes: Set<string>;
  onChange: (key: string, val: boolean) => void;
}

function ModuloRow({ modulo, permissoes, onChange }: ModuloRowProps) {
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
    <div className="border border-border-subtle rounded-lg overflow-hidden">
      <div
        className="flex items-center justify-between px-4 py-3 bg-surface-base cursor-pointer hover:bg-surface-elevated/40 transition-colors"
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
                ? "bg-brand border-brand"
                : someChecked
                  ? "bg-brand/30 border-brand/50"
                  : "border-border bg-transparent hover:border-brand/40",
            )}
          >
            {allChecked && (
              <Check className="size-3 text-brand-foreground" />
            )}
            {someChecked && !allChecked && (
              <div className="size-2 rounded-sm bg-brand" />
            )}
          </button>
          <span className="text-sm font-semibold text-foreground">
            {modulo.label}
          </span>
          <span className="text-[10px] text-text-subtle">
            {marcados}/{total}
          </span>
        </div>
        {expanded ? (
          <ChevronDown className="size-3.5 text-text-subtle" />
        ) : (
          <ChevronRight className="size-3.5 text-text-subtle" />
        )}
      </div>

      {expanded && (
        <div className="px-4 py-3 space-y-2.5 bg-surface-raised">
          {modulo.permissoes.map((perm) => (
            <div key={perm.key} className="flex items-center gap-3">
              <Checkbox
                id={perm.key}
                checked={permissoes.has(perm.key)}
                onCheckedChange={(v) => onChange(perm.key, !!v)}
                className="border-border data-[state=checked]:bg-brand data-[state=checked]:border-brand data-[state=checked]:text-brand-foreground"
              />
              <label
                htmlFor={perm.key}
                className="text-xs text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors"
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
        if (val) novas.add(key);
        else novas.delete(key);
        return { ...g, permissoes: novas };
      }),
    );
  };

  const handleSalvar = () => {
    toast.success(`Permissões de "${grupoSelecionado?.nome}" salvas.`);
  };

  return (
    <div className="space-y-6 p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
      <PageHeader
        title="Controle de Acesso"
        subtitle="Gerencie grupos e permissões por área do sistema"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Painel de grupos */}
        <Card className="bg-surface-raised border-border lg:col-span-1">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="size-4 text-brand" />
              <h2 className="text-sm font-bold text-foreground">Grupos</h2>
            </div>

            <div className="flex gap-2">
              <Input
                value={novoNome}
                onChange={(e) => setNovoNome(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCriarGrupo()}
                placeholder="Nome do grupo"
                className="bg-surface-base border-border text-foreground placeholder:text-text-subtle focus-visible:ring-brand/30 h-9 text-sm"
              />
              <button
                type="button"
                onClick={handleCriarGrupo}
                className="size-9 rounded-md bg-brand text-brand-foreground flex items-center justify-center hover:bg-brand-hover transition-colors shrink-0"
              >
                <Plus className="size-4" />
              </button>
            </div>

            <div className="space-y-1">
              {grupos.map((g) => (
                <div
                  key={g.id}
                  className={cn(
                    "flex items-center justify-between px-3 py-2.5 rounded-md cursor-pointer transition-colors group",
                    grupoAtivo === g.id
                      ? "bg-brand/10 border border-brand/30"
                      : "hover:bg-surface-elevated border border-transparent",
                  )}
                  onClick={() => setGrupoAtivo(g.id)}
                >
                  <span
                    className={cn(
                      "text-sm font-medium transition-colors",
                      grupoAtivo === g.id ? "text-brand" : "text-foreground",
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
                    className="size-6 rounded flex items-center justify-center text-text-subtle hover:text-danger-foreground hover:bg-danger/10 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
              ))}
              {grupos.length === 0 && (
                <p className="text-xs text-text-subtle text-center py-4">
                  Nenhum grupo criado.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Painel de permissões */}
        <Card className="bg-surface-raised border-border lg:col-span-2">
          <CardContent className="p-4">
            {!grupoSelecionado ? (
              <div className="flex flex-col items-center justify-center h-64 gap-3 text-text-subtle">
                <Shield className="size-10 opacity-30" />
                <p className="text-sm">
                  Selecione um grupo à esquerda para configurar permissões
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-foreground">
                      {grupoSelecionado.nome}
                    </h2>
                    <p className="text-[11px] text-text-subtle mt-0.5">
                      {grupoSelecionado.permissoes.size} permissão(ões)
                      ativa(s)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSalvar}
                    className="h-9 px-4 rounded-md text-xs font-bold bg-brand text-brand-foreground hover:bg-brand-hover hover:shadow-[0_0_16px_rgba(245,184,46,0.3)] transition-all"
                  >
                    Salvar permissões
                  </button>
                </div>

                <div
                  className="space-y-3 max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin"
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
