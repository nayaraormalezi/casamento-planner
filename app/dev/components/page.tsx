"use client";

import { useState } from "react";
import { Wallet } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/shared/page-header";
import { KpiStat } from "@/components/shared/kpi-stat";
import { Money } from "@/components/shared/money";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { EmotionalReturn } from "@/components/shared/emotional-return";
import { AlertRow } from "@/components/shared/alert-row";
import { EmptyState } from "@/components/shared/empty-state";
import { Stepper } from "@/components/shared/stepper";
import { UploadDropzone } from "@/components/shared/upload-dropzone";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-12">
      <h2 className="mb-4 font-display text-xl font-semibold tracking-tight">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function ComponentsGalleryPage() {
  const [checked, setChecked] = useState(false);

  return (
    <AppShell>
      <PageHeader
        title="Componentes"
        description="Galeria da Etapa 8 — primitives e componentes de produto."
        actions={
          <Button
            variant="secondary"
            onClick={() => toast.success("Toast de exemplo")}
          >
            Disparar toast
          </Button>
        }
      />

      <Section title="KPIs">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiStat label="Planejamento" value="34%" helper="42 de 124 tarefas" />
          <KpiStat label="Dias restantes" value="128" />
          <KpiStat label="Comprometido" moneyCents={8200000} compactMoney />
          <KpiStat label="Atrasadas" value={3} helper="Prioridade ≥ 4" />
        </div>
      </Section>

      <Section title="Botões">
        <div className="flex flex-wrap gap-2">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="accent">Accent</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="link">Link</Button>
        </div>
      </Section>

      <Section title="Formulário">
        <div className="grid max-w-md gap-4">
          <div className="space-y-2">
            <Label htmlFor="desc">Descrição</Label>
            <Input id="desc" placeholder="Buffet premium" />
          </div>
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select defaultValue="venue">
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="venue">Local</SelectItem>
                <SelectItem value="catering">Buffet</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea id="notes" placeholder="Notas..." />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="cut"
              checked={checked}
              onCheckedChange={(v) => setChecked(v === true)}
            />
            <Label htmlFor="cut">Incluir na sala de cortes</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="notify" />
            <Label htmlFor="notify">Alertas por e-mail</Label>
          </div>
        </div>
      </Section>

      <Section title="Badges & status">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>Neutral</Badge>
          <Badge variant="accent">Accent</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="danger">Danger</Badge>
          <PriorityBadge priority={5} showLabel />
          <PriorityBadge priority={3} />
          <EmotionalReturn value={4} />
          <StatusBadge status="contracted" />
          <StatusBadge status="doing" />
          <Money cents={1250000} />
        </div>
      </Section>

      <Section title="Progress & stepper">
        <div className="max-w-md space-y-4">
          <Progress value={34} />
          <Stepper steps={7} current={3} />
        </div>
      </Section>

      <Section title="Tabs">
        <Tabs defaultValue="table">
          <TabsList>
            <TabsTrigger value="table">Tabela</TabsTrigger>
            <TabsTrigger value="charts">Gráficos</TabsTrigger>
          </TabsList>
          <TabsContent value="table">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Previsto</TableHead>
                  <TableHead>Prioridade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Local</TableCell>
                  <TableCell className="text-right">
                    <Money cents={3500000} align="right" />
                  </TableCell>
                  <TableCell>
                    <PriorityBadge priority={5} />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Buffet</TableCell>
                  <TableCell className="text-right">
                    <Money cents={2200000} align="right" />
                  </TableCell>
                  <TableCell>
                    <PriorityBadge priority={5} />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TabsContent>
          <TabsContent value="charts">
            <p className="text-sm text-ink-tertiary">
              Charts (Recharts) entram na implementação dos módulos.
            </p>
          </TabsContent>
        </Tabs>
      </Section>

      <Section title="Alertas">
        <div className="space-y-3">
          <AlertRow
            severity="critical"
            title="Pagamento do buffet vencido"
            description="Venceu ontem · R$ 8.500"
            href="/app/budget"
          />
          <AlertRow
            severity="warning"
            title="Fotógrafo essencial sem contrato"
            href="/app/vendors"
          />
        </div>
      </Section>

      <Section title="Dialog & Drawer">
        <div className="flex flex-wrap gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary">Abrir modal</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Excluir item?</DialogTitle>
                <DialogDescription>
                  Essa ação remove o item do orçamento. Os KPIs serão
                  recalculados.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="secondary">Cancelar</Button>
                <Button variant="danger">Excluir</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="secondary">Abrir drawer</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Buffet premium</SheetTitle>
                <SheetDescription>Editar item de orçamento</SheetDescription>
              </SheetHeader>
              <SheetBody className="space-y-4">
                <div className="space-y-2">
                  <Label>Valor previsto</Label>
                  <Input defaultValue="22000" className="tabular-nums" />
                </div>
                <div className="space-y-2">
                  <Label>Observações</Label>
                  <Textarea />
                </div>
              </SheetBody>
              <SheetFooter>
                <Button className="flex-1">Salvar</Button>
                <Button variant="ghost">Excluir</Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </Section>

      <Section title="Upload & empty">
        <div className="grid gap-6 lg:grid-cols-2">
          <UploadDropzone
            onFile={() => {
              toast.message("Upload stub");
            }}
          />
          <EmptyState
            icon={Wallet}
            title="Seu dinheiro precisa de um mapa"
            description="Comece pelo local e pelo buffet — costumam ser 50%+ do orçamento."
            actionLabel="Adicionar primeiro item"
            onAction={() => toast.message("CTA stub")}
          />
        </div>
      </Section>

      <Section title="Skeleton">
        <div className="grid gap-3 sm:grid-cols-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </Section>

      <Separator className="my-8" />
      <p className="text-sm text-ink-tertiary">
        Shell, sidebar e bottom nav estão ativos nesta página.
      </p>
    </AppShell>
  );
}
