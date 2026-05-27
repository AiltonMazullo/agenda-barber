/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Building2, AlertCircle } from "lucide-react";
import { barbershopsService } from "@/services/barbershops.service";
import { BarbershopCard } from "@/components/client/BarbershopCard";
import { BarbershopCardSkeleton } from "@/components/client/BarbershopCardSkeleton";
import { Input } from "@/components/ui/input";
import type { Barbershop } from "@/types/barbershop.types";

const gridVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 320, damping: 26 },
  },
};

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
        <motion.section
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="text-center space-y-3 max-w-2xl mx-auto"
        >
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Encontre sua barbearia.
            <br />
            <span className="text-brand">Agende em segundos.</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Escolha uma barbearia, faça login ou crie sua conta e agende um
            atendimento com o profissional de sua preferência.
          </p>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" }}
          className="max-w-xl mx-auto relative"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Digite o nome da barbearia…"
            className="h-11 pl-10 bg-surface-raised border-border-subtle"
          />
        </motion.section>

        <section>
          <AnimatePresence mode="wait">
            {isLoading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {Array.from({ length: 6 }).map((_, i) => (
                  <BarbershopCardSkeleton key={i} />
                ))}
              </motion.div>
            )}

            {error && !isLoading && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="rounded-lg border border-danger/30 bg-danger/5 p-8 text-center space-y-2 max-w-md mx-auto"
              >
                <AlertCircle className="size-8 text-danger-foreground mx-auto" />
                <p className="text-sm text-foreground">{error}</p>
              </motion.div>
            )}

            {!isLoading && !error && filtered.length === 0 && (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="rounded-lg border border-border-subtle bg-surface-raised p-12 text-center max-w-md mx-auto space-y-3"
              >
                <Building2 className="size-8 text-text-faint mx-auto" />
                <p className="text-sm text-muted-foreground">
                  {query
                    ? "Nenhuma barbearia encontrada para essa busca."
                    : "Ainda não há barbearias cadastradas."}
                </p>
              </motion.div>
            )}

            {!isLoading && !error && filtered.length > 0 && (
              <motion.div
                key="grid"
                variants={gridVariants}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {filtered.map((b) => (
                  <motion.div
                    key={b.id}
                    variants={itemVariants}
                    whileHover={{ y: -3, transition: { duration: 0.15 } }}
                    layout
                  >
                    <BarbershopCard barbershop={b} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      <footer className="max-w-5xl mx-auto px-4 py-10 text-center text-[10px] text-text-faint uppercase tracking-widest">
        Powered by Agendle
      </footer>
    </div>
  );
}
