"use client";

import { Suspense, use } from "react";
import { Mail, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthInput } from "@/components/auth/AuthInput";
import {
  clientLoginSchema,
  type ClientLoginFormValues,
} from "@/schemas/client-auth.schema";
import { useClientAuth } from "@/hooks/useClientAuth";
import { usePublicBarbershop } from "@/contexts/PublicBarbershopContext";

interface PageProps {
  params: Promise<{ slug: string }>;
}

function ClientLoginForm({ slug }: { slug: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useClientAuth();
  const { barbershop, isLoading: loadingBarbershop } = usePublicBarbershop();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ClientLoginFormValues>({
    resolver: zodResolver(clientLoginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: ClientLoginFormValues) {
    if (!barbershop) {
      toast.error("Aguarde — ainda carregando a barbearia.");
      return;
    }
    try {
      await login({ ...values, barbershopId: barbershop.id });
      const from = searchParams.get("from");
      router.push(
        from && from.startsWith("/") ? from : `/client/${slug}/agendar`,
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao entrar");
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

      <Button
        type="submit"
        disabled={isSubmitting || loadingBarbershop}
        className="w-full bg-brand hover:bg-brand-hover text-brand-foreground font-bold h-11 text-sm rounded-md transition-all mt-2 cursor-pointer disabled:opacity-60"
      >
        {isSubmitting ? "Entrando..." : "Entrar"}
      </Button>

      <div className="flex justify-end -mt-1">
        <Link
          href={`/client/${slug}/forgot-password`}
          className="text-[12px] text-brand hover:underline font-medium"
        >
          Esqueci minha senha
        </Link>
      </div>

      <p className="text-center text-xs text-muted-foreground mt-2">
        Ainda não tem conta?{" "}
        <Link
          href={`/client/${slug}/register`}
          className="text-brand hover:underline font-bold"
        >
          Criar conta
        </Link>
      </p>
      <div className="flex items-center justify-center gap-4 text-[11px] text-text-faint">
        <Link href={`/client/${slug}`} className="hover:text-foreground hover:underline">
          ← Voltar à barbearia
        </Link>
        <span className="text-border">|</span>
        <Link href="/login" className="hover:text-foreground hover:underline">
          Sou dono de barbearia →
        </Link>
      </div>
    </form>
  );
}

export default function ClientLoginPage({ params }: PageProps) {
  const { slug } = use(params);
  return (
    <AuthCard
      title="Entrar como cliente"
      description="Acesse sua conta para agendar"
    >
      <Suspense>
        <ClientLoginForm slug={slug} />
      </Suspense>
    </AuthCard>
  );
}
