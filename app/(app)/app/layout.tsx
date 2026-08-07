"use client";

import { AppShell } from "@/components/layout/app-shell";
import { RequireAuth } from "@/components/layout/require-auth";
import { useWeddingStore } from "@/lib/demo/store";
import { composeDashboard } from "@/modules/budget/calculations";
import { buildAlerts } from "@/modules/alerts/rules";
import { formatCompactMoneyBRL } from "@/utils/cn";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const workspace = useWeddingStore((s) => s.workspace);

  if (!workspace?.wedding.onboardingDone) {
    return <RequireAuth>{null}</RequireAuth>;
  }

  const dash = composeDashboard(workspace);
  const alerts = buildAlerts(workspace);

  return (
    <RequireAuth>
      <AppShell
        weddingName={workspace.wedding.name}
        daysRemaining={dash.daysRemaining}
        completionPct={dash.completionPct}
        budgetLabel={`${formatCompactMoneyBRL(dash.committed)} / ${formatCompactMoneyBRL(dash.totalBudget)}`}
        alertCount={alerts.filter((a) => a.severity === "critical").length}
      >
        {children}
      </AppShell>
    </RequireAuth>
  );
}
