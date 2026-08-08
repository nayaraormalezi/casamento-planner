"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  acceptInvitationAction,
  getInvitationPreviewAction,
} from "@/app/actions/invitations";
import { useWeddingStore } from "@/lib/demo/store";

const ROLE_LABEL: Record<string, string> = {
  partner: "Parceiro(a)",
  collaborator: "Colaborador",
  viewer: "Visualizador",
};

export default function InvitePage() {
  const params = useParams<{ token: string }>();
  const token = params.token;
  const router = useRouter();
  const session = useWeddingStore((s) => s.session);
  const hydrated = useWeddingStore((s) => s.hydrated);
  const hydrate = useWeddingStore((s) => s.hydrate);
  const refresh = useWeddingStore((s) => s.refresh);

  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{
    email: string;
    role: string;
    weddingName: string;
    workspaceName: string;
  } | null>(null);

  useEffect(() => {
    if (!hydrated) void hydrate();
  }, [hydrated, hydrate]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const res = await getInvitationPreviewAction(token);
      if (cancelled) return;
      if (!res.ok) {
        const messages: Record<string, string> = {
          NOT_FOUND: "Convite não encontrado.",
          NOT_PENDING: "Este convite já foi usado ou revogado.",
          EXPIRED: "Este convite expirou.",
        };
        setError(messages[res.error] ?? "Convite inválido.");
        setPreview(null);
      } else {
        setPreview(res.invitation);
        setError(null);
      }
      setLoading(false);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function accept() {
    if (!session) {
      router.push(`/login?next=${encodeURIComponent(`/invite/${token}`)}`);
      return;
    }
    setAccepting(true);
    try {
      const res = await acceptInvitationAction(token);
      if (!res.ok) {
        const messages: Record<string, string> = {
          EMAIL_MISMATCH:
            "Entre com o mesmo email do convite para aceitar.",
          EXPIRED: "Este convite expirou.",
          NOT_PENDING: "Este convite já foi usado.",
        };
        toast.error(messages[res.error] ?? "Não foi possível aceitar");
        return;
      }
      await refresh();
      toast.success("Convite aceito");
      router.replace("/app/dashboard");
      router.refresh();
    } finally {
      setAccepting(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-canvas-elevated p-8 shadow-md">
        <p className="font-display text-xl font-semibold tracking-tight">
          Wedding Planner
        </p>
        <h1 className="mt-2 text-lg font-medium">Convite para o workspace</h1>

        {loading ? (
          <p className="mt-6 text-sm text-ink-tertiary">Carregando convite…</p>
        ) : error ? (
          <div className="mt-6 space-y-4">
            <p className="text-sm text-danger" role="alert">
              {error}
            </p>
            <Button asChild variant="secondary">
              <Link href="/login">Ir para o login</Link>
            </Button>
          </div>
        ) : preview ? (
          <div className="mt-6 space-y-4">
            <p className="text-sm text-ink-secondary">
              Você foi convidado(a) para{" "}
              <span className="font-medium text-ink">{preview.weddingName}</span>{" "}
              como {ROLE_LABEL[preview.role] ?? preview.role}.
            </p>
            <p className="text-xs text-ink-tertiary">
              Convite enviado para {preview.email}
            </p>
            {!session && hydrated ? (
              <div className="flex flex-col gap-2">
                <Button asChild>
                  <Link
                    href={`/login?next=${encodeURIComponent(`/invite/${token}`)}`}
                  >
                    Entrar para aceitar
                  </Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link
                    href={`/signup?next=${encodeURIComponent(`/invite/${token}`)}&email=${encodeURIComponent(preview.email)}`}
                  >
                    Criar conta
                  </Link>
                </Button>
              </div>
            ) : (
              <Button onClick={() => void accept()} disabled={accepting}>
                {accepting ? "Aceitando…" : "Aceitar convite"}
              </Button>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
