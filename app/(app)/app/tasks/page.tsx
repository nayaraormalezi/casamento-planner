"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ExternalLink, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { StatusBadge } from "@/components/shared/status-badge";
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
import { composeDashboard, currentPhase } from "@/modules/budget/calculations";
import { estimateTaskSpend } from "@/modules/tasks/estimates";
import { moduleForTask, PHASE_LABEL } from "@/modules/tasks/module-links";
import type {
  PaymentPlan,
  PaymentStatus,
  Priority,
  Task,
  TaskBudgetInstallment,
  TaskBudgetOption,
  TaskPhase,
  TaskStatus,
} from "@/types/domain";
import { cn, formatMoneyBRL } from "@/utils/cn";

const phases: TaskPhase[] = [
  "m18",
  "m12",
  "m9",
  "m6",
  "m3",
  "m1",
  "d15",
  "d7",
  "d3",
  "day_of",
  "post",
  "honeymoon",
];

const TASK_STATUSES: { value: TaskStatus; label: string }[] = [
  { value: "todo", label: "A fazer" },
  { value: "doing", label: "Em andamento" },
  { value: "done", label: "Concluído" },
];

function newId() {
  return crypto.randomUUID();
}

function emptyOption(taskId: string): TaskBudgetOption {
  return {
    id: newId(),
    taskId,
    title: "",
    vendorId: null,
    vendorName: "",
    amount: 0,
    notes: "",
    isSelected: false,
    paymentPlan: "lump_sum",
    paymentStatus: "unpaid",
    paidAmount: 0,
    nextPaymentDate: null,
    installmentCount: 2,
    installments: [],
  };
}

function buildInstallments(
  count: number,
  totalCents: number,
  firstDue: string | null,
): TaskBudgetInstallment[] {
  const n = Math.max(1, count);
  const base = Math.floor(totalCents / n);
  const remainder = totalCents - base * n;
  return Array.from({ length: n }, (_, i) => {
    let dueDate: string | null = null;
    if (firstDue) {
      const d = new Date(firstDue + "T12:00:00");
      d.setMonth(d.getMonth() + i);
      dueDate = d.toISOString().slice(0, 10);
    }
    return {
      id: newId(),
      sequence: i + 1,
      amount: base + (i === 0 ? remainder : 0),
      dueDate,
      paidAt: null,
      paymentMethod: null,
      notes: "",
    };
  });
}

export default function TasksPage() {
  const workspace = useWeddingStore((s) => s.workspace)!;
  const upsert = useWeddingStore((s) => s.upsertTask);
  const remove = useWeddingStore((s) => s.removeTask);
  const dash = composeDashboard(workspace);
  const [filter, setFilter] = useState<"all" | "phase" | "overdue" | "done">(
    "phase",
  );
  const [phase, setPhase] = useState<TaskPhase>(dash.phase);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Task | null>(null);

  const today = new Date().toISOString().slice(0, 10);

  const tasks = useMemo(() => {
    let list = [...workspace.tasks];
    if (filter === "phase") list = list.filter((t) => t.phase === phase);
    if (filter === "overdue")
      list = list.filter(
        (t) =>
          t.status !== "done" && t.dueDate != null && t.dueDate < today,
      );
    if (filter === "done") list = list.filter((t) => t.status === "done");
    return list.sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? ""));
  }, [workspace.tasks, filter, phase, today]);

  function openNew() {
    setDraft({
      id: newId(),
      title: "",
      description: "",
      phase: currentPhase(dash.daysRemaining),
      categorySlug: null,
      priority: 3,
      dueDate: null,
      startDate: null,
      status: "todo",
      isMilestone: false,
      assignee: null,
      vendorId: null,
      budgetItemId: null,
      templateKey: null,
      budgetOptions: [],
    });
    setOpen(true);
  }

  function toggleDone(task: Task) {
    upsert({
      ...task,
      status: task.status === "done" ? "todo" : "done",
    });
  }

  function updateOption(
    optionId: string,
    patch: Partial<TaskBudgetOption>,
  ) {
    if (!draft) return;
    setDraft({
      ...draft,
      budgetOptions: draft.budgetOptions.map((o) =>
        o.id === optionId ? { ...o, ...patch } : o,
      ),
    });
  }

  function selectOption(optionId: string) {
    if (!draft) return;
    const selected = draft.budgetOptions.find((o) => o.id === optionId);
    setDraft({
      ...draft,
      vendorId: selected?.vendorId ?? draft.vendorId,
      budgetOptions: draft.budgetOptions.map((o) => ({
        ...o,
        isSelected: o.id === optionId,
      })),
    });
  }

  const selectedOption = draft?.budgetOptions.find((o) => o.isSelected);

  return (
    <div>
      <PageHeader
        title="Tarefas"
        description={`Fase atual: ${PHASE_LABEL[dash.phase]} · ${dash.tasks.total - dash.tasks.done} abertas · ${dash.tasks.overdue} atrasadas`}
        actions={<Button onClick={openNew}>Nova</Button>}
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {(
          [
            ["phase", "Fase atual"],
            ["overdue", "Atrasadas"],
            ["all", "Todas"],
            ["done", "Concluídas"],
          ] as const
        ).map(([key, label]) => (
          <Button
            key={key}
            size="sm"
            variant={filter === key ? "primary" : "secondary"}
            onClick={() => {
              setFilter(key);
              if (key === "phase") setPhase(dash.phase);
            }}
          >
            {label}
          </Button>
        ))}
      </div>

      <div className="mb-6 flex gap-1 overflow-x-auto pb-1">
        {phases.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => {
              setPhase(p);
              setFilter("phase");
            }}
            className={cn(
              "shrink-0 rounded-md px-2.5 py-1.5 text-xs font-medium",
              phase === p && filter === "phase"
                ? "bg-ink text-ink-inverse"
                : "bg-canvas-muted text-ink-secondary hover:text-ink",
            )}
          >
            {PHASE_LABEL[p].split(" ")[0]}
          </button>
        ))}
      </div>

      <ul className="space-y-2">
        {tasks.map((task) => {
          const overdue =
            task.status !== "done" &&
            task.dueDate != null &&
            task.dueDate < today;
          const estimate = estimateTaskSpend(task, workspace);
          const mod = moduleForTask(task);
          const chosen = task.budgetOptions.find((o) => o.isSelected);

          return (
            <li
              key={task.id}
              className="rounded-lg border border-border bg-canvas-elevated px-4 py-3"
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 accent-[var(--wp-accent)]"
                  checked={task.status === "done"}
                  onChange={() => toggleDone(task)}
                />
                <button
                  type="button"
                  className="min-w-0 flex-1 text-left"
                  onClick={() => {
                    setDraft({
                      ...task,
                      budgetOptions: task.budgetOptions ?? [],
                    });
                    setOpen(true);
                  }}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p
                      className={cn(
                        "text-sm font-medium",
                        task.status === "done" &&
                          "text-ink-tertiary line-through",
                      )}
                    >
                      {task.title}
                    </p>
                    <PriorityBadge priority={task.priority} />
                    <StatusBadge status={task.status} />
                    {chosen ? (
                      <StatusBadge status={chosen.paymentStatus} />
                    ) : null}
                  </div>
                  <p className="mt-0.5 text-xs text-ink-tertiary">
                    {task.dueDate ?? "Sem prazo"}
                    {overdue ? " · atrasada" : ""}
                    {" · "}
                    {mod.label}
                    {task.budgetOptions.length
                      ? ` · ${task.budgetOptions.length} orçamento(s)`
                      : ""}
                  </p>
                  {chosen ? (
                    <p className="mt-1 text-xs tabular-nums text-ink-secondary">
                      Definido: {chosen.title || "Orçamento"} ·{" "}
                      {formatMoneyBRL(chosen.amount)}
                      {chosen.paymentPlan === "installments"
                        ? " · parcelado"
                        : " · à vista"}
                      {" · pago "}
                      {formatMoneyBRL(chosen.paidAmount)}
                    </p>
                  ) : estimate.estimatedCents > 0 ? (
                    <p className="mt-1 text-xs tabular-nums text-ink-secondary">
                      Estimativa {formatMoneyBRL(estimate.estimatedCents)}
                    </p>
                  ) : null}
                </button>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={mod.href} aria-label={mod.actionLabel}>
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </li>
          );
        })}
      </ul>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Tarefa</SheetTitle>
          </SheetHeader>
          {draft ? (
            <>
              <SheetBody className="space-y-5">
                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input
                    value={draft.title}
                    onChange={(e) =>
                      setDraft({ ...draft, title: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={draft.status}
                      onValueChange={(v) =>
                        setDraft({ ...draft, status: v as TaskStatus })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TASK_STATUSES.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Fase</Label>
                    <Select
                      value={draft.phase}
                      onValueChange={(v) =>
                        setDraft({ ...draft, phase: v as TaskPhase })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {phases.map((p) => (
                          <SelectItem key={p} value={p}>
                            {PHASE_LABEL[p]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                </div>

                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select
                    value={draft.categorySlug ?? "__none"}
                    onValueChange={(v) =>
                      setDraft({
                        ...draft,
                        categorySlug: v === "__none" ? null : v,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sem categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none">Sem categoria</SelectItem>
                      {workspace.categories.map((c) => (
                        <SelectItem key={c.slug} value={c.slug}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3 border-t border-border pt-4">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">Opções de orçamento</p>
                      <p className="text-xs text-ink-tertiary">
                        Cadastre cotas e escolha a definida.
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        setDraft({
                          ...draft,
                          budgetOptions: [
                            ...draft.budgetOptions,
                            emptyOption(draft.id),
                          ],
                        })
                      }
                    >
                      <Plus className="mr-1 h-3.5 w-3.5" />
                      Opção
                    </Button>
                  </div>

                  {draft.budgetOptions.length > 0 ? (
                    <div className="space-y-2">
                      <Label>Orçamento definido</Label>
                      <Select
                        value={selectedOption?.id ?? "__none"}
                        onValueChange={(v) => {
                          if (v === "__none") {
                            setDraft({
                              ...draft,
                              budgetOptions: draft.budgetOptions.map((o) => ({
                                ...o,
                                isSelected: false,
                              })),
                            });
                            return;
                          }
                          selectOption(v);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a opção definida" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none">Nenhum definido</SelectItem>
                          {draft.budgetOptions.map((o) => (
                            <SelectItem key={o.id} value={o.id}>
                              {(o.title || "Sem título") +
                                ` · ${formatMoneyBRL(o.amount)}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : null}

                  <div className="space-y-3">
                    {draft.budgetOptions.map((option, idx) => (
                      <div
                        key={option.id}
                        className={cn(
                          "space-y-3 rounded-lg border p-3",
                          option.isSelected
                            ? "border-accent bg-accent/5"
                            : "border-border",
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-medium uppercase tracking-wide text-ink-tertiary">
                            Opção {idx + 1}
                            {option.isSelected ? " · definida" : ""}
                          </p>
                          <Button
                            type="button"
                            size="icon-sm"
                            variant="ghost"
                            onClick={() =>
                              setDraft({
                                ...draft,
                                budgetOptions: draft.budgetOptions.filter(
                                  (o) => o.id !== option.id,
                                ),
                              })
                            }
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <Label>Nome da opção</Label>
                          <Input
                            value={option.title}
                            placeholder="Ex: Buffet Casa Aurora"
                            onChange={(e) =>
                              updateOption(option.id, {
                                title: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label>Valor (R$)</Label>
                            <Input
                              type="number"
                              value={option.amount / 100}
                              onChange={(e) =>
                                updateOption(option.id, {
                                  amount: Math.round(
                                    Number(e.target.value || 0) * 100,
                                  ),
                                })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Empresa / fornecedor</Label>
                            <Input
                              value={option.vendorName}
                              placeholder="Nome da empresa"
                              onChange={(e) =>
                                updateOption(option.id, {
                                  vendorName: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Vincular fornecedor cadastrado</Label>
                          <Select
                            value={option.vendorId ?? "__none"}
                            onValueChange={(v) => {
                              const vendor =
                                v === "__none"
                                  ? null
                                  : workspace.vendors.find((x) => x.id === v);
                              updateOption(option.id, {
                                vendorId: v === "__none" ? null : v,
                                vendorName: vendor?.name ?? option.vendorName,
                              });
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Opcional" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__none">Nenhum</SelectItem>
                              {workspace.vendors.map((v) => (
                                <SelectItem key={v.id} value={v.id}>
                                  {v.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {option.isSelected ? (
                          <div className="space-y-3 rounded-md bg-canvas-muted/60 p-3">
                            <p className="text-xs font-medium text-ink">
                              Pagamento (opção definida)
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-2">
                                <Label>Forma</Label>
                                <Select
                                  value={option.paymentPlan}
                                  onValueChange={(v) => {
                                    const plan = v as PaymentPlan;
                                    if (plan === "installments") {
                                      const count =
                                        option.installmentCount ?? 2;
                                      updateOption(option.id, {
                                        paymentPlan: plan,
                                        installments: buildInstallments(
                                          count,
                                          option.amount,
                                          option.nextPaymentDate ?? today,
                                        ),
                                      });
                                    } else {
                                      updateOption(option.id, {
                                        paymentPlan: plan,
                                        installments: [],
                                      });
                                    }
                                  }}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="lump_sum">
                                      À vista
                                    </SelectItem>
                                    <SelectItem value="installments">
                                      Parcelado
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>Status pagamento</Label>
                                <Select
                                  value={option.paymentStatus}
                                  onValueChange={(v) =>
                                    updateOption(option.id, {
                                      paymentStatus: v as PaymentStatus,
                                    })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="unpaid">
                                      Não pago
                                    </SelectItem>
                                    <SelectItem value="partial">
                                      Parcialmente pago
                                    </SelectItem>
                                    <SelectItem value="paid">Pago</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-2">
                                <Label>Já pago (R$)</Label>
                                <Input
                                  type="number"
                                  value={option.paidAmount / 100}
                                  onChange={(e) =>
                                    updateOption(option.id, {
                                      paidAmount: Math.round(
                                        Number(e.target.value || 0) * 100,
                                      ),
                                    })
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Próximo pagamento</Label>
                                <Input
                                  type="date"
                                  value={option.nextPaymentDate ?? ""}
                                  onChange={(e) =>
                                    updateOption(option.id, {
                                      nextPaymentDate:
                                        e.target.value || null,
                                    })
                                  }
                                />
                              </div>
                            </div>

                            {option.paymentPlan === "installments" ? (
                              <div className="space-y-2">
                                <div className="flex items-end gap-2">
                                  <div className="flex-1 space-y-2">
                                    <Label>Nº de parcelas</Label>
                                    <Input
                                      type="number"
                                      min={2}
                                      max={24}
                                      value={option.installmentCount ?? 2}
                                      onChange={(e) =>
                                        updateOption(option.id, {
                                          installmentCount: Number(
                                            e.target.value || 2,
                                          ),
                                        })
                                      }
                                    />
                                  </div>
                                  <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() =>
                                      updateOption(option.id, {
                                        installments: buildInstallments(
                                          option.installmentCount ?? 2,
                                          option.amount,
                                          option.nextPaymentDate ?? today,
                                        ),
                                      })
                                    }
                                  >
                                    Gerar parcelas
                                  </Button>
                                </div>
                                <ul className="space-y-2">
                                  {option.installments.map((inst) => (
                                    <li
                                      key={inst.id}
                                      className="grid grid-cols-[auto_1fr_1fr_auto] items-center gap-2 text-xs"
                                    >
                                      <span className="font-medium">
                                        #{inst.sequence}
                                      </span>
                                      <Input
                                        type="number"
                                        className="h-8"
                                        value={inst.amount / 100}
                                        onChange={(e) =>
                                          updateOption(option.id, {
                                            installments:
                                              option.installments.map((i) =>
                                                i.id === inst.id
                                                  ? {
                                                      ...i,
                                                      amount: Math.round(
                                                        Number(
                                                          e.target.value || 0,
                                                        ) * 100,
                                                      ),
                                                    }
                                                  : i,
                                              ),
                                          })
                                        }
                                      />
                                      <Input
                                        type="date"
                                        className="h-8"
                                        value={inst.dueDate ?? ""}
                                        onChange={(e) =>
                                          updateOption(option.id, {
                                            installments:
                                              option.installments.map((i) =>
                                                i.id === inst.id
                                                  ? {
                                                      ...i,
                                                      dueDate:
                                                        e.target.value || null,
                                                    }
                                                  : i,
                                              ),
                                          })
                                        }
                                      />
                                      <label className="flex items-center gap-1">
                                        <input
                                          type="checkbox"
                                          checked={!!inst.paidAt}
                                          onChange={(e) => {
                                            const nextInst =
                                              option.installments.map((i) =>
                                                i.id === inst.id
                                                  ? {
                                                      ...i,
                                                      paidAt: e.target.checked
                                                        ? new Date().toISOString()
                                                        : null,
                                                    }
                                                  : i,
                                              );
                                            const paidAmount = nextInst
                                              .filter((i) => i.paidAt)
                                              .reduce(
                                                (acc, i) => acc + i.amount,
                                                0,
                                              );
                                            updateOption(option.id, {
                                              installments: nextInst,
                                              paidAmount,
                                              paymentStatus:
                                                paidAmount <= 0
                                                  ? "unpaid"
                                                  : paidAmount >= option.amount
                                                    ? "paid"
                                                    : "partial",
                                            });
                                          }}
                                        />
                                        Pago
                                      </label>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ) : null}
                          </div>
                        ) : (
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => selectOption(option.id)}
                          >
                            Definir este orçamento
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </SheetBody>
              <SheetFooter>
                <Button
                  className="flex-1"
                  onClick={async () => {
                    if (!draft.title.trim()) {
                      toast.error("Informe o título");
                      return;
                    }
                    for (const o of draft.budgetOptions) {
                      if (!o.title.trim()) {
                        toast.error("Nomeie todas as opções de orçamento");
                        return;
                      }
                    }
                    try {
                      await upsert({
                        ...draft,
                        vendorId: draft.vendorId || null,
                        budgetItemId: draft.budgetItemId || null,
                        budgetOptions: draft.budgetOptions.map((o) => ({
                          ...o,
                          vendorId: o.vendorId || null,
                        })),
                      });
                      toast.success("Tarefa salva");
                      setOpen(false);
                    } catch (err) {
                      toast.error(
                        err instanceof Error
                          ? err.message
                          : "Não foi possível salvar a tarefa",
                      );
                    }
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
