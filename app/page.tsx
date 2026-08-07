import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center justify-between px-6 py-5">
        <span className="font-display text-lg font-semibold tracking-tight">
          Wedding Planner
        </span>
        <div className="flex gap-2">
          <Button variant="ghost" asChild>
            <Link href="/login">Entrar</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Criar conta</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-6 pb-16 pt-10">
        <h1 className="font-display text-[var(--wp-text-hero)] font-semibold leading-[1.05] tracking-tight text-ink">
          Wedding Planner
        </h1>
        <p className="mt-4 max-w-lg text-lg text-ink-secondary">
          O projeto do seu casamento, não só uma lista.
        </p>
        <p className="mt-2 max-w-lg text-ink-tertiary">
          Orçamento, tarefas e decisões em um só lugar.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button size="lg" asChild>
            <Link href="/login">Começar planejamento</Link>
          </Button>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/dev/components">Design system</Link>
          </Button>
        </div>
      </main>

      <div
        className="h-[42vh] w-full bg-gradient-to-br from-accent-subtle via-canvas-muted to-info-subtle"
        aria-hidden
      />
    </div>
  );
}
