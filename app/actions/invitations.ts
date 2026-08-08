"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import type { WorkspaceRole } from "@prisma/client";
import { requireMembership } from "@/lib/auth/membership";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

const INVITE_TTL_DAYS = 14;
const INVITABLE_ROLES: WorkspaceRole[] = ["partner", "collaborator", "viewer"];

function appBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function listTeamAction() {
  const ctx = await requireMembership();
  const [members, invitations] = await Promise.all([
    prisma.membership.findMany({
      where: { workspaceId: ctx.workspaceId },
      include: { user: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.invitation.findMany({
      where: {
        workspaceId: ctx.workspaceId,
        status: "pending",
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return {
    ok: true as const,
    role: ctx.role,
    members: members.map((m) => ({
      id: m.id,
      userId: m.userId,
      email: m.user.email,
      fullName: m.user.fullName,
      role: m.role,
    })),
    invitations: invitations.map((i) => ({
      id: i.id,
      email: i.email,
      role: i.role,
      token: i.token,
      expiresAt: i.expiresAt.toISOString(),
      inviteUrl: `${appBaseUrl()}/invite/${i.token}`,
    })),
  };
}

export async function createInvitationAction(input: {
  email: string;
  role?: WorkspaceRole;
}) {
  const ctx = await requireMembership(["owner"]);
  const email = normalizeEmail(input.email);
  const role = input.role ?? "partner";

  if (!email || !email.includes("@")) {
    return { ok: false as const, error: "INVALID_EMAIL" };
  }
  if (!INVITABLE_ROLES.includes(role)) {
    return { ok: false as const, error: "INVALID_ROLE" };
  }

  const existingMember = await prisma.membership.findFirst({
    where: {
      workspaceId: ctx.workspaceId,
      user: { email },
    },
  });
  if (existingMember) {
    return { ok: false as const, error: "ALREADY_MEMBER" };
  }

  await prisma.invitation.updateMany({
    where: {
      workspaceId: ctx.workspaceId,
      email,
      status: "pending",
    },
    data: { status: "revoked" },
  });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + INVITE_TTL_DAYS);

  const invitation = await prisma.invitation.create({
    data: {
      id: randomUUID(),
      workspaceId: ctx.workspaceId,
      email,
      role,
      token: randomUUID(),
      invitedById: ctx.user.id,
      expiresAt,
    },
  });

  revalidatePath("/app/settings");
  return {
    ok: true as const,
    invitation: {
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      token: invitation.token,
      expiresAt: invitation.expiresAt.toISOString(),
      inviteUrl: `${appBaseUrl()}/invite/${invitation.token}`,
    },
  };
}

export async function revokeInvitationAction(invitationId: string) {
  const ctx = await requireMembership(["owner"]);
  await prisma.invitation.updateMany({
    where: {
      id: invitationId,
      workspaceId: ctx.workspaceId,
      status: "pending",
    },
    data: { status: "revoked" },
  });
  revalidatePath("/app/settings");
  return { ok: true as const };
}

export async function getInvitationPreviewAction(token: string) {
  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: {
      workspace: {
        include: {
          weddings: {
            where: { deletedAt: null },
            take: 1,
          },
        },
      },
    },
  });

  if (!invitation) {
    return { ok: false as const, error: "NOT_FOUND" };
  }
  if (invitation.status !== "pending") {
    return { ok: false as const, error: "NOT_PENDING" };
  }
  if (invitation.expiresAt.getTime() < Date.now()) {
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: "expired" },
    });
    return { ok: false as const, error: "EXPIRED" };
  }

  const wedding = invitation.workspace.weddings[0];
  return {
    ok: true as const,
    invitation: {
      email: invitation.email,
      role: invitation.role,
      workspaceName: invitation.workspace.name,
      weddingName: wedding?.name ?? invitation.workspace.name,
      expiresAt: invitation.expiresAt.toISOString(),
    },
  };
}

export async function acceptInvitationAction(token: string) {
  const user = await requireUser();
  const invitation = await prisma.invitation.findUnique({
    where: { token },
  });

  if (!invitation) {
    return { ok: false as const, error: "NOT_FOUND" };
  }
  if (invitation.status !== "pending") {
    return { ok: false as const, error: "NOT_PENDING" };
  }
  if (invitation.expiresAt.getTime() < Date.now()) {
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: "expired" },
    });
    return { ok: false as const, error: "EXPIRED" };
  }

  const userEmail = normalizeEmail(user.email);
  if (userEmail && userEmail !== normalizeEmail(invitation.email)) {
    return { ok: false as const, error: "EMAIL_MISMATCH" };
  }

  await prisma.profile.upsert({
    where: { id: user.id },
    create: {
      id: user.id,
      email: user.email || invitation.email,
      fullName: user.fullName,
    },
    update: {
      email: user.email || invitation.email,
      ...(user.fullName ? { fullName: user.fullName } : {}),
    },
  });

  const existing = await prisma.membership.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId: invitation.workspaceId,
        userId: user.id,
      },
    },
  });

  if (!existing) {
    await prisma.membership.create({
      data: {
        id: randomUUID(),
        workspaceId: invitation.workspaceId,
        userId: user.id,
        role: invitation.role,
      },
    });
  } else {
    await prisma.membership.update({
      where: { id: existing.id },
      data: { role: invitation.role, updatedAt: new Date() },
    });
  }

  await prisma.invitation.update({
    where: { id: invitation.id },
    data: { status: "accepted" },
  });

  // Touch membership so getActiveMembership prefers this workspace.
  await prisma.membership.updateMany({
    where: {
      workspaceId: invitation.workspaceId,
      userId: user.id,
    },
    data: { updatedAt: new Date() },
  });

  revalidatePath("/app", "layout");
  return { ok: true as const };
}
