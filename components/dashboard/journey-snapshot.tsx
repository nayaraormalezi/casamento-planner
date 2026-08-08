import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import type { JourneySnapshot } from "@/modules/dashboard";
import type { WeightedProgress } from "@/modules/dashboard";

type JourneySnapshotProps = {
  journey: JourneySnapshot;
  progress: WeightedProgress;
};

export function JourneySnapshotCard({
  journey,
  progress,
}: JourneySnapshotProps) {
  return (
    <section className="flex h-full flex-col rounded-lg border border-border bg-canvas-elevated p-5 sm:p-6">
      <h2 className="font-display text-lg font-semibold text-ink">
        Seu planejamento
      </h2>
      <p className="mt-3 text-2xl font-semibold tabular-nums tracking-tight text-ink">
        {progress.pct}%
      </p>
      <div
        className="mt-4 h-2 overflow-hidden rounded-full bg-canvas-muted"
        role="progressbar"
        aria-valuenow={progress.pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progresso ponderado do planejamento"
      >
        <div
          className="h-full rounded-full bg-accent transition-[width]"
          style={{ width: `${progress.pct}%` }}
        />
      </div>
      <p className="mt-3 text-sm text-ink-secondary">{progress.encouragement}</p>

      <div className="mt-5">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-disabled">
          Fase atual
        </p>
        <p className="mt-1 text-sm font-medium text-ink">{journey.currentLabel}</p>
        {journey.nextLabel ? (
          <p className="mt-1 text-sm text-ink-tertiary">
            Próxima: {journey.nextLabel}
          </p>
        ) : null}
      </div>

      <ol className="mt-5 flex flex-wrap gap-2" aria-label="Jornada do casamento">
        {journey.phases.map((phase) => (
          <li
            key={phase.id}
            className={cn(
              "rounded-md px-2 py-1 text-xs",
              phase.status === "done" &&
                "bg-success-subtle text-success",
              phase.status === "current" &&
                "bg-accent-subtle font-medium text-accent",
              phase.status === "upcoming" && "bg-canvas-muted text-ink-tertiary",
            )}
          >
            {phase.label}
          </li>
        ))}
      </ol>

      {progress.wins.length > 0 ? (
        <ul className="mt-5 space-y-1.5 text-sm text-ink-secondary">
          {progress.wins.map((win) => (
            <li key={win} className="flex gap-2">
              <span className="text-accent" aria-hidden>
                ✓
              </span>
              <span>{win}</span>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-auto pt-5">
        <Button variant="secondary" size="sm" asChild>
          <Link href="/app/tasks">Ver planejamento</Link>
        </Button>
      </div>
    </section>
  );
}
