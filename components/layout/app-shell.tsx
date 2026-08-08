"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Bell,
  Sparkles,
  CheckSquare,
  CalendarRange,
  Scale,
  Wallet,
  Target,
  BarChart3,
  Truck,
  Users,
  Gift,
  Plane,
  FileText,
  Settings,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWeddingStore } from "@/lib/demo/store";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

/** Primary IA: planning copiloto, wedding ops, extras. Tools stay in topbar/Mais. */
const navGroups: NavGroup[] = [
  {
    label: "Planejamento",
    items: [
      { href: "/app/dashboard", label: "Início", icon: LayoutDashboard },
      { href: "/app/tasks", label: "Checklist", icon: CheckSquare },
      { href: "/app/schedule", label: "Cronograma", icon: CalendarRange },
    ],
  },
  {
    label: "Casamento",
    items: [
      { href: "/app/budget", label: "Orçamento", icon: Wallet },
      { href: "/app/vendors", label: "Fornecedores", icon: Truck },
      { href: "/app/guests", label: "Convidados", icon: Users },
    ],
  },
  {
    label: "Extras",
    items: [
      { href: "/app/decisions", label: "Decisões", icon: Scale },
      { href: "/app/documents", label: "Documentos", icon: FileText },
      { href: "/app/honeymoon", label: "Lua de mel", icon: Plane },
      { href: "/app/gifts", label: "Presentes", icon: Gift },
    ],
  },
];

/** Mobile: Planejamento + Casamento primaries. */
const mobileTabs: NavItem[] = [
  { href: "/app/dashboard", label: "Início", icon: LayoutDashboard },
  { href: "/app/tasks", label: "Checklist", icon: CheckSquare },
  { href: "/app/budget", label: "Orçamento", icon: Wallet },
  { href: "/app/vendors", label: "Fornecedores", icon: Truck },
];

const moreTools: NavItem[] = [
  { href: "/app/alerts", label: "Alertas", icon: Bell },
  { href: "/app/ai", label: "Assistente", icon: Sparkles },
  { href: "/app/priority", label: "Prioridades", icon: Target },
  { href: "/app/analytics", label: "Relatórios", icon: BarChart3 },
];

type AppShellProps = {
  children: React.ReactNode;
  weddingName?: string;
  daysRemaining?: number;
  phaseLabel?: string;
  budgetLabel?: string;
  alertCount?: number;
};

export function AppShell({
  children,
  weddingName = "Ana & Bruno",
  daysRemaining = 128,
  phaseLabel = "Planejamento inicial",
  budgetLabel = "R$ 82k / 100k",
  alertCount = 2,
}: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useWeddingStore((s) => s.logout);

  const moreHrefs = new Set([
    ...navGroups
      .flatMap((g) => g.items)
      .filter((i) => !mobileTabs.some((t) => t.href === i.href))
      .map((i) => i.href),
    ...moreTools.map((i) => i.href),
    "/app/settings",
  ]);
  const moreActive = [...moreHrefs].some((href) => pathname.startsWith(href));

  return (
    <div className="flex min-h-dvh">
      <aside className="sticky top-0 hidden h-dvh w-[var(--wp-sidebar-width)] shrink-0 flex-col border-r border-border bg-canvas-elevated/80 backdrop-blur-sm lg:flex">
        <div className="flex h-[var(--wp-topbar-height)] items-center px-5">
          <Link
            href="/app/dashboard"
            className="font-display text-base font-semibold tracking-tight text-ink"
          >
            Wedding Planner
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 pb-6">
          {navGroups.map((group) => (
            <div key={group.label} className="mb-5">
              <p className="mb-1.5 px-2 text-[11px] font-medium uppercase tracking-wide text-ink-disabled">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = pathname.startsWith(item.href);
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
                          active
                            ? "bg-canvas-muted font-medium text-ink"
                            : "text-ink-secondary hover:bg-canvas-muted/70 hover:text-ink",
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
        <div className="border-t border-border p-3">
          <Link
            href="/app/settings"
            className={cn(
              "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-ink-secondary hover:bg-canvas-muted/70 hover:text-ink",
              pathname.startsWith("/app/settings") &&
                "bg-canvas-muted font-medium text-ink",
            )}
          >
            <Settings className="h-4 w-4" strokeWidth={1.75} />
            Configurações
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-[var(--wp-z-sticky)] flex h-[var(--wp-topbar-height)] items-center justify-between gap-3 border-b border-border bg-canvas-elevated/90 px-3 backdrop-blur-sm sm:gap-4 sm:px-6">
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-semibold text-ink sm:text-base">
              {weddingName}
            </p>
            <p className="truncate text-xs text-ink-tertiary tabular-nums">
              <span>
                {daysRemaining} dias · {phaseLabel}
              </span>
              <span className="hidden sm:inline"> · {budgetLabel}</span>
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
            <Button variant="ghost" size="icon-sm" asChild className="relative">
              <Link href="/app/alerts" aria-label="Alertas">
                <Bell className="h-4 w-4" />
                {alertCount > 0 ? (
                  <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-danger" />
                ) : null}
              </Link>
            </Button>
            <Button variant="ghost" size="icon-sm" asChild>
              <Link href="/app/ai" aria-label="Assistente">
                <Sparkles className="h-4 w-4" />
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon-sm"
                  className="ml-0.5 rounded-full sm:ml-1"
                  aria-label="Menu da conta"
                >
                  <span className="text-xs font-semibold">A</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/app/settings">Configurações</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={async () => {
                    await logout();
                    router.push("/login");
                    router.refresh();
                  }}
                >
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[var(--wp-content-max)] flex-1 px-3 py-5 pb-[calc(5.5rem+env(safe-area-inset-bottom))] sm:px-6 sm:py-8 lg:pb-8 animate-[fade-rise_var(--wp-duration-normal)_var(--wp-ease-out)]">
          {children}
        </main>

        <nav
          className="fixed inset-x-0 bottom-0 z-[var(--wp-z-sticky)] flex border-t border-border bg-canvas-elevated/95 backdrop-blur-sm lg:hidden"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          {mobileTabs.map((item) => {
            const active = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 px-1 py-2 text-[10px] leading-tight",
                  active ? "font-medium text-ink" : "text-ink-tertiary",
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2 : 1.75} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn(
                  "flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 px-1 py-2 text-[10px] leading-tight",
                  moreActive ? "font-medium text-ink" : "text-ink-tertiary",
                )}
              >
                <MoreHorizontal
                  className="h-5 w-5"
                  strokeWidth={moreActive ? 2 : 1.75}
                />
                Mais
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="top"
              align="end"
              className="mb-2 max-h-[70vh] w-56 overflow-y-auto"
            >
              {navGroups.map((group) => {
                const extras = group.items.filter(
                  (i) => !mobileTabs.some((t) => t.href === i.href),
                );
                if (extras.length === 0) return null;
                return (
                  <div key={group.label}>
                    <DropdownMenuLabel className="text-[11px] uppercase tracking-wide text-ink-disabled">
                      {group.label}
                    </DropdownMenuLabel>
                    {extras.map((item) => (
                      <DropdownMenuItem key={item.href} asChild>
                        <Link href={item.href}>{item.label}</Link>
                      </DropdownMenuItem>
                    ))}
                  </div>
                );
              })}
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-[11px] uppercase tracking-wide text-ink-disabled">
                Ferramentas
              </DropdownMenuLabel>
              {moreTools.map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <Link href={item.href}>
                    {item.label}
                    {item.href === "/app/alerts" && alertCount > 0
                      ? ` (${alertCount})`
                      : ""}
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/app/settings">Configurações</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </div>
  );
}
