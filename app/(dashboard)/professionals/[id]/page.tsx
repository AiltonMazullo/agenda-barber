"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loading } from "@/components/shared";
import { ProfessionalForm, type ProfessionalBasic } from "@/components/professionals";
import { useAuth } from "@/hooks/useAuth";
import { useEmployees } from "@/hooks/useEmployees";
import { useServices } from "@/hooks/useServices";
import { useProfessionalConfig } from "@/hooks/useProfessionalConfig";
import type { ProfessionalConfig } from "@/types/professional-config.types";
import type { UpdateEmployeePayload } from "@/types/employee.types";

export default function ProfessionalEditPage() {
  const params = useParams<{ id: string }>();
  const id = String(params.id);
  const router = useRouter();

  const { barbershop } = useAuth();
  const { employees, isLoading, update } = useEmployees(barbershop?.id);
  const { services } = useServices(barbershop?.id);
  const { config, loaded, save } = useProfessionalConfig(barbershop?.id, id);

  const employee = employees.find((e) => e.id === id);

  if (isLoading || !loaded) {
    return (
      <div className="min-h-screen bg-surface-base grid place-items-center">
        <Loading label="Carregando profissional" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-surface-base grid place-items-center text-center p-6">
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Profissional não encontrado.
          </p>
          <Link
            href="/professionals"
            className="text-brand text-sm font-semibold hover:underline"
          >
            Voltar para a lista
          </Link>
        </div>
      </div>
    );
  }

  async function handleSave(basic: ProfessionalBasic, cfg: ProfessionalConfig) {
    if (!employee) return;
    const payload: UpdateEmployeePayload = {
      name: basic.name.trim(),
      appName: basic.appName.trim(),
      email: basic.email.trim().toLowerCase(),
      phone: basic.phone.trim(),
      pixKey: basic.pixKey.trim(),
      cpf: basic.cpf.trim() || undefined,
      birthDate: basic.birthDate
        ? new Date(`${basic.birthDate}T00:00:00`).toISOString()
        : undefined,
      hasBranchAccess: basic.hasBranchAccess,
    };
    const updated = await update(employee.id, payload);
    const persisted = save(cfg);
    if (!persisted) {
      toast.error(
        "As configurações locais não couberam no armazenamento (foto muito grande?).",
      );
    }
    if (updated) router.push("/professionals");
  }

  const initialBasic: ProfessionalBasic = {
    name: employee.name,
    appName: employee.appName,
    cpf: employee.cpf ?? "",
    birthDate: employee.birthDate ? employee.birthDate.slice(0, 10) : "",
    email: employee.email,
    phone: employee.phone,
    pixKey: employee.pixKey,
    hasBranchAccess: employee.hasBranchAccess,
  };

  return (
    <ProfessionalForm
      key={employee.id}
      initialBasic={initialBasic}
      services={services}
      initialConfig={config}
      onSave={handleSave}
      onBack={() => router.push("/professionals")}
    />
  );
}
