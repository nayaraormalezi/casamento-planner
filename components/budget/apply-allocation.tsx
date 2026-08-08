"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useWeddingStore } from "@/lib/demo/store";
import { proposeBudgetAllocation } from "@/modules/budget/allocation";
import { cn, formatMoneyBRL } from "@/utils/cn";

type ApplyAllocationProps = {
  triggerLabel?: string;
  triggerVariant?: "primary" | "secondary" | "accent" | "ghost";
  triggerSize?: "sm" | "md" | "lg";
  className?: string;
  /** When true, open the preview immediately (e.g. deep-link from dashboard). */
  defaultOpen?: boolean;
};

export function ApplyAllocationButton({
  triggerLabel = "Montar distribuição",
  triggerVariant = "primary",
  triggerSize = "sm",
  className,
  defaultOpen = false,
}: ApplyAllocationProps) {
  const workspace = useWeddingStore((s) => s.workspace)!;
  const applyBudgetAllocation = useWeddingStore((s) => s.applyBudgetAllocation);
  const [open, setOpen] = useState(defaultOpen);
  const [applying, setApplying] = useState(false);

  const plan = useMemo(
    () => proposeBudgetAllocation(workspace),
    [workspace],
  );

  const actionable = plan.createCount + plan.updateCount;

  async function apply() {
    setApplying(true);
    try {
      const res = await applyBudgetAllocation();
      if (!res.ok) {
        toast.error(
          res.error === "NO_TOTAL_BUDGET"
            ? "Defina o orçamento total antes de distribuir"
            : "Não foi possível aplicar a distribuição",
        );
        return;
      }
      if (res.alreadyAllocated) {
        toast.message("A distribuição já está alinhada ao benchmark");
      } else {
        toast.success(
          `Distribuição aplicada · ${res.created ?? 0} novas · ${res.updated ?? 0} atualizadas`,
        );
      }
      setOpen(false);
    } catch {
      toast.error("Não foi possível aplicar a distribuição");
    } finally {
      setApplying(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        variant={triggerVariant}
        size={triggerSize}
        className={cn(className)}
        onClick={() => setOpen(true)}
      >
        {triggerLabel}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Distribuir orçamento</DialogTitle>
            <DialogDescription>
              Sugestão com base em um benchmark brasileiro sobre{" "}
              {formatMoneyBRL(plan.totalBudget)}. Você confirma antes de gravar.
            </DialogDescription>
          </DialogHeader>

          <ul className="space-y-2 text-sm">
            {plan.lines.map((line) => (
              <li
                key={line.slug}
                className="flex items-start justify-between gap-3 border-b border-border py-2 last:border-0"
              >
                <div className="min-w-0">
                  <p className="font-medium text-ink">
                    {line.categoryName}{" "}
                    <span className="font-normal text-ink-tertiary">
                      ({line.pct}%)
                    </span>
                  </p>
                  <p className="text-xs text-ink-tertiary">
                    {line.action === "create" && "Criar item planejado"}
                    {line.action === "update" &&
                      `Ajustar de ${formatMoneyBRL(line.currentCents)}`}
                    {line.action === "skip" && (line.skipReason ?? "Manter")}
                  </p>
                </div>
                <p className="shrink-0 tabular-nums font-medium text-ink">
                  {formatMoneyBRL(line.targetCents)}
                </p>
              </li>
            ))}
          </ul>

          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setOpen(false)}
              disabled={applying}
            >
              Cancelar
            </Button>
            <Button
              variant="accent"
              onClick={() => void apply()}
              disabled={applying || actionable === 0 || plan.totalBudget <= 0}
            >
              {applying
                ? "Aplicando…"
                : actionable === 0
                  ? "Já distribuído"
                  : "Aplicar distribuição"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
