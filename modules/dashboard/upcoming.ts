import type { Task, WeddingWorkspace } from "@/types/domain";
import { daysUntil } from "@/modules/budget/calculations";
import { moduleForTask } from "@/modules/tasks/module-links";

export type UpcomingItem = {
  id: string;
  title: string;
  dueLabel: string;
  href: string;
  ctaLabel: string;
  tone: "overdue" | "soon" | "later";
};

export type UpcomingGroups = {
  thisWeek: UpcomingItem[];
  comingWeeks: UpcomingItem[];
};

function dueLabel(task: Task, today: string): { label: string; tone: UpcomingItem["tone"] } {
  if (!task.dueDate) {
    return { label: "Sem prazo", tone: "later" };
  }
  if (task.dueDate < today) {
    return { label: "Atrasada", tone: "overdue" };
  }
  const days = daysUntil(task.dueDate);
  if (days === 0) return { label: "Vence hoje", tone: "soon" };
  if (days === 1) return { label: "Vence amanhã", tone: "soon" };
  if (days <= 7) return { label: `Vence em ${days} dias`, tone: "soon" };
  if (days <= 14) return { label: "Semana que vem", tone: "later" };
  if (days <= 21) return { label: `Em ${Math.ceil(days / 7)} semanas`, tone: "later" };
  return { label: `Em ${days} dias`, tone: "later" };
}

function toItem(task: Task, today: string): UpcomingItem {
  const mod = moduleForTask(task);
  const { label, tone } = dueLabel(task, today);
  return {
    id: task.id,
    title: task.title,
    dueLabel: label,
    href: mod.href,
    ctaLabel: task.status === "doing" ? "Continuar" : "Ver tarefa",
    tone,
  };
}

function sortTasks(a: Task, b: Task, today: string): number {
  const aOver = a.dueDate && a.dueDate < today ? 0 : 1;
  const bOver = b.dueDate && b.dueDate < today ? 0 : 1;
  if (aOver !== bOver) return aOver - bOver;
  if ((a.dueDate ?? "9999") !== (b.dueDate ?? "9999")) {
    return (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999");
  }
  return b.priority - a.priority;
}

export function groupUpcomingTasks(
  ws: WeddingWorkspace,
  options?: { excludeIds?: Set<string>; thisWeekLimit?: number; comingLimit?: number },
): UpcomingGroups {
  const today = new Date().toISOString().slice(0, 10);
  const exclude = options?.excludeIds ?? new Set<string>();
  const thisWeekLimit = options?.thisWeekLimit ?? 3;
  const comingLimit = options?.comingLimit ?? 3;

  const open = ws.tasks
    .filter((t) => t.status !== "done")
    .filter((t) => !exclude.has(t.id) && !exclude.has(`task-${t.id}`))
    .sort((a, b) => sortTasks(a, b, today));

  const thisWeekTasks: Task[] = [];
  const comingTasks: Task[] = [];

  for (const task of open) {
    if (!task.dueDate) {
      if (task.priority >= 3) comingTasks.push(task);
      continue;
    }
    if (task.dueDate < today) {
      // Overdue primarily lives in attention; include lightly if space
      thisWeekTasks.push(task);
      continue;
    }
    const days = daysUntil(task.dueDate);
    if (days <= 7) thisWeekTasks.push(task);
    else if (days <= 21) comingTasks.push(task);
    else if (task.priority >= 4) comingTasks.push(task);
  }

  // Fill coming weeks with undated medium-priority if thin
  if (comingTasks.length < comingLimit) {
    for (const task of open) {
      if (comingTasks.includes(task) || thisWeekTasks.includes(task)) continue;
      if (!task.dueDate && task.priority >= 3) comingTasks.push(task);
      if (comingTasks.length >= comingLimit) break;
    }
  }

  return {
    thisWeek: thisWeekTasks.slice(0, thisWeekLimit).map((t) => toItem(t, today)),
    comingWeeks: comingTasks.slice(0, comingLimit).map((t) => toItem(t, today)),
  };
}
