"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import { AlertCircle, Ticket } from "lucide-react";
import { Loading, EmptyState } from "@/components/shared";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { partnerCompanyPublicService } from "@/services/partner-company-public.service";
import { formatDate } from "@/utils/format";
import type { PublicPartnerCompanyCoupons } from "@/types/partner-company.types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Link público da empresa parceira (sem login) — ela confere aqui quem
 * resgatou qual cupom dela, pra validar na hora do atendimento. Gerado
 * automaticamente ao cadastrar a empresa em Marketing > Clube - Empresas
 * Parceiras (ver [empresas-parceiras/page.tsx](../../(dashboard)/marketing/clube-assinante/empresas-parceiras/page.tsx)).
 */
export default function ParceiroPublicPage({ params }: PageProps) {
  const { slug } = use(params);
  const [data, setData] = useState<PublicPartnerCompanyCoupons | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;
    partnerCompanyPublicService
      .getBySlug(slug)
      .then((result) => {
        if (active) setData(result);
      })
      .catch(() => {
        if (active) setNotFound(true);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [slug]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <div className="flex items-center gap-2">
        <Image
          src="/Logo-Agendle-05.png"
          alt="Agendle"
          width={112}
          height={30}
          className="object-contain"
          priority
        />
      </div>

      {isLoading && <Loading />}

      {notFound && !isLoading && (
        <div className="rounded-lg border border-warning/30 bg-warning/5 p-8 text-center space-y-2">
          <AlertCircle className="size-8 text-warning-foreground mx-auto" />
          <p className="text-sm text-foreground">
            Link inválido — empresa parceira não encontrada.
          </p>
        </div>
      )}

      {data && !isLoading && (
        <>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {data.company.name}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Cupons resgatados pelos clientes — confira o código e o cliente
              antes de aplicar o benefício.
            </p>
          </div>

          {data.coupons.length === 0 ? (
            <EmptyState
              icon={<Ticket className="size-10" />}
              message="Nenhum cupom resgatado ainda."
            />
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
                          Cliente
                        </TableHead>
                        <TableHead className="text-muted-foreground text-xs uppercase tracking-wider font-semibold px-4 py-3 h-auto">
                          Desconto
                        </TableHead>
                        <TableHead className="text-muted-foreground text-xs uppercase tracking-wider font-semibold px-4 py-3 h-auto">
                          Resgatado em
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.coupons.map((c) => (
                        <TableRow
                          key={c.id}
                          className="border-border hover:bg-surface-elevated/50 transition-colors"
                        >
                          <TableCell className="px-4 py-4 text-sm font-mono font-semibold">
                            {c.code}
                          </TableCell>
                          <TableCell className="px-4 py-4 text-sm">
                            {c.client?.name ?? "—"}
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
        </>
      )}
    </div>
  );
}
