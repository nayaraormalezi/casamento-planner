"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useWeddingStore } from "@/lib/demo/store";
import { formatMoneyBRL } from "@/utils/cn";

type EditTotalBudgetProps = {
  totalBudgetCents: number;
  plannedCents?: number;
  triggerLabel?: string;
  triggerVariant?: ButtonProps["variant"];
  triggerSize?: ButtonProps["size"];
};

export function EditTotalBudget({
  totalBudgetCents,
  plannedCents = 0,
  triggerLabel = "Editar teto",
  triggerVariant = "secondary",
  triggerSize = "sm",
}: EditTotalBudgetProps) {
  const updateWedding = useWeddingStore((s) => s.updateWedding);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(String(totalBudgetCents / 100));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setValue(String(totalBudgetCents / 100));
  }, [open, totalBudgetCents]);

  async function save() {
    const reais = Number(String(value).replace(",", "."));
    if (!Number.isFinite(reais) || reais <= 0) {
      toast.error("Informe um valor total válido");
      return;
    }
    const cents = Math.round(reais * 100);
    setSaving(true);
    try {
      await updateWedding({ totalBudget: cents });
      toast.success(`Orçamento total atualizado para ${formatMoneyBRL(cents)}`);
      setOpen(false);
    } catch {
      toast.error("Não foi possível salvar o orçamento total");
    } finally {
      setSaving(false);
    }
  }

  const available = Math.max(centsFromInput(value) - plannedCents, 0);

  return (
    <>
      <Button
        type="button"
        variant={triggerVariant}
        size={triggerSize}
        onClick={() => setOpen(true)}
      >
        {triggerLabel}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Orçamento total</DialogTitle>
            <DialogDescription>
              Esse é o teto do casamento. Os itens planejados continuam iguais —
              só muda o limite disponível.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="total-budget">Valor total (R$)</Label>
              <Input
                id="total-budget"
                type="number"
                min={1}
                step="100"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                autoFocus
              />
            </div>
            <dl className="space-y-1.5 text-sm text-ink-secondary">
              <div className="flex justify-between gap-3">
                <dt>Atual</dt>
                <dd className="tabular-nums">{formatMoneyBRL(totalBudgetCents)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Já planejado</dt>
                <dd className="tabular-nums">{formatMoneyBRL(plannedCents)}</dd>
              </div>
              <div className="flex justify-between gap-3 border-t border-border pt-1.5">
                <dt>Disponível após salvar</dt>
                <dd className="tabular-nums font-medium text-ink">
                  {formatMoneyBRL(available)}
                </dd>
              </div>
            </dl>
          </div>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setOpen(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button onClick={() => void save()} disabled={saving}>
              {saving ? "Salvando…" : "Salvar teto"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function centsFromInput(value: string): number {
  const reais = Number(String(value).replace(",", "."));
  if (!Number.isFinite(reais) || reais < 0) return 0;
  return Math.round(reais * 100);
}
