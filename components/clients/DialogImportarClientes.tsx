"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Download, Upload, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { clientsService, type ClientImportResult } from "@/services/clients.service";

/** Cabeçalho + uma linha de exemplo — mesmos campos aceitos pela importação. */
const TEMPLATE_CSV =
  "Nome,Data de nascimento,E-mail,Telefone,CPF,Como nos conheceu\n" +
  "Maria Silva,15/03/1990,maria@exemplo.com,11999998888,12345678900,Instagram\n";

function downloadTemplate() {
  const blob = new Blob([TEMPLATE_CSV], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "modelo-importacao-clientes.csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * Importação de clientes via planilha CSV (spec-revisao-cliente-4.md §6.3).
 * Campos obrigatórios por linha: Nome, Data de nascimento, E-mail, Telefone
 * e CPF — "Como nos conheceu" é aceito mas não bloqueia a linha se faltar.
 */
export function DialogImportarClientes({
  open,
  onOpenChange,
  barbershopId,
  onImported,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  barbershopId: string | undefined;
  onImported: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ClientImportResult | null>(null);

  function reset() {
    setFile(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleImport() {
    if (!barbershopId || !file) return;
    setSubmitting(true);
    try {
      const res = await clientsService.importCsv(barbershopId, file);
      setResult(res);
      if (res.created > 0) onImported();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha ao importar clientes.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="bg-surface-raised border border-border text-foreground max-w-lg p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border-subtle">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-bold">Importar clientes</DialogTitle>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="size-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4">
          <p className="text-sm text-muted-foreground">
            Arquivo CSV com as colunas{" "}
            <strong className="text-foreground">
              Nome, Data de nascimento, E-mail, Telefone e CPF
            </strong>{" "}
            (obrigatórias) e &quot;Como nos conheceu&quot; (opcional). Linhas com e-mail já cadastrado são
            puladas.
          </p>

          <button
            type="button"
            onClick={downloadTemplate}
            className="h-9 px-4 rounded-md border border-border bg-surface-base text-sm text-foreground hover:bg-surface-elevated transition-colors flex items-center gap-1.5"
          >
            <Download className="size-3.5" />
            Baixar modelo
          </button>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-brand">
              Arquivo (.csv)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => {
                setFile(e.target.files?.[0] ?? null);
                setResult(null);
              }}
              className="block w-full text-sm text-foreground file:mr-3 file:h-9 file:px-4 file:rounded-md file:border-0 file:bg-brand file:text-brand-foreground file:text-sm file:font-bold file:cursor-pointer"
            />
          </div>

          {result && (
            <div className="rounded-md border border-border-subtle bg-surface-base p-3 space-y-2">
              <p className="text-sm text-foreground">
                <strong className="text-success">{result.created}</strong> criado(s) ·{" "}
                <strong className="text-muted-foreground">{result.skipped}</strong> ignorado(s)
                (duplicado) ·{" "}
                <strong className="text-danger-foreground">{result.errors.length}</strong> com
                erro, de {result.total} linha(s).
              </p>
              {result.errors.length > 0 && (
                <ul className="max-h-40 overflow-y-auto space-y-1 text-xs text-muted-foreground">
                  {result.errors.map((e) => (
                    <li key={e.line}>
                      Linha {e.line} ({e.email || "sem e-mail"}): {e.reason}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div className="px-6 pb-6 pt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-10 px-4 rounded-md text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            Fechar
          </button>
          <button
            type="button"
            onClick={() => void handleImport()}
            disabled={!file || submitting}
            className="h-10 px-4 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors disabled:opacity-60 flex items-center gap-1.5"
          >
            <Upload className="size-3.5" />
            {submitting ? "Importando…" : "Importar"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
