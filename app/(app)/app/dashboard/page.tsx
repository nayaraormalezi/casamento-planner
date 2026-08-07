"use client";

import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { KpiStat } from "@/components/shared/kpi-stat";
import { AlertRow } from "@/components/shared/alert-row";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { useWeddingStore } from "@/lib/demo/store";
import { composeDashboard } from "@/modules/budget/calculations";
import { buildAlerts, nextStep } from "@/modules/alerts/rules";
import { formatMoneyBRL } from "@/utils/cn";

export default function DashboardPage() {
  const workspace = useWeddingStore((s) => s.workspace)!;
  const dash = composeDashboard(workspace);
  const alerts = buildAlerts(workspace);
  const step = nextStep(alerts);

  return (
    <div>
      <PageHeader
        title="Início"
        description={
          step
            ? `Próximo: ${step.title}`
            : "Tudo sob controle — avance nas tarefas da fase atual."
        }
        actions={
          step ? (
            <Button asChild>
              <Link href={step.href}>Resolver</Link>
            </Button>
          ) : (
            <Button variant="secondary" asChild>
              <Link href="/app/tasks">Ver tarefas</Link>
            </Button>
          )
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiStat
          label="Planejamento"
          value={`${dash.completionPct}%`}
          helper={`${dash.tasks.done} de ${dash.tasks.total} tarefas`}
        />
        <KpiStat label="Dias restantes" value={dash.daysRemaining} />
        <KpiStat
          label="Comprometido"
          moneyCents={dash.committed}
          compactMoney
          helper={`Teto ${formatMoneyBRL(dash.totalBudget)}`}
        />
        <KpiStat
          label="Atrasadas"
          value={dash.tasks.overdue}
          helper="Tarefas com prazo vencido"
        />
      </div>

      <div className="mt-4 grid gap-3 rounded-lg border border-border bg-canvas-elevated p-4 text-sm sm:grid-cols-4">
        <div>
          <p className="text-ink-tertiary">Previsto</p>
          <p className="font-medium tabular-nums">{formatMoneyBRL(dash.planned)}</p>
        </div>
        <div>
          <p className="text-ink-tertiary">Contratado</p>
          <p className="font-medium tabular-nums">
            {formatMoneyBRL(dash.contracted)}
          </p>
        </div>
        <div>
          <p className="text-ink-tertiary">Pago</p>
          <p className="font-medium tabular-nums">{formatMoneyBRL(dash.paid)}</p>
        </div>
        <div>
          <p className="text-ink-tertiary">Restante caixa</p>
          <p className="font-medium tabular-nums">
            {formatMoneyBRL(dash.remainingCash)}
          </p>
        </div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-5">
        <section className="lg:col-span-3">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Pendências</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/app/alerts">Ver todas</Link>
            </Button>
          </div>
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <p className="text-sm text-ink-tertiary">Nenhum alerta no momento.</p>
            ) : (
              alerts.slice(0, 4).map((a) => (
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
        </section>

        <section className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Decisões</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/app/decisions">Ver todas</Link>
            </Button>
          </div>
          <div className="space-y-3">
            {dash.pendingDecisions.length === 0 ? (
              <p className="text-sm text-ink-tertiary">Nenhuma pendente.</p>
            ) : (
              dash.pendingDecisions.slice(0, 4).map((d) => (
                <div
                  key={d.id}
                  className="rounded-lg border border-border bg-canvas-elevated p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium">{d.title}</p>
                    <StatusBadge status="pending" />
                  </div>
                  {d.dueDate ? (
                    <p className="mt-1 text-xs text-ink-tertiary">
                      Prazo {d.dueDate}
                    </p>
                  ) : null}
                </div>
              ))
            )}
          </div>

          <div className="mt-8">
            <h2 className="mb-3 font-display text-lg font-semibold">Resumo</h2>
            <ul className="space-y-2 text-sm text-ink-secondary">
              <li>Fornecedores contratados: {dash.vendorsContracted}</li>
              <li>Fase atual: {dash.phase}</li>
              <li>
                Orçamento livre:{" "}
                <span className="tabular-nums font-medium text-ink">
                  {formatMoneyBRL(dash.freeBudget)}
                </span>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
