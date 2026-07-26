/** Tipos espelhando o modelo `MarketingBanner` do backend (banners do painel do cliente). */

export interface MarketingBanner {
  id: string;
  barbershopId: string;
  name: string;
  imageUrl: string;
  createdAt: string;
}

export interface CreateMarketingBannerPayload {
  name: string;
  imageUrl: string;
}

export interface UpdateMarketingBannerPayload {
  name?: string;
  imageUrl?: string;
}
