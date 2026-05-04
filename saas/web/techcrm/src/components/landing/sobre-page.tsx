'use client';

import { Code2, Target, Heart, Lightbulb, Award, Users, Globe, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/stores/auth-store';
import { Navbar } from '@/components/landing/navbar';
import { Footer } from '@/components/landing/footer';

const values = [
  {
    icon: Target,
    title: 'Foco no resultado',
    description: 'Nossos cursos são projetados para gerar resultados reais na carreira dos nossos alunos. Cada projeto prático simula desafios do mercado de trabalho, preparando profissionais completos e prontos para atuar desde o primeiro dia.',
  },
  {
    icon: Heart,
    title: 'Paixão por ensinar',
    description: 'Acreditamos que a educação transforma vidas. Nossa equipe de instrutores é formada por profissionais apaixonados que combinam experiência de mercado com didática comprovada, tornando o aprendizado envolvente e eficaz.',
  },
  {
    icon: Lightbulb,
    title: 'Inovação constante',
    description: 'O mercado de tecnologia evolui rapidamente e nós acompanhamos essa velocidade. Atualizamos nossos conteúdos continuamente para refletir as tendências mais recentes, ferramentas emergentes e melhores práticas da indústria.',
  },
  {
    icon: Award,
    title: 'Qualidade garantida',
    description: 'Cada curso passa por um rigoroso processo de curadoria e revisão. Trabalhamos com metodologias de ensino baseadas em evidências, garantindo que o conteúdo seja não apenas relevante, mas também efetivo na construção de habilidades sólidas.',
  },
];

const team = [
  { name: 'Ana Rodrigues', role: 'CEO & Co-fundadora', bio: 'Engenheira de software com 15 anos de experiência em empresas como Google e Nubank. Apaixonada por democratizar o acesso à educação em tecnologia no Brasil.' },
  { name: 'Carlos Mendes', role: 'CTO & Co-fundador', bio: 'Arquiteto de sistemas com expertise em cloud computing e DevOps. Liderou equipes de engenharia em startups de alta escala antes de fundar a TechCRM.' },
  { name: 'Juliana Costa', role: 'Diretora de Conteúdo', bio: 'Mestra em educação tecnológica e ex-professora universitária. Responsável pela curadoria e metodologia de ensino de todos os cursos da plataforma.' },
  { name: 'Rafael Lima', role: 'Head de Comunidade', bio: 'Community builder com experiência em ecossistemas de tecnologia. Gerencia os programas de mentoria, eventos e a rede de mais de 10.000 profissionais.' },
];

const milestones = [
  { year: '2020', title: 'Fundação', description: 'TechCRM nasce com a missão de transformar carreiras em tecnologia' },
  { year: '2021', title: '1.000 alunos', description: 'Alcançamos nosso primeiro marco de mil alunos ativos na plataforma' },
  { year: '2022', title: 'Expansão de cursos', description: 'Lançamento dos cursos de DevOps, Dados e IA, ampliando o catálogo' },
  { year: '2023', title: '5.000 alunos', description: 'Consolidação como referência em educação tecnológica no Brasil' },
  { year: '2024', title: 'Parcerias corporativas', description: 'Programas de treinamento para empresas como Itaú, Ambev e Magazine Luiza' },
  { year: '2025', title: '10.000+ alunos', description: 'Marco histórico com comunidade ativa em todo o Brasil e certificações reconhecidas' },
];

export function SobrePage() {
  const setView = useAuthStore((s) => s.setView);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-white via-emerald-50/40 to-teal-50/30 dark:from-background dark:via-background dark:to-emerald-950/10 py-20 sm:py-28">
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl" />
            <div className="absolute right-10 top-40 h-56 w-56 rounded-full bg-teal-200/25 blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400">
              <Globe className="size-4" />
              Nossa história
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Sobre a{' '}
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 bg-clip-text text-transparent">
                TechCRM
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              Nascemos da crença de que toda pessoa merece acesso à educação de qualidade em tecnologia. Desde 2020, temos transformado carreiras e formado profissionais que lideram a revolução digital no Brasil.
            </p>
          </div>
        </section>

        {/* Missão / Visão / Valores */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Nossos valores</h2>
              <p className="mt-4 text-lg text-muted-foreground">Os pilares que guiam tudo o que fazemos</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((item) => {
                const Icon = item.icon;
                return (
                  <Card key={item.title} className="group border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-500/5">
                    <CardContent className="pt-6">
                      <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-emerald-500/10 transition-colors group-hover:bg-emerald-500/20">
                        <Icon className="size-6 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <h3 className="mb-2 text-lg font-semibold text-foreground">{item.title}</h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="bg-muted/30 py-16 sm:py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Nossa trajetória</h2>
              <p className="mt-4 text-lg text-muted-foreground">Uma história de crescimento e impacto</p>
            </div>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-emerald-200 dark:bg-emerald-800/50 md:left-1/2 md:-translate-x-0.5" />
              <div className="space-y-8">
                {milestones.map((item, i) => (
                  <div key={item.year} className={`relative flex items-start gap-6 md:gap-0 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                    <div className="absolute left-4 -translate-x-1/2 flex size-8 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white shadow-md md:left-1/2">
                      {item.year.slice(-2)}
                    </div>
                    <div className={`ml-12 md:ml-0 md:w-1/2 ${i % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                      <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{item.year}</span>
                      <h3 className="text-lg font-bold text-foreground">{item.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Equipe */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Nossa equipe</h2>
              <p className="mt-4 text-lg text-muted-foreground">Profissionais que fazem a diferença</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {team.map((person) => (
                <Card key={person.name} className="group border-border/50 text-center transition-all duration-300 hover:border-emerald-300 hover:shadow-lg">
                  <CardContent className="pt-8 pb-6">
                    <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-xl font-bold text-white shadow-lg">
                      {person.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">{person.name}</h3>
                    <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{person.role}</p>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{person.bio}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Números */}
        <section className="bg-gradient-to-r from-emerald-600 to-teal-600 py-16 sm:py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 text-center">
              {[
                { value: '10.000+', label: 'Alunos ativos' },
                { value: '50+', label: 'Cursos disponíveis' },
                { value: '95%', label: 'Taxa de satisfação' },
                { value: '200+', label: 'Empresas parceiras' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-4xl font-extrabold text-white">{stat.value}</p>
                  <p className="mt-2 text-emerald-100 font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
            <Users className="mx-auto mb-6 size-12 text-emerald-500" />
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Faça parte da nossa comunidade</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Junte-se a milhares de profissionais que estão transformando suas carreiras com a TechCRM. Comece hoje mesmo sua jornada em tecnologia.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                onClick={() => setView('register')}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 px-8 text-base font-semibold text-white shadow-lg hover:shadow-xl hover:brightness-110"
              >
                Começar agora
                <ArrowRight className="ml-1 size-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setView('login')}
                className="px-8 text-base font-semibold"
              >
                Já tenho conta
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
