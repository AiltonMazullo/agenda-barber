/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { useState, useRef, useCallback } from "react";
import {
  Plus,
  Search,
  Download,
  ChevronDown,
  X,
  User,
  Phone,
  Mail,
  FileText,
  MapPin,
  Star,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Upload,
  CalendarIcon,
  MoreHorizontal,
  UserCheck,
  Wifi,
  Users,
  MessageSquare,
  BadgeCheck,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Origem =
  | "manual"
  | "online"
  | "instagram"
  | "indicacao"
  | "whatsapp"
  | "google";

type StatusCliente = "ativo" | "inativo";

type Cliente = {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  dataNascimento: string;
  origem: Origem;
  profissionalPreferido: string;
  status: StatusCliente;
  foto: string | null;
  // Endereço
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  // Extras
  notas: string;
  senha: string;
  criadoEm: string;
  atualizadoEm: string;
};

// ─── Mock ─────────────────────────────────────────────────────────────────────

const PROFISSIONAIS_OPCOES = ["Nenhum", "Carlos", "Marcos", "Rafael", "Diego"];

const ORIGENS: { value: Origem; label: string; icon: React.ReactNode }[] = [
  {
    value: "manual",
    label: "Manual",
    icon: <UserCheck className="size-3.5" />,
  },
  { value: "online", label: "Online", icon: <Wifi className="size-3.5" /> },
  {
    value: "indicacao",
    label: "Indicação",
    icon: <Users className="size-3.5" />,
  },
  {
    value: "whatsapp",
    label: "WhatsApp",
    icon: <MessageSquare className="size-3.5" />,
  },
  { value: "google", label: "Google", icon: <Star className="size-3.5" /> },
];

const ESTADOS_BR = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];

const CLIENTES_MOCK: Cliente[] = [
  {
    id: "c1",
    nome: "João Silva",
    email: "joao@email.com",
    telefone: "(81) 99999-0001",
    cpf: "123.456.789-00",
    dataNascimento: "15/03/1990",
    origem: "online",
    profissionalPreferido: "Carlos",
    status: "ativo",
    foto: null,
    cep: "50000-000",
    logradouro: "Rua das Flores",
    numero: "123",
    complemento: "Apto 4",
    bairro: "Boa Vista",
    cidade: "Recife",
    estado: "PE",
    notas: "Cliente VIP, prefere horários manhã.",
    senha: "",
    criadoEm: "09/04/2026",
    atualizadoEm: "09/04/2026",
  },
  {
    id: "c2",
    nome: "Ana Costa",
    email: "ana@email.com",
    telefone: "(81) 98888-0002",
    cpf: "987.654.321-00",
    dataNascimento: "22/07/1995",
    origem: "instagram",
    profissionalPreferido: "Marcos",
    status: "ativo",
    foto: null,
    cep: "51000-000",
    logradouro: "Av. Boa Viagem",
    numero: "456",
    complemento: "",
    bairro: "Boa Viagem",
    cidade: "Recife",
    estado: "PE",
    notas: "",
    senha: "",
    criadoEm: "08/04/2026",
    atualizadoEm: "08/04/2026",
  },
  {
    id: "c3",
    nome: "Pedro Lima",
    email: "pedro@email.com",
    telefone: "(81) 97777-0003",
    cpf: "111.222.333-44",
    dataNascimento: "01/01/1985",
    origem: "indicacao",
    profissionalPreferido: "Nenhum",
    status: "inativo",
    foto: null,
    cep: "52000-000",
    logradouro: "Rua do Sol",
    numero: "789",
    complemento: "",
    bairro: "Casa Forte",
    cidade: "Recife",
    estado: "PE",
    notas: "Inativo por 3 meses.",
    senha: "",
    criadoEm: "01/03/2026",
    atualizadoEm: "01/04/2026",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function gerarId() {
  return `c_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

function OrigemBadge({ origem }: { origem: Origem }) {
  const map: Record<Origem, { label: string; class: string }> = {
    manual: {
      label: "Manual",
      class: "bg-[#21262d] text-[#8b949e] border-[#30363d]",
    },
    online: {
      label: "Online",
      class: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    },
    instagram: {
      label: "Instagram",
      class: "bg-pink-500/15 text-pink-400 border-pink-500/30",
    },
    indicacao: {
      label: "Indicação",
      class: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    },
    whatsapp: {
      label: "WhatsApp",
      class: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    },
    google: {
      label: "Google",
      class: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    },
  };
  const { label, class: cls } = map[origem];
  return (
    <Badge className={cn("border text-[10px] font-semibold px-2 py-0.5", cls)}>
      {label}
    </Badge>
  );
}

function StatusBadge({ status }: { status: StatusCliente }) {
  if (status === "ativo")
    return (
      <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold px-2 py-0.5">
        Ativo
      </Badge>
    );
  return (
    <Badge className="bg-[#30363d]/60 text-[#8b949e] border border-[#30363d] text-[10px] font-semibold px-2 py-0.5">
      Inativo
    </Badge>
  );
}

// ─── DatePickerField inline ───────────────────────────────────────────────────

function DatePickerInline({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const parsed = value
    ? (() => {
        const [d, m, y] = value.split("/");
        const dt = new Date(Number(y), Number(m) - 1, Number(d));
        return isNaN(dt.getTime()) ? undefined : dt;
      })()
    : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <button
          id={id}
          type="button"
          className={cn(
            "w-full h-10 px-3 rounded-md border text-sm flex items-center justify-between gap-2 transition-all outline-none bg-[#0d1117]",
            open
              ? "border-[#f5b82e]/70 shadow-[0_0_0_3px_rgba(245,184,46,0.08)]"
              : "border-[#30363d] hover:border-[#f5b82e]/40",
          )}
        >
          <span className={value ? "text-white" : "text-[#4d5562]"}>
            {value || "dd/mm/aaaa"}
          </span>
          <CalendarIcon
            className={cn(
              "size-3.5 shrink-0 transition-colors",
              open ? "text-[#f5b82e]" : "text-[#4d5562]",
            )}
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={6}
        className="w-auto p-0 overflow-hidden bg-[#161b22] border border-[#30363d] rounded-xl shadow-[0_16px_48px_rgba(0,0,0,0.6)]"
      >
        <div className="px-4 pt-4 pb-3 border-b border-[#21262d]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#f5b82e]">
            Data de nascimento
          </p>
          <p className="text-base font-bold text-white mt-0.5">
            {parsed
              ? parsed.toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })
              : "Nenhuma data selecionada"}
          </p>
        </div>
        <div className="p-3">
          <CalendarComponent
            mode="single"
            selected={parsed}
            defaultMonth={parsed}
            captionLayout="dropdown"
            locale={ptBR}
            onSelect={(d) => {
              if (d) onChange(d.toLocaleDateString("pt-BR"));
              setOpen(false);
            }}
            classNames={{
              root: "",
              months: "text-white",
              month_caption: "flex items-center gap-2 mb-3 px-1",
              caption_label: "hidden",
              dropdowns: "flex items-center gap-2 flex-1",
              dropdown:
                "bg-[#0d1117] border border-[#30363d] text-white text-xs rounded-md px-2 py-1.5 font-medium focus:outline-none cursor-pointer hover:border-[#f5b82e]/40 transition-colors",
              nav: "flex items-center gap-1",
              button_previous:
                "size-7 flex items-center justify-center rounded-md text-[#8b949e] hover:text-white hover:bg-[#21262d] transition-colors border border-transparent hover:border-[#30363d]",
              button_next:
                "size-7 flex items-center justify-center rounded-md text-[#8b949e] hover:text-white hover:bg-[#21262d] transition-colors border border-transparent hover:border-[#30363d]",
              weeks: "mt-1 space-y-0.5",
              weekdays: "flex mb-2",
              weekday:
                "flex-1 text-center text-[10px] font-bold uppercase text-[#4d5562] py-1",
              week: "flex gap-0.5",
              day: "flex-1 flex items-center justify-center",
              day_button:
                "size-8 text-xs font-medium rounded-md text-[#8b949e] hover:bg-[#21262d] hover:text-white transition-colors focus:outline-none",
              selected:
                "!bg-[#f5b82e] !text-black !font-bold rounded-md hover:!bg-[#d9a326]",
              today: "!text-[#f5b82e] !font-bold",
              outside: "opacity-20",
              disabled: "opacity-20 cursor-not-allowed",
            }}
          />
        </div>
        {value && (
          <div className="px-4 pb-3 pt-3 border-t border-[#21262d]">
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className="w-full text-xs font-semibold text-[#8b949e] hover:text-red-400 transition-colors py-1 rounded-md hover:bg-red-500/5"
            >
              Limpar data
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

// ─── SelectField ──────────────────────────────────────────────────────────────

function SelectField({
  id,
  value,
  options,
  onChange,
  placeholder,
}: {
  id: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div
          id={id}
          role="button"
          tabIndex={0}
          className="w-full h-10 px-3 rounded-md border border-[#30363d] bg-[#0d1117] text-sm text-white flex items-center justify-between gap-2 hover:border-[#f5b82e]/40 transition-colors cursor-pointer"
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

// ─── FormLabel ────────────────────────────────────────────────────────────────

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

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <span className="text-[11px] font-bold uppercase tracking-widest text-[#f5b82e]">
        {children}
      </span>
      <div className="flex-1 h-px bg-[#21262d]" />
    </div>
  );
}

// ─── Dialog: Novo / Editar Cliente ────────────────────────────────────────────

const EMPTY_FORM = {
  nome: "",
  email: "",
  telefone: "",
  cpf: "",
  dataNascimento: "",
  origem: "manual" as Origem,
  profissionalPreferido: "Nenhum",
  status: "ativo" as StatusCliente,
  foto: null as string | null,
  cep: "",
  logradouro: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  estado: "",
  notas: "",
  senha: "",
};

function DialogCliente({
  open,
  onOpenChange,
  clienteEdicao,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  clienteEdicao: Cliente | null;
  onSave: (c: Omit<Cliente, "id" | "criadoEm" | "atualizadoEm">) => void;
}) {
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [showSenha, setShowSenha] = useState(false);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open) {
      if (clienteEdicao) {
        setForm({
          nome: clienteEdicao.nome,
          email: clienteEdicao.email,
          telefone: clienteEdicao.telefone,
          cpf: clienteEdicao.cpf,
          dataNascimento: clienteEdicao.dataNascimento,
          origem: clienteEdicao.origem,
          profissionalPreferido: clienteEdicao.profissionalPreferido,
          status: clienteEdicao.status,
          foto: clienteEdicao.foto,
          cep: clienteEdicao.cep,
          logradouro: clienteEdicao.logradouro,
          numero: clienteEdicao.numero,
          complemento: clienteEdicao.complemento,
          bairro: clienteEdicao.bairro,
          cidade: clienteEdicao.cidade,
          estado: clienteEdicao.estado,
          notas: clienteEdicao.notas,
          senha: "",
        });
        setFotoPreview(clienteEdicao.foto);
      } else {
        setForm({ ...EMPTY_FORM });
        setFotoPreview(null);
      }
    }
  }, [open, clienteEdicao]);

  const set = (key: keyof typeof form) => (val: any) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Foto deve ter até 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      setFotoPreview(src);
      setForm((prev) => ({ ...prev, foto: src }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!form.nome.trim()) {
      toast.error("Nome é obrigatório.");
      return;
    }
    onSave(form);
    onOpenChange(false);
  };

  const isEditing = !!clienteEdicao;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#161b22] border border-[#30363d] text-white max-w-2xl p-0 gap-0 max-h-[92vh] flex flex-col">
        {/* Header fixo */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-[#21262d] shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-bold">
              {isEditing ? "Editar Cliente" : "Novo Cliente"}
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

        {/* Body com scroll estilizado */}
        <div
          className="flex-1 overflow-y-auto px-6 py-5 space-y-5"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#30363d transparent",
          }}
        >
          {/* Foto */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="size-16 rounded-full bg-[#21262d] border-2 border-dashed border-[#30363d] flex items-center justify-center hover:border-[#f5b82e]/50 transition-colors overflow-hidden shrink-0"
            >
              {fotoPreview ? (
                <img
                  src={fotoPreview}
                  alt="foto"
                  className="size-16 object-cover rounded-full"
                />
              ) : (
                <Upload className="size-5 text-[#4d5562]" />
              )}
            </button>
            <div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="text-sm font-semibold text-[#f5b82e] hover:text-[#d9a326] transition-colors"
              >
                Enviar foto
              </button>
              <p className="text-[11px] text-[#4d5562] mt-0.5">
                JPG, PNG até 5MB
              </p>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFoto}
            />
          </div>

          {/* Dados pessoais */}
          <SectionTitle>Dados pessoais</SectionTitle>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <FormLabel required>Nome</FormLabel>
              <Input
                value={form.nome}
                onChange={(e) => set("nome")(e.target.value)}
                placeholder="Nome completo"
                className="bg-[#0d1117] border-[#30363d] text-white placeholder:text-[#4d5562] focus-visible:ring-[#f5b82e]/30 h-10"
              />
            </div>
            <div className="space-y-1.5">
              <FormLabel>Email</FormLabel>
              <Input
                value={form.email}
                onChange={(e) => set("email")(e.target.value)}
                type="email"
                placeholder="email@exemplo.com"
                className="bg-[#0d1117] border-[#30363d] text-white placeholder:text-[#4d5562] focus-visible:ring-[#f5b82e]/30 h-10"
              />
            </div>
            <div className="space-y-1.5">
              <FormLabel>Telefone</FormLabel>
              <Input
                value={form.telefone}
                onChange={(e) => set("telefone")(e.target.value)}
                placeholder="(00) 00000-0000"
                className="bg-[#0d1117] border-[#30363d] text-white placeholder:text-[#4d5562] focus-visible:ring-[#f5b82e]/30 h-10"
              />
            </div>
            <div className="space-y-1.5">
              <FormLabel>CPF</FormLabel>
              <Input
                value={form.cpf}
                onChange={(e) => set("cpf")(e.target.value)}
                placeholder="000.000.000-00"
                className="bg-[#0d1117] border-[#30363d] text-white placeholder:text-[#4d5562] focus-visible:ring-[#f5b82e]/30 h-10"
              />
            </div>
            <div className="space-y-1.5">
              <FormLabel>Data de Nascimento</FormLabel>
              <DatePickerInline
                id="nasc"
                value={form.dataNascimento}
                onChange={set("dataNascimento")}
              />
            </div>
            <div className="space-y-1.5">
              <FormLabel>Como conheceu</FormLabel>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <div
                    role="button"
                    tabIndex={0}
                    className="w-full h-10 px-3 rounded-md border border-[#30363d] bg-[#0d1117] text-sm text-white flex items-center justify-between gap-2 hover:border-[#f5b82e]/40 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      {ORIGENS.find((o) => o.value === form.origem)?.icon}
                      <span>
                        {ORIGENS.find((o) => o.value === form.origem)?.label}
                      </span>
                    </div>
                    <ChevronDown className="size-3.5 text-[#8b949e] shrink-0" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-[#161b22] border-[#30363d] text-white">
                  {ORIGENS.map((o) => (
                    <DropdownMenuItem
                      key={o.value}
                      onClick={() => set("origem")(o.value)}
                      className={cn(
                        "text-xs hover:bg-[#21262d] cursor-pointer gap-2",
                        form.origem === o.value && "text-[#f5b82e]",
                      )}
                    >
                      {o.icon}
                      {o.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <FormLabel>Profissional preferido</FormLabel>
              <SelectField
                id="prof"
                value={form.profissionalPreferido}
                options={PROFISSIONAIS_OPCOES}
                onChange={set("profissionalPreferido")}
              />
            </div>
            <div className="space-y-1.5">
              <FormLabel>Status</FormLabel>
              <div className="grid grid-cols-2 gap-2">
                {(["ativo", "inativo"] as StatusCliente[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => set("status")(s)}
                    className={cn(
                      "h-10 rounded-md border text-xs font-semibold transition-colors flex items-center justify-center gap-1.5",
                      form.status === s
                        ? s === "ativo"
                          ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-400"
                          : "bg-[#30363d]/50 border-[#30363d] text-[#8b949e]"
                        : "border-[#30363d] bg-[#0d1117] text-[#4d5562] hover:border-[#f5b82e]/30",
                    )}
                  >
                    <BadgeCheck className="size-3.5" />
                    {s === "ativo" ? "Ativo" : "Inativo"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Endereço */}
          <SectionTitle>Endereço</SectionTitle>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <FormLabel>CEP</FormLabel>
              <Input
                value={form.cep}
                onChange={(e) => set("cep")(e.target.value)}
                placeholder="00000-000"
                className="bg-[#0d1117] border-[#30363d] text-white placeholder:text-[#4d5562] focus-visible:ring-[#f5b82e]/30 h-10"
              />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <FormLabel>Logradouro</FormLabel>
              <Input
                value={form.logradouro}
                onChange={(e) => set("logradouro")(e.target.value)}
                placeholder="Rua, Avenida..."
                className="bg-[#0d1117] border-[#30363d] text-white placeholder:text-[#4d5562] focus-visible:ring-[#f5b82e]/30 h-10"
              />
            </div>
            <div className="space-y-1.5">
              <FormLabel>Número</FormLabel>
              <Input
                value={form.numero}
                onChange={(e) => set("numero")(e.target.value)}
                placeholder="Nº"
                className="bg-[#0d1117] border-[#30363d] text-white placeholder:text-[#4d5562] focus-visible:ring-[#f5b82e]/30 h-10"
              />
            </div>
            <div className="space-y-1.5">
              <FormLabel>Complemento</FormLabel>
              <Input
                value={form.complemento}
                onChange={(e) => set("complemento")(e.target.value)}
                placeholder="Apto, Bloco..."
                className="bg-[#0d1117] border-[#30363d] text-white placeholder:text-[#4d5562] focus-visible:ring-[#f5b82e]/30 h-10"
              />
            </div>
            <div className="space-y-1.5">
              <FormLabel>Bairro</FormLabel>
              <Input
                value={form.bairro}
                onChange={(e) => set("bairro")(e.target.value)}
                placeholder="Bairro"
                className="bg-[#0d1117] border-[#30363d] text-white placeholder:text-[#4d5562] focus-visible:ring-[#f5b82e]/30 h-10"
              />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <FormLabel>Cidade</FormLabel>
              <Input
                value={form.cidade}
                onChange={(e) => set("cidade")(e.target.value)}
                placeholder="Cidade"
                className="bg-[#0d1117] border-[#30363d] text-white placeholder:text-[#4d5562] focus-visible:ring-[#f5b82e]/30 h-10"
              />
            </div>
            <div className="space-y-1.5">
              <FormLabel>Estado</FormLabel>
              <SelectField
                id="estado"
                value={form.estado}
                options={ESTADOS_BR}
                onChange={set("estado")}
                placeholder="UF"
              />
            </div>
          </div>

          {/* Acesso */}
          <SectionTitle>Acesso do cliente</SectionTitle>

          <div className="space-y-1.5">
            <FormLabel>Senha</FormLabel>
            <div className="relative">
              <Input
                type={showSenha ? "text" : "password"}
                value={form.senha}
                onChange={(e) => set("senha")(e.target.value)}
                placeholder={
                  isEditing
                    ? "Deixe em branco para manter a atual"
                    : "Criar senha de acesso"
                }
                className="bg-[#0d1117] border-[#30363d] text-white placeholder:text-[#4d5562] focus-visible:ring-[#f5b82e]/30 h-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowSenha((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4d5562] hover:text-[#8b949e] transition-colors"
              >
                {showSenha ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            <p className="text-[10px] text-[#4d5562]">
              O cliente usa email + senha para acessar o painel, agenda online e
              assinaturas.
            </p>
          </div>

          {/* Notas */}
          <SectionTitle>Notas internas</SectionTitle>

          <div className="space-y-1.5">
            <FormLabel>Notas</FormLabel>
            <Textarea
              value={form.notas}
              onChange={(e) => set("notas")(e.target.value)}
              placeholder="Observações visíveis apenas para a equipe..."
              className="bg-[#0d1117] border-[#30363d] text-white placeholder:text-[#4d5562] focus-visible:ring-[#f5b82e]/30 resize-none min-h-[80px]"
            />
          </div>
        </div>

        {/* Footer fixo */}
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
            className="h-9 px-5 rounded-md text-sm font-bold bg-[#f5b82e] text-black hover:bg-[#d9a326] hover:shadow-[0_0_16px_rgba(245,184,46,0.3)] transition-all"
          >
            {isEditing ? "Salvar alterações" : "Criar cliente"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>(CLIENTES_MOCK);
  const [search, setSearch] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [filtroOrigem, setFiltroOrigem] = useState("Todas");
  const [dialogAberto, setDialogAberto] = useState(false);
  const [clienteEdicao, setClienteEdicao] = useState<Cliente | null>(null);

  const filtrados = clientes.filter((c) => {
    const matchSearch =
      c.nome.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.telefone.includes(search) ||
      c.cpf.includes(search);
    const matchStatus =
      filtroStatus === "Todos" ||
      (filtroStatus === "Ativo" && c.status === "ativo") ||
      (filtroStatus === "Inativo" && c.status === "inativo");
    const matchOrigem =
      filtroOrigem === "Todas" || c.origem === filtroOrigem.toLowerCase();
    return matchSearch && matchStatus && matchOrigem;
  });

  const handleNovoCliente = () => {
    setClienteEdicao(null);
    setDialogAberto(true);
  };

  const handleEditar = (c: Cliente) => {
    setClienteEdicao(c);
    setDialogAberto(true);
  };

  const handleDeletar = (id: string) => {
    setClientes((prev) => prev.filter((c) => c.id !== id));
    toast.success("Cliente removido.");
  };

  const handleSave = useCallback(
    (dados: Omit<Cliente, "id" | "criadoEm" | "atualizadoEm">) => {
      const hoje = new Date().toLocaleDateString("pt-BR");
      if (clienteEdicao) {
        setClientes((prev) =>
          prev.map((c) =>
            c.id === clienteEdicao.id
              ? { ...c, ...dados, atualizadoEm: hoje }
              : c,
          ),
        );
        toast.success("Cliente atualizado.");
      } else {
        const novo: Cliente = {
          ...dados,
          id: gerarId(),
          criadoEm: hoje,
          atualizadoEm: hoje,
        };
        setClientes((prev) => [novo, ...prev]);
        toast.success(`Cliente ${dados.nome} criado.`);
      }
    },
    [clienteEdicao],
  );

  return (
    <div className="space-y-5 p-4 md:p-6 bg-[#0d1117] min-h-screen text-white">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Clientes
          </h1>
          <p className="text-[#8b949e] text-sm mt-1">
            {clientes.length} cliente{clientes.length !== 1 ? "s" : ""}{" "}
            cadastrado{clientes.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={handleNovoCliente}
          className="h-9 px-4 rounded-md text-sm font-bold bg-[#f5b82e] text-black hover:bg-[#d9a326] hover:shadow-[0_0_16px_rgba(245,184,46,0.3)] transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="size-3.5" />
          Novo Cliente
        </button>
      </div>

      {/* ── Filtros ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Busca */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#8b949e]" />
          <Input
            placeholder="Buscar por nome, email, telefone ou CPF..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-[#161b22] border-[#30363d] text-white placeholder:text-[#8b949e] h-9 text-sm focus-visible:ring-[#f5b82e]/40"
          />
        </div>

        {/* Status */}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <div
              role="button"
              tabIndex={0}
              className="h-9 px-3 rounded-md border border-[#30363d] bg-[#161b22] text-sm text-white flex items-center gap-2 hover:border-[#f5b82e]/40 transition-colors cursor-pointer min-w-[100px]"
            >
              <span>{filtroStatus}</span>
              <ChevronDown className="size-3.5 text-[#8b949e] ml-auto" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#161b22] border-[#30363d] text-white">
            {["Todos", "Ativo", "Inativo"].map((s) => (
              <DropdownMenuItem
                key={s}
                onClick={() => setFiltroStatus(s)}
                className={cn(
                  "text-xs hover:bg-[#21262d] cursor-pointer",
                  filtroStatus === s && "text-[#f5b82e]",
                )}
              >
                {s}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Origem */}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <div
              role="button"
              tabIndex={0}
              className="h-9 px-3 rounded-md border border-[#30363d] bg-[#161b22] text-sm text-white flex items-center gap-2 hover:border-[#f5b82e]/40 transition-colors cursor-pointer min-w-[110px]"
            >
              <span>{filtroOrigem}</span>
              <ChevronDown className="size-3.5 text-[#8b949e] ml-auto" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#161b22] border-[#30363d] text-white">
            {["Todas", ...ORIGENS.map((o) => o.label)].map((o) => (
              <DropdownMenuItem
                key={o}
                onClick={() => setFiltroOrigem(o)}
                className={cn(
                  "text-xs hover:bg-[#21262d] cursor-pointer",
                  filtroOrigem === o && "text-[#f5b82e]",
                )}
              >
                {o}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* CSV */}
        <button
          type="button"
          className="h-9 px-3 rounded-md border border-[#30363d] bg-[#161b22] text-sm text-[#8b949e] flex items-center gap-2 hover:border-[#f5b82e]/40 hover:text-white transition-colors"
        >
          <Download className="size-3.5" />
          CSV
        </button>
      </div>

      {/* ── Tabela ── */}
      <Card className="bg-[#161b22] border-[#30363d]">
        <CardContent className="p-0">
          {/* Desktop */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow className="border-[#30363d] hover:bg-transparent">
                  {[
                    "Nome",
                    "Contato",
                    "Profissional",
                    "Origem",
                    "Criado em",
                    "Atualizado",
                    "Status",
                    "Ações",
                  ].map((col) => (
                    <TableHead
                      key={col}
                      className="text-[#8b949e] text-xs uppercase tracking-wider font-semibold px-4 py-3 h-auto"
                    >
                      {col}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtrados.length === 0 ? (
                  <TableRow className="border-[#30363d] hover:bg-transparent">
                    <TableCell colSpan={8} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3 text-[#8b949e]">
                        <User className="size-10 opacity-30" />
                        <p className="text-sm">Nenhum cliente encontrado.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtrados.map((c) => (
                    <TableRow
                      key={c.id}
                      className="border-[#30363d] hover:bg-[#21262d]/50 transition-colors"
                    >
                      <TableCell className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="size-8 rounded-full bg-[#f5b82e]/15 border border-[#f5b82e]/20 flex items-center justify-center shrink-0 overflow-hidden">
                            {c.foto ? (
                              <img
                                src={c.foto}
                                alt={c.nome}
                                className="size-8 object-cover rounded-full"
                              />
                            ) : (
                              <span className="text-[10px] font-bold text-[#f5b82e]">
                                {c.nome
                                  .split(" ")
                                  .map((n) => n[0])
                                  .slice(0, 2)
                                  .join("")
                                  .toUpperCase()}
                              </span>
                            )}
                          </div>
                          <span className="font-semibold text-white text-sm">
                            {c.nome}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="space-y-0.5">
                          <p className="text-xs text-white">{c.telefone}</p>
                          <p className="text-[10px] text-[#4d5562]">
                            {c.email || "—"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-[#8b949e] text-sm">
                        {c.profissionalPreferido}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <OrigemBadge origem={c.origem} />
                      </TableCell>
                      <TableCell className="px-4 py-3 text-[#8b949e] text-sm">
                        {c.criadoEm}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-[#8b949e] text-sm">
                        {c.atualizadoEm}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <StatusBadge status={c.status} />
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <div
                              role="button"
                              tabIndex={0}
                              className="size-8 rounded-md border border-[#30363d] bg-[#0d1117] text-[#8b949e] flex items-center justify-center hover:border-[#f5b82e]/40 hover:text-[#f5b82e] transition-colors cursor-pointer"
                            >
                              <MoreHorizontal className="size-3.5" />
                            </div>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="bg-[#161b22] border-[#30363d] text-white"
                          >
                            <DropdownMenuItem
                              onClick={() => handleEditar(c)}
                              className="text-xs hover:bg-[#21262d] cursor-pointer gap-2"
                            >
                              <Edit className="size-3.5" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-[#21262d]" />
                            <DropdownMenuItem
                              onClick={() => handleDeletar(c.id)}
                              className="text-xs hover:bg-red-500/10 text-red-400 cursor-pointer gap-2"
                            >
                              <Trash2 className="size-3.5" /> Remover
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile */}
          <div className="md:hidden px-4 py-4 space-y-3">
            {filtrados.length === 0 ? (
              <div className="flex flex-col items-center gap-3 text-[#8b949e] py-12">
                <User className="size-10 opacity-30" />
                <p className="text-sm">Nenhum cliente encontrado.</p>
              </div>
            ) : (
              filtrados.map((c) => (
                <div
                  key={c.id}
                  className="bg-[#0d1117] rounded-lg p-4 border border-[#30363d] space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-full bg-[#f5b82e]/15 border border-[#f5b82e]/20 flex items-center justify-center shrink-0">
                        <span className="text-[11px] font-bold text-[#f5b82e]">
                          {c.nome
                            .split(" ")
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-white text-sm">
                          {c.nome}
                        </p>
                        <p className="text-[10px] text-[#4d5562]">
                          {c.email || c.telefone}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <StatusBadge status={c.status} />
                      <button
                        type="button"
                        onClick={() => handleEditar(c)}
                        className="size-7 rounded-md border border-[#30363d] bg-[#161b22] text-[#8b949e] flex items-center justify-center hover:border-[#f5b82e]/40 hover:text-[#f5b82e] transition-colors"
                      >
                        <Edit className="size-3" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-[#8b949e]">
                    <span>
                      <span className="text-[#4d5562]">Tel: </span>
                      {c.telefone}
                    </span>
                    <span>
                      <span className="text-[#4d5562]">Prof: </span>
                      {c.profissionalPreferido}
                    </span>
                    <span>
                      <OrigemBadge origem={c.origem} />
                    </span>
                    <span>
                      <span className="text-[#4d5562]">Desde: </span>
                      {c.criadoEm}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Dialog ── */}
      <DialogCliente
        open={dialogAberto}
        onOpenChange={setDialogAberto}
        clienteEdicao={clienteEdicao}
        onSave={handleSave}
      />
    </div>
  );
}
