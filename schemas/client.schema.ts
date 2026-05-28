import { z } from "zod";
import { UF_OPTIONS } from "@/utils/constants";
import type { CreateClientPayload } from "@/types/client.types";

/**
 * Schema do formulário de cadastro de cliente (usado tanto pelo modal do dono
 * quanto pelo cadastro público). `birthDate` é um `Date` no formulário e vira
 * ISO 8601 no payload.
 */
export const clientFormSchema = z.object({
  name: z.string().min(2, "Informe o nome completo").max(80, "Nome muito longo"),
  email: z.string().min(1, "E-mail obrigatório").email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter ao menos 6 caracteres"),
  phone: z
    .string()
    .refine((v) => v.replace(/\D/g, "").length >= 10, "Telefone inválido"),
  birthDate: z
    .date({ message: "Informe a data de nascimento" })
    .refine((d) => {
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      return d <= end;
    }, "Data de nascimento não pode estar no futuro"),
  howMet: z.string().min(1, "Selecione como conheceu"),
  cpf: z.string().optional(),
  cep: z.string().optional(),
  street: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  uf: z
    .union([z.enum(UF_OPTIONS), z.literal("")])
    .optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
});

export type ClientFormValues = z.infer<typeof clientFormSchema>;

/** Converte os valores do formulário no payload da API. */
export function toCreateClientPayload(
  values: ClientFormValues,
): CreateClientPayload {
  const trimmed = (v?: string) => {
    const t = v?.trim();
    return t ? t : undefined;
  };
  return {
    name: values.name.trim(),
    email: values.email.trim().toLowerCase(),
    password: values.password,
    phone: values.phone.trim(),
    birthDate: values.birthDate.toISOString(),
    howMet: values.howMet,
    cpf: trimmed(values.cpf),
    cep: trimmed(values.cep),
    street: trimmed(values.street),
    neighborhood: trimmed(values.neighborhood),
    city: trimmed(values.city),
    uf: values.uf ? values.uf : undefined,
    number: trimmed(values.number),
    complement: trimmed(values.complement),
  };
}
