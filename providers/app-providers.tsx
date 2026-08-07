"use client";

import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useWeddingStore } from "@/lib/demo/store";

function HydrationGate({ children }: { children: React.ReactNode }) {
  const hydrated = useWeddingStore((s) => s.hydrated);
  const setHydrated = useWeddingStore((s) => s.setHydrated);

  useEffect(() => {
    // zustand persist may already have rehydrated
    if (!hydrated) {
      const unsub = useWeddingStore.persist.onFinishHydration(() => {
        setHydrated(true);
      });
      if (useWeddingStore.persist.hasHydrated()) setHydrated(true);
      return unsub;
    }
  }, [hydrated, setHydrated]);

  if (!hydrated) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-sm text-ink-tertiary">
        Carregando…
      </div>
    );
  }

  return children;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, refetchOnWindowFocus: false },
        },
      }),
  );

  return (
    <QueryClientProvider client={client}>
      <TooltipProvider delayDuration={200}>
        <HydrationGate>{children}</HydrationGate>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
