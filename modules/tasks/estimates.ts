import { BUDGET_ALLOCATION_BENCHMARK } from "@/prisma/seed-catalog";
import type { Task, WeddingWorkspace } from "@/types/domain";
import { committedAmount } from "@/modules/budget/calculations";

export type TaskEstimate = {
  /** Suggested spend for this task in centavos */
  estimatedCents: number;
  /** Category pot used as base */
  categoryPotCents: number;
  /** How estimate was derived */
  basis: "budget_item" | "benchmark" | "total_budget" | "none";
  label: string;
};

/**
 * Suggest how much to spend on each task.
 * Category pot is split across open tasks in that category, weighted by priority (1–5).
 */
export function estimateTaskSpend(
  task: Task,
  ws: WeddingWorkspace,
): TaskEstimate {
  const total = ws.wedding.totalBudget;

  if (
    task.templateKey?.includes("set_budget") ||
    task.templateKey?.includes("review_payments")
  ) {
    return {
      estimatedCents: total,
      categoryPotCents: total,
      basis: "total_budget",
      label: "Orçamento total",
    };
  }

  const slug = task.categorySlug;
  if (!slug) {
    return {
      estimatedCents: 0,
      categoryPotCents: 0,
      basis: "none",
      label: "Sem custo direto",
    };
  }

  const category = ws.categories.find((c) => c.slug === slug);
  const items = category
    ? ws.budgetItems.filter(
        (i) => i.categoryId === category.id && i.status !== "cancelled",
      )
    : [];

  let pot = items.reduce((acc, i) => acc + committedAmount(i), 0);
  let basis: TaskEstimate["basis"] = "budget_item";

  if (pot <= 0) {
    const pct = BUDGET_ALLOCATION_BENCHMARK[slug];
    if (pct != null && total > 0) {
      pot = Math.round((total * pct) / 100);
      basis = "benchmark";
    }
  }

  if (pot <= 0) {
    return {
      estimatedCents: 0,
      categoryPotCents: 0,
      basis: "none",
      label: "Sem estimativa",
    };
  }

  const peers = ws.tasks.filter(
    (t) =>
      t.categorySlug === slug &&
      t.status !== "done",
  );
  const weightSum = peers.reduce((acc, t) => acc + t.priority, 0) || task.priority;
  const share =
    task.status === "done"
      ? 0
      : Math.round((pot * task.priority) / weightSum);

  return {
    estimatedCents: share,
    categoryPotCents: pot,
    basis,
    label:
      basis === "benchmark"
        ? `Sugestão (${BUDGET_ALLOCATION_BENCHMARK[slug]}% do teto)`
        : "Parte do orçamento da categoria",
  };
}

export function estimateAllTasks(ws: WeddingWorkspace) {
  return Object.fromEntries(
    ws.tasks.map((t) => [t.id, estimateTaskSpend(t, ws)]),
  ) as Record<string, TaskEstimate>;
}
