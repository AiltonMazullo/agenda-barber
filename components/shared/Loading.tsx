"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LoadingProps {
  /** Texto exibido abaixo do spinner. */
  label?: string;
  /** Tamanho do spinner (px). */
  size?: number;
  className?: string;
}

/** Indicador de carregamento animado (framer-motion) com legenda abaixo. */
export function Loading({
  label = "Carregando",
  size = 32,
  className,
}: LoadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-10",
        className,
      )}
    >
      <motion.span
        className="block rounded-full border-2 border-border border-t-brand"
        style={{ width: size, height: size }}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, ease: "linear", duration: 0.8 }}
      />
      <motion.p
        className="text-xs font-medium text-muted-foreground"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, ease: "easeInOut", duration: 1.4 }}
      >
        {label}
      </motion.p>
    </div>
  );
}
