"use client";

import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Lock,
  Link as LinkIcon,
  Phone,
  MapPin,
  IdCard,
  Building2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthInput } from "@/components/auth/AuthInput";
import { cn } from "@/lib/utils";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { maskCnpj, maskCpf, maskPhone } from "@/utils/format";
import {
  registerSchema,
  type RegisterFormData,
} from "@/schemas/auth.schema";

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerBarbershop } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      slug: "",
      email: "",
      password: "",
      phone: "",
      address: "",
      personType: "FISICA",
      cpf: "",
      cnpj: "",
    },
  });

  const nameWatch = watch("name");
  const personTypeWatch = watch("personType");

  // Auto-slug enquanto o usuário não tocou no campo manualmente
  useEffect(() => {
    if (!slugTouched) {
      setValue("slug", toSlug(nameWatch ?? ""));
    }
  }, [nameWatch, slugTouched, setValue]);

  async function onSubmit(data: RegisterFormData) {
    setSubmitting(true);
    try {
      const base = {
        name: data.name.trim(),
        slug: data.slug,
        email: data.email.trim().toLowerCase(),
        password: data.password,
        phone: data.phone.trim(),
        address: data.address.trim(),
      };
      const payload =
        data.personType === "FISICA"
          ? ({ ...base, personType: "FISICA" as const, cpf: data.cpf })
          : ({ ...base, personType: "JURIDICA" as const, cnpj: data.cnpj });

      await registerBarbershop(payload);
      toast.success("Conta criada com sucesso!");
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error(err instanceof Error ? err.message : "Erro ao criar conta");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard
      title="Cadastrar sua barbearia"
      description="Comece a gerenciar seu negócio"
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        noValidate
      >
        <AuthInput
          id="name"
          label="Nome da barbearia"
          type="text"
          icon={<User className="size-4" />}
          placeholder="Ex.: Barbearia do João"
          autoComplete="organization"
          error={errors.name?.message}
          {...register("name")}
        />

        <AuthInput
          id="slug"
          label="Slug (URL)"
          type="text"
          icon={<LinkIcon className="size-4" />}
          placeholder="ex-barbearia-do-joao"
          autoComplete="off"
          error={errors.slug?.message}
          {...register("slug", {
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
              setSlugTouched(true);
              setValue("slug", toSlug(e.target.value));
            },
          })}
        />

        <AuthInput
          id="email"
          label="E-mail"
          type="email"
          icon={<Mail className="size-4" />}
          placeholder="contato@barbearia.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />

        <AuthInput
          id="password"
          label="Senha"
          type="password"
          icon={<Lock className="size-4" />}
          placeholder="Mínimo 6 caracteres"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register("password")}
        />

        <AuthInput
          id="phone"
          label="Telefone"
          type="text"
          icon={<Phone className="size-4" />}
          placeholder="(81) 99999-0000"
          autoComplete="tel"
          inputMode="numeric"
          maxLength={15}
          error={errors.phone?.message}
          {...register("phone", {
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
              setValue("phone", maskPhone(e.target.value));
            },
          })}
        />

        <AuthInput
          id="address"
          label="Endereço"
          type="text"
          icon={<MapPin className="size-4" />}
          placeholder="Rua, número, bairro, cidade"
          autoComplete="street-address"
          error={errors.address?.message}
          {...register("address")}
        />

        {/* Tipo de pessoa */}
        <div className="space-y-1.5">
          <span className="text-muted-foreground text-xs font-normal">
            Tipo de pessoa
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setValue("personType", "FISICA")}
              className={cn(
                "h-11 rounded-md border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors",
                personTypeWatch === "FISICA"
                  ? "bg-brand/15 border-brand/60 text-brand"
                  : "border-border bg-black text-muted-foreground hover:border-brand/30",
              )}
            >
              <User className="size-3.5" />
              Pessoa Física
            </button>
            <button
              type="button"
              onClick={() => setValue("personType", "JURIDICA")}
              className={cn(
                "h-11 rounded-md border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors",
                personTypeWatch === "JURIDICA"
                  ? "bg-brand/15 border-brand/60 text-brand"
                  : "border-border bg-black text-muted-foreground hover:border-brand/30",
              )}
            >
              <Building2 className="size-3.5" />
              Pessoa Jurídica
            </button>
          </div>
        </div>

        {personTypeWatch === "FISICA" ? (
          <AuthInput
            id="cpf"
            label="CPF"
            type="text"
            icon={<IdCard className="size-4" />}
            placeholder="000.000.000-00"
            autoComplete="off"
            inputMode="numeric"
            maxLength={14}
            error={errors.cpf?.message}
            {...register("cpf", {
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                setValue("cpf", maskCpf(e.target.value));
              },
            })}
          />
        ) : (
          <AuthInput
            id="cnpj"
            label="CNPJ"
            type="text"
            icon={<IdCard className="size-4" />}
            placeholder="00.000.000/0000-00"
            autoComplete="off"
            inputMode="numeric"
            maxLength={18}
            error={errors.cnpj?.message}
            {...register("cnpj", {
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                setValue("cnpj", maskCnpj(e.target.value));
              },
            })}
          />
        )}

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
