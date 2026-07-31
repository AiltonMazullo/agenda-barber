"use client";

import { Search, MapPin, Tags } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

/** Categorias de empresa exibidas no filtro da vitrine pública. */
export const BUSINESS_CATEGORIES = [
  "Barbearia",
  "Salão de Beleza",
  "Manicure",
  "Spa",
] as const;

export type BusinessCategory = (typeof BUSINESS_CATEGORIES)[number];

/** Rótulo (PT-BR, exibido no filtro) → código enviado pra API (`Barbershop.category`). */
export const BUSINESS_CATEGORY_CODES: Record<BusinessCategory, string> = {
  Barbearia: "BARBEARIA",
  "Salão de Beleza": "SALAO",
  Manicure: "MANICURE",
  Spa: "SPA",
};

interface BarbershopFiltersProps {
  query: string;
  onQueryChange: (value: string) => void;
  city: string;
  onCityChange: (value: string) => void;
  /** `"all"` → todas as categorias. */
  category: string;
  onCategoryChange: (value: string) => void;
}

export function BarbershopFilters({
  query,
  onQueryChange,
  city,
  onCityChange,
  category,
  onCategoryChange,
}: BarbershopFiltersProps) {
  function categoryLabel(v: string): string {
    if (v === "all") return "Barbearia, Salão de Beleza, Manicure";
    return v;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {/* Nome */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Digite o nome do salão ou barbearia"
          className="h-11 pl-10 bg-surface-raised border-border-subtle"
        />
      </div>

      {/* Cidade */}
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          value={city}
          onChange={(e) => onCityChange(e.target.value)}
          placeholder="Busca por cidade"
          className="h-11 pl-10 bg-surface-raised border-border-subtle"
        />
      </div>

      {/* Categoria */}
      <Select value={category} onValueChange={(v) => onCategoryChange(v as string)}>
        <SelectTrigger className="h-11 w-full bg-surface-raised border-border-subtle text-foreground">
          <Tags className="size-4 text-muted-foreground" />
          <SelectValue>
            {() => (
              <span className="truncate">
                <span className="text-muted-foreground">Categoria: </span>
                {categoryLabel(category)}
              </span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-surface-raised border border-border text-foreground">
          <SelectItem value="all">Todas as categorias</SelectItem>
          {BUSINESS_CATEGORIES.map((c) => (
            <SelectItem key={c} value={c}>
              {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
