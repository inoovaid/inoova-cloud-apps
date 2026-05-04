'use client';

import { Check, X, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth-store';

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  name: string;
  price: string;
  period: string;
  description: string;
  badge?: string;
  features: PlanFeature[];
  highlighted: boolean;
}

const plans: Plan[] = [
  {
    name: 'Básico',
    price: 'R$97',
    period: '/mês',
    description: 'Ideal para começar',
    features: [
      { text: '5 cursos', included: true },
      { text: 'Suporte por email', included: true },
      { text: 'Certificados básicos', included: true },
      { text: 'Projetos práticos', included: false },
      { text: 'Comunidade exclusiva', included: false },
      { text: 'Suporte dedicado', included: false },
    ],
    highlighted: false,
  },
  {
    name: 'Profissional',
    price: 'R$197',
    period: '/mês',
    description: 'Mais popular',
    badge: 'Recomendado',
    features: [
      { text: 'Todos os cursos', included: true },
      { text: 'Suporte prioritário', included: true },
      { text: 'Certificados avançados', included: true },
      { text: 'Projetos práticos', included: true },
      { text: 'Comunidade exclusiva', included: true },
      { text: 'Suporte dedicado', included: false },
    ],
    highlighted: true,
  },
  {
    name: 'Empresarial',
    price: 'R$497',
    period: '/mês',
    description: 'Para equipes',
    features: [
      { text: 'Tudo do Profissional', included: true },
      { text: 'Gestão de equipe', included: true },
      { text: 'Dashboard admin', included: true },
      { text: 'API de integração', included: true },
      { text: 'Suporte dedicado', included: true },
      { text: 'Onboarding personalizado', included: true },
    ],
    highlighted: false,
  },
];

export function PlansSection() {
  const setView = useAuthStore((s) => s.setView);

  return (
    <section id="planos" className="bg-white py-20 dark:bg-background sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <Badge
            variant="secondary"
            className="mb-4 border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
          >
            Planos e Preços
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Escolha o plano{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              perfeito
            </span>{' '}
            para você
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Comece gratuitamente e escale conforme sua necessidade. Cancele quando quiser.
          </p>
        </div>

        {/* Plan cards */}
        <div className="mt-14 grid gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                plan.highlighted
                  ? 'border-emerald-300 shadow-lg ring-1 ring-emerald-200 dark:border-emerald-700 dark:ring-emerald-800'
                  : 'border-border/50'
              }`}
            >
              {/* Recommended badge */}
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-1 text-white shadow-md">
                    <Sparkles className="mr-1 h-3 w-3" />
                    {plan.badge}
                  </Badge>
                </div>
              )}

              <CardHeader className="pb-2 text-center">
                <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
                <div className="mt-4">
                  <span className="text-4xl font-extrabold tracking-tight text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </CardHeader>

              <CardContent className="flex flex-1 flex-col pt-2">
                {/* Feature list */}
                <ul className="flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature.text} className="flex items-center gap-3">
                      {feature.included ? (
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/50">
                          <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                        </div>
                      ) : (
                        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted">
                          <X className="h-3 w-3 text-muted-foreground" />
                        </div>
                      )}
                      <span
                        className={`text-sm ${
                          feature.included
                            ? 'text-foreground'
                            : 'text-muted-foreground/60 line-through'
                        }`}
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  size="lg"
                  onClick={() => setView('register')}
                  className={`mt-8 w-full font-semibold ${
                    plan.highlighted
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md transition-all hover:shadow-lg hover:brightness-110'
                      : ''
                  }`}
                  variant={plan.highlighted ? 'default' : 'outline'}
                >
                  {plan.name === 'Empresarial' ? 'Falar com vendas' : 'Começar agora'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
