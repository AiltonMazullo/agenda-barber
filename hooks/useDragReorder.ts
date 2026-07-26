"use client";

import { useEffect, useState } from "react";
import {
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

interface UseDragReorderOptions {
  /**
   * Quando `true` (padrão), `onReorder` é chamado a cada drag (persiste
   * imediatamente). Quando `false`, apenas o estado local (`localItems`) é
   * atualizado — quem usa o hook decide quando persistir (ex.: botão "Salvar").
   */
  autoSave?: boolean;
}

interface UseDragReorderResult<T> {
  sensors: ReturnType<typeof useSensors>;
  handleDragEnd: (event: DragEndEvent) => void;
  /** Estado local otimista da lista, já refletindo o reorder mais recente. */
  localItems: T[];
}

/**
 * Hook genérico para listas arrastáveis (drag-and-drop reorder) com dnd-kit.
 * Encapsula os sensores, o `handleDragEnd` (via `arrayMove`) e um estado local
 * otimista, seguindo o mesmo padrão usado em `professionals`, `settings`
 * (aba Serviços) e `subscriptions` (aba Planos).
 *
 * `items` é a lista efetivamente renderizada em `SortableContext` — pode ser
 * a lista completa ou apenas a página atual, dependendo do caso de uso; quem
 * consome o hook é responsável por remapear `onReorder` de volta para a lista
 * completa quando `items` for apenas uma página.
 */
export function useDragReorder<T extends { id: string }>(
  items: T[],
  onReorder: (reordered: T[]) => void | Promise<void>,
  options?: UseDragReorderOptions,
): UseDragReorderResult<T> {
  const autoSave = options?.autoSave ?? true;
  const [localItems, setLocalItems] = useState<T[]>(items);

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const ids = localItems.map((i) => i.id);
    const oldIndex = ids.indexOf(active.id as string);
    const newIndex = ids.indexOf(over.id as string);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(localItems, oldIndex, newIndex);
    setLocalItems(reordered);

    if (autoSave) {
      void onReorder(reordered);
    }
  }

  return { sensors, handleDragEnd, localItems };
}
