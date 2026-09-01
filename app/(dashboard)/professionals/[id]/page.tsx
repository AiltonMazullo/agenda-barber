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
import { useProducts } from "@/hooks/useProducts";
import { useAccessGroups } from "@/hooks/useAccessGroups";
import { usePermissionsCatalog } from "@/hooks/usePermissionsCatalog";
import { useProfessionalConfig } from "@/hooks/useProfessionalConfig";
import { apiAssetUrl } from "@/lib/api";
import { employeesService } from "@/services/employees.service";
import {
  defaultWorkingHours,
  type ProfessionalConfig,
} from "@/types/professional-config.types";
import type {
  EmployeeBreak,
  EmployeeDifferentiatedCommission,
  EmployeeProductCommissionRule,
  EmployeeSchedule,
  EmployeeService,
  EmployeeTimeOff,
  UpdateEmployeePayload,
} from "@/types/employee.types";
import {
  differentiatedCommissionFromBackend,
  differentiatedCommissionToPayload,
  productCommissionRuleFromBackend,
  productCommissionRuleToPayload,
} from "@/utils/employee-commission";
import { resolveProfessionalAccessGroupId } from "@/utils/professional-permissions";

export default function ProfessionalEditPage() {
  const params = useParams<{ id: string }>();
  const id = String(params.id);
  const router = useRouter();

  const { barbershop } = useAuth();
  const { employees, isLoading, update, setFeatured, setHidden, uploadAvatar } =
    useEmployees(barbershop?.id);
  const { services } = useServices(barbershop?.id);
  const { categories } = useCategories(barbershop?.id, "PRODUTO");
  const { products } = useProducts(barbershop?.id);
  const { groups, create: createAccessGroup, update: updateAccessGroup } =
    useAccessGroups(barbershop?.id);
  const { catalog: permissionsCatalog, isLoading: permissionsCatalogLoading } =
    usePermissionsCatalog(barbershop?.id);
  const { config, loaded, save } = useProfessionalConfig(barbershop?.id, id);

  const [backendSchedules, setBackendSchedules] = useState<EmployeeSchedule[]>([]);
  const [schedulesLoaded, setSchedulesLoaded] = useState(false);
  const [backendBreaks, setBackendBreaks] = useState<EmployeeBreak[]>([]);
  const [breaksLoaded, setBreaksLoaded] = useState(false);
  const [backendServices, setBackendServices] = useState<EmployeeService[]>([]);
  const [servicesLoaded, setServicesLoaded] = useState(false);
  const [backendTimeOff, setBackendTimeOff] = useState<EmployeeTimeOff[]>([]);
  const [timeOffLoaded, setTimeOffLoaded] = useState(false);
  const [backendProductCommission, setBackendProductCommission] = useState<
    EmployeeProductCommissionRule[]
  >([]);
  const [productCommissionLoaded, setProductCommissionLoaded] = useState(false);
  const [backendDifferentiated, setBackendDifferentiated] =
    useState<EmployeeDifferentiatedCommission | null>(null);
  const [differentiatedLoaded, setDifferentiatedLoaded] = useState(false);

  useEffect(() => {
    if (!barbershop?.id || !id) return;
    employeesService
      .getSchedules(barbershop.id, id)
      .then((data) => setBackendSchedules(data))
      .catch(() => {})
      .finally(() => setSchedulesLoaded(true));
    employeesService
      .getBreaks(barbershop.id, id)
      .then((data) => setBackendBreaks(data))
      .catch(() => {})
      .finally(() => setBreaksLoaded(true));
    employeesService
      .getServices(barbershop.id, id)
      .then((data) => setBackendServices(data))
      .catch(() => {})
      .finally(() => setServicesLoaded(true));
    employeesService
      .getTimeOff(barbershop.id, id)
      .then((data) => setBackendTimeOff(data))
      .catch(() => {})
      .finally(() => setTimeOffLoaded(true));
    employeesService
      .getProductCommissionRule(barbershop.id, id)
      .then((data) => setBackendProductCommission(data))
      .catch(() => {})
      .finally(() => setProductCommissionLoaded(true));
    employeesService
      .getDifferentiatedCommission(barbershop.id, id)
      .then((data) => setBackendDifferentiated(data))
      .catch(() => {})
      .finally(() => setDifferentiatedLoaded(true));
  }, [barbershop?.id, id]);

  const employee = employees.find((e) => e.id === id);

  if (
    isLoading ||
    !loaded ||
    !schedulesLoaded ||
    !breaksLoaded ||
    !servicesLoaded ||
    !timeOffLoaded ||
    !productCommissionLoaded ||
    !differentiatedLoaded
  ) {
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
    // Backend é a fonte de verdade quando já tem valor salvo; cai para o
    // valor local (config store) só para registros que ainda não migraram.
    attendancePeriodDays:
      employee?.attendancePeriodDays ?? config.attendancePeriodDays,
    defaultBonusInCents:
      employee?.defaultBonusInCents ?? config.defaultBonusInCents,
    defaultValeInCents:
      employee?.defaultValeInCents ?? config.defaultValeInCents,
    workingHours: defaultWorkingHours().map((wh) => {
      const s = backendSchedules.find((bs) => bs.dayOfWeek === wh.day);
      return s
        ? { day: wh.day, enabled: true, start: s.startTime, end: s.endTime }
        : { ...wh, enabled: false };
    }),
    services: backendServices,
    intervals: backendBreaks.map((b) => ({
      id: b.id,
      day: b.dayOfWeek,
      start: b.startTime,
      end: b.endTime,
    })),
    timeOff: backendTimeOff.map((t) => ({ id: t.id, start: t.startDate, end: t.endDate })),
    productCommission: productCommissionRuleFromBackend(backendProductCommission),
    differentiated: differentiatedCommissionFromBackend(backendDifferentiated),
    // Fonte de verdade é sempre o AccessGroup real do funcionário, nunca o
    // localStorage — evita mostrar o checklist desatualizado em relação ao
    // que de fato vale no login.
    permissions: groups.find((g) => g.id === employee?.accessGroupId)?.permissions ?? [],
  };

  async function handleSave(basic: ProfessionalBasic, cfg: ProfessionalConfig) {
    if (!employee || !barbershop) return;

    const accessGroupId = await resolveProfessionalAccessGroupId({
      isProfissional: cfg.type === "profissional",
      currentAccessGroupId: basic.accessGroupId,
      professionalName: basic.appName.trim(),
      permissions: cfg.permissions,
      groups,
      createGroup: createAccessGroup,
      updateGroup: updateAccessGroup,
    });
    if (!accessGroupId) return;

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
      accessGroupId,
      attendancePeriodDays: cfg.attendancePeriodDays,
      defaultBonusInCents: cfg.defaultBonusInCents,
      defaultValeInCents: cfg.defaultValeInCents,
      ...(basic.password ? { password: basic.password } : {}),
    };

    const schedulesToSave = cfg.workingHours
      .filter((wh) => wh.enabled)
      .map((wh) => ({ dayOfWeek: wh.day, startTime: wh.start, endTime: wh.end }));

    const [updated] = await Promise.all([
      update(employee.id, payload),
      employeesService.updateSchedules(barbershop.id, employee.id, schedulesToSave).catch(() => {
        toast.error("Falha ao salvar os horários de atendimento.");
      }),
      employeesService
        .updateBreaks(
          barbershop.id,
          employee.id,
          cfg.intervals.map((it) => ({
            dayOfWeek: it.day,
            startTime: it.start,
            endTime: it.end,
          })),
        )
        .catch(() => {
          toast.error("Falha ao salvar os intervalos do profissional.");
        }),
      employeesService.updateServices(barbershop.id, employee.id, cfg.services).catch(() => {
        toast.error("Falha ao salvar os serviços do profissional.");
      }),
      employeesService
        .updateTimeOff(
          barbershop.id,
          employee.id,
          cfg.timeOff.map((t) => ({ startDate: t.start, endDate: t.end })),
        )
        .catch(() => {
          toast.error("Falha ao salvar as folgas do profissional.");
        }),
      employeesService
        .updateProductCommissionRule(
          barbershop.id,
          employee.id,
          productCommissionRuleToPayload(cfg.productCommission),
        )
        .catch(() => {
          toast.error("Falha ao salvar as regras de comissão sobre produtos.");
        }),
      employeesService
        .updateDifferentiatedCommission(
          barbershop.id,
          employee.id,
          differentiatedCommissionToPayload(cfg.differentiated),
        )
        .catch(() => {
          toast.error("Falha ao salvar o adicional de comissão diferenciada.");
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
    accessGroupId: employee.accessGroupId ?? "",
    password: "",
  };

  return (
    <ProfessionalForm
      key={employee.id}
      initialBasic={initialBasic}
      services={services}
      categories={categories}
      products={products}
      accessGroups={groups}
      permissionsCatalog={permissionsCatalog}
      permissionsCatalogLoading={permissionsCatalogLoading}
      initialConfig={effectiveConfig}
      isEditing
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
