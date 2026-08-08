import type { Task, WeddingWorkspace } from "@/types/domain";

export type WeightedProgress = {
  pct: number;
  doneWeight: number;
  totalWeight: number;
  doneCount: number;
  totalCount: number;
  encouragement: string;
  wins: string[];
};

function taskWeight(task: Task): number {
  if (task.isMilestone || task.priority >= 5) return 5;
  if (task.priority >= 3) return 3;
  return 1;
}

function winLabel(task: Task): string | null {
  const key = task.templateKey ?? "";
  if (key.includes("set_budget")) return "Definiu o orçamento";
  if (key.includes("set_date")) return "Definiu a data e o horário";
  if (key.includes("set_style")) return "Definiu o estilo do casamento";
  if (key.includes("lock_venue")) return "Fechou o local";
  if (key.includes("guest_list")) return "Criou a lista inicial de convidados";
  if (key.includes("hire_catering")) return "Definiu o buffet";
  if (key.includes("hire_photo")) return "Definiu o fotógrafo";
  if (key.includes("send_invites")) return "Enviou convites";
  if (task.isMilestone) return task.title;
  return null;
}

export function weightedProgress(ws: WeddingWorkspace): WeightedProgress {
  const tasks = ws.tasks;
  const totalCount = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === "done");
  const doneCount = doneTasks.length;

  const totalWeight = tasks.reduce((acc, t) => acc + taskWeight(t), 0);
  const doneWeight = doneTasks.reduce((acc, t) => acc + taskWeight(t), 0);
  const pct =
    totalWeight === 0 ? 0 : Math.round((doneWeight / totalWeight) * 100);

  const wins = doneTasks
    .map(winLabel)
    .filter((x): x is string => Boolean(x));

  // Also surface wedding-level wins without matching tasks
  if (ws.wedding.weddingDate && !wins.some((w) => w.toLowerCase().includes("data"))) {
    wins.unshift("Definiu a data");
  }
  if (
    ws.guests.length > 0 &&
    !wins.some((w) => w.toLowerCase().includes("convid"))
  ) {
    wins.push("Criou a lista inicial de convidados");
  }

  let encouragement = "Cada passo conta — o casamento está tomando forma.";
  if (pct === 0) {
    encouragement = "Vamos começar pelo essencial: orçamento, data e local.";
  } else if (pct < 25) {
    encouragement = "Bom começo. Foque no que desbloqueia as próximas etapas.";
  } else if (pct < 55) {
    encouragement = "Você está no caminho certo.";
  } else if (pct < 85) {
    encouragement = "Você já avançou bastante — continue no ritmo.";
  } else {
    encouragement = "Quase lá. Os últimos detalhes vão brilhar.";
  }

  return {
    pct,
    doneWeight,
    totalWeight,
    doneCount,
    totalCount,
    encouragement,
    wins: [...new Set(wins)].slice(0, 4),
  };
}
