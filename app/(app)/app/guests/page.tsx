"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { useWeddingStore } from "@/lib/demo/store";
import type { Guest, RsvpStatus } from "@/types/domain";
import { Users } from "lucide-react";

function newId() {
  return `gst_${Math.random().toString(36).slice(2, 10)}`;
}

export default function GuestsPage() {
  const workspace = useWeddingStore((s) => s.workspace)!;
  const upsert = useWeddingStore((s) => s.upsertGuest);
  const remove = useWeddingStore((s) => s.removeGuest);
  const [rsvpFilter, setRsvpFilter] = useState<RsvpStatus | "all">("all");
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Guest | null>(null);

  const guests = useMemo(() => {
    if (rsvpFilter === "all") return workspace.guests;
    return workspace.guests.filter((g) => g.rsvp === rsvpFilter);
  }, [workspace.guests, rsvpFilter]);

  const heads = workspace.guests.reduce((a, g) => a + g.partySize, 0);
  const confirmed = workspace.guests
    .filter((g) => g.rsvp === "yes")
    .reduce((a, g) => a + g.partySize, 0);
  const pending = workspace.guests.filter((g) => g.rsvp === "pending").length;

  function openNew() {
    setDraft({
      id: newId(),
      name: "",
      household: "",
      groupName: "",
      tableLabel: "",
      rsvp: "pending",
      side: "both",
      partySize: 1,
      dietaryTags: [],
      notes: "",
    });
    setOpen(true);
  }

  return (
    <div>
      <PageHeader
        title="Convidados"
        description={`${heads} pessoas · ${confirmed} confirmados · ${pending} RSVPs pendentes`}
        actions={<Button onClick={openNew}>Adicionar</Button>}
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {(["all", "pending", "yes", "no", "maybe"] as const).map((f) => (
          <Button
            key={f}
            size="sm"
            variant={rsvpFilter === f ? "primary" : "secondary"}
            onClick={() => setRsvpFilter(f)}
          >
            {f === "all" ? "Todos" : f}
          </Button>
        ))}
      </div>

      {workspace.guests.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Quem vai celebrar com vocês?"
          description="Monte a lista e acompanhe RSVPs e restrições."
          actionLabel="Adicionar convidado"
          onAction={openNew}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Grupo</TableHead>
              <TableHead>Mesa</TableHead>
              <TableHead>RSVP</TableHead>
              <TableHead>Qtd</TableHead>
              <TableHead>Restrições</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {guests.map((g) => (
              <TableRow
                key={g.id}
                className="cursor-pointer"
                onClick={() => {
                  setDraft({ ...g });
                  setOpen(true);
                }}
              >
                <TableCell className="font-medium text-ink">{g.name}</TableCell>
                <TableCell>{g.groupName || "—"}</TableCell>
                <TableCell>{g.tableLabel || "—"}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      g.rsvp === "yes"
                        ? "success"
                        : g.rsvp === "pending"
                          ? "warning"
                          : "neutral"
                    }
                  >
                    {g.rsvp}
                  </Badge>
                </TableCell>
                <TableCell>{g.partySize}</TableCell>
                <TableCell className="text-ink-tertiary">
                  {g.dietaryTags.join(", ") || "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Convidado</SheetTitle>
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
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Grupo</Label>
                    <Input
                      value={draft.groupName}
                      onChange={(e) =>
                        setDraft({ ...draft, groupName: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Mesa</Label>
                    <Input
                      value={draft.tableLabel}
                      onChange={(e) =>
                        setDraft({ ...draft, tableLabel: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>RSVP</Label>
                    <Select
                      value={draft.rsvp}
                      onValueChange={(v) =>
                        setDraft({ ...draft, rsvp: v as RsvpStatus })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(["pending", "yes", "no", "maybe"] as const).map(
                          (s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Quantidade</Label>
                    <Input
                      type="number"
                      min={1}
                      value={draft.partySize}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          partySize: Math.max(1, Number(e.target.value) || 1),
                        })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Restrições (vírgula)</Label>
                  <Input
                    value={draft.dietaryTags.join(", ")}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        dietaryTags: e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                  />
                </div>
              </SheetBody>
              <SheetFooter>
                <Button
                  className="flex-1"
                  onClick={() => {
                    if (!draft.name.trim()) {
                      toast.error("Informe o nome");
                      return;
                    }
                    upsert(draft);
                    toast.success("Convidado salvo");
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
