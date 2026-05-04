'use client';

import { useState } from 'react';
import { BookOpen, Clock, Tag, ArrowRight, Search, TrendingUp, Zap, Shield, Database, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores/auth-store';
import { Navbar } from '@/components/landing/navbar';
import { Footer } from '@/components/landing/footer';

const categories = [
  { label: 'Todos', value: 'all' },
  { label: 'Front-end', value: 'frontend' },
  { label: 'Back-end', value: 'backend' },
  { label: 'DevOps', value: 'devops' },
  { label: 'Dados', value: 'dados' },
  { label: 'IA', value: 'ia' },
  { label: 'Carreira', value: 'carreira' },
];

const blogPosts = [
  {
    id: 1,
    title: 'React 19: o que muda e como se preparar',
    excerpt: 'O React 19 traz mudanças significativas na forma como construímos aplicações. Conheça as novas APIs, o compiler automático e como migrar seus projetos sem dor de cabeça. Este guia completo mostra tudo que você precisa saber para estar pronto para a nova versão do framework mais usado do mundo.',
    category: 'frontend',
    author: 'Ana Rodrigues',
    date: '28 abr 2026',
    readTime: '8 min',
    featured: true,
  },
  {
    id: 2,
    title: 'APIs RESTful vs GraphQL: quando usar cada uma',
    excerpt: 'A escolha entre REST e GraphQL pode definir a arquitetura do seu projeto. Analisamos prós, contras, cenários ideais e exemplos práticos de implementação para ajudar você a tomar a melhor decisão técnica para cada situação.',
    category: 'backend',
    author: 'Carlos Mendes',
    date: '25 abr 2026',
    readTime: '10 min',
    featured: false,
  },
  {
    id: 3,
    title: 'Docker para iniciantes: guia completo 2026',
    excerpt: 'Containers revolucionaram a forma como deployamos aplicações. Este guia prático leva você do zero ao domínio do Docker, incluindo Docker Compose, multi-stage builds e melhores práticas de segurança para ambientes de produção.',
    category: 'devops',
    author: 'Rafael Lima',
    date: '22 abr 2026',
    readTime: '12 min',
    featured: false,
  },
  {
    id: 4,
    title: 'Machine Learning com Python: primeiros passos',
    excerpt: 'O Machine Learning está em toda parte e aprender os fundamentos nunca foi tão acessível. Este artigo apresenta os conceitos essenciais, bibliotecas principais e um projeto prático para você dar os primeiros passos na área de ciência de dados e inteligência artificial.',
    category: 'ia',
    author: 'Juliana Costa',
    date: '18 abr 2026',
    readTime: '9 min',
    featured: false,
  },
  {
    id: 5,
    title: 'Engenharia de Dados: a profissão mais procurada de 2026',
    excerpt: 'Com a explosão de dados nas empresas, o engenheiro de dados se tornou um dos profissionais mais valorizados do mercado. Descubra quais habilidades são necessárias, salários praticados e como iniciar nessa carreira promissora e em constante crescimento.',
    category: 'dados',
    author: 'Carlos Mendes',
    date: '15 abr 2026',
    readTime: '7 min',
    featured: false,
  },
  {
    id: 6,
    title: '5 tendências de tecnologia para o segundo semestre de 2026',
    excerpt: 'O mercado de tecnologia está em constante evolução. Analisamos as principais tendências que estão moldando o futuro da área, desde IA generativa até edge computing, e como você pode se posicionar para aproveitar essas oportunidades únicas de crescimento profissional.',
    category: 'carreira',
    author: 'Ana Rodrigues',
    date: '12 abr 2026',
    readTime: '6 min',
    featured: false,
  },
  {
    id: 7,
    title: 'TypeScript avançado: patterns que todo dev deve conhecer',
    excerpt: 'Domine os padrões avançados de TypeScript que elevam a qualidade do seu código. Desde generics até conditional types, este artigo aborda técnicas utilizadas por equipes seniores em projetos de grande escala para maximizar a segurança de tipos e a produtividade.',
    category: 'frontend',
    author: 'Juliana Costa',
    date: '08 abr 2026',
    readTime: '11 min',
    featured: false,
  },
  {
    id: 8,
    title: 'Kubernetes na prática: do pod ao production',
    excerpt: 'Kubernetes é o padrão da indústria para orquestração de containers. Este guia detalhado mostra como criar clusters, gerenciar deployments, configurar services e implementar monitoring para aplicações de produção com alta disponibilidade.',
    category: 'devops',
    author: 'Rafael Lima',
    date: '05 abr 2026',
    readTime: '15 min',
    featured: false,
  },
  {
    id: 9,
    title: 'Como conquistar sua primeira vaga em tecnologia',
    excerpt: 'Entrar no mercado de tecnologia pode parecer desafiador, mas com a estratégia certa é totalmente possível. Compartilhamos dicas práticas sobre portfólio, networking, entrevistas técnicas e como se destacar em um mercado competitivo e em constante crescimento.',
    category: 'carreira',
    author: 'Ana Rodrigues',
    date: '01 abr 2026',
    readTime: '8 min',
    featured: false,
  },
];

const categoryIcons: Record<string, React.ElementType> = {
  frontend: TrendingUp,
  backend: Zap,
  devops: Shield,
  dados: Database,
  ia: Brain,
  carreira: BookOpen,
};

export function BlogPage() {
  const setView = useAuthStore((s) => s.setView);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts = blogPosts.filter((post) => {
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredPost = blogPosts.find((p) => p.featured);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-white via-emerald-50/40 to-teal-50/30 dark:from-background dark:via-background dark:to-emerald-950/10 py-16 sm:py-20">
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl" />
            <div className="absolute right-10 top-40 h-56 w-56 rounded-full bg-teal-200/25 blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400">
              <BookOpen className="size-4" />
              Blog TechCRM
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              Artigos e{' '}
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 bg-clip-text text-transparent">
                novidades
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Fique por dentro das últimas tendências em tecnologia, tutoriais práticos e dicas de carreira. Conteúdo feito por profissionais para profissionais.
            </p>
          </div>
        </section>

        {/* Featured Post */}
        {featuredPost && (
          <section className="py-12">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
              <Card className="overflow-hidden border-border/50 bg-gradient-to-br from-emerald-50/50 to-teal-50/30 dark:from-emerald-950/20 dark:to-teal-950/10 hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-0 font-medium">
                      Destaque
                    </Badge>
                    <Badge variant="outline" className="text-xs capitalize">
                      {featuredPost.category}
                    </Badge>
                  </div>
                  <h2 className="text-2xl font-bold text-foreground sm:text-3xl mb-3">{featuredPost.title}</h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">{featuredPost.excerpt}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{featuredPost.author}</span>
                    <span>•</span>
                    <span>{featuredPost.date}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Clock className="size-3.5" />{featuredPost.readTime}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* Filters */}
        <section className="py-4">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <Button
                    key={cat.value}
                    variant={selectedCategory === cat.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(cat.value)}
                    className={selectedCategory === cat.value ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'cursor-pointer'}
                  >
                    {cat.label}
                  </Button>
                ))}
              </div>
              <div className="relative max-w-xs w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar artigos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Posts Grid */}
        <section className="py-8 pb-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            {filteredPosts.length === 0 ? (
              <div className="py-16 text-center">
                <BookOpen className="mx-auto mb-4 size-12 text-muted-foreground/40" />
                <h3 className="text-lg font-semibold text-foreground">Nenhum artigo encontrado</h3>
                <p className="mt-2 text-muted-foreground">Tente buscar por outro termo ou categoria</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredPosts.filter(p => !p.featured || selectedCategory !== 'all').map((post) => {
                  const CatIcon = categoryIcons[post.category] || BookOpen;
                  return (
                    <Card key={post.id} className="group border-border/50 transition-all duration-300 hover:border-emerald-300 hover:shadow-lg cursor-pointer">
                      <CardContent className="pt-6">
                        <div className="mb-3 flex items-center gap-2">
                          <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10">
                            <CatIcon className="size-4 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <Badge variant="outline" className="text-xs capitalize">{post.category}</Badge>
                        </div>
                        <h3 className="mb-2 text-lg font-semibold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="mb-4 text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{post.author}</span>
                          <div className="flex items-center gap-3">
                            <span>{post.date}</span>
                            <span className="flex items-center gap-1"><Clock className="size-3" />{post.readTime}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-muted/30 py-16">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Quer aprender na prática?</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Nossos cursos vão muito além da teoria. Aprenda construindo projetos reais com mentoria de profissionais do mercado.
            </p>
            <Button
              size="lg"
              onClick={() => setView('register')}
              className="mt-8 bg-gradient-to-r from-emerald-600 to-teal-600 px-8 text-base font-semibold text-white shadow-lg hover:shadow-xl hover:brightness-110"
            >
              Conhecer os cursos
              <ArrowRight className="ml-1 size-4" />
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
