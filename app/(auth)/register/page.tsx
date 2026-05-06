"use client";

import { useState } from "react";
import { User, Mail, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthInput } from "@/components/auth/AuthInput";
import { useAuth } from "@/hooks/useAuth";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await register({ nome, email, password });
      toast.success("Conta criada com sucesso!");
      router.push("/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao criar conta");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard
      title="Criar sua conta"
      description="Comece a gerenciar seu negócio"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void handleSubmit();
        }}
        className="flex flex-col gap-4"
      >
        <AuthInput
          id="name"
          label="Nome Completo"
          type="text"
          icon={<User className="size-4" />}
          placeholder="Seu nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
          autoComplete="name"
        />

        <AuthInput
          id="email"
          label="E-mail"
          type="email"
          icon={<Mail className="size-4" />}
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />

        <AuthInput
          id="password"
          label="Senha"
          type="password"
          icon={<Lock className="size-4" />}
          placeholder="Mínimo 6 caracteres"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          autoComplete="new-password"
        />

        <Button
          type="submit"
          disabled={submitting}
          className="w-full bg-brand hover:bg-brand-hover text-brand-foreground font-bold h-11 text-sm rounded-md transition-all mt-2 cursor-pointer disabled:opacity-60"
        >
          {submitting ? "Criando..." : "Criar conta"}
        </Button>

        <p className="text-center text-xs text-muted-foreground mt-2">
          Já tem conta?{" "}
          <Link href="/login" className="text-brand hover:underline font-bold">
            Entrar
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
