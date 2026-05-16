"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthInput } from "@/components/auth/AuthInput";

type Step = "email" | "success";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit() {
    setIsLoading(true);
    try {
      toast.info(
        "Recuperação de senha ainda não disponível. Entre em contato com o suporte.",
      );
      setStep("success");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthCard
      title="Recuperar senha"
      description={
        step === "email"
          ? "Enviaremos um link de recuperação para seu e-mail"
          : "Verifique sua caixa de entrada"
      }
      footer={
        <Link
          href="/login"
          className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3" />
          Voltar para o login
        </Link>
      }
    >
      <AnimatePresence mode="wait">
        {step === "email" ? (
          <motion.form
            key="step-email"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onSubmit={(e) => {
              e.preventDefault();
              void handleSubmit();
            }}
            className="flex flex-col gap-4"
          >
            <AuthInput
              id="email"
              label="E-mail"
              type="email"
              icon={<Mail className="size-4" />}
              placeholder="exemplo@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-brand hover:bg-brand-hover text-brand-foreground font-bold text-sm rounded-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(245,184,46,0.2)] cursor-pointer mt-2"
            >
              {isLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>
                  Enviar Link
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </motion.form>
        ) : (
          <motion.div
            key="step-success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-4 flex flex-col gap-4"
          >
            <div className="flex justify-center">
              <div className="size-14 rounded-full bg-success/10 border border-success/20 flex items-center justify-center">
                <CheckCircle2 className="size-8 text-success-foreground" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-sm text-foreground font-medium">
                E-mail enviado com sucesso!
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed px-4">
                Se o e-mail <strong>{email}</strong> estiver cadastrado, você
                receberá um link temporário em instantes.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setStep("email")}
              className="text-xs font-bold text-brand hover:underline mx-auto cursor-pointer"
            >
              Não recebeu? Tentar novamente
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthCard>
  );
}
