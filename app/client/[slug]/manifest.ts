import type { MetadataRoute } from "next";

/**
 * Manifest do PWA por barbearia (spec-revisao-cliente-4.md §6.2) — antes o
 * app do cliente não tinha manifest nenhum (só um componente `SwCleanup`
 * cujo único papel é desregistrar service workers de uma versão anterior).
 * Ao instalar o app na tela inicial, mostra o logo e o nome da empresa em
 * vez de um ícone/nome genérico.
 *
 * Roda no servidor, fora de qualquer Provider React — busca a barbearia
 * direto na API pública (mesma rota usada por `client-catalog.service.ts`).
 */
export default async function manifest({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<MetadataRoute.Manifest> {
  const { slug } = await params;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  let name = "Agendle";
  let logoUrl: string | null = null;

  if (apiUrl) {
    try {
      const res = await fetch(`${apiUrl}/barbershops/${slug}`, {
        // Manifest é gerado por request (não precisa cache agressivo) mas
        // não deve travar a instalação do PWA se a API estiver fora do ar.
        next: { revalidate: 300 },
      });
      if (res.ok) {
        const data = (await res.json()) as { name?: string; logoUrl?: string | null };
        if (data.name) name = data.name;
        logoUrl = data.logoUrl ?? null;
      }
    } catch {
      // best-effort — manifest genérico se a API não responder
    }
  }

  // Sem logo cadastrado, cai no favicon padrão do produto (não é ideal como
  // ícone de app — não é quadrado/alta-resolução — mas evita um manifest
  // sem ícone nenhum; a alternativa correta é o dono cadastrar um logo).
  const iconSrc = logoUrl
    ? logoUrl.startsWith("http")
      ? logoUrl
      : `${apiUrl ?? ""}${logoUrl}`
    : "/favicon.ico";

  return {
    name,
    short_name: name,
    description: `Agende seu horário em ${name}`,
    start_url: `/client/${slug}`,
    scope: `/client/${slug}`,
    display: "standalone",
    background_color: "#0b0d10",
    theme_color: "#f5b82e",
    icons: logoUrl
      ? [
          { src: iconSrc, sizes: "192x192", type: "image/png" },
          { src: iconSrc, sizes: "512x512", type: "image/png" },
        ]
      : [{ src: iconSrc, sizes: "any", type: "image/x-icon" }],
  };
}
