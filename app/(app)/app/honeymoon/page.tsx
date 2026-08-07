"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { Money } from "@/components/shared/money";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useWeddingStore } from "@/lib/demo/store";
import type { HoneymoonItem, HoneymoonItemType } from "@/types/domain";

function newId() {
  return `hn_${Math.random().toString(36).slice(2, 10)}`;
}

export default function HoneymoonPage() {
  const workspace = useWeddingStore((s) => s.workspace)!;
  const upsert = useWeddingStore((s) => s.upsertHoneymoonItem);
  const honeyTasks = workspace.tasks.filter((t) => t.phase === "honeymoon");
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<HoneymoonItem | null>(null);

  function openNew() {
    setDraft({
      id: newId(),
      type: "hotel",
      title: "",
      description: "",
      provider: "",
      confirmationCode: "",
      costAmount: null,
      status: "planned",
    });
    setOpen(true);
  }

  return (
    <div>
      <PageHeader
        title="Lua de mel"
        description="Reservas, documentos e custos ligados ao orçamento."
        actions={<Button onClick={openNew}>Nova reserva</Button>}
      />

      <h2 className="mb-3 font-display text-lg font-semibold">Reservas</h2>
      <ul className="mb-10 space-y-2">
        {workspace.honeymoonItems.length === 0 ? (
          <p className="text-sm text-ink-tertiary">Nenhuma reserva ainda.</p>
        ) : (
          workspace.honeymoonItems.map((h) => (
            <li key={h.id}>
              <button
                type="button"
                className="flex w-full items-center justify-between rounded-lg border border-border bg-canvas-elevated px-4 py-3 text-left"
                onClick={() => {
                  setDraft({ ...h });
                  setOpen(true);
                }}
              >
                <div>
                  <p className="font-medium">{h.title}</p>
                  <p className="text-sm text-ink-tertiary">
                    {h.type} · {h.provider || "—"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {h.costAmount != null ? <Money cents={h.costAmount} /> : null}
                  <Badge>{h.status}</Badge>
                </div>
              </button>
            </li>
          ))
        )}
      </ul>

      <h2 className="mb-3 font-display text-lg font-semibold">Checklist</h2>
      <ul className="space-y-2">
        {honeyTasks.map((t) => (
          <li
            key={t.id}
            className="rounded-lg border border-border bg-canvas-elevated px-4 py-3 text-sm"
          >
            {t.title} · {t.status}
          </li>
        ))}
      </ul>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Item da lua de mel</SheetTitle>
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
                  <Label>Tipo</Label>
                  <Select
                    value={draft.type}
                    onValueChange={(v) =>
                      setDraft({ ...draft, type: v as HoneymoonItemType })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(
                        [
                          "flight",
                          "hotel",
                          "insurance",
                          "itinerary",
                          "document",
                          "other",
                        ] as HoneymoonItemType[]
                      ).map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Provedor</Label>
                  <Input
                    value={draft.provider}
                    onChange={(e) =>
                      setDraft({ ...draft, provider: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Custo (R$)</Label>
                  <Input
                    type="number"
                    value={(draft.costAmount ?? 0) / 100}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        costAmount: Math.round(Number(e.target.value) * 100),
                      })
                    }
                  />
                </div>
              </SheetBody>
              <SheetFooter>
                <Button
                  className="flex-1"
                  onClick={() => {
                    if (!draft.title.trim()) return toast.error("Informe o título");
                    upsert(draft);
                    toast.success("Salvo");
                    setOpen(false);
                  }}
                >
                  Salvar
                </Button>
              </SheetFooter>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
