"use client";

import { useState, useRef } from "react";
import { Upload, X, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { fromCSV } from "@/utils/csv";

export interface ImportedRow {
  [key: string]: string;
}

interface ImportCSVDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  /**
   * Colunas esperadas no CSV. Se ausentes na primeira linha, aborta com erro.
   */
  expectedColumns: string[];
  /**
   * Chamado com as linhas parseadas após o usuário confirmar.
   * Retorne quantos registros foram efetivamente importados (para feedback).
   */
  onImport: (rows: ImportedRow[]) => Promise<number> | number;
  title?: string;
  description?: string;
}

export function ImportCSVDialog({
  open,
  onOpenChange,
  expectedColumns,
  onImport,
  title = "Importar CSV",
  description = "Selecione um arquivo CSV. A primeira linha deve conter o cabeçalho.",
}: ImportCSVDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportedRow[]>([]);
  const [missingCols, setMissingCols] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function reset() {
    setFile(null);
    setPreview([]);
    setMissingCols([]);
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleClose(v: boolean) {
    if (!v) reset();
    onOpenChange(v);
  }

  async function handleFile(f: File) {
    if (!f.name.toLowerCase().endsWith(".csv")) {
      toast.error("Arquivo precisa ter extensão .csv");
      return;
    }
    const text = await f.text();
    const rows = fromCSV(text);
    if (rows.length === 0) {
      toast.error("CSV vazio ou inválido.");
      return;
    }
    const headers = Object.keys(rows[0]);
    const missing = expectedColumns.filter((c) => !headers.includes(c));
    setFile(f);
    setPreview(rows.slice(0, 5));
    setMissingCols(missing);
  }

  async function handleConfirm() {
    if (!file || missingCols.length > 0) return;
    setSubmitting(true);
    try {
      const text = await file.text();
      const allRows = fromCSV(text);
      const imported = await onImport(allRows);
      toast.success(`${imported} registro(s) importado(s).`);
      handleClose(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Falha na importação.");
    } finally {
      setSubmitting(false);
    }
  }

  const isReady = file !== null && missingCols.length === 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-surface-raised border border-border text-foreground max-w-lg p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border-subtle">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-bold">{title}</DialogTitle>
            <button
              type="button"
              onClick={() => handleClose(false)}
              className="size-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4">
          <p className="text-xs text-muted-foreground">{description}</p>

          <div className="text-[10px] font-bold uppercase tracking-widest text-brand">
            Colunas esperadas
          </div>
          <div className="flex flex-wrap gap-1.5">
            {expectedColumns.map((c) => (
              <span
                key={c}
                className="text-[10px] font-mono px-2 py-1 rounded bg-surface-base border border-border text-muted-foreground"
              >
                {c}
              </span>
            ))}
          </div>

          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleFile(f);
            }}
          />

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-full h-32 rounded-md border-2 border-dashed border-border bg-surface-base hover:border-brand/40 hover:bg-surface-elevated/30 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground"
          >
            {file ? (
              <>
                <FileText className="size-8 text-brand" />
                <span className="text-sm font-semibold text-foreground">
                  {file.name}
                </span>
                <span className="text-[10px]">
                  {(file.size / 1024).toFixed(1)} KB · {preview.length}+
                  registro(s) detectados
                </span>
              </>
            ) : (
              <>
                <Upload className="size-8 opacity-50" />
                <span className="text-sm">Clique para selecionar um CSV</span>
              </>
            )}
          </button>

          {missingCols.length > 0 && (
            <div className="flex items-start gap-2 px-3 py-2 rounded-md bg-danger/10 border border-danger/30">
              <AlertCircle className="size-4 text-danger-foreground mt-0.5 shrink-0" />
              <div className="text-xs text-danger-foreground">
                Colunas obrigatórias ausentes:{" "}
                <span className="font-mono">{missingCols.join(", ")}</span>
              </div>
            </div>
          )}

          {isReady && preview.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs text-success-foreground">
                <CheckCircle2 className="size-3.5" />
                <span>Cabeçalho válido. Primeiras linhas:</span>
              </div>
              <div className="bg-surface-base border border-border rounded-md overflow-hidden">
                <div className="overflow-x-auto max-h-40">
                  <table className="text-[10px] w-full">
                    <thead className="bg-surface-elevated">
                      <tr>
                        {expectedColumns.map((c) => (
                          <th
                            key={c}
                            className="px-2 py-1.5 text-left text-muted-foreground font-bold whitespace-nowrap"
                          >
                            {c}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map((row, i) => (
                        <tr
                          key={i}
                          className="border-t border-border-subtle"
                        >
                          {expectedColumns.map((c) => (
                            <td
                              key={c}
                              className="px-2 py-1 text-foreground whitespace-nowrap"
                            >
                              {row[c] || "—"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 pb-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => handleClose(false)}
            className="h-9 px-5 rounded-md border border-border bg-transparent text-sm text-foreground hover:bg-surface-elevated transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={!isReady || submitting}
            onClick={handleConfirm}
            className="h-9 px-5 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Importando..." : "Importar"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
