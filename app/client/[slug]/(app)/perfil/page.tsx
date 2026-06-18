"use client";

import { useState } from "react";
import { User as UserIcon, Pencil } from "lucide-react";
import { ClientProfileCard } from "@/components/client/ClientProfileCard";
import { ClientProfileForm } from "@/components/client/ClientProfileForm";
import { InstallAppButton } from "@/components/client/InstallAppButton";
import { GoogleCalendarButton } from "@/components/client/GoogleCalendarButton";
import { TwoFactorButton } from "@/components/client/TwoFactorButton";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/shared/Loading";
import { useClientAuth } from "@/hooks/useClientAuth";

export default function PerfilClientePage() {
  const { client, isLoading } = useClientAuth();
  const [editing, setEditing] = useState(false);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <h1 className="text-2xl font-bold tracking-tight shrink-0">
          Meu perfil
        </h1>
      </div>

      {isLoading ? (
        <Loading />
      ) : client ? (
        editing ? (
          <ClientProfileForm
            client={client}
            onCancel={() => setEditing(false)}
            onSaved={() => setEditing(false)}
          />
        ) : (
          <ClientProfileCard client={client} />
        )
      ) : (
        <div className="rounded-lg border border-border-subtle bg-surface-raised p-12 text-center space-y-2">
          <UserIcon className="size-8 text-text-faint mx-auto" />
          <p className="text-sm text-muted-foreground">
            Sessão não encontrada. Faça login novamente.
          </p>
        </div>
      )}
    </div>
  );
}
