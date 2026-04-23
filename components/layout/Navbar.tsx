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
  { title: "Controle de Acesso", href: "/access-control", icon: Shield },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      {/* Logo / nome da barbearia */}
      <SidebarHeader className="border-b border-sidebar-border px-3 py-4">
        {" "}
        {/* Aumentei levemente o py para 4 */}
        <div className="flex items-center gap-3">
          {/* LOGO: Alterado para rounded-lg e tamanho ajustado */}
          <div className="flex size-9 items-center justify-center rounded-lg bg-[#f5b82e] text-black shrink-0 shadow-sm group-data-[collapsible=icon]:size-7 flex justify-items-center">
            <Scissors className="size-5" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-bold text-white leading-tight">
              Barbearia do José
            </span>
            <span className="text-[11px] text-[#8b949e]">
              barbearia-do-jose
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {" "}
        {/* Operacional */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-wider font-bold text-[#8b949e]">
            Operacional
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navOperacional.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    render={<Link href={item.href} />}
                    isActive={pathname === item.href}
                    tooltip={item.title}
                    className="h-8"
                  >
                    <item.icon className="size-4" />
                    <span className="font-medium">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {/* Gestão */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-wider font-bold text-[#8b949e]">
            Gestão
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {/* MENU: Adicionado gap-1 aqui também */}
            <SidebarMenu>
              {navGestao.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    render={<Link href={item.href} />}
                    isActive={pathname === item.href}
                    tooltip={item.title}
                    className="h-8"
                  >
                    <item.icon className="size-4" />
                    <span className="font-medium">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-sidebar-border py-4">
        {/* MENU: Gap-1 no rodapé */}
        <SidebarMenu className="gap-1">
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link href="/billing" />}
              tooltip="Plano"
              className="h-10 text-emerald-500 hover:text-emerald-400" // Cor de destaque para o plano
            >
              <CreditCard className="size-4" />
              <span className="font-medium">Plano</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {navBottom.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                render={<Link href={item.href} />}
                isActive={pathname === item.href}
                tooltip={item.title}
                className="h-10"
              >
                <item.icon className="size-4" />
                <span className="font-medium">{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          <SidebarMenuItem>
            <SidebarMenuButton
              // onClick={handleLogout}
              tooltip="Sair"
              className="h-10 text-red-400 hover:text-red-300 hover:bg-red-400/10"
            >
              <LogOut className="size-4" />
              <span className="font-medium">Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
