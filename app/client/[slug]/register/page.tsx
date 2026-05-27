"use client";

import { use } from "react";
import { Mail, Lock, User, Phone, IdCard, MapPin } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthInput } from "@/components/auth/AuthInput";
import { SelectField, DatePickerField } from "@/components/shared";
import {
  clientFormSchema,
  toCreateClientPayload,
  type ClientFormValues,
} from "@/schemas/client.schema";
import { useClientAuth } from "@/hooks/useClientAuth";
import { usePublicBarbershop } from "@/contexts/PublicBarbershopContext";
import { maskPhone, maskCpf, maskCep } from "@/utils/format";
import { fetchAddressByCep } from "@/utils/cep";
import { HOW_MET_OPTIONS, UF_OPTIONS } from "@/utils/constants";

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
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
      howMet: "",
      cpf: "",
      cep: "",
      street: "",
      neighborhood: "",
      city: "",
      uf: "",
      number: "",
      complement: "",
    },
  });

  async function handleCepBlur(cep: string) {
    if (cep.replace(/\D/g, "").length !== 8) return;
    const addr = await fetchAddressByCep(cep);
    if (!addr) return;
    if (addr.street) setValue("street", addr.street);
    if (addr.neighborhood) setValue("neighborhood", addr.neighborhood);
    if (addr.city) setValue("city", addr.city);
    if (addr.uf) setValue("uf", addr.uf as ClientFormValues["uf"]);
  }

  async function onSubmit(values: ClientFormValues) {
    if (!barbershop) {
      toast.error("Aguarde — ainda carregando a barbearia.");
      return;
    }
    try {
      await registerClient({
        ...toCreateClientPayload(values),
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
            value={field.value}
            onChange={(e) => field.onChange(maskPhone(e.target.value))}
            onBlur={field.onBlur}
            ref={field.ref}
          />
        )}
      />

      <div className="grid grid-cols-2 gap-3">
        <Controller
          control={control}
          name="birthDate"
          render={({ field }) => (
            <div className="flex flex-col gap-1">
              <DatePickerField
                id="birthDate"
                label="Nascimento"
                date={field.value}
                onChange={field.onChange}
              />
              {errors.birthDate && (
                <p className="text-[11px] text-danger-foreground">
                  {errors.birthDate.message}
                </p>
              )}
            </div>
          )}
        />
        <Controller
          control={control}
          name="howMet"
          render={({ field }) => (
            <div className="flex flex-col gap-1">
              <SelectField
                id="howMet"
                label="Como conheceu"
                value={field.value}
                options={HOW_MET_OPTIONS}
                onChange={field.onChange}
                placeholder="Selecione"
              />
              {errors.howMet && (
                <p className="text-[11px] text-danger-foreground">
                  {errors.howMet.message}
                </p>
              )}
            </div>
          )}
        />
      </div>

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

      <Controller
        control={control}
        name="cpf"
        render={({ field }) => (
          <AuthInput
            id="cpf"
            label="CPF (opcional)"
            icon={<IdCard className="size-4" />}
            placeholder="000.000.000-00"
            inputMode="numeric"
            maxLength={14}
            value={field.value ?? ""}
            onChange={(e) => field.onChange(maskCpf(e.target.value))}
            ref={field.ref}
          />
        )}
      />

      {/* Endereço (opcional) */}
      <div className="pt-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-brand mb-2">
          Endereço (opcional)
        </p>
        <div className="flex flex-col gap-4">
          <Controller
            control={control}
            name="cep"
            render={({ field }) => (
              <AuthInput
                id="cep"
                label="CEP"
                icon={<MapPin className="size-4" />}
                placeholder="00000-000"
                inputMode="numeric"
                maxLength={9}
                value={field.value ?? ""}
                onChange={(e) => field.onChange(maskCep(e.target.value))}
                onBlur={() => void handleCepBlur(field.value ?? "")}
                ref={field.ref}
              />
            )}
          />

          <AuthInput
            id="street"
            label="Logradouro"
            icon={<MapPin className="size-4" />}
            placeholder="Rua / Avenida"
            {...register("street")}
          />

          <div className="grid grid-cols-2 gap-3">
            <AuthInput
              id="neighborhood"
              label="Bairro"
              icon={<MapPin className="size-4" />}
              placeholder="Bairro"
              {...register("neighborhood")}
            />
            <AuthInput
              id="city"
              label="Cidade"
              icon={<MapPin className="size-4" />}
              placeholder="Cidade"
              {...register("city")}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Controller
              control={control}
              name="uf"
              render={({ field }) => (
                <SelectField
                  id="uf"
                  label="UF"
                  value={field.value ?? ""}
                  options={UF_OPTIONS}
                  onChange={field.onChange}
                  placeholder="UF"
                />
              )}
            />
            <AuthInput
              id="number"
              label="Número"
              icon={<MapPin className="size-4" />}
              placeholder="Nº"
              {...register("number")}
            />
          </div>

          <AuthInput
            id="complement"
            label="Complemento"
            icon={<MapPin className="size-4" />}
            placeholder="Apto, bloco…"
            {...register("complement")}
          />
        </div>
      </div>

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
