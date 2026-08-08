import type {
  BudgetItem,
  Decision,
  DocumentItem,
  Gift,
  Guest,
  HoneymoonItem,
  PaymentMethod,
  PaymentPlan,
  PaymentStatus,
  Task,
  TaskBudgetInstallment,
  TaskBudgetOption,
  TaskStatus,
  Vendor,
  WeddingWorkspace,
} from "@/types/domain";
import type {
  BudgetItem as PBudgetItem,
  Decision as PDecision,
  Document as PDocument,
  Gift as PGift,
  Guest as PGuest,
  HoneymoonItem as PHoneymoon,
  Task as PTask,
  TaskBudgetInstallment as PInstallment,
  TaskBudgetOption as POption,
  Vendor as PVendor,
  Wedding,
  BudgetCategory,
} from "@prisma/client";

function dateStr(d: Date | null | undefined): string | null {
  if (!d) return null;
  return d.toISOString().slice(0, 10);
}

function mapTaskStatus(status: string): TaskStatus {
  if (status === "doing") return "doing";
  if (status === "done") return "done";
  return "todo";
}

type TaskWithOptions = PTask & {
  budgetOptions?: (POption & { installments?: PInstallment[] })[];
};

export function mapWorkspace(input: {
  wedding: Wedding;
  categories: BudgetCategory[];
  budgetItems: PBudgetItem[];
  vendors: PVendor[];
  tasks: TaskWithOptions[];
  guests: PGuest[];
  gifts: PGift[];
  decisions: PDecision[];
  documents: PDocument[];
  honeymoonItems: PHoneymoon[];
}): WeddingWorkspace {
  const { wedding } = input;
  return {
    wedding: {
      name: wedding.name,
      partnerOneName: wedding.partnerOneName ?? "",
      partnerTwoName: wedding.partnerTwoName ?? "",
      weddingDate: dateStr(wedding.weddingDate) ?? "",
      totalBudget: wedding.totalBudget,
      city: wedding.city ?? "",
      venue: wedding.venue ?? "",
      styleTags: wedding.styleTags,
      onboardingDone: wedding.onboardingDone,
    },
    categories: input.categories.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      sortOrder: c.sortOrder,
    })),
    budgetItems: input.budgetItems.map(mapBudgetItem),
    vendors: input.vendors.map(mapVendor),
    tasks: input.tasks.map(mapTask),
    guests: input.guests.map(mapGuest),
    gifts: input.gifts.map(mapGift),
    decisions: input.decisions.map(mapDecision),
    documents: input.documents.map(mapDocument),
    honeymoonItems: input.honeymoonItems.map(mapHoneymoon),
  };
}

function mapBudgetItem(i: PBudgetItem): BudgetItem {
  return {
    id: i.id,
    categoryId: i.categoryId,
    description: i.description,
    plannedAmount: i.plannedAmount,
    contractedAmount: i.contractedAmount,
    paidAmount: i.paidAmount,
    nextPaymentDate: dateStr(i.nextPaymentDate),
    vendorId: i.vendorId,
    notes: i.notes ?? "",
    status: i.status,
    priority: i.priority as BudgetItem["priority"],
    flexibility: i.flexibility,
    emotionalReturn: i.emotionalReturn as BudgetItem["emotionalReturn"],
  };
}

function mapVendor(v: PVendor): Vendor {
  return {
    id: v.id,
    categorySlug: v.categorySlug,
    name: v.name,
    contactName: v.contactName ?? "",
    phone: v.phone ?? "",
    email: v.email ?? "",
    instagram: v.instagram ?? "",
    website: v.website ?? "",
    quotedAmount: v.quotedAmount,
    contractedAmount: v.contractedAmount,
    rating: v.rating,
    notes: v.notes ?? "",
    status: v.status,
  };
}

function mapInstallment(i: PInstallment): TaskBudgetInstallment {
  return {
    id: i.id,
    sequence: i.sequence,
    amount: i.amount,
    dueDate: dateStr(i.dueDate),
    paidAt: i.paidAt ? i.paidAt.toISOString() : null,
    paymentMethod: (i.paymentMethod as PaymentMethod | null) ?? null,
    notes: i.notes ?? "",
  };
}

function mapBudgetOption(
  o: POption & { installments?: PInstallment[] },
): TaskBudgetOption {
  return {
    id: o.id,
    taskId: o.taskId,
    title: o.title,
    vendorId: o.vendorId,
    vendorName: o.vendorName ?? "",
    amount: o.amount,
    notes: o.notes ?? "",
    isSelected: o.isSelected,
    paymentPlan: o.paymentPlan as PaymentPlan,
    paymentStatus: o.paymentStatus as PaymentStatus,
    paidAmount: o.paidAmount,
    nextPaymentDate: dateStr(o.nextPaymentDate),
    installmentCount: o.installmentCount,
    installments: (o.installments ?? [])
      .slice()
      .sort((a, b) => a.sequence - b.sequence)
      .map(mapInstallment),
  };
}

function mapTask(t: TaskWithOptions): Task {
  return {
    id: t.id,
    title: t.title,
    description: t.description ?? "",
    phase: t.phase,
    categorySlug: t.categorySlug,
    priority: t.priority as Task["priority"],
    dueDate: dateStr(t.dueDate),
    startDate: dateStr(t.startDate),
    status: mapTaskStatus(t.status),
    isMilestone: t.isMilestone,
    assignee: t.assigneeId,
    vendorId: t.vendorId,
    budgetItemId: t.budgetItemId,
    templateKey: t.templateKey,
    budgetOptions: (t.budgetOptions ?? []).map(mapBudgetOption),
  };
}

function mapGuest(g: PGuest): Guest {
  return {
    id: g.id,
    name: g.name,
    household: g.household ?? "",
    groupName: g.groupName ?? "",
    tableLabel: g.tableLabel ?? "",
    rsvp: g.rsvp,
    side: g.side,
    partySize: g.partySize,
    dietaryTags: g.dietaryTags,
    notes: g.notes ?? "",
  };
}

function mapGift(g: PGift): Gift {
  return {
    id: g.id,
    name: g.name,
    description: g.description ?? "",
    url: g.url ?? "",
    price: g.price,
    purchasedBy: g.purchasedBy ?? "",
    status: g.status,
    thankYouSent: g.thankYouSent,
  };
}

function mapDecision(d: PDecision): Decision {
  return {
    id: d.id,
    title: d.title,
    categorySlug: d.categorySlug,
    status: d.status,
    optionsConsidered: d.optionsConsidered ?? "",
    chosenOption: d.chosenOption ?? "",
    rationale: d.rationale ?? "",
    dueDate: dateStr(d.dueDate),
    decidedAt: d.decidedAt?.toISOString() ?? null,
    vendorId: d.vendorId,
    budgetItemId: d.budgetItemId,
    emotionalReturn: d.emotionalReturn as Decision["emotionalReturn"],
  };
}

function mapDocument(d: PDocument): DocumentItem {
  return {
    id: d.id,
    name: d.name,
    type: d.type,
    mimeType: d.mimeType,
    sizeBytes: d.sizeBytes,
    linkedLabel: d.linkedType ?? "",
    createdAt: dateStr(d.createdAt) ?? "",
  };
}

function mapHoneymoon(h: PHoneymoon): HoneymoonItem {
  return {
    id: h.id,
    type: h.type,
    title: h.title,
    description: h.description ?? "",
    provider: h.provider ?? "",
    confirmationCode: h.confirmationCode ?? "",
    costAmount: h.costAmount,
    status: h.status,
  };
}
