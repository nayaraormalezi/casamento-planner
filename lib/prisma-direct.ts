import { PrismaClient } from "@prisma/client";

/**
 * Prisma client on DIRECT_URL (session/direct Postgres).
 * Use for interactive `$transaction(async …)` — PgBouncer transaction
 * pooling (port 6543) closes those mid-flight with "Transaction not found".
 */
const globalForPrisma = globalThis as unknown as {
  prismaDirect: PrismaClient | undefined;
};

function createDirectClient() {
  const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!url) {
    throw new Error("Missing DIRECT_URL or DATABASE_URL");
  }
  return new PrismaClient({
    datasources: { db: { url } },
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });
}

export const prismaDirect =
  globalForPrisma.prismaDirect ?? createDirectClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaDirect = prismaDirect;
}
