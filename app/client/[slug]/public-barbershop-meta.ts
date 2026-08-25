/**
 * Nome/logo da barbearia para metadata do PWA (manifest + tags Apple),
 * buscados direto na API pública — mesma rota usada por
 * `client-catalog.service.ts`. Compartilhado entre `manifest.ts` e
 * `layout.tsx` (`generateMetadata`) pra não duplicar o fetch/fallback.
 */
export interface PublicBarbershopMeta {
  name: string;
  /** URL absoluta do logo, pronta pra usar em <link>/manifest icons. Null quando não há logo cadastrado. */
  iconSrc: string | null;
}

const FALLBACK_NAME = "Agendle";

export async function getPublicBarbershopMeta(slug: string): Promise<PublicBarbershopMeta> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  let name = FALLBACK_NAME;
  let logoUrl: string | null = null;

  if (apiUrl) {
    try {
      const res = await fetch(`${apiUrl}/barbershops/${slug}`, {
        // Requisitado por manifest/metadata a cada carregamento de página —
        // cache curto evita bater na API toda hora sem travar a instalação
        // do PWA se ela estiver fora do ar.
        next: { revalidate: 300 },
      });
      if (res.ok) {
        const data = (await res.json()) as { name?: string; logoUrl?: string | null };
        if (data.name) name = data.name;
        logoUrl = data.logoUrl ?? null;
      }
    } catch {
      // best-effort — metadata genérica se a API não responder
    }
  }

  const iconSrc = logoUrl
    ? logoUrl.startsWith("http")
      ? logoUrl
      : `${apiUrl ?? ""}${logoUrl}`
    : null;

  return { name, iconSrc };
}
