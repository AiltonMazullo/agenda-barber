"use client";

import { useEffect, useState } from "react";
import { X, Plus, Trash2, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/shared";
import { toast } from "sonner";
import { apiAssetUrl } from "@/lib/api";
import { maskBRLInput, parseBRL, formatBRL } from "@/utils/format";
import { plansService } from "@/services/plans.service";
import type { CreatePlanPayload, Plan } from "@/types/plan.types";
import type { Service } from "@/types/service.types";
import type { Product } from "@/types/product.types";
import type { Employee } from "@/types/employee.types";
import type { Category } from "@/types/category.types";

// ─── tipos internos das linhas ────────────────────────────────────────────────

interface ServiceRow {
  serviceId: string;
  discountPercent: string; // string para edição, convertido no submit
  monthlyLimit: string; // "" = sem limite
}

interface ProductRow {
  productId: string;
  priceInCents: string; // string BRL formatada
}

interface CategoryRow {
  categoryId: string;
  discountPercent: string;
}

// ─── helpers ──────────────────────────────────────────────────────────────────

const WEEK_DAYS = [
  { value: 1, short: "Seg" },
  { value: 2, short: "Ter" },
  { value: 3, short: "Qua" },
  { value: 4, short: "Qui" },
  { value: 5, short: "Sex" },
  { value: 6, short: "Sáb" },
  { value: 7, short: "Dom" },
] as const;

function isValidHex(value: string) {
  return /^#[0-9A-Fa-f]{6}$/.test(value);
}

/** WEEK_DAYS usa ISO (1=Seg..7=Dom); `Plan.availableWeekdays` usa 0=Dom..6=Sáb (mesma convenção de `plano/page.tsx`). */
function isoToWeekday0(iso: number): number {
  return iso === 7 ? 0 : iso;
}
function weekday0ToIso(day: number): number {
  return day === 0 ? 7 : day;
}

// ─── componente ──────────────────────────────────────────────────────────────

export function DialogNovoPlano({
  open,
  onOpenChange,
  plan,
  onSave,
  services = [],
  products = [],
  employees = [],
  categories = [],
  serviceCategories = [],
  barbershopId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  plan: Plan | null;
  onSave: (payload: CreatePlanPayload) => Promise<Plan | null>;
  services?: Service[];
  products?: Product[];
  employees?: Employee[];
  /** Categorias de produto (desconto). */
  categories?: Category[];
  /** Categorias de serviço (desconto) — mesma tabela PlanCategory, tipo diferente. */
  serviceCategories?: Category[];
  /** Necessário para sincronizar categorias/contrato após salvar (rotas dedicadas por planId). */
  barbershopId?: string;
}) {
  // campos principais
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [labelColor, setLabelColor] = useState("#F5A623");
  const [hexInput, setHexInput] = useState("#F5A623");
  const [galaxId, setGalaxId] = useState("");
  const [availableQuantity, setAvailableQuantity] = useState("");
  const [hidden, setHidden] = useState(false);

  // regras operacionais
  const [freeDays, setFreeDays] = useState<number[]>([]);
  const [availableWeekdays, setAvailableWeekdays] = useState<number[]>([]);
  const [maxSimultaneous, setMaxSimultaneous] = useState("1");
  const [lockDays, setLockDays] = useState("30");
  const [frequencyDays, setFrequencyDays] = useState("7");

  // serviços
  const [serviceRows, setServiceRows] = useState<ServiceRow[]>([]);
  const [pendingServiceId, setPendingServiceId] = useState("");

  // produtos
  const [productRows, setProductRows] = useState<ProductRow[]>([]);
  const [pendingProductId, setPendingProductId] = useState("");

  // profissionais
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [pendingEmployeeId, setPendingEmployeeId] = useState("");

  // categorias de produto e de serviço (desconto %) — mesma tabela PlanCategory
  const [categoryRows, setCategoryRows] = useState<CategoryRow[]>([]);
  const [pendingCategoryId, setPendingCategoryId] = useState("");
  const [pendingServiceCategoryId, setPendingServiceCategoryId] = useState("");

  // contrato (só disponível ao editar, pois depende do planId)
  const [contractFile, setContractFile] = useState<File | null>(null);
  const [uploadingContract, setUploadingContract] = useState(false);

  const [saving, setSaving] = useState(false);

  // preenche quando abre para edição
  useEffect(() => {
    if (!open) return;
    setName(plan?.name ?? "");
    setPrice(plan ? maskBRLInput(String(plan.priceInCents)) : "");
    const color = plan?.labelColor ?? "#F5A623";
    setLabelColor(color);
    setHexInput(color);
    setGalaxId(plan?.galaxId ?? "");
    setAvailableQuantity(
      plan?.availableQuantity != null ? String(plan.availableQuantity) : "",
    );
    setHidden(plan?.hidden ?? false);
    setFreeDays(plan?.freeDays ?? []);
    setAvailableWeekdays(
      (plan?.availableWeekdays ?? []).map(weekday0ToIso).sort((a, b) => a - b),
    );
    setMaxSimultaneous(String(plan?.maxSimultaneousServices ?? 1));
    setLockDays(String(plan?.subscriptionLockDays ?? 30));
    setFrequencyDays(String(plan?.serviceFrequencyDays ?? 7));
    setServiceRows(
      plan?.planServices?.map((ps) => ({
        serviceId: ps.serviceId,
        discountPercent: String(ps.discountPercent),
        monthlyLimit: ps.monthlyLimit != null ? String(ps.monthlyLimit) : "",
      })) ?? [],
    );
    setProductRows(
      plan?.planProducts.map((pp) => ({
        productId: pp.productId,
        priceInCents: maskBRLInput(String(pp.priceInCents)),
      })) ?? [],
    );
    setSelectedEmployeeIds(
      plan?.planEmployees.map((pe) => pe.employeeId) ?? [],
    );
    setCategoryRows(
      plan?.planCategories?.map((pc) => ({
        categoryId: pc.categoryId,
        discountPercent: String(pc.discountPercent),
      })) ?? [],
    );
    setContractFile(null);
    setPendingServiceId("");
    setPendingProductId("");
    setPendingEmployeeId("");
    setPendingCategoryId("");
    setPendingServiceCategoryId("");
  }, [open, plan]);

  // ─── cor hex ────────────────────────────────────────────────────────────────

  function handleHexChange(raw: string) {
    const val = raw.startsWith("#") ? raw : `#${raw}`;
    setHexInput(val);
    if (isValidHex(val)) setLabelColor(val);
  }

  function handleColorPickerChange(val: string) {
    setLabelColor(val);
    setHexInput(val);
  }

  // ─── serviços ───────────────────────────────────────────────────────────────

  const selectedServiceIds = new Set(serviceRows.map((r) => r.serviceId));
  const availableServices = services.filter(
    (s) => !selectedServiceIds.has(s.id),
  );

  function addService() {
    if (!pendingServiceId) return;
    setServiceRows((prev) => [
      ...prev,
      { serviceId: pendingServiceId, discountPercent: "0", monthlyLimit: "" },
    ]);
    setPendingServiceId("");
  }

  function removeService(serviceId: string) {
    setServiceRows((prev) => prev.filter((r) => r.serviceId !== serviceId));
  }

  function updateDiscount(serviceId: string, value: string) {
    setServiceRows((prev) =>
      prev.map((r) =>
        r.serviceId === serviceId ? { ...r, discountPercent: value } : r,
      ),
    );
  }

  function updateMonthlyLimit(serviceId: string, value: string) {
    setServiceRows((prev) =>
      prev.map((r) =>
        r.serviceId === serviceId ? { ...r, monthlyLimit: value } : r,
      ),
    );
  }

  // ─── produtos ───────────────────────────────────────────────────────────────

  const selectedProductIds = new Set(productRows.map((r) => r.productId));
  const availableProducts = products.filter(
    (p) => !selectedProductIds.has(p.id),
  );

  function addProduct() {
    if (!pendingProductId) return;
    const product = products.find((p) => p.id === pendingProductId);
    setProductRows((prev) => [
      ...prev,
      {
        productId: pendingProductId,
        priceInCents: product ? maskBRLInput(String(product.priceInCents)) : "",
      },
    ]);
    setPendingProductId("");
  }

  function removeProduct(productId: string) {
    setProductRows((prev) => prev.filter((r) => r.productId !== productId));
  }

  function updateProductPrice(productId: string, value: string) {
    setProductRows((prev) =>
      prev.map((r) =>
        r.productId === productId
          ? { ...r, priceInCents: maskBRLInput(value) }
          : r,
      ),
    );
  }

  // ─── profissionais ──────────────────────────────────────────────────────────

  const availableEmployees = employees.filter(
    (e) => !selectedEmployeeIds.includes(e.id),
  );

  function addEmployee() {
    if (!pendingEmployeeId) return;
    setSelectedEmployeeIds((prev) => [...prev, pendingEmployeeId]);
    setPendingEmployeeId("");
  }

  function removeEmployee(employeeId: string) {
    setSelectedEmployeeIds((prev) => prev.filter((id) => id !== employeeId));
  }

  // ─── categorias de produto ──────────────────────────────────────────────────

  const selectedCategoryIds = new Set(categoryRows.map((r) => r.categoryId));
  const availableCategories = categories.filter((c) => !selectedCategoryIds.has(c.id));
  const availableServiceCategories = serviceCategories.filter(
    (c) => !selectedCategoryIds.has(c.id),
  );

  function addCategory() {
    if (!pendingCategoryId) return;
    setCategoryRows((prev) => [...prev, { categoryId: pendingCategoryId, discountPercent: "0" }]);
    setPendingCategoryId("");
  }

  function addServiceCategory() {
    if (!pendingServiceCategoryId) return;
    setCategoryRows((prev) => [
      ...prev,
      { categoryId: pendingServiceCategoryId, discountPercent: "0" },
    ]);
    setPendingServiceCategoryId("");
  }

  function removeCategoryRow(categoryId: string) {
    setCategoryRows((prev) => prev.filter((r) => r.categoryId !== categoryId));
  }

  function updateCategoryDiscount(categoryId: string, value: string) {
    setCategoryRows((prev) =>
      prev.map((r) => (r.categoryId === categoryId ? { ...r, discountPercent: value } : r)),
    );
  }

  async function syncCategories(planId: string) {
    if (!barbershopId) return;
    const previousIds = new Set(plan?.planCategories?.map((pc) => pc.categoryId) ?? []);
    const currentIds = new Set(categoryRows.map((r) => r.categoryId));

    for (const categoryId of previousIds) {
      if (!currentIds.has(categoryId)) {
        await plansService.removeCategory(barbershopId, planId, categoryId);
      }
    }
    for (const row of categoryRows) {
      const discountPercent = parseFloat(row.discountPercent.replace(",", ".")) || 0;
      await plansService.addCategory(barbershopId, planId, {
        categoryId: row.categoryId,
        discountPercent,
      });
    }
  }

  async function handleUploadContract() {
    if (!contractFile || !barbershopId || !plan) return;
    setUploadingContract(true);
    try {
      await plansService.uploadContract(barbershopId, plan.id, contractFile);
      toast.success("Contrato anexado.");
      setContractFile(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao anexar contrato.");
    } finally {
      setUploadingContract(false);
    }
  }

  // ─── submit ─────────────────────────────────────────────────────────────────

  async function handleSave() {
    if (name.trim().length < 2) {
      toast.error("Informe o nome do plano.");
      return;
    }
    const priceInCents = Math.round(parseBRL(price) * 100);
    if (priceInCents <= 0) {
      toast.error("Informe um valor válido.");
      return;
    }
    if (!isValidHex(labelColor)) {
      toast.error("Informe uma cor hexadecimal válida (ex.: #F5A623).");
      return;
    }
    const qty = availableQuantity.trim()
      ? parseInt(availableQuantity, 10)
      : undefined;
    if (qty !== undefined && (Number.isNaN(qty) || qty <= 0)) {
      toast.error("Quantidade disponível deve ser um número positivo.");
      return;
    }

    const maxSimultaneousNum = parseInt(maxSimultaneous, 10);
    if (Number.isNaN(maxSimultaneousNum) || maxSimultaneousNum < 1) {
      toast.error("Serviços simultâneos deve ser no mínimo 1.");
      return;
    }
    const lockDaysNum = parseInt(lockDays, 10);
    if (Number.isNaN(lockDaysNum) || lockDaysNum < 0) {
      toast.error("Bloqueio de assinatura deve ser 0 ou mais dias.");
      return;
    }
    const frequencyDaysNum = parseInt(frequencyDays, 10);
    if (Number.isNaN(frequencyDaysNum) || frequencyDaysNum < 0) {
      toast.error("Periodicidade deve ser 0 ou mais dias.");
      return;
    }

    // valida descontos e limites mensais
    for (const row of serviceRows) {
      const d = parseFloat(row.discountPercent.replace(",", "."));
      if (Number.isNaN(d) || d < 0 || d > 100) {
        const svc = services.find((s) => s.id === row.serviceId);
        toast.error(
          `Desconto inválido para "${svc?.name ?? "serviço"}". Use 0 a 100.`,
        );
        return;
      }
      if (row.monthlyLimit.trim() !== "") {
        const limit = parseInt(row.monthlyLimit, 10);
        if (Number.isNaN(limit) || limit < 1) {
          const svc = services.find((s) => s.id === row.serviceId);
          toast.error(
            `Limite mensal inválido para "${svc?.name ?? "serviço"}". Use um número maior que 0.`,
          );
          return;
        }
      }
    }

    // valida preços de produtos
    for (const row of productRows) {
      const cents = Math.round(parseBRL(row.priceInCents) * 100);
      if (cents < 0) {
        const prod = products.find((p) => p.id === row.productId);
        toast.error(`Preço inválido para "${prod?.name ?? "produto"}".`);
        return;
      }
    }

    setSaving(true);
    try {
      const result = await onSave({
        name: name.trim(),
        priceInCents,
        labelColor,
        galaxId: galaxId.trim() || undefined,
        availableQuantity: qty ?? null,
        hidden,
        freeDays,
        availableWeekdays: availableWeekdays.map(isoToWeekday0).sort((a, b) => a - b),
        maxSimultaneousServices: maxSimultaneousNum,
        subscriptionLockDays: lockDaysNum,
        serviceFrequencyDays: frequencyDaysNum,
        services: serviceRows.map((r) => ({
          serviceId: r.serviceId,
          discountPercent: parseFloat(r.discountPercent.replace(",", ".")) || 0,
          monthlyLimit: r.monthlyLimit.trim() ? parseInt(r.monthlyLimit, 10) : undefined,
        })),
        employees: selectedEmployeeIds.map((employeeId) => ({ employeeId })),
        products: productRows.map((r) => ({
          productId: r.productId,
          priceInCents: Math.round(parseBRL(r.priceInCents) * 100),
        })),
      });
      if (result) {
        await syncCategories(result.id);
        // Criação: o upload de contrato só pode acontecer depois que o plano
        // existe (planId), mas o arquivo já foi escolhido no formulário —
        // sobe automaticamente aqui pra "anexar contrato na criação do
        // plano" não depender de reabrir o plano em edição.
        if (!plan && contractFile && barbershopId) {
          try {
            await plansService.uploadContract(barbershopId, result.id, contractFile);
            toast.success("Plano criado e contrato anexado.");
          } catch (err) {
            toast.error(
              err instanceof Error
                ? `Plano criado, mas falha ao anexar contrato: ${err.message}`
                : "Plano criado, mas falha ao anexar contrato.",
            );
          }
        }
        onOpenChange(false);
      }
    } finally {
      setSaving(false);
    }
  }

  // ─── render ─────────────────────────────────────────────────────────────────

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface-raised border border-border text-foreground max-w-lg p-0 gap-0 max-h-[90vh] flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border-subtle shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-bold">
              {plan ? "Editar plano" : "Novo plano"}
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

        {/* scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">
          {/* ── informações principais ── */}
          <Section label="Informações principais">
            <div className="space-y-3">
              <Field label="Nome">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex.: Plano Mensal Corte"
                  className="bg-surface-base border-border text-foreground placeholder:text-text-faint focus-visible:ring-brand/30 h-10"
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Valor mensal">
                  <Input
                    value={price}
                    onChange={(e) => setPrice(maskBRLInput(e.target.value))}
                    placeholder="R$ 0,00"
                    inputMode="numeric"
                    className="bg-surface-base border-border text-foreground placeholder:text-text-faint focus-visible:ring-brand/30 h-10"
                  />
                </Field>
                <Field label="Qtd. disponível">
                  <Input
                    type="number"
                    min={1}
                    value={availableQuantity}
                    onChange={(e) => setAvailableQuantity(e.target.value)}
                    placeholder="0 (sem vagas)"
                    className="bg-surface-base border-border text-foreground placeholder:text-text-faint focus-visible:ring-brand/30 h-10"
                  />
                </Field>
              </div>
              <p className="text-[11px] text-text-faint -mt-1">
                Deixar em branco = 0 vagas: o plano fica indisponível para novas contratações até
                você definir uma quantidade.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Cor (hex)">
                  <div className="flex items-center gap-2">
                    {/* swatch clicável que abre o color picker nativo */}
                    <label
                      className="size-10 rounded-md border border-border shrink-0 cursor-pointer"
                      style={{
                        backgroundColor: isValidHex(labelColor)
                          ? labelColor
                          : "#888",
                      }}
                      title="Abrir seletor de cor"
                    >
                      <input
                        type="color"
                        value={isValidHex(labelColor) ? labelColor : "#888888"}
                        onChange={(e) =>
                          handleColorPickerChange(e.target.value)
                        }
                        className="sr-only"
                      />
                    </label>
                    <Input
                      value={hexInput}
                      onChange={(e) => handleHexChange(e.target.value)}
                      placeholder="#F5A623"
                      maxLength={7}
                      className={`bg-surface-base border-border text-foreground placeholder:text-text-faint focus-visible:ring-brand/30 h-10 font-mono ${
                        !isValidHex(labelColor) ? "border-danger/60" : ""
                      }`}
                    />
                  </div>
                </Field>
                <Field label="ID GalaxPay">
                  <Input
                    value={galaxId}
                    onChange={(e) => setGalaxId(e.target.value)}
                    placeholder="plan_abc123"
                    className="bg-surface-base border-border text-foreground placeholder:text-text-faint focus-visible:ring-brand/30 h-10"
                  />
                </Field>
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hidden}
                  onChange={(e) => setHidden(e.target.checked)}
                  className="size-4 rounded border-border accent-brand"
                />
                <span className="text-sm text-muted-foreground">
                  Ocultar no app do cliente
                </span>
              </label>
            </div>
          </Section>

          {/* ── regras operacionais ── */}
          <Section label="Regras operacionais">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <SelectField
                  id="maxSimultaneous"
                  label="Serviços simultâneos"
                  value={maxSimultaneous}
                  onChange={setMaxSimultaneous}
                  options={["1", "2", "4"]}
                />
                <SelectField
                  id="lockDays"
                  label="Bloqueio (dias)"
                  value={lockDays}
                  onChange={setLockDays}
                  options={[{ value: "0", label: "Sem bloqueio" }, "30", "60", "90"]}
                />
                <Field label="Periodicidade (dias)">
                  <Input
                    id="frequencyDays"
                    type="number"
                    min={0}
                    value={frequencyDays}
                    onChange={(e) => setFrequencyDays(e.target.value)}
                    className="bg-surface-base border-border text-foreground placeholder:text-text-faint focus-visible:ring-brand/30 h-10"
                  />
                </Field>
              </div>
              <p className="text-[11px] text-text-faint -mt-1">
                &quot;Serviços simultâneos&quot; define o intervalo mínimo entre usos: após o cliente usar
                um serviço do plano, o próximo agendamento online de outro serviço do plano só
                libera 30 min após o término do anterior — não é a quantidade de serviços no
                mesmo agendamento (isso é o carrinho de serviços).
              </p>

              <Field label="Dias de gratuidade">
                <div className="flex gap-1.5 flex-nowrap">
                  {WEEK_DAYS.map(({ value, short }) => {
                    const active = freeDays.includes(value);
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() =>
                          setFreeDays((prev) =>
                            active
                              ? prev.filter((d) => d !== value)
                              : [...prev, value].sort((a, b) => a - b),
                          )
                        }
                        className={`w-full h-9 rounded-md text-xs font-bold border transition-colors ${
                          active
                            ? "bg-brand text-brand-foreground border-brand"
                            : "bg-surface-base text-muted-foreground border-border hover:border-brand/40 hover:text-foreground"
                        }`}
                      >
                        {short}
                      </button>
                    );
                  })}
                </div>
              </Field>

              <Field label="Permitido para">
                <div className="flex gap-1.5 flex-nowrap">
                  {WEEK_DAYS.map(({ value, short }) => {
                    const active = availableWeekdays.includes(value);
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() =>
                          setAvailableWeekdays((prev) =>
                            active
                              ? prev.filter((d) => d !== value)
                              : [...prev, value].sort((a, b) => a - b),
                          )
                        }
                        className={`w-full h-9 rounded-md text-xs font-bold border transition-colors ${
                          active
                            ? "bg-brand text-brand-foreground border-brand"
                            : "bg-surface-base text-muted-foreground border-border hover:border-brand/40 hover:text-foreground"
                        }`}
                      >
                        {short}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-text-faint mt-1">
                  Deixe vazio para o plano valer todos os dias.
                </p>
              </Field>
            </div>
          </Section>

          {/* ── serviços inclusos ── */}
          <Section label="Serviços inclusos">
            <p className="text-xs text-text-faint -mt-1">
              Qtd. grátis no mês e desconto (%) aplicado a partir do uso que exceder essa
              quantidade. Deixe em branco para sempre grátis, sem limite.
            </p>
            <div className="space-y-2">
              {serviceRows.length > 0 && (
                <div className="space-y-1.5">
                  {serviceRows.map((row) => {
                    const svc = services.find((s) => s.id === row.serviceId);
                    return (
                      <div
                        key={row.serviceId}
                        className="flex items-center gap-2 bg-surface-base border border-border rounded-md px-3 py-2"
                      >
                        <span className="flex-1 text-sm text-foreground truncate">
                          {svc?.name ?? row.serviceId}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          <Input
                            value={row.monthlyLimit}
                            onChange={(e) =>
                              updateMonthlyLimit(row.serviceId, e.target.value)
                            }
                            type="number"
                            min={1}
                            placeholder="Sem limite"
                            title="Qtd. grátis por mês"
                            className="w-20 h-7 text-xs bg-surface-raised border-border text-foreground focus-visible:ring-brand/30 text-right px-2"
                          />
                          <span className="text-xs text-muted-foreground">grátis/mês</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Input
                            value={row.discountPercent}
                            onChange={(e) =>
                              updateDiscount(row.serviceId, e.target.value)
                            }
                            inputMode="decimal"
                            className="w-16 h-7 text-xs bg-surface-raised border-border text-foreground focus-visible:ring-brand/30 text-right px-2"
                          />
                          <span className="text-xs text-muted-foreground">
                            %
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeService(row.serviceId)}
                          className="size-6 rounded flex items-center justify-center text-muted-foreground hover:text-danger-foreground transition-colors shrink-0"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {availableServices.length > 0 ? (
                <div className="flex gap-2">
                  <select
                    value={pendingServiceId}
                    onChange={(e) => setPendingServiceId(e.target.value)}
                    className="flex-1 h-9 rounded-md border border-border bg-surface-base text-sm text-foreground px-2 focus:outline-none focus:ring-1 focus:ring-brand/30"
                  >
                    <option value="">Selecionar serviço…</option>
                    {availableServices.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} — {formatBRL(s.priceInCents / 100)}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={addService}
                    disabled={!pendingServiceId}
                    className="h-9 px-3 rounded-md border border-border bg-surface-base text-muted-foreground hover:text-foreground hover:border-brand/40 transition-colors disabled:opacity-40 flex items-center gap-1 text-sm"
                  >
                    <Plus className="size-3.5" />
                    Adicionar
                  </button>
                </div>
              ) : services.length > 0 ? (
                <p className="text-xs text-text-faint">
                  Todos os serviços já foram adicionados.
                </p>
              ) : (
                <p className="text-xs text-text-faint">
                  Nenhum serviço cadastrado na barbearia.
                </p>
              )}
            </div>
          </Section>

          {/* ── profissionais habilitados ── */}
          <Section label="Profissionais habilitados">
            <div className="space-y-2">
              {selectedEmployeeIds.length > 0 && (
                <div className="space-y-1.5">
                  {selectedEmployeeIds.map((empId) => {
                    const emp = employees.find((e) => e.id === empId);
                    return (
                      <div
                        key={empId}
                        className="flex items-center gap-2 bg-surface-base border border-border rounded-md px-3 py-2"
                      >
                        <span className="flex-1 text-sm text-foreground truncate">
                          {emp?.name ?? empId}
                          {emp?.appName && emp.appName !== emp.name && (
                            <span className="text-text-faint ml-1">
                              ({emp.appName})
                            </span>
                          )}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeEmployee(empId)}
                          className="size-6 rounded flex items-center justify-center text-muted-foreground hover:text-danger-foreground transition-colors shrink-0"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {availableEmployees.length > 0 ? (
                <div className="flex gap-2">
                  <select
                    value={pendingEmployeeId}
                    onChange={(e) => setPendingEmployeeId(e.target.value)}
                    className="flex-1 h-9 rounded-md border border-border bg-surface-base text-sm text-foreground px-2 focus:outline-none focus:ring-1 focus:ring-brand/30"
                  >
                    <option value="">Selecionar profissional…</option>
                    {availableEmployees.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name}
                        {e.appName !== e.name ? ` (${e.appName})` : ""}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={addEmployee}
                    disabled={!pendingEmployeeId}
                    className="h-9 px-3 rounded-md border border-border bg-surface-base text-muted-foreground hover:text-foreground hover:border-brand/40 transition-colors disabled:opacity-40 flex items-center gap-1 text-sm"
                  >
                    <Plus className="size-3.5" />
                    Adicionar
                  </button>
                </div>
              ) : employees.length > 0 ? (
                <p className="text-xs text-text-faint">
                  Todos os profissionais já foram adicionados.
                </p>
              ) : (
                <p className="text-xs text-text-faint">
                  Nenhum profissional cadastrado na barbearia.
                </p>
              )}
            </div>
          </Section>

          {/* ── produtos inclusos ── */}
          <Section label="Produtos inclusos">
            <div className="space-y-2">
              {productRows.length > 0 && (
                <div className="space-y-1.5">
                  {productRows.map((row) => {
                    const prod = products.find((p) => p.id === row.productId);
                    return (
                      <div
                        key={row.productId}
                        className="flex items-center gap-2 bg-surface-base border border-border rounded-md px-3 py-2"
                      >
                        <span className="flex-1 text-sm text-foreground truncate">
                          {prod?.name ?? row.productId}
                        </span>
                        {prod && (
                          <span className="text-xs text-text-faint shrink-0">
                            base {formatBRL(prod.priceInCents / 100)}
                          </span>
                        )}
                        <Input
                          value={row.priceInCents}
                          onChange={(e) =>
                            updateProductPrice(row.productId, e.target.value)
                          }
                          inputMode="numeric"
                          placeholder="R$ 0,00"
                          className="w-28 h-7 text-xs bg-surface-raised border-border text-foreground focus-visible:ring-brand/30 px-2"
                        />
                        <button
                          type="button"
                          onClick={() => removeProduct(row.productId)}
                          className="size-6 rounded flex items-center justify-center text-muted-foreground hover:text-danger-foreground transition-colors shrink-0"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {availableProducts.length > 0 ? (
                <div className="flex gap-2">
                  <select
                    value={pendingProductId}
                    onChange={(e) => setPendingProductId(e.target.value)}
                    className="flex-1 h-9 rounded-md border border-border bg-surface-base text-sm text-foreground px-2 focus:outline-none focus:ring-1 focus:ring-brand/30"
                  >
                    <option value="">Selecionar produto…</option>
                    {availableProducts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — {formatBRL(p.priceInCents / 100)}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={addProduct}
                    disabled={!pendingProductId}
                    className="h-9 px-3 rounded-md border border-border bg-surface-base text-muted-foreground hover:text-foreground hover:border-brand/40 transition-colors disabled:opacity-40 flex items-center gap-1 text-sm"
                  >
                    <Plus className="size-3.5" />
                    Adicionar
                  </button>
                </div>
              ) : products.length > 0 ? (
                <p className="text-xs text-text-faint">
                  Todos os produtos já foram adicionados.
                </p>
              ) : (
                <p className="text-xs text-text-faint">
                  Nenhum produto cadastrado na barbearia.
                </p>
              )}
            </div>
          </Section>
          {/* ── categorias de serviço ── */}
          <Section label="Categorias de serviço (desconto)">
            <div className="space-y-2">
              {categoryRows
                .filter((row) => serviceCategories.some((c) => c.id === row.categoryId))
                .map((row) => {
                  const cat = serviceCategories.find((c) => c.id === row.categoryId);
                  return (
                    <div
                      key={row.categoryId}
                      className="flex items-center gap-2 bg-surface-base border border-border rounded-md px-3 py-2"
                    >
                      <span className="flex-1 text-sm text-foreground truncate">
                        {cat?.name ?? row.categoryId}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        <Input
                          value={row.discountPercent}
                          onChange={(e) => updateCategoryDiscount(row.categoryId, e.target.value)}
                          inputMode="decimal"
                          className="w-16 h-7 text-xs bg-surface-raised border-border text-foreground focus-visible:ring-brand/30 text-right px-2"
                        />
                        <span className="text-xs text-muted-foreground">%</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeCategoryRow(row.categoryId)}
                        className="size-6 rounded flex items-center justify-center text-muted-foreground hover:text-danger-foreground transition-colors shrink-0"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  );
                })}

              {availableServiceCategories.length > 0 ? (
                <div className="flex gap-2">
                  <select
                    value={pendingServiceCategoryId}
                    onChange={(e) => setPendingServiceCategoryId(e.target.value)}
                    className="flex-1 h-9 rounded-md border border-border bg-surface-base text-sm text-foreground px-2 focus:outline-none focus:ring-1 focus:ring-brand/30"
                  >
                    <option value="">Selecionar categoria…</option>
                    {availableServiceCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={addServiceCategory}
                    disabled={!pendingServiceCategoryId}
                    className="h-9 px-3 rounded-md border border-border bg-surface-base text-muted-foreground hover:text-foreground hover:border-brand/40 transition-colors disabled:opacity-40 flex items-center gap-1 text-sm"
                  >
                    <Plus className="size-3.5" />
                    Adicionar
                  </button>
                </div>
              ) : (
                <p className="text-xs text-text-faint">
                  {serviceCategories.length > 0
                    ? "Todas as categorias já foram adicionadas."
                    : "Nenhuma categoria de serviço cadastrada na barbearia."}
                </p>
              )}
            </div>
          </Section>

          {/* ── categorias de produto ── */}
          <Section label="Categorias de produto (desconto)">
            <div className="space-y-2">
              {categoryRows.length > 0 && (
                <div className="space-y-1.5">
                  {categoryRows
                    .filter((row) => categories.some((c) => c.id === row.categoryId))
                    .map((row) => {
                    const cat = categories.find((c) => c.id === row.categoryId);
                    return (
                      <div
                        key={row.categoryId}
                        className="flex items-center gap-2 bg-surface-base border border-border rounded-md px-3 py-2"
                      >
                        <span className="flex-1 text-sm text-foreground truncate">
                          {cat?.name ?? row.categoryId}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          <Input
                            value={row.discountPercent}
                            onChange={(e) => updateCategoryDiscount(row.categoryId, e.target.value)}
                            inputMode="decimal"
                            className="w-16 h-7 text-xs bg-surface-raised border-border text-foreground focus-visible:ring-brand/30 text-right px-2"
                          />
                          <span className="text-xs text-muted-foreground">%</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeCategoryRow(row.categoryId)}
                          className="size-6 rounded flex items-center justify-center text-muted-foreground hover:text-danger-foreground transition-colors shrink-0"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {availableCategories.length > 0 ? (
                <div className="flex gap-2">
                  <select
                    value={pendingCategoryId}
                    onChange={(e) => setPendingCategoryId(e.target.value)}
                    className="flex-1 h-9 rounded-md border border-border bg-surface-base text-sm text-foreground px-2 focus:outline-none focus:ring-1 focus:ring-brand/30"
                  >
                    <option value="">Selecionar categoria…</option>
                    {availableCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={addCategory}
                    disabled={!pendingCategoryId}
                    className="h-9 px-3 rounded-md border border-border bg-surface-base text-muted-foreground hover:text-foreground hover:border-brand/40 transition-colors disabled:opacity-40 flex items-center gap-1 text-sm"
                  >
                    <Plus className="size-3.5" />
                    Adicionar
                  </button>
                </div>
              ) : (
                <p className="text-xs text-text-faint">
                  {categories.length > 0
                    ? "Todas as categorias já foram adicionadas."
                    : "Nenhuma categoria cadastrada na barbearia."}
                </p>
              )}
            </div>
          </Section>

          {/* ── contrato ── */}
          <Section label="Contrato">
            <p className="text-xs text-text-faint -mt-1">
              Link do contrato disparado junto com o link de checkout no processo de
              assinatura.
            </p>
            <div className="space-y-2">
              {plan?.contractUrl && (
                <a
                  href={apiAssetUrl(plan.contractUrl) ?? plan.contractUrl}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="inline-flex items-center gap-1.5 text-xs text-brand hover:underline"
                >
                  <Download className="size-3.5" />
                  Baixar contrato atual
                </a>
              )}
              <div className="flex gap-2">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setContractFile(e.target.files?.[0] ?? null)}
                  className="flex-1 text-xs text-muted-foreground file:mr-2 file:h-8 file:px-3 file:rounded-md file:border-0 file:bg-surface-elevated file:text-foreground"
                />
                {plan && (
                  <button
                    type="button"
                    onClick={handleUploadContract}
                    disabled={!contractFile || uploadingContract}
                    className="h-9 px-3 rounded-md border border-border bg-surface-base text-muted-foreground hover:text-foreground hover:border-brand/40 transition-colors disabled:opacity-40 text-sm"
                  >
                    {uploadingContract ? "Enviando…" : "Adicionar contrato"}
                  </button>
                )}
              </div>
              {!plan && (
                <p className="text-[11px] text-text-faint">
                  {contractFile
                    ? `"${contractFile.name}" será anexado ao criar o plano.`
                    : "Selecione o PDF do contrato — será anexado automaticamente ao criar o plano."}
                </p>
              )}
            </div>
          </Section>
        </div>

        {/* footer fixo */}
        <div className="px-6 pb-6 pt-4 border-t border-border-subtle flex justify-end gap-3 shrink-0">
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
            disabled={saving}
            className="h-9 px-5 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors disabled:opacity-60"
          >
            {saving ? "Salvando…" : plan ? "Salvar" : "Criar plano"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── sub-componentes locais ──────────────────────────────────────────────────

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      {children}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}
