import type { AppAlert, WeddingWorkspace } from "@/types/domain";
import {
  committedAmount,
  daysUntil,
  sumCommitted,
  sumPlanned,
} from "@/modules/budget/calculations";

export function buildAlerts(ws: WeddingWorkspace): AppAlert[] {
  const alerts: AppAlert[] = [];
  const budget = ws.wedding.totalBudget;
  const committed = sumCommitted(ws.budgetItems);
  const planned = sumPlanned(ws.budgetItems);
  const days = daysUntil(ws.wedding.weddingDate);
  const today = new Date().toISOString().slice(0, 10);

  if (committed > budget) {
    alerts.push({
      id: "A1",
      severity: "critical",
      title: "Orçamento comprometido acima do teto",
      description: `Comprometido excede o teto em ${Math.round(((committed - budget) / budget) * 100)}%.`,
      href: "/app/priority",
    });
  } else if (planned > budget * 1.05) {
    alerts.push({
      id: "A2",
      severity: "warning",
      title: "Previsto acima do teto (+5%)",
      description: "Revise itens ou ajuste o orçamento total.",
      href: "/app/budget",
    });
  }

  for (const item of ws.budgetItems) {
    if (!item.nextPaymentDate || item.status === "paid" || item.status === "cancelled")
      continue;
    if (item.nextPaymentDate < today) {
      alerts.push({
        id: `A4-${item.id}`,
        severity: "critical",
        title: `Pagamento vencido: ${item.description}`,
        href: `/app/budget?highlight=${item.id}`,
      });
    } else {
      const dueIn = daysUntil(item.nextPaymentDate);
      if (dueIn <= 7) {
        alerts.push({
          id: `A3-${item.id}`,
          severity: "info",
          title: `Pagamento em ${dueIn} dia(s): ${item.description}`,
          href: `/app/budget?highlight=${item.id}`,
        });
      }
    }
  }

  for (const task of ws.tasks) {
    if (
      task.status === "done" ||
      !task.dueDate ||
      task.dueDate >= today
    )
      continue;
    alerts.push({
      id: `A5-${task.id}`,
      severity: task.priority >= 4 ? "critical" : "warning",
      title: `Tarefa atrasada: ${task.title}`,
      href: `/app/tasks?highlight=${task.id}`,
    });
  }

  if (days <= 90) {
    const essentialWithoutVendor = ws.budgetItems.filter(
      (i) =>
        i.priority >= 5 &&
        i.status !== "cancelled" &&
        !i.vendorId &&
        committedAmount(i) > 0,
    );
    for (const item of essentialWithoutVendor) {
      alerts.push({
        id: `A6-${item.id}`,
        severity: "critical",
        title: `Essencial sem fornecedor: ${item.description}`,
        href: `/app/vendors?category=${ws.categories.find((c) => c.id === item.categoryId)?.slug ?? ""}`,
      });
    }
  }

  for (const decision of ws.decisions.filter((d) => d.status === "pending")) {
    if (decision.dueDate) {
      alerts.push({
        id: `A7-${decision.id}`,
        severity: "warning",
        title: `Decisão pendente: ${decision.title}`,
        href: `/app/decisions?highlight=${decision.id}`,
      });
    }
  }

  if (days <= 30 && ws.guests.length > 0) {
    const pending = ws.guests.filter((g) => g.rsvp === "pending");
    const ratio = pending.length / ws.guests.length;
    if (ratio > 0.5) {
      alerts.push({
        id: "A8",
        severity: "warning",
        title: "Mais de 50% dos RSVPs ainda pendentes",
        description: `${pending.length} de ${ws.guests.length} convidados`,
        href: "/app/guests?status=rsvp_pending",
      });
    }
  }

  const rank = { critical: 0, warning: 1, info: 2 } as const;
  return alerts.sort((a, b) => rank[a.severity] - rank[b.severity]);
}

export function nextStep(alerts: AppAlert[]): AppAlert | null {
  return alerts[0] ?? null;
}
