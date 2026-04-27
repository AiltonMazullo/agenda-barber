/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback } from "react";
import {
  Plus,
  Search,
  Download,
  ChevronDown,
  X,
  User,
  Trash2,
  ShoppingCart,
  FileText,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type StatusComanda = "aberta" | "paga" | "cancelada";

type ItemComanda = {
  id: string;
  tipo: "servico" | "produto";
  nome: string;
  preco: number;
  qtd: number;
};

type Comanda = {
  id: string;
  numero: string;
  cliente: string;
  profissional: string;
  filial: string;
  itens: ItemComanda[];
  status: StatusComanda;
  data: string;
  total: number;
  observacoes: string;
};

// ─── Mock ─────────────────────────────────────────────────────────────────────

const SERVICOS_MOCK = [
  { id: "s1", nome: "Corte Masculino", preco: 45 },
  { id: "s2", nome: "Barba", preco: 30 },
  { id: "s3", nome: "Corte + Barba", preco: 65 },
  { id: "s4", nome: "Sobrancelha", preco: 15 },
];

const PRODUTOS_MOCK = [
  { id: "p1", nome: "Pomada Modeladora", preco: 35 },
  { id: "p2", nome: "Shampoo Antiqueda", preco: 40 },
  { id: "p3", nome: "Óleo de Barba", preco: 45 },
];

const PROFISSIONAIS_MOCK = ["Nenhum", "Carlos", "Marcos", "Rafael", "Diego"];
const FILIAIS_MOCK = ["Nenhuma", "Matriz", "Filial Norte", "Filial Sul"];
const CLIENTES_BUSCA = [
  "João Silva",
  "Ana Costa",
  "Pedro Lima",
  "Bruno Alves",
  "Fábio Neto",
];

const COMANDAS_MOCK: Comanda[] = [
  {
    id: "c1",
    numero: "#001",
    cliente: "João Silva",
    profissional: "Carlos",
    filial: "Matriz",
    itens: [
      { id: "i1", tipo: "servico", nome: "Corte Masculino", preco: 45, qtd: 1 },
    ],
    status: "aberta",
    data: "27/04/2026",
    total: 45,
    observacoes: "",
  },
  {
    id: "c2",
    numero: "#002",
    cliente: "Ana Costa",
    profissional: "Marcos",
    filial: "Matriz",
    itens: [
      { id: "i2", tipo: "servico", nome: "Corte + Barba", preco: 65, qtd: 1 },
      {
        id: "i3",
        tipo: "produto",
        nome: "Pomada Modeladora",
        preco: 35,
        qtd: 1,
      },
    ],
    status: "paga",
    data: "26/04/2026",
    total: 100,
    observacoes: "",
  },
  {
    id: "c3",
    numero: "#003",
    cliente: "Pedro Lima",
    profissional: "Rafael",
    filial: "Filial Norte",
    itens: [{ id: "i4", tipo: "servico", nome: "Barba", preco: 30, qtd: 1 }],
    status: "cancelada",
    data: "25/04/2026",
    total: 30,
    observacoes: "Cliente cancelou",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBRL(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function gerarId() {
  return `_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
}

function StatusBadge({ status }: { status: StatusComanda }) {
  const map = {
    aberta: "bg-[#f5b82e]/15 text-[#f5b82e] border-[#f5b82e]/30",
    paga: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    cancelada: "bg-red-500/15 text-red-400 border-red-500/30",
  };
  const label = { aberta: "Aberta", paga: "Paga", cancelada: "Cancelada" };
  return (
    <Badge
      className={cn(
        "text-[10px] font-semibold px-2 py-0.5 border",
        map[status],
      )}
    >
      {label[status]}
    </Badge>
  );
}

// ─── SelectInline ─────────────────────────────────────────────────────────────

function SelectInline({
  value,
  options,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div
          role="button"
          tabIndex={0}
          className={cn(
            "h-10 px-3 rounded-md border border-[#30363d] bg-[#0d1117] text-sm text-white flex items-center justify-between gap-2 hover:border-[#f5b82e]/40 transition-colors cursor-pointer",
            className,
          )}
        >
          <span className={value ? "text-white" : "text-[#4d5562]"}>
            {value || placeholder || "Selecionar"}
          </span>
          <ChevronDown className="size-3.5 text-[#8b949e] shrink-0" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-[#161b22] border-[#30363d] text-white max-h-48 overflow-y-auto">
        {options.map((opt) => (
          <DropdownMenuItem
            key={opt}
            onClick={() => onChange(opt)}
            className={cn(
              "text-xs hover:bg-[#21262d] cursor-pointer",
              value === opt && "text-[#f5b82e]",
            )}
          >
            {opt}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Dialog: Nova Comanda ─────────────────────────────────────────────────────

function DialogNovaComanda({
  open,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSave: (c: Omit<Comanda, "id" | "numero" | "data" | "status">) => void;
}) {
  const [clienteBusca, setClienteBusca] = useState("");
  const [clienteSugestoes, setClienteSugestoes] = useState<string[]>([]);
  const [cliente, setCliente] = useState("");
  const [profissional, setProfissional] = useState("Nenhum");
  const [filial, setFilial] = useState("Nenhuma");
  const [itens, setItens] = useState<ItemComanda[]>([]);
  const [observacoes, setObservacoes] = useState("");

  const total = itens.reduce((acc, i) => acc + i.preco * i.qtd, 0);

  const handleBuscaCliente = (v: string) => {
    setClienteBusca(v);
    setClienteSugestoes(
      v.length > 1
        ? CLIENTES_BUSCA.filter((c) =>
            c.toLowerCase().includes(v.toLowerCase()),
          )
        : [],
    );
  };

  const handleSelectCliente = (nome: string) => {
    setCliente(nome);
    setClienteBusca(nome);
    setClienteSugestoes([]);
  };

  const addServico = (s: (typeof SERVICOS_MOCK)[0]) => {
    const existe = itens.find((i) => i.id === s.id);
    if (existe) {
      setItens((prev) =>
        prev.map((i) => (i.id === s.id ? { ...i, qtd: i.qtd + 1 } : i)),
      );
    } else {
      setItens((prev) => [
        ...prev,
        { id: s.id, tipo: "servico", nome: s.nome, preco: s.preco, qtd: 1 },
      ]);
    }
  };

  const addProduto = (p: (typeof PRODUTOS_MOCK)[0]) => {
    const existe = itens.find((i) => i.id === p.id);
    if (existe) {
      setItens((prev) =>
        prev.map((i) => (i.id === p.id ? { ...i, qtd: i.qtd + 1 } : i)),
      );
    } else {
      setItens((prev) => [
        ...prev,
        { id: p.id, tipo: "produto", nome: p.nome, preco: p.preco, qtd: 1 },
      ]);
    }
  };

  const removeItem = (id: string) =>
    setItens((prev) => prev.filter((i) => i.id !== id));

  const handleSave = () => {
    if (!cliente.trim()) {
      toast.error("Selecione um cliente.");
      return;
    }
    onSave({ cliente, profissional, filial, itens, total, observacoes });
    onOpenChange(false);
    setCliente("");
    setClienteBusca("");
    setProfissional("Nenhum");
    setFilial("Nenhuma");
    setItens([]);
    setObservacoes("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#161b22] border border-[#30363d] text-white max-w-lg p-0 gap-0 max-h-[92vh] flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-[#21262d] shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-bold">
              Nova Comanda
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

        <div
          className="flex-1 overflow-y-auto px-6 py-5 space-y-4"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#30363d transparent",
          }}
        >
          {/* Cliente */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#f5b82e] flex items-center gap-1.5">
              <User className="size-3" />
              Cliente
            </label>
            <div className="relative">
              <Input
                value={clienteBusca}
                onChange={(e) => handleBuscaCliente(e.target.value)}
                placeholder="Buscar cliente..."
                className={cn(
                  "bg-[#0d1117] border-[#30363d] text-white placeholder:text-[#4d5562] h-10",
                  "focus-visible:ring-[#f5b82e]/50 focus-visible:border-[#f5b82e]/60",
                )}
              />
              {clienteSugestoes.length > 0 && (
                <div className="absolute z-50 top-11 left-0 right-0 bg-[#161b22] border border-[#30363d] rounded-md shadow-xl overflow-hidden">
                  {clienteSugestoes.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => handleSelectCliente(c)}
                      className="w-full text-left px-3 py-2 text-sm text-white hover:bg-[#21262d] transition-colors"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Profissional + Filial */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#8b949e]">
                Profissional
              </label>
              <SelectInline
                value={profissional}
                options={PROFISSIONAIS_MOCK}
                onChange={setProfissional}
                className="w-full"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#8b949e]">
                Filial
              </label>
              <SelectInline
                value={filial}
                options={FILIAIS_MOCK}
                onChange={setFilial}
                className="w-full"
              />
            </div>
          </div>

          {/* Serviços */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#8b949e]">
              Serviços
            </label>
            <div className="flex flex-wrap gap-2">
              {SERVICOS_MOCK.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => addServico(s)}
                  className="h-8 px-3 rounded-md border border-[#30363d] bg-[#0d1117] text-xs text-white hover:border-[#f5b82e]/40 hover:text-[#f5b82e] transition-colors flex items-center gap-1.5"
                >
                  <Plus className="size-3" />
                  {s.nome}
                  <span className="text-[#4d5562]">R$ {s.preco}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Produtos */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#8b949e]">
              Produtos
            </label>
            <div className="flex flex-wrap gap-2">
              {PRODUTOS_MOCK.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => addProduto(p)}
                  className="h-8 px-3 rounded-md border border-[#30363d] bg-[#0d1117] text-xs text-white hover:border-[#f5b82e]/40 hover:text-[#f5b82e] transition-colors flex items-center gap-1.5"
                >
                  <Plus className="size-3" />
                  {p.nome}
                  <span className="text-[#4d5562]">R$ {p.preco}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Itens da comanda */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#8b949e]">
              Itens da Comanda ({itens.length})
            </label>
            {itens.length === 0 ? (
              <p className="text-xs text-[#4d5562] py-2">
                Nenhum item adicionado
              </p>
            ) : (
              <div className="space-y-1">
                {itens.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-1.5 px-3 rounded-md bg-[#0d1117] border border-[#21262d]"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "size-1.5 rounded-full shrink-0",
                          item.tipo === "servico"
                            ? "bg-blue-400"
                            : "bg-amber-400",
                        )}
                      />
                      <span className="text-sm text-white">{item.nome}</span>
                      <span className="text-xs text-[#4d5562]">
                        ×{item.qtd}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">
                        {formatBRL(item.preco * item.qtd)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="size-5 rounded flex items-center justify-center text-[#4d5562] hover:text-red-400 transition-colors"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Subtotal */}
          <div className="flex items-center justify-between px-3 py-3 rounded-md bg-[#0d1117] border border-[#21262d]">
            <span className="text-sm font-semibold text-white">Subtotal</span>
            <span className="text-sm font-bold text-[#f5b82e]">
              {formatBRL(total)}
            </span>
          </div>

          {/* Observações */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#8b949e]">
              Observações
            </label>
            <Textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Notas..."
              className="bg-[#0d1117] border-[#30363d] text-white placeholder:text-[#4d5562] focus-visible:ring-[#f5b82e]/30 resize-none min-h-[80px]"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[#21262d] flex justify-end gap-3 shrink-0 bg-[#161b22]">
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
            className="h-9 px-5 rounded-md text-sm font-bold bg-[#f5b82e] text-black hover:bg-[#d9a326] hover:shadow-[0_0_16px_rgba(245,184,46,0.3)] transition-all flex items-center gap-1.5"
          >
            <Plus className="size-3.5" />
            Criar Comanda
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function ComandasPage() {
  const [comandas, setComandas] = useState<Comanda[]>(COMANDAS_MOCK);
  const [search, setSearch] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [filtroFilial, setFiltroFilial] = useState("Todas filiais");
  const [dialogAberto, setDialogAberto] = useState(false);

  const abertas = comandas.filter((c) => c.status === "aberta").length;
  const pagas = comandas.filter((c) => c.status === "paga").length;
  const valorAberto = comandas
    .filter((c) => c.status === "aberta")
    .reduce((a, c) => a + c.total, 0);
  const valorRecebido = comandas
    .filter((c) => c.status === "paga")
    .reduce((a, c) => a + c.total, 0);

  const filtradas = comandas.filter((c) => {
    const matchSearch =
      c.cliente.toLowerCase().includes(search.toLowerCase()) ||
      c.numero.includes(search) ||
      c.profissional.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      filtroStatus === "Todos" ||
      (filtroStatus === "Aberta" && c.status === "aberta") ||
      (filtroStatus === "Paga" && c.status === "paga") ||
      (filtroStatus === "Cancelada" && c.status === "cancelada");
    const matchFilial =
      filtroFilial === "Todas filiais" || c.filial === filtroFilial;
    return matchSearch && matchStatus && matchFilial;
  });

  const handleSave = useCallback(
    (dados: Omit<Comanda, "id" | "numero" | "data" | "status">) => {
      const novo: Comanda = {
        ...dados,
        id: gerarId(),
        numero: `#${String(comandas.length + 1).padStart(3, "0")}`,
        data: new Date().toLocaleDateString("pt-BR"),
        status: "aberta",
      };
      setComandas((prev) => [novo, ...prev]);
      toast.success(`Comanda ${novo.numero} criada para ${dados.cliente}.`);
    },
    [comandas.length],
  );

  return (
    <div className="space-y-5 p-4 md:p-6 bg-[#0d1117] min-h-screen text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Comandas
          </h1>
          <p className="text-[#8b949e] text-sm mt-1">
            {comandas.length} comanda{comandas.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDialogAberto(true)}
          className="h-9 px-4 rounded-md text-sm font-bold bg-[#f5b82e] text-black hover:bg-[#d9a326] hover:shadow-[0_0_16px_rgba(245,184,46,0.3)] transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="size-3.5" />
          Nova Comanda
        </button>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Abertas", value: abertas, color: "text-[#f5b82e]" },
          {
            label: "Valor em Aberto",
            value: formatBRL(valorAberto),
            color: "text-[#f5b82e]",
          },
          { label: "Pagas", value: pagas, color: "text-emerald-400" },
          {
            label: "Valor Recebido",
            value: formatBRL(valorRecebido),
            color: "text-emerald-400",
          },
        ].map((card) => (
          <Card
            key={card.label}
            className="bg-[#161b22] border-[#30363d] shadow-none"
          >
            <CardContent className="p-4">
              <p className="text-[10px] font-bold text-[#8b949e] uppercase tracking-wider mb-1">
                {card.label}
              </p>
              <p className={cn("text-xl font-bold", card.color)}>
                {card.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#8b949e]" />
          <Input
            placeholder="Buscar comanda..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-[#161b22] border-[#30363d] text-white placeholder:text-[#8b949e] h-9 text-sm focus-visible:ring-[#f5b82e]/40"
          />
        </div>
        <button
          type="button"
          className="h-9 px-3 rounded-md border border-[#30363d] bg-[#161b22] text-sm text-[#8b949e] flex items-center gap-2 hover:border-[#f5b82e]/40 hover:text-white transition-colors"
        >
          <Download className="size-3.5" /> CSV
        </button>
        <SelectInline
          value={filtroStatus}
          options={["Todos", "Aberta", "Paga", "Cancelada"]}
          onChange={setFiltroStatus}
          className="min-w-[110px]"
        />
        <SelectInline
          value={filtroFilial}
          options={["Todas filiais", "Matriz", "Filial Norte", "Filial Sul"]}
          onChange={setFiltroFilial}
          className="min-w-[140px]"
        />
      </div>

      {/* Tabela */}
      <Card className="bg-[#161b22] border-[#30363d]">
        <CardContent className="p-0">
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-[#30363d] hover:bg-transparent">
                  {[
                    "Comanda",
                    "Cliente",
                    "Profissional",
                    "Itens",
                    "Status",
                    "Data",
                    "Total",
                    "Ações",
                  ].map((h) => (
                    <TableHead
                      key={h}
                      className="text-[#8b949e] text-xs uppercase tracking-wider font-semibold px-4 py-3 h-auto"
                    >
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtradas.length === 0 ? (
                  <TableRow className="border-[#30363d] hover:bg-transparent">
                    <TableCell colSpan={8} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3 text-[#8b949e]">
                        <FileText className="size-10 opacity-30" />
                        <p className="text-sm">Nenhuma comanda encontrada</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtradas.map((c) => (
                    <TableRow
                      key={c.id}
                      className="border-[#30363d] hover:bg-[#21262d]/50 transition-colors"
                    >
                      <TableCell className="px-4 py-4 font-mono text-[#f5b82e] text-sm font-semibold">
                        {c.numero}
                      </TableCell>
                      <TableCell className="px-4 py-4 font-semibold text-white text-sm">
                        {c.cliente}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-[#8b949e] text-sm">
                        {c.profissional}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-[#8b949e] text-sm">
                        {c.itens.length} item(ns)
                      </TableCell>
                      <TableCell className="px-4 py-4">
                        <StatusBadge status={c.status} />
                      </TableCell>
                      <TableCell className="px-4 py-4 text-[#8b949e] text-sm">
                        {c.data}
                      </TableCell>
                      <TableCell className="px-4 py-4 font-semibold text-white text-sm">
                        {formatBRL(c.total)}
                      </TableCell>
                      <TableCell className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() => {
                            setComandas((prev) =>
                              prev.filter((x) => x.id !== c.id),
                            );
                            toast.success("Comanda removida.");
                          }}
                          className="size-7 rounded-md border border-[#30363d] bg-[#0d1117] text-[#8b949e] flex items-center justify-center hover:border-red-500/40 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile */}
          <div className="md:hidden px-4 py-4 space-y-3">
            {filtradas.length === 0 ? (
              <div className="flex flex-col items-center gap-3 text-[#8b949e] py-12">
                <FileText className="size-10 opacity-30" />
                <p className="text-sm">Nenhuma comanda encontrada</p>
              </div>
            ) : (
              filtradas.map((c) => (
                <div
                  key={c.id}
                  className="bg-[#0d1117] rounded-lg p-4 border border-[#30363d] space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[#f5b82e] text-sm font-semibold">
                      {c.numero}
                    </span>
                    <StatusBadge status={c.status} />
                  </div>
                  <p className="font-semibold text-white text-sm">
                    {c.cliente}
                  </p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-[#8b949e]">
                    <span>
                      <span className="text-[#4d5562]">Prof: </span>
                      {c.profissional}
                    </span>
                    <span>
                      <span className="text-[#4d5562]">Data: </span>
                      {c.data}
                    </span>
                    <span className="font-bold text-white col-span-2">
                      {formatBRL(c.total)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <DialogNovaComanda
        open={dialogAberto}
        onOpenChange={setDialogAberto}
        onSave={handleSave}
      />
    </div>
  );
}
