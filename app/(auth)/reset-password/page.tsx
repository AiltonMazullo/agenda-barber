"use client";

import { Suspense, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthInput } from "@/components/auth/AuthInput";
import { authService } from "@/services/auth.service";
import { clientAuthService } from "@/services/client-auth.service";
import { ApiError } from "@/lib/api";

type Step = "form" | "success" | "expired";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [step, setStep] = useState<Step>(token ? "form" : "expired");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit() {
    setPasswordError(null);

    if (password.length < 8) {
      setPasswordError("A senha deve ter no mínimo 8 caracteres");
      return;
    }
    if (password !== confirm) {
      setPasswordError("As senhas não coincidem");
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword(token, password);
      setStep("success");
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        try {
          await clientAuthService.resetPassword(token, password);
          setStep("success");
        } catch {
          setStep("expired");
        }
      } else if (err instanceof ApiError && err.status === 422) {
        const msg =
          err.fieldErrors?.password?.[0] ?? err.fieldErrors?.token?.[0];
        setPasswordError(msg ?? "Dados inválidos");
      } else {
        toast.error("Erro ao redefinir senha. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AnimatePresence mode="wait">
      {step === "form" && (
        <motion.form
          key="step-form"
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
            id="password"
            label="Nova senha"
            type="password"
            icon={<Lock className="size-4" />}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
          <AuthInput
            id="confirm"
            label="Confirmar nova senha"
            type="password"
            icon={<Lock className="size-4" />}
            placeholder="••••••••"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            error={passwordError ?? undefined}
            autoComplete="new-password"
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
                Redefinir senha
                <ArrowRight className="size-4" />
              </>
            )}
          </button>
        </motion.form>
      )}

      {step === "success" && (
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
              Senha alterada com sucesso!
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Você já pode entrar com sua nova senha.
            </p>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 h-11 bg-brand hover:bg-brand-hover text-brand-foreground font-bold text-sm rounded-md transition-all shadow-[0_0_15px_rgba(245,184,46,0.2)]"
          >
            Ir para o login
            <ArrowRight className="size-4" />
          </Link>
        </motion.div>
      )}

      {step === "expired" && (
        <motion.div
          key="step-expired"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-4 flex flex-col gap-4"
        >
          <div className="flex justify-center">
            <div className="size-14 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center">
              <XCircle className="size-8 text-destructive" />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm text-foreground font-medium">
              Link inválido ou expirado
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed px-4">
              Este link de recuperação é inválido ou já expirou. Solicite um
              novo link de recuperação.
            </p>
          </div>
          <Link
            href="/forgot-password"
            className="inline-flex items-center justify-center gap-2 h-11 bg-brand hover:bg-brand-hover text-brand-foreground font-bold text-sm rounded-md transition-all shadow-[0_0_15px_rgba(245,184,46,0.2)]"
          >
            Solicitar novo link
            <ArrowRight className="size-4" />
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthCard
      title="Redefinir senha"
      description="Escolha uma nova senha para sua conta"
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
      <Suspense
        fallback={
          <div className="flex justify-center py-8">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </AuthCard>
  );
}
