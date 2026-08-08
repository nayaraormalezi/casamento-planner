"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  createInvitationAction,
  listTeamAction,
  revokeInvitationAction,
} from "@/app/actions/invitations";
import { useWeddingStore } from "@/lib/demo/store";

const ROLE_LABEL: Record<string, string> = {
  owner: "Owner",
  partner: "Parceiro(a)",
  collaborator: "Colaborador",
  viewer: "Visualizador",
};

type TeamState = Awaited<ReturnType<typeof listTeamAction>>;

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
  const [styleTags, setStyleTags] = useState(w.styleTags.join(", "));
  const [saving, setSaving] = useState(false);

  const [team, setTeam] = useState<TeamState | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"partner" | "collaborator" | "viewer">(
    "partner",
  );
  const [inviting, setInviting] = useState(false);

  const loadTeam = useCallback(async () => {
    const res = await listTeamAction();
    if (res.ok) setTeam(res);
  }, []);

  useEffect(() => {
    void loadTeam();
  }, [loadTeam]);

  async function save() {
    setSaving(true);
    try {
      await updateWedding({
        name,
        weddingDate,
        totalBudget: Math.round(Number(totalBudgetReais) * 100),
        city,
        venue,
        styleTags: styleTags
          .split(/[,;/|]/)
          .map((t) => t.trim())
          .filter(Boolean),
      });
      toast.success("Configurações salvas");
    } catch {
      toast.error("Não foi possível salvar");
    } finally {
      setSaving(false);
    }
  }

  async function invite() {
    setInviting(true);
    try {
      const res = await createInvitationAction({
        email: inviteEmail,
        role: inviteRole,
      });
      if (!res.ok) {
        const messages: Record<string, string> = {
          INVALID_EMAIL: "Informe um email válido.",
          ALREADY_MEMBER: "Essa pessoa já faz parte do workspace.",
        };
        toast.error(messages[res.error] ?? "Não foi possível convidar");
        return;
      }
      setInviteEmail("");
      await loadTeam();
      try {
        await navigator.clipboard.writeText(res.invitation.inviteUrl);
        toast.success("Convite criado — link copiado");
      } catch {
        toast.success(`Convite criado: ${res.invitation.inviteUrl}`);
      }
    } finally {
      setInviting(false);
    }
  }

  async function revoke(id: string) {
    const res = await revokeInvitationAction(id);
    if (!res.ok) {
      toast.error("Não foi possível revogar");
      return;
    }
    await loadTeam();
    toast.success("Convite revogado");
  }

  const canInvite = team?.role === "owner";

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
          <div className="space-y-2">
            <Label>Estilo do casamento</Label>
            <Input
              value={styleTags}
              onChange={(e) => setStyleTags(e.target.value)}
              placeholder="Ex.: clássico, jardim, boho"
            />
            <p className="text-xs text-ink-tertiary">
              Separe tags por vírgula. Isso conclui a tarefa de definir o estilo.
            </p>
          </div>
          <Button onClick={save} disabled={saving}>
            {saving ? "Salvando…" : "Salvar"}
          </Button>
        </TabsContent>

        <TabsContent value="equipe" className="max-w-lg space-y-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-ink">Membros</p>
            <ul className="divide-y divide-border rounded-lg border border-border">
              {(team?.members ?? []).map((m) => (
                <li
                  key={m.id}
                  className="flex items-center justify-between px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-medium">
                      {m.fullName || m.email}
                    </p>
                    <p className="text-xs text-ink-tertiary">{m.email}</p>
                  </div>
                  <span className="text-xs text-ink-secondary">
                    {ROLE_LABEL[m.role] ?? m.role}
                  </span>
                </li>
              ))}
              {!team?.members.length ? (
                <li className="px-3 py-4 text-sm text-ink-tertiary">
                  Carregando…
                </li>
              ) : null}
            </ul>
          </div>

          {canInvite ? (
            <div className="space-y-3">
              <p className="text-sm font-medium text-ink">Convidar pessoa</p>
              <div className="space-y-2">
                <Label htmlFor="invite-email">Email</Label>
                <Input
                  id="invite-email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="parceiro@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invite-role">Papel</Label>
                <select
                  id="invite-role"
                  className="flex h-10 w-full rounded-md border border-border bg-canvas px-3 text-sm"
                  value={inviteRole}
                  onChange={(e) =>
                    setInviteRole(
                      e.target.value as "partner" | "collaborator" | "viewer",
                    )
                  }
                >
                  <option value="partner">Parceiro(a)</option>
                  <option value="collaborator">Colaborador</option>
                  <option value="viewer">Visualizador</option>
                </select>
              </div>
              <Button
                onClick={() => void invite()}
                disabled={inviting || !inviteEmail.trim()}
              >
                {inviting ? "Criando…" : "Criar convite e copiar link"}
              </Button>
            </div>
          ) : (
            <p className="text-sm text-ink-secondary">
              Apenas o owner pode enviar convites.
            </p>
          )}

          {(team?.invitations.length ?? 0) > 0 ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-ink">Convites pendentes</p>
              <ul className="divide-y divide-border rounded-lg border border-border">
                {team!.invitations.map((i) => (
                  <li
                    key={i.id}
                    className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm"
                  >
                    <div>
                      <p className="font-medium">{i.email}</p>
                      <p className="text-xs text-ink-tertiary">
                        {ROLE_LABEL[i.role] ?? i.role}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(i.inviteUrl);
                            toast.success("Link copiado");
                          } catch {
                            toast.message(i.inviteUrl);
                          }
                        }}
                      >
                        Copiar link
                      </Button>
                      {canInvite ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => void revoke(i.id)}
                        >
                          Revogar
                        </Button>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

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
