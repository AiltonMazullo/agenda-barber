/* eslint-disable @next/next/no-img-element */
"use client";

/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { barbershopAppearanceStore } from "@/lib/barbershop-appearance-store";
import type { Barbershop } from "@/types/barbershop.types";

interface BarbershopHeroProps {
  barbershop: Barbershop;
}

const AUTOPLAY_MS = 5000;

export function BarbershopHero({ barbershop }: BarbershopHeroProps) {
  const banners = (barbershop.bannerUrls ?? []).filter((u) => u && u.trim());
  const [index, setIndex] = useState(0);
  const [logoCentered, setLogoCentered] = useState(false);

  // Lido em effect (não no render) para evitar mismatch de hidratação.
  useEffect(() => {
    setLogoCentered(barbershopAppearanceStore.get(barbershop.id).logoCentered);
  }, [barbershop.id]);

  // Autoplay do carrossel (só quando há mais de 1 banner)
  useEffect(() => {
    if (banners.length <= 1) return;
    const iv = setInterval(
      () => setIndex((i) => (i + 1) % banners.length),
      AUTOPLAY_MS,
    );
    return () => clearInterval(iv);
  }, [banners.length]);

  const title = barbershop.title?.trim() || barbershop.name;
  const subtitle = barbershop.subtitle?.trim();
  const hasBanners = banners.length > 0;

  return (
    <section className="space-y-4">
      <div className="relative overflow-hidden rounded-2xl border border-border-subtle bg-surface-raised">
        {/* Carrossel / fundo */}
        <div className="relative h-44 sm:h-60 md:h-72 w-full bg-surface-elevated">
          {hasBanners ? (
            <AnimatePresence mode="wait">
              <motion.img
                key={index}
                src={banners[index]}
                alt={`${barbershop.name} ${index + 1}`}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="absolute inset-0 size-full object-cover"
              />
            </AnimatePresence>
          ) : (
            <div className="absolute inset-0 bg-linear-to-br from-brand/20 via-surface-elevated to-surface-base" />
          )}

          {/* Overlay para legibilidade */}
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />

          {/* Logo centralizada no topo (isolada, sem fundo) */}
          {logoCentered && barbershop.logoUrl?.trim() && (
            <img
              src={barbershop.logoUrl}
              alt={`Logo ${barbershop.name}`}
              className="absolute top-4 left-1/2 -translate-x-1/2 h-12 sm:h-16 w-auto object-contain drop-shadow-lg"
            />
          )}

          {/* Conteúdo sobreposto */}
          <div className="absolute inset-x-0 bottom-0 p-5 flex items-end gap-4">
            {!logoCentered && barbershop.logoUrl?.trim() && (
              <img
                src={barbershop.logoUrl}
                alt={`Logo ${barbershop.name}`}
                className="size-16 sm:size-20 rounded-xl object-cover border-2 border-white/20 shadow-lg shrink-0 bg-surface-base"
              />
            )}
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white drop-shadow">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-white/80 mt-1 drop-shadow">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Dots */}
          {banners.length > 1 && (
            <div className="absolute top-3 right-3 flex items-center gap-1.5">
              {banners.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Imagem ${i + 1}`}
                  className={`size-2 rounded-full transition-colors ${
                    i === index ? "bg-white" : "bg-white/40 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Slug + descrição */}
      <div className="space-y-2">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="size-2 rounded-full bg-brand" />
          <span className="font-mono">/{barbershop.slug}</span>
        </div>
        {barbershop.description?.trim() && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {barbershop.description}
          </p>
        )}
      </div>
    </section>
  );
}
