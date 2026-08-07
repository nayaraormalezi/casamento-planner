export type Priority = 1 | 2 | 3 | 4 | 5;
export type Flexibility = "cannot_cut" | "can_reduce" | "can_remove";
export type BudgetItemStatus =
  | "planned"
  | "quoted"
  | "contracted"
  | "partially_paid"
  | "paid"
  | "cancelled";
export type TaskStatus = "todo" | "doing" | "blocked" | "done" | "cancelled";
export type TaskPhase =
  | "m18"
  | "m12"
  | "m9"
  | "m6"
  | "m3"
  | "m1"
  | "d15"
  | "d7"
  | "d3"
  | "day_of"
  | "post"
  | "honeymoon";
export type VendorStatus =
  | "researching"
  | "contacted"
  | "quoted"
  | "contracted"
  | "rejected"
  | "cancelled";
export type RsvpStatus = "pending" | "yes" | "no" | "maybe";
export type DecisionStatus = "pending" | "decided" | "revisited";
export type GiftStatus = "available" | "reserved" | "purchased" | "delivered";
export type DocumentType =
  | "contract"
  | "receipt"
  | "invoice"
  | "photo"
  | "pdf"
  | "other";
export type HoneymoonItemType =
  | "flight"
  | "hotel"
  | "insurance"
  | "itinerary"
  | "document"
  | "other";

export type BudgetCategory = {
  id: string;
  slug: string;
  name: string;
  sortOrder: number;
};

export type BudgetItem = {
  id: string;
  categoryId: string;
  description: string;
  plannedAmount: number;
  contractedAmount: number | null;
  paidAmount: number;
  nextPaymentDate: string | null;
  vendorId: string | null;
  notes: string;
  status: BudgetItemStatus;
  priority: Priority;
  flexibility: Flexibility;
  emotionalReturn: Priority;
};

export type Vendor = {
  id: string;
  categorySlug: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  instagram: string;
  website: string;
  quotedAmount: number | null;
  contractedAmount: number | null;
  rating: number | null;
  notes: string;
  status: VendorStatus;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  phase: TaskPhase;
  categorySlug: string | null;
  priority: Priority;
  dueDate: string | null;
  startDate: string | null;
  status: TaskStatus;
  isMilestone: boolean;
  assignee: string | null;
  vendorId: string | null;
  budgetItemId: string | null;
  templateKey: string | null;
};

export type Guest = {
  id: string;
  name: string;
  household: string;
  groupName: string;
  tableLabel: string;
  rsvp: RsvpStatus;
  side: "bride" | "groom" | "both";
  partySize: number;
  dietaryTags: string[];
  notes: string;
};

export type Gift = {
  id: string;
  name: string;
  description: string;
  url: string;
  price: number | null;
  purchasedBy: string;
  status: GiftStatus;
  thankYouSent: boolean;
};

export type Decision = {
  id: string;
  title: string;
  categorySlug: string | null;
  status: DecisionStatus;
  optionsConsidered: string;
  chosenOption: string;
  rationale: string;
  dueDate: string | null;
  decidedAt: string | null;
  vendorId: string | null;
  budgetItemId: string | null;
  emotionalReturn: Priority | null;
};

export type DocumentItem = {
  id: string;
  name: string;
  type: DocumentType;
  sizeBytes: number;
  linkedLabel: string;
  createdAt: string;
};

export type HoneymoonItem = {
  id: string;
  type: HoneymoonItemType;
  title: string;
  description: string;
  provider: string;
  confirmationCode: string;
  costAmount: number | null;
  status: "planned" | "reserved" | "confirmed" | "cancelled";
};

export type WeddingState = {
  name: string;
  partnerOneName: string;
  partnerTwoName: string;
  weddingDate: string;
  totalBudget: number;
  city: string;
  venue: string;
  styleTags: string[];
  onboardingDone: boolean;
};

export type AlertSeverity = "critical" | "warning" | "info";

export type AppAlert = {
  id: string;
  severity: AlertSeverity;
  title: string;
  description?: string;
  href: string;
};

export type WeddingWorkspace = {
  wedding: WeddingState;
  categories: BudgetCategory[];
  budgetItems: BudgetItem[];
  vendors: Vendor[];
  tasks: Task[];
  guests: Guest[];
  gifts: Gift[];
  decisions: Decision[];
  documents: DocumentItem[];
  honeymoonItems: HoneymoonItem[];
};
