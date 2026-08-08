import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { missingCatalogTasks } from "@/modules/tasks/ensure-catalog";
import {
  featurePatchFromTask,
  taskIdsToAutoComplete,
} from "@/modules/tasks/feature-sync";
import { loadWorkspaceForUser } from "@/modules/wedding/load-workspace";
import type { Task } from "@/types/domain";

function dateStr(d: Date | null | undefined): string | null {
  if (!d) return null;
  return d.toISOString().slice(0, 10);
}

/** Insert any missing default checklist tasks for the current wedding. */
export async function ensureWeddingTaskCatalog(input: {
  workspaceId: string;
  weddingId: string;
}): Promise<number> {
  const [wedding, tasks, budgetItems, categories] = await Promise.all([
    prisma.wedding.findUnique({ where: { id: input.weddingId } }),
    prisma.task.findMany({
      where: { weddingId: input.weddingId, deletedAt: null },
      select: { templateKey: true },
    }),
    prisma.budgetItem.findMany({
      where: { weddingId: input.weddingId, deletedAt: null },
      select: { id: true, categoryId: true },
    }),
    prisma.budgetCategory.findMany({
      where: { weddingId: input.weddingId },
      select: { id: true, slug: true },
    }),
  ]);

  if (!wedding) return 0;

  const slugByCategoryId = Object.fromEntries(
    categories.map((c) => [c.id, c.slug]),
  );
  const budgetItemIdBySlug: Record<string, string> = {};
  for (const item of budgetItems) {
    const slug = slugByCategoryId[item.categoryId];
    if (slug && !budgetItemIdBySlug[slug]) budgetItemIdBySlug[slug] = item.id;
  }

  const existing = new Set(
    tasks.map((t) => t.templateKey).filter(Boolean) as string[],
  );
  const missing = missingCatalogTasks({
    weddingDate: dateStr(wedding.weddingDate),
    existingTemplateKeys: existing,
    budgetItemIdBySlug,
  });

  if (missing.length === 0) return 0;

  await prisma.task.createMany({
    data: missing.map((t) => ({
      id: t.id,
      workspaceId: input.workspaceId,
      weddingId: input.weddingId,
      title: t.title,
      description: t.description,
      phase: t.phase,
      categorySlug: t.categorySlug,
      priority: t.priority,
      dueDate: t.dueDate,
      status: "todo",
      isMilestone: t.isMilestone,
      templateKey: t.templateKey,
      budgetItemId: t.budgetItemId,
      sortOrder: t.sortOrder,
    })),
  });

  return missing.length;
}

/** Complete open tasks whose linked features are already filled. */
export async function syncTasksFromFeatures(): Promise<number> {
  const { workspace } = await loadWorkspaceForUser();
  if (!workspace) return 0;
  const ids = taskIdsToAutoComplete(workspace);
  if (ids.length === 0) return 0;
  await prisma.task.updateMany({
    where: { id: { in: ids } },
    data: { status: "done" },
  });
  return ids.length;
}

/** Apply task answers into wedding modules (budget, venue, vendors…). */
export async function syncFeaturesFromTask(
  task: Task,
  ctx: { workspaceId: string; weddingId: string },
): Promise<void> {
  const { workspace } = await loadWorkspaceForUser();
  if (!workspace) return;

  const patch = featurePatchFromTask(task, workspace);
  if (!patch) return;

  if (patch.wedding) {
    await prisma.wedding.update({
      where: { id: ctx.weddingId },
      data: {
        ...(patch.wedding.totalBudget != null
          ? { totalBudget: patch.wedding.totalBudget }
          : {}),
        ...(patch.wedding.weddingDate != null
          ? { weddingDate: new Date(patch.wedding.weddingDate + "T12:00:00") }
          : {}),
        ...(patch.wedding.venue != null ? { venue: patch.wedding.venue } : {}),
        ...(patch.wedding.styleTags != null
          ? { styleTags: patch.wedding.styleTags }
          : {}),
      },
    });
  }

  if (patch.vendor) {
    const existing = await prisma.vendor.findFirst({
      where: {
        weddingId: ctx.weddingId,
        deletedAt: null,
        categorySlug: patch.vendor.categorySlug,
        name: patch.vendor.name,
      },
    });
    if (existing) {
      await prisma.vendor.update({
        where: { id: existing.id },
        data: {
          quotedAmount: patch.vendor.quotedAmount ?? existing.quotedAmount,
          contractedAmount:
            patch.vendor.contractedAmount ?? existing.contractedAmount,
          status: patch.vendor.status ?? existing.status,
        },
      });
    } else {
      await prisma.vendor.create({
        data: {
          id: randomUUID(),
          workspaceId: ctx.workspaceId,
          weddingId: ctx.weddingId,
          categorySlug: patch.vendor.categorySlug,
          name: patch.vendor.name,
          quotedAmount: patch.vendor.quotedAmount ?? null,
          contractedAmount: patch.vendor.contractedAmount ?? null,
          status: patch.vendor.status ?? "contracted",
        },
      });
    }
  }

  if (patch.budgetItem) {
    const category = await prisma.budgetCategory.findFirst({
      where: {
        weddingId: ctx.weddingId,
        slug: patch.budgetItem.categorySlug,
      },
    });
    if (!category) return;

    const existingItem = await prisma.budgetItem.findFirst({
      where: {
        weddingId: ctx.weddingId,
        categoryId: category.id,
        deletedAt: null,
      },
      orderBy: { sortOrder: "asc" },
    });

    if (existingItem) {
      await prisma.budgetItem.update({
        where: { id: existingItem.id },
        data: {
          ...(patch.budgetItem.plannedAmount != null
            ? { plannedAmount: patch.budgetItem.plannedAmount }
            : {}),
          ...(patch.budgetItem.contractedAmount !== undefined
            ? { contractedAmount: patch.budgetItem.contractedAmount }
            : {}),
          ...(patch.budgetItem.description
            ? { description: patch.budgetItem.description }
            : {}),
          ...(patch.budgetItem.vendorId !== undefined
            ? { vendorId: patch.budgetItem.vendorId }
            : {}),
          ...(patch.budgetItem.status
            ? { status: patch.budgetItem.status }
            : {}),
        },
      });
    } else if (patch.budgetItem.plannedAmount != null) {
      await prisma.budgetItem.create({
        data: {
          id: randomUUID(),
          workspaceId: ctx.workspaceId,
          weddingId: ctx.weddingId,
          categoryId: category.id,
          description: patch.budgetItem.description ?? patch.budgetItem.categorySlug,
          plannedAmount: patch.budgetItem.plannedAmount,
          contractedAmount: patch.budgetItem.contractedAmount ?? null,
          vendorId: patch.budgetItem.vendorId ?? null,
          status: patch.budgetItem.status ?? "planned",
        },
      });
    }
  }
}

/** Ensure catalog + feature→task sync for the active wedding. */
export async function ensureCatalogAndSyncFeatures(input: {
  workspaceId: string;
  weddingId: string;
}): Promise<void> {
  await ensureWeddingTaskCatalog(input);
  await syncTasksFromFeatures();
}
