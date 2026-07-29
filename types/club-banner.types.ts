/** Tipos espelhando o modelo `ClubBanner` do backend (banners do clube do assinante). */

export interface ClubBanner {
  id: string;
  barbershopId: string;
  fileName: string;
  linkUrl: string | null;
  imageUrl1: string | null;
  imageUrl2: string | null;
  imageUrl3: string | null;
  createdAt: string;
}

export interface CreateClubBannerPayload {
  fileName: string;
  linkUrl?: string;
  image1?: File;
  image2?: File;
  image3?: File;
}

export interface UpdateClubBannerPayload {
  fileName?: string;
  linkUrl?: string;
  image1?: File;
  image2?: File;
  image3?: File;
  removeImage1?: boolean;
  removeImage2?: boolean;
  removeImage3?: boolean;
}
