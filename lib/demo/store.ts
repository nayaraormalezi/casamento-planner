"use client";

import { create } from "zustand";
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
  applyBudgetCutsAction,
  completeOnboardingAction,
  getSessionAction,
  getWorkspaceAction,
  removeBudgetItemAction,
  removeDecisionAction,
  removeGiftAction,
  removeGuestAction,
  removeTaskAction,
  removeVendorAction,
  signOutAction,
  updateWeddingAction,
  upsertBudgetItemAction,
  upsertDecisionAction,
  upsertGiftAction,
  upsertGuestAction,
  upsertHoneymoonItemAction,
  upsertTaskAction,
  upsertVendorAction,
} from "@/app/actions/wedding";

type Session = { id: string; email: string; fullName: string | null } | null;

type WeddingStore = {
  hydrated: boolean;
  loading: boolean;
  session: Session;
  workspace: WeddingWorkspace | null;
  hydrate: () => Promise<void>;
  completeOnboarding: (input: {
    partnerOneName: string;
    partnerTwoName: string;
    weddingDate: string;
    totalBudgetReais: number;
    city: string;
    venue?: string;
    styleTags?: string[];
  }) => Promise<{ ok: boolean; error?: string }>;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
  upsertBudgetItem: (item: BudgetItem) => Promise<void>;
  removeBudgetItem: (id: string) => Promise<void>;
  applyBudgetCuts: (
    updates: {
      id: string;
      plannedAmount: number;
      status?: BudgetItem["status"];
    }[],
  ) => Promise<void>;
  upsertVendor: (vendor: Vendor) => Promise<void>;
  removeVendor: (id: string) => Promise<void>;
  upsertTask: (task: Task) => Promise<void>;
  removeTask: (id: string) => Promise<void>;
  upsertGuest: (guest: Guest) => Promise<void>;
  removeGuest: (id: string) => Promise<void>;
  upsertGift: (gift: Gift) => Promise<void>;
  removeGift: (id: string) => Promise<void>;
  upsertDecision: (decision: Decision) => Promise<void>;
  removeDecision: (id: string) => Promise<void>;
  upsertHoneymoonItem: (item: HoneymoonItem) => Promise<void>;
  updateWedding: (
    patch: Partial<WeddingWorkspace["wedding"]>,
  ) => Promise<void>;
};

async function reload(
  set: (p: Partial<WeddingStore>) => void,
  get?: () => WeddingStore,
) {
  const sessionRes = await getSessionAction();
  if (!sessionRes.ok || !sessionRes.user) {
    set({ session: null, workspace: null, hydrated: true, loading: false });
    return;
  }
  set({
    session: {
      id: sessionRes.user.id,
      email: sessionRes.user.email,
      fullName: sessionRes.user.fullName,
    },
  });
  const ws = await getWorkspaceAction();
  if (ws.ok) {
    set({
      workspace: ws.workspace,
      hydrated: true,
      loading: false,
    });
    return;
  }
  // Don't wipe a valid in-memory workspace on transient load errors
  const current = get?.().workspace;
  if (current?.wedding.onboardingDone) {
    set({ hydrated: true, loading: false });
    return;
  }
  set({
    workspace: null,
    hydrated: true,
    loading: false,
  });
}

export const useWeddingStore = create<WeddingStore>((set, get) => ({
  hydrated: false,
  loading: false,
  session: null,
  workspace: null,

  hydrate: async () => {
    set({ loading: true });
    await reload(set, get);
  },

  refresh: async () => {
    await reload(set, get);
  },

  completeOnboarding: async (input) => {
    const res = await completeOnboardingAction(input);
    if (res.ok) {
      if (res.workspace) {
        set({
          workspace: res.workspace,
          hydrated: true,
          loading: false,
        });
      } else {
        await reload(set, get);
      }
      return { ok: true as const };
    }
    return { ok: false as const, error: res.error };
  },

  logout: async () => {
    await signOutAction();
    set({ session: null, workspace: null, hydrated: true });
  },

  upsertBudgetItem: async (item) => {
    await upsertBudgetItemAction(item);
    await get().refresh();
  },
  removeBudgetItem: async (id) => {
    await removeBudgetItemAction(id);
    await get().refresh();
  },
  applyBudgetCuts: async (updates) => {
    await applyBudgetCutsAction(updates);
    await get().refresh();
  },
  upsertVendor: async (vendor) => {
    await upsertVendorAction(vendor);
    await get().refresh();
  },
  removeVendor: async (id) => {
    await removeVendorAction(id);
    await get().refresh();
  },
  upsertTask: async (task) => {
    await upsertTaskAction(task);
    await get().refresh();
  },
  removeTask: async (id) => {
    await removeTaskAction(id);
    await get().refresh();
  },
  upsertGuest: async (guest) => {
    await upsertGuestAction(guest);
    await get().refresh();
  },
  removeGuest: async (id) => {
    await removeGuestAction(id);
    await get().refresh();
  },
  upsertGift: async (gift) => {
    await upsertGiftAction(gift);
    await get().refresh();
  },
  removeGift: async (id) => {
    await removeGiftAction(id);
    await get().refresh();
  },
  upsertDecision: async (decision) => {
    await upsertDecisionAction(decision);
    await get().refresh();
  },
  removeDecision: async (id) => {
    await removeDecisionAction(id);
    await get().refresh();
  },
  upsertHoneymoonItem: async (item) => {
    await upsertHoneymoonItemAction(item);
    await get().refresh();
  },
  updateWedding: async (patch) => {
    await updateWeddingAction({
      name: patch.name,
      weddingDate: patch.weddingDate,
      totalBudget: patch.totalBudget,
      city: patch.city,
      venue: patch.venue,
    });
    await get().refresh();
  },
}));
