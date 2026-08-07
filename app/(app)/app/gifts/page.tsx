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
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { EmptyState } from "@/components/shared/empty-state";
import { useWeddingStore } from "@/lib/demo/store";
import type { Gift, GiftStatus } from "@/types/domain";
import { Gift as GiftIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function newId() {
  return `gift_${Math.random().toString(36).slice(2, 10)}`;
}

export default function GiftsPage() {
  const workspace = useWeddingStore((s) => s.workspace)!;
  const upsert = useWeddingStore((s) => s.upsertGift);
  const remove = useWeddingStore((s) => s.removeGift);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Gift | null>(null);

  function openNew() {
    setDraft({
      id: newId(),
      name: "",
      description: "",
      url: "",
      price: null,
      purchasedBy: "",
      status: "available",
      thankYouSent: false,
    });
    setOpen(true);
  }

  return (
    <div>
      <PageHeader
        title="Presentes"
        description="Lista, quem comprou e agradecimentos."
        actions={<Button onClick={openNew}>Adicionar</Button>}
      />
      {workspace.gifts.length === 0 ? (
        <EmptyState
          icon={GiftIcon}
          title="Monte a lista com calma"
          description="Registre itens, status e agradecimentos."
          actionLabel="Adicionar presente"
          onAction={openNew}
        />
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border bg-canvas-elevated">
          {workspace.gifts.map((g) => (
            <li key={g.id}>
              <button
                type="button"
                className="flex w-full items-center justify-between px-4 py-4 text-left hover:bg-canvas-muted/40"
                onClick={() => {
                  setDraft({ ...g });
                  setOpen(true);
                }}
              >
                <div>
                  <p className="font-medium">{g.name}</p>
                  <p className="text-sm text-ink-tertiary">
                    {g.purchasedBy || "Disponível"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {g.price != null ? <Money cents={g.price} /> : null}
                  <Badge>{g.status}</Badge>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Presente</SheetTitle>
          </SheetHeader>
          {draft ? (
            <>
              <SheetBody className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input
                    value={draft.name}
                    onChange={(e) =>
                      setDraft({ ...draft, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Valor (R$)</Label>
                  <Input
                    type="number"
                    value={(draft.price ?? 0) / 100}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        price: Math.round(Number(e.target.value) * 100),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={draft.status}
                    onValueChange={(v) =>
                      setDraft({ ...draft, status: v as GiftStatus })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(
                        [
                          "available",
                          "reserved",
                          "purchased",
                          "delivered",
                        ] as GiftStatus[]
                      ).map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Quem comprou</Label>
                  <Input
                    value={draft.purchasedBy}
                    onChange={(e) =>
                      setDraft({ ...draft, purchasedBy: e.target.value })
                    }
                  />
                </div>
              </SheetBody>
              <SheetFooter>
                <Button
                  className="flex-1"
                  onClick={() => {
                    if (!draft.name.trim()) return toast.error("Informe o nome");
                    upsert(draft);
                    toast.success("Salvo");
                    setOpen(false);
                  }}
                >
                  Salvar
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    remove(draft.id);
                    setOpen(false);
                  }}
                >
                  Excluir
                </Button>
              </SheetFooter>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
