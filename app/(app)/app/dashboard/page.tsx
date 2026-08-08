"use client";

import { useWeddingStore } from "@/lib/demo/store";
import { composeDashboard } from "@/modules/budget/calculations";
import {
  assistantTip,
  buildAttentionQueue,
  groupUpcomingTasks,
  resolveJourneyPhase,
  weightedProgress,
} from "@/modules/dashboard";
import { AttentionList } from "@/components/dashboard/attention-list";
import { BudgetSnapshot } from "@/components/dashboard/budget-snapshot";
import { JourneySnapshotCard } from "@/components/dashboard/journey-snapshot";
import { UpcomingList } from "@/components/dashboard/upcoming-list";
import { AssistantNudge } from "@/components/dashboard/assistant-nudge";

function greetingForNow(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

function firstName(fullName: string | null | undefined): string | null {
  if (!fullName?.trim()) return null;
  return fullName.trim().split(/\s+/)[0] ?? null;
}

export default function DashboardPage() {
  const workspace = useWeddingStore((s) => s.workspace)!;
  const session = useWeddingStore((s) => s.session);
  const dash = composeDashboard(workspace);
  const attention = buildAttentionQueue(workspace, 3);
  const journey = resolveJourneyPhase(workspace);
  const progress = weightedProgress(workspace);
  const excludeIds = new Set(attention.map((a) => a.id));
  const upcoming = groupUpcomingTasks(workspace, { excludeIds });
  const tip = assistantTip(workspace);

  const name =
    firstName(session?.fullName) ||
    firstName(workspace.wedding.partnerOneName) ||
    null;
  const couple =
    workspace.wedding.partnerOneName && workspace.wedding.partnerTwoName
      ? `${workspace.wedding.partnerOneName} & ${workspace.wedding.partnerTwoName}`
      : workspace.wedding.name;

  return (
    <div className="space-y-6 sm:space-y-8">
      <header className="max-w-2xl">
        <p className="text-xs text-ink-tertiary sm:text-sm">{couple}</p>
        <h1 className="mt-1 font-display text-xl font-semibold tracking-tight text-ink sm:text-3xl">
          {greetingForNow()}
          {name ? `, ${name}` : ""}
        </h1>
        <p className="mt-2 text-sm text-ink-secondary sm:text-base">
          Seu casamento está a{" "}
          <span className="font-medium tabular-nums text-ink">
            {dash.daysRemaining} dias
          </span>
          . Vamos cuidar do próximo passo.
        </p>
        <p className="mt-1 text-sm text-ink-tertiary">{journey.supportLine}</p>
      </header>

      <AttentionList items={attention} />

      <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
        <BudgetSnapshot
          planned={dash.planned}
          totalBudget={dash.totalBudget}
          contracted={dash.contracted}
          paid={dash.paid}
        />
        <JourneySnapshotCard journey={journey} progress={progress} />
      </div>

      <UpcomingList groups={upcoming} />

      {tip ? <AssistantNudge tip={tip} /> : null}
    </div>
  );
}
