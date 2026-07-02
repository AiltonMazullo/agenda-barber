"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, CheckSquare, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LabeledInput, LabeledSelect } from "./FormField";
import {
  MOCK_AGENDAMENTOS,
  MOCK_CATEGORIAS_PRODUTOS,
  MOCK_CATEGORIAS_SERVICOS,
  MOCK_PRODUTOS,
  MOCK_SERVICOS,
  calcularTotal,
} from "./mocks";
import type {
  Comanda,
  ComandaFormValues,
  ComandaItem,
  ItemTipo,
} from "@/types/orders.types";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function novoItemId() {
  return `it-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`;
}

const sectionMotion = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

/**
 * Card de seção sem link de ação (SectionCard exige actionLabel, mas
 * Agendamento/Produtos/Serviços aqui não navegam pra lugar nenhum).
 * Usa os mesmos tokens do SectionCard: bg-surface-raised / border-border.
 */
function FormSectionCard({
  icon,
  title,
  description,
  delay = 0,
  children,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  delay?: number;
  children: ReactNode;
}) {
  return (
    <motion.div
      initial={sectionMotion.initial}
      animate={sectionMotion.animate}
      transition={{ duration: 0.35, delay, ease: "easeOut" }}
    >
      <Card className="bg-surface-raised border-border">
        <CardHeader className="py-4">
          <div className="flex items-baseline gap-2">
            <div className="flex items-center gap-2 text-brand">
              {icon}
              <CardTitle className="text-sm font-bold text-foreground uppercase">
                {title}
              </CardTitle>
            </div>
            {description && (
              <span className="text-xs font-normal normal-case text-muted-foreground">
                {description}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </motion.div>
  );
}

interface ItemPickerProps {
  tipo: ItemTipo;
  categorias: string[];
  catalogo: { id: string; nome: string; categoria: string; valor: number }[];
  onAdd: (item: ComandaItem) => void;
}

function ItemPicker({ tipo, categorias, catalogo, onAdd }: ItemPickerProps) {
  const [categoria, setCategoria] = useState("Todas");
  const [catalogoId, setCatalogoId] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [valor, setValor] = useState(0);

  const opcoes = useMemo(
    () =>
      categoria === "Todas"
        ? catalogo
        : catalogo.filter((c) => c.categoria === categoria),
    [categoria, catalogo],
  );

  function handleSelectCatalogo(id: string) {
    setCatalogoId(id);
    const found = catalogo.find((c) => c.id === id);
    if (found) setValor(found.valor);
  }

  function handleAdd() {
    const found = catalogo.find((c) => c.id === catalogoId);
    if (!found || quantidade < 1) return;
    onAdd({
      id: novoItemId(),
      tipo,
      catalogoId: found.id,
      nome: found.nome,
      categoria: found.categoria,
      quantidade,
      valorUnitario: valor,
    });
    setCatalogoId("");
    setQuantidade(1);
    setValor(0);
  }

  const isProduto = tipo === "PRODUTO";

  return (
    <div
      className={`grid grid-cols-1 items-end gap-4 ${
        isProduto
          ? "md:grid-cols-[1fr_1.6fr_0.8fr_1fr_auto]"
          : "md:grid-cols-[1fr_1.6fr_auto]"
      }`}
    >
      <LabeledSelect
        label="Categoria"
        required
        value={categoria}
        onValueChange={setCategoria}
        options={categorias.map((c) => ({ value: c, label: c }))}
      />

      <LabeledSelect
        label={isProduto ? "Produtos" : "Serviços"}
        required={!isProduto}
        placeholder="Selecione..."
        value={catalogoId}
        onValueChange={handleSelectCatalogo}
        options={opcoes.map((o) => ({
          value: o.id,
          label: `${o.nome} — ${currency.format(o.valor)}`,
        }))}
      />

      {isProduto && (
        <LabeledInput
          label="Quantidade"
          required
          type="number"
          min={1}
          value={quantidade}
          onChange={(e) => setQuantidade(Number(e.target.value) || 1)}
        />
      )}

      {isProduto && (
        <LabeledInput
          label="Valor"
          type="text"
          value={currency.format(valor)}
          onChange={(e) => {
            const parsed = Number(
              e.target.value.replace(/[^\d,.-]/g, "").replace(",", "."),
            );
            setValor(Number.isFinite(parsed) ? parsed : 0);
          }}
        />
      )}

      <motion.div whileTap={{ scale: 0.92 }}>
        <Button
          type="button"
          size="icon"
          onClick={handleAdd}
          disabled={!catalogoId}
          className="w-full cursor-pointer bg-success text-success-foreground hover:opacity-90 disabled:cursor-not-allowed"
        >
          <Plus className="size-4" />
        </Button>
      </motion.div>
    </div>
  );
}

function ItemsList({
  itens,
  tipo,
  onRemove,
}: {
  itens: ComandaItem[];
  tipo: ItemTipo;
  onRemove: (id: string) => void;
}) {
  const filtered = itens.filter((i) => i.tipo === tipo);

  return (
    <div className="mt-4">
      <AnimatePresence mode="popLayout" initial={false}>
        {filtered.length === 0 ? (
          <motion.p
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-6 text-center text-sm font-medium text-brand/70"
          >
            Nenhum {tipo === "PRODUTO" ? "produto" : "serviço"} adicionado!
          </motion.p>
        ) : (
          <div className="space-y-2">
            {filtered.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{
                  opacity: 0,
                  scale: 0.96,
                  transition: { duration: 0.15 },
                }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="flex items-center gap-3 rounded-md border border-border bg-surface-base px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {item.nome}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.categoria} · {item.quantidade}x{" "}
                    {currency.format(item.valorUnitario)}
                  </p>
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {currency.format(item.quantidade * item.valorUnitario)}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemove(item.id)}
                  className="cursor-pointer text-muted-foreground hover:bg-danger/10 hover:text-danger"
                  aria-label="Remover item"
                >
                  <Trash2 className="size-4" />
                </Button>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export interface ComandaFormProps {
  comanda?: Comanda;
  onSubmit: (values: ComandaFormValues) => void;
}

export function ComandaForm({ comanda, onSubmit }: ComandaFormProps) {
  const router = useRouter();
  const [agendamentoId, setAgendamentoId] = useState(
    comanda?.agendamentoId ?? "",
  );
  const [itens, setItens] = useState<ComandaItem[]>(comanda?.itens ?? []);
  const [observacoes, setObservacoes] = useState(comanda?.observacoes ?? "");
  const [erro, setErro] = useState<string | null>(null);

  const agendamentoSelecionado = MOCK_AGENDAMENTOS.find(
    (a) => a.id === agendamentoId,
  );

  const total = useMemo(() => calcularTotal({ itens }), [itens]);

  function addItem(item: ComandaItem) {
    setItens((prev) => [...prev, item]);
  }

  function removeItem(id: string) {
    setItens((prev) => prev.filter((i) => i.id !== id));
  }

  function handleSubmit() {
    if (!agendamentoId) {
      setErro("Selecione o agendamento desta comanda antes de enviar.");
      return;
    }
    if (itens.length === 0) {
      setErro("Adicione ao menos um produto ou serviço.");
      return;
    }
    setErro(null);
    onSubmit({ agendamentoId, itens, observacoes });
  }

  return (
    <div className="space-y-6">
      <FormSectionCard
        title="Agendamento"
        icon={<CheckSquare className="size-4" />}
        delay={0}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <LabeledSelect
            label="Agendamento"
            required
            placeholder="Selecione o agendamento..."
            value={agendamentoId}
            onValueChange={setAgendamentoId}
            options={MOCK_AGENDAMENTOS.map((a) => ({
              value: a.id,
              label: `${a.clienteNome} · ${a.servicoPrincipal} · ${new Date(
                a.horario,
              ).toLocaleString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}`,
            }))}
          />

          <div className="flex flex-col justify-center rounded-lg border border-dashed border-border px-4 py-2.5 text-sm">
            <AnimatePresence mode="wait">
              {agendamentoSelecionado ? (
                <motion.div
                  key={agendamentoSelecionado.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="block font-semibold text-foreground">
                    {agendamentoSelecionado.profissionalNome}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Profissional responsável pelo atendimento
                  </span>
                </motion.div>
              ) : (
                <motion.span
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-muted-foreground"
                >
                  Escolha um agendamento para ver o profissional responsável.
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>
      </FormSectionCard>

      <FormSectionCard
        title="Produtos"
        icon={<Plus className="size-4" />}
        description="Preencha todos os campos obrigatórios."
        delay={0.06}
      >
        <ItemPicker
          tipo="PRODUTO"
          categorias={MOCK_CATEGORIAS_PRODUTOS}
          catalogo={MOCK_PRODUTOS}
          onAdd={addItem}
        />
        <ItemsList itens={itens} tipo="PRODUTO" onRemove={removeItem} />
      </FormSectionCard>

      <FormSectionCard
        title="Serviços"
        icon={<Plus className="size-4" />}
        description="Preencha todos os campos obrigatórios."
        delay={0.12}
      >
        <ItemPicker
          tipo="SERVICO"
          categorias={MOCK_CATEGORIAS_SERVICOS}
          catalogo={MOCK_SERVICOS}
          onAdd={addItem}
        />
        <ItemsList itens={itens} tipo="SERVICO" onRemove={removeItem} />
      </FormSectionCard>

      <AnimatePresence>
        {erro && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden rounded-md bg-danger/10 px-4 py-2 text-sm font-medium text-danger"
          >
            {erro}
          </motion.p>
        )}
      </AnimatePresence>

      <motion.div
        initial={sectionMotion.initial}
        animate={sectionMotion.animate}
        transition={{ duration: 0.35, delay: 0.18, ease: "easeOut" }}
      >
        <Card className="bg-surface-raised border-border">
          <CardContent className="flex items-center justify-between py-4">
            <motion.div whileTap={{ scale: 0.96 }}>
              <Button
                type="button"
                onClick={() => router.push("/ordere")}
                className="cursor-pointer bg-[#ec4899] text-white hover:bg-[#db2777]"
              >
                <ArrowLeft className="size-4" />
                Voltar
              </Button>
            </motion.div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Total:{" "}
                <AnimatePresence mode="wait">
                  <motion.span
                    key={total}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.15 }}
                    className="inline-block text-base font-bold text-foreground"
                  >
                    {currency.format(total)}
                  </motion.span>
                </AnimatePresence>
              </span>
              <motion.div whileTap={{ scale: 0.96 }}>
                <Button
                  type="button"
                  onClick={handleSubmit}
                  className="cursor-pointer bg-success text-success-foreground hover:opacity-90"
                >
                  <CheckSquare className="size-4" />
                  Enviar
                </Button>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
