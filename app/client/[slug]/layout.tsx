import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PublicBarbershopProvider } from "@/contexts/PublicBarbershopContext";
import { ClientAuthProvider } from "@/contexts/ClientAuthContext";

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
 * inicial" cai no manifest/ícone genérico do produto em vez do da barbearia.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return { manifest: `/client/${slug}/manifest.webmanifest` };
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
