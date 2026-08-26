"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loading } from "@/components/shared";
import {
  PartnerCompanyForm,
  EMPTY_PARTNER_COMPANY_FORM,
  type PartnerCompanyFormState,
} from "@/components/partner-companies/PartnerCompanyForm";
import { useAuth } from "@/hooks/useAuth";
import { usePartnerCompanies } from "@/hooks/usePartnerCompanies";
import { partnerCompanyService } from "@/services/partner-company.service";
import type {
  Coupon,
  CreateCouponPayload,
  UpdateCouponPayload,
} from "@/types/partner-company.types";

export default function NovaEmpresaParceiraPage() {
  const router = useRouter();
  const { barbershop } = useAuth();
  const { create } = usePartnerCompanies(barbershop?.id);

  // Sem empresa ainda: os cupons ficam pendentes em memória e só são
  // enviados ao backend depois que a empresa é criada e ganha um ID.
  const [pendingCoupons, setPendingCoupons] = useState<Coupon[]>([]);

  if (!barbershop) {
    return (
      <div className="min-h-screen bg-surface-base grid place-items-center">
        <Loading />
      </div>
    );
  }

  async function handleAddCoupon(payload: CreateCouponPayload): Promise<Coupon | null> {
    const coupon: Coupon = {
      id: `pending-${Date.now()}`,
      partnerCompanyId: "",
      name: payload.name,
      code: payload.code,
      discount: payload.discount,
      description: payload.description,
      expiresAt: payload.expiresAt ?? null,
      clientId: null,
      usedAt: null,
      createdAt: new Date().toISOString(),
    };
    setPendingCoupons((prev) => [coupon, ...prev]);
    return coupon;
  }

  async function handleUpdateCoupon(
    id: string,
    payload: UpdateCouponPayload,
  ): Promise<Coupon | null> {
    let updated: Coupon | null = null;
    setPendingCoupons((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        updated = { ...c, ...payload, expiresAt: payload.expiresAt ?? c.expiresAt };
        return updated;
      }),
    );
    return updated;
  }

  async function handleRemoveCoupon(id: string): Promise<boolean> {
    setPendingCoupons((prev) => prev.filter((c) => c.id !== id));
    return true;
  }

  async function handleSave(state: PartnerCompanyFormState, logo: File | null) {
    if (!barbershop) return null;
    const created = await create({
      name: state.name.trim(),
      status: state.status,
      cnpj: state.cnpj.trim() || undefined,
      email: state.email.trim() || undefined,
      phone: state.phone.trim() || undefined,
      zipCode: state.zipCode.trim() || undefined,
      address: state.address.trim() || undefined,
      number: state.number.trim() || undefined,
      complement: state.complement.trim() || undefined,
      neighborhood: state.neighborhood.trim() || undefined,
      state: state.state.trim() || undefined,
      city: state.city.trim() || undefined,
      category: state.category.trim() || undefined,
      featured: state.featured,
      website: state.website.trim() || undefined,
      facebookUsername: state.facebookUsername.trim() || undefined,
      facebookUrl: state.facebookUrl.trim() || undefined,
      instagramUsername: state.instagramUsername.trim() || undefined,
      instagramUrl: state.instagramUrl.trim() || undefined,
      logo: logo ?? undefined,
    });
    if (!created) return null;

    if (pendingCoupons.length > 0) {
      await Promise.all(
        pendingCoupons.map((c) =>
          partnerCompanyService
            .createCoupon(barbershop.id, created.id, {
              name: c.name ?? "",
              code: c.code,
              discount: c.discount,
              description: c.description ?? "",
              expiresAt: c.expiresAt ?? undefined,
            })
            .catch(() => {
              toast.error(`Falha ao salvar o cupom "${c.code}".`);
            }),
        ),
      );
    }

    router.push("/marketing/clube-assinante/empresas-parceiras");
    return created;
  }

  return (
    <PartnerCompanyForm
      initial={EMPTY_PARTNER_COMPANY_FORM}
      onSave={handleSave}
      onBack={() => router.push("/marketing/clube-assinante/empresas-parceiras")}
      coupons={pendingCoupons}
      onAddCoupon={handleAddCoupon}
      onUpdateCoupon={handleUpdateCoupon}
      onRemoveCoupon={handleRemoveCoupon}
    />
  );
}
