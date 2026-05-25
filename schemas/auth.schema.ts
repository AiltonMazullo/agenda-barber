import { z } from "zod";

// ─── Login ────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Informe seu e-mail.")
    .email("Formato de e-mail inválido."),
  password: z
    .string()
    .min(1, "Informe sua senha.")
    .min(6, "A senha deve ter pelo menos 6 caracteres."),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// ─── Registro de barbearia ────────────────────────────────────────────────────

const SLUG_REGEX = /^[a-z0-9-]+$/;
const PHONE_REGEX = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;

const baseRegisterSchema = z.object({
  name: z.string().min(2, "Informe o nome da barbearia (mín. 2 caracteres)."),
  slug: z
    .string()
    .min(2, "Slug muito curto.")
    .regex(SLUG_REGEX, "Use apenas letras minúsculas, números e hífens."),
  email: z
    .string()
    .min(1, "Informe o e-mail.")
    .email("E-mail inválido."),
  password: z
    .string()
    .min(6, "A senha deve ter pelo menos 6 caracteres."),
  phone: z
    .string()
    .refine((v) => PHONE_REGEX.test(v), "Telefone inválido."),
  address: z.string().min(1, "Informe o endereço."),
});

export const registerFisicaSchema = baseRegisterSchema.extend({
  personType: z.literal("FISICA"),
  cpf: z
    .string()
    .refine((v) => v.replace(/\D/g, "").length === 11, "CPF inválido."),
  cnpj: z.string().optional(),
});

export const registerJuridicaSchema = baseRegisterSchema.extend({
  personType: z.literal("JURIDICA"),
  cnpj: z
    .string()
    .refine((v) => v.replace(/\D/g, "").length === 14, "CNPJ inválido."),
  cpf: z.string().optional(),
});

export const registerSchema = z.discriminatedUnion("personType", [
  registerFisicaSchema,
  registerJuridicaSchema,
]);

export type RegisterFormData = z.infer<typeof registerSchema>;
