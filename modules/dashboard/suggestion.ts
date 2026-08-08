import type { WeddingWorkspace } from "@/types/domain";
import { sumPlanned } from "@/modules/budget/calculations";

export type AssistantTip = {
  id: string;
  title: string;
  body: string;
  href: string;
  ctaLabel: string;
};

function budgetDefined(ws: WeddingWorkspace): boolean {
  return ws.wedding.totalBudget > 0;
}

function categoriesAllocated(ws: WeddingWorkspace): boolean {
  const planned = sumPlanned(ws.budgetItems);
  return planned > 0 && planned >= ws.wedding.totalBudget * 0.2;
}

function venueOpen(ws: WeddingWorkspace): boolean {
  const venueContracted = ws.vendors.some(
    (v) => v.categorySlug === "venue" && v.status === "contracted",
  );
  const venueTaskDone = ws.tasks.some(
    (t) =>
      t.templateKey?.includes("lock_venue") && t.status === "done",
  );
  return !venueContracted && !venueTaskDone;
}

export function assistantTip(ws: WeddingWorkspace): AssistantTip | null {
  if (!budgetDefined(ws)) {
    return {
      id: "set-budget",
      title: "Uma sugestão para você",
      body: "Você ainda não definiu o orçamento total. Antes de contratar fornecedores, vale estabelecer um limite por categoria.",
      href: "/app/budget",
      ctaLabel: "Definir orçamento",
    };
  }

  if (!categoriesAllocated(ws)) {
    const total = ws.wedding.totalBudget;
    const reais = Math.round(total / 100).toLocaleString("pt-BR");
    return {
      id: "allocate-budget",
      title: "Uma sugestão para você",
      body: `Antes de contratar fornecedores, defina quanto pretende gastar em cada categoria. Posso ajudar a montar uma distribuição para os seus R$ ${reais}.`,
      href: "/app/ai",
      ctaLabel: "Montar distribuição do orçamento",
    };
  }

  if (venueOpen(ws)) {
    return {
      id: "lock-venue",
      title: "Uma sugestão para você",
      body: "Com o orçamento encaminhado, o próximo passo natural é avançar no local da cerimônia ou festa — ele puxa buffet, decoração e cronograma.",
      href: "/app/vendors?category=venue",
      ctaLabel: "Ver opções de local",
    };
  }

  return null;
}
