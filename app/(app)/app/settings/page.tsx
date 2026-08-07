"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const resetWorkspace = useWeddingStore((s) => s.resetWorkspace);
  const loadDemo = useWeddingStore((s) => s.loadDemo);
  const w = workspace.wedding;

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
            <Input
              value={w.name}
              onChange={(e) => updateWedding({ name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Data</Label>
            <Input
              type="date"
              value={w.weddingDate}
              onChange={(e) => updateWedding({ weddingDate: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Orçamento teto (R$)</Label>
            <Input
              type="number"
              value={w.totalBudget / 100}
              onChange={(e) =>
                updateWedding({
                  totalBudget: Math.round(Number(e.target.value) * 100),
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Cidade</Label>
            <Input
              value={w.city}
              onChange={(e) => updateWedding({ city: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Local</Label>
            <Input
              value={w.venue}
              onChange={(e) => updateWedding({ venue: e.target.value })}
            />
          </div>
          <Button onClick={() => toast.success("Configurações salvas")}>
            Salvar
          </Button>
        </TabsContent>

        <TabsContent value="equipe" className="max-w-lg space-y-4">
          <p className="text-sm text-ink-secondary">
            Convites reais via Supabase Auth entram na conexão de infraestrutura.
            No MVP demo, você opera como owner da sessão local.
          </p>
          <Button variant="secondary" asChild>
            <Link href="/signup">Criar outra conta (nova sessão)</Link>
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
            variant="secondary"
            onClick={() => {
              loadDemo();
              toast.success("Dados demo carregados");
              router.push("/app/dashboard");
            }}
          >
            Recarregar demo
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              if (
                confirm(
                  "Isso apaga o workspace local e volta ao onboarding. Continuar?",
                )
              ) {
                resetWorkspace();
                logout();
                router.push("/login");
              }
            }}
          >
            Apagar workspace local
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              logout();
              router.push("/login");
            }}
          >
            Sair
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
