'use client';

import { Code2, Award, FolderGit2, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Benefit {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
  iconBg: string;
}

const benefits: Benefit[] = [
  {
    icon: Code2,
    title: 'Aprendizado Prático',
    description: 'Projetos reais que preparam você para o mercado de trabalho desde o primeiro dia.',
    gradient: 'from-emerald-500 to-teal-500',
    iconBg: 'bg-emerald-100 dark:bg-emerald-950/50',
  },
  {
    icon: Award,
    title: 'Certificados Reconhecidos',
    description: 'Certificados válidos para comprovar suas habilidades e impulsionar sua carreira.',
    gradient: 'from-teal-500 to-cyan-500',
    iconBg: 'bg-teal-100 dark:bg-teal-950/50',
  },
  {
    icon: FolderGit2,
    title: 'Projetos Reais',
    description: 'Portfolio construído com projetos do mundo real que impressionam recrutadores.',
    gradient: 'from-emerald-500 to-green-500',
    iconBg: 'bg-green-100 dark:bg-green-950/50',
  },
  {
    icon: Users,
    title: 'Comunidade Ativa',
    description: 'Network com milhares de profissionais e mentores dispostos a ajudar você.',
    gradient: 'from-teal-500 to-emerald-500',
    iconBg: 'bg-emerald-100 dark:bg-emerald-950/50',
  },
];

export function BenefitsSection() {
  return (
    <section id="sobre" className="bg-muted/30 py-20 dark:bg-muted/10 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Por que escolher a{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              TechCRM
            </span>
            ?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Tudo o que você precisa para se destacar na área de tecnologia em um só lugar.
          </p>
        </div>

        {/* Benefits grid */}
        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <div
                key={benefit.title}
                className="group relative rounded-2xl border border-border/50 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:bg-card"
              >
                {/* Gradient top border accent */}
                <div className={`absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r ${benefit.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />

                <div className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl ${benefit.iconBg} transition-transform duration-300 group-hover:scale-110`}>
                  <Icon className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{benefit.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
