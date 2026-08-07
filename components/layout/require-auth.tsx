"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useWeddingStore } from "@/lib/demo/store";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const session = useWeddingStore((s) => s.session);
  const workspace = useWeddingStore((s) => s.workspace);
  const hydrated = useWeddingStore((s) => s.hydrated);
  const loading = useWeddingStore((s) => s.loading);
  const hydrate = useWeddingStore((s) => s.hydrate);

  useEffect(() => {
    if (!hydrated && !loading) void hydrate();
  }, [hydrated, loading, hydrate]);

  useEffect(() => {
    if (!hydrated || loading) return;
    if (!session) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    // Only bounce to onboarding when we know there is no completed wedding.
    if (!workspace?.wedding.onboardingDone && !pathname.startsWith("/onboarding")) {
      router.replace("/onboarding");
    }
  }, [hydrated, loading, session, workspace, pathname, router]);

  if (!hydrated || loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-sm text-ink-tertiary">
        Carregando…
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-sm text-ink-tertiary">
        Carregando…
      </div>
    );
  }

  if (!workspace?.wedding.onboardingDone && !pathname.startsWith("/onboarding")) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-sm text-ink-tertiary">
        Carregando…
      </div>
    );
  }

  return children;
}
