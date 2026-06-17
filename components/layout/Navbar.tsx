"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Calendar,
  Users,
  UserCog,
  ClipboardList,
  Wallet,
  CreditCard,
  DollarSign,
  Package,
  BarChart2,
  Settings,
  Shield,
  LogOut,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";

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

// `module` (opcional) liga o item a uma permissão de grupo de acesso.
// Itens sem `module` ficam sempre visíveis.
interface NavItem {
  title: string;
  href: string;
  icon: typeof LayoutDashboard;
  module?: string;
}

const navOperacional: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  {
    title: "Agenda",
    href: "/schedule",
    icon: Calendar,
    module: "appointments",
  },
  { title: "Clientes", href: "/clients", icon: Users, module: "clients" },
  {
    title: "Profissionais",
    href: "/professionals",
    icon: UserCog,
    module: "employees",
  },
  { title: "Comandas", href: "/orders", icon: ClipboardList },
  { title: "Caixa", href: "/cashier", icon: Wallet, module: "cash-registers" },
];

const navGestao: NavItem[] = [
  { title: "Planos", href: "/subscriptions", icon: CreditCard },
  { title: "Comissões", href: "/commissions", icon: TrendingUp },
  { title: "Estoque", href: "/inventory", icon: Package, module: "products" },
  { title: "Financeiro", href: "/financial", icon: DollarSign },
  { title: "Relatórios", href: "/reports", icon: BarChart2 },
];

const navBottom: NavItem[] = [
  { title: "Configurações", href: "/settings", icon: Settings },
  {
    title: "Controle de Acesso",
    href: "/access-control",
    icon: Shield,
    module: "access-groups",
  },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const { can } = usePermissions();

  // Esconde itens cujo módulo o usuário logado não pode ler.
  const visible = (items: NavItem[]) =>
    items.filter((i) => !i.module || can(i.module, "read"));

  const operacional = visible(navOperacional);
  const gestao = visible(navGestao);
  const bottom = visible(navBottom);

  async function handleLogout() {
    try {
      await logout();
      router.push("/login");
    } catch {
      toast.error("Não foi possível sair. Tente novamente.");
    }
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border px-3 py-3">
        <div className="flex items-center justify-center group-data-[collapsible=icon]:justify-center gap-2">
          {/* Collapsed: icon mark centered */}
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
          {/* Expanded: full white horizontal logo */}
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
        {" "}
        {/* Operacional */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-wider font-bold text-[#8b949e]">
            Operacional
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {operacional.map((item) => (
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
              {gestao.map((item) => (
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
          {bottom.map((item) => (
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
              onClick={handleLogout}
              tooltip="Sair"
              className="h-10 text-danger-foreground hover:text-danger-foreground hover:bg-danger/10 cursor-pointer"
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
