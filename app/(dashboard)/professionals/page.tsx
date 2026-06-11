"use client";

import Link from "next/link";
import { UserPlus, Pencil, Mail, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader, EmptyState, Loading } from "@/components/shared";
import { useAuth } from "@/hooks/useAuth";
import { useEmployees } from "@/hooks/useEmployees";

export default function ProfessionalsPage() {
  const { barbershop } = useAuth();
  const { employees, isLoading, setFeatured } = useEmployees(barbershop?.id);

  return (
    <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
      <PageHeader
        title="Profissionais"
        subtitle="Equipe e configurações de atendimento"
        actions={
          <Link
            href="/professionals/new"
            className="h-9 px-4 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors flex items-center gap-1.5"
          >
            <UserPlus className="size-3.5" />
            Novo profissional
          </Link>
        }
      />

      <Card className="bg-surface-raised border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="border-t border-border">
                <TableRow className="border-border hover:bg-transparent">
                  {["Profissional", "Contato", "Destaque", ""].map((col, i) => (
                    <TableHead
                      key={col || `c-${i}`}
                      className={`text-muted-foreground text-xs uppercase tracking-wider font-semibold px-4 py-3 h-auto ${
                        col === "Destaque" ? "text-center" : ""
                      }`}
                    >
                      {col}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow className="border-border hover:bg-transparent">
                    <TableCell colSpan={4} className="py-4">
                      <Loading />
                    </TableCell>
                  </TableRow>
                ) : employees.length === 0 ? (
                  <TableRow className="border-border hover:bg-transparent">
                    <TableCell colSpan={4} className="py-4">
                      <EmptyState message="Nenhum profissional cadastrado." />
                    </TableCell>
                  </TableRow>
                ) : (
                  employees.map((e) => (
                    <TableRow
                      key={e.id}
                      className="border-border hover:bg-surface-elevated/50 transition-colors"
                    >
                      <TableCell className="px-4 py-4">
                        <Link
                          href={`/professionals/${e.id}`}
                          className="font-semibold text-foreground hover:text-brand transition-colors text-sm"
                        >
                          {e.name}
                        </Link>
                        <p className="text-xs text-text-faint">{e.appName}</p>
                      </TableCell>
                      <TableCell className="px-4 py-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Mail className="size-3" />
                          {e.email}
                        </div>
                        {e.phone && (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Phone className="size-3" />
                            {e.phone}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="px-4 py-4">
                        <div className="flex justify-center">
                          <Checkbox
                            checked={e.featured}
                            onCheckedChange={(c) =>
                              setFeatured(e.id, c === true)
                            }
                            aria-label="Marcar como destaque"
                            className="cursor-pointer"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-4">
                        <Link
                          href={`/professionals/${e.id}`}
                          title="Editar profissional"
                          className="text-muted-foreground hover:text-brand transition-colors flex w-fit"
                        >
                          <Pencil className="size-4" />
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
