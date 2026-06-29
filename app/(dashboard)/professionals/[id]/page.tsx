"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loading } from "@/components/shared";
import { ProfessionalForm, type ProfessionalBasic } from "@/components/professionals";
import { useAuth } from "@/hooks/useAuth";
import { useEmployees } from "@/hooks/useEmployees";
import { useServices } from "@/hooks/useServices";
import { useCategories } from "@/hooks/useCategories";
import { useProfessionalConfig } from "@/hooks/useProfessionalConfig";
import { apiAssetUrl } from "@/lib/api";
import { employeesService } from "@/services/employees.service";
import {
  defaultWorkingHours,
  type ProfessionalConfig,
} from "@/types/professional-config.types";
import type { EmployeeSchedule, UpdateEmployeePayload } from "@/types/employee.types";

export default function ProfessionalEditPage() {
  const params = useParams<{ id: string }>();
  const id = String(params.id);
  const router = useRouter();

  const { barbershop } = useAuth();
  const { employees, isLoading, update, setFeatured, setHidden, uploadAvatar } =
    useEmployees(barbershop?.id);
  const { services } = useServices(barbershop?.id);
  const { categories } = useCategories(barbershop?.id);
  const { config, loaded, save } = useProfessionalConfig(barbershop?.id, id);

  const [backendSchedules, setBackendSchedules] = useState<EmployeeSchedule[]>([]);
  const [schedulesLoaded, setSchedulesLoaded] = useState(false);

  useEffect(() => {
    if (!barbershop?.id || !id) return;
    employeesService
      .getSchedules(barbershop.id, id)
      .then((data) => setBackendSchedules(data))
      .catch(() => {})
      .finally(() => setSchedulesLoaded(true));
  }, [barbershop?.id, id]);

  const employee = employees.find((e) => e.id === id);

  if (isLoading || !loaded || !schedulesLoaded) {
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

  // Backend schedules are the source of truth for working hours.
  // Days absent from the backend response are treated as disabled.
  const effectiveConfig: ProfessionalConfig = {
    ...config,
    workingHours: defaultWorkingHours().map((wh) => {
      const s = backendSchedules.find((bs) => bs.dayOfWeek === wh.day);
      return s
        ? { day: wh.day, enabled: true, start: s.startTime, end: s.endTime }
        : { ...wh, enabled: false };
    }),
  };

  async function handleSave(basic: ProfessionalBasic, cfg: ProfessionalConfig) {
    if (!employee || !barbershop) return;

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

    const schedulesToSave = cfg.workingHours
      .filter((wh) => wh.enabled)
      .map((wh) => ({ dayOfWeek: wh.day, startTime: wh.start, endTime: wh.end }));

    const [updated] = await Promise.all([
      update(employee.id, payload),
      employeesService.updateSchedules(barbershop.id, employee.id, schedulesToSave).catch(() => {
        toast.error("Falha ao salvar os horários de atendimento.");
      }),
    ]);

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
      categories={categories}
      initialConfig={effectiveConfig}
      onSave={handleSave}
      onBack={() => router.push("/professionals")}
      featured={employee.featured}
      onFeaturedChange={(v) => setFeatured(employee.id, v)}
      hidden={employee.hidden}
      onHiddenChange={(v) => setHidden(employee.id, v)}
      photoUrl={apiAssetUrl(employee.avatarUrl)}
      onUploadPhoto={(file) => void uploadAvatar(employee.id, file)}
    />
  );
}
