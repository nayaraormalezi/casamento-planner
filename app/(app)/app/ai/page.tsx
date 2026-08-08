"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApplyAllocationButton } from "@/components/budget/apply-allocation";
import { useWeddingStore } from "@/lib/demo/store";
import { proposeBudgetAllocation } from "@/modules/budget/allocation";
import {
  composeDashboard,
  suggestCuts,
  sumCommitted,
} from "@/modules/budget/calculations";
import { formatMoneyBRL } from "@/utils/cn";
import type { Task } from "@/types/domain";

type Intent =
  | "budget_overflow"
  | "what_to_hire"
  | "generate_tasks"
  | "vendor_value"
  | "budget_allocation";

const intents: { id: Intent; label: string }[] = [
  { id: "budget_allocation", label: "Distribuir $" },
  { id: "budget_overflow", label: "Estourou orçamento" },
  { id: "what_to_hire", label: "O que contratar" },
  { id: "generate_tasks", label: "Gerar tarefas" },
  { id: "vendor_value", label: "Custo-benefício" },
];

function parseIntent(value: string | null): Intent | null {
  if (!value) return null;
  return intents.some((i) => i.id === value) ? (value as Intent) : null;
}

function AiPageInner() {
  const params = useSearchParams();
  const workspace = useWeddingStore((s) => s.workspace)!;
  const applyBudgetCuts = useWeddingStore((s) => s.applyBudgetCuts);
  const upsertTask = useWeddingStore((s) => s.upsertTask);
  const dash = composeDashboard(workspace);
  const initialIntent = parseIntent(params.get("intent")) ?? "budget_allocation";
  const [intent, setIntent] = useState<Intent>(initialIntent);
  const [targetReais, setTargetReais] = useState("10000");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [generated, setGenerated] = useState(
    initialIntent === "budget_allocation",
  );

  useEffect(() => {
    const fromUrl = parseIntent(params.get("intent"));
    if (fromUrl) {
      setIntent(fromUrl);
      setGenerated(fromUrl === "budget_allocation");
    }
  }, [params]);

  const overflowCuts = useMemo(
    () => suggestCuts(workspace.budgetItems, Number(targetReais) * 100 || 0),
    [workspace.budgetItems, targetReais],
  );

  const missingHire = useMemo(() => {
    const contractedCats = new Set(
      workspace.vendors
        .filter((v) => v.status === "contracted")
        .map((v) => v.categorySlug),
    );
    const essential = ["venue", "catering", "photo_video", "music", "decoration"];
    return essential
      .filter((slug) => !contractedCats.has(slug))
      .map((slug) => workspace.categories.find((c) => c.slug === slug)?.name ?? slug);
  }, [workspace]);

  const vendorRanking = useMemo(() => {
    return [...workspace.vendors]
      .filter((v) => v.quotedAmount != null)
      .map((v) => ({
        ...v,
        score:
          (v.rating ?? 3) / ((v.quotedAmount ?? 1) / 100000) +
          (v.status === "contracted" ? 0.5 : 0),
      }))
      .sort((a, b) => b.score - a.score);
  }, [workspace]);

  const allocation = useMemo(
    () => proposeBudgetAllocation(workspace),
    [workspace],
  );

  function runGenerate() {
    setGenerated(true);
    setSelected(new Set());
    if (intent === "budget_overflow") {
      setSelected(new Set(overflowCuts.map((c) => c.id)));
    }
    toast.message("Sugestão gerada (regras + benchmark BR)");
  }

  function apply() {
    if (intent === "budget_overflow") {
      const updates = overflowCuts
        .filter((c) => selected.has(c.id))
        .map((c) =>
          c.suggestedAction === "remove"
            ? {
                id: c.id,
                plannedAmount: 0,
                status: "cancelled" as const,
              }
            : {
                id: c.id,
                plannedAmount: Math.max(
                  0,
                  (c.contractedAmount ?? c.plannedAmount) - c.suggestedSavings,
                ),
              },
        );
      void applyBudgetCuts(updates);
      toast.success("Cortes aplicados");
      return;
    }
    if (intent === "generate_tasks") {
      const extras: Task[] = [
        {
          id: crypto.randomUUID(),
          title: "Revisar lista de músicas da festa",
          description: "Sugestão IA",
          phase: dash.phase,
          categorySlug: "music",
          priority: 3,
          dueDate: null,
          startDate: null,
          status: "todo",
          isMilestone: false,
          assignee: null,
          vendorId: null,
          budgetItemId: null,
          templateKey: "ai.music_list",
          budgetOptions: [],
        },
        {
          id: crypto.randomUUID(),
          title: "Agendar prova de menu",
          description: "Sugestão IA",
          phase: dash.phase,
          categorySlug: "catering",
          priority: 4,
          dueDate: null,
          startDate: null,
          status: "todo",
          isMilestone: false,
          assignee: null,
          vendorId: null,
          budgetItemId: null,
          templateKey: "ai.menu_tasting",
          budgetOptions: [],
        },
      ];
      extras.forEach((t) => void upsertTask(t));
      toast.success("2 tarefas adicionadas");
    }
  }

  return (
    <div>
      <PageHeader
        title="Assistente"
        description="Sugestões com base nos seus números — você confirma antes de aplicar."
      />

      <div className="flex flex-wrap gap-2">
        {intents.map((i) => (
          <Button
            key={i.id}
            size="sm"
            variant={intent === i.id ? "primary" : "secondary"}
            onClick={() => {
              setIntent(i.id);
              setGenerated(i.id === "budget_allocation");
            }}
          >
            {i.label}
          </Button>
        ))}
      </div>

      {intent === "budget_overflow" ? (
        <div className="mt-6 max-w-xs space-y-2">
          <Label>Meta de corte (R$)</Label>
          <Input
            type="number"
            value={targetReais}
            onChange={(e) => setTargetReais(e.target.value)}
          />
        </div>
      ) : null}

      {intent !== "budget_allocation" ? (
        <Button className="mt-4" onClick={runGenerate}>
          Gerar sugestão
        </Button>
      ) : null}

      {intent === "budget_allocation" || generated ? (
        <div className="mt-8 rounded-lg border border-border bg-canvas-elevated p-5">
          <p className="text-sm text-ink-tertiary">
            Evidência: comprometido{" "}
            <strong className="text-ink tabular-nums">
              {formatMoneyBRL(sumCommitted(workspace.budgetItems))}
            </strong>{" "}
            de {formatMoneyBRL(dash.totalBudget)}
            {dash.overBudgetPct > 0
              ? ` (${dash.overBudgetPct}% acima)`
              : ""}
          </p>

          {intent === "budget_allocation" && (
            <div className="mt-4 space-y-4">
              <p className="text-sm text-ink-secondary">
                Distribuição sugerida por categoria (benchmark BR). Revise e
                aplique — criamos ou ajustamos os itens planejados.
              </p>
              <ul className="space-y-2 text-sm">
                {allocation.lines.map((a) => (
                  <li key={a.slug} className="flex justify-between gap-4">
                    <span>
                      {a.categoryName} ({a.pct}%)
                      <span className="ml-2 text-xs text-ink-tertiary">
                        {a.action === "create" && "novo"}
                        {a.action === "update" && "ajustar"}
                        {a.action === "skip" && "manter"}
                      </span>
                    </span>
                    <span className="tabular-nums font-medium">
                      {formatMoneyBRL(a.targetCents)}
                    </span>
                  </li>
                ))}
              </ul>
              <ApplyAllocationButton
                triggerLabel="Aplicar distribuição"
                triggerVariant="accent"
                triggerSize="md"
              />
            </div>
          )}

          {intent === "budget_overflow" && generated && (
            <div className="mt-4 space-y-3">
              {overflowCuts.map((c) => (
                <label key={c.id} className="flex items-start gap-3">
                  <Checkbox
                    checked={selected.has(c.id)}
                    onCheckedChange={() => {
                      setSelected((prev) => {
                        const n = new Set(prev);
                        if (n.has(c.id)) n.delete(c.id);
                        else n.add(c.id);
                        return n;
                      });
                    }}
                  />
                  <span className="text-sm">
                    {c.description} · −{formatMoneyBRL(c.suggestedSavings)} (
                    {c.suggestedAction})
                  </span>
                </label>
              ))}
              <Button variant="accent" onClick={apply}>
                Aplicar selecionados
              </Button>
            </div>
          )}

          {intent === "what_to_hire" && generated && (
            <ul className="mt-4 list-disc space-y-1 pl-5 text-sm">
              {missingHire.length === 0 ? (
                <li>Categorias essenciais já contratadas.</li>
              ) : (
                missingHire.map((n) => <li key={n}>{n}</li>)
              )}
            </ul>
          )}

          {intent === "generate_tasks" && generated && (
            <div className="mt-4">
              <p className="text-sm">
                Sugerimos 2 tarefas para a fase atual ({dash.phase}).
              </p>
              <Button className="mt-3" variant="accent" onClick={apply}>
                Adicionar tarefas
              </Button>
            </div>
          )}

          {intent === "vendor_value" && generated && (
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm">
              {vendorRanking.length === 0 ? (
                <li>Cadastre cotações para comparar.</li>
              ) : (
                vendorRanking.map((v) => (
                  <li key={v.id}>
                    {v.name} · {formatMoneyBRL(v.quotedAmount ?? 0)} · ★
                    {v.rating ?? "—"}
                  </li>
                ))
              )}
            </ol>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default function AiPage() {
  return (
    <Suspense
      fallback={
        <div className="text-sm text-ink-tertiary">Carregando assistente…</div>
      }
    >
      <AiPageInner />
    </Suspense>
  );
}
