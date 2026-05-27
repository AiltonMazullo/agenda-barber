import type { ReactNode } from "react";
import { PublicBarbershopProvider } from "@/contexts/PublicBarbershopContext";

interface ClientSlugLayoutProps {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}

export default async function ClientSlugLayout({
  children,
  params,
}: ClientSlugLayoutProps) {
  const { slug } = await params;
  return (
    <PublicBarbershopProvider slug={slug}>{children}</PublicBarbershopProvider>
  );
}
