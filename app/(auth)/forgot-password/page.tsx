"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  KeyRound,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

// --- Tipos ---
type Step = "email" | "success";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulação de chamada ao Backend
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsLoading(false);
    setStep("success");
  };

  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[400px] space-y-6">
        {/* Logo / Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center size-12 rounded-xl bg-[#f5b82e]/10 border border-[#f5b82e]/20 mb-2">
            <KeyRound className="size-6 text-[#f5b82e]" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Recuperar Senha
          </h1>
          <p className="text-sm text-[#8b949e]">
            {step === "email"
              ? "Enviaremos um link de recuperação para seu e-mail"
              : "Verifique sua caixa de entrada"}
          </p>
        </div>

        <Card className="bg-[#161b22] border-[#30363d] shadow-2xl overflow-hidden">
          <CardContent className="p-6">
            <AnimatePresence mode="wait">
              {step === "email" ? (
                <motion.form
                  key="step-email"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleSubmitEmail}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#f5b82e]">
                      E-mail Institucional
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#4d5562]" />
                      <input
                        required
                        type="email"
                        placeholder="exemplo@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-11 bg-[#0d1117] border border-[#30363d] rounded-md pl-10 pr-4 text-sm text-white placeholder:text-[#4d5562] focus:outline-none focus:border-[#f5b82e]/60 transition-all"
                      />
                    </div>
                  </div>

                  <button
                    disabled={isLoading}
                    type="submit"
                    className="w-full h-11 bg-[#f5b82e] hover:bg-[#d9a326] text-black font-bold text-sm rounded-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(245,184,46,0.2)]"
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
                  className="text-center py-4 space-y-4"
                >
                  <div className="flex justify-center">
                    <div className="size-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <CheckCircle2 className="size-8 text-emerald-400" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-white font-medium">
                      E-mail enviado com sucesso!
                    </p>
                    <p className="text-xs text-[#8b949e] leading-relaxed px-4">
                      Se o e-mail <strong>{email}</strong> estiver cadastrado,
                      você receberá um link temporário em instantes.
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => setStep("email")}
                      className="text-xs font-bold text-[#f5b82e] hover:underline flex items-center justify-center gap-2 mx-auto"
                    >
                      Não recebeu? Tentar novamente
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Footer Link */}
        <div className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#8b949e] hover:text-white transition-colors"
          >
            <ArrowLeft className="size-3" />
            Voltar para o login
          </Link>
        </div>
      </div>
    </div>
  );
}
