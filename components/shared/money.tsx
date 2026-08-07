import { cn, formatMoneyBRL } from "@/utils/cn";

type MoneyProps = {
  cents: number;
  className?: string;
  compact?: boolean;
  /** Align typically right in tables */
  align?: "left" | "right";
};

export function Money({
  cents,
  className,
  compact,
  align = "left",
}: MoneyProps) {
  const formatted = compact
    ? new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        notation: Math.abs(cents) >= 100000 ? "compact" : "standard",
        maximumFractionDigits: Math.abs(cents) >= 100000 ? 1 : 2,
      }).format(cents / 100)
    : formatMoneyBRL(cents);

  return (
    <span
      className={cn(
        "tabular-nums font-medium text-ink",
        align === "right" && "block text-right",
        className,
      )}
    >
      {formatted}
    </span>
  );
}
