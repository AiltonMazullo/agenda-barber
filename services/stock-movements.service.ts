import { api } from "@/lib/api";
import type {
  NewStockMovementBatchInput,
  NewStockMovementInput,
  StockMovement,
  StockMovementApiResponse,
} from "@/types/inventory.types";

const base = (barbershopId: string) => `/barbershops/${barbershopId}/stock-movements`;

function toStockMovement(raw: StockMovementApiResponse): StockMovement {
  return {
    id: raw.id,
    productId: raw.productId,
    productName: raw.product.name,
    branchId: raw.branchId ?? "",
    branchName: raw.branch?.name ?? "—",
    type: raw.type,
    quantity: raw.quantity,
    unitCostInCents: raw.unitCostInCents ?? undefined,
    unitPriceInCents: raw.unitPriceInCents ?? undefined,
    note: raw.note ?? undefined,
    user: raw.employee?.name ?? "Dono",
    createdAt: raw.createdAt,
  };
}

export const stockMovementsService = {
  async list(barbershopId: string): Promise<StockMovement[]> {
    const { data } = await api.get<StockMovementApiResponse[]>(base(barbershopId));
    return data.map(toStockMovement);
  },

  async create(
    barbershopId: string,
    input: NewStockMovementInput,
  ): Promise<StockMovement> {
    const { data } = await api.post<StockMovementApiResponse>(base(barbershopId), {
      productId: input.productId,
      branchId: input.branchId || undefined,
      type: input.type,
      quantity: input.quantity,
      unitCostInCents: input.unitCostInCents,
      unitPriceInCents: input.unitPriceInCents,
      note: input.note,
    });
    return toStockMovement(data);
  },

  async createBatch(
    barbershopId: string,
    input: NewStockMovementBatchInput,
  ): Promise<StockMovement[]> {
    const { data } = await api.post<StockMovementApiResponse[]>(
      `${base(barbershopId)}/batch`,
      {
        branchId: input.branchId || undefined,
        items: input.items,
      },
    );
    return data.map(toStockMovement);
  },
};
