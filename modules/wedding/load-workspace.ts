import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { mapWorkspace } from "@/modules/wedding/mapper";
import type { WeddingWorkspace } from "@/types/domain";

export async function loadWorkspaceForUser(): Promise<{
  workspace: WeddingWorkspace | null;
  userId: string;
  weddingId: string | null;
  workspaceId: string | null;
}> {
  const user = await requireUser();

  const membership = await prisma.membership.findFirst({
    where: { userId: user.id, workspace: { deletedAt: null } },
    orderBy: { createdAt: "asc" },
  });

  if (!membership) {
    return {
      workspace: null,
      userId: user.id,
      weddingId: null,
      workspaceId: null,
    };
  }

  const wedding = await prisma.wedding.findFirst({
    where: { workspaceId: membership.workspaceId, deletedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (!wedding) {
    return {
      workspace: null,
      userId: user.id,
      weddingId: null,
      workspaceId: membership.workspaceId,
    };
  }

  const [
    categories,
    budgetItems,
    vendors,
    tasks,
    guests,
    gifts,
    decisions,
    documents,
    honeymoonItems,
  ] = await Promise.all([
    prisma.budgetCategory.findMany({
      where: { weddingId: wedding.id },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.budgetItem.findMany({
      where: { weddingId: wedding.id, deletedAt: null },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.vendor.findMany({
      where: { weddingId: wedding.id, deletedAt: null },
      orderBy: { createdAt: "desc" },
    }),
    prisma.task.findMany({
      where: { weddingId: wedding.id, deletedAt: null },
      orderBy: [{ dueDate: "asc" }, { sortOrder: "asc" }],
    }),
    prisma.guest.findMany({
      where: { weddingId: wedding.id, deletedAt: null },
      orderBy: { name: "asc" },
    }),
    prisma.gift.findMany({
      where: { weddingId: wedding.id, deletedAt: null },
      orderBy: { createdAt: "desc" },
    }),
    prisma.decision.findMany({
      where: { weddingId: wedding.id, deletedAt: null },
      orderBy: { createdAt: "desc" },
    }),
    prisma.document.findMany({
      where: { weddingId: wedding.id, deletedAt: null },
      orderBy: { createdAt: "desc" },
    }),
    prisma.honeymoonItem.findMany({
      where: { weddingId: wedding.id, deletedAt: null },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return {
    workspace: mapWorkspace({
      wedding,
      categories,
      budgetItems,
      vendors,
      tasks,
      guests,
      gifts,
      decisions,
      documents,
      honeymoonItems,
    }),
    userId: user.id,
    weddingId: wedding.id,
    workspaceId: membership.workspaceId,
  };
}
