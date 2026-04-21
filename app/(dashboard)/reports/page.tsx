/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { useState } from "react";
import {
  DollarSign,
  BarChart2,
  Package,
  Users,
  Scissors,
  Star,
  CreditCard,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  SlidersHorizontal,
  CalendarIcon,
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Field, FieldLabel } from "@/components/ui/field";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type SubReportKey = string;

type SubReport = {
  key: SubReportKey;
  title: string;
  description: string;
};

type ReportGroup = {
  key: string;
  title: string;
  icon: React.ReactNode;
  items: SubReport[];
};

// ─── Estrutura de relatórios ──────────────────────────────────────────────────

const REPORT_GROUPS: ReportGroup[] = [
  {
    key: "financeiro",
    title: "Financeiros",
    icon: <DollarSign className="size-4" />,
    items: [
      {
        key: "vendas",
        title: "Vendas",
        description: "Despesas pendentes e pagas",
      },
      {
        key: "formas_pagamento",
        title: "Formas de Pagamento",
        description: "Histórico por forma de pagamento",
      },
      {
        key: "faturamento_visao",
        title: "Faturamento - Visão Geral",
        description: "Visão consolidada do faturamento",
      },
      {
        key: "faturamento_detalhado",
        title: "Faturamento - Detalhado",
        description: "Detalhes por comanda e assinatura",
      },
      {
        key: "historico_movimentacoes",
        title: "Histórico de Movimentações",
        description: "Histórico completo de movimentações",
      },
    ],
  },
  {
    key: "gestao",
    title: "Gestão",
    icon: <BarChart2 className="size-4" />,
    items: [
      {
        key: "frequencia_cliente",
        title: "Frequência do Cliente",
        description: "Histórico e análise de agendamentos",
      },
      {
        key: "frequencia_kpis",
        title: "Frequência do Cliente - KPIs",
        description: "Indicadores de frequência",
      },
      {
        key: "cliente_periodo_servico",
        title: "Cliente por Período e Serviço",
        description: "Clientes por serviço consumido",
      },
      {
        key: "servicos_vendidos",
        title: "Serviços Vendidos",
        description: "Histórico de serviços realizados",
      },
      {
        key: "historico_agendamentos",
        title: "Histórico de Agendamentos",
        description: "Todos os agendamentos do período",
      },
      {
        key: "historico_venda_produtos",
        title: "Histórico de Venda de Produtos",
        description: "Produtos vendidos no período",
      },
    ],
  },
  {
    key: "estoque",
    title: "Estoque",
    icon: <Package className="size-4" />,
    items: [
      {
        key: "entrada_saida_estoque",
        title: "Entrada e Saída de Estoque",
        description: "Relatório de movimentações de estoque",
      },
      {
        key: "estoque_atual",
        title: "Estoque Atual",
        description: "Posição atual do estoque",
      },
    ],
  },
  {
    key: "profissionais",
    title: "Profissionais",
    icon: <Scissors className="size-4" />,
    items: [
      {
        key: "ticket_medio_atendimento",
        title: "Ticket Médio por Atendimento",
        description: "Valor médio por atendimento",
      },
      {
        key: "ticket_medio_clientes",
        title: "Ticket Médio de Clientes Distintos",
        description: "Ticket por cliente único",
      },
      {
        key: "comissoes_servicos",
        title: "Comissões de Serviços",
        description: "Comissões calculadas por serviço",
      },
      {
        key: "comissoes_produtos",
        title: "Comissões de Produtos",
        description: "Comissões calculadas por produto",
      },
    ],
  },
  {
    key: "marketing",
    title: "Marketing de Experiência",
    icon: <Star className="size-4" />,
    items: [
      {
        key: "captacao_clientes",
        title: "Captação de Clientes",
        description: "Origem dos novos clientes",
      },
      {
        key: "novos_clientes",
        title: "Novos Clientes",
        description: "Clientes adquiridos no período",
      },
      {
        key: "clientes_ausentes",
        title: "Clientes Ausentes",
        description: "Clientes sem visita recente",
      },
      {
        key: "avaliacoes",
        title: "Avaliações",
        description: "Notas e feedbacks recebidos",
      },
      {
        key: "aniversariantes",
        title: "Aniversariantes por Período",
        description: "Clientes aniversariantes",
      },
      {
        key: "clientes_sem_preferencia",
        title: "Clientes sem Preferência",
        description: "Clientes sem profissional fixo",
      },
    ],
  },
  {
    key: "assinaturas",
    title: "Assinaturas",
    icon: <CreditCard className="size-4" />,
    items: [
      {
        key: "qtd_assinantes",
        title: "Quantidade de Assinantes",
        description: "Assinantes ativos e cancelamentos",
      },
      {
        key: "cancelados_periodo",
        title: "Cancelados por Período",
        description: "Assinaturas canceladas",
      },
      {
        key: "vendas_novas_periodo",
        title: "Vendas Novas por Período",
        description: "Novas assinaturas no período",
      },
      {
        key: "vendas_por_origem",
        title: "Vendas por Origem",
        description: "Assinaturas por canal de entrada",
      },
    ],
  },
  {
    key: "ticket_medio",
    title: "Ticket Médio",
    icon: <Users className="size-4" />,
    items: [
      {
        key: "ticket_por_profissional",
        title: "Por Profissional",
        description: "Ticket médio por profissional",
      },
      {
        key: "ticket_por_cliente",
        title: "Por Cliente",
        description: "Ticket médio por cliente",
      },
      {
        key: "ticket_por_agendamento",
        title: "Por Agendamento",
        description: "Ticket médio por agendamento",
      },
    ],
  },
];

// ─── Opções de select ─────────────────────────────────────────────────────────

const FILIAIS = ["Todas as filiais", "Matriz", "Filial Norte", "Filial Sul"];
const PROFISSIONAIS = ["Todos", "Carlos", "Marcos", "Rafael", "Diego"];
const CLIENTES_OPT = ["Todos", "João Silva", "Ana Costa", "Pedro Lima"];
const CATEGORIAS = ["Todas", "Serviços", "Produtos", "Assinaturas"];
const PRODUTOS = ["Todos", "Pomada Modeladora", "Shampoo", "Óleo de Barba"];
const SERVICOS = ["Todos", "Corte", "Barba", "Corte + Barba", "Sobrancelha"];
const TIPOS_PAGAMENTO = [
  "Todos",
  "Dinheiro",
  "Pix",
  "Cartão de Crédito",
  "Cartão de Débito",
  "Boleto",
];
const ORIGENS_COBRANCA = ["Todas", "Comanda", "Assinatura", "Manual"];
const CAIXAS = ["Todos", "Caixa Matriz", "Caixa Norte", "Caixa Sul"];

// ─── DatePickerField ──────────────────────────────────────────────────────────

function DatePickerField({
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
  const [open, setOpen] = useState(false);
  const formatted = date ? date.toLocaleDateString("pt-BR") : null;

  return (
    <Field className="flex-1 min-w-[140px]">
      <FieldLabel
        htmlFor={id}
        className="text-[10px] font-bold uppercase tracking-widest text-[#f5b82e]"
      >
        {label}
      </FieldLabel>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger>
          <button
            id={id}
            type="button"
            className={cn(
              "group w-full h-10 px-3 rounded-md border text-sm flex items-center justify-between gap-2 transition-all outline-none bg-[#0d1117]",
              open
                ? "border-[#f5b82e]/70 shadow-[0_0_0_3px_rgba(245,184,46,0.08)]"
                : "border-[#30363d] hover:border-[#f5b82e]/40",
            )}
          >
            <span
              className={date ? "text-white font-medium" : "text-[#4d5562]"}
            >
              {formatted ?? "dd/mm/aaaa"}
            </span>
            <CalendarIcon
              className={cn(
                "size-3.5 shrink-0 transition-colors",
                open
                  ? "text-[#f5b82e]"
                  : "text-[#4d5562] group-hover:text-[#8b949e]",
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
              Selecionar data
            </p>
            <p className="text-base font-bold text-white mt-0.5">
              {date
                ? date.toLocaleDateString("pt-BR", {
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
                  "!bg-[#f5b82e] !text-black !font-bold rounded-md hover:!bg-[#d9a326] shadow-[0_0_12px_rgba(245,184,46,0.3)]",
                today: "!text-[#f5b82e] !font-bold",
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
                className="w-full text-xs font-semibold text-[#8b949e] hover:text-red-400 transition-colors py-1 rounded-md hover:bg-red-500/5"
              >
                Limpar data
              </button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </Field>
  );
}

// ─── SelectField ──────────────────────────────────────────────────────────────

function SelectField({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <Field className="flex-1 min-w-[140px]">
      <FieldLabel
        htmlFor={id}
        className="text-[10px] font-bold uppercase tracking-widest text-[#f5b82e]"
      >
        {label}
      </FieldLabel>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <div
            id={id}
            role="button"
            tabIndex={0}
            className="w-full h-10 px-3 rounded-md border border-[#30363d] bg-[#0d1117] text-sm text-white flex items-center justify-between gap-2 hover:border-[#f5b82e]/40 transition-colors cursor-pointer"
          >
            <span className="truncate">{value}</span>
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
    </Field>
  );
}

// ─── CheckboxField ────────────────────────────────────────────────────────────

function CheckboxField({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(v: any) => onChange(!!v)}
        className="border-[#30363d] data-[state=checked]:bg-[#f5b82e] data-[state=checked]:border-[#f5b82e] data-[state=checked]:text-black"
      />
      <label
        htmlFor={id}
        className="text-xs text-[#8b949e] cursor-pointer select-none"
      >
        {label}
      </label>
    </div>
  );
}

// ─── FilterCard ───────────────────────────────────────────────────────────────

function FilterCard({
  children,
  onFilter,
}: {
  children: React.ReactNode;
  onFilter?: () => void;
}) {
  return (
    <Card className="bg-[#161b22] border-[#30363d]">
      <CardContent className="p-4 space-y-4">
        <div className="flex flex-wrap gap-4 items-end">{children}</div>
        {onFilter && (
          <div className="flex items-center justify-end pt-1">
            <button
              type="button"
              onClick={onFilter}
              className="h-9 px-5 rounded-md text-xs font-bold uppercase tracking-widest bg-[#f5b82e] text-black hover:bg-[#d9a326] hover:shadow-[0_0_16px_rgba(245,184,46,0.35)] transition-all flex items-center gap-2"
            >
              <SlidersHorizontal className="size-3.5" />
              Filtrar
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

function EmptyTableState({ cols }: { cols: number }) {
  return (
    <TableRow className="border-[#30363d] hover:bg-transparent">
      <TableCell colSpan={cols} className="py-14 text-center">
        <div className="flex flex-col items-center gap-3 text-[#8b949e]">
          <BarChart2 className="size-10 opacity-30" />
          <p className="text-sm">
            Nenhum dado encontrado para os filtros selecionados.
          </p>
        </div>
      </TableCell>
    </TableRow>
  );
}

// ─── StyledTable ──────────────────────────────────────────────────────────────

function StyledTable({
  headers,
  children,
}: {
  headers: string[];
  children: React.ReactNode;
}) {
  return (
    <Card className="bg-[#161b22] border-[#30363d]">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-[#30363d] hover:bg-transparent">
                {headers.map((h) => (
                  <TableHead
                    key={h}
                    className="text-[#8b949e] text-xs uppercase tracking-wider font-semibold px-4 py-3 h-auto whitespace-nowrap"
                  >
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>{children}</TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Sub-relatórios financeiros ───────────────────────────────────────────────

function RelVendas() {
  const [dataIni, setDataIni] = useState<Date | undefined>();
  const [dataFim, setDataFim] = useState<Date | undefined>();
  const [filial, setFilial] = useState(FILIAIS[0]);
  const [profissional, setProfissional] = useState(PROFISSIONAIS[0]);
  const [categoria, setCategoria] = useState(CATEGORIAS[0]);
  const [produto, setProduto] = useState(PRODUTOS[0]);
  const [servico, setServico] = useState(SERVICOS[0]);
  const [inativos, setInativos] = useState(false);

  return (
    <div className="space-y-4">
      <FilterCard>
        <DatePickerField
          id="v-ini"
          label="Data Inicial"
          date={dataIni}
          onSelect={setDataIni}
        />
        <DatePickerField
          id="v-fim"
          label="Data Final"
          date={dataFim}
          onSelect={setDataFim}
        />
        <SelectField
          id="v-fil"
          label="Filial"
          value={filial}
          options={FILIAIS}
          onChange={setFilial}
        />
        <SelectField
          id="v-pro"
          label="Profissional"
          value={profissional}
          options={PROFISSIONAIS}
          onChange={setProfissional}
        />
        <SelectField
          id="v-cat"
          label="Categorias"
          value={categoria}
          options={CATEGORIAS}
          onChange={setCategoria}
        />
        <SelectField
          id="v-prod"
          label="Produtos"
          value={produto}
          options={PRODUTOS}
          onChange={setProduto}
        />
        <SelectField
          id="v-serv"
          label="Serviços"
          value={servico}
          options={SERVICOS}
          onChange={setServico}
        />
        <div className="flex items-end pb-1">
          <CheckboxField
            id="v-inat"
            label="Mostrar registros inativos"
            checked={inativos}
            onChange={setInativos}
          />
        </div>
      </FilterCard>
    </div>
  );
}

function RelFormasPagamento() {
  const [dataIni, setDataIni] = useState<Date | undefined>();
  const [dataFim, setDataFim] = useState<Date | undefined>();
  const [filial, setFilial] = useState(FILIAIS[0]);
  const [profissional, setProfissional] = useState(PROFISSIONAIS[0]);
  const [tipoPag, setTipoPag] = useState(TIPOS_PAGAMENTO[0]);
  const [categoria, setCategoria] = useState(CATEGORIAS[0]);
  const [caixa, setCaixa] = useState(CAIXAS[0]);
  const [inativos, setInativos] = useState(false);

  return (
    <FilterCard onFilter={() => {}}>
      <DatePickerField
        id="fp-ini"
        label="Data Inicial"
        date={dataIni}
        onSelect={setDataIni}
      />
      <DatePickerField
        id="fp-fim"
        label="Data Final"
        date={dataFim}
        onSelect={setDataFim}
      />
      <SelectField
        id="fp-fil"
        label="Filial"
        value={filial}
        options={FILIAIS}
        onChange={setFilial}
      />
      <SelectField
        id="fp-pro"
        label="Profissional"
        value={profissional}
        options={PROFISSIONAIS}
        onChange={setProfissional}
      />
      <SelectField
        id="fp-tip"
        label="Tipo de Pagamento"
        value={tipoPag}
        options={TIPOS_PAGAMENTO}
        onChange={setTipoPag}
      />
      <SelectField
        id="fp-cat"
        label="Categoria"
        value={categoria}
        options={CATEGORIAS}
        onChange={setCategoria}
      />
      <SelectField
        id="fp-cx"
        label="Caixa"
        value={caixa}
        options={CAIXAS}
        onChange={setCaixa}
      />
      <div className="flex items-end pb-1">
        <CheckboxField
          id="fp-inat"
          label="Mostrar registros inativos"
          checked={inativos}
          onChange={setInativos}
        />
      </div>
    </FilterCard>
  );
}

function RelFaturamentoVisao() {
  const [dataIni, setDataIni] = useState<Date | undefined>();
  const [dataFim, setDataFim] = useState<Date | undefined>();
  const [cliente, setCliente] = useState(CLIENTES_OPT[0]);
  const [filial, setFilial] = useState(FILIAIS[0]);
  const [profissional, setProfissional] = useState(PROFISSIONAIS[0]);
  const [origem, setOrigem] = useState(ORIGENS_COBRANCA[0]);
  const [inativos, setInativos] = useState(false);

  return (
    <FilterCard onFilter={() => {}}>
      <DatePickerField
        id="fv-ini"
        label="Data Inicial"
        date={dataIni}
        onSelect={setDataIni}
      />
      <DatePickerField
        id="fv-fim"
        label="Data Final"
        date={dataFim}
        onSelect={setDataFim}
      />
      <SelectField
        id="fv-cli"
        label="Cliente"
        value={cliente}
        options={CLIENTES_OPT}
        onChange={setCliente}
      />
      <SelectField
        id="fv-fil"
        label="Filial"
        value={filial}
        options={FILIAIS}
        onChange={setFilial}
      />
      <SelectField
        id="fv-pro"
        label="Profissional"
        value={profissional}
        options={PROFISSIONAIS}
        onChange={setProfissional}
      />
      <SelectField
        id="fv-ori"
        label="Origem da Cobrança"
        value={origem}
        options={ORIGENS_COBRANCA}
        onChange={setOrigem}
      />
      <div className="flex items-end pb-1">
        <CheckboxField
          id="fv-inat"
          label="Mostrar registros inativos"
          checked={inativos}
          onChange={setInativos}
        />
      </div>
    </FilterCard>
  );
}

function RelFaturamentoDetalhado() {
  return (
    <StyledTable
      headers={[
        "ID Comanda",
        "Filial",
        "Profissional",
        "Cliente",
        "Tipo Pagamento",
        "Valor",
        "Data e Hora",
      ]}
    >
      <EmptyTableState cols={7} />
    </StyledTable>
  );
}

function RelHistoricoMovimentacoes() {
  const [dataIni, setDataIni] = useState<Date | undefined>();
  const [dataFim, setDataFim] = useState<Date | undefined>();
  const [cliente, setCliente] = useState(CLIENTES_OPT[0]);
  const [filial, setFilial] = useState(FILIAIS[0]);
  const [profissional, setProfissional] = useState(PROFISSIONAIS[0]);
  const [inativos, setInativos] = useState(false);

  return (
    <div className="space-y-4">
      <FilterCard onFilter={() => {}}>
        <DatePickerField
          id="hm-ini"
          label="Data Inicial"
          date={dataIni}
          onSelect={setDataIni}
        />
        <DatePickerField
          id="hm-fim"
          label="Data Final"
          date={dataFim}
          onSelect={setDataFim}
        />
        <SelectField
          id="hm-cli"
          label="Cliente"
          value={cliente}
          options={CLIENTES_OPT}
          onChange={setCliente}
        />
        <SelectField
          id="hm-fil"
          label="Filial"
          value={filial}
          options={FILIAIS}
          onChange={setFilial}
        />
        <SelectField
          id="hm-pro"
          label="Profissional"
          value={profissional}
          options={PROFISSIONAIS}
          onChange={setProfissional}
        />
        <div className="flex items-end pb-1">
          <CheckboxField
            id="hm-inat"
            label="Mostrar registros inativos"
            checked={inativos}
            onChange={setInativos}
          />
        </div>
      </FilterCard>
      <StyledTable
        headers={[
          "ID Comanda",
          "Filial",
          "Profissional",
          "Cliente",
          "Nome Op. Caixa",
          "Desc. Op. Caixa",
          "Tipo Pagamento",
          "Valor",
          "Data e Hora",
        ]}
      >
        <EmptyTableState cols={9} />
      </StyledTable>
    </div>
  );
}

// ─── Sub-relatórios genéricos com form padrão ─────────────────────────────────

function RelGenericoComForm({ id: rid }: { id: string }) {
  const [dataIni, setDataIni] = useState<Date | undefined>();
  const [dataFim, setDataFim] = useState<Date | undefined>();
  const [filial, setFilial] = useState(FILIAIS[0]);
  const [profissional, setProfissional] = useState(PROFISSIONAIS[0]);
  const [inativos, setInativos] = useState(false);

  return (
    <FilterCard onFilter={() => {}}>
      <DatePickerField
        id={`${rid}-ini`}
        label="Data Inicial"
        date={dataIni}
        onSelect={setDataIni}
      />
      <DatePickerField
        id={`${rid}-fim`}
        label="Data Final"
        date={dataFim}
        onSelect={setDataFim}
      />
      <SelectField
        id={`${rid}-fil`}
        label="Filial"
        value={filial}
        options={FILIAIS}
        onChange={setFilial}
      />
      <SelectField
        id={`${rid}-pro`}
        label="Profissional"
        value={profissional}
        options={PROFISSIONAIS}
        onChange={setProfissional}
      />
      <div className="flex items-end pb-1">
        <CheckboxField
          id={`${rid}-inat`}
          label="Mostrar registros inativos"
          checked={inativos}
          onChange={setInativos}
        />
      </div>
    </FilterCard>
  );
}

// ─── Mapa de renderização de sub-relatórios ───────────────────────────────────

function renderSubReport(key: SubReportKey) {
  switch (key) {
    case "vendas":
      return <RelVendas />;
    case "formas_pagamento":
      return <RelFormasPagamento />;
    case "faturamento_visao":
      return <RelFaturamentoVisao />;
    case "faturamento_detalhado":
      return <RelFaturamentoDetalhado />;
    case "historico_movimentacoes":
      return <RelHistoricoMovimentacoes />;
    default:
      return <RelGenericoComForm id={key} />;
  }
}

// ─── ReportGroupCard ──────────────────────────────────────────────────────────

function ReportGroupCard({
  group,
  onSelect,
  activeKey,
}: {
  group: ReportGroup;
  onSelect: (groupKey: string, itemKey: SubReportKey) => void;
  activeKey: string | null;
}) {
  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 flex flex-col gap-3">
      {/* Header do grupo */}
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[#f5b82e]">{group.icon}</span>
        <h2 className="text-sm font-bold text-[#f5b82e] uppercase tracking-wider">
          {group.title}
        </h2>
      </div>

      {/* Items */}
      <div className="space-y-2">
        {group.items.map((item) => {
          const isActive = activeKey === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelect(group.key, item.key)}
              className={cn(
                "w-full text-left rounded-lg p-3 border transition-all group",
                isActive
                  ? "bg-[#f5b82e]/10 border-[#f5b82e]/50"
                  : "bg-[#0d1117] border-[#30363d] hover:border-[#f5b82e]/30 hover:bg-[#f5b82e]/5",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p
                    className={cn(
                      "text-sm font-semibold transition-colors",
                      isActive
                        ? "text-[#f5b82e]"
                        : "text-white group-hover:text-[#f5b82e]",
                    )}
                  >
                    {item.title}
                  </p>
                  <p className="text-[11px] text-[#4d5562] mt-0.5">
                    {item.description}
                  </p>
                </div>
                <ChevronRight
                  className={cn(
                    "size-4 shrink-0 transition-colors",
                    isActive
                      ? "text-[#f5b82e]"
                      : "text-[#30363d] group-hover:text-[#f5b82e]/50",
                  )}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function RelatoriosPage() {
  const [activeGroupKey, setActiveGroupKey] = useState<string | null>(null);
  const [activeItemKey, setActiveItemKey] = useState<SubReportKey | null>(null);

  const activeGroup = REPORT_GROUPS.find((g) => g.key === activeGroupKey);
  const activeItem = activeGroup?.items.find((i) => i.key === activeItemKey);

  const handleSelect = (groupKey: string, itemKey: SubReportKey) => {
    // Toggle: se já ativo, fecha
    if (activeGroupKey === groupKey && activeItemKey === itemKey) {
      setActiveGroupKey(null);
      setActiveItemKey(null);
    } else {
      setActiveGroupKey(groupKey);
      setActiveItemKey(itemKey);
    }
  };

  const handleBack = () => {
    setActiveGroupKey(null);
    setActiveItemKey(null);
  };

  // Organiza grupos em layout 3 colunas igual ao design
  const col1 = REPORT_GROUPS.filter((_, i) => i % 3 === 0);
  const col2 = REPORT_GROUPS.filter((_, i) => i % 3 === 1);
  const col3 = REPORT_GROUPS.filter((_, i) => i % 3 === 2);

  return (
    <div className="space-y-6 p-4 md:p-6 bg-[#0d1117] min-h-screen text-white">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Relatórios
          </h1>
          <p className="text-[#8b949e] text-sm mt-1">
            Análises e métricas do seu negócio
          </p>
        </div>

        {activeItem && (
          <button
            type="button"
            onClick={handleBack}
            className="h-9 px-4 rounded-md border border-[#30363d] bg-[#161b22] text-sm text-white flex items-center gap-2 hover:border-[#f5b82e]/40 transition-colors self-start sm:self-auto"
          >
            <ArrowLeft className="size-3.5 text-[#8b949e]" />
            Voltar
          </button>
        )}
      </div>

      {/* ── Relatório aberto ── */}
      {activeItem && activeGroup && (
        <div className="space-y-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-[#4d5562]">
            <span className="text-[#f5b82e]">{activeGroup.title}</span>
            <ChevronRight className="size-3" />
            <span className="text-white font-medium">{activeItem.title}</span>
          </div>

          {/* Título do relatório */}
          <div className="flex items-center gap-3">
            <span className="text-[#f5b82e]">{activeGroup.icon}</span>
            <div>
              <h2 className="text-lg font-bold text-white">
                {activeItem.title}
              </h2>
              <p className="text-xs text-[#8b949e]">{activeItem.description}</p>
            </div>
          </div>

          {renderSubReport(activeItemKey!)}
        </div>
      )}

      {/* ── Grid de grupos ── */}
      {!activeItem && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[col1, col2, col3].map((col, ci) => (
            <div key={ci} className="space-y-5">
              {col.map((group) => (
                <ReportGroupCard
                  key={group.key}
                  group={group}
                  onSelect={handleSelect}
                  activeKey={
                    activeGroupKey === group.key ? activeItemKey : null
                  }
                />
              ))}
            </div>
          ))}
        </div>
      )}

      {/* ── Grid com item selecionado: mostra sidebar colapsada ── */}
      {activeItem && (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-5 mt-2">
          {/* Sidebar: grupos compactos */}
          <div className="xl:col-span-1 space-y-2">
            {REPORT_GROUPS.map((group) => (
              <div
                key={group.key}
                className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden"
              >
                <div className="flex items-center gap-2 px-4 py-3 border-b border-[#21262d]">
                  <span className="text-[#f5b82e]">{group.icon}</span>
                  <span className="text-[11px] font-bold text-[#f5b82e] uppercase tracking-wider">
                    {group.title}
                  </span>
                </div>
                <div className="p-2 space-y-1">
                  {group.items.map((item) => {
                    const isActive =
                      activeGroupKey === group.key &&
                      activeItemKey === item.key;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => handleSelect(group.key, item.key)}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-md text-xs transition-colors",
                          isActive
                            ? "bg-[#f5b82e]/15 text-[#f5b82e] font-semibold"
                            : "text-[#8b949e] hover:text-white hover:bg-[#21262d]",
                        )}
                      >
                        {item.title}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Conteúdo principal */}
          <div className="xl:col-span-3 space-y-4">
            <div className="flex items-center gap-2 text-xs text-[#4d5562]">
              <span className="text-[#f5b82e]">{activeGroup?.title}</span>
              <ChevronRight className="size-3" />
              <span className="text-white font-medium">{activeItem.title}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[#f5b82e]">{activeGroup?.icon}</span>
              <div>
                <h2 className="text-lg font-bold text-white">
                  {activeItem.title}
                </h2>
                <p className="text-xs text-[#8b949e]">
                  {activeItem.description}
                </p>
              </div>
            </div>
            {renderSubReport(activeItemKey!)}
          </div>
        </div>
      )}
    </div>
  );
}
