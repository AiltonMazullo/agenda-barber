"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Users,
  ClipboardList,
  Wallet,
  CreditCard,
  DollarSign,
  Package,
  BarChart2,
  Settings,
  Shield,
  LogOut,
  Scissors,
  TrendingUp,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

const navOperacional = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Agenda", href: "/schedule", icon: Calendar },
  { title: "Clientes", href: "/clients", icon: Users },
  { title: "Comandas", href: "/orders", icon: ClipboardList },
  { title: "Caixa", href: "/cashier", icon: Wallet },
];

const navGestao = [
  { title: "Assinaturas", href: "/subscriptions", icon: CreditCard },
  { title: "Comissões", href: "/commissions", icon: TrendingUp },
  { title: "Estoque", href: "/inventory", icon: Package },
  { title: "Financeiro", href: "/financial", icon: DollarSign },
  { title: "Relatórios", href: "/reports", icon: BarChart2 },
];

const navBottom = [
  { title: "Configurações", href: "/settings", icon: Settings },
  { title: "Controle de Acesso", href: "/access", icon: Shield },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" className="">
      {/* Logo / nome da barbearia */}
      <SidebarHeader className="border-b border-sidebar-border px-3 py-3 ">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-md bg-amber-500 text-black shrink-0">
            <Scissors className="size-4" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold text-white leading-tight">
              Barbearia do José
            </span>
            <span className="text-[11px] text-sidebar-foreground/50">
              barbearia-do-jose
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Operacional */}
        <SidebarGroup>
          <SidebarGroupLabel>Operacional</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navOperacional.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    render={<Link href={item.href} />}
                    isActive={pathname === item.href}
                    tooltip={item.title}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Gestão */}
        <SidebarGroup>
          <SidebarGroupLabel>Gestão</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navGestao.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    render={<Link href={item.href} />}
                    isActive={pathname === item.href}
                    tooltip={item.title}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer: Plano, Configurações, Sair */}
      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link href="/billing" />}
              tooltip="Plano"
            >
              <CreditCard />
              <span>Plano</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {navBottom.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                render={<Link href={item.href} />}
                isActive={pathname === item.href}
                tooltip={item.title}
              >
                <item.icon />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Sair"
              className="text-red-400 hover:text-red-300"
            >
              <LogOut />
              <span>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
