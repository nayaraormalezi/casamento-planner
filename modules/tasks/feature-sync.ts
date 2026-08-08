import type {
  Task,
  TaskBudgetOption,
  Vendor,
  WeddingWorkspace,
} from "@/types/domain";
import {
  TASK_TEMPLATE_SEED,
  type TaskFeatureLink,
} from "@/prisma/seed-catalog";

const FEATURE_BY_KEY = Object.fromEntries(
  TASK_TEMPLATE_SEED.filter((t) => t.featureLink).map((t) => [
    t.templateKey,
    t.featureLink as TaskFeatureLink,
  ]),
) as Record<string, TaskFeatureLink>;

function vendorReady(vendors: Vendor[], slug: string): boolean {
  return vendors.some(
    (v) =>
      v.categorySlug === slug &&
      v.status !== "rejected" &&
      v.status !== "cancelled" &&
      Boolean(v.name.trim()) &&
      (v.status === "contracted" ||
        v.status === "quoted" ||
        v.status === "contacted"),
  );
}

function vendorContracted(vendors: Vendor[], slug: string): boolean {
  return vendors.some(
    (v) => v.categorySlug === slug && v.status === "contracted",
  );
}

/** Whether workspace data already satisfies a linked feature. */
export function featureSatisfied(
  ws: WeddingWorkspace,
  link: TaskFeatureLink,
): boolean {
  const { wedding, guests, gifts, honeymoonItems, vendors, budgetItems } = ws;

  switch (link) {
    case "budget":
      return wedding.totalBudget > 0;
    case "date":
      return Boolean(wedding.weddingDate);
    case "style":
      return (wedding.styleTags?.length ?? 0) > 0;
    case "priorities":
      return budgetItems.some(
        (i) => i.priority >= 4 && i.status !== "cancelled",
      );
    case "guest_count":
      return guests.length > 0;
    case "venue":
      return Boolean(wedding.venue?.trim()) || vendorReady(vendors, "venue");
    case "guest_list":
      return guests.length >= 1;
    case "rsvp":
      return (
        guests.length > 0 &&
        guests.some((g) => g.rsvp !== "pending")
      );
    case "final_guests": {
      if (guests.length === 0) return false;
      const answered = guests.filter((g) => g.rsvp !== "pending").length;
      return answered / guests.length >= 0.8;
    }
    case "seating":
      return (
        guests.length > 0 &&
        guests.filter((g) => g.tableLabel?.trim()).length >=
          Math.min(guests.length, 3)
      );
    case "gifts":
      return gifts.length > 0;
    case "honeymoon":
      return honeymoonItems.length > 0;
    case "honeymoon_booking":
      return honeymoonItems.some(
        (h) =>
          h.status === "reserved" ||
          h.status === "confirmed" ||
          Boolean(h.confirmationCode?.trim()),
      );
    case "vendor:venue":
      return vendorReady(vendors, "venue") || Boolean(wedding.venue?.trim());
    case "vendor:catering":
      return vendorReady(vendors, "catering");
    case "vendor:photo_video":
      return vendorReady(vendors, "photo_video");
    case "vendor:video":
      return vendorReady(vendors, "photo_video");
    case "vendor:decoration":
      return vendorReady(vendors, "decoration");
    case "vendor:music":
      return vendorReady(vendors, "music");
    case "vendor:cake":
      return vendorReady(vendors, "cake");
    case "vendor:drinks":
      return vendorReady(vendors, "drinks");
    case "vendor:flowers":
      return vendorReady(vendors, "flowers");
    case "vendor:ceremony":
      return vendorReady(vendors, "ceremony");
    case "vendor:transport":
      return vendorReady(vendors, "transport");
    case "vendor:attire":
      return vendorReady(vendors, "attire");
    case "vendor:beauty":
      return vendorReady(vendors, "beauty");
    case "vendor:stationery":
      return vendorReady(vendors, "stationery");
    case "vendor:favors":
      return vendorReady(vendors, "favors");
    case "vendor:entertainment":
      return vendorReady(vendors, "entertainment");
    case "payments":
      return budgetItems.some(
        (i) =>
          i.paidAmount > 0 ||
          i.status === "paid" ||
          i.status === "partially_paid",
      );
    case "schedule":
      return false; // completed manually or via task
    case "thank_you":
      return gifts.some((g) => g.thankYouSent);
    default:
      return false;
  }
}

export function featureLinkForTask(task: Task): TaskFeatureLink | null {
  if (!task.templateKey) return null;
  return FEATURE_BY_KEY[task.templateKey] ?? null;
}

/** Mark linked open tasks as done when feature data already exists. */
export function applyFeatureToTasks(ws: WeddingWorkspace): Task[] {
  return ws.tasks.map((task) => {
    if (task.status === "done") return task;
    const link = featureLinkForTask(task);
    if (!link) return task;
    if (!featureSatisfied(ws, link)) return task;
    return { ...task, status: "done" as const };
  });
}

export type FeaturePatch = {
  wedding?: Partial<{
    totalBudget: number;
    weddingDate: string;
    venue: string;
    styleTags: string[];
  }>;
  budgetItem?: {
    categorySlug: string;
    plannedAmount?: number;
    contractedAmount?: number | null;
    description?: string;
    vendorId?: string | null;
    status?:
      | "planned"
      | "quoted"
      | "contracted"
      | "partially_paid"
      | "paid"
      | "cancelled";
  };
  vendor?: {
    categorySlug: string;
    name: string;
    quotedAmount?: number | null;
    contractedAmount?: number | null;
    status?: Vendor["status"];
  };
};

function selectedOption(task: Task): TaskBudgetOption | undefined {
  return task.budgetOptions.find((o) => o.isSelected);
}

/**
 * When a linked task is answered/completed, derive updates for wedding modules.
 */
export function featurePatchFromTask(
  task: Task,
  ws: WeddingWorkspace,
): FeaturePatch | null {
  const link = featureLinkForTask(task);
  if (!link) return null;
  if (task.status !== "done" && !selectedOption(task)) return null;

  const selected = selectedOption(task);
  const patch: FeaturePatch = {};

  switch (link) {
    case "budget": {
      if (selected && selected.amount > 0) {
        patch.wedding = { totalBudget: selected.amount };
      }
      break;
    }
    case "date": {
      const raw =
        selected?.title?.trim() ||
        selected?.notes?.trim() ||
        task.description.match(/\d{4}-\d{2}-\d{2}/)?.[0];
      if (raw && /^\d{4}-\d{2}-\d{2}/.test(raw)) {
        patch.wedding = { weddingDate: raw.slice(0, 10) };
      }
      break;
    }
    case "style": {
      const tags = (selected?.title || selected?.notes || "")
        .split(/[,;/|]/)
        .map((t) => t.trim())
        .filter(Boolean);
      if (tags.length) patch.wedding = { styleTags: tags };
      break;
    }
    case "venue":
    case "vendor:venue": {
      const name =
        selected?.vendorName?.trim() ||
        selected?.title?.trim() ||
        ws.wedding.venue;
      if (name) {
        patch.wedding = { venue: name };
        patch.vendor = {
          categorySlug: "venue",
          name,
          quotedAmount: selected?.amount || null,
          contractedAmount: selected?.amount || null,
          status: selected ? "contracted" : "researching",
        };
        if (selected?.amount) {
          patch.budgetItem = {
            categorySlug: "venue",
            plannedAmount: selected.amount,
            contractedAmount: selected.amount,
            description: "Local da cerimônia e festa",
            vendorId: selected.vendorId,
            status: "contracted",
          };
        }
      }
      break;
    }
    default: {
      if (link.startsWith("vendor:")) {
        const slug = link.slice("vendor:".length);
        const mappedSlug = slug === "video" ? "photo_video" : slug;
        const name =
          selected?.vendorName?.trim() || selected?.title?.trim() || "";
        if (name) {
          patch.vendor = {
            categorySlug: mappedSlug,
            name,
            quotedAmount: selected?.amount || null,
            contractedAmount: selected?.amount || null,
            status: "contracted",
          };
        }
        if (selected?.amount && task.categorySlug) {
          patch.budgetItem = {
            categorySlug: task.categorySlug,
            plannedAmount: selected.amount,
            contractedAmount: selected.amount,
            description: task.title,
            vendorId: selected.vendorId,
            status: "contracted",
          };
        }
      }
      break;
    }
  }

  if (!patch.wedding && !patch.budgetItem && !patch.vendor) return null;
  return patch;
}

/** Tasks that should flip to done given current workspace (ids only). */
export function taskIdsToAutoComplete(ws: WeddingWorkspace): string[] {
  return applyFeatureToTasks(ws)
    .filter((t, i) => t.status === "done" && ws.tasks[i]?.status !== "done")
    .map((t) => t.id);
}

export function isVendorLinkSatisfiedByVendor(
  link: TaskFeatureLink,
  vendor: Vendor,
): boolean {
  if (!link.startsWith("vendor:")) return false;
  const slug = link.slice("vendor:".length);
  const mapped = slug === "video" ? "photo_video" : slug;
  return (
    vendor.categorySlug === mapped &&
    vendor.status !== "rejected" &&
    vendor.status !== "cancelled" &&
    Boolean(vendor.name.trim())
  );
}

export { vendorContracted, vendorReady };
