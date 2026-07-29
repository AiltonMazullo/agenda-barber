/** Tipos espelhando o modelo `MarketingBanner` do backend (banners do painel do cliente). */

export interface MarketingBanner {
  id: string;
  barbershopId: string;
  name: string;
  linkUrl: string | null;
  imageUrl1: string | null;
  imageUrl2: string | null;
  imageUrl3: string | null;
  createdAt: string;
}

export interface CreateMarketingBannerPayload {
  name: string;
  linkUrl?: string;
  image1?: File;
  image2?: File;
  image3?: File;
}

export interface UpdateMarketingBannerPayload {
  name?: string;
  linkUrl?: string;
  image1?: File;
  image2?: File;
  image3?: File;
  removeImage1?: boolean;
  removeImage2?: boolean;
  removeImage3?: boolean;
}
