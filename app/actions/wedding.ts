"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { createWeddingOnboarding } from "@/modules/wedding/onboarding";
import { loadWorkspaceForUser } from "@/modules/wedding/load-workspace";
import { requireMembership } from "@/lib/auth/membership";
import type {
  BudgetItem,
  Decision,
  Gift,
  Guest,
  HoneymoonItem,
  Task,
  Vendor,
  WeddingWorkspace,
} from "@/types/domain";

function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  return new Date(value + "T12:00:00");
}

export async function getSessionAction() {
  try {
    const user = await requireUser();
    return { ok: true as const, user };
  } catch {
    return { ok: false as const, user: null };
  }
}

export async function getWorkspaceAction(): Promise<{
  ok: boolean;
  workspace: WeddingWorkspace | null;
  error?: string;
}> {
  try {
    const { workspace } = await loadWorkspaceForUser();
    return { ok: true, workspace };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "ERROR";
    if (msg === "UNAUTHORIZED") {
      return { ok: false, workspace: null, error: "UNAUTHORIZED" };
    }
    return { ok: false, workspace: null, error: msg };
  }
}

export async function completeOnboardingAction(input: {
  partnerOneName: string;
  partnerTwoName: string;
  weddingDate: string;
  totalBudgetReais: number;
  city: string;
  venue?: string;
  styleTags?: string[];
}) {
  const user = await requireUser();

  const existing = await prisma.membership.findFirst({
    where: { userId: user.id },
  });
  if (existing) {
    return { ok: false as const, error: "ALREADY_ONBOARDED" };
  }

  if (!input.weddingDate || input.totalBudgetReais <= 0 || !input.city) {
    return { ok: false as const, error: "INVALID_INPUT" };
  }

  try {
    await createWeddingOnboarding(user.id, user.email, {
      partnerOneName: input.partnerOneName,
      partnerTwoName: input.partnerTwoName,
      weddingDate: input.weddingDate,
      totalBudgetCents: Math.round(input.totalBudgetReais * 100),
      city: input.city,
      venue: input.venue,
      styleTags: input.styleTags,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "ONBOARDING_FAILED";
    return { ok: false as const, error: msg };
  }

  revalidatePath("/app", "layout");
  return { ok: true as const };
}

export async function upsertBudgetItemAction(item: BudgetItem) {
  const ctx = await requireMembership(["owner", "partner"]);
  await prisma.budgetItem.upsert({
    where: { id: item.id },
    create: {
      id: item.id,
      workspaceId: ctx.workspaceId,
      weddingId: ctx.weddingId,
      categoryId: item.categoryId,
      description: item.description,
      plannedAmount: item.plannedAmount,
      contractedAmount: item.contractedAmount,
      paidAmount: item.paidAmount,
      nextPaymentDate: parseDate(item.nextPaymentDate),
      vendorId: item.vendorId,
      notes: item.notes || null,
      status: item.status,
      priority: item.priority,
      flexibility: item.flexibility,
      emotionalReturn: item.emotionalReturn,
    },
    update: {
      categoryId: item.categoryId,
      description: item.description,
      plannedAmount: item.plannedAmount,
      contractedAmount: item.contractedAmount,
      paidAmount: item.paidAmount,
      nextPaymentDate: parseDate(item.nextPaymentDate),
      vendorId: item.vendorId,
      notes: item.notes || null,
      status: item.status,
      priority: item.priority,
      flexibility: item.flexibility,
      emotionalReturn: item.emotionalReturn,
    },
  });
  revalidatePath("/app/budget");
  revalidatePath("/app/dashboard");
  return { ok: true as const };
}

export async function removeBudgetItemAction(id: string) {
  const ctx = await requireMembership(["owner", "partner"]);
  await prisma.budgetItem.updateMany({
    where: { id, weddingId: ctx.weddingId },
    data: { deletedAt: new Date() },
  });
  revalidatePath("/app/budget");
  return { ok: true as const };
}

export async function applyBudgetCutsAction(
  updates: {
    id: string;
    plannedAmount: number;
    status?: BudgetItem["status"];
  }[],
) {
  const ctx = await requireMembership(["owner", "partner"]);
  await prisma.$transaction(
    updates.map((u) =>
      prisma.budgetItem.updateMany({
        where: { id: u.id, weddingId: ctx.weddingId },
        data: {
          plannedAmount: u.plannedAmount,
          ...(u.status ? { status: u.status } : {}),
        },
      }),
    ),
  );
  revalidatePath("/app");
  return { ok: true as const };
}

export async function upsertTaskAction(task: Task) {
  const ctx = await requireMembership(["owner", "partner", "collaborator"]);
  await prisma.task.upsert({
    where: { id: task.id },
    create: {
      id: task.id,
      workspaceId: ctx.workspaceId,
      weddingId: ctx.weddingId,
      title: task.title,
      description: task.description || null,
      phase: task.phase,
      categorySlug: task.categorySlug,
      priority: task.priority,
      dueDate: parseDate(task.dueDate),
      startDate: parseDate(task.startDate),
      status: task.status,
      isMilestone: task.isMilestone,
      assigneeId: task.assignee,
      vendorId: task.vendorId,
      budgetItemId: task.budgetItemId,
      templateKey: task.templateKey,
    },
    update: {
      title: task.title,
      description: task.description || null,
      phase: task.phase,
      categorySlug: task.categorySlug,
      priority: task.priority,
      dueDate: parseDate(task.dueDate),
      startDate: parseDate(task.startDate),
      status: task.status,
      isMilestone: task.isMilestone,
      assigneeId: task.assignee,
      vendorId: task.vendorId,
      budgetItemId: task.budgetItemId,
    },
  });
  revalidatePath("/app/tasks");
  revalidatePath("/app/schedule");
  revalidatePath("/app/dashboard");
  return { ok: true as const };
}

export async function removeTaskAction(id: string) {
  const ctx = await requireMembership(["owner", "partner"]);
  await prisma.task.updateMany({
    where: { id, weddingId: ctx.weddingId },
    data: { deletedAt: new Date() },
  });
  revalidatePath("/app/tasks");
  return { ok: true as const };
}

export async function upsertVendorAction(vendor: Vendor) {
  const ctx = await requireMembership(["owner", "partner"]);
  await prisma.vendor.upsert({
    where: { id: vendor.id },
    create: {
      id: vendor.id,
      workspaceId: ctx.workspaceId,
      weddingId: ctx.weddingId,
      categorySlug: vendor.categorySlug,
      name: vendor.name,
      contactName: vendor.contactName || null,
      phone: vendor.phone || null,
      email: vendor.email || null,
      instagram: vendor.instagram || null,
      website: vendor.website || null,
      quotedAmount: vendor.quotedAmount,
      contractedAmount: vendor.contractedAmount,
      rating: vendor.rating,
      notes: vendor.notes || null,
      status: vendor.status,
    },
    update: {
      categorySlug: vendor.categorySlug,
      name: vendor.name,
      contactName: vendor.contactName || null,
      phone: vendor.phone || null,
      email: vendor.email || null,
      instagram: vendor.instagram || null,
      website: vendor.website || null,
      quotedAmount: vendor.quotedAmount,
      contractedAmount: vendor.contractedAmount,
      rating: vendor.rating,
      notes: vendor.notes || null,
      status: vendor.status,
    },
  });
  revalidatePath("/app/vendors");
  return { ok: true as const };
}

export async function removeVendorAction(id: string) {
  const ctx = await requireMembership(["owner", "partner"]);
  await prisma.vendor.updateMany({
    where: { id, weddingId: ctx.weddingId },
    data: { deletedAt: new Date() },
  });
  revalidatePath("/app/vendors");
  return { ok: true as const };
}

export async function upsertGuestAction(guest: Guest) {
  const ctx = await requireMembership(["owner", "partner", "collaborator"]);
  await prisma.guest.upsert({
    where: { id: guest.id },
    create: {
      id: guest.id,
      workspaceId: ctx.workspaceId,
      weddingId: ctx.weddingId,
      name: guest.name,
      household: guest.household || null,
      groupName: guest.groupName || null,
      tableLabel: guest.tableLabel || null,
      rsvp: guest.rsvp,
      side: guest.side,
      partySize: guest.partySize,
      dietaryTags: guest.dietaryTags,
      notes: guest.notes || null,
    },
    update: {
      name: guest.name,
      household: guest.household || null,
      groupName: guest.groupName || null,
      tableLabel: guest.tableLabel || null,
      rsvp: guest.rsvp,
      side: guest.side,
      partySize: guest.partySize,
      dietaryTags: guest.dietaryTags,
      notes: guest.notes || null,
    },
  });
  revalidatePath("/app/guests");
  return { ok: true as const };
}

export async function removeGuestAction(id: string) {
  const ctx = await requireMembership(["owner", "partner"]);
  await prisma.guest.updateMany({
    where: { id, weddingId: ctx.weddingId },
    data: { deletedAt: new Date() },
  });
  revalidatePath("/app/guests");
  return { ok: true as const };
}

export async function upsertGiftAction(gift: Gift) {
  const ctx = await requireMembership(["owner", "partner"]);
  await prisma.gift.upsert({
    where: { id: gift.id },
    create: {
      id: gift.id,
      workspaceId: ctx.workspaceId,
      weddingId: ctx.weddingId,
      name: gift.name,
      description: gift.description || null,
      url: gift.url || null,
      price: gift.price,
      purchasedBy: gift.purchasedBy || null,
      status: gift.status,
      thankYouSent: gift.thankYouSent,
    },
    update: {
      name: gift.name,
      description: gift.description || null,
      url: gift.url || null,
      price: gift.price,
      purchasedBy: gift.purchasedBy || null,
      status: gift.status,
      thankYouSent: gift.thankYouSent,
    },
  });
  revalidatePath("/app/gifts");
  return { ok: true as const };
}

export async function removeGiftAction(id: string) {
  const ctx = await requireMembership(["owner", "partner"]);
  await prisma.gift.updateMany({
    where: { id, weddingId: ctx.weddingId },
    data: { deletedAt: new Date() },
  });
  revalidatePath("/app/gifts");
  return { ok: true as const };
}

export async function upsertDecisionAction(decision: Decision) {
  const ctx = await requireMembership(["owner", "partner"]);
  await prisma.decision.upsert({
    where: { id: decision.id },
    create: {
      id: decision.id,
      workspaceId: ctx.workspaceId,
      weddingId: ctx.weddingId,
      title: decision.title,
      categorySlug: decision.categorySlug,
      status: decision.status,
      optionsConsidered: decision.optionsConsidered || null,
      chosenOption: decision.chosenOption || null,
      rationale: decision.rationale || null,
      dueDate: parseDate(decision.dueDate),
      decidedAt: decision.decidedAt ? new Date(decision.decidedAt) : null,
      vendorId: decision.vendorId,
      budgetItemId: decision.budgetItemId,
      emotionalReturn: decision.emotionalReturn,
    },
    update: {
      title: decision.title,
      categorySlug: decision.categorySlug,
      status: decision.status,
      optionsConsidered: decision.optionsConsidered || null,
      chosenOption: decision.chosenOption || null,
      rationale: decision.rationale || null,
      dueDate: parseDate(decision.dueDate),
      decidedAt: decision.decidedAt ? new Date(decision.decidedAt) : null,
      vendorId: decision.vendorId,
      budgetItemId: decision.budgetItemId,
      emotionalReturn: decision.emotionalReturn,
    },
  });
  revalidatePath("/app/decisions");
  revalidatePath("/app/dashboard");
  return { ok: true as const };
}

export async function removeDecisionAction(id: string) {
  const ctx = await requireMembership(["owner", "partner"]);
  await prisma.decision.updateMany({
    where: { id, weddingId: ctx.weddingId },
    data: { deletedAt: new Date() },
  });
  revalidatePath("/app/decisions");
  return { ok: true as const };
}

export async function upsertHoneymoonItemAction(item: HoneymoonItem) {
  const ctx = await requireMembership(["owner", "partner"]);
  await prisma.honeymoonItem.upsert({
    where: { id: item.id },
    create: {
      id: item.id,
      workspaceId: ctx.workspaceId,
      weddingId: ctx.weddingId,
      type: item.type,
      title: item.title,
      description: item.description || null,
      provider: item.provider || null,
      confirmationCode: item.confirmationCode || null,
      costAmount: item.costAmount,
      status: item.status,
    },
    update: {
      type: item.type,
      title: item.title,
      description: item.description || null,
      provider: item.provider || null,
      confirmationCode: item.confirmationCode || null,
      costAmount: item.costAmount,
      status: item.status,
    },
  });
  revalidatePath("/app/honeymoon");
  return { ok: true as const };
}

export async function updateWeddingAction(
  patch: Partial<{
    name: string;
    weddingDate: string;
    totalBudget: number;
    city: string;
    venue: string;
  }>,
) {
  const ctx = await requireMembership(["owner", "partner"]);
  await prisma.wedding.update({
    where: { id: ctx.weddingId },
    data: {
      ...(patch.name != null ? { name: patch.name } : {}),
      ...(patch.weddingDate != null
        ? { weddingDate: parseDate(patch.weddingDate) }
        : {}),
      ...(patch.totalBudget != null ? { totalBudget: patch.totalBudget } : {}),
      ...(patch.city != null ? { city: patch.city } : {}),
      ...(patch.venue != null ? { venue: patch.venue } : {}),
    },
  });
  revalidatePath("/app");
  return { ok: true as const };
}

export async function signOutAction() {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  return { ok: true as const };
}
