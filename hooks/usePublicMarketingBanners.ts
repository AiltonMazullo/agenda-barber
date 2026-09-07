"use client";

import { useEffect, useState } from "react";
import { apiAssetUrl } from "@/lib/api";
import { marketingBannerService } from "@/services/marketing-banner.service";

export interface PublicMarketingBanner {
  imageUrl: string;
  linkUrl: string | null;
}

/**
 * Banners cadastrados em Marketing > "Banners Painel Cliente" (rota pública,
 * sem auth) — usados como plano de fundo do carrossel de `BarbershopHero` na
 * home do painel do cliente logado, no lugar de `barbershop.carouselImages`,
 * sem esconder a logo/nome da barbearia (ver `BarbershopHero`).
 */
export function usePublicMarketingBanners(barbershopId: string | undefined) {
  const [banners, setBanners] = useState<PublicMarketingBanner[]>([]);

  useEffect(() => {
    if (!barbershopId) {
      setBanners([]);
      return;
    }
    let active = true;
    marketingBannerService
      .listPublic(barbershopId)
      .then((list) => {
        if (!active) return;
        const mapped = list
          .map((b) => {
            const url = b.imageUrl3 ?? b.imageUrl2 ?? b.imageUrl1;
            return url ? { imageUrl: apiAssetUrl(url) ?? url, linkUrl: b.linkUrl } : null;
          })
          .filter((b): b is PublicMarketingBanner => !!b);
        setBanners(mapped);
      })
      .catch(() => {
        if (active) setBanners([]);
      });
    return () => {
      active = false;
    };
  }, [barbershopId]);

  return banners;
}
