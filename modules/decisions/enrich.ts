import type { Decision, WeddingWorkspace } from "@/types/domain";
import { daysUntil } from "@/modules/budget/calculations";
import { formatMoneyBRL } from "@/utils/cn";

export type DecisionImportance = "high" | "next" | "later";

export type EnrichedDecision = Decision & {
  question: string;
  options: string[];
  optionsCount: number;
  budgetHint: string | null;
  importance: DecisionImportance;
  importanceLabel: string;
  dueLabel: string | null;
  ctaLabel: string;
};

const HIGH_CATEGORIES = new Set([
  "venue",
  "catering",
  "photo_video",
  "decoration",
  "other",
]);

function parseOptions(raw: string): string[] {
  if (!raw.trim()) return [];
  return raw
    .split(/[·•|;,/]+|\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function toQuestion(title: string): string {
  const t = title.trim();
  if (!t) return "Qual decisão tomar?";
  if (/[?？]$/.test(t)) return t;
  if (/^(qual|quais|como|quando|onde|devemos|escolher)/i.test(t)) {
    return t.endsWith("?") ? t : `${t}?`;
  }
  // "Escolher buffet" → "Qual buffet escolher?"
  const choose = t.match(/^escolh(?:er|a)\s+(.+)$/i);
  if (choose) return `Qual ${choose[1]} escolher?`;
  const define = t.match(/^defin(?:ir|a)\s+(.+)$/i);
  if (define) return `Como definir ${define[1]}?`;
  return `${t}?`;
}

function importanceFor(
  d: Decision,
  today: string,
): { importance: DecisionImportance; label: string } {
  if (d.dueDate && d.dueDate < today) {
    return { importance: "high", label: "Prioridade alta" };
  }
  if (d.dueDate) {
    const days = daysUntil(d.dueDate);
    if (days <= 7) return { importance: "high", label: "Prioridade alta" };
    if (days <= 21) return { importance: "next", label: "Próximo" };
  }
  if (
    (d.emotionalReturn ?? 0) >= 4 ||
    (d.categorySlug && HIGH_CATEGORIES.has(d.categorySlug))
  ) {
    return { importance: "next", label: "Próximo" };
  }
  return { importance: "later", label: "Pode esperar" };
}

function dueLabel(dueDate: string | null, today: string): string | null {
  if (!dueDate) return null;
  if (dueDate < today) return "Prazo passou";
  const days = daysUntil(dueDate);
  if (days === 0) return "Prazo hoje";
  if (days === 1) return "Prazo amanhã";
  if (days <= 14) return `Prazo em ${days} dias`;
  return `Prazo ${dueDate}`;
}

function budgetHint(d: Decision, ws: WeddingWorkspace): string | null {
  if (d.budgetItemId) {
    const item = ws.budgetItems.find((i) => i.id === d.budgetItemId);
    if (item) {
      return `Até ${formatMoneyBRL(item.plannedAmount)} no orçamento`;
    }
  }
  if (!d.categorySlug) return null;
  const category = ws.categories.find((c) => c.slug === d.categorySlug);
  if (!category) return null;
  const items = ws.budgetItems.filter(
    (i) => i.categoryId === category.id && i.status !== "cancelled",
  );
  if (items.length === 0) return null;
  const planned = items.reduce((a, i) => a + i.plannedAmount, 0);
  if (planned <= 0) return null;
  return `Até ${formatMoneyBRL(planned)} em ${category.name}`;
}

export function enrichDecision(
  d: Decision,
  ws: WeddingWorkspace,
): EnrichedDecision {
  const today = new Date().toISOString().slice(0, 10);
  const options = parseOptions(d.optionsConsidered);
  const { importance, label } = importanceFor(d, today);
  return {
    ...d,
    question: toQuestion(d.title),
    options,
    optionsCount: options.length,
    budgetHint: budgetHint(d, ws),
    importance,
    importanceLabel: label,
    dueLabel: dueLabel(d.dueDate, today),
    ctaLabel:
      d.status === "pending"
        ? options.length > 1
          ? "Comparar opções"
          : "Continuar decisão"
        : "Ver registro",
  };
}

export function rankPendingDecisions(ws: WeddingWorkspace): EnrichedDecision[] {
  const rank = { high: 0, next: 1, later: 2 } as const;
  return ws.decisions
    .filter((d) => d.status === "pending")
    .map((d) => enrichDecision(d, ws))
    .sort((a, b) => {
      if (rank[a.importance] !== rank[b.importance]) {
        return rank[a.importance] - rank[b.importance];
      }
      return (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999");
    });
}
