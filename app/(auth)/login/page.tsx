"use client";

import { Suspense, useState } from "react";
import { Mail, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthInput } from "@/components/auth/AuthInput";
import { useAuth } from "@/hooks/useAuth";
import { loginSchema, type LoginFormData } from "@/schemas/auth.schema";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(data: LoginFormData) {
    setSubmitting(true);
    try {
      await login(data);
      const from = searchParams.get("from");
      router.push(from && from.startsWith("/") ? from : "/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao entrar");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4"
      noValidate
    >
      <AuthInput
        id="email"
        label="E-mail"
        type="email"
        icon={<Mail className="size-4" />}
        placeholder="seu@email.com"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />

      <div className="flex flex-col gap-1">
        <AuthInput
          id="password"
          label="Senha"
          type="password"
          icon={<Lock className="size-4" />}
          placeholder="••••••••"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />
        <div className="flex justify-end mt-1">
          <Link
            href="/forgot-password"
            className="text-[12px] text-brand hover:underline font-medium"
          >
            Esqueci minha senha
          </Link>
        </div>
      </div>

      <Button
        type="submit"
        disabled={submitting}
        className="w-full bg-brand hover:bg-brand-hover text-brand-foreground font-bold h-11 text-sm rounded-md transition-all mt-2 cursor-pointer disabled:opacity-60"
      >
        {submitting ? "Entrando..." : "Entrar"}
      </Button>

      <p className="text-center text-xs text-muted-foreground mt-2">
        Ainda não tem conta?{" "}
        <Link href="/register" className="text-brand hover:underline font-bold">
          Cadastre sua empresa
        </Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <AuthCard
      title="Entrar na sua conta"
      description="Acesse o painel administrativo"
    >
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}
