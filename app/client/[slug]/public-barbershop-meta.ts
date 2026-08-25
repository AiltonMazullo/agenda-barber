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
      // `GET /barbershops/:slug` exige token (dono ou cliente logado) — ver
      // `barbershopsService.getBySlug` no front, que por isso cai pra
      // `GET /barbershops` (lista, pública, sem auth) quando dá 401/403/404.
      // Aqui, no servidor (metadata/manifest, sem sessão de navegador pra
      // reaproveitar), não tem token nenhum pra tentar — vai direto pra rota
      // pública, senão o nome/logo nunca resolviam (sempre caía no genérico
      // "Agendle" silenciosamente, mesmo com o logo cadastrado).
      const res = await fetch(
        `${apiUrl}/barbershops?q=${encodeURIComponent(slug)}`,
        {
          // Requisitado por manifest/metadata a cada carregamento de página —
          // cache curto evita bater na API toda hora sem travar a instalação
          // do PWA se ela estiver fora do ar.
          next: { revalidate: 300 },
        },
      );
      if (res.ok) {
        const list = (await res.json()) as {
          slug?: string;
          name?: string;
          logoUrl?: string | null;
        }[];
        const found = list.find((b) => b.slug === slug);
        if (found?.name) name = found.name;
        logoUrl = found?.logoUrl ?? null;
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
