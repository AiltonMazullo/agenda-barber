import { z } from "zod";

export const clientLoginSchema = z.object({
  email: z.string().min(1, "E-mail obrigatório").email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter ao menos 6 caracteres"),
});

export type ClientLoginFormValues = z.infer<typeof clientLoginSchema>;

// O cadastro de cliente (público e pelo dono) usa o schema completo em
// `@/schemas/client.schema` (clientFormSchema).
