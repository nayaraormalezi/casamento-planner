"use client";

import { useMemo } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Money } from "@/components/shared/money";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { useWeddingStore } from "@/lib/demo/store";
import {
  committedAmount,
  composeDashboard,
  sumPlanned,
} from "@/modules/budget/calculations";
import { buildAlerts } from "@/modules/alerts/rules";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { formatMoneyBRL } from "@/utils/cn";

const COLORS = [
  "var(--wp-chart-1)",
  "var(--wp-chart-2)",
  "var(--wp-chart-3)",
  "var(--wp-chart-4)",
  "var(--wp-chart-5)",
  "var(--wp-chart-6)",
];

export default function AnalyticsPage() {
  const workspace = useWeddingStore((s) => s.workspace)!;
  const dash = composeDashboard(workspace);
  const alerts = buildAlerts(workspace);

  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of workspace.budgetItems) {
      if (item.status === "cancelled") continue;
      const name =
        workspace.categories.find((c) => c.id === item.categoryId)?.name ??
        "Outros";
      map.set(name, (map.get(name) ?? 0) + item.plannedAmount);
    }
    return [...map.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [workspace]);

  const topCosts = [...workspace.budgetItems]
    .filter((i) => i.status !== "cancelled")
    .sort((a, b) => committedAmount(b) - committedAmount(a))
    .slice(0, 5);

  const highPriority = workspace.budgetItems
    .filter((i) => i.priority >= 4 && i.status !== "cancelled")
    .sort((a, b) => committedAmount(b) - committedAmount(a))
    .slice(0, 5);

  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Diagnóstico operacional — não vanity metrics."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-canvas-elevated p-4">
          <h2 className="mb-4 font-display text-lg font-semibold">
            Share do orçamento
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={byCategory}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={90}
                >
                  {byCategory.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => formatMoneyBRL(Number(v))}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-sm text-ink-tertiary">
            Previsto total {formatMoneyBRL(sumPlanned(workspace.budgetItems))} ·
            Comprometido {formatMoneyBRL(dash.committed)}
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="mb-3 font-display text-lg font-semibold">
              Maiores custos
            </h2>
            <ul className="space-y-2">
              {topCosts.map((i) => (
                <li
                  key={i.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span>{i.description}</span>
                  <Money cents={committedAmount(i)} />
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="mb-3 font-display text-lg font-semibold">
              Alta prioridade
            </h2>
            <ul className="space-y-2">
              {highPriority.map((i) => (
                <li
                  key={i.id}
                  className="flex items-center justify-between gap-2 text-sm"
                >
                  <span className="flex items-center gap-2">
                    <PriorityBadge priority={i.priority} />
                    {i.description}
                  </span>
                  <Money cents={committedAmount(i)} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-lg border border-border bg-canvas-elevated p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Alertas ativos</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/app/alerts">Abrir</Link>
          </Button>
        </div>
        <p className="mt-2 text-sm text-ink-tertiary">
          {alerts.filter((a) => a.severity === "critical").length} críticos ·{" "}
          {alerts.length} no total · {dash.tasks.overdue} tarefas atrasadas
        </p>
      </div>
    </div>
  );
}
