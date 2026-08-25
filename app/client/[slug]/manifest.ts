import type { MetadataRoute } from "next";
import { getPublicBarbershopMeta } from "./public-barbershop-meta";

/**
 * Manifest do PWA por barbearia (spec-revisao-cliente-4.md §6.2) — antes o
 * app do cliente não tinha manifest nenhum (só um componente `SwCleanup`
 * cujo único papel é desregistrar service workers de uma versão anterior).
 * Ao instalar o app na tela inicial, mostra o logo e o nome da empresa em
 * vez de um ícone/nome genérico.
 *
 * Cobre Android/Chrome. iOS Safari ignora o Web App Manifest para ícone/nome
 * do atalho — isso é resolvido separadamente via tags `apple-touch-icon` /
 * `apple-mobile-web-app-title` em `layout.tsx` (`generateMetadata`).
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
  const { name, iconSrc } = await getPublicBarbershopMeta(slug);

  // Sem logo cadastrado, cai no favicon padrão do produto (não é ideal como
  // ícone de app — não é quadrado/alta-resolução — mas evita um manifest
  // sem ícone nenhum; a alternativa correta é o dono cadastrar um logo).
  const src = iconSrc ?? "/favicon.ico";

  return {
    name,
    short_name: name,
    description: `Agende seu horário em ${name}`,
    start_url: `/client/${slug}`,
    scope: `/client/${slug}`,
    display: "standalone",
    background_color: "#0b0d10",
    theme_color: "#f5b82e",
    icons: iconSrc
      ? [
          { src, sizes: "192x192", type: "image/png" },
          { src, sizes: "512x512", type: "image/png" },
        ]
      : [{ src, sizes: "any", type: "image/x-icon" }],
  };
}
