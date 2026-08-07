"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { EmotionalReturn } from "@/components/shared/emotional-return";
import { Money } from "@/components/shared/money";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useWeddingStore } from "@/lib/demo/store";
import {
  committedAmount,
  composeDashboard,
  suggestCuts,
} from "@/modules/budget/calculations";
import { formatMoneyBRL } from "@/utils/cn";

export default function PriorityPage() {
  const workspace = useWeddingStore((s) => s.workspace)!;
  const applyBudgetCuts = useWeddingStore((s) => s.applyBudgetCuts);
  const dash = composeDashboard(workspace);
  const overflow = Math.max(0, dash.committed - dash.totalBudget);
  const [targetReais, setTargetReais] = useState(
    String(Math.max(Math.round(overflow / 100), 5000)),
  );
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const candidates = useMemo(
    () => suggestCuts(workspace.budgetItems, Number(targetReais) * 100 || 0),
    [workspace.budgetItems, targetReais],
  );

  const selectedSavings = candidates
    .filter((c) => selected.has(c.id))
    .reduce((acc, c) => acc + c.suggestedSavings, 0);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function simulate() {
    setSelected(new Set(candidates.map((c) => c.id)));
  }

  function apply() {
    const updates = candidates
      .filter((c) => selected.has(c.id))
      .map((c) => {
        if (c.suggestedAction === "remove") {
          return { id: c.id, plannedAmount: 0, status: "cancelled" as const };
        }
        const next = Math.max(0, committedAmount(c) - c.suggestedSavings);
        return { id: c.id, plannedAmount: next };
      });
    applyBudgetCuts(updates);
    toast.success(`Cortes aplicados · −${formatMoneyBRL(selectedSavings)}`);
    setSelected(new Set());
  }

  return (
    <div>
      <PageHeader
        title="Prioridades"
        description={
          overflow > 0
            ? `Orçamento ${Math.round((overflow / dash.totalBudget) * 100)}% acima — quanto quer recuperar?`
            : "Simule cortes mesmo sem estouro para liberar caixa."
        }
      />

      <div className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-canvas-elevated p-4">
        <div className="space-y-2">
          <Label>Meta de corte (R$)</Label>
          <Input
            className="w-40"
            type="number"
            value={targetReais}
            onChange={(e) => setTargetReais(e.target.value)}
          />
        </div>
        <Button onClick={simulate}>Simular</Button>
      </div>

      <div className="mt-6 space-y-3">
        {candidates.length === 0 ? (
          <p className="text-sm text-ink-tertiary">
            Nenhum item elegível para corte com essa meta.
          </p>
        ) : (
          candidates.map((c) => (
            <label
              key={c.id}
              className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-canvas-elevated p-4"
            >
              <Checkbox
                checked={selected.has(c.id)}
                onCheckedChange={() => toggle(c.id)}
                className="mt-1"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{c.description}</p>
                  <PriorityBadge priority={c.priority} />
                  <EmotionalReturn value={c.emotionalReturn} />
                </div>
                <p className="mt-1 text-sm text-ink-tertiary">
                  {c.flexibility === "can_remove" ? "Pode remover" : "Reduzir ~30%"}{" "}
                  · −
                  <Money cents={c.suggestedSavings} className="text-ink-tertiary" />
                </p>
              </div>
            </label>
          ))
        )}
      </div>

      <div className="sticky bottom-20 mt-8 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-canvas-elevated p-4 lg:bottom-4">
        <p className="text-sm">
          Novo comprometido estimado:{" "}
          <strong className="tabular-nums">
            {formatMoneyBRL(dash.committed - selectedSavings)}
          </strong>{" "}
          / {formatMoneyBRL(dash.totalBudget)} · Selecionado −
          {formatMoneyBRL(selectedSavings)}
        </p>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setSelected(new Set())}>
            Limpar
          </Button>
          <Button
            variant="accent"
            disabled={selected.size === 0}
            onClick={apply}
          >
            Aplicar cortes
          </Button>
        </div>
      </div>
    </div>
  );
}
