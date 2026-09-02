/** Formata um número como BRL: 1234.5 -> "R$ 1.234,50". */
export function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/** Formata um valor em centavos como BRL: 123450 -> "R$ 1.234,50". */
export function formatBRLFromCents(cents: number): string {
  return formatBRL(cents / 100);
}

/**
 * Formata o preço (em centavos) de um serviço para exibição ao cliente
 * final: quando `startingFrom` é `true` (serviço cujo preço pode variar,
 * ex.: corte de cabelo mais longo usa mais produto), antepõe "A partir de "
 * ao valor formatado em vez de mostrar o preço fixo isolado.
 */
export function formatServicePrice(
  priceInCents: number,
  startingFrom: boolean,
): string {
  const formatted = formatBRLFromCents(priceInCents);
  return startingFrom ? `A partir de ${formatted}` : formatted;
}

/**
 * `scheduledAt` de agendamentos guarda a hora de parede local "disfarçada"
 * de UTC (ex.: 15:30 local vira "...T15:30:00.000Z" no banco — ver
 * convenção em agendar/page.tsx). Passar esse valor direto para
 * toLocaleTimeString/getHours/getDay faz o browser reconverter pelo fuso
 * real do usuário e desalinha o horário exibido (ex.: -3h no Brasil).
 * Esta função devolve um Date "de verdade" no fuso do browser com os
 * mesmos componentes de ano/mês/dia/hora/minuto/segundo, para poder usar
 * normalmente com toLocaleTimeString, getHours(), getDay(), etc.
 */
export function toWallClockDate(value: Date | string): Date {
  const d = typeof value === "string" ? new Date(value) : value;
  return new Date(
    d.getUTCFullYear(),
    d.getUTCMonth(),
    d.getUTCDate(),
    d.getUTCHours(),
    d.getUTCMinutes(),
    d.getUTCSeconds(),
  );
}

/** Formata data como dd/mm/aaaa por padrão (pt-BR). */
export function formatDate(
  date: Date | string,
  options?: Intl.DateTimeFormatOptions,
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("pt-BR", options);
}

/** Formata hora como HH:mm (pt-BR). */
export function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Aplica máscara em telefone BR: "11999990000" -> "(11) 99999-0000". */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }
  if (digits.length === 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }
  return phone;
}

/** Mantém apenas dígitos da string. */
function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Máscara progressiva de CPF para uso em onChange de input:
 * "1" -> "1"
 * "1234" -> "123.4"
 * "12345678901" -> "123.456.789-01"
 * (excede o 11º dígito é descartado)
 */
export function maskCpf(value: string): string {
  const d = digitsOnly(value).slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

/**
 * Máscara progressiva de CNPJ para uso em onChange de input:
 * "1234" -> "12.34"
 * "12345678000195" -> "12.345.678/0001-95"
 */
export function maskCnpj(value: string): string {
  const d = digitsOnly(value).slice(0, 14);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  if (d.length <= 12)
    return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

/**
 * Máscara progressiva de CEP: "12345678" -> "12345-678"
 */
export function maskCep(value: string): string {
  const d = digitsOnly(value).slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}

/**
 * Máscara progressiva de telefone BR (celular ou fixo) para onChange de input:
 * "1" -> "(1"
 * "11" -> "(11"
 * "11999" -> "(11) 999"
 * "1199999" -> "(11) 99999"
 * "119999900" -> "(11) 99999-00"
 * "11999990000" -> "(11) 99999-0000"
 */
export function maskPhone(value: string): string {
  const d = digitsOnly(value).slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10)
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/**
 * Máscara de valor monetário BRL para uso em onChange de input.
 * O usuário digita apenas números; a vírgula e o R$ entram automaticamente
 * preenchendo da direita para a esquerda (padrão PDV brasileiro).
 *
 * "1"       → "R$ 0,01"
 * "123"     → "R$ 1,23"
 * "12345"   → "R$ 123,45"
 * "1234567" → "R$ 12.345,67"
 *
 * Passa a string bruta do evento onChange — a função extrai apenas os dígitos.
 */
export function maskBRLInput(value: string): string {
  const digits = digitsOnly(value);
  if (!digits) return "";
  const num = parseInt(digits, 10);
  return (
    "R$ " +
    (num / 100).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

/** Converte string BRL ("1.234,56" / "R$ 1.234,56") em número (1234.56). */
export function parseBRL(value: string): number {
  const cleaned = value
    .replace(/[^\d,.-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const num = parseFloat(cleaned);
  return Number.isFinite(num) ? num : 0;
}

/**
 * Formata distância em km para exibição no card da barbearia: abaixo de 1km
 * mostra em metros arredondados ("650 m"), acima disso em km com 1 casa
 * decimal ("3,2 km").
 */
export function formatDistanceKm(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} km`;
}

/** Trunca string com reticências quando excede `max` caracteres. */
export function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}
