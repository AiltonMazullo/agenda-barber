/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { apiAssetUrl } from "@/lib/api";
import { marketingBannerService } from "@/services/marketing-banner.service";

interface MarketingBannerCarouselProps {
  barbershopId: string;
  /** Exibido enquanto carrega ou quando não há banners de marketing cadastrados. */
  fallback?: ReactNode;
}

interface HeroBanner {
  imageUrl: string;
  linkUrl: string | null;
}

const AUTOPLAY_MS = 5000;

/**
 * Banners cadastrados em Marketing > Banners Painel Cliente — exibidos
 * apenas na tela de início do painel do cliente, quando autenticado
 * (ver [page.tsx](../../app/client/[slug]/(app)/page.tsx)).
 */
export function MarketingBannerCarousel({
  barbershopId,
  fallback = null,
}: MarketingBannerCarouselProps) {
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let active = true;
    marketingBannerService
      .listPublic(barbershopId)
      .then((list) => {
        if (!active) return;
        const mapped = list
          .map((b) => {
            const url = b.imageUrl3 ?? b.imageUrl2 ?? b.imageUrl1;
            return url ? { imageUrl: apiAssetUrl(url) ?? url, linkUrl: b.linkUrl } : null;
          })
          .filter((b): b is HeroBanner => !!b);
        setBanners(mapped);
      })
      .catch(() => {
        if (active) setBanners([]);
      });
    return () => {
      active = false;
    };
  }, [barbershopId]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const iv = setInterval(() => setIndex((i) => (i + 1) % banners.length), AUTOPLAY_MS);
    return () => clearInterval(iv);
  }, [banners.length]);

  if (banners.length === 0) return <>{fallback}</>;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border-subtle bg-surface-raised">
      <div className="relative h-44 sm:h-60 md:h-72 w-full bg-surface-elevated">
        <AnimatePresence mode="wait">
          {banners[index].linkUrl ? (
            <motion.a
              key={index}
              href={banners[index].linkUrl!}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="absolute inset-0 size-full block"
            >
              <img
                src={banners[index].imageUrl}
                alt={`Banner ${index + 1}`}
                className="size-full object-cover"
              />
            </motion.a>
          ) : (
            <motion.img
              key={index}
              src={banners[index].imageUrl}
              alt={`Banner ${index + 1}`}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="absolute inset-0 size-full object-cover"
            />
          )}
        </AnimatePresence>

        {banners.length > 1 && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5">
            {banners.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Banner ${i + 1}`}
                className={`size-2 rounded-full transition-colors ${
                  i === index ? "bg-white" : "bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
