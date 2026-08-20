"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Home,
  CalendarCheck,
  CreditCard,
  Ticket,
  User as UserIcon,
  LogOut,
  LogIn,
} from "lucide-react";
import { useClientAuth } from "@/hooks/useClientAuth";
import { usePublicBarbershop } from "@/contexts/PublicBarbershopContext";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

interface ClientNavbarProps {
  slug: string;
}

export function ClientNavbar({ slug }: ClientNavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, isAuthenticated } = useClientAuth();
  const { barbershop } = usePublicBarbershop();

  const base = `/client/${slug}`;
  const items = [
    { href: base, label: "Início", icon: Home },
    { href: `${base}/agendamentos`, label: "Agendamentos", icon: CalendarCheck },
    { href: `${base}/plano`, label: "Plano", icon: CreditCard },
    { href: `${base}/cupons`, label: "Cupons", icon: Ticket },
    { href: `${base}/perfil`, label: "Perfil", icon: UserIcon },
  ];

  function isActive(href: string): boolean {
    return href === base
      ? pathname === base
      : pathname === href || pathname.startsWith(`${href}/`);
  }

  async function handleLogout() {
    try {
      await logout();
      router.push(base);
    } catch {
      toast.error("Não foi possível sair. Tente novamente.");
    }
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border px-3 py-3">
        <div className="flex items-center justify-center gap-2">
          <div className="size-9 shrink-0 group-data-[collapsible=icon]:flex hidden items-center justify-center">
            <Image
              src="/Logo-Agendle-06.png"
              alt="Agendle"
              width={32}
              height={32}
              className="object-contain"
              priority
            />
          </div>
          <div className="group-data-[collapsible=icon]:hidden py-1">
            <Image
              src="/Logo-Agendle-05.png"
              alt="Agendle"
              width={112}
              height={30}
              className="object-contain"
              priority
            />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-wider font-bold text-[#8b949e]">
            {barbershop?.name ?? "Minha conta"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    render={<Link href={item.href} />}
                    isActive={isActive(item.href)}
                    tooltip={item.label}
                    className="h-9"
                  >
                    <item.icon className="size-4" />
                    <span className="font-medium">{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border py-4">
        <SidebarMenu className="gap-1">
          <SidebarMenuItem>
            {isAuthenticated ? (
              <SidebarMenuButton
                onClick={() => void handleLogout()}
                tooltip="Sair"
                className="h-10 text-danger-foreground hover:text-danger-foreground hover:bg-danger/10 cursor-pointer"
              >
                <LogOut className="size-4" />
                <span className="font-medium">Sair</span>
              </SidebarMenuButton>
            ) : (
              <SidebarMenuButton
                render={<Link href={`${base}/login`} />}
                tooltip="Entrar"
                className="h-10 text-brand hover:text-brand"
              >
                <LogIn className="size-4" />
                <span className="font-medium">Entrar</span>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
