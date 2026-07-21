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

/** Substitui as tags `#tag` de um template pelos valores informados (mantém a tag se não houver valor). */
function fillTemplate(template: string, values: Record<string, string>): string {
  return template.replace(/#(\w+)/g, (match, tag: string) =>
    tag in values ? values[tag] : match,
  );
}

export function renderWhatsappPreview(
  template: string,
  context: WhatsappPreviewContext = {},
): string {
  const values: Record<string, string> = {
    ...SAMPLE_VALUES,
    nome_empresa: context.barbershopName?.trim() || "Barbearia Exemplo",
    telefone_empresa: context.barbershopPhone?.trim() || "(11) 99999-0000",
  };

  return fillTemplate(template, values);
}

/**
 * Renderiza um template de WhatsApp com dados reais (ex.: de um agendamento),
 * usado para gerar a mensagem de confirmação enviada a partir da Agenda —
 * mesmo formato de tags (`#nome_cliente`, `#data`, `#hora`, ...) do preview
 * de Configurações, mas com os valores reais em vez dos de exemplo.
 */
export function renderWhatsappMessage(
  template: string,
  values: Record<string, string | undefined | null>,
): string {
  const clean: Record<string, string> = {};
  for (const [key, value] of Object.entries(values)) {
    if (value) clean[key] = value;
  }
  return fillTemplate(template, clean);
}

/** Monta o link `https://wa.me/...` a partir de um telefone (com ou sem máscara) e uma mensagem. */
export function buildWhatsappLink(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, "");
  const withCountryCode = digits.startsWith("55") ? digits : `55${digits}`;
  return `https://wa.me/${withCountryCode}?text=${encodeURIComponent(message)}`;
}
