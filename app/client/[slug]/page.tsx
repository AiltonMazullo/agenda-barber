/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Scissors,
  Clock,
  AlertCircle,
} from "lucide-react";
import { barbershopsService } from "@/services/barbershops.service";
import { servicesService } from "@/services/services.service";
import { ApiError } from "@/lib/api";
import type { Barbershop } from "@/types/barbershop.types";
import type { Service } from "@/types/service.types";

function formatBRLFromCents(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function BarbershopPublicPage({ params }: PageProps) {
  const { slug } = use(params);

  const [barbershop, setBarbershop] = useState<Barbershop | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(false);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(null);
    setNeedsAuth(false);

    barbershopsService
      .getBySlug(slug)
      .then(async (b) => {
        if (!active) return;
        setBarbershop(b);
        // Tenta carregar serviços (rota pública)
        try {
          const list = await servicesService.list(b.id);
          if (active) setServices(list);
        } catch {
          // Falha silenciosa em serviços não impede mostrar o perfil
        }
      })
      .catch((err: unknown) => {
        if (!active) return;
        if (err instanceof ApiError && err.status === 401) {
          setNeedsAuth(true);
        } else if (err instanceof ApiError && err.status === 404) {
          setError("Barbearia não encontrada.");
        } else {
          setError(
            err instanceof Error
              ? err.message
              : "Não foi possível carregar a barbearia.",
          );
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [slug]);

  return (
    <div className="min-h-screen bg-surface-base text-foreground">
      {/* Top bar */}
      <header className="border-b border-border-subtle bg-surface-raised">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Image
            src="/Logo-Agendle-05.png"
            alt="Agendle"
            width={96}
            height={28}
            className="object-contain"
            priority
          />
          <Link
            href="/login"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Entrar →
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {isLoading && (
          <div className="text-center py-20 text-muted-foreground text-sm">
            Carregando…
          </div>
        )}

        {needsAuth && !isLoading && (
          <div className="rounded-lg border border-warning/30 bg-warning/5 p-8 text-center space-y-3">
            <AlertCircle className="size-8 text-warning-foreground mx-auto" />
            <p className="text-sm text-foreground">
              Esta página exige autenticação para visualização.
            </p>
            <Link
              href="/login"
              className="inline-flex h-9 px-5 rounded-md bg-brand text-brand-foreground text-sm font-bold hover:bg-brand-hover transition-colors items-center"
            >
              Fazer login
            </Link>
          </div>
        )}

        {error && !isLoading && !needsAuth && (
          <div className="rounded-lg border border-danger/30 bg-danger/5 p-8 text-center space-y-2">
            <AlertCircle className="size-8 text-danger-foreground mx-auto" />
            <p className="text-sm text-foreground">{error}</p>
          </div>
        )}

        {barbershop && !isLoading && (
          <>
            {/* Header da barbearia */}
            <section className="space-y-3">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="size-2 rounded-full bg-brand" />
                <span className="font-mono">/{barbershop.slug}</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                {barbershop.name}
              </h1>
            </section>

            {/* Contato */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-lg bg-surface-raised border border-border-subtle p-4 flex items-start gap-3">
                <Mail className="size-4 text-brand shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    E-mail
                  </p>
                  <p className="text-sm text-foreground truncate">
                    {barbershop.email}
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-surface-raised border border-border-subtle p-4 flex items-start gap-3">
                <Phone className="size-4 text-brand shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Telefone
                  </p>
                  <p className="text-sm text-foreground">
                    {barbershop.phone ?? "—"}
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-surface-raised border border-border-subtle p-4 flex items-start gap-3">
                <MapPin className="size-4 text-brand shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Endereço
                  </p>
                  <p className="text-sm text-foreground">
                    {barbershop.address ?? "—"}
                  </p>
                </div>
              </div>
            </section>

            {/* Serviços */}
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Scissors className="size-4 text-brand" />
                <h2 className="text-sm font-bold uppercase tracking-widest">
                  Serviços oferecidos
                </h2>
              </div>

              {services.length === 0 ? (
                <div className="rounded-lg border border-border-subtle bg-surface-raised p-8 text-center text-sm text-muted-foreground">
                  Esta barbearia ainda não cadastrou serviços.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {services.map((s) => (
                    <div
                      key={s.id}
                      className="rounded-lg border border-border-subtle bg-surface-raised p-4 hover:border-brand/40 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="size-3 rounded-full mt-1.5 shrink-0"
                          style={{ backgroundColor: s.hex ?? "#f5b82e" }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="text-base font-bold text-foreground">
                              {s.name}
                            </h3>
                            <span className="text-base font-bold text-brand whitespace-nowrap">
                              {formatBRLFromCents(s.priceInCents)}
                            </span>
                          </div>
                          {s.description && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {s.description}
                            </p>
                          )}
                          <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                            <Clock className="size-3" />
                            <span>{s.durationMin} minutos</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* CTA agendamento (placeholder até o backend desbloquear /clients) */}
            <section className="rounded-lg border border-border-subtle bg-surface-raised p-6 flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <Building2 className="size-5 text-brand shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-foreground">
                    Quer agendar?
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Entre em contato pelo telefone ou e-mail acima. O
                    agendamento online estará disponível em breve.
                  </p>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      <footer className="max-w-4xl mx-auto px-4 py-8 text-center text-[10px] text-text-faint uppercase tracking-widest">
        Powered by Agendle
      </footer>
    </div>
  );
}
