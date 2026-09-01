/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useRef, useState } from "react";
import { X, Eye, EyeOff, Camera, User } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { SelectField, DatePickerField } from "@/components/shared";
import { cn } from "@/lib/utils";
import { maskPhone, maskCpf, maskCep } from "@/utils/format";
import { fetchAddressByCep } from "@/utils/cep";
import { HOW_MET_OPTIONS, UF_OPTIONS } from "@/utils/constants";
import {
  editClientFormSchema,
  toUpdateClientPayload,
  type EditClientFormValues,
} from "@/schemas/client.schema";
import type { Client, UpdateClientPayload } from "@/types/client.types";

function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
      {children}
      {required && <span className="text-brand">*</span>}
    </label>
  );
}

const fieldInput =
  "bg-surface-base border-border text-foreground placeholder:text-text-faint focus-visible:ring-brand/30 h-10";

export function DialogEditarCliente({
  open,
  onOpenChange,
  client,
  onSave,
  onUploadPhoto,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  client: Client | null;
  onSave: (id: string, payload: UpdateClientPayload) => Promise<void>;
  /** Upload real da foto (rota dedicada) — chamado após salvar os demais campos. */
  onUploadPhoto?: (clientId: string, file: File) => Promise<unknown>;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [pendingPhoto, setPendingPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EditClientFormValues>({
    resolver: zodResolver(editClientFormSchema),
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
      remindInSchedule: true,
    },
  });

  useEffect(() => {
    if (!open || !client) return;
    reset({
      name: client.name,
      email: client.email,
      password: "",
      phone: client.phone ?? "",
      birthDate: client.birthDate ? new Date(client.birthDate) : undefined,
      howMet: client.howMet ?? "",
      cpf: client.cpf ?? "",
      cep: client.cep ?? "",
      street: client.street ?? "",
      neighborhood: client.neighborhood ?? "",
      city: client.city ?? "",
      uf: (client.uf as EditClientFormValues["uf"]) ?? "",
      number: client.number ?? "",
      complement: client.complement ?? "",
      remindInSchedule: client.remindInSchedule,
    });
    setShowPassword(false);
    setPendingPhoto(null);
    setPhotoPreview(client.photoUrl ?? null);
  }, [open, client, reset]);

  async function handleCepBlur(cep: string) {
    if (cep.replace(/\D/g, "").length !== 8) return;
    const addr = await fetchAddressByCep(cep);
    if (!addr) return;
    if (addr.street) setValue("street", addr.street);
    if (addr.neighborhood) setValue("neighborhood", addr.neighborhood);
    if (addr.city) setValue("city", addr.city);
    if (addr.uf) setValue("uf", addr.uf as EditClientFormValues["uf"]);
  }

  function handlePhotoSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Use uma imagem JPG, PNG ou WebP.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("A foto deve ter no máximo 2MB.");
      return;
    }
    setPendingPhoto(file);
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(String(reader.result));
    reader.readAsDataURL(file);
  }

  async function onSubmit(values: EditClientFormValues) {
    if (!client) return;
    await onSave(client.id, toUpdateClientPayload(values));
    if (pendingPhoto && onUploadPhoto) {
      await onUploadPhoto(client.id, pendingPhoto);
    }
    onOpenChange(false);
  }

  if (!client) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface-raised border border-border text-foreground max-w-2xl p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border-subtle">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-bold">
              Editar Cliente
            </DialogTitle>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="size-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
            {/* Foto do cliente */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="size-16 rounded-full border border-border bg-surface-base bg-cover bg-center grid place-items-center text-muted-foreground hover:border-brand/40 transition-colors overflow-hidden shrink-0"
                style={
                  photoPreview
                    ? { backgroundImage: `url(${photoPreview})` }
                    : undefined
                }
              >
                {!photoPreview && <User className="size-6" />}
              </button>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="text-xs font-semibold text-brand hover:underline flex items-center gap-1"
                >
                  <Camera className="size-3.5" />
                  {photoPreview ? "Trocar foto" : "Adicionar foto"}
                </button>
                <p className="text-[10px] text-text-faint">
                  JPG/PNG/WebP até 2MB
                </p>
              </div>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handlePhotoSelected}
              />
            </div>

            {/* Dados pessoais */}
            <div className="space-y-1.5">
              <FieldLabel required>Nome</FieldLabel>
              <Input
                {...register("name")}
                placeholder="Nome completo"
                className={fieldInput}
              />
              {errors.name && (
                <p className="text-[11px] text-danger-foreground">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <FieldLabel required>E-mail</FieldLabel>
                <Input
                  type="email"
                  {...register("email")}
                  placeholder="cliente@email.com"
                  className={fieldInput}
                />
                {errors.email && (
                  <p className="text-[11px] text-danger-foreground">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <Controller
                control={control}
                name="howMet"
                render={({ field }) => (
                  <div className="space-y-1.5">
                    <SelectField
                      id="howMet"
                      label="Como conheceu"
                      value={field.value ?? ""}
                      options={HOW_MET_OPTIONS}
                      onChange={field.onChange}
                      placeholder="Selecione"
                    />
                  </div>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <FieldLabel>Nova senha (opcional)</FieldLabel>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    placeholder="Deixe em branco para manter"
                    className={cn(fieldInput, "pr-9")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-text-faint hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[11px] text-danger-foreground">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Controller
                control={control}
                name="phone"
                render={({ field }) => (
                  <div className="space-y-1.5">
                    <FieldLabel>Telefone</FieldLabel>
                    <Input
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(maskPhone(e.target.value))}
                      inputMode="numeric"
                      maxLength={15}
                      placeholder="(11) 99999-0000"
                      className={fieldInput}
                    />
                  </div>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                control={control}
                name="birthDate"
                render={({ field }) => {
                  const today = new Date();
                  return (
                    <div className="space-y-1.5">
                      <DatePickerField
                        id="birthDate"
                        label="Data de nascimento"
                        date={field.value}
                        onChange={field.onChange}
                        disabled={{ after: today }}
                        startMonth={new Date(1920, 0)}
                        endMonth={today}
                        defaultMonth={
                          field.value ?? new Date(today.getFullYear() - 25, 0)
                        }
                      />
                    </div>
                  );
                }}
              />

              <Controller
                control={control}
                name="cpf"
                render={({ field }) => (
                  <div className="space-y-1.5">
                    <FieldLabel>CPF</FieldLabel>
                    <Input
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(maskCpf(e.target.value))}
                      inputMode="numeric"
                      maxLength={14}
                      placeholder="000.000.000-00"
                      className={fieldInput}
                    />
                  </div>
                )}
              />
            </div>

            {/* Endereço */}
            <div className="pt-2 border-t border-border-subtle">
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand mb-3 mt-3">
                Endereço (opcional)
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Controller
                  control={control}
                  name="cep"
                  render={({ field }) => (
                    <div className="space-y-1.5">
                      <FieldLabel>CEP</FieldLabel>
                      <Input
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(maskCep(e.target.value))
                        }
                        onBlur={() => void handleCepBlur(field.value ?? "")}
                        inputMode="numeric"
                        maxLength={9}
                        placeholder="00000-000"
                        className={fieldInput}
                      />
                    </div>
                  )}
                />
                <div className="space-y-1.5">
                  <FieldLabel>Logradouro</FieldLabel>
                  <Input
                    {...register("street")}
                    placeholder="Rua / Avenida"
                    className={fieldInput}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-1.5">
                  <FieldLabel>Bairro</FieldLabel>
                  <Input
                    {...register("neighborhood")}
                    placeholder="Bairro"
                    className={fieldInput}
                  />
                </div>
                <div className="space-y-1.5">
                  <FieldLabel>Cidade</FieldLabel>
                  <Input
                    {...register("city")}
                    placeholder="Cidade"
                    className={fieldInput}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
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
                <div className="space-y-1.5">
                  <FieldLabel>Número</FieldLabel>
                  <Input
                    {...register("number")}
                    placeholder="Nº"
                    className={fieldInput}
                  />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <FieldLabel>Complemento</FieldLabel>
                  <Input
                    {...register("complement")}
                    placeholder="Apto, bloco…"
                    className={fieldInput}
                  />
                </div>
              </div>
            </div>

            {/* Preferências */}
            <div className="pt-2 border-t border-border-subtle">
              <Controller
                control={control}
                name="remindInSchedule"
                render={({ field }) => (
                  <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer select-none mt-3">
                    <input
                      type="checkbox"
                      checked={field.value ?? false}
                      onChange={(e) => field.onChange(e.target.checked)}
                      className="size-4 rounded border-border accent-brand"
                    />
                    Lembrar na agenda
                  </label>
                )}
              />
            </div>
          </div>

          <div className="px-6 pb-6 pt-4 border-t border-border-subtle flex justify-end gap-3">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="h-9 px-5 rounded-md border border-border bg-transparent text-sm text-foreground hover:bg-surface-elevated transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-9 px-5 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors disabled:opacity-60"
            >
              {isSubmitting ? "Salvando…" : "Salvar"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
