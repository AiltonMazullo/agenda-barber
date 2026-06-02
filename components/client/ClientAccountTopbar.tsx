"use client";

import Link from "next/link";
import { LogIn } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useClientAuth } from "@/hooks/useClientAuth";
import { usePublicBarbershop } from "@/contexts/PublicBarbershopContext";

interface ClientAccountTopbarProps {
  slug: string;
}

function getInitials(name: string | undefined): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function ClientAccountTopbar({ slug }: ClientAccountTopbarProps) {
  const { client, isAuthenticated } = useClientAuth();
  const { barbershop } = usePublicBarbershop();

  const name = barbershop?.name ?? "Minha conta";
  const initials = getInitials(client?.name);

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border bg-background px-4 sticky top-0 z-10">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-4" />

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="text-foreground font-medium truncate max-w-50">
          {name}
        </span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {isAuthenticated && client ? (
          <>
            <span className="text-xs text-muted-foreground hidden sm:block max-w-40 truncate">
              {client.name}
            </span>
            <Avatar className="size-8">
              <AvatarFallback className="bg-[#3f340d] text-yellow-500 text-xs font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </>
        ) : (
          <Link
            href={`/client/${slug}/login`}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-brand text-brand-foreground text-xs font-bold hover:bg-brand-hover transition-colors"
          >
            <LogIn className="size-3.5" />
            Entrar
          </Link>
        )}
      </div>
    </header>
  );
}
