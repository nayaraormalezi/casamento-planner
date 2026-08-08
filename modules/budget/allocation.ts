import { BUDGET_ALLOCATION_BENCHMARK } from "@/prisma/seed-catalog";
import type { BudgetItem, Flexibility, Priority, WeddingWorkspace } from "@/types/domain";

export type AllocationAction = "create" | "update" | "skip";

export type AllocationLine = {
  slug: string;
  categoryId: string;
  categoryName: string;
  pct: number;
  targetCents: number;
  currentCents: number;
  deltaCents: number;
  action: AllocationAction;
  itemId: string | null;
  description: string;
  priority: Priority;
  flexibility: Flexibility;
  emotionalReturn: Priority;
  skipReason?: string;
};

export type AllocationPlan = {
  totalBudget: number;
  lines: AllocationLine[];
  totalTarget: number;
  createCount: number;
  updateCount: number;
  skipCount: number;
};

const META: Record<
  string,
  {
    description: string;
    priority: Priority;
    flexibility: Flexibility;
    emotionalReturn: Priority;
  }
> = {
  venue: {
    description: "Local da festa",
    priority: 5,
    flexibility: "cannot_cut",
    emotionalReturn: 5,
  },
  catering: {
    description: "Buffet",
    priority: 5,
    flexibility: "can_reduce",
    emotionalReturn: 4,
  },
  decoration: {
    description: "Decoração",
    priority: 4,
    flexibility: "can_reduce",
    emotionalReturn: 4,
  },
  photo_video: {
    description: "Foto e vídeo",
    priority: 5,
    flexibility: "can_reduce",
    emotionalReturn: 5,
  },
  music: {
    description: "Música / DJ",
    priority: 4,
    flexibility: "can_reduce",
    emotionalReturn: 4,
  },
  attire: {
    description: "Trajes",
    priority: 4,
    flexibility: "can_reduce",
    emotionalReturn: 5,
  },
  honeymoon: {
    description: "Lua de mel",
    priority: 3,
    flexibility: "can_reduce",
    emotionalReturn: 5,
  },
  contingency: {
    description: "Reserva / contingência",
    priority: 4,
    flexibility: "cannot_cut",
    emotionalReturn: 2,
  },
};

function activeItems(ws: WeddingWorkspace, categoryId: string): BudgetItem[] {
  return ws.budgetItems.filter(
    (i) => i.categoryId === categoryId && i.status !== "cancelled",
  );
}

function pickPrimaryItem(items: BudgetItem[]): BudgetItem | null {
  if (items.length === 0) return null;
  return [...items].sort((a, b) => b.plannedAmount - a.plannedAmount)[0] ?? null;
}

/**
 * Build a BR-benchmark allocation plan for the wedding total budget.
 * Existing category pots are updated; missing categories get a new planned item.
 */
export function proposeBudgetAllocation(ws: WeddingWorkspace): AllocationPlan {
  const totalBudget = ws.wedding.totalBudget;
  const entries = Object.entries(BUDGET_ALLOCATION_BENCHMARK);
  const raw = entries.map(([slug, pct]) => ({
    slug,
    pct,
    target: Math.round((totalBudget * pct) / 100),
  }));

  // Fix rounding so sum matches total of benchmark share
  const benchmarkPctSum = entries.reduce((a, [, p]) => a + p, 0);
  const benchmarkTarget = Math.round((totalBudget * benchmarkPctSum) / 100);
  let assigned = raw.reduce((a, r) => a + r.target, 0);
  if (raw.length > 0 && assigned !== benchmarkTarget) {
    raw[0].target += benchmarkTarget - assigned;
    assigned = benchmarkTarget;
  }

  const lines: AllocationLine[] = raw.map(({ slug, pct, target }) => {
    const category = ws.categories.find((c) => c.slug === slug);
    const meta = META[slug] ?? {
      description: category?.name ?? slug,
      priority: 3 as Priority,
      flexibility: "can_reduce" as Flexibility,
      emotionalReturn: 3 as Priority,
    };

    if (!category) {
      return {
        slug,
        categoryId: "",
        categoryName: slug,
        pct,
        targetCents: target,
        currentCents: 0,
        deltaCents: target,
        action: "skip" as const,
        itemId: null,
        description: meta.description,
        priority: meta.priority,
        flexibility: meta.flexibility,
        emotionalReturn: meta.emotionalReturn,
        skipReason: "Categoria não encontrada no casamento",
      };
    }

    const items = activeItems(ws, category.id);
    const currentCents = items.reduce((a, i) => a + i.plannedAmount, 0);
    const contractedFloor = items.reduce(
      (a, i) => a + (i.contractedAmount ?? 0),
      0,
    );
    const primary = pickPrimaryItem(items);

    if (contractedFloor > target) {
      return {
        slug,
        categoryId: category.id,
        categoryName: category.name,
        pct,
        targetCents: target,
        currentCents,
        deltaCents: target - currentCents,
        action: "skip",
        itemId: primary?.id ?? null,
        description: primary?.description ?? meta.description,
        priority: meta.priority,
        flexibility: meta.flexibility,
        emotionalReturn: meta.emotionalReturn,
        skipReason: "Já contratado acima da sugestão — mantemos o valor atual",
      };
    }

    if (!primary) {
      return {
        slug,
        categoryId: category.id,
        categoryName: category.name,
        pct,
        targetCents: target,
        currentCents: 0,
        deltaCents: target,
        action: "create",
        itemId: null,
        description: meta.description,
        priority: meta.priority,
        flexibility: meta.flexibility,
        emotionalReturn: meta.emotionalReturn,
      };
    }

    // Adjust primary so category sum ≈ target (other items stay)
    const othersSum = currentCents - primary.plannedAmount;
    const primaryTarget = Math.max(contractedFloor - othersSum, target - othersSum);

    return {
      slug,
      categoryId: category.id,
      categoryName: category.name,
      pct,
      targetCents: target,
      currentCents,
      deltaCents: target - currentCents,
      action: primary.plannedAmount === primaryTarget ? "skip" : "update",
      itemId: primary.id,
      description: primary.description,
      priority: primary.priority,
      flexibility: primary.flexibility,
      emotionalReturn: primary.emotionalReturn,
      skipReason:
        primary.plannedAmount === primaryTarget
          ? "Já está no valor sugerido"
          : undefined,
    };
  });

  return {
    totalBudget,
    lines,
    totalTarget: lines
      .filter((l) => l.action !== "skip")
      .reduce((a, l) => a + l.targetCents, 0)
      + lines
        .filter((l) => l.action === "skip")
        .reduce((a, l) => a + l.currentCents, 0),
    createCount: lines.filter((l) => l.action === "create").length,
    updateCount: lines.filter((l) => l.action === "update").length,
    skipCount: lines.filter((l) => l.action === "skip").length,
  };
}

export type AllocationWrite =
  | {
      type: "create";
      item: Omit<BudgetItem, "id"> & { id?: string };
    }
  | {
      type: "update";
      id: string;
      plannedAmount: number;
    };

/** Turn plan lines into concrete writes (IDs filled by caller/action). */
export function allocationWrites(
  ws: WeddingWorkspace,
  plan: AllocationPlan,
): AllocationWrite[] {
  const writes: AllocationWrite[] = [];

  for (const line of plan.lines) {
    if (line.action === "skip") continue;

    if (line.action === "create") {
      writes.push({
        type: "create",
        item: {
          categoryId: line.categoryId,
          description: line.description,
          plannedAmount: line.targetCents,
          contractedAmount: null,
          paidAmount: 0,
          nextPaymentDate: null,
          vendorId: null,
          notes: "Distribuição sugerida pelo assistente",
          status: "planned",
          priority: line.priority,
          flexibility: line.flexibility,
          emotionalReturn: line.emotionalReturn,
        },
      });
      continue;
    }

    if (line.action === "update" && line.itemId) {
      const items = activeItems(ws, line.categoryId);
      const primary = items.find((i) => i.id === line.itemId);
      if (!primary) continue;
      const othersSum = items
        .filter((i) => i.id !== primary.id)
        .reduce((a, i) => a + i.plannedAmount, 0);
      const contractedFloor = primary.contractedAmount ?? 0;
      const plannedAmount = Math.max(
        contractedFloor,
        line.targetCents - othersSum,
      );
      writes.push({
        type: "update",
        id: primary.id,
        plannedAmount,
      });
    }
  }

  return writes;
}
