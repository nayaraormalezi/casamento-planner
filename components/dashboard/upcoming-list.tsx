import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import type { UpcomingGroups } from "@/modules/dashboard";

type UpcomingListProps = {
  groups: UpcomingGroups;
};

function Row({
  title,
  dueLabel,
  href,
  ctaLabel,
  tone,
}: {
  title: string;
  dueLabel: string;
  href: string;
  ctaLabel: string;
  tone: "overdue" | "soon" | "later";
}) {
  return (
    <li className="flex flex-col gap-2 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink">{title}</p>
        <p
          className={cn(
            "mt-0.5 text-xs",
            tone === "overdue" && "text-danger",
            tone === "soon" && "text-warning",
            tone === "later" && "text-ink-tertiary",
          )}
        >
          {dueLabel}
        </p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-center sm:w-auto"
        asChild
      >
        <Link href={href}>{ctaLabel}</Link>
      </Button>
    </li>
  );
}

export function UpcomingList({ groups }: UpcomingListProps) {
  const empty =
    groups.thisWeek.length === 0 && groups.comingWeeks.length === 0;

  return (
    <section className="rounded-lg border border-border bg-canvas-elevated p-5 sm:p-6">
      <h2 className="font-display text-lg font-semibold text-ink">
        Próximas semanas
      </h2>
      <p className="mt-1 text-sm text-ink-tertiary">
        O que vem pela frente, sem precisar abrir o checklist inteiro.
      </p>

      {empty ? (
        <p className="mt-5 text-sm text-ink-secondary">
          Nenhuma tarefa com prazo próximo. Quando houver, organizamos por
          semana.
        </p>
      ) : (
        <div className="mt-5 space-y-6">
          {groups.thisWeek.length > 0 ? (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-ink-disabled">
                Esta semana
              </p>
              <ul className="mt-1 divide-y divide-border">
                {groups.thisWeek.map((item) => (
                  <Row key={item.id} {...item} />
                ))}
              </ul>
            </div>
          ) : null}
          {groups.comingWeeks.length > 0 ? (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-ink-disabled">
                Próximas semanas
              </p>
              <ul className="mt-1 divide-y divide-border">
                {groups.comingWeeks.map((item) => (
                  <Row key={item.id} {...item} />
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
