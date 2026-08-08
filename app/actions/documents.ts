"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import type { DocumentType } from "@prisma/client";
import { requireMembership } from "@/lib/auth/membership";
import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";

const BUCKET = "wedding-documents";
const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

async function ensureDocumentsBucket() {
  const admin = createAdminClient();
  const { data: buckets } = await admin.storage.listBuckets();
  if (buckets?.some((b) => b.id === BUCKET || b.name === BUCKET)) {
    return admin;
  }
  await admin.storage.createBucket(BUCKET, {
    public: false,
    fileSizeLimit: MAX_BYTES,
    allowedMimeTypes: [...ALLOWED_MIME],
  });
  return admin;
}

function inferDocumentType(mimeType: string, fileName: string): DocumentType {
  if (mimeType === "application/pdf" || fileName.toLowerCase().endsWith(".pdf")) {
    return "pdf";
  }
  if (mimeType.startsWith("image/")) return "photo";
  return "other";
}

function sanitizeFileName(name: string) {
  return name.replace(/[^\w.\-()\s]/g, "_").slice(0, 180) || "arquivo";
}

export async function uploadDocumentAction(formData: FormData) {
  const ctx = await requireMembership(["owner", "partner"]);
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return { ok: false as const, error: "NO_FILE" };
  }
  if (file.size <= 0 || file.size > MAX_BYTES) {
    return { ok: false as const, error: "INVALID_SIZE" };
  }
  if (!ALLOWED_MIME.has(file.type)) {
    return { ok: false as const, error: "INVALID_TYPE" };
  }

  const documentId = randomUUID();
  const safeName = sanitizeFileName(file.name);
  const storagePath = `${ctx.workspaceId}/${ctx.weddingId}/${documentId}/${safeName}`;
  const mimeType = file.type || "application/octet-stream";
  const type = inferDocumentType(mimeType, safeName);

  const admin = await ensureDocumentsBucket();
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: uploadError } = await admin.storage
    .from(BUCKET)
    .upload(storagePath, buffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (uploadError) {
    console.error("document upload failed", uploadError);
    return { ok: false as const, error: "UPLOAD_FAILED" };
  }

  try {
    await prisma.document.create({
      data: {
        id: documentId,
        workspaceId: ctx.workspaceId,
        weddingId: ctx.weddingId,
        name: safeName,
        type,
        mimeType,
        sizeBytes: file.size,
        storagePath,
        uploadedById: ctx.user.id,
      },
    });
  } catch (e) {
    await admin.storage.from(BUCKET).remove([storagePath]);
    console.error("document row create failed", e);
    return { ok: false as const, error: "DB_FAILED" };
  }

  revalidatePath("/app/documents");
  return { ok: true as const, id: documentId };
}

export async function getDocumentUrlAction(documentId: string) {
  const ctx = await requireMembership();
  const doc = await prisma.document.findFirst({
    where: {
      id: documentId,
      weddingId: ctx.weddingId,
      deletedAt: null,
    },
  });
  if (!doc) {
    return { ok: false as const, error: "NOT_FOUND" };
  }

  const admin = createAdminClient();
  const { data, error } = await admin.storage
    .from(BUCKET)
    .createSignedUrl(doc.storagePath, 60 * 10);

  if (error || !data?.signedUrl) {
    return { ok: false as const, error: "URL_FAILED" };
  }

  return { ok: true as const, url: data.signedUrl, name: doc.name };
}

export async function removeDocumentAction(documentId: string) {
  const ctx = await requireMembership(["owner", "partner"]);
  const doc = await prisma.document.findFirst({
    where: {
      id: documentId,
      weddingId: ctx.weddingId,
      deletedAt: null,
    },
  });
  if (!doc) {
    return { ok: false as const, error: "NOT_FOUND" };
  }

  await prisma.document.update({
    where: { id: doc.id },
    data: { deletedAt: new Date() },
  });

  try {
    const admin = createAdminClient();
    await admin.storage.from(BUCKET).remove([doc.storagePath]);
  } catch (e) {
    console.error("document storage delete failed", e);
  }

  revalidatePath("/app/documents");
  return { ok: true as const };
}
