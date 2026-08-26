"use client";

import { useRef, useState } from "react";
import { ArrowLeft, Flame, X } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/shared";
import { maskCep, maskCnpj, maskPhone } from "@/utils/format";
import { fetchAddressByCep } from "@/utils/cep";
import { UF_OPTIONS } from "@/utils/constants";
import type {
  Coupon,
  CreateCouponPayload,
  PartnerCompanyStatus,
  UpdateCouponPayload,
} from "@/types/partner-company.types";
import { SectionShell, FieldLabel, INPUT_CLS } from "./Primitives";
import { CuponsSection } from "./CuponsSection";

export interface PartnerCompanyFormState {
  name: string;
  cnpj: string;
  email: string;
  phone: string;
  zipCode: string;
  address: string;
  number: string;
  complement: string;
  neighborhood: string;
  state: string;
  city: string;
  category: string;
  featured: boolean;
  status: PartnerCompanyStatus;
  website: string;
  facebookUsername: string;
  facebookUrl: string;
  instagramUsername: string;
  instagramUrl: string;
}

export const EMPTY_PARTNER_COMPANY_FORM: PartnerCompanyFormState = {
  name: "",
  cnpj: "",
  email: "",
  phone: "",
  zipCode: "",
  address: "",
  number: "",
  complement: "",
  neighborhood: "",
  state: "",
  city: "",
  category: "",
  featured: false,
  status: "ACTIVE",
  website: "",
  facebookUsername: "",
  facebookUrl: "",
  instagramUsername: "",
  instagramUrl: "",
};

const STATUS_OPTIONS = [
  { value: "ACTIVE" as const, label: "Ativo" },
  { value: "INACTIVE" as const, label: "Inativo" },
];

const FEATURED_OPTIONS = [
  { value: "true" as const, label: "Sim" },
  { value: "false" as const, label: "Não" },
];

export function PartnerCompanyForm({
  initial,
  logoUrl,
  onSave,
  onBack,
  isEditing,
  coupons,
  couponsLoading,
  onAddCoupon,
  onUpdateCoupon,
  onRemoveCoupon,
}: {
  initial: PartnerCompanyFormState;
  /** Logo já salva no backend (URL resolvida) — tem prioridade no preview até um novo arquivo ser escolhido. */
  logoUrl?: string | null;
  onSave: (
    state: PartnerCompanyFormState,
    logo: File | null,
    removeLogo: boolean,
  ) => Promise<unknown>;
  onBack: () => void;
  isEditing?: boolean;
  coupons: Coupon[];
  couponsLoading?: boolean;
  onAddCoupon: (payload: CreateCouponPayload) => Promise<Coupon | null>;
  onUpdateCoupon: (id: string, payload: UpdateCouponPayload) => Promise<Coupon | null>;
  onRemoveCoupon: (id: string) => Promise<boolean>;
}) {
  const [form, setForm] = useState<PartnerCompanyFormState>(initial);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(logoUrl ?? null);
  const [logoRemoved, setLogoRemoved] = useState(false);
  const [saving, setSaving] = useState(false);
  const logoInput = useRef<HTMLInputElement>(null);

  function update<K extends keyof PartnerCompanyFormState>(
    key: K,
    value: PartnerCompanyFormState[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleCepBlur() {
    const address = await fetchAddressByCep(form.zipCode);
    if (!address) return;
    setForm((prev) => ({
      ...prev,
      address: address.street || prev.address,
      neighborhood: address.neighborhood || prev.neighborhood,
      city: address.city || prev.city,
      state: address.uf || prev.state,
    }));
  }

  function handleLogoChange(file: File | null) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Use uma imagem JPG, PNG ou WebP.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("A logo deve ter no máximo 2MB.");
      return;
    }
    setLogoFile(file);
    setLogoRemoved(false);
    setLogoPreview(URL.createObjectURL(file));
  }

  function handleRemoveLogo() {
    setLogoFile(null);
    setLogoRemoved(true);
    setLogoPreview(null);
  }

  async function handleSave() {
    if (!form.name.trim()) return toast.error("Informe o nome da empresa.");
    setSaving(true);
    try {
      const result = await onSave(form, logoFile, logoRemoved);
      if (result) {
        setLogoFile(null);
        setLogoRemoved(false);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-surface-base min-h-screen text-foreground">
      <div className="flex items-center justify-between gap-3 border-b border-border bg-surface-base px-4 md:px-6 py-3">
        <div>
          <h1 className="text-lg font-bold">
            {isEditing ? "Editar empresa parceira" : "Nova empresa parceira"}
          </h1>
          <p className="text-xs text-muted-foreground">
            Preencha todos os campos obrigatórios.
          </p>
        </div>
      </div>

      <div className="p-4 md:p-6 space-y-5">
        <SectionShell title="Dados" description="Preencha todos os campos obrigatórios.">
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <FieldLabel required>Nome</FieldLabel>
                <Input
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  className={INPUT_CLS}
                />
              </div>
              <div className="space-y-1.5">
                <FieldLabel>CNPJ</FieldLabel>
                <Input
                  value={form.cnpj}
                  onChange={(e) => update("cnpj", maskCnpj(e.target.value))}
                  inputMode="numeric"
                  placeholder="00.000.000/0000-00"
                  className={INPUT_CLS}
                />
              </div>
              <div className="space-y-1.5">
                <FieldLabel>Email</FieldLabel>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="contato@empresa.com"
                  className={INPUT_CLS}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <FieldLabel>Telefone</FieldLabel>
                <Input
                  value={form.phone}
                  onChange={(e) => update("phone", maskPhone(e.target.value))}
                  inputMode="numeric"
                  maxLength={15}
                  placeholder="(11) 99999-0000"
                  className={INPUT_CLS}
                />
              </div>
              <div className="space-y-1.5">
                <FieldLabel>CEP</FieldLabel>
                <Input
                  value={form.zipCode}
                  onChange={(e) => update("zipCode", maskCep(e.target.value))}
                  onBlur={() => void handleCepBlur()}
                  inputMode="numeric"
                  placeholder="00000-000"
                  className={INPUT_CLS}
                />
              </div>
              <div className="space-y-1.5">
                <FieldLabel>Endereço</FieldLabel>
                <Input
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                  className={INPUT_CLS}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <FieldLabel>Bairro</FieldLabel>
                <Input
                  value={form.neighborhood}
                  onChange={(e) => update("neighborhood", e.target.value)}
                  className={INPUT_CLS}
                />
              </div>
              <div className="space-y-1.5">
                <FieldLabel>Número</FieldLabel>
                <Input
                  value={form.number}
                  onChange={(e) => update("number", e.target.value)}
                  className={INPUT_CLS}
                />
              </div>
              <div className="space-y-1.5">
                <FieldLabel>Complemento</FieldLabel>
                <Input
                  value={form.complement}
                  onChange={(e) => update("complement", e.target.value)}
                  className={INPUT_CLS}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <SelectField
                id="partner-uf"
                label="Estado"
                value={form.state}
                options={UF_OPTIONS}
                placeholder="Selecione"
                onChange={(v) => update("state", v)}
              />
              <div className="space-y-1.5">
                <FieldLabel>Cidade</FieldLabel>
                <Input
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                  className={INPUT_CLS}
                />
              </div>
              <div className="space-y-1.5">
                <FieldLabel>Categoria</FieldLabel>
                <Input
                  value={form.category}
                  onChange={(e) => update("category", e.target.value)}
                  placeholder="Ex.: Estética, Academia…"
                  className={INPUT_CLS}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <SelectField
                id="partner-featured"
                label="Destaque?"
                value={form.featured ? "true" : "false"}
                options={FEATURED_OPTIONS}
                onChange={(v) => update("featured", v === "true")}
              />
              <SelectField
                id="partner-status"
                label="Status"
                value={form.status}
                options={STATUS_OPTIONS}
                onChange={(v) => update("status", v)}
              />
            </div>
          </div>
        </SectionShell>

        <SectionShell
          title="Redes Sociais"
          description="Preencha com as redes sociais da sua empresa."
        >
          <div className="space-y-3">
            <div className="space-y-1.5">
              <FieldLabel>Site</FieldLabel>
              <Input
                value={form.website}
                onChange={(e) => update("website", e.target.value)}
                placeholder="www.empresa.com.br"
                className={INPUT_CLS}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <FieldLabel>Usuário Facebook</FieldLabel>
                <Input
                  value={form.facebookUsername}
                  onChange={(e) => update("facebookUsername", e.target.value)}
                  className={INPUT_CLS}
                />
              </div>
              <div className="space-y-1.5">
                <FieldLabel>Link Facebook</FieldLabel>
                <Input
                  value={form.facebookUrl}
                  onChange={(e) => update("facebookUrl", e.target.value)}
                  placeholder="https://www.facebook.com/usuário"
                  className={INPUT_CLS}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <FieldLabel>Usuário Instagram</FieldLabel>
                <Input
                  value={form.instagramUsername}
                  onChange={(e) => update("instagramUsername", e.target.value)}
                  className={INPUT_CLS}
                />
              </div>
              <div className="space-y-1.5">
                <FieldLabel>Link Instagram</FieldLabel>
                <Input
                  value={form.instagramUrl}
                  onChange={(e) => update("instagramUrl", e.target.value)}
                  placeholder="https://www.instagram.com/usuário"
                  className={INPUT_CLS}
                />
              </div>
            </div>
          </div>
        </SectionShell>

        <SectionShell title="Logo" description="A logo deve ter até 2MB de dimensões.">
          {logoPreview ? (
            <div className="relative max-w-md mx-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoPreview}
                alt="Logo da empresa parceira"
                className="w-full max-h-56 object-contain rounded-md border border-border-subtle bg-surface-base"
              />
              <button
                type="button"
                onClick={handleRemoveLogo}
                className="absolute inset-x-0 bottom-0 h-9 flex items-center justify-center gap-1.5 rounded-b-md bg-danger/90 text-sm font-bold text-white hover:bg-danger transition-colors"
              >
                <X className="size-3.5" />
                Remover
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => logoInput.current?.click()}
              className="w-full flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-surface-base py-10 text-muted-foreground hover:border-brand/40 transition-colors"
            >
              <Flame className="size-8 text-brand" />
              <span className="text-sm font-medium">Clique para enviar a logo</span>
              <span className="text-[11px] text-text-faint">JPG/PNG/WebP até 2MB</span>
            </button>
          )}
          <input
            ref={logoInput}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => handleLogoChange(e.target.files?.[0] ?? null)}
          />
        </SectionShell>

        <CuponsSection
          coupons={coupons}
          isLoading={couponsLoading}
          onAdd={onAddCoupon}
          onUpdate={onUpdateCoupon}
          onRemove={onRemoveCoupon}
        />

        <div className="flex justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            className="h-10 px-5 rounded-md bg-danger text-white text-sm font-bold hover:bg-danger/90 transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="size-3.5" />
            Voltar
          </button>
          <Button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="h-10 px-6 bg-success hover:bg-success/90 text-white font-bold disabled:opacity-60"
          >
            {saving ? "Salvando…" : "Salvar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
