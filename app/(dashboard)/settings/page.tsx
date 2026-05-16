"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Building2,
  Users,
  Scissors,
  MapPin,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import { useAuth } from "@/hooks/useAuth";
import { useBranches } from "@/hooks/useBranches";
import { useEmployees } from "@/hooks/useEmployees";
import { useServices } from "@/hooks/useServices";
import { barbershopsService } from "@/services/barbershops.service";
import type { Branch, CreateBranchPayload } from "@/types/branch.types";
import type {
  CreateEmployeePayload,
  Employee,
} from "@/types/employee.types";
import type {
  CreateServicePayload,
  Service,
} from "@/types/service.types";
import { maskPhone } from "@/utils/format";

type TabKey = "empresa" | "filiais" | "profissionais" | "servicos";

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: "empresa", label: "Empresa", icon: <Building2 className="size-3.5" /> },
  { key: "filiais", label: "Filiais", icon: <MapPin className="size-3.5" /> },
  {
    key: "profissionais",
    label: "Profissionais",
    icon: <Users className="size-3.5" />,
  },
  { key: "servicos", label: "Serviços", icon: <Scissors className="size-3.5" /> },
];

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

function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/** Converte string "12,34" / "R$ 12,34" em centavos (1234). */
function parseBRLToCents(input: string): number {
  const cleaned = input.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
  const num = parseFloat(cleaned);
  return Number.isFinite(num) ? Math.round(num * 100) : 0;
}

// ─── Tab: Empresa ─────────────────────────────────────────────────────────────

function TabEmpresa() {
  const { barbershop, updateBarbershop } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(barbershop?.name ?? "");
  const [phone, setPhone] = useState(barbershop?.phone ?? "");
  const [address, setAddress] = useState(barbershop?.address ?? "");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(barbershop?.name ?? "");
    setPhone(barbershop?.phone ?? "");
    setAddress(barbershop?.address ?? "");
  }, [barbershop?.id, barbershop?.name, barbershop?.phone, barbershop?.address]);

  function handleLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setLogoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
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

  if (!barbershop) {
    return (
      <p className="text-sm text-muted-foreground">Carregando informações…</p>
    );
  }

  return (
    <div className="max-w-lg space-y-5">
      <Card className="bg-surface-raised border-border">
        <CardContent className="p-5 space-y-5">
          {/* Logo (visual, não persistido pelo backend ainda) */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="size-16 rounded-xl bg-[#f5b82e]/20 border-2 border-dashed border-[#f5b82e]/30 flex items-center justify-center hover:border-[#f5b82e]/60 transition-colors overflow-hidden shrink-0"
            >
              {logoPreview ? (
                <img
                  src={logoPreview}
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
            </button>
            <div>
              <p className="text-base font-bold text-white">{barbershop.name}</p>
              <p
                className="text-xs text-muted-foreground mt-0.5 cursor-pointer hover:text-brand transition-colors"
                onClick={() => fileRef.current?.click()}
              >
                Clique no logo para alterar
              </p>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogo}
            />
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
              <p className="text-[10px] text-[#4d5562]">
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
            className="h-9 px-5 rounded-md text-sm font-bold bg-[#f5b82e] text-black hover:bg-[#d9a326] hover:shadow-[0_0_16px_rgba(245,184,46,0.3)] transition-all disabled:opacity-60"
          >
            {saving ? "Salvando…" : "Salvar Alterações"}
          </button>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Dialog: Filial ───────────────────────────────────────────────────────────

interface BranchFormState {
  email: string;
  phone: string;
  cep: string;
  street: string;
  neighborhood: string;
  city: string;
  uf: string;
  number: string;
  complement: string;
}

const EMPTY_BRANCH_FORM: BranchFormState = {
  email: "",
  phone: "",
  cep: "",
  street: "",
  neighborhood: "",
  city: "",
  uf: "",
  number: "",
  complement: "",
};

function DialogFilial({
  open,
  onOpenChange,
  branch,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  branch: Branch | null;
  onSave: (payload: CreateBranchPayload) => Promise<void>;
}) {
  const [form, setForm] = useState<BranchFormState>(EMPTY_BRANCH_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (branch) {
      setForm({
        email: branch.email,
        phone: branch.phone,
        cep: branch.cep,
        street: branch.street,
        neighborhood: branch.neighborhood,
        city: branch.city,
        uf: branch.uf,
        number: branch.number,
        complement: branch.complement ?? "",
      });
    } else {
      setForm(EMPTY_BRANCH_FORM);
    }
  }, [open, branch]);

  function update<K extends keyof BranchFormState>(
    key: K,
    value: BranchFormState[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    if (!form.email.trim()) return toast.error("Informe o e-mail.");
    if (!form.phone.trim()) return toast.error("Informe o telefone.");
    if (form.cep.replace(/\D/g, "").length < 8)
      return toast.error("CEP inválido.");
    if (!form.street.trim()) return toast.error("Informe a rua.");
    if (!form.neighborhood.trim()) return toast.error("Informe o bairro.");
    if (!form.city.trim()) return toast.error("Informe a cidade.");
    if (form.uf.length !== 2) return toast.error("UF deve ter 2 letras.");
    if (!form.number.trim()) return toast.error("Informe o número.");

    setSaving(true);
    try {
      await onSave({
        email: form.email.trim(),
        phone: form.phone.trim(),
        cep: form.cep.trim(),
        street: form.street.trim(),
        neighborhood: form.neighborhood.trim(),
        city: form.city.trim(),
        uf: form.uf.trim().toUpperCase(),
        number: form.number.trim(),
        complement: form.complement.trim() || undefined,
      });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface-raised border border-border text-white max-w-lg p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-[#21262d]">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-bold">
              {branch ? "Editar Filial" : "Nova Filial"}
            </DialogTitle>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="size-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-white hover:bg-[#21262d] transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        </DialogHeader>
        <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <FormLabel required>E-mail</FormLabel>
              <Input
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="filial@barbearia.com"
                className="bg-surface-base border-border text-white placeholder:text-[#4d5562] focus-visible:ring-[#f5b82e]/30 h-10"
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
                className="bg-surface-base border-border text-white placeholder:text-[#4d5562] focus-visible:ring-[#f5b82e]/30 h-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <FormLabel required>CEP</FormLabel>
              <Input
                value={form.cep}
                onChange={(e) => update("cep", e.target.value)}
                placeholder="00000-000"
                maxLength={9}
                className="bg-surface-base border-border text-white placeholder:text-[#4d5562] focus-visible:ring-[#f5b82e]/30 h-10"
              />
            </div>
            <div className="space-y-1.5 col-span-2">
              <FormLabel required>Rua</FormLabel>
              <Input
                value={form.street}
                onChange={(e) => update("street", e.target.value)}
                placeholder="Rua das Flores"
                className="bg-surface-base border-border text-white placeholder:text-[#4d5562] focus-visible:ring-[#f5b82e]/30 h-10"
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
                className="bg-surface-base border-border text-white placeholder:text-[#4d5562] focus-visible:ring-[#f5b82e]/30 h-10"
              />
            </div>
            <div className="space-y-1.5 col-span-2">
              <FormLabel>Complemento</FormLabel>
              <Input
                value={form.complement}
                onChange={(e) => update("complement", e.target.value)}
                placeholder="Sala 2"
                className="bg-surface-base border-border text-white placeholder:text-[#4d5562] focus-visible:ring-[#f5b82e]/30 h-10"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <FormLabel required>Bairro</FormLabel>
            <Input
              value={form.neighborhood}
              onChange={(e) => update("neighborhood", e.target.value)}
              placeholder="Centro"
              className="bg-surface-base border-border text-white placeholder:text-[#4d5562] focus-visible:ring-[#f5b82e]/30 h-10"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5 col-span-2">
              <FormLabel required>Cidade</FormLabel>
              <Input
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
                placeholder="Recife"
                className="bg-surface-base border-border text-white placeholder:text-[#4d5562] focus-visible:ring-[#f5b82e]/30 h-10"
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
                className="bg-surface-base border-border text-white placeholder:text-[#4d5562] focus-visible:ring-[#f5b82e]/30 h-10 uppercase"
              />
            </div>
          </div>
        </div>
        <div className="px-6 pb-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-9 px-5 rounded-md border border-border bg-transparent text-sm text-white hover:bg-[#21262d] transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="h-9 px-5 rounded-md text-sm font-bold bg-[#f5b82e] text-black hover:bg-[#d9a326] transition-colors disabled:opacity-60"
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
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#21262d]">
          <h2 className="text-sm font-bold text-white">Filiais</h2>
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setDialog(true);
            }}
            className="h-9 px-4 rounded-md text-xs font-bold bg-[#f5b82e] text-black hover:bg-[#d9a326] transition-all flex items-center gap-1.5"
          >
            <Plus className="size-3.5" />
            Nova Filial
          </button>
        </div>

        <div className="divide-y divide-[#21262d]">
          {isLoading ? (
            <div className="px-5 py-12 text-center text-sm text-[#4d5562]">
              Carregando…
            </div>
          ) : branches.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-[#4d5562]">
              Nenhuma filial cadastrada.
            </div>
          ) : (
            branches.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between px-5 py-4 hover:bg-[#21262d]/40 transition-colors"
              >
                <div>
                  <p className="text-sm font-semibold text-white">
                    {b.street}, {b.number}
                    {b.complement ? ` — ${b.complement}` : ""}
                  </p>
                  <p className="text-xs text-[#4d5562] mt-0.5">
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
      />
    </Card>
  );
}

// ─── Dialog: Profissional ─────────────────────────────────────────────────────

interface EmployeeFormState {
  name: string;
  email: string;
  phone: string;
}

const EMPTY_EMPLOYEE_FORM: EmployeeFormState = { name: "", email: "", phone: "" };

function DialogProfissional({
  open,
  onOpenChange,
  employee,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  employee: Employee | null;
  onSave: (payload: CreateEmployeePayload) => Promise<void>;
}) {
  const [form, setForm] = useState<EmployeeFormState>(EMPTY_EMPLOYEE_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (employee) {
      setForm({
        name: employee.name,
        email: employee.email ?? "",
        phone: employee.phone ?? "",
      });
    } else {
      setForm(EMPTY_EMPLOYEE_FORM);
    }
  }, [open, employee]);

  async function handleSave() {
    if (form.name.trim().length < 2) return toast.error("Informe o nome.");
    setSaving(true);
    try {
      await onSave({
        name: form.name.trim(),
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
      });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface-raised border border-border text-white max-w-md p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-[#21262d]">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-bold">
              {employee ? "Editar Profissional" : "Novo Profissional"}
            </DialogTitle>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="size-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-white hover:bg-[#21262d] transition-colors"
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
              onChange={(e) =>
                setForm((p) => ({ ...p, name: e.target.value }))
              }
              placeholder="Nome completo"
              className="bg-surface-base border-border text-white placeholder:text-[#4d5562] focus-visible:ring-[#f5b82e]/30 h-10"
            />
          </div>
          <div className="space-y-1.5">
            <FormLabel>E-mail</FormLabel>
            <Input
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm((p) => ({ ...p, email: e.target.value }))
              }
              placeholder="prof@email.com"
              className="bg-surface-base border-border text-white placeholder:text-[#4d5562] focus-visible:ring-[#f5b82e]/30 h-10"
            />
          </div>
          <div className="space-y-1.5">
            <FormLabel>Telefone</FormLabel>
            <Input
              value={form.phone}
              onChange={(e) =>
                setForm((p) => ({ ...p, phone: maskPhone(e.target.value) }))
              }
              inputMode="numeric"
              maxLength={15}
              placeholder="(81) 99999-0000"
              className="bg-surface-base border-border text-white placeholder:text-[#4d5562] focus-visible:ring-[#f5b82e]/30 h-10"
            />
          </div>
        </div>
        <div className="px-6 pb-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-9 px-5 rounded-md border border-border bg-transparent text-sm text-white hover:bg-[#21262d] transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="h-9 px-5 rounded-md text-sm font-bold bg-[#f5b82e] text-black hover:bg-[#d9a326] transition-colors disabled:opacity-60"
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
  const { employees, isLoading, create, update, remove } = useEmployees(
    barbershop?.id,
  );
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);

  async function handleSave(payload: CreateEmployeePayload) {
    if (editing) {
      await update(editing.id, payload);
    } else {
      await create(payload);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remover este profissional? Essa ação não pode ser desfeita.")) {
      return;
    }
    await remove(id);
  }

  return (
    <Card className="bg-surface-raised border-border">
      <CardContent className="p-0">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#21262d]">
          <h2 className="text-sm font-bold text-white">Profissionais</h2>
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setDialog(true);
            }}
            className="h-9 px-4 rounded-md text-xs font-bold bg-[#f5b82e] text-black hover:bg-[#d9a326] transition-all flex items-center gap-1.5"
          >
            <Plus className="size-3.5" />
            Novo
          </button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                {["Nome", "E-mail", "Telefone", ""].map((h) => (
                  <TableHead
                    key={h}
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
                  <td
                    colSpan={4}
                    className="py-12 text-center text-sm text-[#4d5562]"
                  >
                    Carregando…
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-12 text-center text-sm text-[#4d5562]"
                  >
                    Nenhum profissional cadastrado.
                  </td>
                </tr>
              ) : (
                employees.map((p) => (
                  <TableRow
                    key={p.id}
                    className="border-border hover:bg-[#21262d]/40 transition-colors"
                  >
                    <TableCell className="px-5 py-4 font-semibold text-white text-sm">
                      {p.name}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-muted-foreground text-sm">
                      {p.email || "—"}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-muted-foreground text-sm">
                      {p.phone || "—"}
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
      </CardContent>
      <DialogProfissional
        open={dialog}
        onOpenChange={setDialog}
        employee={editing}
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
}

const EMPTY_SERVICE_FORM: ServiceFormState = {
  name: "",
  description: "",
  durationMin: "30",
  priceBRL: "",
};

function DialogServico({
  open,
  onOpenChange,
  service,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  service: Service | null;
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
        priceBRL: (service.priceInCents / 100)
          .toFixed(2)
          .replace(".", ","),
      });
    } else {
      setForm(EMPTY_SERVICE_FORM);
    }
  }, [open, service]);

  async function handleSave() {
    if (form.name.trim().length < 2) return toast.error("Informe o nome do serviço.");
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
      });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface-raised border border-border text-white max-w-md p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-[#21262d]">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-bold">
              {service ? "Editar Serviço" : "Novo Serviço"}
            </DialogTitle>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="size-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-white hover:bg-[#21262d] transition-colors"
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
              onChange={(e) =>
                setForm((p) => ({ ...p, name: e.target.value }))
              }
              placeholder="Ex: Corte Masculino"
              className="bg-surface-base border-border text-white placeholder:text-[#4d5562] focus-visible:ring-[#f5b82e]/30 h-10"
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
              className="bg-surface-base border-border text-white placeholder:text-[#4d5562] focus-visible:ring-[#f5b82e]/30 h-10"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <FormLabel required>Duração (min)</FormLabel>
              <Input
                type="number"
                value={form.durationMin}
                onChange={(e) =>
                  setForm((p) => ({ ...p, durationMin: e.target.value }))
                }
                min={5}
                className="bg-surface-base border-border text-white focus-visible:ring-[#f5b82e]/30 h-10"
              />
            </div>
            <div className="space-y-1.5">
              <FormLabel required>Preço (R$)</FormLabel>
              <Input
                value={form.priceBRL}
                onChange={(e) =>
                  setForm((p) => ({ ...p, priceBRL: e.target.value }))
                }
                inputMode="decimal"
                placeholder="0,00"
                className="bg-surface-base border-border text-white placeholder:text-[#4d5562] focus-visible:ring-[#f5b82e]/30 h-10"
              />
            </div>
          </div>
        </div>
        <div className="px-6 pb-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-9 px-5 rounded-md border border-border bg-transparent text-sm text-white hover:bg-[#21262d] transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="h-9 px-5 rounded-md text-sm font-bold bg-[#f5b82e] text-black hover:bg-[#d9a326] transition-colors disabled:opacity-60"
          >
            {saving ? "Salvando…" : service ? "Salvar" : "Criar Serviço"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Tab: Serviços ────────────────────────────────────────────────────────────

function TabServicos() {
  const { barbershop } = useAuth();
  const { services, isLoading, create, update, remove } = useServices(
    barbershop?.id,
  );
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);

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

  return (
    <Card className="bg-surface-raised border-border">
      <CardContent className="p-0">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#21262d]">
          <h2 className="text-sm font-bold text-white">Serviços</h2>
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setDialog(true);
            }}
            className="h-9 px-4 rounded-md text-xs font-bold bg-[#f5b82e] text-black hover:bg-[#d9a326] transition-all flex items-center gap-1.5"
          >
            <Plus className="size-3.5" />
            Novo Serviço
          </button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                {["Serviço", "Descrição", "Duração", "Preço", ""].map((h) => (
                  <TableHead
                    key={h}
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
                  <td
                    colSpan={5}
                    className="py-12 text-center text-sm text-[#4d5562]"
                  >
                    Carregando…
                  </td>
                </tr>
              ) : services.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-12 text-center text-sm text-[#4d5562]"
                  >
                    Nenhum serviço cadastrado.
                  </td>
                </tr>
              ) : (
                services.map((s) => (
                  <TableRow
                    key={s.id}
                    className="border-border hover:bg-[#21262d]/40 transition-colors"
                  >
                    <TableCell className="px-5 py-4 font-semibold text-white text-sm">
                      {s.name}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-muted-foreground text-sm max-w-[280px] truncate">
                      {s.description || "—"}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-muted-foreground text-sm">
                      {s.durationMin} min
                    </TableCell>
                    <TableCell className="px-5 py-4 text-brand font-semibold text-sm">
                      {formatBRL(s.priceInCents)}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(s);
                            setDialog(true);
                          }}
                          className="size-7 rounded-md border border-border bg-surface-base text-muted-foreground flex items-center justify-center hover:border-[#f5b82e]/40 hover:text-brand transition-colors"
                        >
                          <Pencil className="size-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(s.id)}
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
      <DialogServico
        open={dialog}
        onOpenChange={setDialog}
        service={editing}
        onSave={handleSave}
      />
    </Card>
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
          Dados da empresa, filiais, profissionais e serviços
        </p>
      </div>

      <Card className="bg-surface-raised border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto border-b border-[#21262d]">
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
