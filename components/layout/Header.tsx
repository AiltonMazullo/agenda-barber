"use client";

import { LogOut, Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";

function getInitials(name: string | undefined): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Header() {
  const router = useRouter();
  const { barbershop, logout } = useAuth();

  const name = barbershop?.name ?? "—";
  const initials = getInitials(barbershop?.name);

  async function handleLogout() {
    try {
      await logout();
      toast.success("Sessão encerrada.");
      router.push("/login");
    } catch {
      toast.error("Não foi possível encerrar a sessão.");
    }
  }

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border bg-background px-4 sticky top-0 z-10">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-4" />

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="text-foreground font-medium">{name}</span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="Notificações"
            className="cursor-pointer relative inline-flex size-8 items-center justify-center rounded-lg text-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 aria-expanded:bg-muted"
          >
            <Bell className="size-4" />
            <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-brand" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel>Notificações</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="flex flex-col items-center gap-1 px-3 py-6 text-center">
              <Bell className="size-5 text-muted-foreground/60" />
              <p className="text-xs font-medium text-foreground">
                Em breve
              </p>
              <p className="text-[11px] text-muted-foreground">
                As notificações estão em desenvolvimento e ficarão disponíveis
                em breve.
              </p>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          onClick={handleLogout}
          variant="ghost"
          size="icon"
          className="cursor-pointer relative size-8"
          aria-label="Sair"
        >
          <LogOut className="size-4" />
        </Button>

        <Avatar className="size-8">
          <AvatarFallback className="bg-[#3f340d] text-yellow-500 text-xs font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
