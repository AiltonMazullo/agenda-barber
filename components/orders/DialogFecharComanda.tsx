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
import { useCashRegisters } from "@/hooks/useCashRegisters";
import { useEmployees } from "@/hooks/useEmployees";
import {
  formatBRLFromCents,
  formatDate,
  formatTime,
  maskBRLInput,
  parseBRL,
} from "@/utils/format";
import { COMANDA_FORMA_PAGAMENTO_OPTIONS } from "@/utils/comanda";
import type {
  Comanda,
  ComandaFormaPagamento,
  ComandaItem,
  ComandaItemTipo,
} from "@/types/orders.types";
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
  formaPagamento: ComandaFormaPagamento | "";
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
      formaPagamento: ComandaFormaPagamento;
      valorInCents: number;
    }[];
  }) => Promise<unknown> | void;
}) {
  const { registers } = useCashRegisters(barbershopId);
  const { employees } = useEmployees(barbershopId);
  const [itens, setItens] = useState<ComandaItem[]>([]);
  const [pagamentos, setPagamentos] = useState<PagamentoRow[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const openRegisters = useMemo(
    () =>
      registers.filter(
        (r) => r.closedAt === null && r.branchId === comanda?.branchId,
      ),
    [registers, comanda?.branchId],
  );

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
        formaPagamento: "",
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
        formaPagamento: "",
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
        p.formaPagamento !== "" &&
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
          formaPagamento: p.formaPagamento as ComandaFormaPagamento,
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
          >
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
          >
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
                        placeholder="Selecione..."
                        value={p.formaPagamento}
                        onValueChange={(v) =>
                          updatePagamentoRow(p.key, {
                            formaPagamento: v as ComandaFormaPagamento,
                          })
                        }
                        options={COMANDA_FORMA_PAGAMENTO_OPTIONS}
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
