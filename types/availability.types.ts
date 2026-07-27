/**
 * Disponibilidade de horários por profissional.
 *
 * Contrato isolado: `GET /barbershops/:bid/availability`. Os nomes de query e o
 * formato de retorno exatos ainda serão confirmados com o backend; a conversão
 * fica concentrada no `availability.service.ts`.
 */

export interface AvailabilityQuery {
  /** Profissional escolhido. Ausente = sem preferência (agregado da barbearia). */
  employeeId?: string;
  /** Um ou mais serviços selecionados — a duração combinada é usada para calcular os slots livres. */
  serviceIds: string[];
  /** "YYYY-MM-DD" */
  date: string;
}
