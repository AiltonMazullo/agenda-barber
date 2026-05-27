/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Building2, AlertCircle } from "lucide-react";
import { barbershopsService } from "@/services/barbershops.service";
import { BarbershopCard } from "@/components/client/BarbershopCard";
import { Input } from "@/components/ui/input";
import type { Barbershop } from "@/types/barbershop.types";

export default function HomePage() {
  const [barbershops, setBarbershops] = useState<Barbershop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    barbershopsService
      .list()
      .then((data) => {
        if (active) setBarbershops(data);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(
          err instanceof Error
            ? err.message
            : "Não foi possível carregar as barbearias.",
        );
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return barbershops;
    return barbershops.filter(
      (b) =>
        b.name.toLowerCase().includes(q) || b.slug.toLowerCase().includes(q),
    );
  }, [barbershops, query]);

  return (
    <div className="min-h-screen bg-surface-base text-foreground">
      <header className="border-b border-border-subtle bg-surface-raised/60 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Image
            src="/Logo-Agendle-05.png"
            alt="Agendle"
            width={110}
            height={32}
            className="object-contain"
            priority
          />
          <Link
            href="/login"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Sou dono de barbearia →
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10 space-y-10">
        <section className="text-center space-y-3 max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Encontre sua barbearia.
            <br />
            <span className="text-brand">Agende em segundos.</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Escolha uma barbearia abaixo, faça login (ou crie sua conta) e
            agende com o profissional de sua preferência.
          </p>
        </section>

        <section className="max-w-xl mx-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nome ou slug…"
            className="h-11 pl-10 bg-surface-raised border-border-subtle"
          />
        </section>

        <section>
          {isLoading && (
            <div className="text-center py-20 text-muted-foreground text-sm">
              Carregando barbearias…
            </div>
          )}

          {error && !isLoading && (
            <div className="rounded-lg border border-danger/30 bg-danger/5 p-8 text-center space-y-2 max-w-md mx-auto">
              <AlertCircle className="size-8 text-danger-foreground mx-auto" />
              <p className="text-sm text-foreground">{error}</p>
            </div>
          )}

          {!isLoading && !error && filtered.length === 0 && (
            <div className="rounded-lg border border-border-subtle bg-surface-raised p-12 text-center max-w-md mx-auto space-y-3">
              <Building2 className="size-8 text-text-faint mx-auto" />
              <p className="text-sm text-muted-foreground">
                {query
                  ? "Nenhuma barbearia encontrada para essa busca."
                  : "Ainda não há barbearias cadastradas."}
              </p>
            </div>
          )}

          {!isLoading && !error && filtered.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((b) => (
                <BarbershopCard key={b.id} barbershop={b} />
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="max-w-5xl mx-auto px-4 py-10 text-center text-[10px] text-text-faint uppercase tracking-widest">
        Powered by Agendle
      </footer>
    </div>
  );
}
