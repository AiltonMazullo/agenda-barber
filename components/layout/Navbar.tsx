"use client";

import { useState } from "react";
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
  ChevronDown,
  Flame,
  CalendarOff,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { cn } from "@/lib/utils";

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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";

interface NavSubItem {
  title: string;
  href: string;
  icon: typeof LayoutDashboard;
}

// `module` liga o item a uma permissão de grupo de acesso — sem nenhuma
// permissão daquele módulo (ou lista de módulos), o item não aparece no
// menu. Todo item deve declarar seu(s) módulo(s); não há mais item "livre".
interface NavItem {
  title: string;
  href: string;
  icon: typeof LayoutDashboard;
  module: string | string[];
  children?: NavSubItem[];
}

const navOperacional: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    module: "dashboard",
    children: [
      { title: "Horários de Pico", href: "/dashboard/horarios-de-pico", icon: Flame },
    ],
  },
  {
    title: "Agenda",
    href: "/schedule",
    icon: Calendar,
    module: "agendamento",
    children: [
      { title: "Horário de Feriados", href: "/schedule/feriados", icon: CalendarOff },
    ],
  },
  { title: "Clientes", href: "/clients", icon: Users, module: "cliente" },
  {
    title: "Profissionais",
    href: "/professionals",
    icon: UserCog,
    module: "usuario",
  },
  { title: "Comandas", href: "/orders", icon: ClipboardList, module: "comanda" },
  { title: "Caixa", href: "/cashier", icon: Wallet, module: "caixa" },
];

const navGestao: NavItem[] = [
  { title: "Assinaturas", href: "/subscriptions", icon: CreditCard, module: "cliente" },
  { title: "Comissões", href: "/commissions", icon: TrendingUp, module: "comissao" },
  { title: "Estoque", href: "/inventory", icon: Package, module: "produto" },
  {
    title: "Financeiro",
    href: "/financial",
    icon: DollarSign,
    module: ["categoria_financeira", "movimentacoes", "contas_bancarias", "formas_de_pagamentos"],
  },
  { title: "Relatórios", href: "/reports", icon: BarChart2, module: "relatorio" },
];

const navBottom: NavItem[] = [
  {
    title: "Configurações",
    href: "/settings",
    icon: Settings,
    module: ["empresa", "filial", "servico", "categoria", "gateways_de_pagamento"],
  },
  {
    title: "Controle de Acesso",
    href: "/access-control",
    icon: Shield,
    module: "grupo_de_permissoes",
  },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, isOwner } = useAuth();
  const { can } = usePermissions();
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  function toggleOpen(href: string) {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(href)) next.delete(href);
      else next.add(href);
      return next;
    });
  }

  // Esconde itens cujo(s) módulo(s) o usuário logado não pode ler.
  const visible = (items: NavItem[]) => items.filter((i) => can(i.module));

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
              {operacional.map((item) => {
                const hasChildren = !!item.children?.length;
                const isChildActive = item.children?.some(
                  (c) => pathname === c.href,
                );
                const isOpen = openItems.has(item.href) || isChildActive;

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={pathname === item.href}
                      tooltip={item.title}
                      className="h-8"
                    >
                      <item.icon className="size-4" />
                      <span className="font-medium flex-1">{item.title}</span>
                      {hasChildren && (
                        <ChevronDown
                          className={cn(
                            "size-3.5 shrink-0 text-muted-foreground transition-transform",
                            isOpen && "rotate-180",
                          )}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleOpen(item.href);
                          }}
                        />
                      )}
                    </SidebarMenuButton>
                    {hasChildren && isOpen && (
                      <SidebarMenuSub>
                        {item.children!.map((child) => (
                          <SidebarMenuSubItem key={child.href}>
                            <SidebarMenuSubButton
                              render={<Link href={child.href} />}
                              isActive={pathname === child.href}
                            >
                              <child.icon className="size-3.5" />
                              <span>{child.title}</span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    )}
                  </SidebarMenuItem>
                );
              })}
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
              {gestao.map((item) => {
                const hasChildren = !!item.children?.length;
                const isChildActive = item.children?.some(
                  (c) => pathname === c.href,
                );
                const isOpen = openItems.has(item.href) || isChildActive;

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={pathname === item.href}
                      tooltip={item.title}
                      className="h-8"
                    >
                      <item.icon className="size-4" />
                      <span className="font-medium flex-1">{item.title}</span>
                      {hasChildren && (
                        <ChevronDown
                          className={cn(
                            "size-3.5 shrink-0 text-muted-foreground transition-transform",
                            isOpen && "rotate-180",
                          )}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleOpen(item.href);
                          }}
                        />
                      )}
                    </SidebarMenuButton>
                    {hasChildren && isOpen && (
                      <SidebarMenuSub>
                        {item.children!.map((child) => (
                          <SidebarMenuSubItem key={child.href}>
                            <SidebarMenuSubButton
                              render={<Link href={child.href} />}
                              isActive={pathname === child.href}
                            >
                              <child.icon className="size-3.5" />
                              <span>{child.title}</span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-sidebar-border py-4">
        {/* MENU: Gap-1 no rodapé */}
        <SidebarMenu className="gap-1">
          {/* Assinatura da barbearia no Agendle — exclusiva do dono. */}
          {isOwner && (
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
          )}
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
