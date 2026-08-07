"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWeddingStore } from "@/lib/demo/store";

export default function SettingsPage() {
  const router = useRouter();
  const workspace = useWeddingStore((s) => s.workspace)!;
  const updateWedding = useWeddingStore((s) => s.updateWedding);
  const logout = useWeddingStore((s) => s.logout);
  const w = workspace.wedding;
  const [name, setName] = useState(w.name);
  const [weddingDate, setWeddingDate] = useState(w.weddingDate);
  const [totalBudgetReais, setTotalBudgetReais] = useState(
    String(w.totalBudget / 100),
  );
  const [city, setCity] = useState(w.city);
  const [venue, setVenue] = useState(w.venue);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await updateWedding({
        name,
        weddingDate,
        totalBudget: Math.round(Number(totalBudgetReais) * 100),
        city,
        venue,
      });
      toast.success("Configurações salvas");
    } catch {
      toast.error("Não foi possível salvar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Configurações"
        description="Casamento, equipe e dados."
      />

      <Tabs defaultValue="geral">
        <TabsList>
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="equipe">Equipe</TabsTrigger>
          <TabsTrigger value="dados">Dados</TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="max-w-lg space-y-4">
          <div className="space-y-2">
            <Label>Nome do casamento</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Data</Label>
            <Input
              type="date"
              value={weddingDate}
              onChange={(e) => setWeddingDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Orçamento teto (R$)</Label>
            <Input
              type="number"
              value={totalBudgetReais}
              onChange={(e) => setTotalBudgetReais(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Cidade</Label>
            <Input value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Local</Label>
            <Input value={venue} onChange={(e) => setVenue(e.target.value)} />
          </div>
          <Button onClick={save} disabled={saving}>
            {saving ? "Salvando…" : "Salvar"}
          </Button>
        </TabsContent>

        <TabsContent value="equipe" className="max-w-lg space-y-4">
          <p className="text-sm text-ink-secondary">
            Você é owner deste workspace. Convites de parceiro/planner entram
            numa próxima iteração.
          </p>
          <Button variant="secondary" asChild>
            <Link href="/signup">Criar outra conta</Link>
          </Button>
        </TabsContent>

        <TabsContent value="dados" className="max-w-lg space-y-4">
          <Button
            variant="secondary"
            onClick={() => {
              const blob = new Blob([JSON.stringify(workspace, null, 2)], {
                type: "application/json",
              });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "wedding-planner-export.json";
              a.click();
              toast.success("Export gerado");
            }}
          >
            Exportar JSON
          </Button>
          <Button
            variant="ghost"
            onClick={async () => {
              await logout();
              router.push("/login");
              router.refresh();
            }}
          >
            Sair
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
