"use client";

import { useState } from "react";
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
import { Scale } from "lucide-react";

function newId() {
  return `dec_${Math.random().toString(36).slice(2, 10)}`;
}

export default function DecisionsPage() {
  const workspace = useWeddingStore((s) => s.workspace)!;
  const upsert = useWeddingStore((s) => s.upsertDecision);
  const [tab, setTab] = useState<"pending" | "decided">("pending");
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Decision | null>(null);

  const list = workspace.decisions.filter((d) =>
    tab === "pending" ? d.status === "pending" : d.status !== "pending",
  );

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
        description={`${workspace.decisions.filter((d) => d.status === "pending").length} pendentes · registre o motivo das escolhas`}
        actions={<Button onClick={openNew}>Nova</Button>}
      />

      <div className="mb-4 flex gap-2">
        <Button
          size="sm"
          variant={tab === "pending" ? "primary" : "secondary"}
          onClick={() => setTab("pending")}
        >
          Pendentes
        </Button>
        <Button
          size="sm"
          variant={tab === "decided" ? "primary" : "secondary"}
          onClick={() => setTab("decided")}
        >
          Decididas
        </Button>
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon={Scale}
          title="Escolhas importantes merecem registro"
          description="Buffet, vestido, paleta — deixe o motivo documentado."
          actionLabel="Nova decisão"
          onAction={openNew}
        />
      ) : (
        <ul className="space-y-3">
          {list.map((d) => (
            <li key={d.id}>
              <button
                type="button"
                className="flex w-full items-start justify-between gap-3 rounded-lg border border-border bg-canvas-elevated p-4 text-left hover:bg-canvas-muted/40"
                onClick={() => {
                  setDraft({ ...d });
                  setOpen(true);
                }}
              >
                <div>
                  <p className="font-medium">{d.title}</p>
                  {d.chosenOption ? (
                    <p className="mt-1 text-sm text-ink-secondary">
                      Escolhido: {d.chosenOption}
                    </p>
                  ) : null}
                  {d.dueDate ? (
                    <p className="mt-1 text-xs text-ink-tertiary">
                      Prazo {d.dueDate}
                    </p>
                  ) : null}
                </div>
                <StatusBadge
                  status={d.status === "pending" ? "pending" : "decided"}
                />
              </button>
            </li>
          ))}
        </ul>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Decisão</SheetTitle>
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
                  />
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
