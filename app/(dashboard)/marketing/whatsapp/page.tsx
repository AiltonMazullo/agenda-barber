/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { CalendarCheck, Gift, Info, Ticket } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader, Loading } from "@/components/shared";
import { useAuth } from "@/hooks/useAuth";
import { useWhatsappSettings } from "@/hooks/useWhatsappSettings";
import { renderWhatsappPreview } from "@/utils/whatsapp-template";

interface TemplateSectionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  value: string;
  onChange: (value: string) => void;
  barbershopName?: string | null;
  barbershopPhone?: string | null;
}

function TemplateSection({
  icon,
  title,
  description,
  value,
  onChange,
  barbershopName,
  barbershopPhone,
}: TemplateSectionProps) {
  const previewLines = renderWhatsappPreview(value, {
    barbershopName,
    barbershopPhone,
  }).split("\n");

  return (
    <Card className="bg-surface-raised border-border">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-brand">{icon}</span>
          <div>
            <h2 className="text-sm font-bold text-white">{title}</h2>
            <p className="text-[11px] text-text-faint">{description}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Texto do template
            </label>
            <Textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="bg-surface-base border-border text-white placeholder:text-text-faint focus-visible:ring-[#f5b82e]/30 resize-none min-h-[160px] font-mono text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Preview
            </label>
            <div className="rounded-md bg-[#0b141a] border border-border p-4 min-h-[160px] flex items-start">
              <div className="max-w-[85%] rounded-lg rounded-tl-none bg-[#005c4b] px-3 py-2 text-sm text-white whitespace-pre-wrap break-words shadow">
                {previewLines.map((line, i) => (
                  <span key={i}>
                    {line}
                    {i < previewLines.length - 1 && <br />}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface TagInfo {
  tag: string;
  description: string;
}

const TAG_GROUPS: { title: string; tags: TagInfo[] }[] = [
  {
    title: "Tags universais",
    tags: [
      {
        tag: "#nome_cliente",
        description: "Nome do cliente que efetuou o agendamento",
      },
      {
        tag: "#cliente_primeiro_nome",
        description: "Primeiro nome do cliente que efetuou o agendamento",
      },
      { tag: "#email", description: "Email do cliente" },
      { tag: "#telefone_empresa", description: "Telefone da empresa" },
      { tag: "#nome_empresa", description: "Nome fantasia da empresa" },
    ],
  },
  {
    title: "Tags para mensagem de confirmação de agendamento",
    tags: [
      { tag: "#nome_profissional", description: "Nome do profissional" },
      {
        tag: "#profissional_primeiro_nome",
        description: "Primeiro nome do profissional",
      },
      { tag: "#data", description: "Data do agendamento" },
      { tag: "#hora", description: "Hora do agendamento" },
    ],
  },
  {
    title: "Tags para mensagem de plano pré-aprovado",
    tags: [{ tag: "#plano_nome", description: "Nome do plano" }],
  },
];

function DynamicDataCard() {
  return (
    <Card className="bg-surface-raised border-border">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Info className="size-4 text-brand" />
          <h2 className="text-sm font-bold text-white">Dados Dinâmicos</h2>
        </div>
        <p className="text-[11px] text-text-faint">
          Use as tags abaixo dentro do texto do template — elas são
          substituídas automaticamente pelos dados reais na hora do envio.
        </p>

        <div className="space-y-4">
          {TAG_GROUPS.map((group) => (
            <div key={group.title} className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-bold uppercase tracking-widest text-brand">
                  {group.title}
                </span>
                <div className="flex-1 h-px bg-border-subtle" />
              </div>
              <div className="space-y-1.5">
                {group.tags.map((t) => (
                  <div
                    key={t.tag}
                    className="flex flex-wrap items-center gap-2 rounded-md border border-border-subtle bg-surface-base px-3 py-2"
                  >
                    <code className="text-xs font-mono font-bold text-brand shrink-0">
                      {t.tag}
                    </code>
                    <span className="text-xs text-muted-foreground">
                      {t.description}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function WhatsappSettingsPage() {
  const { barbershop } = useAuth();
  const { data, isLoading, isSaving, save } = useWhatsappSettings(
    barbershop?.id,
  );

  const [confirmation, setConfirmation] = useState("");
  const [prePlan, setPrePlan] = useState("");
  const [birthday, setBirthday] = useState("");

  useEffect(() => {
    if (!data) return;
    setConfirmation(data.confirmationTemplate);
    setPrePlan(data.preApprovedPlanTemplate);
    setBirthday(data.birthdayTemplate);
  }, [data]);

  const dirty =
    !!data &&
    (confirmation !== data.confirmationTemplate ||
      prePlan !== data.preApprovedPlanTemplate ||
      birthday !== data.birthdayTemplate);

  async function handleSave() {
    await save({
      confirmationTemplate: confirmation,
      preApprovedPlanTemplate: prePlan,
      birthdayTemplate: birthday,
    });
  }

  if (isLoading || !data) {
    return <Loading label="Carregando configurações de WhatsApp" />;
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Configurações de WhatsApp"
        subtitle="Personalize os templates das mensagens automáticas enviadas por WhatsApp"
        actions={
          <button
            type="button"
            disabled={!dirty || isSaving}
            onClick={handleSave}
            className="h-9 px-5 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover hover:shadow-[0_0_16px_rgba(245,184,46,0.3)] transition-all disabled:opacity-60"
          >
            {isSaving ? "Salvando…" : "Salvar Alterações"}
          </button>
        }
      />

      <TemplateSection
        icon={<CalendarCheck className="size-4" />}
        title="Confirmação de Agendamento"
        description="Enviada ao cliente quando um agendamento é confirmado."
        value={confirmation}
        onChange={setConfirmation}
        barbershopName={barbershop?.name}
        barbershopPhone={barbershop?.phone}
      />

      <TemplateSection
        icon={<Ticket className="size-4" />}
        title="Link de Plano Pré-Aprovado"
        description="Enviada ao cliente com um plano pré-aprovado disponível."
        value={prePlan}
        onChange={setPrePlan}
        barbershopName={barbershop?.name}
        barbershopPhone={barbershop?.phone}
      />

      <TemplateSection
        icon={<Gift className="size-4" />}
        title="Mensagem de Aniversário"
        description="Enviada automaticamente no aniversário do cliente."
        value={birthday}
        onChange={setBirthday}
        barbershopName={barbershop?.name}
        barbershopPhone={barbershop?.phone}
      />

      <DynamicDataCard />
    </div>
  );
}
