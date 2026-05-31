"use client";

import {
  User,
  Mail,
  Phone,
  Cake,
  IdCard,
  MapPin,
  Home,
} from "lucide-react";
import { formatDate, formatPhone } from "@/utils/format";
import type { Client } from "@/types/client.types";

function Row({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-brand mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
        <p className="text-sm text-foreground break-words">
          {value && value.trim() ? value : "—"}
        </p>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border-subtle bg-surface-raised p-5 space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-widest text-brand">
        {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
    </section>
  );
}

export function ClientProfileCard({ client }: { client: Client }) {
  const enderecoLinha1 = [
    client.street,
    client.number,
    client.complement,
  ]
    .filter((p) => p && p.trim())
    .join(", ");

  const cidadeUf = [client.city, client.uf]
    .filter((p) => p && p.trim())
    .join(" / ");

  return (
    <div className="space-y-4">
      <Section title="Dados pessoais">
        <Row
          icon={<User className="size-4" />}
          label="Nome"
          value={client.name}
        />
        <Row
          icon={<Mail className="size-4" />}
          label="E-mail"
          value={client.email}
        />
        <Row
          icon={<Phone className="size-4" />}
          label="Telefone"
          value={client.phone ? formatPhone(client.phone) : null}
        />
        <Row
          icon={<Cake className="size-4" />}
          label="Nascimento"
          value={client.birthDate ? formatDate(client.birthDate) : null}
        />
        <Row
          icon={<IdCard className="size-4" />}
          label="CPF"
          value={client.cpf}
        />
      </Section>

      <Section title="Endereço">
        <Row
          icon={<MapPin className="size-4" />}
          label="CEP"
          value={client.cep}
        />
        <Row
          icon={<Home className="size-4" />}
          label="Logradouro"
          value={enderecoLinha1 || null}
        />
        <Row
          icon={<MapPin className="size-4" />}
          label="Bairro"
          value={client.neighborhood}
        />
        <Row
          icon={<MapPin className="size-4" />}
          label="Cidade / UF"
          value={cidadeUf || null}
        />
      </Section>
    </div>
  );
}
