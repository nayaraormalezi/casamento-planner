import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import {
  attentionHeadline,
  type AttentionItem,
  type AttentionUrgency,
} from "@/modules/dashboard";

const urgencyBar: Record<AttentionUrgency, string> = {
  now: "bg-critical",
  soon: "bg-warning",
  later: "bg-info",
};

type AttentionListProps = {
  items: AttentionItem[];
};

export function AttentionList({ items }: AttentionListProps) {
  if (items.length === 0) {
    return (
      <section className="rounded-lg border border-border bg-canvas-elevated p-4 sm:p-6">
        <h2 className="font-display text-lg font-semibold text-ink">
          {attentionHeadline(0)}
        </h2>
        <p className="mt-2 text-sm text-ink-secondary">
          Você está em dia com o essencial. Quando algo precisar de você, aparece
          aqui.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-border bg-canvas-elevated p-4 sm:p-6">
      <h2 className="font-display text-lg font-semibold text-ink">
        {attentionHeadline(items.length)}
      </h2>
      <ul className="mt-4 space-y-4 sm:mt-5 sm:space-y-5">
        {items.map((item) => (
          <li key={item.id} className="flex gap-3">
            <span
              className={cn(
                "mt-1 h-12 w-0.5 shrink-0 rounded-full",
                urgencyBar[item.urgency],
              )}
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
                <p className="text-sm font-medium text-ink">{item.title}</p>
                <p className="text-xs tabular-nums text-ink-tertiary">
                  {item.effortLabel}
                </p>
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-ink-secondary sm:line-clamp-none">
                {item.why}
              </p>
              <div className="mt-3">
                <Button size="sm" className="w-full sm:w-auto" asChild>
                  <Link href={item.href}>{item.ctaLabel}</Link>
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-5 text-sm text-ink-tertiary sm:mt-6">
        Não se preocupe com o restante ainda. A gente avisa quando chegar a hora.
      </p>
    </section>
  );
}
