/** Tipos espelhando o modelo `ClubBanner` do backend (banners do clube do assinante). */

export interface ClubBanner {
  id: string;
  barbershopId: string;
  fileName: string;
  imageUrl: string;
  createdAt: string;
}

export interface CreateClubBannerPayload {
  fileName: string;
  file: File;
}

export interface UpdateClubBannerPayload {
  fileName?: string;
  file?: File;
}
