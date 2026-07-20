"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Building2,
  Users,
  Scissors,
  MapPin,
  CreditCard,
  Eye,
  EyeOff,
  AlertTriangle,
  Info,
  GripVertical,
  Tags,
  ChevronDown,
} from "lucide-react";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DatePickerField,
  DataTablePagination,
  Loading,
} from "@/components/shared";
import { cn } from "@/lib/utils";
import { apiAssetUrl } from "@/lib/api";
import { toast } from "sonner";

import { usePagination } from "@/hooks/usePagination";
import { useAuth } from "@/hooks/useAuth";
import { useBranches } from "@/hooks/useBranches";
import { useEmployees } from "@/hooks/useEmployees";
import { useAccessGroups } from "@/hooks/useAccessGroups";
import { usePaymentGateways } from "@/hooks/usePaymentGateways";
import { PaymentGatewayCard } from "@/components/settings/PaymentGatewayCard";
import { GatewayConfigDialog } from "@/components/settings/GatewayConfigDialog";
import type {
  CreatePaymentGatewayPayload,
  GatewayProvider,
  UpdatePaymentGatewayPayload,
} from "@/types/payment-gateways.types";
import { useServices } from "@/hooks/useServices";
import { useCategories } from "@/hooks/useCategories";
import { barbershopsService } from "@/services/barbershops.service";
import {
  companyConfigStore,
  type CompanyConfig,
} from "@/lib/company-config-store";
import { barbershopAppearanceStore } from "@/lib/barbershop-appearance-store";
import type {
  Branch,
  BranchPaymentConfig,
  CreateBranchPayload,
} from "@/types/branch.types";
import {
  PAYMENT_METHOD_LABELS,
  type PaymentMethod,
} from "@/types/cash-register.types";
import type { CreateEmployeePayload, Employee } from "@/types/employee.types";
import type { AccessGroup } from "@/types/access-group.types";
import type { CreateServicePayload, Service } from "@/types/service.types";
import type { Category } from "@/types/category.types";
import {
  maskBRLInput,
  maskCep,
  maskCnpj,
  maskCpf,
  maskPhone,
} from "@/utils/format";
import { fetchAddressByCep } from "@/utils/cep";

type TabKey =
  | "empresa"
  | "filiais"
  | "profissionais"
  | "servicos"
  | "categorias"
  | "pagamento";

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  {
    key: "empresa",
    label: "Empresa",
    icon: <Building2 className="size-3.5" />,
  },
  { key: "filiais", label: "Filiais", icon: <MapPin className="size-3.5" /> },
  {
    key: "servicos",
    label: "Serviços",
    icon: <Scissors className="size-3.5" />,
  },
  {
    key: "categorias",
    label: "Categorias",
    icon: <Tags className="size-3.5" />,
  },
  {
    key: "pagamento",
    label: "Pagamento",
    icon: <CreditCard className="size-3.5" />,
  },
];

const DEFAULT_HEX = "#f5b82e";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function FormLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
      {children}
      {required && <span className="text-brand">*</span>}
    </label>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <span className="text-[11px] font-bold uppercase tracking-widest text-brand">
        {children}
      </span>
      <div className="flex-1 h-px bg-border-subtle" />
    </div>
  );
}

function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function parseBRLToCents(input: string): number {
  const cleaned = input
    .replace(/[^\d,.-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const num = parseFloat(cleaned);
  return Number.isFinite(num) ? Math.round(num * 100) : 0;
}

// ─── Tab: Empresa ─────────────────────────────────────────────────────────────

function TabEmpresa() {
  const router = useRouter();
  const { barbershop, updateBarbershop, logout } = useAuth();
  /** Configuração da unidade principal (nível empresa, persistida localmente). */
  const [config, setConfig] = useState<CompanyConfig>({
    isReceivingBranch: false,
    isHidden: false,
  });

  const [name, setName] = useState(barbershop?.name ?? "");
  const [phone, setPhone] = useState(barbershop?.phone ?? "");
  const [address, setAddress] = useState(barbershop?.address ?? "");
  const [logoUrl, setLogoUrl] = useState(barbershop?.logoUrl ?? "");
  const [title, setTitle] = useState(barbershop?.title ?? "");
  const [subtitle, setSubtitle] = useState(barbershop?.subtitle ?? "");
  const [description, setDescription] = useState(barbershop?.description ?? "");
  const [bannerUrls, setBannerUrls] = useState<string[]>(
    barbershop?.carouselImages ?? [],
  );
  const [logoCentered, setLogoCentered] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [carouselUploading, setCarouselUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setName(barbershop?.name ?? "");
    setPhone(barbershop?.phone ?? "");
    setAddress(barbershop?.address ?? "");
    setLogoUrl(barbershop?.logoUrl ?? "");
    setTitle(barbershop?.title ?? "");
    setSubtitle(barbershop?.subtitle ?? "");
    setDescription(barbershop?.description ?? "");
    setBannerUrls(barbershop?.carouselImages ?? []);
    if (barbershop) {
      setConfig(companyConfigStore.get(barbershop.id));
      setLogoCentered(
        barbershopAppearanceStore.get(barbershop.id).logoCentered,
      );
    }
  }, [barbershop]);

  function toggleLogoCentered(value: boolean) {
    setLogoCentered(value);
    if (barbershop)
      barbershopAppearanceStore.set(barbershop.id, { logoCentered: value });
  }

  function toggleConfig(patch: Partial<CompanyConfig>) {
    setConfig((prev) => {
      const next = { ...prev, ...patch };
      if (barbershop) companyConfigStore.set(barbershop.id, patch);
      return next;
    });
  }

  async function handleLogoUpload(file: File) {
    if (!barbershop) return;
    setLogoUrl(URL.createObjectURL(file));
    setLogoUploading(true);
    try {
      const updated = await barbershopsService.uploadLogo(barbershop.id, file);
      updateBarbershop(updated);
      toast.success("Logo atualizada.");
    } catch (err) {
      setLogoUrl(barbershop.logoUrl ?? "");
      toast.error(err instanceof Error ? err.message : "Falha ao enviar logo.");
    } finally {
      setLogoUploading(false);
    }
  }

  async function handleCarouselAdd(files: File[]) {
    if (!barbershop) return;
    const available = 3 - bannerUrls.length;
    if (available <= 0) {
      toast.error("Limite de 3 imagens atingido.");
      return;
    }
    const toUpload = files.slice(0, available);
    setBannerUrls((prev) => [
      ...prev,
      ...toUpload.map((f) => URL.createObjectURL(f)),
    ]);
    setCarouselUploading(true);
    try {
      const updated = await barbershopsService.addCarouselImages(
        barbershop.id,
        toUpload,
      );
      updateBarbershop(updated);
      setBannerUrls(updated.carouselImages ?? []);
      toast.success("Imagens adicionadas.");
    } catch (err) {
      setBannerUrls(barbershop.carouselImages ?? []);
      toast.error(
        err instanceof Error ? err.message : "Falha ao enviar imagens.",
      );
    } finally {
      setCarouselUploading(false);
    }
  }

  async function handleCarouselRemove(index: number) {
    if (!barbershop) return;
    const snapshot = [...bannerUrls];
    setBannerUrls((prev) => prev.filter((_, i) => i !== index));
    try {
      const updated = await barbershopsService.removeCarouselImage(
        barbershop.id,
        index,
      );
      updateBarbershop(updated);
      setBannerUrls(updated.carouselImages ?? []);
    } catch (err) {
      setBannerUrls(snapshot);
      toast.error(
        err instanceof Error ? err.message : "Falha ao remover imagem.",
      );
    }
  }

  async function handleSave() {
    if (!barbershop) return;
    if (!name.trim()) {
      toast.error("Informe o nome da barbearia.");
      return;
    }
    setSaving(true);
    try {
      const updated = await barbershopsService.update(barbershop.id, {
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        title: title.trim(),
        subtitle: subtitle.trim(),
        description: description.trim(),
      });
      updateBarbershop(updated);
      toast.success("Dados atualizados.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Falha ao salvar alterações.",
      );
    } finally {
      setSaving(false);
    }
  }

  function openDeleteDialog() {
    setDeleteConfirm("");
    setDeleteDialog(true);
  }

  async function handleDelete() {
    if (!barbershop) return;
    if (deleteConfirm.trim() !== barbershop.slug) {
      toast.error("Digite o slug exatamente como mostrado para confirmar.");
      return;
    }
    setDeleting(true);
    try {
      await barbershopsService.remove(barbershop.id);
      toast.success("Conta excluída.");
      await logout();
      router.push("/login");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Falha ao excluir conta.",
      );
      setDeleting(false);
    }
  }

  if (!barbershop) {
    return <Loading label="Carregando informações" />;
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        {/* ─── Col 1: Empresa ─── */}
        <Card className="bg-surface-raised border-border">
          <CardContent className="p-5 space-y-5">
            <div className="flex items-center gap-4">
              <div className="size-16 rounded-xl bg-[#f5b82e]/20 border-2 border-dashed border-[#f5b82e]/30 flex items-center justify-center overflow-hidden shrink-0">
                {logoUrl.trim() ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={apiAssetUrl(logoUrl) ?? ""}
                    alt="logo"
                    className="size-16 object-cover rounded-xl"
                  />
                ) : (
                  <Image
                    src="/Logo-Agendle-05.png"
                    alt="Agendle"
                    width={48}
                    height={28}
                    className="object-contain"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-bold text-white truncate">
                  {barbershop.name}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  A logo aparece na vitrine pública da barbearia.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <FormLabel required>Nome</FormLabel>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-surface-base border-border text-white focus-visible:ring-[#f5b82e]/30 h-10"
                />
              </div>

              <div className="space-y-1.5">
                <FormLabel>Slug (URL)</FormLabel>
                <Input
                  value={barbershop.slug}
                  readOnly
                  className="bg-surface-base border-border text-muted-foreground focus-visible:ring-0 h-10 cursor-not-allowed"
                />
                <p className="text-[10px] text-text-faint">
                  Slug não pode ser alterado após o cadastro.
                </p>
              </div>

              <div className="space-y-1.5">
                <FormLabel>E-mail</FormLabel>
                <Input
                  value={barbershop.email}
                  readOnly
                  className="bg-surface-base border-border text-muted-foreground focus-visible:ring-0 h-10 cursor-not-allowed"
                />
              </div>

              <div className="space-y-1.5">
                <FormLabel>Telefone</FormLabel>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(maskPhone(e.target.value))}
                  inputMode="numeric"
                  maxLength={15}
                  className="bg-surface-base border-border text-white focus-visible:ring-[#f5b82e]/30 h-10"
                />
              </div>

              <div className="space-y-1.5">
                <FormLabel>Endereço</FormLabel>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="bg-surface-base border-border text-white focus-visible:ring-[#f5b82e]/30 h-10"
                />
              </div>
            </div>

            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="h-9 px-5 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover hover:shadow-[0_0_16px_rgba(245,184,46,0.3)] transition-all disabled:opacity-60"
            >
              {saving ? "Salvando…" : "Salvar Alterações"}
            </button>
          </CardContent>
        </Card>

        {/* ─── Col 2: Vitrine pública ─── */}
        <Card className="bg-surface-raised border-border">
          <CardContent className="p-5 space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-brand">
                Vitrine pública
              </h3>
              <p className="text-[11px] text-text-faint mt-1">
                Esses dados aparecem na página da barbearia que o cliente
                acessa. Logo e carrossel são enviados imediatamente ao servidor.
              </p>
            </div>

            {/* Logo */}
            <div className="space-y-1.5">
              <FormLabel>Logo</FormLabel>
              <label
                className={cn(
                  "flex items-center gap-3 cursor-pointer group",
                  logoUploading && "pointer-events-none opacity-60",
                )}
              >
                <div className="size-16 rounded-xl bg-surface-base border-2 border-dashed border-border group-hover:border-brand/50 flex items-center justify-center overflow-hidden shrink-0 transition-colors">
                  {logoUploading ? (
                    <span className="text-[9px] text-text-faint animate-pulse">
                      Enviando…
                    </span>
                  ) : logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={apiAssetUrl(logoUrl) ?? ""}
                      alt="logo preview"
                      className="size-16 object-cover rounded-xl"
                    />
                  ) : (
                    <Plus className="size-5 text-text-faint group-hover:text-brand transition-colors" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-foreground font-medium">
                    {logoUrl
                      ? "Clique para substituir"
                      : "Clique para selecionar"}
                  </p>
                  <p className="text-[11px] text-text-faint mt-0.5">
                    PNG, JPG ou WebP · recomendado 400×400
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    void handleLogoUpload(file);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>

            <div className="space-y-1.5">
              <FormLabel>Título</FormLabel>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex.: A melhor barbearia da cidade"
                className="bg-surface-base border-border text-white placeholder:text-text-faint focus-visible:ring-[#f5b82e]/30 h-10"
              />
            </div>

            <div className="space-y-1.5">
              <FormLabel>Subtítulo</FormLabel>
              <Input
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Ex.: Cortes, barba e cuidados masculinos"
                className="bg-surface-base border-border text-white placeholder:text-text-faint focus-visible:ring-[#f5b82e]/30 h-10"
              />
            </div>

            <div className="space-y-1.5">
              <FormLabel>Descrição</FormLabel>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Conte um pouco sobre a barbearia…"
                className="bg-surface-base border-border text-white placeholder:text-text-faint focus-visible:ring-[#f5b82e]/30 resize-none min-h-[80px]"
              />
            </div>

            {/* Carrossel */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <FormLabel>
                  Imagens do carrossel
                  <span className="ml-1 font-normal normal-case tracking-normal text-text-faint">
                    ({bannerUrls.length}/3)
                  </span>
                </FormLabel>
                {bannerUrls.length < 3 && (
                  <label
                    className={cn(
                      "text-xs text-brand hover:underline font-semibold flex items-center gap-1 cursor-pointer",
                      carouselUploading && "pointer-events-none opacity-60",
                    )}
                  >
                    <Plus className="size-3" />
                    {carouselUploading ? "Enviando…" : "Adicionar"}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files ?? []);
                        if (files.length > 0) void handleCarouselAdd(files);
                        e.target.value = "";
                      }}
                    />
                  </label>
                )}
              </div>
              {bannerUrls.length === 0 ? (
                <p className="text-[11px] text-text-faint">
                  Nenhuma imagem. Adicione fotos para exibir um carrossel na
                  vitrine.
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {bannerUrls.map((url, i) => (
                    <div key={i} className="relative group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={apiAssetUrl(url) ?? ""}
                        alt={`banner ${i + 1}`}
                        className="w-full aspect-video object-cover rounded-md border border-border"
                      />
                      <button
                        type="button"
                        onClick={() => void handleCarouselRemove(i)}
                        disabled={carouselUploading}
                        className="absolute top-1 right-1 size-6 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-danger disabled:cursor-not-allowed"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ─── Col 3: Configuração da filial ─── */}
        <Card className="bg-surface-raised border-border">
          <CardContent className="p-5 space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-brand">
                Configuração da filial
              </h3>
              <p className="text-[11px] text-text-faint mt-1">
                Defina como esta filial será utilizada no sistema e suas
                visibilidades.
              </p>
            </div>

            <label className="flex items-start gap-3 cursor-pointer select-none">
              <Checkbox
                checked={config.isReceivingBranch}
                onCheckedChange={(c) =>
                  toggleConfig({ isReceivingBranch: c === true })
                }
                className="mt-0.5"
              />
              <div>
                <p className="text-sm font-medium text-white">
                  Filial de recebimentos
                </p>
                <p className="text-xs text-muted-foreground">
                  Marca esta filial como responsável pelos recebimentos da
                  empresa.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer select-none">
              <Checkbox
                checked={config.isHidden}
                onCheckedChange={(c) => toggleConfig({ isHidden: c === true })}
                className="mt-0.5"
              />
              <div>
                <p className="text-sm font-medium text-white">Filial oculta</p>
                <p className="text-xs text-muted-foreground">
                  Oculta esta filial de seleções públicas no sistema (ex.:
                  agendamentos de clientes).
                </p>
              </div>
            </label>

            <div className="flex items-start gap-2 rounded-md border border-border-subtle bg-surface-base p-3">
              <Info className="size-4 text-brand shrink-0 mt-0.5" />
              <p className="text-[11px] text-text-faint">
                Estas configurações impactam o comportamento da filial em todo o
                sistema, incluindo{" "}
                <span className="font-semibold text-muted-foreground">
                  vitrines públicas, fluxos de agendamento e conciliação
                  financeira
                </span>
                .
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Danger zone */}

      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent className="bg-surface-raised border border-danger/40 text-white max-w-md p-0 gap-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border-subtle">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="size-4 text-danger-foreground" />
                <DialogTitle className="text-base font-bold">
                  Confirmar exclusão
                </DialogTitle>
              </div>
              <button
                type="button"
                onClick={() => setDeleteDialog(false)}
                className="size-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-white hover:bg-surface-elevated transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>
          </DialogHeader>

          <div className="px-6 py-5 space-y-4">
            <p className="text-sm text-muted-foreground">
              Esta ação{" "}
              <span className="text-danger-foreground font-bold">
                não pode ser desfeita
              </span>
              . Todos os dados serão removidos permanentemente.
            </p>

            <div className="bg-danger/5 border border-danger/20 rounded-md px-3 py-2.5 text-xs text-muted-foreground space-y-1">
              <p>Serão excluídos:</p>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>Conta da barbearia</li>
                <li>Filiais, profissionais e serviços</li>
                <li>Produtos, estoque e agendamentos</li>
                <li>Credenciais de pagamento</li>
              </ul>
            </div>

            <div className="space-y-1.5">
              <FormLabel required>
                Digite o slug{" "}
                <span className="font-mono text-brand">{barbershop.slug}</span>{" "}
                para confirmar
              </FormLabel>
              <Input
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder={barbershop.slug}
                autoComplete="off"
                className="bg-surface-base border-border text-white placeholder:text-text-faint focus-visible:ring-danger/40 h-10 font-mono"
              />
            </div>
          </div>

          <div className="px-6 pb-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setDeleteDialog(false)}
              className="h-9 px-5 rounded-md border border-border bg-transparent text-sm text-white hover:bg-surface-elevated transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={deleting || deleteConfirm.trim() !== barbershop.slug}
              onClick={handleDelete}
              className="h-9 px-5 rounded-md text-sm font-bold bg-danger text-white hover:bg-danger/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {deleting ? "Excluindo…" : "Excluir definitivamente"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Dialog: Filial ───────────────────────────────────────────────────────────

interface BranchFormState {
  name: string;
  cnpj: string;
  email: string;
  phone: string;
  cep: string;
  street: string;
  neighborhood: string;
  city: string;
  uf: string;
  number: string;
  complement: string;
  // Configuração financeira
  paymentConfigs: BranchPaymentConfig[];
  receiptDeadlineDays: string;
  bankAccount: string;
  // Configuração da filial
  isReceivingBranch: boolean;
  isHidden: boolean;
}

const EMPTY_BRANCH_FORM: BranchFormState = {
  name: "",
  cnpj: "",
  email: "",
  phone: "",
  cep: "",
  street: "",
  neighborhood: "",
  city: "",
  uf: "",
  number: "",
  complement: "",
  paymentConfigs: [],
  receiptDeadlineDays: "",
  bankAccount: "",
  isReceivingBranch: false,
  isHidden: false,
};

const PAYMENT_METHODS = Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[];

interface CompanyDefaults {
  name: string;
  email: string;
  phone: string;
  cnpj: string | null;
}

function DialogFilial({
  open,
  onOpenChange,
  branch,
  onSave,
  companyDefaults,
  isFirstBranch,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  branch: Branch | null;
  onSave: (payload: CreateBranchPayload) => Promise<void>;
  /** Dados da empresa para pré-preencher a primeira filial. */
  companyDefaults?: CompanyDefaults | null;
  /** Quando true (sem filiais), marca como filial de recebimentos por padrão. */
  isFirstBranch?: boolean;
}) {
  const [form, setForm] = useState<BranchFormState>(EMPTY_BRANCH_FORM);
  const [saving, setSaving] = useState(false);
  const [fetchingCep, setFetchingCep] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (branch) {
      setForm({
        name: branch.name,
        cnpj: branch.cnpj ? maskCnpj(branch.cnpj) : "",
        email: branch.email,
        phone: branch.phone,
        cep: branch.cep,
        street: branch.street,
        neighborhood: branch.neighborhood,
        city: branch.city,
        uf: branch.uf,
        number: branch.number,
        complement: branch.complement ?? "",
        paymentConfigs: branch.paymentConfigs ?? [],
        receiptDeadlineDays:
          branch.receiptDeadlineDays != null
            ? String(branch.receiptDeadlineDays)
            : "",
        bankAccount: branch.bankAccount ?? "",
        isReceivingBranch: branch.isReceivingBranch ?? false,
        isHidden: branch.isHidden ?? false,
      });
    } else {
      // Primeiro cadastro / nova filial: pré-preenche com os dados da empresa
      // para que a unidade principal já inicie configurada.
      setForm({
        ...EMPTY_BRANCH_FORM,
        name: isFirstBranch ? (companyDefaults?.name ?? "") : "",
        cnpj: companyDefaults?.cnpj ? maskCnpj(companyDefaults.cnpj) : "",
        email: companyDefaults?.email ?? "",
        phone: companyDefaults?.phone ?? "",
        isReceivingBranch: Boolean(isFirstBranch),
      });
    }
  }, [open, branch, companyDefaults, isFirstBranch]);

  function update<K extends keyof BranchFormState>(
    key: K,
    value: BranchFormState[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function isPaymentOn(method: PaymentMethod): boolean {
    return form.paymentConfigs.some((p) => p.method === method);
  }
  function togglePayment(method: PaymentMethod, on: boolean) {
    setForm((prev) => {
      const others = prev.paymentConfigs.filter((p) => p.method !== method);
      return {
        ...prev,
        paymentConfigs: on ? [...others, { method, feePercent: 0 }] : others,
      };
    });
  }
  function setFee(method: PaymentMethod, fee: number) {
    setForm((prev) => ({
      ...prev,
      paymentConfigs: prev.paymentConfigs.map((p) =>
        p.method === method ? { ...p, feePercent: fee } : p,
      ),
    }));
  }
  function feeOf(method: PaymentMethod): number {
    return (
      form.paymentConfigs.find((p) => p.method === method)?.feePercent ?? 0
    );
  }

  async function handleCepChange(raw: string) {
    const masked = maskCep(raw);
    update("cep", masked);
    if (masked.replace(/\D/g, "").length !== 8) return;
    setFetchingCep(true);
    try {
      const address = await fetchAddressByCep(masked);
      if (address) {
        setForm((prev) => ({
          ...prev,
          cep: masked,
          street: address.street || prev.street,
          neighborhood: address.neighborhood || prev.neighborhood,
          city: address.city || prev.city,
          uf: address.uf || prev.uf,
        }));
      }
    } finally {
      setFetchingCep(false);
    }
  }

  async function handleSave() {
    if (!form.name.trim()) return toast.error("Informe o nome da filial.");
    if (!form.email.trim()) return toast.error("Informe o e-mail.");
    if (!form.phone.trim()) return toast.error("Informe o telefone.");
    if (form.cnpj && form.cnpj.replace(/\D/g, "").length !== 14)
      return toast.error("CNPJ inválido.");
    if (form.cep.replace(/\D/g, "").length < 8)
      return toast.error("CEP inválido.");
    if (!form.street.trim()) return toast.error("Informe a rua.");
    if (!form.neighborhood.trim()) return toast.error("Informe o bairro.");
    if (!form.city.trim()) return toast.error("Informe a cidade.");
    if (form.uf.length !== 2) return toast.error("UF deve ter 2 letras.");
    if (!form.number.trim()) return toast.error("Informe o número.");
    // Parametrização (ref. CashB): filial de recebimentos exige conta bancária.
    if (form.isReceivingBranch && !form.bankAccount.trim())
      return toast.error("Filial de recebimentos requer uma conta bancária.");

    const deadline = form.receiptDeadlineDays
      ? parseInt(form.receiptDeadlineDays, 10)
      : undefined;

    setSaving(true);
    try {
      await onSave({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        cep: form.cep.trim(),
        street: form.street.trim(),
        neighborhood: form.neighborhood.trim(),
        city: form.city.trim(),
        uf: form.uf.trim().toUpperCase(),
        number: form.number.trim(),
        complement: form.complement.trim() || undefined,
        cnpj: form.cnpj ? form.cnpj.replace(/\D/g, "") : undefined,
        isReceivingBranch: form.isReceivingBranch,
        isHidden: form.isHidden,
        receiptDeadlineDays: deadline,
        bankAccount: form.bankAccount.trim() || undefined,
        paymentConfigs: form.paymentConfigs,
      });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface-raised border border-border text-white max-w-lg p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border-subtle">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-bold">
              {branch ? "Editar Filial" : "Nova Filial"}
            </DialogTitle>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="size-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-white hover:bg-surface-elevated transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        </DialogHeader>
        <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-1.5">
            <FormLabel required>Nome da Filial</FormLabel>
            <Input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Ex.: Matriz, Filial Centro"
              className="bg-surface-base border-border text-white placeholder:text-text-faint focus-visible:ring-[#f5b82e]/30 h-10"
            />
          </div>

          <div className="space-y-1.5">
            <FormLabel>CNPJ da filial</FormLabel>
            <Input
              value={form.cnpj}
              onChange={(e) => update("cnpj", maskCnpj(e.target.value))}
              placeholder="00.000.000/0000-00"
              inputMode="numeric"
              maxLength={18}
              className="bg-surface-base border-border text-white placeholder:text-text-faint focus-visible:ring-[#f5b82e]/30 h-10"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <FormLabel required>E-mail</FormLabel>
              <Input
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="filial@barbearia.com"
                className="bg-surface-base border-border text-white placeholder:text-text-faint focus-visible:ring-[#f5b82e]/30 h-10"
              />
            </div>
            <div className="space-y-1.5">
              <FormLabel required>Telefone</FormLabel>
              <Input
                value={form.phone}
                onChange={(e) => update("phone", maskPhone(e.target.value))}
                inputMode="numeric"
                maxLength={15}
                placeholder="(81) 99999-0000"
                className="bg-surface-base border-border text-white placeholder:text-text-faint focus-visible:ring-[#f5b82e]/30 h-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <FormLabel required>
                CEP
                {fetchingCep && (
                  <span className="ml-1 text-[9px] font-normal text-muted-foreground normal-case tracking-normal animate-pulse">
                    buscando…
                  </span>
                )}
              </FormLabel>
              <Input
                value={form.cep}
                onChange={(e) => void handleCepChange(e.target.value)}
                placeholder="00000-000"
                inputMode="numeric"
                maxLength={9}
                disabled={fetchingCep}
                className="bg-surface-base border-border text-white placeholder:text-text-faint focus-visible:ring-[#f5b82e]/30 h-10 disabled:opacity-70"
              />
            </div>
            <div className="space-y-1.5 col-span-2">
              <FormLabel required>Rua</FormLabel>
              <Input
                value={form.street}
                onChange={(e) => update("street", e.target.value)}
                placeholder="Rua das Flores"
                className="bg-surface-base border-border text-white placeholder:text-text-faint focus-visible:ring-[#f5b82e]/30 h-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <FormLabel required>Número</FormLabel>
              <Input
                value={form.number}
                onChange={(e) => update("number", e.target.value)}
                placeholder="123"
                className="bg-surface-base border-border text-white placeholder:text-text-faint focus-visible:ring-[#f5b82e]/30 h-10"
              />
            </div>
            <div className="space-y-1.5 col-span-2">
              <FormLabel>Complemento</FormLabel>
              <Input
                value={form.complement}
                onChange={(e) => update("complement", e.target.value)}
                placeholder="Sala 2"
                className="bg-surface-base border-border text-white placeholder:text-text-faint focus-visible:ring-[#f5b82e]/30 h-10"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <FormLabel required>Bairro</FormLabel>
            <Input
              value={form.neighborhood}
              onChange={(e) => update("neighborhood", e.target.value)}
              placeholder="Centro"
              className="bg-surface-base border-border text-white placeholder:text-text-faint focus-visible:ring-[#f5b82e]/30 h-10"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5 col-span-2">
              <FormLabel required>Cidade</FormLabel>
              <Input
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
                placeholder="Recife"
                className="bg-surface-base border-border text-white placeholder:text-text-faint focus-visible:ring-[#f5b82e]/30 h-10"
              />
            </div>
            <div className="space-y-1.5">
              <FormLabel required>UF</FormLabel>
              <Input
                value={form.uf}
                onChange={(e) =>
                  update("uf", e.target.value.toUpperCase().slice(0, 2))
                }
                placeholder="PE"
                maxLength={2}
                className="bg-surface-base border-border text-white placeholder:text-text-faint focus-visible:ring-[#f5b82e]/30 h-10 uppercase"
              />
            </div>
          </div>

          {/* ── Configuração financeira ── */}
          <SectionTitle>Configuração financeira</SectionTitle>

          <div className="space-y-1.5">
            <FormLabel>Formas de pagamento e taxas</FormLabel>
            <div className="space-y-1.5">
              {PAYMENT_METHODS.map((method) => {
                const on = isPaymentOn(method);
                return (
                  <div
                    key={method}
                    className="flex items-center gap-3 rounded-md border border-border-subtle bg-surface-base px-3 py-2"
                  >
                    <label className="flex items-center gap-2 cursor-pointer select-none flex-1 min-w-0">
                      <Checkbox
                        checked={on}
                        onCheckedChange={(c) =>
                          togglePayment(method, c === true)
                        }
                      />
                      <span className="text-sm text-white truncate">
                        {PAYMENT_METHOD_LABELS[method]}
                      </span>
                    </label>
                    <div className="flex items-center gap-1 shrink-0">
                      <Input
                        value={on ? String(feeOf(method)) : ""}
                        onChange={(e) =>
                          setFee(
                            method,
                            parseFloat(e.target.value.replace(",", ".")) || 0,
                          )
                        }
                        disabled={!on}
                        inputMode="decimal"
                        placeholder="0"
                        className="h-8 w-20 bg-surface-raised border-border text-white text-right disabled:opacity-50"
                      />
                      <span className="text-xs text-muted-foreground">
                        % taxa
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <FormLabel>Prazo p/ recebimento (dias)</FormLabel>
              <Input
                value={form.receiptDeadlineDays}
                onChange={(e) =>
                  update(
                    "receiptDeadlineDays",
                    e.target.value.replace(/\D/g, "").slice(0, 3),
                  )
                }
                inputMode="numeric"
                placeholder="Ex.: 30"
                className="bg-surface-base border-border text-white placeholder:text-text-faint focus-visible:ring-[#f5b82e]/30 h-10"
              />
            </div>
            <div className="space-y-1.5">
              <FormLabel>Conta bancária</FormLabel>
              <Input
                value={form.bankAccount}
                onChange={(e) => update("bankAccount", e.target.value)}
                placeholder="Banco · Agência · Conta"
                className="bg-surface-base border-border text-white placeholder:text-text-faint focus-visible:ring-[#f5b82e]/30 h-10"
              />
            </div>
          </div>

          {/* ── Configuração da filial ── */}
          <SectionTitle>Configuração da filial</SectionTitle>

          <div className="space-y-2.5">
            <label className="flex items-start gap-3 cursor-pointer select-none rounded-md border border-border-subtle bg-surface-base p-3">
              <Checkbox
                checked={form.isReceivingBranch}
                onCheckedChange={(c) => update("isReceivingBranch", c === true)}
                className="mt-0.5"
              />
              <div>
                <p className="text-sm font-medium text-white">
                  Filial de recebimentos
                </p>
                <p className="text-xs text-muted-foreground">
                  Marca esta filial como responsável pelos recebimentos da
                  empresa.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer select-none rounded-md border border-border-subtle bg-surface-base p-3">
              <Checkbox
                checked={form.isHidden}
                onCheckedChange={(c) => update("isHidden", c === true)}
                className="mt-0.5"
              />
              <div>
                <p className="text-sm font-medium text-white">Filial oculta</p>
                <p className="text-xs text-muted-foreground">
                  Oculta esta filial de seleções públicas no sistema (ex.:
                  agendamentos de clientes).
                </p>
              </div>
            </label>

            <p className="text-[11px] text-text-faint rounded-md border border-border-subtle bg-surface-base/60 p-3">
              Estas configurações impactam o comportamento da filial em todo o
              sistema, incluindo{" "}
              <span className="font-semibold text-muted-foreground">
                vitrines públicas, fluxos de agendamento e conciliação
                financeira
              </span>
              .
            </p>
          </div>
        </div>
        <div className="px-6 pb-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-9 px-5 rounded-md border border-border bg-transparent text-sm text-white hover:bg-surface-elevated transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="h-9 px-5 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors disabled:opacity-60"
          >
            {saving ? "Salvando…" : branch ? "Salvar" : "Criar Filial"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Tab: Filiais ─────────────────────────────────────────────────────────────

function TabFiliais() {
  const { barbershop } = useAuth();
  const { branches, isLoading, create, update, remove } = useBranches(
    barbershop?.id,
  );
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState<Branch | null>(null);

  async function handleSave(payload: CreateBranchPayload) {
    if (editing) {
      await update(editing.id, payload);
    } else {
      await create(payload);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remover esta filial? Essa ação não pode ser desfeita.")) {
      return;
    }
    await remove(id);
  }

  return (
    <Card className="bg-surface-raised border-border">
      <CardContent className="p-0">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle">
          <h2 className="text-sm font-bold text-white">Filiais</h2>
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setDialog(true);
            }}
            className="h-9 px-4 rounded-md text-xs font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-all flex items-center gap-1.5"
          >
            <Plus className="size-3.5" />
            Nova Filial
          </button>
        </div>

        <div className="divide-y divide-border-subtle">
          {isLoading ? (
            <Loading />
          ) : branches.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-text-faint">
              Nenhuma filial cadastrada.
            </div>
          ) : (
            branches.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between px-5 py-4 hover:bg-surface-elevated/40 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-white">{b.name}</p>
                    {b.isReceivingBranch && (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-success-bg text-success-foreground">
                        Recebimentos
                      </span>
                    )}
                    {b.isHidden && (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-surface-elevated text-muted-foreground">
                        Oculta
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {b.street}, {b.number}
                    {b.complement ? ` — ${b.complement}` : ""}
                  </p>
                  <p className="text-xs text-text-faint mt-0.5">
                    {b.neighborhood} · {b.city}/{b.uf} · CEP {b.cep}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {b.email} · {b.phone}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(b);
                      setDialog(true);
                    }}
                    className="size-7 rounded-md border border-border bg-surface-base text-muted-foreground flex items-center justify-center hover:border-[#f5b82e]/40 hover:text-brand transition-colors"
                  >
                    <Pencil className="size-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(b.id)}
                    className="size-7 rounded-md border border-red-500/30 bg-transparent text-red-400 flex items-center justify-center hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
      <DialogFilial
        open={dialog}
        onOpenChange={setDialog}
        branch={editing}
        onSave={handleSave}
        companyDefaults={
          barbershop
            ? {
                name: barbershop.name,
                email: barbershop.email,
                phone: barbershop.phone ?? "",
                cnpj: barbershop.cnpj,
              }
            : null
        }
        isFirstBranch={branches.length === 0}
      />
    </Card>
  );
}

// ─── Dialog: Profissional ─────────────────────────────────────────────────────

interface EmployeeFormState {
  name: string;
  appName: string;
  email: string;
  password: string;
  phone: string;
  accessGroupId: string;
  branchId: string;
  pixKey: string;
  cpf: string;
  cnpj: string;
  birthDate: string;
  hasBranchAccess: boolean;
  cep: string;
  street: string;
  neighborhood: string;
  city: string;
  uf: string;
  number: string;
  complement: string;
}

const EMPTY_EMPLOYEE_FORM: EmployeeFormState = {
  name: "",
  appName: "",
  email: "",
  password: "",
  phone: "",
  accessGroupId: "",
  branchId: "",
  pixKey: "",
  cpf: "",
  cnpj: "",
  birthDate: "",
  hasBranchAccess: false,
  cep: "",
  street: "",
  neighborhood: "",
  city: "",
  uf: "",
  number: "",
  complement: "",
};

function DialogProfissional({
  open,
  onOpenChange,
  employee,
  branches,
  groups,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  employee: Employee | null;
  branches: Branch[];
  groups: AccessGroup[];
  onSave: (payload: CreateEmployeePayload) => Promise<void>;
}) {
  const [form, setForm] = useState<EmployeeFormState>(EMPTY_EMPLOYEE_FORM);
  const [saving, setSaving] = useState(false);
  const [fetchingCep, setFetchingCep] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (employee) {
      setForm({
        name: employee.name,
        appName: employee.appName,
        email: employee.email,
        password: "",
        phone: employee.phone,
        accessGroupId: employee.accessGroupId ?? "",
        branchId: employee.branchId,
        pixKey: employee.pixKey,
        cpf: employee.cpf ?? "",
        cnpj: employee.cnpj ?? "",
        birthDate: employee.birthDate ? employee.birthDate.slice(0, 10) : "",
        hasBranchAccess: employee.hasBranchAccess,
        cep: employee.cep,
        street: employee.street,
        neighborhood: employee.neighborhood,
        city: employee.city,
        uf: employee.uf,
        number: employee.number,
        complement: employee.complement ?? "",
      });
    } else {
      setForm({ ...EMPTY_EMPLOYEE_FORM, branchId: branches[0]?.id ?? "" });
    }
  }, [open, employee, branches]);

  function update<K extends keyof EmployeeFormState>(
    key: K,
    value: EmployeeFormState[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleCepChange(raw: string) {
    const masked = maskCep(raw);
    update("cep", masked);
    if (masked.replace(/\D/g, "").length !== 8) return;
    setFetchingCep(true);
    try {
      const address = await fetchAddressByCep(masked);
      if (address) {
        setForm((prev) => ({
          ...prev,
          cep: masked,
          street: address.street || prev.street,
          neighborhood: address.neighborhood || prev.neighborhood,
          city: address.city || prev.city,
          uf: address.uf || prev.uf,
        }));
      }
    } finally {
      setFetchingCep(false);
    }
  }

  async function handleSave() {
    if (form.name.trim().length < 2)
      return toast.error("Informe o nome completo.");
    if (form.appName.trim().length < 2)
      return toast.error("Informe o nome de exibição.");
    if (!form.email.trim()) return toast.error("Informe o e-mail.");
    if (!employee && form.password.length < 6)
      return toast.error("Senha deve ter pelo menos 6 caracteres.");
    if (form.phone.replace(/\D/g, "").length < 10)
      return toast.error("Telefone inválido.");
    if (!form.accessGroupId)
      return toast.error("Selecione um grupo de acesso.");
    if (!form.branchId) return toast.error("Selecione uma filial.");
    if (!form.pixKey.trim()) return toast.error("Informe a chave Pix.");
    if (form.cep.replace(/\D/g, "").length < 8)
      return toast.error("CEP inválido.");
    if (!form.street.trim()) return toast.error("Informe a rua.");
    if (!form.neighborhood.trim()) return toast.error("Informe o bairro.");
    if (!form.city.trim()) return toast.error("Informe a cidade.");
    if (form.uf.length !== 2) return toast.error("UF deve ter 2 letras.");
    if (!form.number.trim()) return toast.error("Informe o número.");

    setSaving(true);
    try {
      const payload: CreateEmployeePayload = {
        name: form.name.trim(),
        appName: form.appName.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        phone: form.phone.trim(),
        accessGroupId: form.accessGroupId,
        branchId: form.branchId,
        pixKey: form.pixKey.trim(),
        cpf: form.cpf.trim() || undefined,
        cnpj: form.cnpj.trim() || undefined,
        birthDate: form.birthDate
          ? new Date(form.birthDate).toISOString()
          : undefined,
        hasBranchAccess: form.hasBranchAccess,
        cep: form.cep.trim(),
        street: form.street.trim(),
        neighborhood: form.neighborhood.trim(),
        city: form.city.trim(),
        uf: form.uf.trim().toUpperCase(),
        number: form.number.trim(),
        complement: form.complement.trim() || undefined,
      };
      await onSave(payload);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface-raised border border-border text-white max-w-2xl p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border-subtle">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-bold">
              {employee ? "Editar Profissional" : "Novo Profissional"}
            </DialogTitle>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="size-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-white hover:bg-surface-elevated transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        </DialogHeader>

        <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
          <SectionTitle>Dados Pessoais</SectionTitle>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <FormLabel required>Nome Completo</FormLabel>
              <Input
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="João da Silva"
                className="bg-surface-base border-border text-white placeholder:text-text-faint focus-visible:ring-[#f5b82e]/30 h-10"
              />
            </div>
            <div className="space-y-1.5">
              <FormLabel required>Nome no App</FormLabel>
              <Input
                value={form.appName}
                onChange={(e) => update("appName", e.target.value)}
                placeholder="João"
                className="bg-surface-base border-border text-white placeholder:text-text-faint focus-visible:ring-[#f5b82e]/30 h-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <FormLabel>CPF</FormLabel>
              <Input
                value={form.cpf}
                onChange={(e) => update("cpf", maskCpf(e.target.value))}
                placeholder="000.000.000-00"
                inputMode="numeric"
                maxLength={14}
                className="bg-surface-base border-border text-white placeholder:text-text-faint focus-visible:ring-[#f5b82e]/30 h-10"
              />
            </div>
            <div className="space-y-1.5">
              <FormLabel>CNPJ</FormLabel>
              <Input
                value={form.cnpj}
                onChange={(e) => update("cnpj", maskCnpj(e.target.value))}
                placeholder="00.000.000/0000-00"
                inputMode="numeric"
                maxLength={18}
                className="bg-surface-base border-border text-white placeholder:text-text-faint focus-visible:ring-[#f5b82e]/30 h-10"
              />
            </div>
            <div className="space-y-1.5">
              <FormLabel>Data de Nascimento</FormLabel>
              <DatePickerField
                id="employee-birthDate"
                date={
                  form.birthDate
                    ? new Date(`${form.birthDate}T00:00:00`)
                    : undefined
                }
                onChange={(d) =>
                  update(
                    "birthDate",
                    d
                      ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
                      : "",
                  )
                }
                disabled={{ after: new Date() }}
                startMonth={new Date(1920, 0)}
                endMonth={new Date()}
                defaultMonth={new Date(new Date().getFullYear() - 25, 0)}
              />
            </div>
          </div>

          <SectionTitle>Acesso ao App</SectionTitle>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <FormLabel required>E-mail</FormLabel>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="joao@email.com"
                className="bg-surface-base border-border text-white placeholder:text-text-faint focus-visible:ring-[#f5b82e]/30 h-10"
              />
            </div>
            <div className="space-y-1.5">
              <FormLabel required={!employee}>
                {employee ? "Nova Senha (opcional)" : "Senha"}
              </FormLabel>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  placeholder={
                    employee
                      ? "Deixe em branco para manter"
                      : "Mín. 6 caracteres"
                  }
                  className="bg-surface-base border-border text-white placeholder:text-text-faint focus-visible:ring-[#f5b82e]/30 h-10 pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-text-faint hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <FormLabel required>Telefone</FormLabel>
              <Input
                value={form.phone}
                onChange={(e) => update("phone", maskPhone(e.target.value))}
                inputMode="numeric"
                maxLength={15}
                placeholder="(81) 99999-0000"
                className="bg-surface-base border-border text-white placeholder:text-text-faint focus-visible:ring-[#f5b82e]/30 h-10"
              />
            </div>
            <div className="space-y-1.5">
              <FormLabel required>Chave Pix</FormLabel>
              <Input
                value={form.pixKey}
                onChange={(e) => update("pixKey", e.target.value)}
                placeholder="CPF, e-mail, telefone ou chave aleatória"
                className="bg-surface-base border-border text-white placeholder:text-text-faint focus-visible:ring-[#f5b82e]/30 h-10"
              />
            </div>
          </div>

          <SectionTitle>Trabalho</SectionTitle>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <FormLabel required>Grupo de acesso</FormLabel>
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="w-full"
                  disabled={groups.length === 0}
                >
                  <div
                    className={cn(
                      "w-full h-10 px-3 rounded-md border border-border bg-surface-base text-sm text-white flex items-center justify-between gap-2 transition-colors",
                      groups.length === 0
                        ? "opacity-60 cursor-not-allowed"
                        : "hover:border-[#f5b82e]/40 cursor-pointer",
                    )}
                  >
                    <span
                      className={
                        form.accessGroupId ? "text-white" : "text-text-faint"
                      }
                    >
                      {groups.find((g) => g.id === form.accessGroupId)?.name ??
                        "Selecione um grupo"}
                    </span>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-surface-raised border-border text-white max-h-48 overflow-y-auto">
                  {groups.map((g) => (
                    <DropdownMenuItem
                      key={g.id}
                      onClick={() => update("accessGroupId", g.id)}
                      className={cn(
                        "text-xs hover:bg-surface-elevated cursor-pointer",
                        form.accessGroupId === g.id && "text-brand",
                      )}
                    >
                      {g.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              {groups.length === 0 && (
                <p className="text-[11px] text-warning-foreground">
                  Crie um grupo de acesso em Controle de Acesso antes de
                  cadastrar profissionais.
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <FormLabel required>Filial</FormLabel>
              <DropdownMenu>
                <DropdownMenuTrigger className="w-full">
                  <div className="w-full h-10 px-3 rounded-md border border-border bg-surface-base text-sm text-white flex items-center justify-between gap-2 hover:border-[#f5b82e]/40 transition-colors cursor-pointer">
                    <span
                      className={
                        form.branchId ? "text-white" : "text-text-faint"
                      }
                    >
                      {branches.find((b) => b.id === form.branchId)?.name ??
                        "Selecione uma filial"}
                    </span>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-surface-raised border-border text-white max-h-48 overflow-y-auto">
                  {branches.length === 0 ? (
                    <DropdownMenuItem
                      disabled
                      className="text-xs text-text-faint"
                    >
                      Cadastre uma filial primeiro
                    </DropdownMenuItem>
                  ) : (
                    branches.map((b) => (
                      <DropdownMenuItem
                        key={b.id}
                        onClick={() => update("branchId", b.id)}
                        className={cn(
                          "text-xs hover:bg-surface-elevated cursor-pointer",
                          form.branchId === b.id && "text-brand",
                        )}
                      >
                        {b.name}
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <Checkbox
              checked={form.hasBranchAccess}
              onCheckedChange={(checked) =>
                update("hasBranchAccess", checked === true)
              }
            />
            <span className="text-xs text-foreground">
              Tem acesso administrativo à filial
            </span>
          </label>

          <SectionTitle>Endereço</SectionTitle>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <FormLabel required>
                CEP
                {fetchingCep && (
                  <span className="ml-1 text-[9px] font-normal text-muted-foreground normal-case tracking-normal animate-pulse">
                    buscando…
                  </span>
                )}
              </FormLabel>
              <Input
                value={form.cep}
                onChange={(e) => void handleCepChange(e.target.value)}
                placeholder="00000-000"
                inputMode="numeric"
                maxLength={9}
                disabled={fetchingCep}
                className="bg-surface-base border-border text-white placeholder:text-text-faint focus-visible:ring-[#f5b82e]/30 h-10 disabled:opacity-70"
              />
            </div>
            <div className="space-y-1.5 col-span-2">
              <FormLabel required>Rua</FormLabel>
              <Input
                value={form.street}
                onChange={(e) => update("street", e.target.value)}
                placeholder="Rua das Flores"
                className="bg-surface-base border-border text-white placeholder:text-text-faint focus-visible:ring-[#f5b82e]/30 h-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <FormLabel required>Número</FormLabel>
              <Input
                value={form.number}
                onChange={(e) => update("number", e.target.value)}
                placeholder="123"
                className="bg-surface-base border-border text-white placeholder:text-text-faint focus-visible:ring-[#f5b82e]/30 h-10"
              />
            </div>
            <div className="space-y-1.5 col-span-2">
              <FormLabel>Complemento</FormLabel>
              <Input
                value={form.complement}
                onChange={(e) => update("complement", e.target.value)}
                placeholder="Apto 2"
                className="bg-surface-base border-border text-white placeholder:text-text-faint focus-visible:ring-[#f5b82e]/30 h-10"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <FormLabel required>Bairro</FormLabel>
            <Input
              value={form.neighborhood}
              onChange={(e) => update("neighborhood", e.target.value)}
              placeholder="Centro"
              className="bg-surface-base border-border text-white placeholder:text-text-faint focus-visible:ring-[#f5b82e]/30 h-10"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5 col-span-2">
              <FormLabel required>Cidade</FormLabel>
              <Input
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
                placeholder="Recife"
                className="bg-surface-base border-border text-white placeholder:text-text-faint focus-visible:ring-[#f5b82e]/30 h-10"
              />
            </div>
            <div className="space-y-1.5">
              <FormLabel required>UF</FormLabel>
              <Input
                value={form.uf}
                onChange={(e) =>
                  update("uf", e.target.value.toUpperCase().slice(0, 2))
                }
                placeholder="PE"
                maxLength={2}
                className="bg-surface-base border-border text-white placeholder:text-text-faint focus-visible:ring-[#f5b82e]/30 h-10 uppercase"
              />
            </div>
          </div>
        </div>
        <div className="px-6 pb-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-9 px-5 rounded-md border border-border bg-transparent text-sm text-white hover:bg-surface-elevated transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={saving || groups.length === 0}
            onClick={handleSave}
            className="h-9 px-5 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? "Salvando…" : employee ? "Salvar" : "Criar Profissional"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Tab: Profissionais ───────────────────────────────────────────────────────

function TabProfissionais() {
  const { barbershop } = useAuth();
  const { employees, isLoading, create, update, remove, setFeatured } =
    useEmployees(barbershop?.id);
  const { branches } = useBranches(barbershop?.id);
  const { groups } = useAccessGroups(barbershop?.id);
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);

  async function handleSave(payload: CreateEmployeePayload) {
    if (editing) {
      const { password, ...rest } = payload;
      // Não envia senha vazia no update — mantém a senha atual
      await update(editing.id, password ? payload : rest);
    } else {
      await create(payload);
    }
  }

  async function handleDelete(id: string) {
    if (
      !confirm("Remover este profissional? Essa ação não pode ser desfeita.")
    ) {
      return;
    }
    await remove(id);
  }

  const branchById = new Map(branches.map((b) => [b.id, b.name]));
  const groupById = new Map(groups.map((g) => [g.id, g.name]));
  const pag = usePagination(employees, 10);

  return (
    <Card className="bg-surface-raised border-border">
      <CardContent className="p-0">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle">
          <h2 className="text-sm font-bold text-white">Profissionais</h2>
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setDialog(true);
            }}
            className="h-9 px-4 rounded-md text-xs font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-all flex items-center gap-1.5"
          >
            <Plus className="size-3.5" />
            Novo
          </button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                {["Nome", "Grupo", "Filial", "Contato", "Destaque", ""].map(
                  (h) => (
                    <TableHead
                      key={h}
                      className={`text-muted-foreground text-xs uppercase tracking-wider font-semibold px-5 py-3 h-auto ${
                        h === "Destaque" ? "text-center" : ""
                      }`}
                    >
                      {h}
                    </TableHead>
                  ),
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-4">
                    <Loading />
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center text-sm text-text-faint"
                  >
                    Nenhum profissional cadastrado.
                  </td>
                </tr>
              ) : (
                pag.pageItems.map((p) => (
                  <TableRow
                    key={p.id}
                    className="border-border hover:bg-surface-elevated/40 transition-colors"
                  >
                    <TableCell className="px-5 py-4">
                      <p className="font-semibold text-white text-sm">
                        {p.name}
                      </p>
                      <p className="text-xs text-text-faint mt-0.5">
                        @{p.appName}
                      </p>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-muted-foreground text-sm">
                      {(p.accessGroupId && groupById.get(p.accessGroupId)) ??
                        "—"}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-muted-foreground text-sm">
                      {branchById.get(p.branchId) ?? "—"}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <p className="text-muted-foreground text-sm">{p.email}</p>
                      <p className="text-xs text-text-faint mt-0.5">
                        {p.phone}
                      </p>
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <div className="flex justify-center">
                        <Checkbox
                          checked={p.featured}
                          onCheckedChange={(c) => setFeatured(p.id, c === true)}
                          aria-label="Marcar como destaque"
                          className="cursor-pointer"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(p);
                            setDialog(true);
                          }}
                          className="size-7 rounded-md border border-border bg-surface-base text-muted-foreground flex items-center justify-center hover:border-[#f5b82e]/40 hover:text-brand transition-colors"
                        >
                          <Pencil className="size-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(p.id)}
                          className="size-7 rounded-md border border-red-500/30 bg-transparent text-red-400 flex items-center justify-center hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {pag.total > 0 && (
          <DataTablePagination
            page={pag.page}
            pageSize={pag.pageSize}
            totalPages={pag.totalPages}
            total={pag.total}
            from={pag.from}
            to={pag.to}
            onPageChange={pag.setPage}
            onPageSizeChange={pag.setPageSize}
          />
        )}
      </CardContent>
      <DialogProfissional
        open={dialog}
        onOpenChange={setDialog}
        employee={editing}
        branches={branches}
        groups={groups}
        onSave={handleSave}
      />
    </Card>
  );
}

// ─── Dialog: Serviço ──────────────────────────────────────────────────────────

interface ServiceFormState {
  name: string;
  description: string;
  durationMin: string;
  priceBRL: string;
  hex: string;
  categoryId: string | null;
}

const EMPTY_SERVICE_FORM: ServiceFormState = {
  name: "",
  description: "",
  durationMin: "30",
  priceBRL: "",
  hex: DEFAULT_HEX,
  categoryId: null,
};

function DialogServico({
  open,
  onOpenChange,
  service,
  categories,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  service: Service | null;
  categories: Category[];
  onSave: (payload: CreateServicePayload) => Promise<void>;
}) {
  const [form, setForm] = useState<ServiceFormState>(EMPTY_SERVICE_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (service) {
      setForm({
        name: service.name,
        description: service.description ?? "",
        durationMin: String(service.durationMin),
        priceBRL: maskBRLInput(String(service.priceInCents)),
        hex: service.hex ?? DEFAULT_HEX,
        categoryId: service.categoryId ?? null,
      });
    } else {
      setForm(EMPTY_SERVICE_FORM);
    }
  }, [open, service]);

  async function handleSave() {
    if (form.name.trim().length < 2)
      return toast.error("Informe o nome do serviço.");
    const durationMin = Number(form.durationMin);
    if (!Number.isFinite(durationMin) || durationMin <= 0) {
      return toast.error("Informe uma duração válida.");
    }
    const priceInCents = parseBRLToCents(form.priceBRL);
    if (priceInCents <= 0) return toast.error("Informe um preço válido.");

    setSaving(true);
    try {
      await onSave({
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        durationMin,
        priceInCents,
        hex: form.hex,
        categoryId: form.categoryId,
      });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  const selectedCategory = categories.find((c) => c.id === form.categoryId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface-raised border border-border text-white max-w-md p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border-subtle">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-bold">
              {service ? "Editar Serviço" : "Novo Serviço"}
            </DialogTitle>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="size-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-white hover:bg-surface-elevated transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        </DialogHeader>
        <div className="px-6 py-5 space-y-4">
          <div className="space-y-1.5">
            <FormLabel required>Nome</FormLabel>
            <Input
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Ex: Corte Masculino"
              className="bg-surface-base border-border text-white placeholder:text-text-faint focus-visible:ring-[#f5b82e]/30 h-10"
            />
          </div>
          <div className="space-y-1.5">
            <FormLabel>Descrição</FormLabel>
            <Input
              value={form.description}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
              placeholder="Detalhes do serviço (opcional)"
              className="bg-surface-base border-border text-white placeholder:text-text-faint focus-visible:ring-[#f5b82e]/30 h-10"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <FormLabel required>Duração (min)</FormLabel>
              <Input
                type="text"
                inputMode="numeric"
                value={form.durationMin}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    durationMin: e.target.value.replace(/\D/g, ""),
                  }))
                }
                placeholder="30"
                className="bg-surface-base border-border text-white placeholder:text-text-faint focus-visible:ring-[#f5b82e]/30 h-10"
              />
            </div>
            <div className="space-y-1.5">
              <FormLabel required>Valor</FormLabel>
              <Input
                value={form.priceBRL}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    priceBRL: maskBRLInput(e.target.value),
                  }))
                }
                inputMode="numeric"
                placeholder="R$ 0,00"
                className="bg-surface-base border-border text-white placeholder:text-text-faint focus-visible:ring-[#f5b82e]/30 h-10"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <FormLabel>Categoria</FormLabel>
            <DropdownMenu>
              <DropdownMenuTrigger className="w-full">
                <div className="w-full h-10 px-3 rounded-md border border-border bg-surface-base text-sm flex items-center justify-between gap-2 text-left">
                  <span
                    className={
                      selectedCategory ? "text-white" : "text-text-faint"
                    }
                  >
                    {selectedCategory?.name ?? "Sem categoria"}
                  </span>
                  <ChevronDown className="size-4 text-muted-foreground shrink-0" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-surface-raised border-border text-white max-h-48 overflow-y-auto w-[var(--radix-dropdown-menu-trigger-width)]">
                <DropdownMenuItem
                  onClick={() => setForm((p) => ({ ...p, categoryId: null }))}
                  className={cn(
                    "text-xs hover:bg-surface-elevated cursor-pointer",
                    !form.categoryId && "text-brand",
                  )}
                >
                  Sem categoria
                </DropdownMenuItem>
                {categories.map((c) => (
                  <DropdownMenuItem
                    key={c.id}
                    onClick={() => setForm((p) => ({ ...p, categoryId: c.id }))}
                    className={cn(
                      "text-xs hover:bg-surface-elevated cursor-pointer",
                      form.categoryId === c.id && "text-brand",
                    )}
                  >
                    {c.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="space-y-1.5">
            <FormLabel>Cor de Identificação</FormLabel>
            <div className="flex items-center gap-3">
              <div className="relative size-10 rounded-md overflow-hidden border border-border shrink-0">
                <input
                  type="color"
                  value={form.hex}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, hex: e.target.value }))
                  }
                  className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
                />
                <div
                  className="size-full"
                  style={{ backgroundColor: form.hex }}
                />
              </div>
              <Input
                value={form.hex}
                onChange={(e) =>
                  setForm((p) => ({ ...p, hex: e.target.value }))
                }
                placeholder="#f5b82e"
                className="bg-surface-base border-border text-white placeholder:text-text-faint focus-visible:ring-[#f5b82e]/30 h-10 uppercase font-mono"
              />
            </div>
          </div>
        </div>
        <div className="px-6 pb-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-9 px-5 rounded-md border border-border bg-transparent text-sm text-white hover:bg-surface-elevated transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="h-9 px-5 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors disabled:opacity-60"
          >
            {saving ? "Salvando…" : service ? "Salvar" : "Criar Serviço"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Tab: Serviços ────────────────────────────────────────────────────────────

function SortableServiceRow({
  s,
  onEdit,
  onDelete,
  onFeatured,
}: {
  s: Service;
  onEdit: (s: Service) => void;
  onDelete: (id: string) => void;
  onFeatured: (id: string, v: boolean) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: s.id });
  return (
    <TableRow
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
      className="border-border hover:bg-surface-elevated/40 transition-colors"
    >
      <TableCell className="px-3 py-4 w-8">
        <button
          type="button"
          {...listeners}
          {...attributes}
          className="cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-muted-foreground transition-colors touch-none"
          aria-label="Arrastar para reordenar"
        >
          <GripVertical className="size-4" />
        </button>
      </TableCell>
      <TableCell className="px-5 py-4">
        <div
          className="size-4 rounded-full border border-border"
          style={{ backgroundColor: s.hex ?? DEFAULT_HEX }}
        />
      </TableCell>
      <TableCell className="px-5 py-4 font-semibold text-white text-sm">
        {s.name}
      </TableCell>
      <TableCell className="px-5 py-4 text-muted-foreground text-sm max-w-70 truncate">
        {s.description || "—"}
      </TableCell>
      <TableCell className="px-5 py-4 text-muted-foreground text-sm">
        {s.durationMin} min
      </TableCell>
      <TableCell className="px-5 py-4 text-brand font-semibold text-sm">
        {formatBRL(s.priceInCents)}
      </TableCell>
      <TableCell className="px-5 py-4">
        <div className="flex justify-center">
          <Checkbox
            checked={s.featured}
            onCheckedChange={(c) => onFeatured(s.id, c === true)}
            aria-label="Marcar serviço como destaque"
            className="cursor-pointer"
          />
        </div>
      </TableCell>
      <TableCell className="px-5 py-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(s)}
            className="size-7 rounded-md border border-border bg-surface-base text-muted-foreground flex items-center justify-center hover:border-[#f5b82e]/40 hover:text-brand transition-colors"
          >
            <Pencil className="size-3" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(s.id)}
            className="size-7 rounded-md border border-red-500/30 bg-transparent text-red-400 flex items-center justify-center hover:bg-red-500/10 transition-colors"
          >
            <Trash2 className="size-3" />
          </button>
        </div>
      </TableCell>
    </TableRow>
  );
}

function TabServicos() {
  const { barbershop } = useAuth();
  const { services, isLoading, create, update, remove, setFeatured, reorder } =
    useServices(barbershop?.id);
  const { categories } = useCategories(barbershop?.id);
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const pag = usePagination(services, 10);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  async function handleSave(payload: CreateServicePayload) {
    if (editing) {
      await update(editing.id, payload);
    } else {
      await create(payload);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remover este serviço? Essa ação não pode ser desfeita.")) {
      return;
    }
    await remove(id);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const pageIds = pag.pageItems.map((s) => s.id);
    const oldIndex = pageIds.indexOf(active.id as string);
    const newIndex = pageIds.indexOf(over.id as string);
    const reorderedPage = arrayMove(pag.pageItems, oldIndex, newIndex);

    const start = (pag.page - 1) * pag.pageSize;
    const newAll = [...services];
    reorderedPage.forEach((item, i) => {
      newAll[start + i] = item;
    });

    reorder(newAll.map((s) => s.id));
  }

  return (
    <Card className="bg-surface-raised border-border">
      <CardContent className="p-0">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle">
          <h2 className="text-sm font-bold text-white">Serviços</h2>
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setDialog(true);
            }}
            className="h-9 px-4 rounded-md text-xs font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-all flex items-center gap-1.5"
          >
            <Plus className="size-3.5" />
            Novo Serviço
          </button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                {[
                  "",
                  "",
                  "Serviço",
                  "Descrição",
                  "Duração",
                  "Preço",
                  "Destaque",
                  "",
                ].map((h, i) => (
                  <TableHead
                    key={i}
                    className={`text-muted-foreground text-xs uppercase tracking-wider font-semibold px-5 py-3 h-auto ${
                      h === "Destaque" ? "text-center" : ""
                    }`}
                  >
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={pag.pageItems.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                <TableBody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={8} className="py-4">
                        <Loading />
                      </td>
                    </tr>
                  ) : services.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="py-12 text-center text-sm text-text-faint"
                      >
                        Nenhum serviço cadastrado.
                      </td>
                    </tr>
                  ) : (
                    pag.pageItems.map((s) => (
                      <SortableServiceRow
                        key={s.id}
                        s={s}
                        onEdit={(s) => {
                          setEditing(s);
                          setDialog(true);
                        }}
                        onDelete={handleDelete}
                        onFeatured={setFeatured}
                      />
                    ))
                  )}
                </TableBody>
              </SortableContext>
            </DndContext>
          </Table>
        </div>
        {pag.total > 0 && (
          <DataTablePagination
            page={pag.page}
            pageSize={pag.pageSize}
            totalPages={pag.totalPages}
            total={pag.total}
            from={pag.from}
            to={pag.to}
            onPageChange={pag.setPage}
            onPageSizeChange={pag.setPageSize}
          />
        )}
      </CardContent>
      <DialogServico
        open={dialog}
        onOpenChange={setDialog}
        service={editing}
        categories={categories}
        onSave={handleSave}
      />
    </Card>
  );
}

// ─── Dialog: Categoria ────────────────────────────────────────────────────────

function DialogCategoria({
  open,
  onOpenChange,
  category,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  category: Category | null;
  onSave: (name: string) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(category?.name ?? "");
  }, [open, category]);

  async function handleSave() {
    if (name.trim().length < 2)
      return toast.error("Informe o nome da categoria.");
    setSaving(true);
    try {
      await onSave(name.trim());
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface-raised border border-border text-white max-w-sm p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border-subtle">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-bold">
              {category ? "Editar Categoria" : "Nova Categoria"}
            </DialogTitle>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="size-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-white hover:bg-surface-elevated transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        </DialogHeader>
        <div className="px-6 py-5">
          <div className="space-y-1.5">
            <FormLabel required>Nome</FormLabel>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              placeholder="Ex: Cortes, Cosméticos…"
              className="bg-surface-base border-border text-white placeholder:text-text-faint focus-visible:ring-[#f5b82e]/30 h-10"
            />
          </div>
        </div>
        <div className="px-6 pb-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-9 px-5 rounded-md border border-border bg-transparent text-sm text-white hover:bg-surface-elevated transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="h-9 px-5 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors disabled:opacity-60"
          >
            {saving ? "Salvando…" : category ? "Salvar" : "Criar Categoria"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Tab: Categorias ─────────────────────────────────────────────────────────

function TabCategorias() {
  const { barbershop } = useAuth();
  const { categories, isLoading, create, update, remove } = useCategories(
    barbershop?.id,
  );
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  async function handleSave(name: string) {
    if (editing) {
      await update(editing.id, { name });
    } else {
      await create({ name });
    }
  }

  async function handleDelete(id: string) {
    if (
      !confirm(
        "Remover esta categoria? Serviços e produtos vinculados serão desvinculados automaticamente.",
      )
    )
      return;
    await remove(id);
  }

  return (
    <Card className="bg-surface-raised border-border">
      <CardContent className="p-0">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle">
          <h2 className="text-sm font-bold text-white">Categorias</h2>
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setDialog(true);
            }}
            className="h-9 px-4 rounded-md text-xs font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-all flex items-center gap-1.5"
          >
            <Plus className="size-3.5" />
            Nova Categoria
          </button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                {["Nome", "Criada em", ""].map((h, i) => (
                  <TableHead
                    key={i}
                    className="text-muted-foreground text-xs uppercase tracking-wider font-semibold px-5 py-3 h-auto"
                  >
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="py-4">
                    <Loading />
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="py-12 text-center text-sm text-text-faint"
                  >
                    Nenhuma categoria cadastrada.
                  </td>
                </tr>
              ) : (
                categories.map((c) => (
                  <TableRow
                    key={c.id}
                    className="border-border hover:bg-surface-elevated/40 transition-colors"
                  >
                    <TableCell className="px-5 py-4 font-semibold text-white text-sm">
                      {c.name}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-muted-foreground text-sm">
                      {new Date(c.createdAt).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(c);
                            setDialog(true);
                          }}
                          className="size-7 rounded-md border border-border bg-surface-base text-muted-foreground flex items-center justify-center hover:border-[#f5b82e]/40 hover:text-brand transition-colors"
                        >
                          <Pencil className="size-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(c.id)}
                          className="size-7 rounded-md border border-red-500/30 bg-transparent text-red-400 flex items-center justify-center hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <DialogCategoria
        open={dialog}
        onOpenChange={setDialog}
        category={editing}
        onSave={handleSave}
      />
    </Card>
  );
}

// ─── Tab: Gateways de Pagamento ───────────────────────────────────────────────

function TabPagamento() {
  const { barbershop } = useAuth();
  const { configs, isLoading, save, remove, activate, testConnection } =
    usePaymentGateways(barbershop?.id);

  const [dialogProvider, setDialogProvider] = useState<GatewayProvider | null>(
    null,
  );
  const [saving, setSaving] = useState(false);
  const [testingProvider, setTestingProvider] = useState<GatewayProvider | null>(
    null,
  );

  const byProvider = (provider: GatewayProvider) =>
    configs.find((c) => c.provider === provider);

  async function handleSave(
    provider: GatewayProvider,
    payload: CreatePaymentGatewayPayload | UpdatePaymentGatewayPayload,
    existing: boolean,
  ) {
    setSaving(true);
    try {
      return await save(provider, payload, existing);
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(provider: GatewayProvider) {
    if (!confirm(`Remover a configuração do ${provider}?`)) return;
    await remove(provider);
  }

  async function handleTest(provider: GatewayProvider) {
    setTestingProvider(provider);
    try {
      await testConnection(provider);
    } finally {
      setTestingProvider(null);
    }
  }

  const providers: GatewayProvider[] = ["GALAXPAY", "CELCOIN", "ASAAS"];

  return (
    <div className="max-w-3xl space-y-5">
      <div>
        <h2 className="text-sm font-bold text-white">Gateways de pagamento</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Configure um ou mais gateways e escolha qual fica ativo para novas
          cobranças de assinaturas/planos.
        </p>
      </div>

      {isLoading ? (
        <Loading />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {providers.map((provider) => (
            <PaymentGatewayCard
              key={provider}
              provider={provider}
              config={byProvider(provider)}
              testing={testingProvider === provider}
              onConfigure={() => setDialogProvider(provider)}
              onActivate={() => activate(provider)}
              onTest={() => handleTest(provider)}
              onRemove={() => handleRemove(provider)}
            />
          ))}
        </div>
      )}

      {dialogProvider && (
        <GatewayConfigDialog
          open={!!dialogProvider}
          onOpenChange={(open) => !open && setDialogProvider(null)}
          provider={dialogProvider}
          existing={byProvider(dialogProvider) ?? null}
          saving={saving}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

// ─── Página ───────────────────────────────────────────────────────────────────

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("empresa");

  return (
    <div className="min-h-screen bg-surface-base text-white p-4 md:p-6 space-y-5">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Configurações
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Dados da empresa, filiais, profissionais, serviços e pagamento
        </p>
      </div>

      <Card className="bg-surface-raised border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto border-b border-border-subtle">
            <div className="flex min-w-max">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={cn(
                    "px-4 py-3 text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2",
                    activeTab === t.key
                      ? "text-brand border-b-2 border-brand"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div className="p-5">
            {activeTab === "empresa" && <TabEmpresa />}
            {activeTab === "filiais" && <TabFiliais />}
            {activeTab === "profissionais" && <TabProfissionais />}
            {activeTab === "servicos" && <TabServicos />}
            {activeTab === "categorias" && <TabCategorias />}
            {activeTab === "pagamento" && <TabPagamento />}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
