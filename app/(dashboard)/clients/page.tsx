"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Users,
  CalendarCheck,
  Mail,
  Clock,
  Trophy,
  Info,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader, SummaryCard, EmptyState } from "@/components/shared";
import { useAuth } from "@/hooks/useAuth";
import { useDerivedClients } from "@/hooks/useDerivedClients";
import { formatBRL, formatDate } from "@/utils/format";

export default function ClientesPage() {
  const { barbershop } = useAuth();
  const { clients, isLoading } = useDerivedClients(barbershop?.id);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q),
    );
  }, [clients, search]);

  const summary = useMemo(() => {
    const totalClients = clients.length;
    const totalSpent = clients.reduce((acc, c) => acc + c.totalSpent, 0);
    const totalAppts = clients.reduce(
      (acc, c) => acc + c.totalAppointments,
      0,
    );
    const topClient = clients[0];
    return { totalClients, totalSpent, totalAppts, topClient };
  }, [clients]);

  return (
    <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
      <PageHeader
        title="Clientes"
        subtitle="Lista de clientes derivada dos agendamentos"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard
          label="Clientes"
          value={isLoading ? "…" : String(summary.totalClients)}
          icon={<Users className="size-3.5" />}
          tone="brand"
          emphasized
        />
        <SummaryCard
          label="Atendimentos"
          value={isLoading ? "…" : String(summary.totalAppts)}
          icon={<CalendarCheck className="size-3.5" />}
          tone="info"
        />
        <SummaryCard
          label="Faturamento"
          value={isLoading ? "…" : formatBRL(summary.totalSpent)}
          tone="success"
        />
        <SummaryCard
          label="Top Cliente"
          value={summary.topClient?.name ?? "—"}
          subtitle={
            summary.topClient
              ? `${summary.topClient.completedAppointments} atendimentos`
              : "Sem dados"
          }
          icon={<Trophy className="size-3.5" />}
        />
      </div>

      <div className="flex items-start gap-2 px-3 py-2.5 rounded-md bg-info-bg border border-info/30 text-xs text-info-foreground">
        <Info className="size-3.5 shrink-0 mt-0.5" />
        <p>
          A lista é montada automaticamente a partir dos agendamentos. O
          backend ainda não expõe rotas de cadastro de clientes — quando
          isso acontecer, esta página passará a ter CRUD completo.
        </p>
      </div>

      <Card className="bg-surface-raised border-border">
        <CardContent className="p-0">
          <div className="px-4 py-4 border-b border-border-subtle">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou e-mail..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-surface-base border-border text-foreground placeholder:text-muted-foreground h-9 text-sm focus-visible:ring-brand/40"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="border-t border-border">
                <TableRow className="border-border hover:bg-transparent">
                  {[
                    "Cliente",
                    "Contato",
                    "Atendimentos",
                    "Total gasto",
                    "Última visita",
                    "Próxima visita",
                  ].map((col) => (
                    <TableHead
                      key={col}
                      className="text-muted-foreground text-xs uppercase tracking-wider font-semibold px-4 py-3 h-auto"
                    >
                      {col}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow className="border-border hover:bg-transparent">
                    <TableCell
                      colSpan={6}
                      className="py-12 text-center text-sm text-text-faint"
                    >
                      Carregando…
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow className="border-border hover:bg-transparent">
                    <TableCell colSpan={6} className="py-4">
                      <EmptyState
                        message={
                          clients.length === 0
                            ? "Nenhum cliente. Crie agendamentos para popular a lista."
                            : "Nenhum cliente corresponde à busca."
                        }
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((c) => (
                    <TableRow
                      key={c.id}
                      className="border-border hover:bg-surface-elevated/50 transition-colors"
                    >
                      <TableCell className="px-4 py-4 font-semibold text-foreground text-sm">
                        {c.name}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-muted-foreground text-xs">
                        <div className="flex items-center gap-1.5">
                          <Mail className="size-3" />
                          {c.email}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-4 text-muted-foreground text-sm">
                        <span className="font-semibold text-foreground">
                          {c.completedAppointments}
                        </span>
                        <span className="text-text-faint">
                          {" "}/ {c.totalAppointments}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-4 text-success-foreground font-semibold text-sm">
                        {formatBRL(c.totalSpent)}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-muted-foreground text-sm">
                        {c.lastVisit ? formatDate(c.lastVisit) : "—"}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-sm">
                        {c.upcomingVisit ? (
                          <span className="flex items-center gap-1.5 text-info-foreground">
                            <Clock className="size-3" />
                            {formatDate(c.upcomingVisit)}
                          </span>
                        ) : (
                          <span className="text-text-faint">—</span>
                        )}
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
