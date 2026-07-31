"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader, Loading } from "@/components/shared";
import { useAuth } from "@/hooks/useAuth";
import { useBankAccounts } from "@/hooks/useBankAccounts";
import { BankAccountForm } from "@/components/financial/BankAccountForm";
import type { BankAccount } from "@/types/bank-account.types";

export default function EditarContaBancariaPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const isView = searchParams.get("mode") === "view";

  const { barbershop } = useAuth();
  const { accounts, isLoading, update } = useBankAccounts(barbershop?.id);
  const [saving, setSaving] = useState(false);
  const [account, setAccount] = useState<BankAccount | null>(null);

  useEffect(() => {
    const found = accounts.find((a) => a.id === params.id);
    if (found) setAccount(found);
  }, [accounts, params.id]);

  async function handleSubmit(payload: Parameters<typeof update>[1]) {
    setSaving(true);
    const updated = await update(params.id, payload);
    setSaving(false);
    if (updated) router.push("/financial/contas-bancarias");
  }

  return (
    <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
      <PageHeader
        title={isView ? "Visualizar conta bancária" : "Editar conta bancária"}
        subtitle={account?.name}
        actions={
          <Link
            href="/financial/contas-bancarias"
            className="h-9 px-4 rounded-md border border-border bg-surface-raised text-sm text-foreground hover:bg-surface-elevated transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="size-3.5" />
            Voltar
          </Link>
        }
      />

      {isLoading && !account ? (
        <Loading />
      ) : (
        <BankAccountForm
          mode={isView ? "view" : "edit"}
          account={account}
          saving={saving}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
