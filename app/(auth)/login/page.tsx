"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWeddingStore } from "@/lib/demo/store";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const login = useWeddingStore((s) => s.login);
  const workspace = useWeddingStore((s) => s.workspace);
  const loadDemo = useWeddingStore((s) => s.loadDemo);
  const [email, setEmail] = useState("ana@example.com");
  const [password, setPassword] = useState("demo1234");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    login(email, email.split("@")[0]);
    const next = params.get("next");
    if (next) {
      router.push(next);
      return;
    }
    if (workspace?.wedding.onboardingDone) router.push("/app/dashboard");
    else router.push("/onboarding");
  }

  function enterDemo() {
    login("ana@example.com", "Ana");
    loadDemo();
    router.push("/app/dashboard");
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-canvas-elevated p-8 shadow-md">
        <p className="font-display text-xl font-semibold tracking-tight">
          Wedding Planner
        </p>
        <h1 className="mt-2 text-lg font-medium text-ink">Entrar na sua conta</h1>
        <p className="mt-1 text-sm text-ink-tertiary">
          MVP demo — autenticação local (Supabase na próxima conexão).
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Entrar
          </Button>
        </form>

        <Button
          type="button"
          variant="secondary"
          className="mt-3 w-full"
          onClick={enterDemo}
        >
          Explorar com dados demo
        </Button>

        <p className="mt-6 text-center text-sm text-ink-tertiary">
          Não tem conta?{" "}
          <Link href="/signup" className="text-accent hover:underline">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
