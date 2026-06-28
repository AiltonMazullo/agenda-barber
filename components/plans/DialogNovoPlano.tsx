"use client";

import { useEffect, useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { maskBRLInput, parseBRL, formatBRL } from "@/utils/format";
import type { CreatePlanPayload, Plan } from "@/types/plan.types";
import type { Service } from "@/types/service.types";
import type { Product } from "@/types/product.types";
import type { Employee } from "@/types/employee.types";

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

// ─── componente ──────────────────────────────────────────────────────────────

export function DialogNovoPlano({
  open,
  onOpenChange,
  plan,
  onSave,
  services = [],
  products = [],
  employees = [],
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  plan: Plan | null;
  onSave: (payload: CreatePlanPayload) => Promise<unknown>;
  services?: Service[];
  products?: Product[];
  employees?: Employee[];
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
  const [maxSimultaneous, setMaxSimultaneous] = useState("1");
  const [lockDays, setLockDays] = useState("0");
  const [frequencyDays, setFrequencyDays] = useState("0");

  // serviços
  const [serviceRows, setServiceRows] = useState<ServiceRow[]>([]);
  const [pendingServiceId, setPendingServiceId] = useState("");

  // produtos
  const [productRows, setProductRows] = useState<ProductRow[]>([]);
  const [pendingProductId, setPendingProductId] = useState("");

  // profissionais
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [pendingEmployeeId, setPendingEmployeeId] = useState("");

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
    setMaxSimultaneous(String(plan?.maxSimultaneousServices ?? 1));
    setLockDays(String(plan?.subscriptionLockDays ?? 0));
    setFrequencyDays(String(plan?.serviceFrequencyDays ?? 0));
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
    setPendingServiceId("");
    setPendingProductId("");
    setPendingEmployeeId("");
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
      if (result) onOpenChange(false);
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
                    placeholder="Ilimitado"
                    className="bg-surface-base border-border text-foreground placeholder:text-text-faint focus-visible:ring-brand/30 h-10"
                  />
                </Field>
              </div>

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
                <Field label="Serviços simultâneos">
                  <Input
                    type="number"
                    min={1}
                    value={maxSimultaneous}
                    onChange={(e) => setMaxSimultaneous(e.target.value)}
                    className="bg-surface-base border-border text-foreground focus-visible:ring-brand/30 h-10"
                  />
                </Field>
                <Field label="Bloqueio (dias)">
                  <Input
                    type="number"
                    min={0}
                    value={lockDays}
                    onChange={(e) => setLockDays(e.target.value)}
                    className="bg-surface-base border-border text-foreground focus-visible:ring-brand/30 h-10"
                  />
                </Field>
                <Field label="Periodicidade (dias)">
                  <Input
                    type="number"
                    min={0}
                    value={frequencyDays}
                    onChange={(e) => setFrequencyDays(e.target.value)}
                    className="bg-surface-base border-border text-foreground focus-visible:ring-brand/30 h-10"
                  />
                </Field>
              </div>

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
            </div>
          </Section>

          {/* ── serviços inclusos ── */}
          <Section label="Serviços inclusos">
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
                            placeholder="∞"
                            title="Limite de usos por mês"
                            className="w-14 h-7 text-xs bg-surface-raised border-border text-foreground focus-visible:ring-brand/30 text-right px-2"
                          />
                          <span className="text-xs text-muted-foreground">/mês</span>
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
