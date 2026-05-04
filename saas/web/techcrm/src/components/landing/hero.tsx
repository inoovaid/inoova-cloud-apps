'use client';

import { ArrowRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth-store';

const stats = [
  { value: '10.000+', label: 'alunos' },
  { value: '50+', label: 'cursos' },
  { value: '95%', label: 'satisfação' },
];

export function Hero() {
  const setView = useAuthStore((s) => s.setView);

  const scrollToCourses = () => {
    const el = document.getElementById('cursos');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-white via-emerald-50/40 to-teal-50/30 dark:from-background dark:via-background dark:to-emerald-950/10">
      {/* Animated floating shapes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl animate-pulse" />
        <div className="absolute right-10 top-40 h-56 w-56 rounded-full bg-teal-200/25 blur-3xl animate-pulse [animation-delay:1s]" />
        <div className="absolute bottom-10 left-1/3 h-64 w-64 rounded-full bg-emerald-100/20 blur-3xl animate-pulse [animation-delay:2s]" />

        {/* Floating geometric shapes */}
        <div className="absolute left-[10%] top-[15%] h-4 w-4 rotate-45 rounded-sm bg-emerald-400/20 animate-bounce [animation-duration:3s]" />
        <div className="absolute right-[15%] top-[25%] h-3 w-3 rounded-full bg-teal-400/25 animate-bounce [animation-duration:4s] [animation-delay:0.5s]" />
        <div className="absolute left-[20%] bottom-[20%] h-5 w-5 rotate-12 rounded-md bg-emerald-300/15 animate-bounce [animation-duration:5s] [animation-delay:1s]" />
        <div className="absolute right-[25%] bottom-[30%] h-3.5 w-3.5 rotate-45 rounded-sm bg-teal-300/20 animate-bounce [animation-duration:3.5s] [animation-delay:1.5s]" />
        <div className="absolute left-[60%] top-[10%] h-2.5 w-2.5 rounded-full bg-emerald-400/20 animate-bounce [animation-duration:4.5s] [animation-delay:2s]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Nova turma disponível
          </div>

          {/* Headline */}
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Domine tecnologia com{' '}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 bg-clip-text text-transparent">
              inteligência
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Plataforma completa de cursos para transformar sua carreira em tecnologia. Aprenda com projetos reais, certificados reconhecidos e comunidade ativa.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button
              size="lg"
              onClick={() => setView('register')}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 px-8 text-base font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:brightness-110"
            >
              Começar agora
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={scrollToCourses}
              className="gap-2 px-8 text-base font-semibold"
            >
              <Play className="h-4 w-4" />
              Ver cursos
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-16 flex items-center justify-center gap-8 sm:gap-12 md:gap-16">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
