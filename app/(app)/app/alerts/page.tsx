"use client";

import { PageHeader } from "@/components/shared/page-header";
import { AlertRow } from "@/components/shared/alert-row";
import { useWeddingStore } from "@/lib/demo/store";
import { buildAlerts } from "@/modules/alerts/rules";

export default function AlertsPage() {
  const workspace = useWeddingStore((s) => s.workspace)!;
  const alerts = buildAlerts(workspace);
  const critical = alerts.filter((a) => a.severity === "critical").length;
  const warning = alerts.filter((a) => a.severity === "warning").length;

  return (
    <div>
      <PageHeader
        title="Alertas"
        description={`${critical} críticos · ${warning} avisos`}
      />
      <div className="space-y-3">
        {alerts.length === 0 ? (
          <p className="text-sm text-ink-tertiary">Nenhum alerta no momento.</p>
        ) : (
          alerts.map((a) => (
            <AlertRow
              key={a.id}
              severity={a.severity}
              title={a.title}
              description={a.description}
              href={a.href}
            />
          ))
        )}
      </div>
    </div>
  );
}
