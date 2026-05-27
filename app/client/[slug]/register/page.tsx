"use client";

import { use } from "react";
import { Mail, Lock, User, Phone } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthInput } from "@/components/auth/AuthInput";
import {
  clientRegisterSchema,
  type ClientRegisterFormValues,
} from "@/schemas/client-auth.schema";
import { useClientAuth } from "@/hooks/useClientAuth";
import { usePublicBarbershop } from "@/contexts/PublicBarbershopContext";
import { maskPhone } from "@/utils/format";

interface PageProps {
  params: Promise<{ slug: string }>;
}

function ClientRegisterForm({ slug }: { slug: string }) {
  const router = useRouter();
  const { register: registerClient } = useClientAuth();
  const { barbershop, isLoading: loadingBarbershop } = usePublicBarbershop();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ClientRegisterFormValues>({
    resolver: zodResolver(clientRegisterSchema),
    defaultValues: { name: "", email: "", password: "", phone: "" },
  });

  async function onSubmit(values: ClientRegisterFormValues) {
    if (!barbershop) {
      toast.error("Aguarde — ainda carregando a barbearia.");
      return;
    }
    try {
      await registerClient({
        name: values.name,
        email: values.email,
        password: values.password,
        phone: values.phone || undefined,
        barbershopId: barbershop.id,
      });
      toast.success("Conta criada! Vamos agendar.");
      router.push(`/client/${slug}/agendar`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao criar conta");
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4"
      noValidate
    >
      <AuthInput
        id="name"
        label="Nome completo"
        icon={<User className="size-4" />}
        placeholder="Seu nome"
        autoComplete="name"
        error={errors.name?.message}
        {...register("name")}
      />

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

      <Controller
        control={control}
        name="phone"
        render={({ field }) => (
          <AuthInput
            id="phone"
            label="Telefone"
            type="tel"
            icon={<Phone className="size-4" />}
            placeholder="(11) 99999-0000"
            autoComplete="tel"
            error={errors.phone?.message}
            value={field.value ?? ""}
            onChange={(e) => field.onChange(maskPhone(e.target.value))}
            onBlur={field.onBlur}
            ref={field.ref}
          />
        )}
      />

      <AuthInput
        id="password"
        label="Senha"
        type="password"
        icon={<Lock className="size-4" />}
        placeholder="••••••••"
        autoComplete="new-password"
        error={errors.password?.message}
        {...register("password")}
      />

      <Button
        type="submit"
        disabled={isSubmitting || loadingBarbershop}
        className="w-full bg-brand hover:bg-brand-hover text-brand-foreground font-bold h-11 text-sm rounded-md transition-all mt-2 cursor-pointer disabled:opacity-60"
      >
        {isSubmitting ? "Criando conta..." : "Criar conta"}
      </Button>

      <p className="text-center text-xs text-muted-foreground mt-2">
        Já tem conta?{" "}
        <Link
          href={`/client/${slug}/login`}
          className="text-brand hover:underline font-bold"
        >
          Fazer login
        </Link>
      </p>
      <p className="text-center text-[11px] text-text-faint">
        <Link href={`/client/${slug}`} className="hover:underline">
          ← Voltar à barbearia
        </Link>
      </p>
    </form>
  );
}

export default function ClientRegisterPage({ params }: PageProps) {
  const { slug } = use(params);
  return (
    <AuthCard
      title="Criar conta de cliente"
      description="Cadastre-se para agendar"
    >
      <ClientRegisterForm slug={slug} />
    </AuthCard>
  );
}
