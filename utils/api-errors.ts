/**
 * Tradução das mensagens vindas da API para PT-BR.
 *
 * O backend emite:
 * - AppError com mensagens em inglês (ex.: "Invalid credentials").
 * - 422 ZodError com `errors: { campo: [mensagens...] }`.
 * - 500 fallback "Internal server error".
 * - Erros de rede sem status (timeout, offline).
 */

// ─── Tradução direta de mensagens conhecidas ──────────────────────────────────

const MESSAGE_MAP: Record<string, string> = {
  "Invalid credentials": "E-mail ou senha inválidos.",
  "Invalid or expired refresh token":
    "Sua sessão expirou. Faça login novamente.",
  "Token not provided": "Sessão não encontrada. Faça login novamente.",
  "Invalid or expired token": "Sua sessão expirou. Faça login novamente.",
  "Service not found": "Serviço não encontrado.",
  "Employee not found": "Profissional não encontrado.",
  "Appointment not found": "Agendamento não encontrado.",
  "Barbershop not found": "Barbearia não encontrada.",
  "Branch not found": "Filial não encontrada.",
  "Product not found": "Produto não encontrado.",
  "Slug already in use": "Este slug já está em uso. Escolha outro.",
  "Email already in use": "Este e-mail já está cadastrado.",
  Forbidden: "Você não tem permissão para esta ação.",
  "Internal server error": "Erro interno do servidor. Tente novamente.",
  "Validation error": "Dados inválidos. Verifique os campos preenchidos.",
};

// ─── Labels de campos pra exibir em erros de validação ────────────────────────

const FIELD_LABELS: Record<string, string> = {
  email: "E-mail",
  password: "Senha",
  name: "Nome",
  slug: "Slug",
  phone: "Telefone",
  address: "Endereço",
  personType: "Tipo de pessoa",
  cpf: "CPF",
  cnpj: "CNPJ",
  serviceId: "Serviço",
  scheduledAt: "Data/Hora",
  status: "Status",
  durationMin: "Duração",
  priceInCents: "Preço",
  description: "Descrição",
  refreshToken: "Token de atualização",
  cep: "CEP",
  street: "Rua",
  neighborhood: "Bairro",
  city: "Cidade",
  uf: "UF",
  number: "Número",
  complement: "Complemento",
};

// ─── Tradução de mensagens Zod ────────────────────────────────────────────────

const ZOD_PATTERNS: Array<{ pattern: RegExp; replace: string }> = [
  { pattern: /^Required$/i, replace: "campo obrigatório" },
  { pattern: /^Invalid email$/i, replace: "formato de e-mail inválido" },
  { pattern: /^Invalid CPF$/i, replace: "CPF inválido" },
  { pattern: /^Invalid CNPJ$/i, replace: "CNPJ inválido" },
  { pattern: /^Invalid phone number$/i, replace: "telefone inválido" },
  {
    pattern: /^Only lowercase letters, numbers and hyphens$/i,
    replace: "use apenas letras minúsculas, números e hífens",
  },
  {
    pattern: /^String must contain at least (\d+) character\(s\)$/i,
    replace: "deve ter pelo menos $1 caracteres",
  },
  {
    pattern: /^String must contain at most (\d+) character\(s\)$/i,
    replace: "deve ter no máximo $1 caracteres",
  },
  {
    pattern: /^Number must be greater than (\d+)$/i,
    replace: "deve ser maior que $1",
  },
  {
    pattern: /^Number must be greater than or equal to (\d+)$/i,
    replace: "deve ser maior ou igual a $1",
  },
  { pattern: /^Expected .+, received .+$/i, replace: "valor inválido" },
  { pattern: /^Invalid url$/i, replace: "URL inválida" },
  { pattern: /^Invalid cuid$/i, replace: "identificador inválido" },
  { pattern: /^Invalid datetime$/i, replace: "data/hora inválida" },
];

function translateZodMessage(msg: string): string {
  for (const { pattern, replace } of ZOD_PATTERNS) {
    if (pattern.test(msg)) return msg.replace(pattern, replace);
  }
  return msg;
}

// ─── Formato dos field errors do Zod ──────────────────────────────────────────

function formatFieldErrors(errors: Record<string, string[]>): string {
  const entries = Object.entries(errors);
  if (entries.length === 0) return "Dados inválidos.";

  const formatted = entries
    .slice(0, 3)
    .map(([field, msgs]) => {
      const label = FIELD_LABELS[field] ?? field;
      const msg = msgs[0] ?? "valor inválido";
      return `${label}: ${translateZodMessage(msg)}`;
    });

  const extra = entries.length - formatted.length;
  const tail = extra > 0 ? ` (+${extra} ${extra === 1 ? "erro" : "erros"})` : "";
  return formatted.join(" • ") + tail;
}

// ─── Fallback por status ──────────────────────────────────────────────────────

function fallbackByStatus(status: number): string {
  if (status === 400) return "Requisição inválida. Verifique os dados enviados.";
  if (status === 401) return "Sessão expirada. Faça login novamente.";
  if (status === 403) return "Você não tem permissão para esta ação.";
  if (status === 404) return "Recurso não encontrado.";
  if (status === 409) return "Conflito de dados. Verifique e tente de novo.";
  if (status === 422) return "Dados inválidos. Verifique os campos preenchidos.";
  if (status === 429)
    return "Muitas tentativas. Aguarde alguns instantes e tente novamente.";
  if (status >= 500) return "Erro no servidor. Tente novamente em instantes.";
  return "Ocorreu um erro inesperado.";
}

// ─── API pública ──────────────────────────────────────────────────────────────

export function translateApiError(
  message: string,
  status?: number,
  fieldErrors?: Record<string, string[]>,
): string {
  // 422 com lista de erros de campo
  if (status === 422 && fieldErrors && Object.keys(fieldErrors).length > 0) {
    return formatFieldErrors(fieldErrors);
  }

  // Mensagem conhecida
  if (message && MESSAGE_MAP[message]) return MESSAGE_MAP[message];

  // Sem resposta (network / timeout)
  if (!status) {
    if (/network/i.test(message)) return "Sem conexão com o servidor.";
    if (/timeout/i.test(message)) return "O servidor demorou para responder.";
    return "Falha de conexão. Verifique sua internet.";
  }

  // Fallback por status
  return fallbackByStatus(status);
}
