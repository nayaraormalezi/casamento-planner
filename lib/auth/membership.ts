import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import type { WorkspaceRole } from "@prisma/client";

export async function getActiveMembership() {
  const user = await requireUser();
  const membership = await prisma.membership.findFirst({
    where: {
      userId: user.id,
      workspace: { deletedAt: null },
    },
    include: {
      workspace: {
        include: {
          weddings: {
            where: { deletedAt: null },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      },
    },
    // Prefer the membership most recently touched (e.g. after accepting an invite).
    orderBy: { updatedAt: "desc" },
  });

  return { user, membership };
}

export async function requireMembership(minRole?: WorkspaceRole[]) {
  const { user, membership } = await getActiveMembership();
  if (!membership) {
    throw new Error("NO_WORKSPACE");
  }
  if (minRole && !minRole.includes(membership.role)) {
    throw new Error("FORBIDDEN");
  }
  const wedding = membership.workspace.weddings[0];
  if (!wedding) {
    throw new Error("NO_WEDDING");
  }
  return {
    user,
    membership,
    workspaceId: membership.workspaceId,
    weddingId: wedding.id,
    wedding,
    role: membership.role,
  };
}
