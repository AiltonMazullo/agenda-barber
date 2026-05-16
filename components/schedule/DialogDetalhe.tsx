"use client";

import { toast } from "sonner";
import {
  X,
  User,
  Phone,
  Scissors,
  Clock,
  Wifi,
  UserCheck,
  FileText,
  Trash2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  SERVICOS,
  PROFISSIONAIS,
  type Agendamento,
} from "@/mock/schedule";
import { getDuracao, minToTime } from "@/utils/schedule.utils";
import { InfoRow } from "@/components/schedule/InfoRow";

interface DialogDetalheProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  agendamento: Agendamento | null;
  onDelete: (id: string) => void;
}

export function DialogDetalhe({
  open,
  onOpenChange,
  agendamento,
  onDelete,
}: DialogDetalheProps) {
  if (!agendamento) return null;
  const servico = SERVICOS.find((s) => s.id === agendamento.servicoId)!;
  const prof = PROFISSIONAIS.find((p) => p.id === agendamento.profissionalId)!;
  const duracao = getDuracao(agendamento);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface-raised border border-border text-white max-w-sm p-0 gap-0">
        <div className={cn("h-1 w-full rounded-t-lg", servico.cor)} />
        <DialogHeader className="px-6 pt-4 pb-4 border-b border-border-subtle">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={cn("size-2 rounded-full", servico.cor)} />
              <DialogTitle className="text-base font-bold">
                {servico.nome}
              </DialogTitle>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="size-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-white hover:bg-surface-elevated transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        </DialogHeader>
        <div className="px-6 py-5 space-y-3">
          <InfoRow
            icon={<User className="size-3.5" />}
            label="Cliente"
            value={agendamento.cliente}
          />
          <InfoRow
            icon={<Phone className="size-3.5" />}
            label="Telefone"
            value={agendamento.telefone || "—"}
          />
          <InfoRow
            icon={<Scissors className="size-3.5" />}
            label="Profissional"
            value={prof.nome}
          />
          <InfoRow
            icon={<Clock className="size-3.5" />}
            label="Horário"
            value={`${minToTime(agendamento.inicioMin)} – ${minToTime(agendamento.inicioMin + duracao)} (${duracao}min)`}
          />
          <InfoRow
            icon={
              agendamento.origem === "online" ? (
                <Wifi className="size-3.5" />
              ) : (
                <UserCheck className="size-3.5" />
              )
            }
            label="Origem"
            value={agendamento.origem === "online" ? "Online" : "Recepção"}
          />
          {agendamento.observacao && (
            <InfoRow
              icon={<FileText className="size-3.5" />}
              label="Obs."
              value={agendamento.observacao}
            />
          )}
          <div className="pt-1 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Valor do serviço
            </span>
            <span className="text-sm font-bold text-emerald-400">
              R$ {servico.preco.toFixed(2).replace(".", ",")}
            </span>
          </div>
        </div>
        <div className="px-6 pb-6 flex justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              onDelete(agendamento.id);
              onOpenChange(false);
              toast.success("Agendamento removido.");
            }}
            className="h-9 px-4 rounded-md border border-red-500/30 bg-red-500/10 text-sm text-red-400 hover:bg-red-500/20 transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="size-3.5" />
            Remover
          </button>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-9 px-5 rounded-md border border-border bg-transparent text-sm text-white hover:bg-surface-elevated transition-colors"
          >
            Fechar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
