"use client";

import { useMemo, useState } from "react";
import { Play } from "lucide-react";
import { PageHeader, SelectField, Loading, EmptyState } from "@/components/shared";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { usePartnerCompanies } from "@/hooks/usePartnerCompanies";
import { useCouponUsage } from "@/hooks/useCouponUsage";
import { formatDate } from "@/utils/format";
import type { SelectOption } from "@/types/common.types";

const TODOS = "TODOS";

export default function CupomUtilizacaoPage() {
  const { barbershop } = useAuth();
  const { companies } = usePartnerCompanies(barbershop?.id);
  const { usage, isLoading, hasSearched, search } = useCouponUsage(
    barbershop?.id,
  );

  const [partnerCompanyId, setPartnerCompanyId] = useState<string>(TODOS);

  const options: SelectOption<string>[] = useMemo(
    () => [
      { value: TODOS, label: "Todos" },
      ...companies.map((c) => ({ value: c.id, label: c.name })),
    ],
    [companies],
  );

  function handleFilter() {
    void search(partnerCompanyId === TODOS ? undefined : partnerCompanyId);
  }

  return (
    <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
      <PageHeader
        title="Utilização dos Cupons"
        subtitle="Cupons já utilizados pelas empresas parceiras do clube do assinante"
      />

      <div className="flex flex-wrap items-end gap-3">
        <SelectField
          id="partnerCompany"
          label="Empresa Parceira"
          value={partnerCompanyId}
          options={options}
          onChange={setPartnerCompanyId}
        />
        <button
          type="button"
          onClick={handleFilter}
          disabled={isLoading}
          className="h-10 px-4 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors flex items-center gap-1.5 disabled:opacity-50"
        >
          <Play className="size-3.5" />
          Filtrar
        </button>
      </div>

      {isLoading ? (
        <Loading />
      ) : !hasSearched ? (
        <EmptyState message="Escolha uma empresa parceira (ou Todos) e clique em Filtrar." />
      ) : usage.length === 0 ? (
        <EmptyState message="Nenhum resultado!" />
      ) : (
        <Card className="bg-surface-raised border-border">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="border-t border-border">
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground text-xs uppercase tracking-wider font-semibold px-4 py-3 h-auto">
                      Código
                    </TableHead>
                    <TableHead className="text-muted-foreground text-xs uppercase tracking-wider font-semibold px-4 py-3 h-auto">
                      Empresa Parceira
                    </TableHead>
                    <TableHead className="text-muted-foreground text-xs uppercase tracking-wider font-semibold px-4 py-3 h-auto">
                      Desconto
                    </TableHead>
                    <TableHead className="text-muted-foreground text-xs uppercase tracking-wider font-semibold px-4 py-3 h-auto">
                      Utilizado em
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usage.map((c) => (
                    <TableRow
                      key={c.id}
                      className="border-border hover:bg-surface-elevated/50 transition-colors"
                    >
                      <TableCell className="px-4 py-4 text-sm font-semibold">
                        {c.code}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-sm">
                        {c.partnerCompany.name}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-sm">
                        {c.discount}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-sm text-muted-foreground">
                        {c.usedAt
                          ? formatDate(c.usedAt, {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
