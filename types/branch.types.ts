/**
 * Tipos espelhando o modelo `Branch` (filial) do backend.
 *
 * `isReceivingBranch`/`isHidden` são persistidos de fato pelo backend. `cnpj`
 * ainda não tem coluna própria no modelo `Branch` — segue coletado na UI via
 * `lib/branch-config-store.ts` até uma decisão de produto sobre onde deve morar.
 * As formas de pagamento e prazo de recebimento por filial vivem em
 * `PaymentMethodConfig`/`PaymentMethodBranchConfig` (ver `types/payment-method.types.ts`),
 * não neste model.
 */

export interface Branch {
  id: string;
  name: string;
  email: string;
  phone: string;
  cep: string;
  street: string;
  neighborhood: string;
  city: string;
  uf: string;
  number: string;
  complement: string | null;
  isReceivingBranch: boolean;
  isHidden: boolean;
  barbershopId: string;
  createdAt: string;
  updatedAt: string;
  /** Ainda não persistido pelo backend — ver `lib/branch-config-store.ts`. */
  cnpj?: string | null;
}

export interface CreateBranchPayload {
  name: string;
  email: string;
  phone: string;
  cep: string;
  street: string;
  neighborhood: string;
  city: string;
  uf: string;
  number: string;
  complement?: string;
  isReceivingBranch?: boolean;
  isHidden?: boolean;
  /** Ainda não persistido pelo backend — ver `lib/branch-config-store.ts`. */
  cnpj?: string;
}

export interface UpdateBranchPayload {
  name?: string;
  email?: string;
  phone?: string;
  cep?: string;
  street?: string;
  neighborhood?: string;
  city?: string;
  uf?: string;
  number?: string;
  complement?: string;
  isReceivingBranch?: boolean;
  isHidden?: boolean;
  /** Ainda não persistido pelo backend — ver `lib/branch-config-store.ts`. */
  cnpj?: string;
}
