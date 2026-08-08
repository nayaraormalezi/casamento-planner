import type { Task, WeddingWorkspace } from "@/types/domain";

export type JourneyPhaseId =
  | "initial"
  | "vendors"
  | "guests"
  | "details"
  | "day_of";

export type JourneyPhaseStatus = "done" | "current" | "upcoming";

export type JourneyPhase = {
  id: JourneyPhaseId;
  label: string;
  status: JourneyPhaseStatus;
};

export type JourneySnapshot = {
  phases: JourneyPhase[];
  currentId: JourneyPhaseId;
  currentLabel: string;
  nextLabel: string | null;
  supportLine: string;
};

function taskDone(tasks: Task[], fragment: string): boolean {
  const matches = tasks.filter((t) => t.templateKey?.includes(fragment));
  if (matches.length === 0) return false;
  return matches.every((t) => t.status === "done");
}

function anyTaskDone(tasks: Task[], fragments: string[]): boolean {
  return fragments.some((f) => taskDone(tasks, f));
}

function phaseCompletion(ws: WeddingWorkspace): Record<JourneyPhaseId, boolean> {
  const tasks = ws.tasks;
  const hasVenueVendor = ws.vendors.some(
    (v) => v.categorySlug === "venue" && v.status === "contracted",
  );
  const hasCatering = ws.vendors.some(
    (v) => v.categorySlug === "catering" && v.status === "contracted",
  );
  const hasPhoto = ws.vendors.some(
    (v) => v.categorySlug === "photo_video" && v.status === "contracted",
  );
  const hasDecor = ws.vendors.some(
    (v) => v.categorySlug === "decoration" && v.status === "contracted",
  );

  const budgetOk =
    ws.wedding.totalBudget > 0 &&
    (taskDone(tasks, "set_budget") ||
      ws.budgetItems.some((i) => i.status !== "cancelled"));
  const dateOk = Boolean(ws.wedding.weddingDate) || taskDone(tasks, "set_date");
  const venueOk = hasVenueVendor || taskDone(tasks, "lock_venue");

  const initialDone = budgetOk && dateOk && venueOk;

  const vendorsDone =
    (hasCatering || taskDone(tasks, "research_catering") || taskDone(tasks, "tasting")) &&
    (hasPhoto || taskDone(tasks, "hire_photo")) &&
    (hasDecor || taskDone(tasks, "hire_decor") || taskDone(tasks, "hire_music"));

  const guestListOk =
    ws.guests.length >= 5 ||
    taskDone(tasks, "guest_list") ||
    anyTaskDone(tasks, ["send_invites", "chase_rsvp"]);
  const invitesOk =
    taskDone(tasks, "send_invites") ||
    taskDone(tasks, "chase_rsvp") ||
    (ws.guests.length > 0 &&
      ws.guests.filter((g) => g.rsvp !== "pending").length /
        Math.max(ws.guests.length, 1) >
        0.3);
  const guestsDone = guestListOk && invitesOk;

  const detailsDone =
    anyTaskDone(tasks, ["attire", "hire_music", "hire_decor"]) ||
    ws.honeymoonItems.length > 0 ||
    taskDone(tasks, "passport") ||
    taskDone(tasks, "insurance");

  const dayOfDone =
    taskDone(tasks, "run_of_show") ||
    taskDone(tasks, "confirm_vendors") ||
    taskDone(tasks, "final_guest_count");

  return {
    initial: initialDone,
    vendors: vendorsDone,
    guests: guestsDone,
    details: detailsDone,
    day_of: dayOfDone,
  };
}

const PHASE_ORDER: { id: JourneyPhaseId; label: string }[] = [
  { id: "initial", label: "Planejamento inicial" },
  { id: "vendors", label: "Fornecedores" },
  { id: "guests", label: "Convidados" },
  { id: "details", label: "Detalhes" },
  { id: "day_of", label: "Dia do casamento" },
];

export function resolveJourneyPhase(ws: WeddingWorkspace): JourneySnapshot {
  const done = phaseCompletion(ws);

  let currentIndex = PHASE_ORDER.findIndex((p) => !done[p.id]);
  if (currentIndex < 0) currentIndex = PHASE_ORDER.length - 1;

  const phases: JourneyPhase[] = PHASE_ORDER.map((p, i) => {
    let status: JourneyPhaseStatus = "upcoming";
    if (i < currentIndex) status = "done";
    else if (i === currentIndex) status = "current";
    // If everything done, last phase is current+done feel
    if (currentIndex === PHASE_ORDER.length - 1 && done.day_of && i === currentIndex) {
      status = "done";
    }
    return { id: p.id, label: p.label, status };
  });

  // If all done, mark day_of as current for messaging
  if (done.day_of && PHASE_ORDER.every((p) => done[p.id])) {
    for (const phase of phases) phase.status = "done";
    phases[phases.length - 1].status = "current";
    currentIndex = phases.length - 1;
  }

  const current = PHASE_ORDER[currentIndex];
  const next = PHASE_ORDER[currentIndex + 1] ?? null;

  const supportLine =
    current.id === "initial"
      ? "Você está na fase de definição."
      : current.id === "vendors"
        ? "Hora de fechar os fornecedores principais."
        : current.id === "guests"
          ? "Foque em lista, convites e confirmações."
          : current.id === "details"
            ? "Os detalhes estão deixando o dia com a sua cara."
            : "Você está na reta final — organize o dia.";

  return {
    phases,
    currentId: current.id,
    currentLabel: current.label,
    nextLabel: next?.label ?? null,
    supportLine,
  };
}
