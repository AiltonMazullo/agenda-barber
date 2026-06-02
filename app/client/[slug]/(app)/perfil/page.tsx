"use client";

import { useState } from "react";
import { User as UserIcon, Pencil } from "lucide-react";
import { ClientProfileCard } from "@/components/client/ClientProfileCard";
import { ClientProfileForm } from "@/components/client/ClientProfileForm";
import { Button } from "@/components/ui/button";
import { useClientAuth } from "@/hooks/useClientAuth";

export default function PerfilClientePage() {
  const { client, isLoading } = useClientAuth();
  const [editing, setEditing] = useState(false);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Meu perfil</h1>
        {client && !editing && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setEditing(true)}
            className="cursor-pointer"
          >
            <Pencil className="size-4 mr-1.5" />
            Editar
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground text-sm">
          Carregando…
        </div>
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
