'use client'

import { useState } from 'react'
import { useAuthStore } from '@/store/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import {
  TrendingUp,
  DollarSign,
  Users,
  BarChart3,
  Zap,
  Globe,
  ArrowRight,
  CheckCircle2,
  Star,
  Calendar,
  Clock,
  ChevronRight,
  Quote,
  Sun,
  Moon,
  Menu,
  X,
  Mail,
} from 'lucide-react'

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' },
  }),
}

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
}

export function LandingPage() {
  const { setShowLoginDialog } = useAuthStore()
  const { theme, setTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactMessage, setContactMessage] = useState('')
  const [contactSent, setContactSent] = useState(false)

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setContactSent(true)
    setContactName('')
    setContactEmail('')
    setContactMessage('')
    setTimeout(() => setContactSent(false), 4000)
  }

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ============ NAVBAR ============ */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center size-9 rounded-lg bg-emerald-600 text-white">
                <TrendingUp className="size-5" />
              </div>
              <span className="text-lg font-bold text-foreground">FinanceFlow</span>
            </div>

            <div className="hidden md:flex items-center gap-6">
              {[
                { label: 'Sobre', id: 'sobre' },
                { label: 'Serviços', id: 'servicos' },
                { label: 'Blog', id: 'blog' },
                { label: 'Contato', id: 'contato' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="size-9"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Alternar tema</span>
              </Button>

              <Button
                variant="ghost"
                className="hidden md:inline-flex"
                onClick={() => setShowLoginDialog(true)}
              >
                Entrar
              </Button>
              <Button
                className="hidden md:inline-flex bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => setShowLoginDialog(true)}
              >
                Começar Grátis
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
              </Button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background">
            <div className="px-4 py-3 space-y-1">
              {[
                { label: 'Sobre', id: 'sobre' },
                { label: 'Serviços', id: 'servicos' },
                { label: 'Blog', id: 'blog' },
                { label: 'Contato', id: 'contato' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="block w-full text-left px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  {item.label}
                </button>
              ))}
              <Separator className="my-2" />
              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => {
                  setMobileMenuOpen(false)
                  setShowLoginDialog(true)
                }}
              >
                Começar Grátis
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* ============ HERO ============ */}
      <section className="pt-32 pb-20 lg:pt-40 lg:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            <motion.div variants={fadeInUp} custom={0}>
              <Badge className="mb-6 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-100">
                Novo — CRM Financeiro Inteligente
              </Badge>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              custom={1}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-tight"
            >
              Controle suas finanças{' '}
              <span className="text-emerald-600 dark:text-emerald-400">com inteligência</span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              custom={2}
              className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            >
              Plataforma completa de gestão financeira e CRM. Organize contas a pagar e receber,
              acompanhe comissões, gerencie clientes e automatize seu fluxo de caixa.
            </motion.p>

            <motion.div variants={fadeInUp} custom={3} className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-700 text-white h-12 px-8 text-base font-semibold"
                onClick={() => setShowLoginDialog(true)}
              >
                Começar Agora — É Grátis
                <ArrowRight className="ml-2 size-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 text-base"
                onClick={() => scrollToSection('sobre')}
              >
                Saiba Mais
              </Button>
            </motion.div>

            <motion.div variants={fadeInUp} custom={4} className="mt-14 flex flex-col items-center gap-4">
              <div className="flex -space-x-3">
                {['CA', 'AF', 'PV', 'JO'].map((initials, i) => (
                  <div
                    key={i}
                    className="size-10 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold border-2 border-background"
                  >
                    {initials}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="size-4 fill-amber-400 text-amber-400" />
                ))}
                <span className="ml-2 text-sm text-muted-foreground">
                  <strong className="text-foreground">+2.000</strong> empresas já usam
                </span>
              </div>
            </motion.div>
          </motion.div>

          {/* Hero visual - Dashboard preview */}
          <motion.div
            className="mt-16 lg:mt-20"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <div className="relative rounded-2xl border bg-card shadow-2xl shadow-emerald-500/5 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent" />
              <div className="p-6 sm:p-8 lg:p-10">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: 'Receita Mensal', value: 'R$ 69.700', icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' },
                    { label: 'Contas Pagas', value: '14', icon: CheckCircle2, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
                    { label: 'Pendentes', value: '20', icon: Clock, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' },
                    { label: 'Clientes Ativos', value: '8', icon: Users, color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl border bg-background p-4">
                      <div className={`size-9 rounded-lg ${item.color} flex items-center justify-center mb-3`}>
                        <item.icon className="size-4" />
                      </div>
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="text-lg font-bold mt-0.5">{item.value}</p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-xl border bg-background p-5 h-48 flex flex-col">
                    <p className="text-sm font-medium mb-3">Entradas vs Saídas</p>
                    <div className="flex-1 flex items-end gap-2">
                      {[35, 55, 40, 70, 85, 60, 45, 90, 65, 75, 55, 80].map((h, i) => (
                        <div key={i} className="flex-1 flex gap-0.5 items-end">
                          <div className="flex-1 bg-emerald-400 rounded-sm" style={{ height: `${h}%` }} />
                          <div className="flex-1 bg-red-300 dark:bg-red-400/60 rounded-sm" style={{ height: `${h * 0.6}%` }} />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border bg-background p-5 h-48 flex flex-col">
                    <p className="text-sm font-medium mb-3">Fluxo de Caixa</p>
                    <div className="flex-1 relative">
                      <svg className="w-full h-full" viewBox="0 0 200 100" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="flowGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="currentColor" className="text-emerald-500" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="currentColor" className="text-emerald-500" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <path d="M0,80 Q30,60 50,50 T100,30 T150,45 T200,20 L200,100 L0,100 Z" fill="url(#flowGrad)" />
                        <path d="M0,80 Q30,60 50,50 T100,30 T150,45 T200,20" fill="none" stroke="currentColor" className="text-emerald-500" strokeWidth="2" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Separator />

      {/* ============ SOBRE ============ */}
      <section id="sobre" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="mb-4 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                Sobre Nós
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                Transformamos a gestão financeira do seu negócio
              </h2>
              <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
                O FinanceFlow nasceu da necessidade de centralizar o controle financeiro de pequenas e médias
                empresas brasileiras. Nossa plataforma combina a poderosidade de um ERP com a simplicidade
                que equipes de todos os níveis precisam.
              </p>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Com mais de 5 anos de experiência no mercado financeiro, desenvolvemos uma solução que
                automatiza processos repetitivos, oferece visibilidade total do fluxo de caixa e permite
                tomadas de decisão baseadas em dados reais. Tudo isso com uma interface moderna e intuitiva
                que sua equipe vai adorar.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-6">
                {[
                  { value: '2.000+', label: 'Empresas ativas' },
                  { value: 'R$ 500M+', label: 'Gerenciados/mês' },
                  { value: '99.9%', label: 'Uptime garantido' },
                  { value: '4.9/5', label: 'Avaliação média' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stat.value}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-4"
            >
              {[
                {
                  icon: DollarSign,
                  title: 'Controle Financeiro Centralizado',
                  desc: 'Gerencie contas a pagar e receber, acompanhe fluxo de caixa e mantenha o controle total das suas finanças em um único painel.',
                  color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20',
                },
                {
                  icon: Users,
                  title: 'Gestão de Clientes Integrada',
                  desc: 'Cadastre clientes, visualize histórico financeiro completo e mantenha o relacionamento organizado para fidelizar sua base.',
                  color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20',
                },
                {
                  icon: BarChart3,
                  title: 'Relatórios e Dashboards',
                  desc: 'Visualize dados em gráficos interativos, exporte relatórios detalhados e tome decisões estratégicas com informações em tempo real.',
                  color: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20',
                },
                {
                  icon: Zap,
                  title: 'Automações Inteligentes',
                  desc: 'Configure regras automáticas para lembretes de vencimento, cálculo de comissões e notificações de status.',
                  color: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20',
                },
              ].map((item) => (
                <Card key={item.title} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-5 flex gap-4">
                    <div className={`size-10 rounded-lg ${item.color} flex items-center justify-center shrink-0`}>
                      <item.icon className="size-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{item.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <Separator />

      {/* ============ SERVIÇOS ============ */}
      <section id="servicos" className="py-20 lg:py-28 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center max-w-2xl mx-auto mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Badge className="mb-4 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
              Nossos Serviços
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Tudo que você precisa para gerenciar suas finanças
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Ferramentas profissionais integradas para impulsionar o crescimento do seu negócio.
            </p>
          </motion.div>

          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            {[
              {
                icon: DollarSign,
                title: 'Contas a Pagar & Receber',
                desc: 'Controle total de entradas e saídas com filtros avançados, alertas de vencimento e categorização automática por plano de contas.',
                features: ['Filtros por período e status', 'Parcelamentos ilimitados', 'Recorrências automáticas'],
              },
              {
                icon: BarChart3,
                title: 'Dashboard Inteligente',
                desc: 'Visualize KPIs em tempo real com gráficos interativos de receitas, despesas e fluxo de caixa mensal.',
                features: ['Gráficos de barras e área', 'KPIs financeiros', 'Dados em tempo real'],
              },
              {
                icon: Users,
                title: 'Gestão de Clientes',
                desc: 'CRM completo com cadastro detalhado, histórico financeiro por cliente e sistema de tags para segmentação.',
                features: ['Ficha completa do cliente', 'Histórico de transações', 'Tags personalizáveis'],
              },
              {
                icon: Star,
                title: 'Sistema de Comissões',
                desc: 'Calcule comissões automaticamente por vendedor com percentuais personalizáveis e relatórios detalhados.',
                features: ['Cálculo automático', 'Relatórios por vendedor', 'Multi-perfil de acesso'],
              },
              {
                icon: Zap,
                title: 'Automações',
                desc: 'Configure regras inteligentes para notificações, mudanças de status e cálculos automáticos baseados em eventos.',
                features: ['Lembretes de vencimento', 'Regras de status', 'Notificações automáticas'],
              },
              {
                icon: Globe,
                title: 'Multi-Empresa & Multi-Tenant',
                desc: 'Arquitetura preparada para atender múltiplas empresas com isolamento completo de dados e permissões granulares.',
                features: ['Isolamento de dados', 'Permissões por módulo', 'API REST completa'],
              },
            ].map((service, i) => (
              <motion.div key={service.title} variants={fadeInUp} custom={i}>
                <Card className="h-full border hover:border-emerald-200 dark:hover:border-emerald-800 hover:shadow-lg transition-all group">
                  <CardContent className="p-6">
                    <div className="size-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <service.icon className="size-6" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{service.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">{service.desc}</p>
                    <ul className="space-y-2">
                      {service.features.map((feat) => (
                        <li key={feat} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                          <span className="text-muted-foreground">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============ BLOG ============ */}
      <section id="blog" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center max-w-2xl mx-auto mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Badge className="mb-4 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
              Blog
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Conteúdo para impulsionar suas finanças
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Dicas, tutoriais e novidades do mundo financeiro para você se manter sempre atualizado.
            </p>
          </motion.div>

          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            {[
              {
                tag: 'Gestão Financeira',
                date: '28 Abr 2026',
                title: '5 Dicas para Organizar o Fluxo de Caixa da Sua Empresa',
                excerpt: 'Aprenda práticas essenciais para manter o controle das entradas e saídas e evitar surpresas no fim do mês.',
                readTime: '5 min',
              },
              {
                tag: 'CRM',
                date: '22 Abr 2026',
                title: 'Como um CRM Financeiro Pode Duplicar Suas Receitas',
                excerpt: 'Descubra como a integração entre gestão de clientes e controle financeiro pode transformar seus resultados.',
                readTime: '7 min',
              },
              {
                tag: 'Automação',
                date: '15 Abr 2026',
                title: 'Automatize suas Finanças: Guia Completo para Pequenas Empresas',
                excerpt: 'Um guia passo a passo para implementar automações financeiras e economizar horas de trabalho manual.',
                readTime: '8 min',
              },
              {
                tag: 'Dicas',
                date: '08 Abr 2026',
                title: 'Erro Fatal: 3 Coisas que Você Nunca Deve Fazer com suas Contas',
                excerpt: 'Evite os erros mais comuns que pequenas empresas cometem na gestão financeira e proteja seu caixa.',
                readTime: '4 min',
              },
              {
                tag: 'Tecnologia',
                date: '01 Abr 2026',
                title: 'SaaS Financeiro: Por Que Mudar do Excel para um Sistema Profissional',
                excerpt: 'Compare planilhas com plataformas profissionais e entenda por que a migração é essencial para crescer.',
                readTime: '6 min',
              },
              {
                tag: 'Comissões',
                date: '25 Mar 2026',
                title: 'Cálculo de Comissões: Como Motivar sua Equipe de Vendas',
                excerpt: 'Estratégias para definir comissões justas e transparentes que incentivam produtividade e retenção.',
                readTime: '5 min',
              },
            ].map((post, i) => (
              <motion.div key={post.title} variants={fadeInUp} custom={i}>
                <Card className="h-full border hover:shadow-lg transition-all group cursor-pointer overflow-hidden">
                  <CardContent className="p-0">
                    <div className="h-40 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900/30 flex items-center justify-center">
                      <div className="text-center px-6">
                        <Badge className="bg-white/80 dark:bg-black/30 text-emerald-700 dark:text-emerald-300 hover:bg-white/80">
                          {post.tag}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                        <Calendar className="size-3" />
                        {post.date}
                        <span className="mx-1">·</span>
                        <Clock className="size-3" />
                        {post.readTime}
                      </div>
                      <h3 className="font-semibold leading-snug mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                        {post.excerpt}
                      </p>
                      <button className="mt-4 text-sm font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:gap-2 transition-all">
                        Ler mais <ChevronRight className="size-4" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <Separator />

      {/* ============ CONTATO ============ */}
      <section id="contato" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="mb-4 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                Contato
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Fale com nossa equipe
              </h2>
              <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
                Tem alguma dúvida ou quer saber mais sobre o FinanceFlow? Envie uma mensagem e
                nossa equipe entrará em contato em até 24 horas.
              </p>

              <div className="mt-8 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center shrink-0">
                    <Mail className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">E-mail</p>
                    <p className="font-medium">contato@financeflow.com.br</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center shrink-0">
                    <Clock className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Horário de atendimento</p>
                    <p className="font-medium">Segunda a Sexta, 9h às 18h (BRT)</p>
                  </div>
                </div>
              </div>

              <Card className="mt-10 border-0 bg-muted/30">
                <CardContent className="p-6">
                  <Quote className="size-6 text-emerald-500 mb-3" />
                  <p className="text-sm leading-relaxed italic text-muted-foreground">
                    &ldquo;O FinanceFlow transformou completamente a gestão financeira da nossa empresa.
                    Reduzimos o tempo de controle de contas em 70% e temos muito mais visibilidade
                    do nosso fluxo de caixa.&rdquo;
                  </p>
                  <div className="flex items-center gap-3 mt-4">
                    <div className="size-9 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                      MS
                    </div>
                    <div>
                      <p className="text-sm font-medium">Maria Silva</p>
                      <p className="text-xs text-muted-foreground">CEO, Tech Solutions Ltda</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="border shadow-sm">
                <CardContent className="p-6 sm:p-8">
                  {contactSent ? (
                    <div className="text-center py-8">
                      <div className="size-16 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="size-8" />
                      </div>
                      <h3 className="text-lg font-semibold">Mensagem enviada!</h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        Obrigado pelo contato. Nossa equipe responderá em até 24 horas.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="space-y-5">
                      <div className="space-y-2">
                        <Label htmlFor="contact-name">Nome completo</Label>
                        <Input id="contact-name" placeholder="Seu nome" value={contactName} onChange={(e) => setContactName(e.target.value)} className="h-11" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact-email">E-mail</Label>
                        <Input id="contact-email" type="email" placeholder="seu@email.com" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="h-11" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact-message">Mensagem</Label>
                        <Textarea id="contact-message" placeholder="Como podemos ajudar?" value={contactMessage} onChange={(e) => setContactMessage(e.target.value)} className="min-h-[120px] resize-none" required />
                      </div>
                      <Button type="submit" className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                        Enviar Mensagem
                        <ArrowRight className="ml-2 size-4" />
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="border-t bg-muted/30 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="size-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                  <TrendingUp className="size-4" />
                </div>
                <span className="font-bold">FinanceFlow</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Plataforma de gestão financeira e CRM para empresas que querem crescer com inteligência.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Produto</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {['Dashboard', 'Financeiro', 'Clientes', 'Comissões', 'Relatórios'].map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Empresa</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {['Sobre Nós', 'Blog', 'Carreiras', 'Contato', 'Parceiros'].map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {['Termos de Uso', 'Política de Privacidade', 'LGPD', 'Cookies'].map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
          <Separator className="my-8" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>2026 FinanceFlow. Todos os direitos reservados.</p>
            <p>Feito com <span className="text-red-500">&hearts;</span> no Brasil</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
