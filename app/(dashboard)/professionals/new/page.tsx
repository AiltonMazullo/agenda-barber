"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loading } from "@/components/shared";
import { ProfessionalForm, type ProfessionalBasic } from "@/components/professionals";
import { useAuth } from "@/hooks/useAuth";
import { useEmployees } from "@/hooks/useEmployees";
import { useBranches } from "@/hooks/useBranches";
import { useAccessGroups } from "@/hooks/useAccessGroups";
import { useServices } from "@/hooks/useServices";
import { useCategories } from "@/hooks/useCategories";
import { professionalConfigStore } from "@/lib/professional-config-store";
import {
  defaultProfessionalConfig,
  type ProfessionalConfig,
} from "@/types/professional-config.types";
import { employeesService } from "@/services/employees.service";
import type { CreateEmployeePayload } from "@/types/employee.types";

const EMPTY_BASIC: ProfessionalBasic = {
  name: "",
  appName: "",
  cpf: "",
  birthDate: "",
  email: "",
  phone: "",
  pixKey: "",
  hasBranchAccess: false,
};

export default function ProfessionalNovoPage() {
  const router = useRouter();
  const { barbershop } = useAuth();
  const { create, uploadAvatar } = useEmployees(barbershop?.id);
  const { branches } = useBranches(barbershop?.id);
  const { groups } = useAccessGroups(barbershop?.id);
  const { services } = useServices(barbershop?.id);
  const { categories } = useCategories(barbershop?.id);

  // Foto escolhida antes do profissional existir: preview local agora,
  // upload real logo após o create (quando há ID pra rota de avatar).
  const pendingPhoto = useRef<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  function handlePhotoSelected(file: File) {
    pendingPhoto.current = file;
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(String(reader.result));
    reader.readAsDataURL(file);
  }

  if (!barbershop) {
    return (
      <div className="min-h-screen bg-surface-base grid place-items-center">
        <Loading />
      </div>
    );
  }

  async function handleSave(basic: ProfessionalBasic, config: ProfessionalConfig) {
    if (!barbershop) return;
    // O backend exige filial + endereço; usamos a filial principal (de
    // recebimentos) ou a primeira como padrão, herdando o endereço dela.
    const branch = branches.find((b) => b.isReceivingBranch) ?? branches[0];
    if (!branch) {
      toast.error(
        "Cadastre uma filial em Configurações antes de criar um profissional.",
      );
      return;
    }

    const payload: CreateEmployeePayload = {
      name: basic.name.trim(),
      appName: basic.appName.trim(),
      email: basic.email.trim().toLowerCase(),
      password: `Tmp${Math.random().toString(36).slice(2, 10)}`,
      phone: basic.phone.trim(),
      branchId: branch.id,
      pixKey: basic.pixKey.trim(),
      cpf: basic.cpf.trim() || undefined,
      birthDate: basic.birthDate
        ? new Date(`${basic.birthDate}T00:00:00`).toISOString()
        : undefined,
      hasBranchAccess: basic.hasBranchAccess,
      permissions: config.permissions,
      accessGroupId: groups[0]?.id,
      cep: branch.cep,
      street: branch.street,
      neighborhood: branch.neighborhood,
      city: branch.city,
      uf: branch.uf,
      number: branch.number,
      complement: branch.complement ?? undefined,
    };

    const created = await create(payload);
    if (created) {
      const schedulesToSave = config.workingHours
        .filter((wh) => wh.enabled)
        .map((wh) => ({ dayOfWeek: wh.day, startTime: wh.start, endTime: wh.end }));

      await Promise.all([
        employeesService.updateSchedules(barbershop.id, created.id, schedulesToSave).catch(() => {}),
        config.services.length > 0
          ? employeesService.updateServices(barbershop.id, created.id, config.services).catch(() => {})
          : Promise.resolve(),
        config.timeOff.length > 0
          ? employeesService
              .updateTimeOff(
                barbershop.id,
                created.id,
                config.timeOff.map((t) => ({ startDate: t.start, endDate: t.end })),
              )
              .catch(() => {})
          : Promise.resolve(),
      ]);

      professionalConfigStore.set(barbershop.id, created.id, {
        ...config,
        photoDataUrl: photoPreview ?? config.photoDataUrl,
      });
      if (pendingPhoto.current) {
        await uploadAvatar(created.id, pendingPhoto.current);
      }
      router.push(`/professionals/${created.id}`);
    }
  }

  return (
    <ProfessionalForm
      initialBasic={EMPTY_BASIC}
      services={services}
      categories={categories}
      initialConfig={defaultProfessionalConfig()}
      onSave={handleSave}
      onBack={() => router.push("/professionals")}
      photoUrl={photoPreview}
      onUploadPhoto={handlePhotoSelected}
    />
  );
}
