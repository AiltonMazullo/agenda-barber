import type { ReactNode } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { ClientNavbar } from "@/components/client/ClientNavbar";
import { ClientAccountTopbar } from "@/components/client/ClientAccountTopbar";

interface ClientAppLayoutProps {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}

/**
 * Shell da área do cliente: sidebar (navbar) + topbar (header) compartilhados
 * por todas as páginas do cliente — Início (vitrine), Agendar, Agendamentos,
 * Plano e Perfil. Login/Registro ficam fora deste grupo (sem o shell).
 */
export default async function ClientAppLayout({
  children,
  params,
}: ClientAppLayoutProps) {
  const { slug } = await params;
  return (
    <SidebarProvider defaultOpen={true}>
      <ClientNavbar slug={slug} />
      <SidebarInset>
        <ClientAccountTopbar slug={slug} />
        <div className="flex-1 w-full">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
