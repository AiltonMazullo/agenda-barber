"use client";

import { useState } from "react";
import { Scissors, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { redirect } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  const handleClick = () => {
    redirect("/dashboard");
  };

  return (
    // Background mais escuro e sólido
    <div className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center px-4 font-sans">
      {/* Logo - Ajustado para ser mais compacto */}
      <div className="flex flex-col items-center gap-3 mb-6">
        <div className="flex size-14 items-center justify-center rounded-xl bg-[#f5b82e]">
          <Scissors className="size-7 text-black" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Smart Man OS
          </h1>
          <p className="text-[#8b949e] text-xs font-medium">
            Sistema de Gestão para Barbearias
          </p>
        </div>
      </div>

      {/* Card */}
      <Card className="w-full max-w-[450px] bg-(--brand-card) border-(--border-card) border-1 shadow-xl">
        <CardHeader className="text-center pt-2 pb-1">
          <CardTitle className="text-lg font-semibold text-white">
            Entrar na sua conta
          </CardTitle>
          <CardDescription className="text-[#8b949e] text-sm text-[12px]">
            Acesse o painel administrativo
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4 px-8 pb-8">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="email"
              className="text-[#8b949e] text-xs font-normal"
            >
              E-mail
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#8b949e]" />
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                className="bg-black border-none border-[#30363d] shadow-xl text-[#1a1c24] h-11 pl-10 rounded-md focus-visible:ring-1 focus-visible:ring-amber-500 placeholder:text-gray-500"
              />
            </div>
          </div>

          {/* Senha */}
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="password"
              className="text-[#8b949e] text-xs font-normal"
            >
              Senha
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#8b949e]" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="bg-black border-none border-[#30363d] shadow-xl text-[#1a1c24] h-11 pl-10 pr-10 rounded-md focus-visible:ring-1 focus-visible:ring-amber-500 placeholder:text-gray-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>

            <div className="flex justify-end">
              --
              <Link
                href="/forgot-password"
                className="text-[12px] text-[#f5b82e] hover:underline font-medium cursor-pointer"
              >
                Esqueci minha senha
              </Link>
              -
            </div>
          </div>

          {/* Botão - Altura h-11 para não ficar bruto demais */}
          <Button
            className="w-full bg-[#f5b82e] hover:bg-[#d9a320] text-black font-bold h-11 text-sm rounded-md transition-all mt-2 cursor-pointer"
            onClick={handleClick}
          >
            Entrar
          </Button>

          {/* Cadastro */}
          <p className="text-center text-xs text-[#8b949e] mt-2">
            Ainda não tem conta?{" "}
            <Link
              href="/register"
              className="text-[#f5b82e] hover:underline font-bold cursor-pointer"
            >
              Cadastre sua empresa
            </Link>
          </p>
        </CardContent>
      </Card>

      {/* Footer */}
      <p className="mt-8 text-[10px] text-[#484f58] uppercase tracking-widest">
        Smart Man OS © 2026
      </p>
    </div>
  );
}
