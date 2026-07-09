/**
 * Substituição de tags dinâmicas (#tag) nos templates de WhatsApp por dados de
 * exemplo, usada para renderizar o preview na tela de configurações.
 */

export interface WhatsappPreviewContext {
  barbershopName?: string | null;
  barbershopPhone?: string | null;
}

const SAMPLE_VALUES = {
  nome_cliente: "Maria Souza",
  cliente_primeiro_nome: "Maria",
  email: "maria.souza@email.com",
  nome_profissional: "Carlos Andrade",
  profissional_primeiro_nome: "Carlos",
  data: "15/07/2026",
  hora: "14:30",
  plano_nome: "Plano Mensal Premium",
};

export function renderWhatsappPreview(
  template: string,
  context: WhatsappPreviewContext = {},
): string {
  const values: Record<string, string> = {
    ...SAMPLE_VALUES,
    nome_empresa: context.barbershopName?.trim() || "Barbearia Exemplo",
    telefone_empresa: context.barbershopPhone?.trim() || "(11) 99999-0000",
  };

  return template.replace(/#(\w+)/g, (match, tag: string) =>
    tag in values ? values[tag] : match,
  );
}
