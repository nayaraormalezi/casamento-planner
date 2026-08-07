"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
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
import type { Priority, Task, TaskPhase, TaskStatus } from "@/types/domain";
import { cn } from "@/utils/cn";

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

const phaseLabel: Record<TaskPhase, string> = {
  m18: "18m",
  m12: "12m",
  m9: "9m",
  m6: "6m",
  m3: "3m",
  m1: "1m",
  d15: "15d",
  d7: "7d",
  d3: "3d",
  day_of: "Dia",
  post: "Pós",
  honeymoon: "Lua",
};

function newId() {
  return `task_${Math.random().toString(36).slice(2, 10)}`;
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
          t.status !== "done" &&
          t.status !== "cancelled" &&
          t.dueDate != null &&
          t.dueDate < today,
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
    });
    setOpen(true);
  }

  function toggleDone(task: Task) {
    upsert({
      ...task,
      status: task.status === "done" ? "todo" : "done",
    });
  }

  return (
    <div>
      <PageHeader
        title="Tarefas"
        description={`Fase atual: ${phaseLabel[dash.phase]} · ${dash.tasks.total - dash.tasks.done} abertas · ${dash.tasks.overdue} atrasadas`}
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
            {phaseLabel[p]}
          </button>
        ))}
      </div>

      <ul className="space-y-2">
        {tasks.map((task) => {
          const overdue =
            task.status !== "done" &&
            task.dueDate != null &&
            task.dueDate < today;
          return (
            <li
              key={task.id}
              className="flex items-center gap-3 rounded-lg border border-border bg-canvas-elevated px-4 py-3"
            >
              <input
                type="checkbox"
                className="h-4 w-4 accent-[var(--wp-accent)]"
                checked={task.status === "done"}
                onChange={() => toggleDone(task)}
              />
              <button
                type="button"
                className="min-w-0 flex-1 text-left"
                onClick={() => {
                  setDraft({ ...task });
                  setOpen(true);
                }}
              >
                <p
                  className={cn(
                    "text-sm font-medium",
                    task.status === "done" && "text-ink-tertiary line-through",
                  )}
                >
                  {task.title}
                </p>
                <p className="mt-0.5 text-xs text-ink-tertiary">
                  {task.dueDate ?? "Sem prazo"}
                  {overdue ? " · atrasada" : ""}
                </p>
              </button>
              <PriorityBadge priority={task.priority} />
              <StatusBadge status={task.status} />
            </li>
          );
        })}
      </ul>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Tarefa</SheetTitle>
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
                            {phaseLabel[p]}
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
                        setDraft({ ...draft, status: v as TaskStatus })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(
                          [
                            "todo",
                            "doing",
                            "blocked",
                            "done",
                            "cancelled",
                          ] as TaskStatus[]
                        ).map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
              </SheetBody>
              <SheetFooter>
                <Button
                  className="flex-1"
                  onClick={() => {
                    if (!draft.title.trim()) {
                      toast.error("Informe o título");
                      return;
                    }
                    upsert(draft);
                    toast.success("Tarefa salva");
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
