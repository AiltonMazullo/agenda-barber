import { z } from "zod";

export const clientLoginSchema = z.object({
  email: z.string().min(1, "E-mail obrigatório").email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter ao menos 6 caracteres"),
});

export type ClientLoginFormValues = z.infer<typeof clientLoginSchema>;

export const clientRegisterSchema = z.object({
  name: z.string().min(2, "Informe seu nome").max(80, "Nome muito longo"),
  email: z.string().min(1, "E-mail obrigatório").email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter ao menos 6 caracteres"),
  phone: z
    .string()
    .optional()
    .refine(
      (v) => !v || v.replace(/\D/g, "").length >= 10,
      "Telefone inválido",
    ),
});

export type ClientRegisterFormValues = z.infer<typeof clientRegisterSchema>;
