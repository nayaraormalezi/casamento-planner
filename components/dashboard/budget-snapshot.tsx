import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatCompactMoneyBRL, formatMoneyBRL } from "@/utils/cn";

type BudgetSnapshotProps = {
  planned: number;
  totalBudget: number;
  contracted: number;
  paid: number;
};

export function BudgetSnapshot({
  planned,
  totalBudget,
  contracted,
  paid,
}: BudgetSnapshotProps) {
  const available = Math.max(totalBudget - planned, 0);
  const pct =
    totalBudget <= 0
      ? 0
      : Math.min(100, Math.round((planned / totalBudget) * 100));

  return (
    <section className="flex h-full flex-col rounded-lg border border-border bg-canvas-elevated p-5 sm:p-6">
      <h2 className="font-display text-lg font-semibold text-ink">
        Seu orçamento
      </h2>
      <p className="mt-3 text-2xl font-semibold tabular-nums tracking-tight text-ink">
        {formatCompactMoneyBRL(planned)}
        <span className="text-base font-normal text-ink-tertiary">
          {" "}
          de {formatCompactMoneyBRL(totalBudget)}
        </span>
      </p>
      <div
        className="mt-4 h-2 overflow-hidden rounded-full bg-canvas-muted"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Orçamento planejado"
      >
        <div
          className="h-full rounded-full bg-accent transition-[width]"
          style={{ width: `${pct}%` }}
        />
      </div>
      <dl className="mt-5 space-y-2 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-ink-tertiary">Planejados</dt>
          <dd className="tabular-nums font-medium text-ink">
            {formatMoneyBRL(planned)}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-ink-tertiary">Contratados</dt>
          <dd className="tabular-nums font-medium text-ink">
            {formatMoneyBRL(contracted)}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-ink-tertiary">Pagos</dt>
          <dd className="tabular-nums font-medium text-ink">
            {formatMoneyBRL(paid)}
          </dd>
        </div>
        <div className="flex justify-between gap-3 border-t border-border pt-2">
          <dt className="text-ink-secondary">Disponíveis para planejar</dt>
          <dd className="tabular-nums font-medium text-ink">
            {formatMoneyBRL(available)}
          </dd>
        </div>
      </dl>
      <div className="mt-auto pt-5">
        <Button variant="secondary" size="sm" asChild>
          <Link href="/app/budget">Ver orçamento</Link>
        </Button>
      </div>
    </section>
  );
}
