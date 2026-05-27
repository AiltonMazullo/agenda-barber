"use client";

import { useMemo, useState } from "react";
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
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthInput } from "@/components/auth/AuthInput";
import { cn } from "@/lib/utils";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { maskCnpj, maskCpf, maskPhone } from "@/utils/format";
import type {
  CreateBarbershopFisicaPayload,
  CreateBarbershopJuridicaPayload,
  PersonType,
} from "@/types/barbershop.types";

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

const SLUG_REGEX = /^[a-z0-9-]+$/;
const PHONE_REGEX = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;

interface FormState {
  name: string;
  slug: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  personType: PersonType;
  cpf: string;
  cnpj: string;
}

const INITIAL: FormState = {
  name: "",
  slug: "",
  email: "",
  password: "",
  phone: "",
  address: "",
  personType: "FISICA",
  cpf: "",
  cnpj: "",
};

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [form, setForm] = useState<FormState>(INITIAL);
  const [slugTouched, setSlugTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const autoSlug = useMemo(() => toSlug(form.name), [form.name]);
  const effectiveSlug = slugTouched ? form.slug : autoSlug;

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  function validate(): string | null {
    if (form.name.trim().length < 2)
      return "Informe o nome da barbearia (mínimo 2 caracteres).";
    if (!SLUG_REGEX.test(effectiveSlug))
      return "Slug inválido. Use apenas letras minúsculas, números e hífens.";
    if (effectiveSlug.length < 2) return "Slug muito curto.";
    if (form.password.length < 6) return "A senha deve ter ao menos 6 caracteres.";
    if (!PHONE_REGEX.test(form.phone))
      return "Telefone inválido. Formato esperado: (81) 99999-0000.";
    if (form.address.trim().length === 0) return "Informe o endereço.";
    if (form.personType === "FISICA" && form.cpf.replace(/\D/g, "").length !== 11)
      return "CPF inválido.";
    if (form.personType === "JURIDICA" && form.cnpj.replace(/\D/g, "").length !== 14)
      return "CNPJ inválido.";
    return null;
  }

  async function handleSubmit() {
    const errorMsg = validate();
    if (errorMsg) {
      toast.error(errorMsg);
      return;
    }
    setSubmitting(true);
    try {
      const base = {
        name: form.name.trim(),
        slug: effectiveSlug,
        email: form.email.trim().toLowerCase(),
        password: form.password,
        phone: form.phone.trim(),
        address: form.address.trim(),
      };
      const payload =
        form.personType === "FISICA"
          ? ({ ...base, personType: "FISICA", cpf: form.cpf } satisfies CreateBarbershopFisicaPayload)
          : ({ ...base, personType: "JURIDICA", cnpj: form.cnpj } satisfies CreateBarbershopJuridicaPayload);

      await register(payload);
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
        onSubmit={(e) => {
          e.preventDefault();
          void handleSubmit();
        }}
        className="flex flex-col gap-4"
      >
        <AuthInput
          id="name"
          label="Nome da barbearia"
          type="text"
          icon={<User className="size-4" />}
          placeholder="Ex.: Barbearia do João"
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          required
          autoComplete="organization"
        />

        <AuthInput
          id="slug"
          label="Slug (URL)"
          type="text"
          icon={<LinkIcon className="size-4" />}
          placeholder="ex-barbearia-do-joao"
          value={effectiveSlug}
          onChange={(e) => {
            setSlugTouched(true);
            update("slug", toSlug(e.target.value));
          }}
          required
        />

        <AuthInput
          id="email"
          label="E-mail"
          type="email"
          icon={<Mail className="size-4" />}
          placeholder="contato@barbearia.com"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          required
          autoComplete="email"
        />

        <AuthInput
          id="password"
          label="Senha"
          type="password"
          icon={<Lock className="size-4" />}
          placeholder="Mínimo 6 caracteres"
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
          required
          minLength={6}
          autoComplete="new-password"
        />

        <AuthInput
          id="phone"
          label="Telefone"
          type="text"
          icon={<Phone className="size-4" />}
          placeholder="(81) 99999-0000"
          value={form.phone}
          onChange={(e) => update("phone", maskPhone(e.target.value))}
          required
          autoComplete="tel"
          inputMode="numeric"
          maxLength={15}
        />

        <AuthInput
          id="address"
          label="Endereço"
          type="text"
          icon={<MapPin className="size-4" />}
          placeholder="Rua, número, bairro, cidade"
          value={form.address}
          onChange={(e) => update("address", e.target.value)}
          required
          autoComplete="street-address"
        />

        {/* Tipo de pessoa */}
        <div className="space-y-1.5">
          <span className="text-muted-foreground text-xs font-normal">
            Tipo de pessoa
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => update("personType", "FISICA")}
              className={cn(
                "h-11 rounded-md border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors",
                form.personType === "FISICA"
                  ? "bg-brand/15 border-brand/60 text-brand"
                  : "border-border bg-black text-muted-foreground hover:border-brand/30",
              )}
            >
              <User className="size-3.5" />
              Pessoa Física
            </button>
            <button
              type="button"
              onClick={() => update("personType", "JURIDICA")}
              className={cn(
                "h-11 rounded-md border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors",
                form.personType === "JURIDICA"
                  ? "bg-brand/15 border-brand/60 text-brand"
                  : "border-border bg-black text-muted-foreground hover:border-brand/30",
              )}
            >
              <Building2 className="size-3.5" />
              Pessoa Jurídica
            </button>
          </div>
        </div>

        {form.personType === "FISICA" ? (
          <AuthInput
            id="cpf"
            label="CPF"
            type="text"
            icon={<IdCard className="size-4" />}
            placeholder="000.000.000-00"
            value={form.cpf}
            onChange={(e) => update("cpf", maskCpf(e.target.value))}
            required
            autoComplete="off"
            inputMode="numeric"
            maxLength={14}
          />
        ) : (
          <AuthInput
            id="cnpj"
            label="CNPJ"
            type="text"
            icon={<IdCard className="size-4" />}
            placeholder="00.000.000/0000-00"
            value={form.cnpj}
            onChange={(e) => update("cnpj", maskCnpj(e.target.value))}
            required
            autoComplete="off"
            inputMode="numeric"
            maxLength={18}
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

        <p className="text-center text-[11px] text-text-faint mt-1">
          <Link href="/" className="hover:underline">
            ← Sou cliente
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
