"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWeddingStore } from "@/lib/demo/store";
import type { TaskStatus } from "@/types/domain";
import { cn } from "@/utils/cn";

const columns: { status: TaskStatus; label: string }[] = [
  { status: "todo", label: "A fazer" },
  { status: "doing", label: "Em andamento" },
  { status: "done", label: "Concluído" },
];

export default function SchedulePage() {
  const workspace = useWeddingStore((s) => s.workspace)!;
  const upsert = useWeddingStore((s) => s.upsertTask);
  const [view, setView] = useState("kanban");

  const byStatus = useMemo(() => {
    const map: Record<string, typeof workspace.tasks> = {
      todo: [],
      doing: [],
      done: [],
    };
    for (const t of workspace.tasks) {
      map[t.status]?.push(t);
    }
    return map;
  }, [workspace]);

  const calendarDays = useMemo(() => {
    const withDate = workspace.tasks.filter((t) => t.dueDate);
    const map = new Map<string, number>();
    for (const t of withDate) {
      map.set(t.dueDate!, (map.get(t.dueDate!) ?? 0) + 1);
    }
    return [...map.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(0, 14);
  }, [workspace]);

  return (
    <div>
      <PageHeader
        title="Cronograma"
        description="Mesmas tarefas — escolha a visão."
      />

      <Tabs value={view} onValueChange={setView}>
        <TabsList>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
          <TabsTrigger value="calendar">Calendário</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="kanban">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {columns.map((col) => (
              <div key={col.status} className="min-h-40 rounded-lg bg-canvas-muted/60 p-3">
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-ink-tertiary">
                  {col.label}
                </p>
                <div className="space-y-2">
                  {byStatus[col.status]?.map((t) => (
                    <div
                      key={t.id}
                      className="rounded-md border border-border bg-canvas-elevated p-3 shadow-sm"
                    >
                      <p className="text-sm font-medium">{t.title}</p>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <PriorityBadge priority={t.priority} />
                        <select
                          className="rounded-sm border border-border bg-transparent text-xs"
                          value={t.status}
                          onChange={(e) =>
                            upsert({
                              ...t,
                              status: e.target.value as TaskStatus,
                            })
                          }
                        >
                          {columns.map((c) => (
                            <option key={c.status} value={c.status}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="calendar">
          <div className="space-y-2">
            {calendarDays.length === 0 ? (
              <p className="text-sm text-ink-tertiary">
                Nenhuma tarefa com prazo.
              </p>
            ) : (
              calendarDays.map(([date, count]) => (
                <div
                  key={date}
                  className="flex items-center justify-between rounded-lg border border-border bg-canvas-elevated px-4 py-3"
                >
                  <span className="tabular-nums text-sm">{date}</span>
                  <span className="text-sm text-ink-tertiary">
                    {count} tarefa{count > 1 ? "s" : ""}
                  </span>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="timeline">
          <div className="space-y-3">
            {workspace.tasks
              .slice()
              .sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? ""))
              .slice(0, 20)
              .map((t) => (
                <div key={t.id} className="flex items-center gap-4">
                  <span className="w-24 shrink-0 text-xs tabular-nums text-ink-tertiary">
                    {t.dueDate ?? "—"}
                  </span>
                  <div
                    className={cn(
                      "h-8 flex-1 rounded-md border px-3 text-sm leading-8",
                      t.isMilestone
                        ? "border-accent bg-accent-subtle"
                        : "border-border bg-canvas-elevated",
                    )}
                  >
                    {t.title}
                  </div>
                </div>
              ))}
          </div>
          <Button className="mt-4" variant="secondary" asChild>
            <a href="/app/tasks">Abrir checklist</a>
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
