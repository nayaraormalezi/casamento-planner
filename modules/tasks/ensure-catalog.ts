import { randomUUID } from "crypto";
import {
  TASK_TEMPLATE_SEED,
  taskSeedDescription,
  type TaskSeed,
} from "@/prisma/seed-catalog";
import type { TaskPhase } from "@prisma/client";

function subtractDays(isoDate: string, days: number): Date {
  const d = new Date(isoDate + "T12:00:00");
  d.setDate(d.getDate() - days);
  return d;
}

export type EnsureCatalogTask = {
  id: string;
  title: string;
  description: string;
  phase: TaskPhase;
  categorySlug: string | null;
  priority: number;
  dueDate: Date | null;
  isMilestone: boolean;
  templateKey: string;
  budgetItemId: string | null;
  sortOrder: number;
};

/** Build missing default tasks for an existing wedding. */
export function missingCatalogTasks(input: {
  weddingDate: string | null;
  existingTemplateKeys: Set<string>;
  budgetItemIdBySlug: Record<string, string>;
}): EnsureCatalogTask[] {
  const missing: EnsureCatalogTask[] = [];

  TASK_TEMPLATE_SEED.forEach((seed: TaskSeed, index) => {
    if (input.existingTemplateKeys.has(seed.templateKey)) return;
    missing.push({
      id: randomUUID(),
      title: seed.title,
      description: taskSeedDescription(seed),
      phase: (seed.phase ?? "m6") as TaskPhase,
      categorySlug: seed.categorySlug ?? null,
      priority: seed.priority,
      dueDate: input.weddingDate
        ? subtractDays(input.weddingDate, seed.dueOffsetDays)
        : null,
      isMilestone: Boolean(seed.isMilestone),
      templateKey: seed.templateKey,
      budgetItemId: seed.categorySlug
        ? input.budgetItemIdBySlug[seed.categorySlug] ?? null
        : null,
      sortOrder: index,
    });
  });

  return missing;
}
