"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  BudgetItem,
  Decision,
  Gift,
  Guest,
  HoneymoonItem,
  Task,
  Vendor,
  WeddingWorkspace,
} from "@/types/domain";
import {
  buildDemoWorkspace,
  buildOnboardingWorkspace,
  createEmptyWorkspace,
} from "@/lib/demo/seed";

type Session = {
  email: string;
  name: string;
} | null;

type WeddingStore = {
  hydrated: boolean;
  setHydrated: (v: boolean) => void;
  session: Session;
  login: (email: string, name?: string) => void;
  logout: () => void;
  workspace: WeddingWorkspace | null;
  loadDemo: () => void;
  completeOnboarding: (input: {
    partnerOneName: string;
    partnerTwoName: string;
    weddingDate: string;
    totalBudgetReais: number;
    city: string;
    venue?: string;
    styleTags?: string[];
  }) => void;
  resetWorkspace: () => void;
  upsertBudgetItem: (item: BudgetItem) => void;
  removeBudgetItem: (id: string) => void;
  upsertVendor: (vendor: Vendor) => void;
  removeVendor: (id: string) => void;
  upsertTask: (task: Task) => void;
  removeTask: (id: string) => void;
  upsertGuest: (guest: Guest) => void;
  removeGuest: (id: string) => void;
  upsertGift: (gift: Gift) => void;
  removeGift: (id: string) => void;
  upsertDecision: (decision: Decision) => void;
  removeDecision: (id: string) => void;
  upsertHoneymoonItem: (item: HoneymoonItem) => void;
  applyBudgetCuts: (
    updates: { id: string; plannedAmount: number; status?: BudgetItem["status"] }[],
  ) => void;
  updateWedding: (patch: Partial<WeddingWorkspace["wedding"]>) => void;
};

function requireWs(ws: WeddingWorkspace | null): WeddingWorkspace {
  if (!ws) throw new Error("Workspace não inicializado");
  return ws;
}

export const useWeddingStore = create<WeddingStore>()(
  persist(
    (set, get) => ({
      hydrated: false,
      setHydrated: (v) => set({ hydrated: v }),
      session: null,
      login: (email, name) =>
        set({
          session: {
            email,
            name: name || email.split("@")[0] || "Usuário",
          },
        }),
      logout: () => set({ session: null }),
      workspace: null,
      loadDemo: () => set({ workspace: buildDemoWorkspace() }),
      completeOnboarding: (input) =>
        set({
          workspace: buildOnboardingWorkspace({
            partnerOneName: input.partnerOneName,
            partnerTwoName: input.partnerTwoName,
            weddingDate: input.weddingDate,
            totalBudget: Math.round(input.totalBudgetReais * 100),
            city: input.city,
            venue: input.venue,
            styleTags: input.styleTags,
          }),
        }),
      resetWorkspace: () => set({ workspace: createEmptyWorkspace() }),
      upsertBudgetItem: (item) => {
        const ws = requireWs(get().workspace);
        const exists = ws.budgetItems.some((i) => i.id === item.id);
        set({
          workspace: {
            ...ws,
            budgetItems: exists
              ? ws.budgetItems.map((i) => (i.id === item.id ? item : i))
              : [...ws.budgetItems, item],
          },
        });
      },
      removeBudgetItem: (itemId) => {
        const ws = requireWs(get().workspace);
        set({
          workspace: {
            ...ws,
            budgetItems: ws.budgetItems.filter((i) => i.id !== itemId),
          },
        });
      },
      upsertVendor: (vendor) => {
        const ws = requireWs(get().workspace);
        const exists = ws.vendors.some((v) => v.id === vendor.id);
        set({
          workspace: {
            ...ws,
            vendors: exists
              ? ws.vendors.map((v) => (v.id === vendor.id ? vendor : v))
              : [...ws.vendors, vendor],
          },
        });
      },
      removeVendor: (vendorId) => {
        const ws = requireWs(get().workspace);
        set({
          workspace: {
            ...ws,
            vendors: ws.vendors.filter((v) => v.id !== vendorId),
          },
        });
      },
      upsertTask: (task) => {
        const ws = requireWs(get().workspace);
        const exists = ws.tasks.some((t) => t.id === task.id);
        set({
          workspace: {
            ...ws,
            tasks: exists
              ? ws.tasks.map((t) => (t.id === task.id ? task : t))
              : [...ws.tasks, task],
          },
        });
      },
      removeTask: (taskId) => {
        const ws = requireWs(get().workspace);
        set({
          workspace: {
            ...ws,
            tasks: ws.tasks.filter((t) => t.id !== taskId),
          },
        });
      },
      upsertGuest: (guest) => {
        const ws = requireWs(get().workspace);
        const exists = ws.guests.some((g) => g.id === guest.id);
        set({
          workspace: {
            ...ws,
            guests: exists
              ? ws.guests.map((g) => (g.id === guest.id ? guest : g))
              : [...ws.guests, guest],
          },
        });
      },
      removeGuest: (guestId) => {
        const ws = requireWs(get().workspace);
        set({
          workspace: {
            ...ws,
            guests: ws.guests.filter((g) => g.id !== guestId),
          },
        });
      },
      upsertGift: (gift) => {
        const ws = requireWs(get().workspace);
        const exists = ws.gifts.some((g) => g.id === gift.id);
        set({
          workspace: {
            ...ws,
            gifts: exists
              ? ws.gifts.map((g) => (g.id === gift.id ? gift : g))
              : [...ws.gifts, gift],
          },
        });
      },
      removeGift: (giftId) => {
        const ws = requireWs(get().workspace);
        set({
          workspace: {
            ...ws,
            gifts: ws.gifts.filter((g) => g.id !== giftId),
          },
        });
      },
      upsertDecision: (decision) => {
        const ws = requireWs(get().workspace);
        const exists = ws.decisions.some((d) => d.id === decision.id);
        set({
          workspace: {
            ...ws,
            decisions: exists
              ? ws.decisions.map((d) => (d.id === decision.id ? decision : d))
              : [...ws.decisions, decision],
          },
        });
      },
      removeDecision: (decisionId) => {
        const ws = requireWs(get().workspace);
        set({
          workspace: {
            ...ws,
            decisions: ws.decisions.filter((d) => d.id !== decisionId),
          },
        });
      },
      upsertHoneymoonItem: (item) => {
        const ws = requireWs(get().workspace);
        const exists = ws.honeymoonItems.some((h) => h.id === item.id);
        set({
          workspace: {
            ...ws,
            honeymoonItems: exists
              ? ws.honeymoonItems.map((h) => (h.id === item.id ? item : h))
              : [...ws.honeymoonItems, item],
          },
        });
      },
      applyBudgetCuts: (updates) => {
        const ws = requireWs(get().workspace);
        const map = new Map(updates.map((u) => [u.id, u]));
        set({
          workspace: {
            ...ws,
            budgetItems: ws.budgetItems.map((item) => {
              const u = map.get(item.id);
              if (!u) return item;
              return {
                ...item,
                plannedAmount: u.plannedAmount,
                contractedAmount:
                  item.contractedAmount != null
                    ? Math.min(item.contractedAmount, u.plannedAmount)
                    : item.contractedAmount,
                status: u.status ?? item.status,
              };
            }),
          },
        });
      },
      updateWedding: (patch) => {
        const ws = requireWs(get().workspace);
        set({
          workspace: {
            ...ws,
            wedding: { ...ws.wedding, ...patch },
          },
        });
      },
    }),
    {
      name: "wedding-planner-mvp",
      partialize: (s) => ({
        session: s.session,
        workspace: s.workspace,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
