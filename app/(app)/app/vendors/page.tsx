"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Money } from "@/components/shared/money";
import { EmptyState } from "@/components/shared/empty-state";
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
import type { Vendor, VendorStatus } from "@/types/domain";
import { Truck } from "lucide-react";

function newId() {
  return `ven_${Math.random().toString(36).slice(2, 10)}`;
}

export default function VendorsPage() {
  const workspace = useWeddingStore((s) => s.workspace)!;
  const upsert = useWeddingStore((s) => s.upsertVendor);
  const remove = useWeddingStore((s) => s.removeVendor);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Vendor | null>(null);

  const contracted = workspace.vendors.filter((v) => v.status === "contracted")
    .length;

  function openNew() {
    setDraft({
      id: newId(),
      categorySlug: workspace.categories[0]?.slug ?? "other",
      name: "",
      contactName: "",
      phone: "",
      email: "",
      instagram: "",
      website: "",
      quotedAmount: null,
      contractedAmount: null,
      rating: null,
      notes: "",
      status: "researching",
    });
    setOpen(true);
  }

  return (
    <div>
      <PageHeader
        title="Fornecedores"
        description={`${contracted} contratados · ${workspace.vendors.length} no total`}
        actions={<Button onClick={openNew}>Novo fornecedor</Button>}
      />

      {workspace.vendors.length === 0 ? (
        <EmptyState
          icon={Truck}
          title="Ainda sem contratos"
          description="Contrate o local primeiro — costuma desbloquear o restante do plano."
          actionLabel="Adicionar fornecedor"
          onAction={openNew}
        />
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border bg-canvas-elevated">
          {workspace.vendors.map((v) => (
            <li key={v.id}>
              <button
                type="button"
                className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left hover:bg-canvas-muted/50"
                onClick={() => {
                  setDraft({ ...v });
                  setOpen(true);
                }}
              >
                <div>
                  <p className="font-medium">{v.name}</p>
                  <p className="text-sm text-ink-tertiary">
                    {workspace.categories.find((c) => c.slug === v.categorySlug)
                      ?.name ?? v.categorySlug}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {v.quotedAmount != null ? (
                    <Money cents={v.quotedAmount} className="text-sm" />
                  ) : null}
                  <StatusBadge
                    status={
                      v.status === "contracted"
                        ? "contracted"
                        : v.status === "quoted"
                          ? "quoted"
                          : "planned"
                    }
                  />
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Fornecedor</SheetTitle>
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
                  <Label>Categoria</Label>
                  <Select
                    value={draft.categorySlug}
                    onValueChange={(v) =>
                      setDraft({ ...draft, categorySlug: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {workspace.categories.map((c) => (
                        <SelectItem key={c.slug} value={c.slug}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={draft.status}
                    onValueChange={(v) =>
                      setDraft({ ...draft, status: v as VendorStatus })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(
                        [
                          "researching",
                          "contacted",
                          "quoted",
                          "contracted",
                          "rejected",
                          "cancelled",
                        ] as VendorStatus[]
                      ).map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Cotado (R$)</Label>
                    <Input
                      type="number"
                      value={(draft.quotedAmount ?? 0) / 100}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          quotedAmount: Math.round(Number(e.target.value) * 100),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Contato</Label>
                    <Input
                      value={draft.contactName}
                      onChange={(e) =>
                        setDraft({ ...draft, contactName: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input
                    value={draft.phone}
                    onChange={(e) =>
                      setDraft({ ...draft, phone: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Instagram</Label>
                  <Input
                    value={draft.instagram}
                    onChange={(e) =>
                      setDraft({ ...draft, instagram: e.target.value })
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
                    toast.success("Fornecedor salvo");
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
