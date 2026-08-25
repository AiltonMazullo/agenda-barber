import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PublicBarbershopProvider } from "@/contexts/PublicBarbershopContext";
import { ClientAuthProvider } from "@/contexts/ClientAuthContext";
import { getPublicBarbershopMeta } from "./public-barbershop-meta";

interface ClientSlugLayoutProps {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}

/**
 * `manifest.ts` deste segmento (`app/client/[slug]/manifest.ts`) já gera o
 * Web Manifest com o nome/logo certos da barbearia — mas a convenção de
 * arquivo do Next só injeta a tag `<link rel="manifest">` automaticamente
 * quando `manifest.ts` está na raiz de `app/`. Em rota dinâmica como esta,
 * precisa ser declarado explicitamente aqui; sem isso, "Adicionar à tela
 * inicial" cai no manifest/ícone genérico do produto em vez do da barbearia
 * (cobre Android/Chrome).
 *
 * iOS Safari, por sua vez, ignora o Web App Manifest para ícone/nome do
 * atalho — usa as tags `apple-touch-icon` e `apple-mobile-web-app-title`
 * (`icons.apple` / `appleWebApp` do Metadata API do Next), setadas aqui
 * também. Sem elas, "Adicionar à Tela de Início" no iPhone mostra o ícone
 * genérico do app mesmo com o manifest correto.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { name, iconSrc } = await getPublicBarbershopMeta(slug);
  return {
    title: name,
    manifest: `/client/${slug}/manifest.webmanifest`,
    appleWebApp: {
      capable: true,
      title: name,
      statusBarStyle: "black-translucent",
    },
    icons: iconSrc ? { apple: iconSrc } : undefined,
  };
}

export default async function ClientSlugLayout({
  children,
  params,
}: ClientSlugLayoutProps) {
  const { slug } = await params;
  return (
    <PublicBarbershopProvider slug={slug}>
      <ClientAuthProvider>{children}</ClientAuthProvider>
    </PublicBarbershopProvider>
  );
}
