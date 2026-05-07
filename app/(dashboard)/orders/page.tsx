"use client";

import { useState, useCallback } from "react";
import {
  Plus,
  Search,
  Download,
  X,
  User,
  Trash2,
  FileText,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { PageHeader, EmptyState, StatusBadge } from "@/components/shared";
import { formatBRL } from "@/utils/format";
import type { Tone } from "@/types/common.types";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type StatusComanda = "aberta" | "paga" | "cancelada";

interface ItemComanda {
  id: string;
  tipo: "servico" | "produto";
  nome: string;
  preco: number;
  qtd: number;
}

interface Comanda {
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
}

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

const STATUS_LABEL: Record<StatusComanda, string> = {
  aberta: "Aberta",
  paga: "Paga",
  cancelada: "Cancelada",
};

const STATUS_TONE: Record<StatusComanda, Tone> = {
  aberta: "warning",
  paga: "success",
  cancelada: "danger",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function gerarId(): string {
  return `_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
}

// ─── SelectInline ─────────────────────────────────────────────────────────────

interface SelectInlineProps {
  value: string;
  options: string[];
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}

function SelectInline({
  value,
  options,
  onChange,
  placeholder,
  className,
}: SelectInlineProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div
          role="button"
          tabIndex={0}
          className={cn(
            "h-10 px-3 rounded-md border border-border bg-surface-base text-sm text-foreground flex items-center justify-between gap-2 hover:border-brand/40 transition-colors cursor-pointer",
            className,
          )}
        >
          <span className={value ? "text-foreground" : "text-text-subtle"}>
            {value || placeholder || "Selecionar"}
          </span>
          <ChevronDown className="size-3.5 text-muted-foreground shrink-0" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-surface-raised border-border text-foreground max-h-48 overflow-y-auto">
        {options.map((opt) => (
          <DropdownMenuItem
            key={opt}
            onClick={() => onChange(opt)}
            className={cn(
              "text-xs hover:bg-surface-elevated cursor-pointer",
              value === opt && "text-brand",
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

interface DialogNovaComandaProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSave: (c: Omit<Comanda, "id" | "numero" | "data" | "status">) => void;
}

function DialogNovaComanda({
  open,
  onOpenChange,
  onSave,
}: DialogNovaComandaProps) {
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

  const addItem = (
    tipo: ItemComanda["tipo"],
    item: { id: string; nome: string; preco: number },
  ) => {
    const existe = itens.find((i) => i.id === item.id);
    if (existe) {
      setItens((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, qtd: i.qtd + 1 } : i)),
      );
    } else {
      setItens((prev) => [
        ...prev,
        { id: item.id, tipo, nome: item.nome, preco: item.preco, qtd: 1 },
      ]);
    }
  };

  const removeItem = (id: string) =>
    setItens((prev) => prev.filter((i) => i.id !== id));

  const resetForm = () => {
    setCliente("");
    setClienteBusca("");
    setProfissional("Nenhum");
    setFilial("Nenhuma");
    setItens([]);
    setObservacoes("");
  };

  const handleSave = () => {
    if (!cliente.trim()) {
      toast.error("Selecione um cliente.");
      return;
    }
    onSave({ cliente, profissional, filial, itens, total, observacoes });
    onOpenChange(false);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface-raised border border-border text-foreground max-w-lg p-0 gap-0 max-h-[92vh] flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border-subtle shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-bold">
              Nova Comanda
            </DialogTitle>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="size-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 scrollbar-thin">
          {/* Cliente */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-brand flex items-center gap-1.5">
              <User className="size-3" />
              Cliente
            </label>
            <div className="relative">
              <Input
                value={clienteBusca}
                onChange={(e) => handleBuscaCliente(e.target.value)}
                placeholder="Buscar cliente..."
                className="bg-surface-base border-border text-foreground placeholder:text-text-subtle h-10 focus-visible:ring-brand/50 focus-visible:border-brand/60"
              />
              {clienteSugestoes.length > 0 && (
                <div className="absolute z-50 top-11 left-0 right-0 bg-surface-raised border border-border rounded-md shadow-xl overflow-hidden">
                  {clienteSugestoes.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => handleSelectCliente(c)}
                      className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-surface-elevated transition-colors"
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
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
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
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
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
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Serviços
            </label>
            <div className="flex flex-wrap gap-2">
              {SERVICOS_MOCK.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => addItem("servico", s)}
                  className="h-8 px-3 rounded-md border border-border bg-surface-base text-xs text-foreground hover:border-brand/40 hover:text-brand transition-colors flex items-center gap-1.5"
                >
                  <Plus className="size-3" />
                  {s.nome}
                  <span className="text-text-subtle">{formatBRL(s.preco)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Produtos */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Produtos
            </label>
            <div className="flex flex-wrap gap-2">
              {PRODUTOS_MOCK.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => addItem("produto", p)}
                  className="h-8 px-3 rounded-md border border-border bg-surface-base text-xs text-foreground hover:border-brand/40 hover:text-brand transition-colors flex items-center gap-1.5"
                >
                  <Plus className="size-3" />
                  {p.nome}
                  <span className="text-text-subtle">{formatBRL(p.preco)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Itens da comanda */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Itens da Comanda ({itens.length})
            </label>
            {itens.length === 0 ? (
              <p className="text-xs text-text-subtle py-2">
                Nenhum item adicionado
              </p>
            ) : (
              <div className="space-y-1">
                {itens.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-1.5 px-3 rounded-md bg-surface-base border border-border-subtle"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "size-1.5 rounded-full shrink-0",
                          item.tipo === "servico"
                            ? "bg-info-foreground"
                            : "bg-warning-foreground",
                        )}
                      />
                      <span className="text-sm text-foreground">
                        {item.nome}
                      </span>
                      <span className="text-xs text-text-subtle">
                        ×{item.qtd}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">
                        {formatBRL(item.preco * item.qtd)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="size-5 rounded flex items-center justify-center text-text-subtle hover:text-danger-foreground transition-colors"
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
          <div className="flex items-center justify-between px-3 py-3 rounded-md bg-surface-base border border-border-subtle">
            <span className="text-sm font-semibold text-foreground">
              Subtotal
            </span>
            <span className="text-sm font-bold text-brand">
              {formatBRL(total)}
            </span>
          </div>

          {/* Observações */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Observações
            </label>
            <Textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Notas..."
              className="bg-surface-base border-border text-foreground placeholder:text-text-subtle focus-visible:ring-brand/30 resize-none min-h-20"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border-subtle flex justify-end gap-3 shrink-0 bg-surface-raised">
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
            className="h-9 px-5 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover hover:shadow-[0_0_16px_rgba(245,184,46,0.3)] transition-all flex items-center gap-1.5"
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
    <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
      <PageHeader
        title="Comandas"
        subtitle={`${comandas.length} comanda${comandas.length !== 1 ? "s" : ""}`}
        actions={
          <button
            type="button"
            onClick={() => setDialogAberto(true)}
            className="h-9 px-4 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover hover:shadow-[0_0_16px_rgba(245,184,46,0.3)] transition-all flex items-center gap-1.5"
          >
            <Plus className="size-3.5" />
            Nova Comanda
          </button>
        }
      />

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Abertas", value: String(abertas), color: "text-brand" },
          {
            label: "Valor em Aberto",
            value: formatBRL(valorAberto),
            color: "text-brand",
          },
          {
            label: "Pagas",
            value: String(pagas),
            color: "text-success-foreground",
          },
          {
            label: "Valor Recebido",
            value: formatBRL(valorRecebido),
            color: "text-success-foreground",
          },
        ].map((card) => (
          <Card
            key={card.label}
            className="bg-surface-raised border-border shadow-none"
          >
            <CardContent className="p-4">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar comanda..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-surface-raised border-border text-foreground placeholder:text-muted-foreground h-9 text-sm focus-visible:ring-brand/40"
          />
        </div>
        <button
          type="button"
          className="h-9 px-3 rounded-md border border-border bg-surface-raised text-sm text-muted-foreground flex items-center gap-2 hover:border-brand/40 hover:text-foreground transition-colors"
        >
          <Download className="size-3.5" /> CSV
        </button>
        <SelectInline
          value={filtroStatus}
          options={["Todos", "Aberta", "Paga", "Cancelada"]}
          onChange={setFiltroStatus}
          className="min-w-28"
        />
        <SelectInline
          value={filtroFilial}
          options={["Todas filiais", "Matriz", "Filial Norte", "Filial Sul"]}
          onChange={setFiltroFilial}
          className="min-w-35"
        />
      </div>

      {/* Tabela */}
      <Card className="bg-surface-raised border-border">
        <CardContent className="p-0">
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
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
                      className="text-muted-foreground text-xs uppercase tracking-wider font-semibold px-4 py-3 h-auto"
                    >
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtradas.length === 0 ? (
                  <TableRow className="border-border hover:bg-transparent">
                    <TableCell colSpan={8} className="py-16">
                      <EmptyState
                        message="Nenhuma comanda encontrada"
                        icon={<FileText className="size-10" />}
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  filtradas.map((c) => (
                    <TableRow
                      key={c.id}
                      className="border-border hover:bg-surface-elevated/50 transition-colors"
                    >
                      <TableCell className="px-4 py-4 font-mono text-brand text-sm font-semibold">
                        {c.numero}
                      </TableCell>
                      <TableCell className="px-4 py-4 font-semibold text-foreground text-sm">
                        {c.cliente}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-muted-foreground text-sm">
                        {c.profissional}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-muted-foreground text-sm">
                        {c.itens.length} item(ns)
                      </TableCell>
                      <TableCell className="px-4 py-4">
                        <StatusBadge tone={STATUS_TONE[c.status]}>
                          {STATUS_LABEL[c.status]}
                        </StatusBadge>
                      </TableCell>
                      <TableCell className="px-4 py-4 text-muted-foreground text-sm">
                        {c.data}
                      </TableCell>
                      <TableCell className="px-4 py-4 font-semibold text-foreground text-sm">
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
                          className="size-7 rounded-md border border-border bg-surface-base text-muted-foreground flex items-center justify-center hover:border-danger/40 hover:text-danger-foreground transition-colors"
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
              <EmptyState
                message="Nenhuma comanda encontrada"
                icon={<FileText className="size-10" />}
              />
            ) : (
              filtradas.map((c) => (
                <div
                  key={c.id}
                  className="bg-surface-base rounded-lg p-4 border border-border space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-brand text-sm font-semibold">
                      {c.numero}
                    </span>
                    <StatusBadge tone={STATUS_TONE[c.status]}>
                      {STATUS_LABEL[c.status]}
                    </StatusBadge>
                  </div>
                  <p className="font-semibold text-foreground text-sm">
                    {c.cliente}
                  </p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>
                      <span className="text-text-subtle">Prof: </span>
                      {c.profissional}
                    </span>
                    <span>
                      <span className="text-text-subtle">Data: </span>
                      {c.data}
                    </span>
                    <span className="font-bold text-foreground col-span-2">
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
