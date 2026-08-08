import {
  BUDGET_CATEGORY_SEED,
  PHASE_OFFSET_DAYS,
  TASK_TEMPLATE_SEED,
} from "@/prisma/seed-catalog";
import type {
  BudgetCategory,
  BudgetItem,
  Decision,
  Guest,
  Task,
  TaskPhase,
  Vendor,
  WeddingWorkspace,
} from "@/types/domain";

function id(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate + "T12:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function subtractDays(isoDate: string, days: number): string {
  return addDays(isoDate, -days);
}

export function createEmptyWorkspace(): WeddingWorkspace {
  return {
    wedding: {
      name: "",
      partnerOneName: "",
      partnerTwoName: "",
      weddingDate: "",
      totalBudget: 0,
      city: "",
      venue: "",
      styleTags: [],
      onboardingDone: false,
    },
    categories: [],
    budgetItems: [],
    vendors: [],
    tasks: [],
    guests: [],
    gifts: [],
    decisions: [],
    documents: [],
    honeymoonItems: [],
  };
}

export function buildOnboardingWorkspace(input: {
  partnerOneName: string;
  partnerTwoName: string;
  weddingDate: string;
  totalBudget: number;
  city: string;
  venue?: string;
  styleTags?: string[];
}): WeddingWorkspace {
  const categories: BudgetCategory[] = BUDGET_CATEGORY_SEED.map((c) => ({
    id: id("cat"),
    slug: c.slug,
    name: c.name,
    sortOrder: c.sortOrder,
  }));

  const catBySlug = Object.fromEntries(categories.map((c) => [c.slug, c]));

  const tasks: Task[] = TASK_TEMPLATE_SEED.map((t) => ({
    id: id("task"),
    title: t.title,
    description: "",
    phase: t.phase as TaskPhase,
    categorySlug: t.categorySlug ?? null,
    priority: t.priority,
    dueDate: subtractDays(input.weddingDate, PHASE_OFFSET_DAYS[t.phase]),
    startDate: null,
    status: "todo",
    isMilestone: Boolean(t.isMilestone),
    assignee: null,
    vendorId: null,
    budgetItemId: null,
    templateKey: t.templateKey,
    budgetOptions: [],
  }));

  // Seed a few budget lines so dashboard isn't empty
  const budgetItems: BudgetItem[] = [
    {
      id: id("bi"),
      categoryId: catBySlug.venue.id,
      description: "Local da festa",
      plannedAmount: Math.round(input.totalBudget * 0.3),
      contractedAmount: null,
      paidAmount: 0,
      nextPaymentDate: null,
      vendorId: null,
      notes: "",
      status: "planned",
      priority: 5,
      flexibility: "cannot_cut",
      emotionalReturn: 5,
    },
    {
      id: id("bi"),
      categoryId: catBySlug.catering.id,
      description: "Buffet",
      plannedAmount: Math.round(input.totalBudget * 0.2),
      contractedAmount: null,
      paidAmount: 0,
      nextPaymentDate: null,
      vendorId: null,
      notes: "",
      status: "planned",
      priority: 5,
      flexibility: "can_reduce",
      emotionalReturn: 4,
    },
    {
      id: id("bi"),
      categoryId: catBySlug.photo_video.id,
      description: "Foto e vídeo",
      plannedAmount: Math.round(input.totalBudget * 0.08),
      contractedAmount: null,
      paidAmount: 0,
      nextPaymentDate: null,
      vendorId: null,
      notes: "",
      status: "planned",
      priority: 5,
      flexibility: "can_reduce",
      emotionalReturn: 5,
    },
    {
      id: id("bi"),
      categoryId: catBySlug.favors.id,
      description: "Lembrancinhas",
      plannedAmount: Math.round(input.totalBudget * 0.02),
      contractedAmount: null,
      paidAmount: 0,
      nextPaymentDate: null,
      vendorId: null,
      notes: "",
      status: "planned",
      priority: 1,
      flexibility: "can_remove",
      emotionalReturn: 2,
    },
  ];

  const name =
    input.partnerOneName && input.partnerTwoName
      ? `${input.partnerOneName} & ${input.partnerTwoName}`
      : input.partnerOneName || "Nosso casamento";

  return {
    wedding: {
      name,
      partnerOneName: input.partnerOneName,
      partnerTwoName: input.partnerTwoName,
      weddingDate: input.weddingDate,
      totalBudget: input.totalBudget,
      city: input.city,
      venue: input.venue ?? "",
      styleTags: input.styleTags ?? [],
      onboardingDone: true,
    },
    categories,
    budgetItems,
    vendors: [],
    tasks,
    guests: [],
    gifts: [],
    decisions: [
      {
        id: id("dec"),
        title: "Escolher buffet",
        categorySlug: "catering",
        status: "pending",
        optionsConsidered: "",
        chosenOption: "",
        rationale: "",
        dueDate: subtractDays(input.weddingDate, 180),
        decidedAt: null,
        vendorId: null,
        budgetItemId: budgetItems[1]?.id ?? null,
        emotionalReturn: 4,
      },
    ],
    documents: [],
    honeymoonItems: [],
  };
}

/** Rich demo workspace for exploring the product without onboarding */
export function buildDemoWorkspace(): WeddingWorkspace {
  const base = buildOnboardingWorkspace({
    partnerOneName: "Ana",
    partnerTwoName: "Bruno",
    weddingDate: addDays(new Date().toISOString().slice(0, 10), 128),
    totalBudget: 10000000,
    city: "São Paulo",
    venue: "Casa Figueira",
    styleTags: ["clássico", "jardim"],
  });

  const venueVendor: Vendor = {
    id: id("ven"),
    categorySlug: "venue",
    name: "Casa Figueira",
    contactName: "Mariana",
    phone: "(11) 99999-0001",
    email: "contato@casafigueira.com",
    instagram: "@casafigueira",
    website: "https://casafigueira.example",
    quotedAmount: 3200000,
    contractedAmount: 3000000,
    rating: 5,
    notes: "Incluso cerimônia no jardim",
    status: "contracted",
  };

  const photoVendor: Vendor = {
    id: id("ven"),
    categorySlug: "photo_video",
    name: "Luz Studio",
    contactName: "Pedro",
    phone: "(11) 98888-0002",
    email: "ola@luzstudio.com",
    instagram: "@luzstudio",
    website: "",
    quotedAmount: 900000,
    contractedAmount: null,
    rating: 4,
    notes: "",
    status: "quoted",
  };

  base.vendors = [venueVendor, photoVendor];

  const venueItem = base.budgetItems.find((i) => i.description.includes("Local"));
  if (venueItem) {
    venueItem.contractedAmount = 3000000;
    venueItem.paidAmount = 1000000;
    venueItem.status = "partially_paid";
    venueItem.vendorId = venueVendor.id;
    venueItem.nextPaymentDate = addDays(
      new Date().toISOString().slice(0, 10),
      -1,
    );
  }

  const favors = base.budgetItems.find((i) => i.description.includes("Lembrancinhas"));
  if (favors) {
    favors.plannedAmount = 450000;
  }

  // Mark some tasks done / overdue for realism
  const today = new Date().toISOString().slice(0, 10);
  base.tasks = base.tasks.map((t, idx) => {
    if (idx < 2) return { ...t, status: "done" as const };
    if (t.templateKey === "br.m3.send_invites") {
      return { ...t, dueDate: addDays(today, -5), status: "todo" as const };
    }
    return t;
  });

  const guests: Guest[] = [
    {
      id: id("gst"),
      name: "Carla Souza",
      household: "Souza",
      groupName: "Família noiva",
      tableLabel: "1",
      rsvp: "yes",
      side: "bride",
      partySize: 2,
      dietaryTags: ["vegetariano"],
      notes: "",
    },
    {
      id: id("gst"),
      name: "Rafael Lima",
      household: "Lima",
      groupName: "Amigos",
      tableLabel: "4",
      rsvp: "pending",
      side: "groom",
      partySize: 1,
      dietaryTags: [],
      notes: "",
    },
    {
      id: id("gst"),
      name: "Beatriz Nunes",
      household: "Nunes",
      groupName: "Trabalho",
      tableLabel: "",
      rsvp: "pending",
      side: "both",
      partySize: 2,
      dietaryTags: ["sem glúten"],
      notes: "",
    },
  ];
  base.guests = guests;

  base.gifts = [
    {
      id: id("gift"),
      name: "Jogo de panelas",
      description: "",
      url: "",
      price: 89000,
      purchasedBy: "",
      status: "available",
      thankYouSent: false,
    },
  ];

  base.decisions.push({
    id: id("dec"),
    title: "Paleta de cores",
    categorySlug: "decoration",
    status: "pending",
    optionsConsidered: "Verde oliva · Champanhe · Terracota",
    chosenOption: "",
    rationale: "",
    dueDate: addDays(today, 14),
    decidedAt: null,
    vendorId: null,
    budgetItemId: null,
    emotionalReturn: 4,
  } satisfies Decision);

  base.documents = [
    {
      id: id("doc"),
      name: "contrato-casa-figueira.pdf",
      type: "contract",
      mimeType: "application/pdf",
      sizeBytes: 240_000,
      linkedLabel: "Casa Figueira",
      createdAt: today,
    },
  ];

  base.honeymoonItems = [
    {
      id: id("hn"),
      type: "flight",
      title: "Passagens GRU → LIS",
      description: "",
      provider: "LATAM",
      confirmationCode: "",
      costAmount: 1200000,
      status: "planned",
    },
  ];

  return base;
}
