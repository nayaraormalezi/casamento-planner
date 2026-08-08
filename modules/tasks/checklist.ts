import type { Task, WeddingWorkspace } from "@/types/domain";
import { daysUntil } from "@/modules/budget/calculations";
import {
  effortForTask,
  urgencyForTask,
  whyForTask,
  type AttentionUrgency,
} from "@/modules/dashboard/attention";
import { moduleForTask } from "@/modules/tasks/module-links";

export type ChecklistBucket = "now" | "soon" | "later" | "done";

export type ChecklistItem = {
  task: Task;
  bucket: ChecklistBucket;
  why: string;
  effortLabel: string;
  dueLabel: string;
  urgency: AttentionUrgency;
  href: string;
  ctaLabel: string;
  moduleLabel: string;
};

export type ChecklistGroups = {
  now: ChecklistItem[];
  soon: ChecklistItem[];
  later: ChecklistItem[];
  done: ChecklistItem[];
};

function dueLabel(task: Task, today: string): string {
  if (!task.dueDate) return "Sem prazo definido";
  if (task.dueDate < today) return "Precisa retomar";
  const days = daysUntil(task.dueDate);
  if (days === 0) return "Para hoje";
  if (days === 1) return "Para amanhã";
  if (days <= 7) return `Em ${days} dias`;
  if (days <= 14) return "Semana que vem";
  if (days <= 21) return `Em ${Math.ceil(days / 7)} semanas`;
  return `Em ${days} dias`;
}

function bucketFor(task: Task, today: string): ChecklistBucket {
  if (task.status === "done") return "done";
  const urgency = urgencyForTask(task, today);
  if (urgency === "now") return "now";
  if (urgency === "soon") return "soon";
  // Undated low priority → later; undated high already soon via urgency
  if (!task.dueDate && task.priority <= 2) return "later";
  if (task.dueDate) {
    const days = daysUntil(task.dueDate);
    if (days > 21) return "later";
  }
  return "later";
}

function sortItems(a: ChecklistItem, b: ChecklistItem): number {
  const rank = { now: 0, soon: 1, later: 2, done: 3 } as const;
  if (rank[a.bucket] !== rank[b.bucket]) return rank[a.bucket] - rank[b.bucket];
  const aDue = a.task.dueDate ?? "9999";
  const bDue = b.task.dueDate ?? "9999";
  if (aDue !== bDue) return aDue.localeCompare(bDue);
  return b.task.priority - a.task.priority;
}

export function enrichChecklistItem(
  task: Task,
  today = new Date().toISOString().slice(0, 10),
): ChecklistItem {
  const overdue = Boolean(task.dueDate && task.dueDate < today);
  const urgency =
    task.status === "done" ? "later" : urgencyForTask(task, today);
  const mod = moduleForTask(task);
  const bucket = bucketFor(task, today);
  return {
    task,
    bucket,
    why: whyForTask(task, overdue),
    effortLabel: effortForTask(task),
    dueLabel: dueLabel(task, today),
    urgency,
    href: mod.href,
    ctaLabel:
      task.status === "doing"
        ? "Continuar"
        : urgency === "now"
          ? "Resolver agora"
          : mod.actionLabel.startsWith("Abrir")
            ? "Abrir"
            : mod.actionLabel,
    moduleLabel: mod.label,
  };
}

export function groupChecklistTasks(ws: WeddingWorkspace): ChecklistGroups {
  const today = new Date().toISOString().slice(0, 10);
  const items = ws.tasks.map((t) => enrichChecklistItem(t, today)).sort(sortItems);

  return {
    now: items.filter((i) => i.bucket === "now"),
    soon: items.filter((i) => i.bucket === "soon"),
    later: items.filter((i) => i.bucket === "later"),
    done: items.filter((i) => i.bucket === "done"),
  };
}

export const CHECKLIST_BUCKET_COPY: Record<
  Exclude<ChecklistBucket, "done">,
  { title: string; subtitle: string }
> = {
  now: {
    title: "O que fazer agora",
    subtitle: "O que mais desbloqueia o casamento nesta semana.",
  },
  soon: {
    title: "Próximas semanas",
    subtitle: "Vale adiantar quando sobrar energia — sem pressão.",
  },
  later: {
    title: "Pode esperar",
    subtitle: "A gente avisa quando chegar a hora.",
  },
};
