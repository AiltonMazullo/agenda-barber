"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { Service } from "@/types/service.types";
import type { ProfessionalConfig } from "@/types/professional-config.types";
import type { ProfessionalBasic } from "./types";
import { StatusBar } from "./StatusBar";
import { IdentificacaoTipo } from "./IdentificacaoTipo";
import { MidiaDocumentos } from "./MidiaDocumentos";
import { AreaProfissional } from "./AreaProfissional";
import { PermissoesSistema } from "./PermissoesSistema";
import { ServicosComissao } from "./ServicosComissao";
import { HorariosAtendimento } from "./HorariosAtendimento";
import { Intervalos } from "./Intervalos";
import { Folgas } from "./Folgas";
import { RegrasComissao } from "./RegrasComissao";

export function ProfessionalForm({
  initialBasic,
  services,
  initialConfig,
  onSave,
  onBack,
  featured,
  onFeaturedChange,
  hidden,
  onHiddenChange,
  photoUrl,
  onUploadPhoto,
}: {
  initialBasic: ProfessionalBasic;
  services: Service[];
  initialConfig: ProfessionalConfig;
  onSave: (basic: ProfessionalBasic, config: ProfessionalConfig) => Promise<void>;
  onBack: () => void;
  /** Destaque (campo do backend). Só aparece quando há `onFeaturedChange`. */
  featured?: boolean;
  onFeaturedChange?: (value: boolean) => void;
  /** Oculto (campo do backend). Só conecta ao backend quando há `onHiddenChange`. */
  hidden?: boolean;
  onHiddenChange?: (value: boolean) => void;
  /** Foto vinda do backend (avatarUrl completo). Tem prioridade no preview. */
  photoUrl?: string | null;
  /** Upload real da foto (rota de avatar). Sem ele, preview local. */
  onUploadPhoto?: (file: File) => void | Promise<void>;
}) {
  const [basic, setBasic] = useState<ProfessionalBasic>(initialBasic);
  const [config, setConfig] = useState<ProfessionalConfig>(initialConfig);
  const [saving, setSaving] = useState(false);

  const updateBasic = (patch: Partial<ProfessionalBasic>) =>
    setBasic((p) => ({ ...p, ...patch }));
  const updateConfig = (patch: Partial<ProfessionalConfig>) =>
    setConfig((p) => ({ ...p, ...patch }));

  const isProfissional = config.type === "profissional";

  async function handleSave() {
    if (basic.name.trim().length < 2)
      return toast.error("Informe o nome completo.");
    if (basic.appName.trim().length < 2)
      return toast.error("Informe o nome no app.");
    if (!basic.email.trim()) return toast.error("Informe o e-mail.");
    if (basic.phone.replace(/\D/g, "").length < 10)
      return toast.error("Telefone inválido.");

    setSaving(true);
    try {
      await onSave(basic, config);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-surface-base min-h-screen text-foreground">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-border bg-surface-base px-4 md:px-6 py-3">
        <div>
          <h1 className="text-lg font-bold">Cadastro do Profissional</h1>
          <p className="text-xs text-muted-foreground">
            Cadastre e configure os dados e permissões do profissional.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="h-9 border-border bg-surface-raised hover:bg-surface-elevated"
          >
            <ArrowLeft className="size-3.5 mr-1.5" />
            Voltar
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="h-9 bg-brand hover:bg-brand-hover text-brand-foreground font-bold disabled:opacity-60"
          >
            {saving ? "Salvando…" : "Salvar"}
          </Button>
        </div>
      </div>

      <div className="p-4 md:p-6 space-y-5">
        <StatusBar
          active={config.active}
          hidden={hidden ?? config.hidden}
          onChange={updateConfig}
          onHiddenChange={onHiddenChange}
          featured={featured}
          onFeaturedChange={onFeaturedChange}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <IdentificacaoTipo
            basic={basic}
            onBasic={updateBasic}
            type={config.type}
            onType={(t) => updateConfig({ type: t })}
          />
          <MidiaDocumentos
            photoDataUrl={photoUrl ?? config.photoDataUrl}
            emergencyContactName={config.emergencyContactName}
            emergencyContactPhone={config.emergencyContactPhone}
            contractFileName={config.contractFileName}
            onChange={updateConfig}
            onUploadPhoto={onUploadPhoto}
          />
        </div>

        {isProfissional && (
          <AreaProfissional
            attendancePeriodDays={config.attendancePeriodDays}
            onChange={(days) => updateConfig({ attendancePeriodDays: days })}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <PermissoesSistema
            permissions={config.permissions}
            onChange={(patch) =>
              updateConfig({
                permissions: { ...config.permissions, ...patch },
              })
            }
          />
          {isProfissional && (
            <ServicosComissao
              services={config.services}
              allServices={services}
              onChange={(next) => updateConfig({ services: next })}
            />
          )}
        </div>

        {isProfissional && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <HorariosAtendimento
                workingHours={config.workingHours}
                onChange={(next) => updateConfig({ workingHours: next })}
              />
              <Intervalos
                intervals={config.intervals}
                onChange={(next) => updateConfig({ intervals: next })}
              />
            </div>

            <Folgas
              timeOff={config.timeOff}
              onChange={(next) => updateConfig({ timeOff: next })}
            />

            <RegrasComissao
              productCommission={config.productCommission}
              differentiated={config.differentiated}
              onChange={updateConfig}
            />
          </>
        )}
      </div>
    </div>
  );
}
