"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ApplyAllocationButton } from "@/components/budget/apply-allocation";
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
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {tip.applyAllocation ? (
          <ApplyAllocationButton
            triggerLabel={tip.ctaLabel}
            triggerVariant="primary"
            triggerSize="sm"
            className="w-full sm:w-auto"
          />
        ) : (
          <Button size="sm" className="w-full sm:w-auto" asChild>
            <Link href={tip.href}>{tip.ctaLabel}</Link>
          </Button>
        )}
        {tip.applyAllocation ? (
          <Button size="sm" variant="ghost" className="w-full sm:w-auto" asChild>
            <Link href={tip.href}>Ver no assistente</Link>
          </Button>
        ) : null}
      </div>
    </section>
  );
}
