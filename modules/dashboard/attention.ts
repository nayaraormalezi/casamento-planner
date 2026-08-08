import type { AppAlert, Task, WeddingWorkspace } from "@/types/domain";
import { buildAlerts } from "@/modules/alerts/rules";
import { daysUntil } from "@/modules/budget/calculations";
import { moduleForTask } from "@/modules/tasks/module-links";

export type AttentionUrgency = "now" | "soon" | "later";

export type AttentionItem = {
  id: string;
  title: string;
  why: string;
  effortLabel: string;
  urgency: AttentionUrgency;
  href: string;
  ctaLabel: string;
  source: "task" | "alert";
};

const WHY_BY_KEY: Record<string, string> = {
  set_budget:
    "Essa decisão libera o planejamento dos fornecedores e das categorias.",
  set_date:
    "Data e estilo orientam prazo, disponibilidade e o tom do casamento.",
  lock_venue:
    "O local influencia quase todas as próximas decisões e contratações.",
  research_catering:
    "Buffet costuma ser um dos maiores custos — cotar cedo abre opções.",
  hire_photo: "Fotografia boa esgota agenda; priorize enquanto há datas.",
  guest_list: "A lista define tamanho do evento e custo de buffet e espaço.",
  send_invites: "Convites em dia evitam corrida de RSVP perto da data.",
  chase_rsvp: "Confirmações fecham o número final para fornecedores.",
  review_payments: "Pagamentos em aberto protegem o caixa até o grande dia.",
  confirm_vendors: "Confirmar fornecedores evita surpresas na reta final.",
  hire_decor: "Decoração amarra o visual do dia e costuma ter lead time.",
  hire_music: "Música define o clima da festa — agendas enchem cedo.",
  attire: "Trajes pedem prova e ajustes; deixe margem de tempo.",
  tasting: "Degustação confirma o cardápio antes de fechar detalhes.",
  run_of_show: "O cronograma do dia alinha família, fornecedores e você.",
};

const EFFORT_BY_KEY: Record<string, string> = {
  set_budget: "~10 min",
  set_date: "~15 min",
  lock_venue: "~30 min",
  research_catering: "~1 h",
  hire_photo: "~45 min",
  guest_list: "~30 min",
  send_invites: "~20 min",
  chase_rsvp: "~20 min",
  review_payments: "~15 min",
  confirm_vendors: "~20 min",
  hire_decor: "~30 min",
  hire_music: "~30 min",
  attire: "~45 min",
  tasting: "~1 h",
  run_of_show: "~20 min",
};

function keyFragment(templateKey: string | null): string | null {
  if (!templateKey) return null;
  const parts = templateKey.split(".");
  return parts[parts.length - 1] ?? null;
}

export function whyForTask(task: Task, overdue: boolean): string {
  const frag = keyFragment(task.templateKey);
  if (frag) {
    for (const [key, text] of Object.entries(WHY_BY_KEY)) {
      if (frag.includes(key) || task.templateKey?.includes(key)) return text;
    }
  }
  if (overdue) {
    return "Prazo passou — retomar agora evita efeito cascata no planejamento.";
  }
  if (task.isMilestone || task.priority >= 5) {
    return "É um marco do casamento: desbloqueia outras frentes.";
  }
  if (task.priority >= 4) {
    return "Alta prioridade nesta etapa do planejamento.";
  }
  return "Ajuda o casamento a continuar andando sem acumular pendências.";
}

export function effortForTask(task: Task): string {
  const frag = keyFragment(task.templateKey);
  if (frag) {
    for (const [key, label] of Object.entries(EFFORT_BY_KEY)) {
      if (frag.includes(key) || task.templateKey?.includes(key)) return label;
    }
  }
  if (task.isMilestone) return "~30 min";
  if (task.priority >= 4) return "~20 min";
  return "~15 min";
}

function ctaForTask(task: Task, urgency: AttentionUrgency): string {
  const mod = moduleForTask(task);
  if (urgency === "now") return "Resolver agora";
  if (task.status === "doing") return "Continuar";
  if (mod.actionLabel.startsWith("Abrir")) return "Ver tarefa";
  return mod.actionLabel;
}

function scoreTask(task: Task, today: string): number {
  let score = task.priority * 10;
  if (task.isMilestone) score += 25;
  const key = task.templateKey ?? "";
  if (key.includes("set_budget")) score += 40;
  if (key.includes("lock_venue")) score += 35;
  if (key.includes("research_catering")) score += 20;
  if (key.includes("set_date")) score += 30;
  if (task.dueDate) {
    if (task.dueDate < today) score += 50;
    else {
      const dueIn = daysUntil(task.dueDate);
      if (dueIn <= 3) score += 30;
      else if (dueIn <= 7) score += 18;
      else if (dueIn <= 14) score += 8;
    }
  }
  if (task.status === "doing") score += 8;
  return score;
}

export function urgencyForTask(task: Task, today: string): AttentionUrgency {
  if (task.dueDate && task.dueDate < today) return "now";
  if (task.dueDate) {
    const dueIn = daysUntil(task.dueDate);
    if (dueIn <= 3) return "now";
    if (dueIn <= 7) return "soon";
  }
  if (task.priority >= 5 || task.isMilestone) return "soon";
  return "later";
}

function attentionFromAlert(alert: AppAlert): AttentionItem | null {
  // Prefer task-derived items; keep payment / budget critical alerts.
  if (alert.id.startsWith("A5-") || alert.id.startsWith("A7-")) return null;
  if (alert.severity === "info") return null;

  const urgency: AttentionUrgency =
    alert.severity === "critical" ? "now" : "soon";

  return {
    id: `alert-${alert.id}`,
    title: alert.title.replace(/^Tarefa atrasada:\s*/i, ""),
    why:
      alert.description ??
      (alert.severity === "critical"
        ? "Precisa de atenção para não travar o planejamento."
        : "Vale resolver em breve para manter o ritmo."),
    effortLabel: "~10 min",
    urgency,
    href: alert.href,
    ctaLabel: urgency === "now" ? "Resolver agora" : "Ver detalhes",
    source: "alert",
  };
}

export function buildAttentionQueue(
  ws: WeddingWorkspace,
  limit = 3,
): AttentionItem[] {
  const today = new Date().toISOString().slice(0, 10);
  const open = ws.tasks.filter((t) => t.status !== "done");

  const fromTasks: AttentionItem[] = open
    .map((task) => {
      const overdue = Boolean(task.dueDate && task.dueDate < today);
      const urgency = urgencyForTask(task, today);
      const mod = moduleForTask(task);
      return {
        item: {
          id: `task-${task.id}`,
          title: task.title,
          why: whyForTask(task, overdue),
          effortLabel: effortForTask(task),
          urgency,
          href: mod.href,
          ctaLabel: ctaForTask(task, urgency),
          source: "task" as const,
        },
        score: scoreTask(task, today),
      };
    })
    .sort((a, b) => b.score - a.score)
    .map((x) => x.item);

  const alerts = buildAlerts(ws);
  const fromAlerts = alerts
    .map(attentionFromAlert)
    .filter((x): x is AttentionItem => x != null);

  const merged: AttentionItem[] = [];
  const seen = new Set<string>();

  for (const item of [...fromTasks, ...fromAlerts]) {
    const key = item.title.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(item);
    if (merged.length >= limit) break;
  }

  return merged;
}

export function attentionHeadline(count: number): string {
  if (count <= 0) return "Nada urgente no momento";
  if (count === 1) return "1 coisa precisa da sua atenção";
  return `${count} coisas precisam da sua atenção`;
}
