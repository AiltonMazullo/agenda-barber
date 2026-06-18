/**
 * Notificação exibida no sino do header. **Mock local** enquanto o backend não
 * expõe a rota de notificações.
 */
export interface AppNotification {
  id: string;
  title: string;
  message: string;
  /** ISO datetime. */
  createdAt: string;
}
