import { randomUUID } from "crypto";
import {
  BUDGET_ALLOCATION_BENCHMARK,
  BUDGET_CATEGORY_SEED,
  PHASE_OFFSET_DAYS,
  TASK_TEMPLATE_SEED,
} from "@/prisma/seed-catalog";
import { prismaDirect } from "@/lib/prisma-direct";
import type { TaskPhase } from "@prisma/client";
import type { WeddingWorkspace } from "@/types/domain";

function subtractDays(isoDate: string, days: number): Date {
  const d = new Date(isoDate + "T12:00:00");
  d.setDate(d.getDate() - days);
  return d;
}

function dateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export type OnboardingInput = {
  partnerOneName: string;
  partnerTwoName: string;
  weddingDate: string;
  totalBudgetCents: number;
  city: string;
  venue?: string;
  styleTags?: string[];
};

type SeedPlan = {
  workspaceId: string;
  weddingId: string;
  cateringItemId: string;
  decisionId: string;
  categories: { id: string; slug: string; name: string; sortOrder: number }[];
  seedBudget: {
    id: string;
    slug: string;
    description: string;
    pct: number;
    priority: number;
    flexibility: "cannot_cut" | "can_reduce" | "can_remove";
    emotionalReturn: number;
  }[];
  tasks: {
    id: string;
    title: string;
    phase: TaskPhase;
    categorySlug: string | null;
    priority: number;
    dueDate: Date;
    isMilestone: boolean;
    templateKey: string;
    budgetItemId: string | null;
  }[];
  input: OnboardingInput;
  name: string;
};

const SEED_META: Record<
  string,
  {
    description: string;
    priority: number;
    flexibility: "cannot_cut" | "can_reduce" | "can_remove";
    emotionalReturn: number;
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
    emotionalReturn: 4,
  },
  honeymoon: {
    description: "Lua de mel",
    priority: 3,
    flexibility: "can_reduce",
    emotionalReturn: 5,
  },
  contingency: {
    description: "Reserva / contingência",
    priority: 3,
    flexibility: "can_remove",
    emotionalReturn: 2,
  },
  stationery: {
    description: "Convites e papelaria",
    priority: 3,
    flexibility: "can_reduce",
    emotionalReturn: 3,
  },
  favors: {
    description: "Lembrancinhas",
    priority: 1,
    flexibility: "can_remove",
    emotionalReturn: 2,
  },
};

function buildSeedPlan(
  input: OnboardingInput,
): SeedPlan & { name: string } {
  const name =
    input.partnerOneName && input.partnerTwoName
      ? `${input.partnerOneName} & ${input.partnerTwoName}`
      : input.partnerOneName || "Nosso casamento";

  const cateringItemId = randomUUID();
  const categories = BUDGET_CATEGORY_SEED.map((c) => ({
    id: randomUUID(),
    slug: c.slug,
    name: c.name,
    sortOrder: c.sortOrder,
  }));

  const seedBudget = Object.entries(BUDGET_ALLOCATION_BENCHMARK).map(
    ([slug, pct]) => {
      const meta = SEED_META[slug] ?? {
        description: BUDGET_CATEGORY_SEED.find((c) => c.slug === slug)?.name ?? slug,
        priority: 3,
        flexibility: "can_reduce" as const,
        emotionalReturn: 3,
      };
      return {
        id: slug === "catering" ? cateringItemId : randomUUID(),
        slug,
        description: meta.description,
        pct: pct / 100,
        priority: meta.priority,
        flexibility: meta.flexibility,
        emotionalReturn: meta.emotionalReturn,
      };
    },
  );

  // Ensure stationery/favors appear even if not in benchmark
  for (const extra of ["stationery", "favors"] as const) {
    if (!seedBudget.some((b) => b.slug === extra)) {
      const meta = SEED_META[extra];
      seedBudget.push({
        id: randomUUID(),
        slug: extra,
        description: meta.description,
        pct: extra === "stationery" ? 0.02 : 0.015,
        priority: meta.priority,
        flexibility: meta.flexibility,
        emotionalReturn: meta.emotionalReturn,
      });
    }
  }

  const budgetBySlug = Object.fromEntries(
    seedBudget.map((b) => [b.slug, b.id]),
  ) as Record<string, string>;

  return {
    name,
    workspaceId: randomUUID(),
    weddingId: randomUUID(),
    cateringItemId,
    decisionId: randomUUID(),
    categories,
    seedBudget,
    tasks: TASK_TEMPLATE_SEED.map((t) => ({
      id: randomUUID(),
      title: t.title,
      phase: t.phase as TaskPhase,
      categorySlug: t.categorySlug ?? null,
      priority: t.priority,
      dueDate: subtractDays(input.weddingDate, PHASE_OFFSET_DAYS[t.phase]),
      isMilestone: Boolean(t.isMilestone),
      templateKey: t.templateKey,
      budgetItemId: t.categorySlug ? budgetBySlug[t.categorySlug] ?? null : null,
    })),
    input,
  };
}

function toWorkspace(plan: SeedPlan): WeddingWorkspace {
  const categoryIds = Object.fromEntries(
    plan.categories.map((c) => [c.slug, c.id]),
  ) as Record<string, string>;

  return {
    wedding: {
      name: plan.name,
      partnerOneName: plan.input.partnerOneName,
      partnerTwoName: plan.input.partnerTwoName,
      weddingDate: plan.input.weddingDate,
      totalBudget: plan.input.totalBudgetCents,
      city: plan.input.city,
      venue: plan.input.venue ?? "",
      styleTags: plan.input.styleTags ?? [],
      onboardingDone: true,
    },
    categories: plan.categories.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      sortOrder: c.sortOrder,
    })),
    budgetItems: plan.seedBudget.map((item) => ({
      id: item.id,
      categoryId: categoryIds[item.slug],
      description: item.description,
      plannedAmount: Math.round(plan.input.totalBudgetCents * item.pct),
      contractedAmount: null,
      paidAmount: 0,
      nextPaymentDate: null,
      vendorId: null,
      notes: "",
      status: "planned" as const,
      priority: item.priority as 1 | 2 | 3 | 4 | 5,
      flexibility: item.flexibility,
      emotionalReturn: item.emotionalReturn as 1 | 2 | 3 | 4 | 5,
    })),
    vendors: [],
    tasks: plan.tasks.map((t) => ({
      id: t.id,
      title: t.title,
      description: "",
      phase: t.phase,
      categorySlug: t.categorySlug,
      priority: t.priority as 1 | 2 | 3 | 4 | 5,
      dueDate: dateStr(t.dueDate),
      startDate: null,
      status: "todo" as const,
      isMilestone: t.isMilestone,
      assignee: null,
      vendorId: null,
      budgetItemId: t.budgetItemId,
      templateKey: t.templateKey,
      budgetOptions: [],
    })),
    guests: [],
    gifts: [],
    decisions: [
      {
        id: plan.decisionId,
        title: "Escolher buffet",
        categorySlug: "catering",
        status: "pending" as const,
        optionsConsidered: "",
        chosenOption: "",
        rationale: "",
        dueDate: dateStr(subtractDays(plan.input.weddingDate, 180)),
        decidedAt: null,
        vendorId: null,
        budgetItemId: plan.cateringItemId,
        emotionalReturn: 4 as const,
      },
    ],
    documents: [],
    honeymoonItems: [],
  };
}

/** Critical path only — wedding + budget ready for dashboard. */
export async function createWeddingOnboarding(
  userId: string,
  email: string,
  input: OnboardingInput,
) {
  const plan = buildSeedPlan(input);
  const categoryIds = Object.fromEntries(
    plan.categories.map((c) => [c.slug, c.id]),
  ) as Record<string, string>;

  await prismaDirect.profile.upsert({
    where: { id: userId },
    create: { id: userId, email, fullName: input.partnerOneName },
    update: { fullName: input.partnerOneName },
  });

  await prismaDirect.workspace.create({
    data: {
      id: plan.workspaceId,
      name: plan.name,
      memberships: { create: { userId, role: "owner" } },
      weddings: {
        create: {
          id: plan.weddingId,
          name: plan.name,
          partnerOneName: input.partnerOneName,
          partnerTwoName: input.partnerTwoName || null,
          weddingDate: new Date(input.weddingDate + "T12:00:00"),
          totalBudget: input.totalBudgetCents,
          city: input.city,
          venue: input.venue || null,
          styleTags: input.styleTags ?? [],
          status: "planning",
          onboardingDone: true,
        },
      },
    },
  });

  await prismaDirect.budgetCategory.createMany({
    data: plan.categories.map((c) => ({
      id: c.id,
      weddingId: plan.weddingId,
      slug: c.slug,
      name: c.name,
      sortOrder: c.sortOrder,
      isSystem: true,
    })),
  });

  await prismaDirect.budgetItem.createMany({
    data: plan.seedBudget.map((item) => ({
      id: item.id,
      workspaceId: plan.workspaceId,
      weddingId: plan.weddingId,
      categoryId: categoryIds[item.slug],
      description: item.description,
      plannedAmount: Math.round(input.totalBudgetCents * item.pct),
      status: "planned",
      priority: item.priority,
      flexibility: item.flexibility,
      emotionalReturn: item.emotionalReturn,
    })),
  });

  return {
    workspaceId: plan.workspaceId,
    weddingId: plan.weddingId,
    workspace: toWorkspace(plan),
    plan,
  };
}

/** Checklist + first decision — safe to run after the HTTP response. */
export async function seedOnboardingExtras(plan: SeedPlan) {
  await Promise.all([
    prismaDirect.task.createMany({
      data: plan.tasks.map((t) => ({
        id: t.id,
        workspaceId: plan.workspaceId,
        weddingId: plan.weddingId,
        title: t.title,
        phase: t.phase,
        categorySlug: t.categorySlug,
        priority: t.priority,
        dueDate: t.dueDate,
        status: "todo",
        isMilestone: t.isMilestone,
        templateKey: t.templateKey,
        budgetItemId: t.budgetItemId,
      })),
    }),
    prismaDirect.decision.create({
      data: {
        id: plan.decisionId,
        workspaceId: plan.workspaceId,
        weddingId: plan.weddingId,
        title: "Escolher buffet",
        categorySlug: "catering",
        status: "pending",
        dueDate: subtractDays(plan.input.weddingDate, 180),
        budgetItemId: plan.cateringItemId,
        emotionalReturn: 4,
      },
    }),
  ]);
}
