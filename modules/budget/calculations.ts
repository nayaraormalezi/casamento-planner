import type { BudgetItem, Task, WeddingWorkspace } from "@/types/domain";

export function committedAmount(item: BudgetItem): number {
  if (item.status === "cancelled") return 0;
  return item.contractedAmount ?? item.plannedAmount;
}

export function sumPlanned(items: BudgetItem[]): number {
  return items
    .filter((i) => i.status !== "cancelled")
    .reduce((acc, i) => acc + i.plannedAmount, 0);
}

export function sumContracted(items: BudgetItem[]): number {
  return items
    .filter((i) => i.status !== "cancelled" && i.contractedAmount != null)
    .reduce((acc, i) => acc + (i.contractedAmount ?? 0), 0);
}

export function sumPaid(items: BudgetItem[]): number {
  return items
    .filter((i) => i.status !== "cancelled")
    .reduce((acc, i) => acc + i.paidAmount, 0);
}

export function sumCommitted(items: BudgetItem[]): number {
  return items.reduce((acc, i) => acc + committedAmount(i), 0);
}

export function taskStats(tasks: Task[]) {
  const open = tasks.filter((t) => t.status === "todo" || t.status === "doing");
  const done = tasks.filter((t) => t.status === "done");
  const today = new Date().toISOString().slice(0, 10);
  const overdue = open.filter((t) => t.dueDate != null && t.dueDate < today);
  const total = open.length + done.length;
  return {
    total,
    done: done.length,
    overdue: overdue.length,
    completionPct: total === 0 ? 0 : Math.round((done.length / total) * 100),
  };
}

export function daysUntil(dateIso: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateIso + "T00:00:00");
  return Math.ceil((target.getTime() - today.getTime()) / 86_400_000);
}

export function currentPhase(daysLeft: number): Task["phase"] {
  if (daysLeft > 365) return "m18";
  if (daysLeft > 270) return "m12";
  if (daysLeft > 180) return "m9";
  if (daysLeft > 90) return "m6";
  if (daysLeft > 30) return "m3";
  if (daysLeft > 15) return "m1";
  if (daysLeft > 7) return "d15";
  if (daysLeft > 3) return "d7";
  if (daysLeft > 0) return "d3";
  if (daysLeft === 0) return "day_of";
  return "post";
}

export function composeDashboard(ws: WeddingWorkspace) {
  const planned = sumPlanned(ws.budgetItems);
  const contracted = sumContracted(ws.budgetItems);
  const paid = sumPaid(ws.budgetItems);
  const committed = sumCommitted(ws.budgetItems);
  const tasks = taskStats(ws.tasks);
  const days = daysUntil(ws.wedding.weddingDate);
  const vendorsContracted = ws.vendors.filter(
    (v) => v.status === "contracted",
  ).length;
  const pendingDecisions = ws.decisions.filter((d) => d.status === "pending");

  return {
    completionPct: tasks.completionPct,
    daysRemaining: days,
    phase: currentPhase(days),
    totalBudget: ws.wedding.totalBudget,
    planned,
    contracted,
    paid,
    committed,
    remainingCash: ws.wedding.totalBudget - paid,
    freeBudget: ws.wedding.totalBudget - committed,
    overBudgetPct:
      ws.wedding.totalBudget <= 0
        ? 0
        : Math.round(
            ((committed - ws.wedding.totalBudget) / ws.wedding.totalBudget) *
              100,
          ),
    tasks,
    vendorsContracted,
    pendingDecisions,
  };
}

export type CutCandidate = BudgetItem & {
  cutScore: number;
  suggestedAction: "reduce" | "remove";
  suggestedSavings: number;
};

export function cutScore(item: BudgetItem): number {
  if (item.flexibility === "cannot_cut") return -1;
  const flex =
    item.flexibility === "can_remove" ? 3 : item.flexibility === "can_reduce" ? 2 : 0;
  const emotional = 6 - item.emotionalReturn;
  const cost = committedAmount(item) / 100000;
  const priorityPenalty = 6 - item.priority;
  return flex * 3 + emotional * 2 + cost + priorityPenalty * 0.5;
}

export function suggestCuts(
  items: BudgetItem[],
  targetCents: number,
): CutCandidate[] {
  const ranked = items
    .filter((i) => i.status !== "cancelled" && i.flexibility !== "cannot_cut")
    .map((i) => {
      const committed = committedAmount(i);
      const suggestedAction =
        i.flexibility === "can_remove" ? ("remove" as const) : ("reduce" as const);
      const suggestedSavings =
        suggestedAction === "remove"
          ? committed
          : Math.round(committed * 0.3);
      return {
        ...i,
        cutScore: cutScore(i),
        suggestedAction,
        suggestedSavings,
      };
    })
    .sort((a, b) => b.cutScore - a.cutScore);

  const selected: CutCandidate[] = [];
  let accrued = 0;
  for (const item of ranked) {
    if (accrued >= targetCents) break;
    selected.push(item);
    accrued += item.suggestedSavings;
  }
  return selected;
}
