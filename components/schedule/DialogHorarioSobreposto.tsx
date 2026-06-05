"use client";

import { AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export interface ConflitoHorario {
  profissionalNome: string;
  /** "HH:mm – HH:mm" */
  horario: string;
  servicoNome: string;
}

export function DialogHorarioSobreposto({
  open,
  onOpenChange,
  conflitos,
  onAgendarMesmoAssim,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  conflitos: ConflitoHorario[];
  onAgendarMesmoAssim: () => void;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-surface-raised border border-border text-foreground sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-warning/15 text-warning-foreground">
            <AlertTriangle />
          </AlertDialogMedia>
          <AlertDialogTitle>Horário sobreposto</AlertDialogTitle>
          <AlertDialogDescription>
            Já existe agendamento conflitante no horário escolhido:
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2">
          {conflitos.map((c, i) => (
            <div
              key={i}
              className="rounded-lg border border-warning/30 bg-warning/5 p-3 text-sm"
            >
              Já existe um agendamento para o profissional{" "}
              <span className="font-bold text-foreground">
                {c.profissionalNome}
              </span>{" "}
              nesse horário{" "}
              <span className="font-bold text-foreground">{c.horario}</span>{" "}
              <span className="text-muted-foreground">({c.servicoNome})</span>.
            </div>
          ))}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Voltar e ajustar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onAgendarMesmoAssim}
            className="bg-brand text-brand-foreground hover:bg-brand-hover"
          >
            Agendar mesmo assim
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
