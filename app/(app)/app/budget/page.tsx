"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { Money } from "@/components/shared/money";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { EmotionalReturn } from "@/components/shared/emotional-return";
import { StatusBadge } from "@/components/shared/status-badge";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWeddingStore } from "@/lib/demo/store";
import {
  composeDashboard,
  sumCommitted,
  sumPaid,
  sumPlanned,
} from "@/modules/budget/calculations";
import type { BudgetItem, BudgetItemStatus, Flexibility, Priority } from "@/types/domain";
import { Wallet } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatMoneyBRL } from "@/utils/cn";

function newId() {
  return `bi_${Math.random().toString(36).slice(2, 10)}`;
}

const emptyItem = (categoryId: string): BudgetItem => ({
  id: newId(),
  categoryId,
  description: "",
  plannedAmount: 0,
  contractedAmount: null,
  paidAmount: 0,
  nextPaymentDate: null,
  vendorId: null,
  notes: "",
  status: "planned",
  priority: 3,
  flexibility: "can_reduce",
  emotionalReturn: 3,
});

export default function BudgetPage() {
  const workspace = useWeddingStore((s) => s.workspace)!;
  const upsert = useWeddingStore((s) => s.upsertBudgetItem);
  const remove = useWeddingStore((s) => s.removeBudgetItem);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<BudgetItem | null>(null);

  const dash = composeDashboard(workspace);
  const catName = (id: string) =>
    workspace.categories.find((c) => c.id === id)?.name ?? "—";

  const chartData = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of workspace.budgetItems) {
      if (item.status === "cancelled") continue;
      const name =
        workspace.categories.find((c) => c.id === item.categoryId)?.name ?? "—";
      map.set(name, (map.get(name) ?? 0) + item.plannedAmount / 100);
    }
    return [...map.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [workspace.budgetItems, workspace.categories]);

  function openNew() {
    const firstCat = workspace.categories[0]?.id;
    if (!firstCat) return;
    setDraft(emptyItem(firstCat));
    setOpen(true);
  }

  function openEdit(item: BudgetItem) {
    setDraft({ ...item });
    setOpen(true);
  }

  function save() {
    if (!draft || !draft.description.trim()) {
      toast.error("Informe a descrição");
      return;
    }
    upsert(draft);
    toast.success(
      `Salvo · Comprometido ${formatMoneyBRL(sumCommitted([...workspace.budgetItems.filter((i) => i.id !== draft.id), draft]))}`,
    );
    setOpen(false);
  }

  return (
    <div>
      <PageHeader
        title="Orçamento"
        description={`Comprometido ${formatMoneyBRL(dash.committed)} de ${formatMoneyBRL(dash.totalBudget)} · ${dash.freeBudget >= 0 ? "livre" : "estouro"} ${formatMoneyBRL(Math.abs(dash.freeBudget))}`}
        actions={<Button onClick={openNew}>Novo item</Button>}
      />

      <Tabs defaultValue="table">
        <TabsList>
          <TabsTrigger value="table">Tabela</TabsTrigger>
          <TabsTrigger value="charts">Gráficos</TabsTrigger>
        </TabsList>

        <TabsContent value="table">
          {workspace.budgetItems.length === 0 ? (
            <EmptyState
              icon={Wallet}
              title="Seu dinheiro precisa de um mapa"
              description="Comece pelo local e pelo buffet — costumam ser 50%+ do orçamento."
              actionLabel="Adicionar primeiro item"
              onAction={openNew}
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-right">Previsto</TableHead>
                    <TableHead className="text-right">Pago</TableHead>
                    <TableHead>Pri</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workspace.budgetItems.map((item) => (
                    <TableRow
                      key={item.id}
                      className="cursor-pointer"
                      onClick={() => openEdit(item)}
                    >
                      <TableCell>{catName(item.categoryId)}</TableCell>
                      <TableCell className="font-medium text-ink">
                        {item.description}
                      </TableCell>
                      <TableCell>
                        <Money cents={item.plannedAmount} align="right" />
                      </TableCell>
                      <TableCell>
                        <Money cents={item.paidAmount} align="right" />
                      </TableCell>
                      <TableCell>
                        <PriorityBadge priority={item.priority} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={item.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4 flex flex-wrap gap-6 rounded-lg border border-border bg-canvas-elevated px-4 py-3 text-sm">
                <span>
                  Σ Previsto{" "}
                  <strong className="tabular-nums">
                    {formatMoneyBRL(sumPlanned(workspace.budgetItems))}
                  </strong>
                </span>
                <span>
                  Σ Pago{" "}
                  <strong className="tabular-nums">
                    {formatMoneyBRL(sumPaid(workspace.budgetItems))}
                  </strong>
                </span>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="charts">
          <div className="h-80 rounded-lg border border-border bg-canvas-elevated p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid stroke="var(--wp-chart-grid)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(v) =>
                    formatMoneyBRL(Math.round(Number(v) * 100))
                  }
                />
                <Bar dataKey="value" fill="var(--wp-chart-2)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
      </Tabs>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>
              {draft && workspace.budgetItems.some((i) => i.id === draft.id)
                ? "Editar item"
                : "Novo item"}
            </SheetTitle>
          </SheetHeader>
          {draft ? (
            <>
              <SheetBody className="space-y-4">
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Input
                    value={draft.description}
                    onChange={(e) =>
                      setDraft({ ...draft, description: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select
                    value={draft.categoryId}
                    onValueChange={(v) => setDraft({ ...draft, categoryId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {workspace.categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label>Previsto (R$)</Label>
                    <Input
                      type="number"
                      value={draft.plannedAmount / 100}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          plannedAmount: Math.round(Number(e.target.value) * 100),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Contratado</Label>
                    <Input
                      type="number"
                      value={(draft.contractedAmount ?? 0) / 100}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          contractedAmount: Math.round(
                            Number(e.target.value) * 100,
                          ),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Pago</Label>
                    <Input
                      type="number"
                      value={draft.paidAmount / 100}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          paidAmount: Math.round(Number(e.target.value) * 100),
                        })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Prioridade</Label>
                    <Select
                      value={String(draft.priority)}
                      onValueChange={(v) =>
                        setDraft({
                          ...draft,
                          priority: Number(v) as Priority,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[5, 4, 3, 2, 1].map((p) => (
                          <SelectItem key={p} value={String(p)}>
                            P{p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Flexibilidade</Label>
                    <Select
                      value={draft.flexibility}
                      onValueChange={(v) =>
                        setDraft({
                          ...draft,
                          flexibility: v as Flexibility,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cannot_cut">Não cortar</SelectItem>
                        <SelectItem value="can_reduce">Reduzir</SelectItem>
                        <SelectItem value="can_remove">Pode remover</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={draft.status}
                    onValueChange={(v) =>
                      setDraft({ ...draft, status: v as BudgetItemStatus })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(
                        [
                          "planned",
                          "quoted",
                          "contracted",
                          "partially_paid",
                          "paid",
                          "cancelled",
                        ] as BudgetItemStatus[]
                      ).map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Próximo pagamento</Label>
                  <Input
                    type="date"
                    value={draft.nextPaymentDate ?? ""}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        nextPaymentDate: e.target.value || null,
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Retorno emocional</Label>
                  <EmotionalReturn value={draft.emotionalReturn} />
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Button
                      key={n}
                      type="button"
                      size="sm"
                      variant={
                        draft.emotionalReturn === n ? "accent" : "secondary"
                      }
                      onClick={() =>
                        setDraft({
                          ...draft,
                          emotionalReturn: n as Priority,
                        })
                      }
                    >
                      {n}
                    </Button>
                  ))}
                </div>
              </SheetBody>
              <SheetFooter>
                <Button className="flex-1" onClick={save}>
                  Salvar
                </Button>
                {workspace.budgetItems.some((i) => i.id === draft.id) ? (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      remove(draft.id);
                      toast.message("Item removido");
                      setOpen(false);
                    }}
                  >
                    Excluir
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
