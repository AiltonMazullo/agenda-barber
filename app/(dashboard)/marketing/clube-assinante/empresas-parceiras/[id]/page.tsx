"use client";

import { useParams, useRouter } from "next/navigation";
import { Loading } from "@/components/shared";
import {
  PartnerCompanyForm,
  type PartnerCompanyFormState,
} from "@/components/partner-companies/PartnerCompanyForm";
import { useAuth } from "@/hooks/useAuth";
import { usePartnerCompanies } from "@/hooks/usePartnerCompanies";
import { usePartnerCompanyCoupons } from "@/hooks/usePartnerCompanyCoupons";
import { apiAssetUrl } from "@/lib/api";
import type { PartnerCompany } from "@/types/partner-company.types";

function toFormState(c: PartnerCompany): PartnerCompanyFormState {
  return {
    name: c.name,
    cnpj: c.cnpj ?? "",
    email: c.email ?? "",
    phone: c.phone ?? "",
    zipCode: c.zipCode ?? "",
    address: c.address ?? "",
    number: c.number ?? "",
    complement: c.complement ?? "",
    neighborhood: c.neighborhood ?? "",
    state: c.state ?? "",
    city: c.city ?? "",
    category: c.category ?? "",
    featured: c.featured,
    status: c.status,
    website: c.website ?? "",
    facebookUsername: c.facebookUsername ?? "",
    facebookUrl: c.facebookUrl ?? "",
    instagramUsername: c.instagramUsername ?? "",
    instagramUrl: c.instagramUrl ?? "",
  };
}

export default function EditarEmpresaParceiraPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { barbershop } = useAuth();
  const { companies, isLoading, update } = usePartnerCompanies(barbershop?.id);
  const company = companies.find((c) => c.id === params.id) ?? null;

  const {
    coupons,
    isLoading: couponsLoading,
    create: createCoupon,
    update: updateCoupon,
    remove: removeCoupon,
  } = usePartnerCompanyCoupons(barbershop?.id, company?.id);

  if (!barbershop || isLoading || !company) {
    return (
      <div className="min-h-screen bg-surface-base grid place-items-center">
        <Loading />
      </div>
    );
  }

  async function handleSave(
    state: PartnerCompanyFormState,
    logo: File | null,
    removeLogo: boolean,
  ) {
    if (!company) return null;
    const updated = await update(company.id, {
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
      removeLogo,
    });
    if (updated) router.push("/marketing/clube-assinante/empresas-parceiras");
    return updated;
  }

  return (
    <PartnerCompanyForm
      initial={toFormState(company)}
      logoUrl={apiAssetUrl(company.logoUrl)}
      onSave={handleSave}
      onBack={() => router.push("/marketing/clube-assinante/empresas-parceiras")}
      isEditing
      coupons={coupons}
      couponsLoading={couponsLoading}
      onAddCoupon={createCoupon}
      onUpdateCoupon={updateCoupon}
      onRemoveCoupon={removeCoupon}
    />
  );
}
