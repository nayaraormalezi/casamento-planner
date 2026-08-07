"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Stepper } from "@/components/shared/stepper";
import { useWeddingStore } from "@/lib/demo/store";

const TOTAL_STEPS = 7;

export default function OnboardingPage() {
  const router = useRouter();
  const session = useWeddingStore((s) => s.session);
  const workspace = useWeddingStore((s) => s.workspace);
  const completeOnboarding = useWeddingStore((s) => s.completeOnboarding);
  const [step, setStep] = useState(1);
  const [partnerOneName, setPartnerOne] = useState("");
  const [partnerTwoName, setPartnerTwo] = useState("");
  const [weddingDate, setWeddingDate] = useState("");
  const [totalBudgetReais, setBudget] = useState("100000");
  const [city, setCity] = useState("");
  const [venue, setVenue] = useState("");
  const [styleTags, setStyleTags] = useState("clássico, jardim");

  useEffect(() => {
    if (!session) router.replace("/login?next=/onboarding");
    else if (workspace?.wedding.onboardingDone) router.replace("/app/dashboard");
  }, [session, workspace, router]);

  function next() {
    if (step < TOTAL_STEPS) setStep((s) => s + 1);
  }

  function back() {
    if (step > 1) setStep((s) => s - 1);
  }

  function finish() {
    completeOnboarding({
      partnerOneName,
      partnerTwoName,
      weddingDate,
      totalBudgetReais: Number(totalBudgetReais.replace(/\D/g, "")) || 0,
      city,
      venue,
      styleTags: styleTags
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    });
    setStep(TOTAL_STEPS);
    setTimeout(() => router.push("/app/dashboard"), 900);
  }

  if (!session) return null;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-center px-4 py-12">
      <p className="font-display text-lg font-semibold">Wedding Planner</p>
      <p className="mt-1 text-sm text-ink-tertiary">
        Passo {Math.min(step, 6)} de 6
      </p>
      <Stepper steps={6} current={Math.min(step, 6)} className="mt-4" />

      <div className="mt-10">
        {step === 1 && (
          <div className="space-y-4">
            <h1 className="font-display text-3xl font-semibold tracking-tight">
              Bem-vindos
            </h1>
            <p className="text-ink-secondary">
              Em poucos minutos montamos o projeto do casamento: orçamento,
              checklist e próximos passos.
            </p>
            <Button onClick={next}>Começar</Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h1 className="font-display text-2xl font-semibold">Quem casa?</h1>
            <div className="space-y-2">
              <Label>Nome 1</Label>
              <Input
                value={partnerOneName}
                onChange={(e) => setPartnerOne(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Nome 2</Label>
              <Input
                value={partnerTwoName}
                onChange={(e) => setPartnerTwo(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={back}>
                Voltar
              </Button>
              <Button onClick={next} disabled={!partnerOneName}>
                Continuar
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h1 className="font-display text-2xl font-semibold">
              Quando é o grande dia?
            </h1>
            <p className="text-sm text-ink-tertiary">
              Usamos a data para montar fases e prazos do checklist.
            </p>
            <Input
              type="date"
              value={weddingDate}
              onChange={(e) => setWeddingDate(e.target.value)}
            />
            <div className="flex gap-2">
              <Button variant="secondary" onClick={back}>
                Voltar
              </Button>
              <Button onClick={next} disabled={!weddingDate}>
                Continuar
              </Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h1 className="font-display text-2xl font-semibold">
              Orçamento teto
            </h1>
            <div className="space-y-2">
              <Label>Valor total (R$)</Label>
              <Input
                inputMode="numeric"
                value={totalBudgetReais}
                onChange={(e) => setBudget(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={back}>
                Voltar
              </Button>
              <Button
                onClick={next}
                disabled={!totalBudgetReais || Number(totalBudgetReais) <= 0}
              >
                Continuar
              </Button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <h1 className="font-display text-2xl font-semibold">Onde será?</h1>
            <div className="space-y-2">
              <Label>Cidade</Label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Local (opcional)</Label>
              <Input value={venue} onChange={(e) => setVenue(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={back}>
                Voltar
              </Button>
              <Button onClick={next} disabled={!city}>
                Continuar
              </Button>
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-4">
            <h1 className="font-display text-2xl font-semibold">Estilo</h1>
            <p className="text-sm text-ink-tertiary">
              Tags separadas por vírgula (opcional).
            </p>
            <Input
              value={styleTags}
              onChange={(e) => setStyleTags(e.target.value)}
              placeholder="clássico, moderno, jardim"
            />
            <div className="flex gap-2">
              <Button variant="secondary" onClick={back}>
                Voltar
              </Button>
              <Button onClick={finish}>Gerar meu plano</Button>
            </div>
          </div>
        )}

        {step === 7 && (
          <div className="space-y-3">
            <h1 className="font-display text-2xl font-semibold">
              Montando seu plano…
            </h1>
            <p className="text-ink-tertiary">
              Categorias de orçamento e checklist por fases.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
