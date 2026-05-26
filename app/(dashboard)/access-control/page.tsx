"use client";

import { Shield } from "lucide-react";
import { PageHeader, ComingSoon } from "@/components/shared";

export default function ControleAcessoPage() {
  return (
    <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
      <PageHeader
        title="Controle de Acesso"
        subtitle="Perfis, permissões e usuários do sistema"
      />
      <ComingSoon
        icon={<Shield className="size-6" />}
        title="Perfis e permissões"
        description="Em desenvolvimento. Em breve você definirá quem pode acessar o quê — por usuário, função ou filial."
        features={[
          "Perfis pré-definidos (Admin, Recepção, Profissional)",
          "Permissões granulares por módulo",
          "Acesso restrito por filial",
          "Auditoria de ações sensíveis",
        ]}
      />
    </div>
  );
}
