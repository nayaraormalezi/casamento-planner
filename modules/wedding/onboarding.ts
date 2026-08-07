import {
  BUDGET_CATEGORY_SEED,
  PHASE_OFFSET_DAYS,
  TASK_TEMPLATE_SEED,
} from "@/prisma/seed-catalog";
import { prisma } from "@/lib/prisma";
import type { TaskPhase } from "@prisma/client";

function subtractDays(isoDate: string, days: number): Date {
  const d = new Date(isoDate + "T12:00:00");
  d.setDate(d.getDate() - days);
  return d;
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

export async function createWeddingOnboarding(
  userId: string,
  email: string,
  input: OnboardingInput,
) {
  const name =
    input.partnerOneName && input.partnerTwoName
      ? `${input.partnerOneName} & ${input.partnerTwoName}`
      : input.partnerOneName || "Nosso casamento";

  return prisma.$transaction(async (tx) => {
    await tx.profile.upsert({
      where: { id: userId },
      create: {
        id: userId,
        email,
        fullName: input.partnerOneName,
      },
      update: {
        fullName: input.partnerOneName,
      },
    });

    const workspace = await tx.workspace.create({
      data: {
        name,
        memberships: {
          create: {
            userId,
            role: "owner",
          },
        },
      },
    });

    const wedding = await tx.wedding.create({
      data: {
        workspaceId: workspace.id,
        name,
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
    });

    await tx.budgetCategory.createMany({
      data: BUDGET_CATEGORY_SEED.map((c) => ({
        weddingId: wedding.id,
        slug: c.slug,
        name: c.name,
        sortOrder: c.sortOrder,
        isSystem: true,
      })),
    });

    const categories = await tx.budgetCategory.findMany({
      where: { weddingId: wedding.id },
    });
    const catBySlug = Object.fromEntries(categories.map((c) => [c.slug, c]));

    await tx.task.createMany({
      data: TASK_TEMPLATE_SEED.map((t) => ({
        workspaceId: workspace.id,
        weddingId: wedding.id,
        title: t.title,
        phase: t.phase as TaskPhase,
        categorySlug: t.categorySlug ?? null,
        priority: t.priority,
        dueDate: subtractDays(
          input.weddingDate,
          PHASE_OFFSET_DAYS[t.phase],
        ),
        status: "todo",
        isMilestone: Boolean(t.isMilestone),
        templateKey: t.templateKey,
      })),
    });

    const seedBudget = [
      {
        slug: "venue",
        description: "Local da festa",
        pct: 0.3,
        priority: 5,
        flexibility: "cannot_cut" as const,
        emotionalReturn: 5,
      },
      {
        slug: "catering",
        description: "Buffet",
        pct: 0.2,
        priority: 5,
        flexibility: "can_reduce" as const,
        emotionalReturn: 4,
      },
      {
        slug: "photo_video",
        description: "Foto e vídeo",
        pct: 0.08,
        priority: 5,
        flexibility: "can_reduce" as const,
        emotionalReturn: 5,
      },
      {
        slug: "favors",
        description: "Lembrancinhas",
        pct: 0.02,
        priority: 1,
        flexibility: "can_remove" as const,
        emotionalReturn: 2,
      },
    ];

    for (const item of seedBudget) {
      const cat = catBySlug[item.slug];
      if (!cat) continue;
      await tx.budgetItem.create({
        data: {
          workspaceId: workspace.id,
          weddingId: wedding.id,
          categoryId: cat.id,
          description: item.description,
          plannedAmount: Math.round(input.totalBudgetCents * item.pct),
          status: "planned",
          priority: item.priority,
          flexibility: item.flexibility,
          emotionalReturn: item.emotionalReturn,
        },
      });
    }

    const catering = await tx.budgetItem.findFirst({
      where: { weddingId: wedding.id, description: "Buffet" },
    });

    await tx.decision.create({
      data: {
        workspaceId: workspace.id,
        weddingId: wedding.id,
        title: "Escolher buffet",
        categorySlug: "catering",
        status: "pending",
        dueDate: subtractDays(input.weddingDate, 180),
        budgetItemId: catering?.id,
        emotionalReturn: 4,
      },
    });

    await tx.activityLog.create({
      data: {
        workspaceId: workspace.id,
        actorId: userId,
        entityType: "wedding",
        entityId: wedding.id,
        action: "created",
        payload: { source: "onboarding" },
      },
    });

    return { workspaceId: workspace.id, weddingId: wedding.id };
  });
}
