"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/shared";
import type { Service } from "@/types/service.types";
import type { ServiceCommission } from "@/types/professional-config.types";
import { SectionShell } from "./Primitives";

function clampPercent(raw: string): number {
  const n = Number(raw.replace(/\D/g, ""));
  if (!Number.isFinite(n)) return 0;
  return Math.min(100, n);
}

export function ServicosComissao({
  services,
  allServices,
  onChange,
}: {
  services: ServiceCommission[];
  allServices: Service[];
  onChange: (next: ServiceCommission[]) => void;
}) {
  const [toAdd, setToAdd] = useState("");

  const available = allServices.filter(
    (s) => !services.some((sc) => sc.serviceId === s.id),
  );
  const nameOf = (id: string) =>
    allServices.find((s) => s.id === id)?.name ?? "Serviço";

  function add() {
    if (!toAdd) return;
    onChange([...services, { serviceId: toAdd, commissionPercent: 0 }]);
    setToAdd("");
  }

  function setPercent(serviceId: string, percent: number) {
    onChange(
      services.map((sc) =>
        sc.serviceId === serviceId ? { ...sc, commissionPercent: percent } : sc,
      ),
    );
  }

  function remove(serviceId: string) {
    onChange(services.filter((sc) => sc.serviceId !== serviceId));
  }

  return (
    <SectionShell
      title="Serviços que o profissional realiza"
      description="Selecione os serviços previamente cadastrados e defina a comissão (%) por serviço."
    >
      <div className="space-y-3">
        {services.length > 0 && (
          <div className="space-y-1.5">
            <div className="grid grid-cols-[1fr_auto] gap-3 px-1 text-[10px] font-bold uppercase tracking-widest text-text-faint">
              <span>Serviço</span>
              <span className="w-24 text-right">Comissão (%)</span>
            </div>
            {services.map((sc) => (
              <div
                key={sc.serviceId}
                className="grid grid-cols-[1fr_auto] gap-3 items-center"
              >
                <span className="text-sm text-foreground truncate">
                  {nameOf(sc.serviceId)}
                </span>
                <div className="flex items-center gap-2">
                  <div className="relative w-24">
                    <Input
                      value={String(sc.commissionPercent)}
                      onChange={(e) =>
                        setPercent(sc.serviceId, clampPercent(e.target.value))
                      }
                      inputMode="numeric"
                      className="h-9 pr-7 bg-surface-base border-border text-foreground text-right focus-visible:ring-brand/30"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-text-faint">
                      %
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(sc.serviceId)}
                    className="size-8 rounded-md border border-border bg-surface-base text-text-faint hover:text-danger-foreground hover:border-danger/40 transition-colors grid place-items-center shrink-0"
                    aria-label="Remover serviço"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2 pt-1">
          <SelectField
            id="prof-add-servico"
            value={toAdd}
            placeholder={
              available.length ? "Selecionar serviço" : "Sem serviços disponíveis"
            }
            options={available.map((s) => ({
              value: s.id,
              label: s.name,
            }))}
            onChange={setToAdd}
            className="min-w-0"
          />
          <Button
            type="button"
            onClick={add}
            disabled={!toAdd}
            className="h-10 bg-brand hover:bg-brand-hover text-brand-foreground font-bold text-xs disabled:opacity-50"
          >
            Adicionar
          </Button>
        </div>
      </div>
    </SectionShell>
  );
}
