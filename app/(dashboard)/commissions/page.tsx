"use client";

import * as React from "react";
import { useState } from "react";
import {
  CalendarIcon,
  DollarSign,
  FileText,
  ChevronRight,
  ChevronLeft,
  X,
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  ChevronDown,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { formatBRL, maskBRLInput } from "@/utils/format";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type TabKey = "operacional" | "assinaturas" | "historico" | "relatorio";

type ComissaoOperacional = {
  profissional: string;
  servicos: number;
  taxa: number;
  bruto: number;
  liquido: number;
};

// ─── Mock ─────────────────────────────────────────────────────────────────────

const SERVICOS_MOCK = ["Barba", "Corte + Barba", "Corte Masculino"];
const PROFISSIONAIS_MOCK = [
  "Carlos Barbeiro",
  "Marcos Silva",
  "Rafael Costa",
  "Diego Lima",
];
const FILIAIS_MOCK = ["Todas", "Matriz", "Filial Norte", "Filial Sul"];

const COMISSOES_MOCK: ComissaoOperacional[] = [
  {
    profissional: "Carlos Barbeiro",
    servicos: 12,
    taxa: 50,
    bruto: 540,
    liquido: 270,
  },
  {
    profissional: "Marcos Silva",
    servicos: 8,
    taxa: 45,
    bruto: 360,
    liquido: 162,
  },
];

// ─── DatePickerNativo ─────────────────────────────────────────────────────────

function DatePickerNativo({
  id,
  label,
  date,
  onSelect,
}: {
  id: string;
  label: string;
  date: Date | undefined;
  onSelect: (d: Date | undefined) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const formatted = date ? date.toLocaleDateString("pt-BR") : null;

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={id}
        className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
      >
        {label}
      </label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger>
          <button
            id={id}
            type="button"
            className={cn(
              "h-9 px-3 rounded-md border text-sm flex items-center justify-between gap-2 transition-all outline-none bg-surface-base min-w-[150px]",
              open
                ? "border-[#f5b82e]/60"
                : "border-border hover:border-[#f5b82e]/40",
            )}
          >
            <span className={date ? "text-white" : "text-[#4d5562]"}>
              {formatted ?? "dd/mm/aaaa"}
            </span>
            <CalendarIcon
              className={cn(
                "size-3.5 shrink-0",
                open ? "text-brand" : "text-[#4d5562]",
              )}
            />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={6}
          className="w-auto p-0 overflow-hidden bg-surface-raised border border-border rounded-xl shadow-[0_16px_48px_rgba(0,0,0,0.6)]"
        >
          <div className="px-4 pt-4 pb-3 border-b border-[#21262d]">
            <p className="text-[10px] font-bold uppercase tracking-widest text-brand">
              {label}
            </p>
            <p className="text-base font-bold text-white mt-0.5">
              {date
                ? date.toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                : "Nenhuma data"}
            </p>
          </div>
          <div className="p-3">
            <CalendarComponent
              mode="single"
              selected={date}
              defaultMonth={date}
              captionLayout="dropdown"
              locale={ptBR}
              onSelect={(d) => {
                onSelect(d);
                setOpen(false);
              }}
              classNames={{
                root: "",
                months: "text-white",
                month_caption: "flex items-center gap-2 mb-3 px-1",
                caption_label: "hidden",
                dropdowns: "flex items-center gap-2 flex-1",
                dropdown:
                  "bg-surface-base border border-border text-white text-xs rounded-md px-2 py-1.5 cursor-pointer hover:border-[#f5b82e]/40 transition-colors",
                nav: "flex items-center gap-1",
                button_previous:
                  "size-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-white hover:bg-[#21262d] transition-colors border border-transparent hover:border-border",
                button_next:
                  "size-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-white hover:bg-[#21262d] transition-colors border border-transparent hover:border-border",
                weeks: "mt-1 space-y-0.5",
                weekdays: "flex mb-2",
                weekday:
                  "flex-1 text-center text-[10px] font-bold uppercase text-[#4d5562] py-1",
                week: "flex gap-0.5",
                day: "flex-1 flex items-center justify-center",
                day_button:
                  "size-8 text-xs font-medium rounded-md text-muted-foreground hover:bg-[#21262d] hover:text-white transition-colors",
                selected:
                  "!bg-[#f5b82e] !text-black !font-bold rounded-md hover:!bg-[#d9a326]",
                today: "!text-brand !font-bold",
                outside: "opacity-20",
                disabled: "opacity-20 cursor-not-allowed",
              }}
            />
          </div>
          {date && (
            <div className="px-4 pb-3 pt-3 border-t border-[#21262d]">
              <button
                type="button"
                onClick={() => {
                  onSelect(undefined);
                  setOpen(false);
                }}
                className="w-full text-xs font-semibold text-muted-foreground hover:text-red-400 transition-colors py-1 rounded-md hover:bg-red-500/5"
              >
                Limpar
              </button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}

// ─── SelectInline ─────────────────────────────────────────────────────────────

function SelectInline({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id?: string;
  label?: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {label}
        </label>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger>
          <div
            id={id}
            role="button"
            tabIndex={0}
            className="h-9 px-3 rounded-md border border-border bg-surface-base text-sm text-white flex items-center justify-between gap-2 hover:border-[#f5b82e]/40 transition-colors cursor-pointer min-w-[130px]"
          >
            <span>{value}</span>
            <svg
              className="size-3.5 text-muted-foreground"
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
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-surface-raised border-border text-white">
          {options.map((opt) => (
            <DropdownMenuItem
              key={opt}
              onClick={() => onChange(opt)}
              className={cn(
                "text-xs hover:bg-[#21262d] cursor-pointer",
                value === opt && "text-brand",
              )}
            >
              {opt}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// ─── Tab: Operacional ─────────────────────────────────────────────────────────

function TabOperacional() {
  const [periodoIni, setPeriodoIni] = useState<Date | undefined>();
  const [periodoFim, setPeriodoFim] = useState<Date | undefined>();
  const [showData, setShowData] = useState(false);

  const totalBruto = COMISSOES_MOCK.reduce((a, c) => a + c.bruto, 0);
  const totalLiquido = COMISSOES_MOCK.reduce((a, c) => a + c.liquido, 0);

  return (
    <div className="space-y-5">
      {/* Filtros de período */}
      <div className="flex flex-wrap gap-4 items-end">
        <DatePickerNativo
          id="op-ini"
          label="Período Inicial"
          date={periodoIni}
          onSelect={setPeriodoIni}
        />
        <DatePickerNativo
          id="op-fim"
          label="Período Final"
          date={periodoFim}
          onSelect={setPeriodoFim}
        />
        <button
          type="button"
          onClick={() => setShowData(true)}
          className="h-9 px-4 rounded-md text-xs font-bold bg-[#f5b82e] text-black hover:bg-[#d9a326] transition-all self-end"
        >
          Filtrar
        </button>
      </div>

      {/* Cards resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          {
            label: "Total Bruto",
            value: formatBRL(showData ? totalBruto : 0),
            color: "text-white",
          },
          {
            label: "Total Líquido (Comissões)",
            value: formatBRL(showData ? totalLiquido : 0),
            color: "text-brand",
          },
          {
            label: "Profissionais",
            value: showData ? COMISSOES_MOCK.length : 0,
            color: "text-white",
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

      {/* Tabela */}
      <Card className="bg-surface-raised border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                {["Profissional", "Serviços", "Taxa", "Bruto", "Líquido"].map(
                  (h) => (
                    <TableHead
                      key={h}
                      className="text-muted-foreground text-xs uppercase tracking-wider font-semibold px-4 py-3 h-auto"
                    >
                      {h}
                    </TableHead>
                  ),
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {!showData ? (
                <TableRow className="border-border hover:bg-transparent">
                  <TableCell colSpan={5} className="py-14 text-center">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <DollarSign className="size-10 opacity-30" />
                      <p className="text-sm">
                        Nenhuma comissão operacional encontrada. Selecione um
                        período ou crie comandas.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                COMISSOES_MOCK.map((c, i) => (
                  <TableRow
                    key={i}
                    className="border-border hover:bg-[#21262d]/50 transition-colors"
                  >
                    <TableCell className="px-4 py-4 font-semibold text-white text-sm">
                      {c.profissional}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-muted-foreground text-sm">
                      {c.servicos}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-brand font-semibold text-sm">
                      {c.taxa}%
                    </TableCell>
                    <TableCell className="px-4 py-4 text-white text-sm">
                      {formatBRL(c.bruto)}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-emerald-400 font-semibold text-sm">
                      {formatBRL(c.liquido)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Tab: Assinaturas (com wizard 3 etapas) ───────────────────────────────────

function DialogComissaoAssinatura({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [step, setStep] = useState(1);

  // Etapa 1
  const [filial, setFilial] = useState("Todas");
  const [dataIni, setDataIni] = useState<Date | undefined>();
  const [dataFim, setDataFim] = useState<Date | undefined>();
  const [qtdServicos, setQtdServicos] = useState<Record<string, number>>({});

  // Etapa 2
  const [qtdPorBarbeiro, setQtdPorBarbeiro] = useState<
    Record<string, Record<string, number>>
  >({});

  // Etapa 3
  const [faturamento, setFaturamento] = useState("");
  const [pctPote, setPctPote] = useState("50");

  const totalFichasEtapa1 = Object.values(qtdServicos).reduce(
    (a, v) => a + (v || 0),
    0,
  );
  const totalFichasBarbeiros = Object.values(qtdPorBarbeiro).reduce(
    (barb, servs) =>
      barb + Object.values(servs).reduce((a, v) => a + (v || 0), 0),
    0,
  );
  const balanceOk = totalFichasBarbeiros === totalFichasEtapa1;

  const pote =
    (() => {
      const digits = faturamento.replace(/\D/g, "");
      const reais = digits ? parseInt(digits, 10) / 100 : 0;
      return reais * ((parseFloat(pctPote) || 0) / 100);
    })();

  const comissaoPorBarbeiro = PROFISSIONAIS_MOCK.map((prof) => {
    const fichas = Object.values(qtdPorBarbeiro[prof] ?? {}).reduce(
      (a, v) => a + (v || 0),
      0,
    );
    const pct =
      totalFichasBarbeiros > 0 ? (fichas / totalFichasBarbeiros) * 100 : 0;
    const comissao = pote * (pct / 100);
    return { prof, fichas, pct, comissao };
  }).filter((x) => x.fichas > 0);

  const steps = [
    { label: "Serviços totais" },
    { label: "Por barbeiro" },
    { label: "Faturamento" },
  ];

  const handleGerar = () => {
    toast.success("Comissão de assinaturas gerada com sucesso!");
    onOpenChange(false);
    setStep(1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface-raised border border-border text-white max-w-lg p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-[#21262d]">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-sm font-bold">
                Comissão de Assinaturas - Etapa {step}/3
              </DialogTitle>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {step === 1 &&
                  "Informe os serviços totais realizados pela barbearia no período."}
                {step === 2 &&
                  "Distribua os serviços por barbeiro. O total deve fechar com a etapa anterior."}
                {step === 3 &&
                  "Informe o faturamento mensal e a porcentagem do pote."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onOpenChange(false);
                setStep(1);
              }}
              className="size-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-white hover:bg-[#21262d] transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Barra de progresso */}
          <div className="flex gap-1.5 mt-3">
            {steps.map((s, i) => (
              <div
                key={i}
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-colors",
                  i + 1 <= step ? "bg-[#f5b82e]" : "bg-[#30363d]",
                )}
              />
            ))}
          </div>
        </DialogHeader>

        <div
          className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#30363d transparent",
          }}
        >
          {/* Etapa 1 */}
          {step === 1 && (
            <>
              <div className="flex flex-wrap md:flex-nowrap items-end gap-3 bg-surface-base p-4 rounded-xl border border-border">
                {/* Filial - Seguindo a largura maior da imagem */}
                <div className="flex flex-col gap-1.5 flex-1 min-w-[100px]">
                  <label className="text-[13px] font-semibold text-white ml-0.5">
                    Filial
                  </label>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <button className="w-full h-[42px] px-3 rounded-lg border border-border bg-surface-base text-sm text-white flex items-center justify-between group hover:border-[#8b949e] transition-all outline-none">
                        <span className="truncate">{filial || "Todas"}</span>
                        <ChevronDown className="size-4 text-muted-foreground" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-surface-raised border-border text-white min-w-[240px]">
                      <DropdownMenuItem
                        onClick={() => setFilial("Todas")}
                        className="cursor-pointer"
                      >
                        Todas
                      </DropdownMenuItem>
                      {FILIAIS_MOCK.map((f) => (
                        <DropdownMenuItem
                          key={f}
                          onClick={() => setFilial(f)}
                          className="cursor-pointer"
                        >
                          {f}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Data Início - Usando seu DatePickerNativo */}
                <div className="flex-none">
                  <DatePickerNativo
                    id="rel-ini"
                    label="Início"
                    date={dataIni}
                    onSelect={setDataIni}
                  />
                </div>

                {/* Data Fim - Usando seu DatePickerNativo */}
                <div className="flex-none">
                  <DatePickerNativo
                    id="rel-fim"
                    label="Fim"
                    date={dataFim}
                    onSelect={setDataFim}
                  />
                </div>
              </div>

              <div className="border border-border rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 bg-surface-base border-b border-[#21262d]">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Serviço
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Quantidade
                  </span>
                </div>
                {SERVICOS_MOCK.map((s) => (
                  <div
                    key={s}
                    className="flex items-center justify-between px-4 py-3 border-b border-[#21262d] last:border-0"
                  >
                    <span className="text-sm text-white">{s}</span>
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={qtdServicos[s] ?? ""}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, "");
                        setQtdServicos((prev) => ({
                          ...prev,
                          [s]: v ? parseInt(v, 10) : 0,
                        }));
                      }}
                      placeholder="0"
                      className="w-20 h-8 text-sm text-center bg-surface-base border-border text-white focus-visible:ring-[#f5b82e]/30"
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between px-4 py-3 bg-surface-base rounded-lg border border-[#21262d]">
                <span className="text-sm text-muted-foreground">Total de Fichas</span>
                <span className="text-sm font-bold text-white">
                  {totalFichasEtapa1}
                </span>
              </div>
            </>
          )}

          {/* Etapa 2 */}
          {step === 2 && (
            <>
              {!balanceOk && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-md bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                  <AlertCircle className="size-3.5 shrink-0" />
                  Soma dos barbeiros ({totalFichasBarbeiros}) ≠ total da etapa 1
                  ({totalFichasEtapa1})
                </div>
              )}
              {balanceOk && totalFichasBarbeiros > 0 && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
                  <CheckCircle2 className="size-3.5 shrink-0" />
                  Totais conferem! Pode avançar.
                </div>
              )}

              {PROFISSIONAIS_MOCK.map((prof) => {
                const totalProf = Object.values(
                  qtdPorBarbeiro[prof] ?? {},
                ).reduce((a, v) => a + (v || 0), 0);
                return (
                  <div
                    key={prof}
                    className="border border-border rounded-lg overflow-hidden"
                  >
                    <div className="flex items-center justify-between px-4 py-2.5 bg-surface-base border-b border-[#21262d]">
                      <span className="text-sm font-semibold text-white">
                        {prof}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Fichas: {totalProf}
                      </span>
                    </div>
                    <div className="px-4 py-3 flex flex-wrap gap-4">
                      {SERVICOS_MOCK.map((s) => (
                        <div key={s} className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{s}</span>
                          <Input
                            type="text"
                            inputMode="numeric"
                            value={(qtdPorBarbeiro[prof] ?? {})[s] ?? ""}
                            onChange={(e) => {
                              const v = e.target.value.replace(/\D/g, "");
                              setQtdPorBarbeiro((prev) => ({
                                ...prev,
                                [prof]: {
                                  ...(prev[prof] ?? {}),
                                  [s]: v ? parseInt(v, 10) : 0,
                                },
                              }));
                            }}
                            placeholder="0"
                            className="w-16 h-8 text-sm text-center bg-surface-base border-border text-white focus-visible:ring-[#f5b82e]/30"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              <div
                className={cn(
                  "flex items-center justify-between px-4 py-3 rounded-lg border",
                  balanceOk && totalFichasBarbeiros > 0
                    ? "bg-emerald-500/5 border-emerald-500/20"
                    : "bg-surface-base border-[#21262d]",
                )}
              >
                <span className="text-sm text-muted-foreground">Total Barbeiros</span>
                <span
                  className={cn(
                    "text-sm font-bold",
                    balanceOk && totalFichasBarbeiros > 0
                      ? "text-emerald-400"
                      : "text-red-400",
                  )}
                >
                  {totalFichasBarbeiros} / {totalFichasEtapa1}
                </span>
              </div>
            </>
          )}

          {/* Etapa 3 */}
          {step === 3 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Faturamento em Assinaturas
                  </label>
                  <Input
                    value={faturamento}
                    onChange={(e) => setFaturamento(maskBRLInput(e.target.value))}
                    inputMode="numeric"
                    placeholder="R$ 0,00"
                    className="bg-surface-base border-border text-white focus-visible:ring-[#f5b82e]/30 h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    % do Pote
                  </label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={pctPote}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "");
                      const n = v ? Math.min(100, parseInt(v, 10)) : 0;
                      setPctPote(String(n));
                    }}
                    placeholder="0"
                    className="bg-surface-base border-border text-white focus-visible:ring-[#f5b82e]/30 h-10"
                  />
                </div>
              </div>

              <div className="px-4 py-3 rounded-lg bg-[#241a06] border border-[#f5b82e]/20">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                  Valor Total do Pote
                </p>
                <p className="text-2xl font-bold text-brand">
                  {formatBRL(pote)}
                </p>
              </div>

              <div className="border border-border rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 bg-surface-base border-b border-[#21262d]">
                  {["Barbeiro", "Fichas", "%", "Comissão"].map((h) => (
                    <span
                      key={h}
                      className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                    >
                      {h}
                    </span>
                  ))}
                </div>
                {comissaoPorBarbeiro.length === 0 ? (
                  <div className="px-4 py-6 text-center text-xs text-[#4d5562]">
                    Defina a distribuição na etapa anterior.
                  </div>
                ) : (
                  comissaoPorBarbeiro.map((c) => (
                    <div
                      key={c.prof}
                      className="flex items-center justify-between px-4 py-3 border-b border-[#21262d] last:border-0"
                    >
                      <span className="text-sm font-semibold text-white">
                        {c.prof}
                      </span>
                      <span className="text-sm text-muted-foreground">{c.fichas}</span>
                      <span className="text-sm text-muted-foreground">
                        {c.pct.toFixed(1)}%
                      </span>
                      <span className="text-sm font-bold text-brand">
                        {formatBRL(c.comissao)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        <div className="px-6 py-4 border-t border-[#21262d] flex items-center justify-between shrink-0 bg-surface-raised">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="h-9 px-4 rounded-md border border-border bg-transparent text-sm text-white hover:bg-[#21262d] transition-colors flex items-center gap-1.5"
            >
              <ChevronLeft className="size-4" />
              Voltar
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => {
                if (step === 2 && !balanceOk) {
                  toast.error(
                    "Distribua corretamente as fichas antes de avançar.",
                  );
                  return;
                }
                setStep((s) => s + 1);
              }}
              className="h-9 px-4 rounded-md text-sm font-bold bg-[#f5b82e] text-black hover:bg-[#d9a326] transition-all flex items-center gap-1.5"
            >
              Próximo
              <ChevronRight className="size-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleGerar}
              className="h-9 px-4 rounded-md text-sm font-bold bg-[#f5b82e] text-black hover:bg-[#d9a326] transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="size-4" />
              Gerar Comissão
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TabAssinaturas({ onGerarClick }: { onGerarClick: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-muted-foreground">
      <DollarSign className="size-12 opacity-20" />
      <p className="text-sm text-center">
        Use o botão Gerar Comissão Assinatura para criar um novo cálculo em 3
        etapas.
      </p>
      <button
        type="button"
        onClick={onGerarClick}
        className="h-9 px-4 rounded-md border border-border bg-surface-raised text-sm text-white flex items-center gap-2 hover:border-[#f5b82e]/40 transition-colors"
      >
        <ClipboardList className="size-3.5 text-muted-foreground" />
        Iniciar Cálculo
      </button>
    </div>
  );
}

function TabHistorico() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
      <FileText className="size-10 opacity-30" />
      <p className="text-sm">Nenhum histórico de comissões encontrado.</p>
    </div>
  );
}

function TabRelatorio() {
  const [dataIni, setDataIni] = useState<Date | undefined>();
  const [dataFim, setDataFim] = useState<Date | undefined>();
  const [filial, setFilial] = useState("Todas");
  const [barbeiro, setBarbeiro] = useState("Todos");

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-4 items-end">
        <DatePickerNativo
          id="rel-ini"
          label="De"
          date={dataIni}
          onSelect={setDataIni}
        />
        <DatePickerNativo
          id="rel-fim"
          label="Até"
          date={dataFim}
          onSelect={setDataFim}
        />
        <SelectInline
          label="Filial"
          value={filial}
          options={FILIAIS_MOCK}
          onChange={setFilial}
        />
        <SelectInline
          label="Barbeiro"
          value={barbeiro}
          options={["Todos", ...PROFISSIONAIS_MOCK]}
          onChange={setBarbeiro}
        />
      </div>
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
        <FileText className="size-10 opacity-30" />
        <p className="text-sm">
          Nenhum dado encontrado para os filtros selecionados.
        </p>
      </div>
    </div>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────

const TABS: { key: TabKey; label: string }[] = [
  { key: "operacional", label: "Operacional" },
  { key: "assinaturas", label: "Assinaturas" },
  { key: "historico", label: "Histórico" },
  { key: "relatorio", label: "Relatório" },
];

export default function ComissoesPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("operacional");
  const [dialogAssinatura, setDialogAssinatura] = useState(false);

  return (
    <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Comissões
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Cálculo e histórico de comissões
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDialogAssinatura(true)}
          className="h-9 px-4 rounded-md text-sm font-bold bg-[#f5b82e] text-black hover:bg-[#d9a326] hover:shadow-[0_0_16px_rgba(245,184,46,0.3)] transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <ClipboardList className="size-3.5" />
          Gerar Comissão Assinatura
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-4 py-2 rounded-md text-xs font-semibold transition-colors",
              activeTab === tab.key
                ? "bg-[#f5b82e] text-black"
                : "text-muted-foreground hover:text-white hover:bg-[#21262d]",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "operacional" && <TabOperacional />}
      {activeTab === "assinaturas" && (
        <TabAssinaturas onGerarClick={() => setDialogAssinatura(true)} />
      )}
      {activeTab === "historico" && <TabHistorico />}
      {activeTab === "relatorio" && <TabRelatorio />}

      <DialogComissaoAssinatura
        open={dialogAssinatura}
        onOpenChange={setDialogAssinatura}
      />
    </div>
  );
}
