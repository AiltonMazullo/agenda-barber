"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader, SelectField } from "@/components/shared";
import { useAuth } from "@/hooks/useAuth";
import { useBranches } from "@/hooks/useBranches";
import { useHorariosPico } from "@/hooks/useHorariosPico";
import { PeakHoursHeatmap } from "@/components/reports/PeakHoursHeatmap";

export default function HorariosDePicoPage() {
  const { barbershop } = useAuth();
  const { branches } = useBranches(barbershop?.id);
  const { isLoading, buildGrid, employeesForBranch } = useHorariosPico(
    barbershop?.id,
  );

  // Filtros em rascunho: só valem para o grid depois de "Aplicar".
  const [draftFilial, setDraftFilial] = useState("todas");
  const [draftProfissional, setDraftProfissional] = useState("todos");
  const [filial, setFilial] = useState("todas");
  const [profissional, setProfissional] = useState("todos");

  const draftEmployees = useMemo(
    () => employeesForBranch(draftFilial),
    [employeesForBranch, draftFilial],
  );

  function handleFilialChange(value: string) {
    setDraftFilial(value);
    // Filial mudou: descarta o profissional selecionado se ele não pertencer a ela.
    setDraftProfissional("todos");
  }

  const filialOptions = [
    { value: "todas", label: "Todas" },
    ...branches.map((b) => ({ value: b.id, label: b.name })),
  ];

  const profissionalOptions = [
    { value: "todos", label: "Todos" },
    ...draftEmployees.map((e) => ({ value: e.id, label: e.name })),
  ];

  function handleAplicar() {
    setFilial(draftFilial);
    setProfissional(draftProfissional);
  }

  const grid = useMemo(
    () => buildGrid(filial, profissional),
    [buildGrid, filial, profissional],
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Horários de Pico"
        subtitle="Mapa de calor dos agendamentos por dia da semana e horário"
      />

      <Card className="bg-surface-raised border-border">
        <CardContent className="p-4">
          <h2 className="text-sm font-semibold text-foreground mb-3">
            Filtros
          </h2>
          <div className="flex flex-wrap items-end gap-3">
            <SelectField
              id="horarios-pico-filial"
              label="Filial"
              value={draftFilial}
              options={filialOptions}
              onChange={handleFilialChange}
              className="w-56"
            />
            <SelectField
              id="horarios-pico-profissional"
              label="Profissional"
              value={draftProfissional}
              options={profissionalOptions}
              onChange={setDraftProfissional}
              className="w-56"
            />
            <button
              type="button"
              onClick={handleAplicar}
              className="h-10 px-6 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors"
            >
              Aplicar
            </button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-surface-raised border-border">
        <CardContent className="p-4 space-y-1">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Agendamentos
            </h2>
            <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
          </div>
          <div className="pt-3">
            <PeakHoursHeatmap grid={grid} isLoading={isLoading} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
