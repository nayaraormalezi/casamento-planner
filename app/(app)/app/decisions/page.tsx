"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { EmptyState } from "@/components/shared/empty-state";
import { useWeddingStore } from "@/lib/demo/store";
import type { Decision } from "@/types/domain";
import {
  enrichDecision,
  rankPendingDecisions,
  type DecisionImportance,
  type EnrichedDecision,
} from "@/modules/decisions/enrich";
import { Scale } from "lucide-react";
import { cn } from "@/utils/cn";

function newId() {
  return crypto.randomUUID();
}

const importanceTone: Record<DecisionImportance, string> = {
  high: "text-danger",
  next: "text-warning",
  later: "text-ink-tertiary",
};

function DecisionCard({
  item,
  onOpen,
}: {
  item: EnrichedDecision;
  onOpen: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        className="flex w-full items-start justify-between gap-3 rounded-lg border border-border bg-canvas-elevated p-4 text-left transition-colors hover:bg-canvas-muted/40"
        onClick={onOpen}
      >
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "text-xs font-medium",
              importanceTone[item.importance],
            )}
          >
            {item.importanceLabel}
          </p>
          <p className="mt-1 font-medium text-ink">{item.question}</p>
          <p className="mt-1 text-sm text-ink-secondary">
            {item.optionsCount > 0
              ? `${item.optionsCount} opção${item.optionsCount > 1 ? "ões" : ""} salva${item.optionsCount > 1 ? "s" : ""}`
              : "Ainda sem opções registradas"}
            {item.budgetHint ? ` · ${item.budgetHint}` : ""}
          </p>
          {item.dueLabel ? (
            <p className="mt-1 text-xs text-ink-tertiary">{item.dueLabel}</p>
          ) : null}
          {item.chosenOption ? (
            <p className="mt-2 text-sm text-ink-secondary">
              Escolhido: {item.chosenOption}
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <StatusBadge
            status={item.status === "pending" ? "pending" : "decided"}
          />
          <span className="text-xs font-medium text-accent">{item.ctaLabel}</span>
        </div>
      </button>
    </li>
  );
}

export default function DecisionsPage() {
  const workspace = useWeddingStore((s) => s.workspace)!;
  const upsert = useWeddingStore((s) => s.upsertDecision);
  const [tab, setTab] = useState<"pending" | "decided">("pending");
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Decision | null>(null);

  const pending = useMemo(
    () => rankPendingDecisions(workspace),
    [workspace],
  );
  const decided = useMemo(
    () =>
      workspace.decisions
        .filter((d) => d.status !== "pending")
        .map((d) => enrichDecision(d, workspace)),
    [workspace],
  );

  const list = tab === "pending" ? pending : decided;
  const important = pending.filter((d) => d.importance !== "later").slice(0, 3);

  function openNew() {
    setDraft({
      id: newId(),
      title: "",
      categorySlug: null,
      status: "pending",
      optionsConsidered: "",
      chosenOption: "",
      rationale: "",
      dueDate: null,
      decidedAt: null,
      vendorId: null,
      budgetItemId: null,
      emotionalReturn: 3,
    });
    setOpen(true);
  }

  return (
    <div>
      <PageHeader
        title="Decisões"
        description="Separe o que é escolha (comparar, conversar, decidir) do que é só tarefa."
        actions={<Button onClick={openNew}>Nova</Button>}
      />

      {tab === "pending" && important.length > 0 ? (
        <section className="mb-8 rounded-lg border border-border bg-canvas-elevated p-5">
          <h2 className="font-display text-lg font-semibold text-ink">
            Decisões importantes
          </h2>
          <p className="mt-1 text-sm text-ink-tertiary">
            O que mais impacta o resto do planejamento agora.
          </p>
          <ul className="mt-4 space-y-3">
            {important.map((d) => (
              <DecisionCard
                key={`imp-${d.id}`}
                item={d}
                onOpen={() => {
                  setDraft({ ...d });
                  setOpen(true);
                }}
              />
            ))}
          </ul>
        </section>
      ) : null}

      <div className="mb-4 flex gap-2">
        <Button
          size="sm"
          variant={tab === "pending" ? "primary" : "secondary"}
          onClick={() => setTab("pending")}
        >
          Pendentes ({pending.length})
        </Button>
        <Button
          size="sm"
          variant={tab === "decided" ? "primary" : "secondary"}
          onClick={() => setTab("decided")}
        >
          Decididas ({decided.length})
        </Button>
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon={Scale}
          title="Escolhas importantes merecem registro"
          description="Buffet, vestido, paleta — compare opções e deixe o motivo documentado."
          actionLabel="Nova decisão"
          onAction={openNew}
        />
      ) : (
        <section>
          <h2 className="mb-3 font-display text-base font-semibold text-ink">
            {tab === "pending" ? "Decisões pendentes" : "Histórico"}
          </h2>
          <ul className="space-y-3">
            {list.map((d) => (
              <DecisionCard
                key={d.id}
                item={d}
                onOpen={() => {
                  setDraft({ ...d });
                  setOpen(true);
                }}
              />
            ))}
          </ul>
        </section>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>
              {draft?.status === "pending" ? "Comparar e decidir" : "Decisão"}
            </SheetTitle>
          </SheetHeader>
          {draft ? (
            <>
              <SheetBody className="space-y-4">
                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input
                    value={draft.title}
                    onChange={(e) =>
                      setDraft({ ...draft, title: e.target.value })
                    }
                    placeholder="Ex.: Escolher buffet"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Opções consideradas</Label>
                  <Textarea
                    value={draft.optionsConsidered}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        optionsConsidered: e.target.value,
                      })
                    }
                    placeholder="Separe por · ou linha — ex.: Casa A · Casa B · Casa C"
                  />
                  {parseOptionsPreview(draft.optionsConsidered).length > 0 ? (
                    <ul className="space-y-1 text-sm text-ink-secondary">
                      {parseOptionsPreview(draft.optionsConsidered).map((o) => (
                        <li key={o}>· {o}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label>Escolha</Label>
                  <Input
                    value={draft.chosenOption}
                    onChange={(e) =>
                      setDraft({ ...draft, chosenOption: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Motivo</Label>
                  <Textarea
                    value={draft.rationale}
                    onChange={(e) =>
                      setDraft({ ...draft, rationale: e.target.value })
                    }
                    placeholder="Por que essa opção faz sentido para o casamento?"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Prazo</Label>
                  <Input
                    type="date"
                    value={draft.dueDate ?? ""}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        dueDate: e.target.value || null,
                      })
                    }
                  />
                </div>
              </SheetBody>
              <SheetFooter className="flex-col sm:flex-row">
                <Button
                  className="flex-1"
                  onClick={() => {
                    if (!draft.title.trim()) {
                      toast.error("Informe o título");
                      return;
                    }
                    upsert(draft);
                    toast.success("Salvo");
                    setOpen(false);
                  }}
                >
                  Salvar
                </Button>
                {draft.status === "pending" ? (
                  <Button
                    variant="accent"
                    className="flex-1"
                    onClick={() => {
                      if (!draft.chosenOption.trim()) {
                        toast.error("Informe a escolha");
                        return;
                      }
                      upsert({
                        ...draft,
                        status: "decided",
                        decidedAt: new Date().toISOString(),
                      });
                      toast.success("Decisão registrada");
                      setOpen(false);
                    }}
                  >
                    Marcar como decidida
                  </Button>
                ) : null}
              </SheetFooter>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function parseOptionsPreview(raw: string): string[] {
  if (!raw.trim()) return [];
  return raw
    .split(/[·•|;,/]+|\n+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 6);
}
