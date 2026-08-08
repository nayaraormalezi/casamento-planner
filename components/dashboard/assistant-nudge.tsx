import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { AssistantTip } from "@/modules/dashboard";

type AssistantNudgeProps = {
  tip: AssistantTip;
};

export function AssistantNudge({ tip }: AssistantNudgeProps) {
  return (
    <section className="rounded-lg border border-border bg-accent-subtle/40 p-5 sm:p-6">
      <p className="text-xs font-medium uppercase tracking-wide text-accent">
        Assistente
      </p>
      <h2 className="mt-2 font-display text-lg font-semibold text-ink">
        {tip.title}
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-ink-secondary">{tip.body}</p>
      <div className="mt-4">
        <Button size="sm" asChild>
          <Link href={tip.href}>{tip.ctaLabel}</Link>
        </Button>
      </div>
    </section>
  );
}
