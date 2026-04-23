/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Upload,
  Building2,
  Users,
  Scissors,
  MapPin,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type TabKey = "empresa" | "filiais" | "profissionais" | "servicos";

type Filial = {
  id: string;
  nome: string;
  detalhes: string;
  status: "ativa" | "inativa";
};

type Profissional = {
  id: string;
  nome: string;
  especialidade: string;
  comissao: number;
  status: "ativo" | "inativo";
};

type Servico = {
  id: string;
  nome: string;
  categoria: string;
  duracao: number;
  preco: number;
  status: "ativo" | "inativo";
};

// ─── Mock ─────────────────────────────────────────────────────────────────────

const FILIAIS_MOCK: Filial[] = [
  {
    id: "f1",
    nome: "Matriz",
    detalhes: "Rua das Flores, 123 - Centro",
    status: "ativa",
  },
];

const PROFISSIONAIS_MOCK: Profissional[] = [
  {
    id: "p1",
    nome: "Carlos Barbeiro",
    especialidade: "Corte e Barba",
    comissao: 50,
    status: "ativo",
  },
  {
    id: "p2",
    nome: "Marcos Silva",
    especialidade: "Corte Masculino",
    comissao: 45,
    status: "ativo",
  },
];

const SERVICOS_MOCK: Servico[] = [
  {
    id: "s1",
    nome: "Barba",
    categoria: "—",
    duracao: 20,
    preco: 30,
    status: "ativo",
  },
  {
    id: "s2",
    nome: "Corte + Barba",
    categoria: "—",
    duracao: 50,
    preco: 65,
    status: "ativo",
  },
  {
    id: "s3",
    nome: "Corte Masculino",
    categoria: "—",
    duracao: 30,
    preco: 45,
    status: "ativo",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  {
    key: "empresa",
    label: "Empresa",
    icon: <Building2 className="size-3.5" />,
  },
  { key: "filiais", label: "Filiais", icon: <MapPin className="size-3.5" /> },
  {
    key: "profissionais",
    label: "Profissionais",
    icon: <Users className="size-3.5" />,
  },
  {
    key: "servicos",
    label: "Serviços",
    icon: <Scissors className="size-3.5" />,
  },
];

function gerarId() {
  return `_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

function StatusBadge({
  status,
}: {
  status: "ativo" | "ativa" | "inativo" | "inativa";
}) {
  const isActive = status === "ativo" || status === "ativa";
  return (
    <Badge
      className={cn(
        "text-[10px] font-semibold px-2 py-0.5 border",
        isActive
          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
          : "bg-[#30363d]/60 text-[#8b949e] border-[#30363d]",
      )}
    >
      {isActive
        ? status === "ativa"
          ? "Ativa"
          : "Ativo"
        : status === "inativa"
          ? "Inativa"
          : "Inativo"}
    </Badge>
  );
}

function FormLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="text-[10px] font-bold uppercase tracking-widest text-[#8b949e] flex items-center gap-1">
      {children}
      {required && <span className="text-[#f5b82e]">*</span>}
    </label>
  );
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );
}

// ─── Tab: Empresa ─────────────────────────────────────────────────────────────

function TabEmpresa() {
  const [nome, setNome] = useState("Barbearia do José");
  const [slug, setSlug] = useState("barbearia-do-jose");
  const [email, setEmail] = useState("jose@jose.com.br");
  const [telefone, setTelefone] = useState("(11) 98765-4321");
  const [endereco, setEndereco] = useState("Rua das Flores, 123 - Centro");
  const [cor, setCor] = useState("#D4A853");
  const [logo, setLogo] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setLogo(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = () => toast.success("Configurações salvas com sucesso!");

  return (
    <div className="max-w-lg space-y-5">
      <Card className="bg-[#161b22] border-[#30363d]">
        <CardContent className="p-5 space-y-5">
          {/* Logo + nome */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="size-16 rounded-xl bg-[#f5b82e]/20 border-2 border-dashed border-[#f5b82e]/30 flex items-center justify-center hover:border-[#f5b82e]/60 transition-colors overflow-hidden shrink-0"
            >
              {logo ? (
                <img
                  src={logo}
                  alt="logo"
                  className="size-16 object-cover rounded-xl"
                />
              ) : (
                <Building2 className="size-7 text-[#f5b82e]/60" />
              )}
            </button>
            <div>
              <p className="text-base font-bold text-white">{nome}</p>
              <p
                className="text-xs text-[#8b949e] mt-0.5 cursor-pointer hover:text-[#f5b82e] transition-colors"
                onClick={() => fileRef.current?.click()}
              >
                Clique no logo para alterar
              </p>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogo}
            />
          </div>

          {/* Campos */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <FormLabel>Nome</FormLabel>
              <Input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="bg-[#0d1117] border-[#30363d] text-white focus-visible:ring-[#f5b82e]/30 h-10"
              />
            </div>

            <div className="space-y-1.5">
              <FormLabel>Slug (URL)</FormLabel>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="bg-[#0d1117] border-[#30363d] text-white focus-visible:ring-[#f5b82e]/30 h-10"
              />
              <p className="text-[10px] text-[#4d5562]">
                smartmanos.com/c/{slug}
              </p>
            </div>

            <div className="space-y-1.5">
              <FormLabel>E-mail</FormLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#0d1117] border-[#30363d] text-white focus-visible:ring-[#f5b82e]/30 h-10"
              />
            </div>

            <div className="space-y-1.5">
              <FormLabel>Telefone</FormLabel>
              <Input
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                className="bg-[#0d1117] border-[#30363d] text-white focus-visible:ring-[#f5b82e]/30 h-10"
              />
            </div>

            <div className="space-y-1.5">
              <FormLabel>Endereço</FormLabel>
              <Input
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                className="bg-[#0d1117] border-[#30363d] text-white focus-visible:ring-[#f5b82e]/30 h-10"
              />
            </div>

            <div className="space-y-1.5">
              <FormLabel>Cor Primária</FormLabel>
              <div className="flex items-center gap-3">
                <div className="relative size-10 rounded-md overflow-hidden border border-[#30363d] shrink-0 cursor-pointer">
                  <input
                    type="color"
                    value={cor}
                    onChange={(e) => setCor(e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div
                    className="size-10 rounded-md"
                    style={{ backgroundColor: cor }}
                  />
                </div>
                <Input
                  value={cor}
                  onChange={(e) => setCor(e.target.value)}
                  className="bg-[#0d1117] border-[#30363d] text-white focus-visible:ring-[#f5b82e]/30 h-10 uppercase"
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="h-9 px-5 rounded-md text-sm font-bold bg-[#f5b82e] text-black hover:bg-[#d9a326] hover:shadow-[0_0_16px_rgba(245,184,46,0.3)] transition-all"
          >
            Salvar Alterações
          </button>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Dialog: Filial ───────────────────────────────────────────────────────────

function DialogFilial({
  open,
  onOpenChange,
  filial,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  filial: Filial | null;
  onSave: (f: Omit<Filial, "id">) => void;
}) {
  const [nome, setNome] = useState("");
  const [detalhes, setDetalhes] = useState("");
  const [status, setStatus] = useState<"ativa" | "inativa">("ativa");

  useState(() => {
    if (filial) {
      setNome(filial.nome);
      setDetalhes(filial.detalhes);
      setStatus(filial.status);
    } else {
      setNome("");
      setDetalhes("");
      setStatus("ativa");
    }
  });

  const handleSave = () => {
    if (!nome.trim()) {
      toast.error("Nome é obrigatório.");
      return;
    }
    onSave({ nome, detalhes, status });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#161b22] border border-[#30363d] text-white max-w-md p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-[#21262d]">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-bold">
              {filial ? "Editar Filial" : "Nova Filial"}
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
        <div className="px-6 py-5 space-y-4">
          <div className="space-y-1.5">
            <FormLabel required>Nome</FormLabel>
            <Input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Matriz"
              className="bg-[#0d1117] border-[#30363d] text-white placeholder:text-[#4d5562] focus-visible:ring-[#f5b82e]/30 h-10"
            />
          </div>
          <div className="space-y-1.5">
            <FormLabel>Detalhes / Endereço</FormLabel>
            <Input
              value={detalhes}
              onChange={(e) => setDetalhes(e.target.value)}
              placeholder="Rua, número..."
              className="bg-[#0d1117] border-[#30363d] text-white placeholder:text-[#4d5562] focus-visible:ring-[#f5b82e]/30 h-10"
            />
          </div>
          <div className="space-y-1.5">
            <FormLabel>Status</FormLabel>
            <div className="grid grid-cols-2 gap-2">
              {(["ativa", "inativa"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={cn(
                    "h-9 rounded-md border text-xs font-semibold transition-colors",
                    status === s
                      ? s === "ativa"
                        ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-400"
                        : "bg-[#30363d]/50 border-[#30363d] text-[#8b949e]"
                      : "border-[#30363d] bg-[#0d1117] text-[#4d5562] hover:border-[#f5b82e]/30",
                  )}
                >
                  {s === "ativa" ? "Ativa" : "Inativa"}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="px-6 pb-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-9 px-5 rounded-md border border-[#30363d] bg-transparent text-sm text-white hover:bg-[#21262d] transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="h-9 px-5 rounded-md text-sm font-bold bg-[#f5b82e] text-black hover:bg-[#d9a326] transition-colors"
          >
            {filial ? "Salvar" : "Criar Filial"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Tab: Filiais ─────────────────────────────────────────────────────────────

function TabFiliais() {
  const [filiais, setFiliais] = useState<Filial[]>(FILIAIS_MOCK);
  const [dialog, setDialog] = useState(false);
  const [editando, setEditando] = useState<Filial | null>(null);

  const handleSave = (dados: Omit<Filial, "id">) => {
    if (editando) {
      setFiliais((prev) =>
        prev.map((f) => (f.id === editando.id ? { ...f, ...dados } : f)),
      );
      toast.success("Filial atualizada.");
    } else {
      setFiliais((prev) => [...prev, { ...dados, id: gerarId() }]);
      toast.success("Filial criada.");
    }
  };

  return (
    <Card className="bg-[#161b22] border-[#30363d]">
      <CardContent className="p-0">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#21262d]">
          <h2 className="text-sm font-bold text-white">Filiais</h2>
          <button
            type="button"
            onClick={() => {
              setEditando(null);
              setDialog(true);
            }}
            className="h-9 px-4 rounded-md text-xs font-bold bg-[#f5b82e] text-black hover:bg-[#d9a326] transition-all flex items-center gap-1.5"
          >
            <Plus className="size-3.5" />
            Nova Filial
          </button>
        </div>

        <div className="divide-y divide-[#21262d]">
          {filiais.map((f) => (
            <div
              key={f.id}
              className="flex items-center justify-between px-5 py-4 hover:bg-[#21262d]/40 transition-colors"
            >
              <div>
                <p className="text-sm font-semibold text-white">{f.nome}</p>
                <p className="text-xs text-[#4d5562] mt-0.5">
                  {f.detalhes || "Sem detalhes"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={f.status} />
                <button
                  type="button"
                  onClick={() => {
                    setEditando(f);
                    setDialog(true);
                  }}
                  className="size-7 rounded-md border border-[#30363d] bg-[#0d1117] text-[#8b949e] flex items-center justify-center hover:border-[#f5b82e]/40 hover:text-[#f5b82e] transition-colors"
                >
                  <Pencil className="size-3" />
                </button>
              </div>
            </div>
          ))}
          {filiais.length === 0 && (
            <div className="px-5 py-12 text-center text-sm text-[#4d5562]">
              Nenhuma filial cadastrada.
            </div>
          )}
        </div>
      </CardContent>
      <DialogFilial
        open={dialog}
        onOpenChange={setDialog}
        filial={editando}
        onSave={handleSave}
      />
    </Card>
  );
}

// ─── Dialog: Profissional ─────────────────────────────────────────────────────

function DialogProfissional({
  open,
  onOpenChange,
  profissional,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  profissional: Profissional | null;
  onSave: (p: Omit<Profissional, "id">) => void;
}) {
  const [nome, setNome] = useState(profissional?.nome ?? "");
  const [especialidade, setEspecialidade] = useState(
    profissional?.especialidade ?? "",
  );
  const [comissao, setComissao] = useState(profissional?.comissao ?? 50);
  const [status, setStatus] = useState<"ativo" | "inativo">(
    profissional?.status ?? "ativo",
  );

  const handleSave = () => {
    if (!nome.trim()) {
      toast.error("Nome é obrigatório.");
      return;
    }
    onSave({ nome, especialidade, comissao, status });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#161b22] border border-[#30363d] text-white max-w-md p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-[#21262d]">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-bold">
              {profissional ? "Editar Profissional" : "Novo Profissional"}
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
        <div className="px-6 py-5 space-y-4">
          <div className="space-y-1.5">
            <FormLabel required>Nome</FormLabel>
            <Input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome completo"
              className="bg-[#0d1117] border-[#30363d] text-white placeholder:text-[#4d5562] focus-visible:ring-[#f5b82e]/30 h-10"
            />
          </div>
          <div className="space-y-1.5">
            <FormLabel>Especialidade</FormLabel>
            <Input
              value={especialidade}
              onChange={(e) => setEspecialidade(e.target.value)}
              placeholder="Ex: Corte e Barba"
              className="bg-[#0d1117] border-[#30363d] text-white placeholder:text-[#4d5562] focus-visible:ring-[#f5b82e]/30 h-10"
            />
          </div>
          <div className="space-y-1.5">
            <FormLabel>Comissão (%)</FormLabel>
            <Input
              type="number"
              value={comissao}
              onChange={(e) => setComissao(Number(e.target.value))}
              min={0}
              max={100}
              className="bg-[#0d1117] border-[#30363d] text-white focus-visible:ring-[#f5b82e]/30 h-10"
            />
          </div>
          <div className="space-y-1.5">
            <FormLabel>Status</FormLabel>
            <div className="grid grid-cols-2 gap-2">
              {(["ativo", "inativo"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={cn(
                    "h-9 rounded-md border text-xs font-semibold transition-colors",
                    status === s
                      ? s === "ativo"
                        ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-400"
                        : "bg-[#30363d]/50 border-[#30363d] text-[#8b949e]"
                      : "border-[#30363d] bg-[#0d1117] text-[#4d5562] hover:border-[#f5b82e]/30",
                  )}
                >
                  {s === "ativo" ? "Ativo" : "Inativo"}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="px-6 pb-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-9 px-5 rounded-md border border-[#30363d] bg-transparent text-sm text-white hover:bg-[#21262d] transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="h-9 px-5 rounded-md text-sm font-bold bg-[#f5b82e] text-black hover:bg-[#d9a326] transition-colors"
          >
            {profissional ? "Salvar" : "Criar Profissional"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Tab: Profissionais ───────────────────────────────────────────────────────

function TabProfissionais() {
  const [profissionais, setProfissionais] =
    useState<Profissional[]>(PROFISSIONAIS_MOCK);
  const [dialog, setDialog] = useState(false);
  const [editando, setEditando] = useState<Profissional | null>(null);

  const handleSave = (dados: Omit<Profissional, "id">) => {
    if (editando) {
      setProfissionais((prev) =>
        prev.map((p) => (p.id === editando.id ? { ...p, ...dados } : p)),
      );
      toast.success("Profissional atualizado.");
    } else {
      setProfissionais((prev) => [...prev, { ...dados, id: gerarId() }]);
      toast.success("Profissional criado.");
    }
  };

  return (
    <Card className="bg-[#161b22] border-[#30363d]">
      <CardContent className="p-0">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#21262d]">
          <h2 className="text-sm font-bold text-white">Profissionais</h2>
          <button
            type="button"
            onClick={() => {
              setEditando(null);
              setDialog(true);
            }}
            className="h-9 px-4 rounded-md text-xs font-bold bg-[#f5b82e] text-black hover:bg-[#d9a326] transition-all flex items-center gap-1.5"
          >
            <Plus className="size-3.5" />
            Novo
          </button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-[#30363d] hover:bg-transparent">
                {["Nome", "Especialidade", "Comissão", "Status", ""].map(
                  (h) => (
                    <TableHead
                      key={h}
                      className="text-[#8b949e] text-xs uppercase tracking-wider font-semibold px-5 py-3 h-auto"
                    >
                      {h}
                    </TableHead>
                  ),
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {profissionais.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-12 text-center text-sm text-[#4d5562]"
                  >
                    Nenhum profissional cadastrado.
                  </td>
                </tr>
              ) : (
                profissionais.map((p) => (
                  <TableRow
                    key={p.id}
                    className="border-[#30363d] hover:bg-[#21262d]/40 transition-colors"
                  >
                    <TableCell className="px-5 py-4 font-semibold text-white text-sm">
                      {p.nome}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-[#8b949e] text-sm">
                      {p.especialidade || "—"}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-[#f5b82e] font-semibold text-sm">
                      {p.comissao}%
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <StatusBadge status={p.status} />
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => {
                          setEditando(p);
                          setDialog(true);
                        }}
                        className="size-7 rounded-md border border-[#30363d] bg-[#0d1117] text-[#8b949e] flex items-center justify-center hover:border-[#f5b82e]/40 hover:text-[#f5b82e] transition-colors"
                      >
                        <Pencil className="size-3" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <DialogProfissional
        open={dialog}
        onOpenChange={setDialog}
        profissional={editando}
        onSave={handleSave}
      />
    </Card>
  );
}

// ─── Dialog: Serviço ──────────────────────────────────────────────────────────

function DialogServico({
  open,
  onOpenChange,
  servico,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  servico: Servico | null;
  onSave: (s: Omit<Servico, "id">) => void;
}) {
  const [nome, setNome] = useState(servico?.nome ?? "");
  const [categoria, setCategoria] = useState(servico?.categoria ?? "");
  const [duracao, setDuracao] = useState(servico?.duracao ?? 30);
  const [preco, setPreco] = useState(servico?.preco ?? 0);
  const [status, setStatus] = useState<"ativo" | "inativo">(
    servico?.status ?? "ativo",
  );

  const handleSave = () => {
    if (!nome.trim()) {
      toast.error("Nome é obrigatório.");
      return;
    }
    onSave({ nome, categoria, duracao, preco, status });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#161b22] border border-[#30363d] text-white max-w-md p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-[#21262d]">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-bold">
              {servico ? "Editar Serviço" : "Novo Serviço"}
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
        <div className="px-6 py-5 space-y-4">
          <div className="space-y-1.5">
            <FormLabel required>Nome</FormLabel>
            <Input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Corte Masculino"
              className="bg-[#0d1117] border-[#30363d] text-white placeholder:text-[#4d5562] focus-visible:ring-[#f5b82e]/30 h-10"
            />
          </div>
          <div className="space-y-1.5">
            <FormLabel>Categoria</FormLabel>
            <Input
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              placeholder="Ex: Cabelo"
              className="bg-[#0d1117] border-[#30363d] text-white placeholder:text-[#4d5562] focus-visible:ring-[#f5b82e]/30 h-10"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <FormLabel>Duração (min)</FormLabel>
              <Input
                type="number"
                value={duracao}
                onChange={(e) => setDuracao(Number(e.target.value))}
                min={5}
                className="bg-[#0d1117] border-[#30363d] text-white focus-visible:ring-[#f5b82e]/30 h-10"
              />
            </div>
            <div className="space-y-1.5">
              <FormLabel>Preço (R$)</FormLabel>
              <Input
                type="number"
                value={preco}
                onChange={(e) => setPreco(Number(e.target.value))}
                min={0}
                step={0.01}
                className="bg-[#0d1117] border-[#30363d] text-white focus-visible:ring-[#f5b82e]/30 h-10"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <FormLabel>Status</FormLabel>
            <div className="grid grid-cols-2 gap-2">
              {(["ativo", "inativo"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={cn(
                    "h-9 rounded-md border text-xs font-semibold transition-colors",
                    status === s
                      ? s === "ativo"
                        ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-400"
                        : "bg-[#30363d]/50 border-[#30363d] text-[#8b949e]"
                      : "border-[#30363d] bg-[#0d1117] text-[#4d5562] hover:border-[#f5b82e]/30",
                  )}
                >
                  {s === "ativo" ? "Ativo" : "Inativo"}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="px-6 pb-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-9 px-5 rounded-md border border-[#30363d] bg-transparent text-sm text-white hover:bg-[#21262d] transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="h-9 px-5 rounded-md text-sm font-bold bg-[#f5b82e] text-black hover:bg-[#d9a326] transition-colors"
          >
            {servico ? "Salvar" : "Criar Serviço"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Tab: Serviços ────────────────────────────────────────────────────────────

function TabServicos() {
  const [servicos, setServicos] = useState<Servico[]>(SERVICOS_MOCK);
  const [dialog, setDialog] = useState(false);
  const [editando, setEditando] = useState<Servico | null>(null);

  const handleSave = (dados: Omit<Servico, "id">) => {
    if (editando) {
      setServicos((prev) =>
        prev.map((s) => (s.id === editando.id ? { ...s, ...dados } : s)),
      );
      toast.success("Serviço atualizado.");
    } else {
      setServicos((prev) => [...prev, { ...dados, id: gerarId() }]);
      toast.success("Serviço criado.");
    }
  };

  return (
    <Card className="bg-[#161b22] border-[#30363d]">
      <CardContent className="p-0">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#21262d]">
          <h2 className="text-sm font-bold text-white">Serviços</h2>
          <button
            type="button"
            onClick={() => {
              setEditando(null);
              setDialog(true);
            }}
            className="h-9 px-4 rounded-md text-xs font-bold bg-[#f5b82e] text-black hover:bg-[#d9a326] transition-all flex items-center gap-1.5"
          >
            <Plus className="size-3.5" />
            Novo Serviço
          </button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-[#30363d] hover:bg-transparent">
                {["Serviço", "Categoria", "Duração", "Preço", "Status", ""].map(
                  (h) => (
                    <TableHead
                      key={h}
                      className="text-[#8b949e] text-xs uppercase tracking-wider font-semibold px-5 py-3 h-auto"
                    >
                      {h}
                    </TableHead>
                  ),
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {servicos.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center text-sm text-[#4d5562]"
                  >
                    Nenhum serviço cadastrado.
                  </td>
                </tr>
              ) : (
                servicos.map((s) => (
                  <TableRow
                    key={s.id}
                    className="border-[#30363d] hover:bg-[#21262d]/40 transition-colors"
                  >
                    <TableCell className="px-5 py-4 font-semibold text-white text-sm">
                      {s.nome}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-[#8b949e] text-sm">
                      {s.categoria || "—"}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-[#8b949e] text-sm">
                      {s.duracao} min
                    </TableCell>
                    <TableCell className="px-5 py-4 text-[#f5b82e] font-semibold text-sm">
                      R$ {s.preco.toFixed(2).replace(".", ",")}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <StatusBadge status={s.status} />
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => {
                          setEditando(s);
                          setDialog(true);
                        }}
                        className="size-7 rounded-md border border-[#30363d] bg-[#0d1117] text-[#8b949e] flex items-center justify-center hover:border-[#f5b82e]/40 hover:text-[#f5b82e] transition-colors"
                      >
                        <Pencil className="size-3" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <DialogServico
        open={dialog}
        onOpenChange={setDialog}
        servico={editando}
        onSave={handleSave}
      />
    </Card>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("empresa");

  return (
    <div className="space-y-6 p-4 md:p-6 bg-[#0d1117] min-h-screen text-white">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Configurações
        </h1>
        <p className="text-[#8b949e] text-sm mt-1">
          Configurações gerais do sistema
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-4 py-2 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5",
              activeTab === tab.key
                ? "bg-[#f5b82e] text-black"
                : "text-[#8b949e] hover:text-white hover:bg-[#21262d]",
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Conteúdo */}
      {activeTab === "empresa" && <TabEmpresa />}
      {activeTab === "filiais" && <TabFiliais />}
      {activeTab === "profissionais" && <TabProfissionais />}
      {activeTab === "servicos" && <TabServicos />}
    </div>
  );
}
