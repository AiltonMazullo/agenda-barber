"use client";

import { useMemo, useState } from "react";
import { Package, Plus, Scissors, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared";
import { FormSection } from "./FormSection";
import { LabeledInput, LabeledSelect } from "./FormField";
import { formatBRL, maskBRLInput, parseBRL } from "@/utils/format";
import type { CatalogoOption, NovoItemInput } from "@/hooks/useComandaForm";
import type { SelectOption } from "@/types/common.types";
import type {
  ComandaItem,
  ComandaItemTipo,
  ComandaTipo,
} from "@/types/orders.types";

const TODAS = "__todas__";

const COPY: Record<
  ComandaItemTipo,
  { title: string; subtitle: string; selectLabel: string; emptyList: string }
> = {
  PRODUTO: {
    title: "Produtos",
    subtitle: "Produtos consumidos durante o atendimento",
    selectLabel: "Produto",
    emptyList: "Nenhum produto adicionado.",
  },
  SERVICO: {
    title: "Serviços",
    subtitle: "Serviços executados nesta comanda",
    selectLabel: "Serviço",
    emptyList: "Nenhum serviço adicionado.",
  },
};

interface ItensSectionProps {
  tipo: ComandaItemTipo;
  comandaTipo: ComandaTipo;
  /** Agendamentos reais da barbearia, para atrelar o item diretamente. */
  agendamentos: SelectOption<string>[];
  categorias: SelectOption<string>[];
  catalogo: CatalogoOption[];
  itens: ComandaItem[];
  /** Resolve o profissional responsável por um item (pelo agendamento vinculado, ou o responsável da comanda em itens avulsos). */
  resolveProfissional?: (appointmentId: string | null) => string | null;
  onAdd: (input: NovoItemInput) => boolean | Promise<boolean>;
  onRemove: (itemId: string) => void;
}

export function ItensSection({
  tipo,
  comandaTipo,
  agendamentos,
  categorias,
  catalogo,
  itens,
  resolveProfissional,
  onAdd,
  onRemove,
}: ItensSectionProps) {
  const [appointmentId, setAppointmentId] = useState("");
  const [categoriaId, setCategoriaId] = useState(TODAS);
  const [refId, setRefId] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [valorText, setValorText] = useState("");

  const isProduto = tipo === "PRODUTO";
  const vinculaAgendamento = comandaTipo === "AGENDAMENTO";
  const copy = COPY[tipo];

  const categoriaOptions = useMemo<SelectOption<string>[]>(
    () => [{ value: TODAS, label: "Todas" }, ...categorias],
    [categorias],
  );

  const catalogoFiltrado = useMemo(
    () =>
      categoriaId === TODAS
        ? catalogo
        : catalogo.filter((c) => c.categoriaId === categoriaId),
    [catalogo, categoriaId],
  );

  const catalogoOptions = useMemo<SelectOption<string>[]>(
    () =>
      catalogoFiltrado.map((c) => ({
        value: c.id,
        label: `${c.nome} — ${formatBRL(c.valorInCents / 100)}`,
      })),
    [catalogoFiltrado],
  );

  const listados = useMemo(
    () => itens.filter((i) => i.tipo === tipo),
    [itens, tipo],
  );

  const agendamentoLabel = useMemo(() => {
    const m = new Map(agendamentos.map((a) => [a.value, a.label]));
    return (id: string | null) => (id ? (m.get(id) ?? null) : null);
  }, [agendamentos]);

  function handleSelectRef(id: string) {
    setRefId(id);
    const found = catalogo.find((c) => c.id === id);
    if (found && isProduto) {
      setValorText(maskBRLInput(String(found.valorInCents)));
    }
  }

  const podeAdicionar =
    refId !== "" &&
    (!vinculaAgendamento || appointmentId !== "") &&
    (!isProduto || quantidade >= 1);

  async function handleAdd() {
    const ref = catalogo.find((c) => c.id === refId);
    if (!ref) return;
    const ok = await onAdd({
      tipo,
      refId,
      appointmentId: vinculaAgendamento ? appointmentId : null,
      quantidade: isProduto ? quantidade : 1,
      valorUnitarioInCents: isProduto
        ? Math.round(parseBRL(valorText) * 100)
        : ref.valorInCents,
    });
    if (ok) {
      setRefId("");
      setQuantidade(1);
      setValorText("");
    }
  }

  // Literais estáticos: o JIT do Tailwind não gera classes montadas em runtime.
  const gridClass = isProduto
    ? vinculaAgendamento
      ? "xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)_minmax(0,1.3fr)_88px_128px_40px]"
      : "xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)_88px_128px_40px]"
    : vinculaAgendamento
      ? "xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)_minmax(0,1.5fr)_40px]"
      : "xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.5fr)_40px]";

  return (
    <FormSection
      icon={isProduto ? <Package /> : <Scissors />}
      title={copy.title}
      subtitle={copy.subtitle}
      aside={
        listados.length > 0 ? (
          <span className="text-xs font-semibold text-brand whitespace-nowrap">
            {listados.length} {listados.length === 1 ? "item" : "itens"}
          </span>
        ) : undefined
      }
    >
      <div
        className={`grid grid-cols-1 items-end gap-4 md:grid-cols-2 ${gridClass}`}
      >
        {vinculaAgendamento && (
          <LabeledSelect
            label="Agendamento"
            required
            placeholder={
              agendamentos.length === 0
                ? "Nenhum agendamento disponível"
                : "Selecione o agendamento..."
            }
            value={appointmentId}
            onValueChange={setAppointmentId}
            options={agendamentos}
          />
        )}

        <LabeledSelect
          label="Categoria"
          value={categoriaId}
          onValueChange={(v) => {
            setCategoriaId(v);
            setRefId("");
          }}
          options={categoriaOptions}
        />

        <LabeledSelect
          label={copy.selectLabel}
          required
          placeholder={
            catalogo.length === 0
              ? `Nenhum ${copy.selectLabel.toLowerCase()} cadastrado`
              : "Selecione..."
          }
          value={refId}
          onValueChange={handleSelectRef}
          options={catalogoOptions}
        />

        {isProduto && (
          <LabeledInput
            label="Qtd."
            required
            type="number"
            min={1}
            value={quantidade}
            onChange={(e) =>
              setQuantidade(Math.max(1, Number(e.target.value) || 1))
            }
          />
        )}

        {isProduto && (
          <LabeledInput
            label="Valor"
            inputMode="numeric"
            placeholder="R$ 0,00"
            value={valorText}
            onChange={(e) => setValorText(maskBRLInput(e.target.value))}
          />
        )}

        <div className="flex items-end md:col-span-2 xl:col-span-1">
          <Button
            type="button"
            onClick={() => void handleAdd()}
            disabled={!podeAdicionar}
            aria-label={`Adicionar ${copy.selectLabel.toLowerCase()}`}
            className="h-10 w-full xl:w-10 cursor-pointer bg-brand text-brand-foreground hover:bg-brand-hover disabled:cursor-not-allowed"
          >
            <Plus className="size-4" />
          </Button>
        </div>
      </div>

      <div className="mt-4">
        {listados.length === 0 ? (
          <div className="rounded-md border border-dashed border-border py-6 text-center">
            <p className="text-sm font-medium text-muted-foreground">
              {copy.emptyList}
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {listados.map((item) => {
              const vinculo = agendamentoLabel(item.appointmentId);
              const profissional = resolveProfissional?.(item.appointmentId) ?? null;
              return (
                <li
                  key={item.id}
                  className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-md border border-border bg-surface-base px-3 py-2.5"
                >
                  <div className="min-w-0 flex-1 basis-40">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {item.nome}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      {item.categoriaNome && (
                        <StatusBadge tone="neutral">
                          {item.categoriaNome}
                        </StatusBadge>
                      )}
                      {vinculo && (
                        <StatusBadge tone="brand">{vinculo}</StatusBadge>
                      )}
                      {profissional && (
                        <StatusBadge tone="neutral">{profissional}</StatusBadge>
                      )}
                      {!isProduto && item.valorUnitarioInCents === 0 && (
                        <StatusBadge tone="success">Grátis (assinatura)</StatusBadge>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {item.descontoInCents > 0 ? (
                      <>
                        <p className="text-xs text-muted-foreground line-through">
                          {formatBRL(
                            (item.quantidade * item.valorUnitarioInCents) / 100,
                          )}
                        </p>
                        <p className="text-sm font-semibold text-foreground">
                          {formatBRL(
                            (item.quantidade * item.valorUnitarioInCents -
                              item.descontoInCents) /
                              100,
                          )}
                        </p>
                        <p className="text-xs font-semibold text-success">
                          Desconto de {formatBRL(item.descontoInCents / 100)}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm font-semibold text-foreground">
                        {formatBRL(
                          (item.quantidade * item.valorUnitarioInCents) / 100,
                        )}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {item.quantidade}x{" "}
                      {formatBRL(item.valorUnitarioInCents / 100)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemove(item.id)}
                    aria-label={`Remover ${item.nome}`}
                    className="cursor-pointer text-muted-foreground hover:bg-danger/10 hover:text-danger-foreground"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </FormSection>
  );
}
