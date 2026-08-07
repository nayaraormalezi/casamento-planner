"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn, formatCompactMoneyBRL, formatMoneyBRL } from "@/utils/cn";

type KpiStatProps = {
  label: string;
  value?: string | number;
  helper?: string;
  onClick?: () => void;
  className?: string;
  /** When value is money in cents */
  moneyCents?: number;
  compactMoney?: boolean;
};

export function KpiStat({
  label,
  value,
  helper,
  onClick,
  className,
  moneyCents,
  compactMoney,
}: KpiStatProps) {
  const reduceMotion = useReducedMotion();
  const display =
    moneyCents !== undefined
      ? compactMoney
        ? formatCompactMoneyBRL(moneyCents)
        : formatMoneyBRL(moneyCents)
      : value;

  const content = (
    <>
      <p className="text-xs font-medium tracking-wide text-ink-tertiary">
        {label}
      </p>
      <motion.p
        key={String(display)}
        initial={reduceMotion ? false : { opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
        className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink tabular-nums"
      >
        {display}
      </motion.p>
      {helper ? (
        <p className="mt-1 text-sm text-ink-tertiary">{helper}</p>
      ) : null}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "rounded-lg border border-border bg-canvas-elevated p-5 text-left transition-colors hover:bg-canvas-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          className,
        )}
      >
        {content}
      </button>
    );
  }

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-canvas-elevated p-5",
        className,
      )}
    >
      {content}
    </div>
  );
}
