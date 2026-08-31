"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Package,
  Plus,
  Scissors,
  Trash2,
  Wallet,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FormSection } from "./FormSection";
import { LabeledInput, LabeledSelect } from "./FormField";
import { useAppointments } from "@/hooks/useAppointments";
import { useCashRegisters } from "@/hooks/useCashRegisters";
import { useEmployees } from "@/hooks/useEmployees";
import { usePaymentMethods } from "@/hooks/usePaymentMethods";
import { useProducts } from "@/hooks/useProducts";
import { useServices } from "@/hooks/useServices";
import { useCategories } from "@/hooks/useCategories";
import { subscriptionsService } from "@/services/subscriptions.service";
import {
  formatBRLFromCents,
  formatDate,
  formatTime,
  maskBRLInput,
  parseBRL,
} from "@/utils/format";
import type { Comanda, ComandaItem, ComandaItemTipo } from "@/types/orders.types";
import type { SelectOption } from "@/types/common.types";

/** Total líquido (bruto - desconto) de um item, em centavos. */
function itemLiquidoInCents(item: ComandaItem): number {
  return item.quantidade * item.valorUnitarioInCents - item.descontoInCents;
}

function somaLiquida(itens: ComandaItem[]): number {
  return itens.reduce((acc, item) => acc + itemLiquidoInCents(item), 0);
}

function somaBruta(itens: ComandaItem[]): number {
  return itens.reduce(
    (acc, item) => acc + item.quantidade * item.valorUnitarioInCents,
    0,
  );
}

function somaDesconto(itens: ComandaItem[]): number {
  return itens.reduce((acc, item) => acc + item.descontoInCents, 0);
}

function itemSufixo(id: string): string {
  return id.slice(-7).toUpperCase();
}

interface PagamentoRow {
  key: string;
  cashRegisterId: string;
  valorText: string;
  /** `PaymentMethodConfig.id` real, cadastrado em Configurações → Formas de pagamento (§2.1). */
  paymentMethodId: string;
}

/** Campo somente-leitura de valor monetário, usado na seção "Valores". */
function ValorField({
  label,
  valueInCents,
  destaque,
}: {
  label: string;
  valueInCents: number;
  destaque?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </Label>
      <div
        className={`flex h-10 items-center rounded-md border bg-surface-base px-3 text-sm ${
          destaque
            ? "border-brand/40 font-bold text-foreground"
            : "border-border text-muted-foreground"
        }`}
      >
        {formatBRLFromCents(valueInCents)}
      </div>
    </div>
  );
}

interface CatalogoItemOption {
  id: string;
  nome: string;
  categoriaId: string | null;
  categoriaNome: string | null;
  valorInCents: number;
}

/**
 * Mini-form pra adicionar um produto/serviço direto no fechamento da
 * comanda (spec-revisao-cliente-4.md §4.1) — antes só dava pra aplicar
 * desconto em itens já lançados; adicionar exigia fechar o modal e voltar
 * pra comanda aberta.
 */
function AdicionarItemForm({
  isProduto,
  vinculaAgendamento,
  catalogo,
  categorias,
  agendamentos,
  refId,
  onRefIdChange,
  appointmentId,
  onAppointmentIdChange,
  quantidade,
  onQuantidadeChange,
  valorText,
  onValorTextChange,
  onAdd,
}: {
  isProduto: boolean;
  vinculaAgendamento: boolean;
  catalogo: CatalogoItemOption[];
  categorias: { id: string; name: string }[];
  agendamentos: SelectOption<string>[];
  refId: string;
  onRefIdChange: (v: string) => void;
  appointmentId: string;
  onAppointmentIdChange: (v: string) => void;
  quantidade: number;
  onQuantidadeChange: (n: number) => void;
  valorText: string;
  onValorTextChange: (v: string) => void;
  onAdd: () => void;
}) {
  const [categoriaId, setCategoriaId] = useState("__todas__");
  const catalogoFiltrado =
    categoriaId === "__todas__"
      ? catalogo
      : catalogo.filter((c) => c.categoriaId === categoriaId);
  const podeAdicionar =
    refId !== "" && (!vinculaAgendamento || appointmentId !== "") && (!isProduto || quantidade >= 1);

  return (
    <div className="mb-4 rounded-md border border-border-subtle bg-surface-base p-3">
      <div className="grid grid-cols-1 items-end gap-3 md:grid-cols-2 xl:grid-cols-5">
        {vinculaAgendamento && (
          <LabeledSelect
            label="Agendamento"
            required
            placeholder={
              agendamentos.length === 0 ? "Nenhum agendamento disponível" : "Selecione..."
            }
            value={appointmentId}
            onValueChange={onAppointmentIdChange}
            options={agendamentos}
          />
        )}
        <LabeledSelect
          label="Categoria"
          value={categoriaId}
          onValueChange={(v) => {
            setCategoriaId(v);
            onRefIdChange("");
          }}
          options={[
            { value: "__todas__", label: "Todas" },
            ...categorias.map((c) => ({ value: c.id, label: c.name })),
          ]}
        />
        <LabeledSelect
          label={isProduto ? "Produto" : "Serviço"}
          required
          placeholder={catalogoFiltrado.length === 0 ? "Nenhum cadastrado" : "Selecione..."}
          value={refId}
          onValueChange={onRefIdChange}
          options={catalogoFiltrado.map((c) => ({
            value: c.id,
            label: `${c.nome} — ${formatBRLFromCents(c.valorInCents)}`,
          }))}
        />
        {isProduto && (
          <LabeledInput
            label="Qtd."
            required
            type="number"
            min={1}
            value={quantidade}
            onChange={(e) => onQuantidadeChange(Math.max(1, Number(e.target.value) || 1))}
          />
        )}
        {isProduto && (
          <LabeledInput
            label="Valor"
            inputMode="numeric"
            placeholder="R$ 0,00"
            value={valorText}
            onChange={(e) => onValorTextChange(maskBRLInput(e.target.value))}
          />
        )}
        <Button
          type="button"
          onClick={onAdd}
          disabled={!podeAdicionar}
          className="h-10 cursor-pointer bg-brand text-brand-foreground hover:bg-brand-hover disabled:cursor-not-allowed"
        >
          <Plus className="size-4" />
          Adicionar
        </Button>
      </div>
    </div>
  );
}

/**
 * Widget de desconto por item, reaproveitado tanto em Produtos quanto em
 * Serviços: seleciona um item já lançado na comanda e aplica um desconto
 * (clampado ao valor bruto do item). A tabela abaixo sempre lista todos os
 * itens daquele tipo com o valor já líquido.
 */
function ItemDescontoEditor({
  tipo,
  itens,
  onApply,
}: {
  tipo: ComandaItemTipo;
  itens: ComandaItem[];
  onApply: (itemId: string, descontoInCents: number) => void;
}) {
  const [itemId, setItemId] = useState("");
  const [valorText, setValorText] = useState("");

  const listados = useMemo(
    () => itens.filter((i) => i.tipo === tipo),
    [itens, tipo],
  );

  const options = useMemo<SelectOption<string>[]>(
    () =>
      listados.map((i) => ({
        value: i.id,
        label: `${i.nome} — Item ${itemSufixo(i.id)}`,
      })),
    [listados],
  );

  if (listados.length === 0) return null;

  function handleApply() {
    const item = listados.find((i) => i.id === itemId);
    if (!item) return;
    const brutoInCents = item.quantidade * item.valorUnitarioInCents;
    const descontoInCents = Math.min(
      Math.max(Math.round(parseBRL(valorText) * 100), 0),
      brutoInCents,
    );
    onApply(item.id, descontoInCents);
    setItemId("");
    setValorText("");
  }

  return (
    <div className="mt-4 space-y-3">
      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        Descontos
      </p>
      <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_44px]">
        <LabeledSelect
          label={tipo === "PRODUTO" ? "Produto" : "Serviço"}
          placeholder="Selecione..."
          value={itemId}
          onValueChange={setItemId}
          options={options}
        />
        <LabeledInput
          label="Desconto"
          inputMode="numeric"
          placeholder="R$ 0,00"
          value={valorText}
          onChange={(e) => setValorText(maskBRLInput(e.target.value))}
        />
        <div className="flex items-end">
          <Button
            type="button"
            onClick={handleApply}
            disabled={!itemId}
            aria-label="Aplicar desconto"
            className="h-10 w-full cursor-pointer bg-brand text-brand-foreground hover:bg-brand-hover disabled:cursor-not-allowed"
          >
            <Plus className="size-4" />
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto rounded-md border border-border-subtle">
        <Table>
          <TableHeader>
            <TableRow className="border-border-subtle hover:bg-transparent">
              <TableHead>{tipo === "PRODUTO" ? "Produto" : "Serviço"}</TableHead>
              <TableHead className="text-right">Valor com desconto</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listados.map((item) => (
              <TableRow key={item.id} className="border-border-subtle">
                <TableCell className="text-foreground">
                  {item.nome} — Item {itemSufixo(item.id)}
                </TableCell>
                <TableCell className="text-right font-semibold text-foreground">
                  {formatBRLFromCents(itemLiquidoInCents(item))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

/**
 * Fechamento de comanda — reflete o total (bruto/desconto/líquido) de
 * produtos e serviços, permite aplicar desconto por item e dividir o
 * pagamento entre mais de uma forma/caixa. Se a filial não tiver nenhum
 * caixa aberto (ou não tiver filial vinculada), o fechamento é bloqueado —
 * o backend exige ao menos um pagamento com caixa aberto para registrar a
 * venda.
 */
export function DialogFecharComanda({
  open,
  onOpenChange,
  barbershopId,
  comanda,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  barbershopId: string | undefined;
  comanda: Comanda | null;
  onConfirm: (payload: {
    itens: ComandaItem[];
    pagamentos: {
      cashRegisterId: string;
      paymentMethodId: string;
      valorInCents: number;
    }[];
  }) => Promise<unknown> | void;
}) {
  const { registers } = useCashRegisters(barbershopId);
  const { employees } = useEmployees(barbershopId);
  const { methods: paymentMethods } = usePaymentMethods(barbershopId);
  // Catálogo pra permitir adicionar produtos/serviços direto no fechamento
  // (spec-revisao-cliente-4.md §4.1) — antes só dava pra aplicar desconto
  // nos itens já existentes; adicionar exigia fechar o modal e voltar pra
  // comanda aberta.
  const { products } = useProducts(barbershopId);
  const { services } = useServices(barbershopId);
  const { appointments } = useAppointments(barbershopId);
  const { categories: categoriasProdutos } = useCategories(barbershopId, "PRODUTO");
  const { categories: categoriasServicos } = useCategories(barbershopId, "SERVICO");
  const [itens, setItens] = useState<ComandaItem[]>([]);
  const [pagamentos, setPagamentos] = useState<PagamentoRow[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [addingItemTipo, setAddingItemTipo] = useState<ComandaItemTipo | null>(null);
  const [novoRefId, setNovoRefId] = useState("");
  const [novoAppointmentId, setNovoAppointmentId] = useState("");
  const [novoQuantidade, setNovoQuantidade] = useState(1);
  const [novoValorText, setNovoValorText] = useState("");

  const openRegisters = useMemo(
    () =>
      registers.filter(
        (r) => r.closedAt === null && r.branchId === comanda?.branchId,
      ),
    [registers, comanda?.branchId],
  );

  // Formas de pagamento habilitadas para a filial da comanda (§2.1) — lista
  // direto as `PaymentMethodConfig` reais cadastradas em Configurações →
  // Formas de pagamento, com o nome tal como cadastrado, sem passar por
  // inferência de palavra-chave (antes colapsava em Dinheiro/Crédito/
  // Débito/Pix/Outro, escondendo o nome real e colapsando métodos
  // diferentes — ex. dois Pix distintos — no mesmo "PIX").
  const formaPagamentoOptions: SelectOption[] = useMemo(() => {
    if (!comanda?.branchId) return [];
    return paymentMethods
      .filter(
        (m) =>
          m.status === "ACTIVE" &&
          m.branchConfigs.some((bc) => bc.branchId === comanda.branchId),
      )
      .map((m) => ({ value: m.id, label: m.name }));
  }, [paymentMethods, comanda?.branchId]);

  // Clona os itens da comanda para edição local dos descontos.
  useEffect(() => {
    if (!open || !comanda) return;
    setItens(comanda.itens.map((i) => ({ ...i })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, comanda?.id]);

  // Uma linha de pagamento pré-preenchida com o total líquido inicial —
  // caixa já vem selecionado quando só há 1 aberto na filial.
  useEffect(() => {
    if (!open || !comanda) return;
    const totalInicial = somaLiquida(comanda.itens);
    setPagamentos([
      {
        key: crypto.randomUUID(),
        cashRegisterId: openRegisters.length === 1 ? openRegisters[0].id : "",
        valorText: maskBRLInput(String(totalInicial)),
        paymentMethodId: "",
      },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, comanda?.id, openRegisters.length]);

  const registerOptions = useMemo<SelectOption<string>[]>(
    () =>
      openRegisters.map((r) => ({
        value: r.id,
        label: `${r.branch.name} · aberto em ${formatDate(r.createdAt, { day: "2-digit", month: "2-digit" })} ${formatTime(r.createdAt)}`,
      })),
    [openRegisters],
  );

  const produtos = useMemo(
    () => itens.filter((i) => i.tipo === "PRODUTO"),
    [itens],
  );
  const servicos = useMemo(
    () => itens.filter((i) => i.tipo === "SERVICO"),
    [itens],
  );

  const profissionalPorAgendamento = useMemo(() => {
    const m = new Map(
      (comanda?.agendamentos ?? []).map((a) => [
        a.appointmentId,
        a.profissionalNome,
      ]),
    );
    return (appointmentId: string | null) =>
      appointmentId ? (m.get(appointmentId) ?? null) : null;
  }, [comanda]);

  const profissionalConsumoAvulso = useMemo(() => {
    if (!comanda?.employeeId) return null;
    const emp = employees.find((e) => e.id === comanda.employeeId);
    return emp ? (emp.appName || emp.name) : null;
  }, [comanda, employees]);

  // Reseta o mini-form de "adicionar item" ao trocar de comanda/fechar.
  useEffect(() => {
    setAddingItemTipo(null);
    setNovoRefId("");
    setNovoAppointmentId("");
    setNovoQuantidade(1);
    setNovoValorText("");
  }, [open, comanda?.id]);

  const catalogoProdutos = useMemo(
    () =>
      products
        .filter((p) => p.status === "ACTIVE")
        .map((p) => ({
          id: p.id,
          nome: p.name,
          categoriaId: p.category?.id ?? null,
          categoriaNome: p.category?.name ?? null,
          valorInCents: p.priceInCents,
        })),
    [products],
  );
  const catalogoServicos = useMemo(
    () =>
      services.map((s) => ({
        id: s.id,
        nome: s.name,
        categoriaId: s.category?.id ?? null,
        categoriaNome: s.category?.name ?? null,
        valorInCents: s.priceInCents,
      })),
    [services],
  );
  const catalogoAtual = addingItemTipo === "PRODUTO" ? catalogoProdutos : catalogoServicos;
  const categoriasAtual = addingItemTipo === "PRODUTO" ? categoriasProdutos : categoriasServicos;

  const agendamentoOptions = useMemo<SelectOption<string>[]>(
    () =>
      (comanda?.agendamentos ?? []).map((a) => ({
        value: a.appointmentId,
        label: `${a.clienteNome} — ${a.servicoNome}`,
      })),
    [comanda],
  );

  function handleSelectNovoRef(id: string) {
    setNovoRefId(id);
    if (addingItemTipo === "PRODUTO") {
      const found = catalogoProdutos.find((c) => c.id === id);
      if (found) setNovoValorText(maskBRLInput(String(found.valorInCents)));
    }
  }

  async function handleAddItem() {
    if (!addingItemTipo || !novoRefId) return;
    const ref = catalogoAtual.find((c) => c.id === novoRefId);
    if (!ref) return;
    const isProduto = addingItemTipo === "PRODUTO";
    const vinculaAgendamento = comanda?.tipo === "AGENDAMENTO";
    if (vinculaAgendamento && !novoAppointmentId) return;

    let valorUnitarioInCents = isProduto
      ? Math.round(parseBRL(novoValorText) * 100)
      : ref.valorInCents;

    // Serviço vinculado a agendamento: aplica o preço com desconto/gratuidade
    // do plano do cliente, igual ao resto do sistema (único ponto de
    // cobrança real de serviço é a Comanda) — mesma lógica de
    // `useComandaForm.resolveServicoPrice`.
    if (!isProduto && vinculaAgendamento && novoAppointmentId && barbershopId) {
      const appointment = appointments.find((a) => a.id === novoAppointmentId);
      if (appointment) {
        try {
          const pricing = await subscriptionsService.getServicePricing(
            barbershopId,
            appointment.clientId,
            novoRefId,
          );
          if (pricing.covered) valorUnitarioInCents = pricing.priceInCents;
        } catch {
          // fallback: preço de catálogo já setado acima
        }
      }
    }

    // Mesma regra para produtos: preço fixo do plano (`PlanProduct`) ou
    // desconto por categoria (`PlanCategory`), quando o produto está
    // vinculado a um agendamento de cliente assinante. Sobrescreve o valor
    // que o usuário deixou no campo (pré-preenchido com o preço de
    // catálogo) só quando o plano de fato cobre o produto.
    if (isProduto && vinculaAgendamento && novoAppointmentId && barbershopId) {
      const appointment = appointments.find((a) => a.id === novoAppointmentId);
      if (appointment) {
        try {
          const pricing = await subscriptionsService.getProductPricing(
            barbershopId,
            appointment.clientId,
            novoRefId,
          );
          if (pricing.covered) valorUnitarioInCents = pricing.priceInCents;
        } catch {
          // fallback: preço de catálogo/digitado já setado acima
        }
      }
    }

    setItens((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        tipo: addingItemTipo,
        refId: ref.id,
        nome: ref.nome,
        categoriaNome: ref.categoriaNome,
        appointmentId: vinculaAgendamento ? novoAppointmentId : null,
        quantidade: isProduto ? novoQuantidade : 1,
        valorUnitarioInCents,
        descontoInCents: 0,
      },
    ]);
    setNovoRefId("");
    setNovoAppointmentId("");
    setNovoQuantidade(1);
    setNovoValorText("");
  }

  function handleRemoveItem(itemId: string) {
    setItens((prev) => prev.filter((i) => i.id !== itemId));
  }

  function updateItemDesconto(itemId: string, descontoInCents: number) {
    setItens((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, descontoInCents } : i)),
    );
  }

  const totalServicosBrutoInCents = useMemo(() => somaBruta(servicos), [servicos]);
  const descontoServicosInCents = useMemo(() => somaDesconto(servicos), [servicos]);
  const totalProdutosBrutoInCents = useMemo(() => somaBruta(produtos), [produtos]);
  const descontoProdutosInCents = useMemo(() => somaDesconto(produtos), [produtos]);
  const totalComandaInCents = useMemo(() => somaLiquida(itens), [itens]);

  function addPagamentoRow() {
    setPagamentos((prev) => [
      ...prev,
      {
        key: crypto.randomUUID(),
        cashRegisterId: openRegisters.length === 1 ? openRegisters[0].id : "",
        valorText: "",
        paymentMethodId: "",
      },
    ]);
  }

  function removePagamentoRow(key: string) {
    setPagamentos((prev) => prev.filter((p) => p.key !== key));
  }

  function updatePagamentoRow(key: string, patch: Partial<PagamentoRow>) {
    setPagamentos((prev) =>
      prev.map((p) => (p.key === key ? { ...p, ...patch } : p)),
    );
  }

  const somaPagamentosInCents = useMemo(
    () =>
      pagamentos.reduce(
        (sum, p) => sum + Math.round(parseBRL(p.valorText) * 100),
        0,
      ),
    [pagamentos],
  );

  const pagamentosPreenchidos =
    pagamentos.length > 0 &&
    pagamentos.every(
      (p) =>
        p.cashRegisterId !== "" &&
        p.paymentMethodId !== "" &&
        p.valorText.trim() !== "",
    );

  const semCaixaDisponivel = !comanda?.branchId || openRegisters.length === 0;
  const podeConfirmar =
    !semCaixaDisponivel &&
    pagamentosPreenchidos &&
    somaPagamentosInCents === totalComandaInCents;

  async function handleConfirmar() {
    if (!podeConfirmar) return;
    setSubmitting(true);
    try {
      await onConfirm({
        itens,
        pagamentos: pagamentos.map((p) => ({
          cashRegisterId: p.cashRegisterId,
          paymentMethodId: p.paymentMethodId,
          valorInCents: Math.round(parseBRL(p.valorText) * 100),
        })),
      });
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col gap-0 bg-surface-raised p-0 text-foreground border border-border">
        <DialogHeader className="shrink-0 border-b border-border-subtle px-6 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-brand" />
              <DialogTitle className="text-base font-bold">
                Fechar comanda{comanda ? ` #${comanda.numero}` : ""}
              </DialogTitle>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5">
          {comanda?.tipo === "AGENDAMENTO" && (
            <FormSection
              icon={<CheckCircle2 />}
              title="Agendamentos"
              subtitle="Agendamentos adicionados na comanda."
            >
              <div className="overflow-x-auto rounded-md border border-border-subtle">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border-subtle hover:bg-transparent">
                      <TableHead>Cliente</TableHead>
                      <TableHead>Data e hora do agendamento</TableHead>
                      <TableHead className="text-right">Total dos serviços</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comanda.agendamentos.map((a) => {
                      const totalInCents = somaLiquida(
                        servicos.filter((i) => i.appointmentId === a.appointmentId),
                      );
                      return (
                        <TableRow key={a.appointmentId} className="border-border-subtle">
                          <TableCell className="text-foreground">{a.clienteNome}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(a.scheduledAt)} {formatTime(a.scheduledAt)}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-foreground">
                            {formatBRLFromCents(totalInCents)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </FormSection>
          )}

          <FormSection
            icon={<Package />}
            title="Produtos"
            subtitle="Produtos adicionados na comanda."
            aside={
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setAddingItemTipo((prev) => (prev === "PRODUTO" ? null : "PRODUTO"))
                }
                className="cursor-pointer gap-1.5"
              >
                <Plus className="size-3.5" />
                Adicionar
              </Button>
            }
          >
            {addingItemTipo === "PRODUTO" && (
              <AdicionarItemForm
                isProduto
                vinculaAgendamento={comanda?.tipo === "AGENDAMENTO"}
                catalogo={catalogoAtual}
                categorias={categoriasAtual}
                agendamentos={agendamentoOptions}
                refId={novoRefId}
                onRefIdChange={handleSelectNovoRef}
                appointmentId={novoAppointmentId}
                onAppointmentIdChange={setNovoAppointmentId}
                quantidade={novoQuantidade}
                onQuantidadeChange={setNovoQuantidade}
                valorText={novoValorText}
                onValorTextChange={setNovoValorText}
                onAdd={() => void handleAddItem()}
              />
            )}

            {produtos.length === 0 ? (
              <div className="rounded-md border border-dashed border-border py-6 text-center">
                <p className="text-sm font-medium text-muted-foreground">
                  Nenhum produto adicionado!
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-md border border-border-subtle">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border-subtle hover:bg-transparent">
                      <TableHead>Profissional</TableHead>
                      <TableHead>Produto</TableHead>
                      <TableHead>Quantidade</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {produtos.map((item) => (
                      <TableRow key={item.id} className="border-border-subtle">
                        <TableCell className="text-muted-foreground">
                          {profissionalPorAgendamento(item.appointmentId) ??
                            profissionalConsumoAvulso ??
                            "—"}
                        </TableCell>
                        <TableCell className="text-foreground">{item.nome}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {item.quantidade}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-foreground">
                          {formatBRLFromCents(item.quantidade * item.valorUnitarioInCents)}
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveItem(item.id)}
                            aria-label={`Remover ${item.nome}`}
                            className="cursor-pointer text-muted-foreground hover:bg-danger/10 hover:text-danger-foreground"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            <ItemDescontoEditor tipo="PRODUTO" itens={itens} onApply={updateItemDesconto} />
          </FormSection>

          <FormSection
            icon={<Scissors />}
            title="Serviços"
            subtitle="Serviços adicionados na comanda."
            aside={
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setAddingItemTipo((prev) => (prev === "SERVICO" ? null : "SERVICO"))
                }
                className="cursor-pointer gap-1.5"
              >
                <Plus className="size-3.5" />
                Adicionar
              </Button>
            }
          >
            {addingItemTipo === "SERVICO" && (
              <AdicionarItemForm
                isProduto={false}
                vinculaAgendamento={comanda?.tipo === "AGENDAMENTO"}
                catalogo={catalogoAtual}
                categorias={categoriasAtual}
                agendamentos={agendamentoOptions}
                refId={novoRefId}
                onRefIdChange={handleSelectNovoRef}
                appointmentId={novoAppointmentId}
                onAppointmentIdChange={setNovoAppointmentId}
                quantidade={novoQuantidade}
                onQuantidadeChange={setNovoQuantidade}
                valorText={novoValorText}
                onValorTextChange={setNovoValorText}
                onAdd={() => void handleAddItem()}
              />
            )}

            {servicos.length === 0 ? (
              <div className="rounded-md border border-dashed border-border py-6 text-center">
                <p className="text-sm font-medium text-muted-foreground">
                  Nenhum serviço adicionado!
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-md border border-border-subtle">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border-subtle hover:bg-transparent">
                      <TableHead>Profissional</TableHead>
                      <TableHead>Serviço</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {servicos.map((item) => (
                      <TableRow key={item.id} className="border-border-subtle">
                        <TableCell className="text-muted-foreground">
                          {profissionalPorAgendamento(item.appointmentId) ??
                            profissionalConsumoAvulso ??
                            "—"}
                        </TableCell>
                        <TableCell className="text-foreground">{item.nome}</TableCell>
                        <TableCell className="text-right font-semibold text-foreground">
                          {formatBRLFromCents(item.quantidade * item.valorUnitarioInCents)}
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveItem(item.id)}
                            aria-label={`Remover ${item.nome}`}
                            className="cursor-pointer text-muted-foreground hover:bg-danger/10 hover:text-danger-foreground"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            <ItemDescontoEditor tipo="SERVICO" itens={itens} onApply={updateItemDesconto} />
          </FormSection>

          <FormSection icon={<Wallet />} title="Valores">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <ValorField label="Total dos serviços" valueInCents={totalServicosBrutoInCents} />
              <ValorField label="Desconto em serviços" valueInCents={descontoServicosInCents} />
              <ValorField label="Total dos produtos" valueInCents={totalProdutosBrutoInCents} />
              <ValorField label="Desconto em produtos" valueInCents={descontoProdutosInCents} />
              <ValorField label="Total da comanda" valueInCents={totalComandaInCents} destaque />
            </div>
          </FormSection>

          <FormSection
            icon={<Wallet />}
            title="Pagamento"
            aside={
              <Button
                type="button"
                onClick={addPagamentoRow}
                className="h-8 shrink-0 cursor-pointer bg-brand px-3 text-xs text-brand-foreground hover:bg-brand-hover"
              >
                <Plus className="mr-1 size-3.5" />
                Adicionar forma de pagamento
              </Button>
            }
          >
            {semCaixaDisponivel ? (
              <div className="flex items-center gap-2 rounded-md border border-warning/30 bg-warning/5 px-3 py-2.5">
                <AlertTriangle className="size-4 shrink-0 text-warning-foreground" />
                <p className="text-sm text-muted-foreground">
                  {!comanda?.branchId
                    ? "Esta comanda não está vinculada a uma filial. Vincule uma filial para poder fechá-la."
                    : "Nenhum caixa aberto nesta filial. É necessário abrir um caixa para finalizar a comanda."}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pagamentos.length === 0 ? (
                  <div className="rounded-md border border-dashed border-border py-6 text-center">
                    <p className="text-sm font-medium text-muted-foreground">
                      Nenhuma forma de pagamento adicionada.
                    </p>
                  </div>
                ) : (
                  pagamentos.map((p) => (
                    <div
                      key={p.key}
                      className="grid grid-cols-1 items-end gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_40px]"
                    >
                      <LabeledSelect
                        label="Caixa"
                        required
                        placeholder="Selecione..."
                        value={p.cashRegisterId}
                        onValueChange={(v) => updatePagamentoRow(p.key, { cashRegisterId: v })}
                        options={registerOptions}
                      />
                      <LabeledInput
                        label="Valor"
                        required
                        inputMode="numeric"
                        placeholder="R$ 0,00"
                        value={p.valorText}
                        onChange={(e) =>
                          updatePagamentoRow(p.key, { valorText: maskBRLInput(e.target.value) })
                        }
                      />
                      <LabeledSelect
                        label="Forma de pagamento"
                        required
                        placeholder={
                          formaPagamentoOptions.length === 0
                            ? "Nenhuma cadastrada para esta filial"
                            : "Selecione..."
                        }
                        value={p.paymentMethodId}
                        onValueChange={(v) =>
                          updatePagamentoRow(p.key, { paymentMethodId: v })
                        }
                        options={formaPagamentoOptions}
                      />
                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removePagamentoRow(p.key)}
                          aria-label="Remover forma de pagamento"
                          className="cursor-pointer text-muted-foreground hover:bg-danger/10 hover:text-danger-foreground"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}

                {somaPagamentosInCents !== totalComandaInCents && (
                  <p className="text-xs font-semibold text-danger-foreground">
                    {somaPagamentosInCents < totalComandaInCents
                      ? `Faltam ${formatBRLFromCents(totalComandaInCents - somaPagamentosInCents)} para bater com o total da comanda.`
                      : `Sobrando ${formatBRLFromCents(somaPagamentosInCents - totalComandaInCents)} em relação ao total da comanda.`}
                  </p>
                )}
              </div>
            )}
          </FormSection>
        </div>

        <div className="flex shrink-0 justify-end gap-3 border-t border-border-subtle px-6 pt-4 pb-6">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-9 rounded-md border border-border bg-transparent px-5 text-sm text-foreground transition-colors hover:bg-surface-elevated"
          >
            Voltar
          </button>
          <Button
            type="button"
            onClick={() => void handleConfirmar()}
            disabled={!podeConfirmar || submitting}
            className="h-9 cursor-pointer bg-brand px-5 font-bold text-brand-foreground hover:bg-brand-hover disabled:cursor-not-allowed"
          >
            {submitting ? "Fechando…" : "Fechar comanda"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
