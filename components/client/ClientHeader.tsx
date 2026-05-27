"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarCheck, LogOut, User as UserIcon } from "lucide-react";
import { useClientAuth } from "@/hooks/useClientAuth";

interface ClientHeaderProps {
  slug: string;
  barbershopName?: string;
}

export function ClientHeader({ slug, barbershopName }: ClientHeaderProps) {
  const router = useRouter();
  const { client, isAuthenticated, logout } = useClientAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const initials = client
    ? client.name
        .split(/\s+/)
        .slice(0, 2)
        .map((p) => p[0])
        .join("")
        .toUpperCase()
    : "?";

  async function handleLogout() {
    setMenuOpen(false);
    await logout();
    router.push(`/client/${slug}`);
  }

  return (
    <header className="border-b border-border-subtle bg-surface-raised/60 backdrop-blur sticky top-0 z-20">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-3 min-w-0">
          <Image
            src="/Logo-Agendle-05.png"
            alt="Agendle"
            width={92}
            height={26}
            className="object-contain shrink-0"
            priority
          />
          {barbershopName && (
            <>
              <span className="text-text-faint">|</span>
              <span className="text-sm font-bold text-foreground truncate">
                {barbershopName}
              </span>
            </>
          )}
        </Link>

        {isAuthenticated && client ? (
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <div className="size-8 rounded-full bg-brand text-brand-foreground grid place-items-center text-xs font-bold">
                {initials}
              </div>
              <span className="text-xs text-foreground hidden sm:block max-w-[140px] truncate">
                {client.name}
              </span>
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-52 rounded-md border border-border-subtle bg-surface-raised shadow-xl z-20 overflow-hidden">
                  <Link
                    href={`/client/${slug}/me`}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 text-xs hover:bg-surface-base transition-colors"
                  >
                    <CalendarCheck className="size-3.5 text-brand" />
                    Meus agendamentos
                  </Link>
                  <Link
                    href={`/client/${slug}/agendar`}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 text-xs hover:bg-surface-base transition-colors"
                  >
                    <UserIcon className="size-3.5 text-brand" />
                    Novo agendamento
                  </Link>
                  <button
                    type="button"
                    onClick={() => void handleLogout()}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-xs hover:bg-surface-base text-danger-foreground transition-colors cursor-pointer border-t border-border-subtle"
                  >
                    <LogOut className="size-3.5" />
                    Sair
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <Link
            href={`/client/${slug}/login`}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Entrar →
          </Link>
        )}
      </div>
    </header>
  );
}
