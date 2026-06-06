"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Compass, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const SEGUNDOS_REDIRECT = 4;

export default function NotFound() {
  const router = useRouter();
  const [restante, setRestante] = useState(SEGUNDOS_REDIRECT);

  /** Volta para a página anterior; sem histórico, vai para o início. */
  const voltar = useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }, [router]);

  useEffect(() => {
    if (restante <= 0) {
      voltar();
      return;
    }
    const t = setTimeout(() => setRestante((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [restante, voltar]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-full max-w-md space-y-5 rounded-2xl border border-border-subtle bg-surface-raised p-8 text-center md:p-10"
      >
        <motion.div
          animate={{ rotate: [-8, 8, -8] }}
          transition={{ repeat: Infinity, ease: "easeInOut", duration: 3 }}
          className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-brand/30 bg-brand/15 text-brand"
        >
          <Compass className="size-6" />
        </motion.div>

        <div className="space-y-2">
          <p className="text-5xl font-black tracking-tight text-brand">404</p>
          <h2 className="text-xl font-bold text-foreground">
            Página não encontrada
          </h2>
          <p className="mx-auto max-w-sm text-sm leading-relaxed text-muted-foreground">
            A página que você tentou acessar não existe ou foi movida. Levando
            você de volta à página anterior em{" "}
            <span className="font-bold text-foreground">{restante}s</span>…
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 pt-1">
          <Button onClick={voltar}>
            <ArrowLeft className="size-4" />
            Voltar agora
          </Button>
          <Button variant="outline" onClick={() => router.push("/")}>
            <Home className="size-4" />
            Início
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
