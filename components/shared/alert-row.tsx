import Link from "next/link";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";

type AlertSeverity = "critical" | "warning" | "info";

const barClass: Record<AlertSeverity, string> = {
  critical: "bg-critical",
  warning: "bg-warning",
  info: "bg-info",
};

type AlertRowProps = {
  severity: AlertSeverity;
  title: string;
  description?: string;
  href?: string;
  ctaLabel?: string;
  className?: string;
};

export function AlertRow({
  severity,
  title,
  description,
  href,
  ctaLabel = "Resolver",
  className,
}: AlertRowProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-4 rounded-lg border border-border bg-canvas-elevated p-4",
        className,
      )}
    >
      <span
        className={cn("mt-1 h-10 w-0.5 shrink-0 rounded-full", barClass[severity])}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-ink">{title}</p>
        {description ? (
          <p className="mt-0.5 text-sm text-ink-tertiary">{description}</p>
        ) : null}
      </div>
      {href ? (
        <Button variant="ghost" size="sm" asChild>
          <Link href={href}>{ctaLabel}</Link>
        </Button>
      ) : null}
    </div>
  );
}
