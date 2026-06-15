"use client";

import Link from "next/link";
import { UserPlus, Pencil, Mail, Phone, GripVertical, Eye, EyeOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader, EmptyState, Loading } from "@/components/shared";
import { useAuth } from "@/hooks/useAuth";
import { useEmployees } from "@/hooks/useEmployees";
import { useLocalProfessionalPhotos } from "@/hooks/useLocalProfessionalPhotos";
import { apiAssetUrl } from "@/lib/api";
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
import type { Employee } from "@/types/employee.types";

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

function SortableEmployeeRow({
  e,
  foto,
  onFeatured,
  onHidden,
}: {
  e: Employee;
  foto: string | null;
  onFeatured: (id: string, v: boolean) => void;
  onHidden: (id: string, v: boolean) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: e.id });
  return (
    <TableRow
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
      className="border-border hover:bg-surface-elevated/50 transition-colors"
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
      <TableCell className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div
            className="size-9 rounded-full bg-brand/15 border border-brand/30 grid place-items-center shrink-0 bg-cover bg-center overflow-hidden"
            style={foto ? { backgroundImage: `url(${foto})` } : undefined}
          >
            {!foto && (
              <span className="text-[10px] font-bold text-brand">
                {getInitials(e.appName || e.name)}
              </span>
            )}
          </div>
          <div>
            <Link
              href={`/professionals/${e.id}`}
              className="font-semibold text-foreground hover:text-brand transition-colors text-sm"
            >
              {e.name}
            </Link>
            <p className="text-xs text-text-faint">{e.appName}</p>
          </div>
        </div>
      </TableCell>
      <TableCell className="px-4 py-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Mail className="size-3" />
          {e.email}
        </div>
        {e.phone && (
          <div className="flex items-center gap-1.5 mt-0.5">
            <Phone className="size-3" />
            {e.phone}
          </div>
        )}
      </TableCell>
      <TableCell className="px-4 py-4">
        <div className="flex justify-center">
          <Checkbox
            checked={e.featured}
            onCheckedChange={(c) => onFeatured(e.id, c === true)}
            aria-label="Marcar como destaque"
            className="cursor-pointer"
          />
        </div>
      </TableCell>
      <TableCell className="px-4 py-4">
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => onHidden(e.id, !e.hidden)}
            aria-label={e.hidden ? "Tornar visível" : "Ocultar profissional"}
            title={e.hidden ? "Oculto — clique para tornar visível" : "Visível — clique para ocultar"}
            className={`transition-colors ${e.hidden ? "text-muted-foreground/40 hover:text-muted-foreground" : "text-foreground hover:text-muted-foreground"}`}
          >
            {e.hidden ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </TableCell>
      <TableCell className="px-4 py-4">
        <Link
          href={`/professionals/${e.id}`}
          title="Editar profissional"
          className="text-muted-foreground hover:text-brand transition-colors flex w-fit"
        >
          <Pencil className="size-4" />
        </Link>
      </TableCell>
    </TableRow>
  );
}

export default function ProfessionalsPage() {
  const { barbershop } = useAuth();
  const { employees, isLoading, setFeatured, setHidden, reorder } = useEmployees(barbershop?.id);
  const localPhotos = useLocalProfessionalPhotos(
    barbershop?.id,
    employees.map((e) => e.id),
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const ids = employees.map((e) => e.id);
    const oldIndex = ids.indexOf(active.id as string);
    const newIndex = ids.indexOf(over.id as string);
    reorder(arrayMove(ids, oldIndex, newIndex));
  }

  return (
    <div className="space-y-5 p-4 md:p-6 bg-surface-base min-h-screen text-foreground">
      <PageHeader
        title="Profissionais"
        subtitle="Equipe e configurações de atendimento"
        actions={
          <Link
            href="/professionals/new"
            className="h-9 px-4 rounded-md text-sm font-bold bg-brand text-brand-foreground hover:bg-brand-hover transition-colors flex items-center gap-1.5"
          >
            <UserPlus className="size-3.5" />
            Novo profissional
          </Link>
        }
      />

      <Card className="bg-surface-raised border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="border-t border-border">
                <TableRow className="border-border hover:bg-transparent">
                  {["", "Profissional", "Contato", "Destaque", "Visível", ""].map((col, i) => (
                    <TableHead
                      key={col || `c-${i}`}
                      className={`text-muted-foreground text-xs uppercase tracking-wider font-semibold px-4 py-3 h-auto ${
                        col === "Destaque" || col === "Visível" ? "text-center" : ""
                      }`}
                    >
                      {col}
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
                  items={employees.map((e) => e.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <TableBody>
                    {isLoading ? (
                      <TableRow className="border-border hover:bg-transparent">
                        <TableCell colSpan={6} className="py-4">
                          <Loading />
                        </TableCell>
                      </TableRow>
                    ) : employees.length === 0 ? (
                      <TableRow className="border-border hover:bg-transparent">
                        <TableCell colSpan={6} className="py-4">
                          <EmptyState message="Nenhum profissional cadastrado." />
                        </TableCell>
                      </TableRow>
                    ) : (
                      employees.map((e) => {
                        const foto =
                          apiAssetUrl(e.avatarUrl) ?? localPhotos[e.id] ?? null;
                        return (
                          <SortableEmployeeRow
                            key={e.id}
                            e={e}
                            foto={foto}
                            onFeatured={setFeatured}
                            onHidden={setHidden}
                          />
                        );
                      })
                    )}
                  </TableBody>
                </SortableContext>
              </DndContext>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
