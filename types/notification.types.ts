/** Notificação exibida no sino do header. */
export type NotificationType =
  | "NEW_APPOINTMENT"
  | "LOW_STOCK"
  | "CASH_DIVERGENCE"
  | "TODAY_APPOINTMENTS";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  /** ISO datetime. */
  createdAt: string;
  isRead: boolean;
}
