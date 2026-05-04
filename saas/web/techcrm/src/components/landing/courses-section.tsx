'use client';

import { Monitor, Server, Shield, Cloud, Database, Brain } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth-store';
import type { LucideIcon } from 'lucide-react';

interface Course {
  name: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  level: string;
}

const courses: Course[] = [
  {
    name: 'Front-end',
    icon: Monitor,
    color: 'text-violet-600',
    bgColor: 'bg-violet-50 dark:bg-violet-950/40',
    borderColor: 'border-violet-200 dark:border-violet-800',
    description: 'HTML, CSS, JavaScript, React e muito mais. Construa interfaces modernas e responsivas.',
    level: 'Iniciante ao Avançado',
  },
  {
    name: 'Back-end',
    icon: Server,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    description: 'Node.js, Python, APIs REST, bancos de dados e arquitetura de sistemas.',
    level: 'Intermediário ao Avançado',
  },
  {
    name: 'QA',
    icon: Shield,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 dark:bg-amber-950/40',
    borderColor: 'border-amber-200 dark:border-amber-800',
    description: 'Testes automatizados, CI/CD, garantia de qualidade e boas práticas de teste.',
    level: 'Iniciante ao Intermediário',
  },
  {
    name: 'DevOps',
    icon: Cloud,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50 dark:bg-cyan-950/40',
    borderColor: 'border-cyan-200 dark:border-cyan-800',
    description: 'Docker, Kubernetes, infraestrutura como código e pipelines de deploy.',
    level: 'Intermediário ao Avançado',
  },
  {
    name: 'Dados',
    icon: Database,
    color: 'text-rose-600',
    bgColor: 'bg-rose-50 dark:bg-rose-950/40',
    borderColor: 'border-rose-200 dark:border-rose-800',
    description: 'SQL, NoSQL, ETL, data pipelines e engenharia de dados na prática.',
    level: 'Iniciante ao Avançado',
  },
  {
    name: 'IA',
    icon: Brain,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-950/40',
    borderColor: 'border-purple-200 dark:border-purple-800',
    description: 'Machine Learning, Deep Learning, LLMs e aplicações práticas de inteligência artificial.',
    level: 'Intermediário ao Avançado',
  },
];

export function CoursesSection() {
  const setView = useAuthStore((s) => s.setView);

  return (
    <section id="cursos" className="bg-white py-20 dark:bg-background sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <Badge
            variant="secondary"
            className="mb-4 border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
          >
            Nossos Cursos
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Encontre o curso ideal para{' '}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              sua carreira
            </span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Cursos completos, do básico ao avançado, com projetos práticos e certificação reconhecida pelo mercado.
          </p>
        </div>

        {/* Course cards grid */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => {
            const Icon = course.icon;
            return (
              <Card
                key={course.name}
                className={`group relative cursor-pointer border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${course.borderColor}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${course.bgColor} transition-transform duration-300 group-hover:scale-110`}>
                      <Icon className={`h-6 w-6 ${course.color}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-foreground">{course.name}</h3>
                      </div>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {course.level}
                      </Badge>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    {course.description}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setView('register')}
                    className={`mt-4 ${course.color} hover:${course.bgColor} p-0`}
                  >
                    Saiba mais →
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
