"use client";

import { motion } from "framer-motion";

export function BarbershopCardSkeleton() {
  return (
    <div className="rounded-xl border border-border-subtle bg-surface-raised p-5 flex flex-col gap-4 overflow-hidden relative">
      <motion.div
        className="absolute inset-0 bg-linear-to-r from-transparent via-white/[0.03] to-transparent"
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
      />

      <div className="flex items-center gap-3">
        <div className="size-12 rounded-lg bg-surface-base shrink-0" />
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="h-3 w-2/3 rounded bg-surface-base" />
          <div className="h-2 w-1/3 rounded bg-surface-base" />
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="h-2 w-3/4 rounded bg-surface-base" />
        <div className="h-2 w-1/2 rounded bg-surface-base" />
      </div>
    </div>
  );
}
