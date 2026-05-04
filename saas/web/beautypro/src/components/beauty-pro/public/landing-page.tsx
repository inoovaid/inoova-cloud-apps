'use client';

import { useAppStore } from '@/lib/store';
import { useTestimonials } from '@/lib/hooks';
import { formatBRL } from '@/lib/hooks';
import { motion } from 'framer-motion';
import {
  CalendarCheck,
  Clock,
  Users,
  Award,
  ShoppingBag,
  MessageCircle,
  Smartphone,
  Star,
  ChevronRight,
  Sparkles,
  Heart,
  Instagram,
  Facebook,
  Youtube,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.5 },
};

const staggerContainer = {
  initial: {},
  whileInView: { transition: { staggerChildren: 0.1 } },
  viewport: { once: true },
};

const staggerItem = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

const features = [
  {
    icon: CalendarCheck,
    title: 'Agendamento Online',
    description: 'Agende 24h pelo site ou app. Sem ligação, sem espera.',
  },
  {
    icon: Users,
    title: 'Profissionais Especializados',
    description: 'Equipe certificada e em constante atualização.',
  },
  {
    icon: Award,
    title: 'Produtos Premium',
    description: 'L\'Oréal, Kerastase, Wella e as melhores marcas do mercado.',
  },
  {
    icon: Heart,
    title: 'Programa Fidelidade',
    description: 'Acumule pontos a cada visita e ganhe descontos exclusivos.',
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp Integrado',
    description: 'Confirme, reagende ou tire dúvidas direto pelo WhatsApp.',
  },
  {
    icon: Smartphone,
    title: 'App Exclusiva',
    description: 'Gerencie seus agendamentos e pontos pelo celular.',
  },
];

const topServices = [
  { name: 'Corte Feminino', duration: '60 min', price: 80, category: 'Cabelo' },
  { name: 'Coloração', duration: '120 min', price: 150, category: 'Cabelo' },
  { name: 'Manicure', duration: '45 min', price: 40, category: 'Unhas' },
  { name: 'Limpeza de Pele', duration: '60 min', price: 120, category: 'Estética' },
];

export function LandingPage() {
  const { setPublicPage } = useAppStore();
  const { data: testimonials = [] } = useTestimonials();

  const { data: services } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const res = await fetch('/api/services');
      if (!res.ok) throw new Error('Failed to fetch services');
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  // Get top 4 services from all categories
  const allServices: any[] = [];
  if (services) {
    Object.values(services).forEach((catServices: any) => {
      catServices.forEach((s: any) => allServices.push(s));
    });
  }
  const displayServices = allServices.slice(0, 4).length > 0
    ? allServices.slice(0, 4)
    : topServices;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-beauty-pink-light/20 dark:from-primary/20 dark:via-primary/10 dark:to-beauty-pink-dark/20">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-1/2 -left-1/4 w-[600px] h-[600px] rounded-full bg-beauty-pink-light/10 dark:bg-beauty-pink-dark/10 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
          <motion.div
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-6"
            >
              <Sparkles className="w-4 h-4" />
              Studio Beauty São Bento
            </motion.div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-6">
              Transforme sua beleza{' '}
              <span className="text-primary">com quem entende</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Cuidamos de você com profissionais especializados, produtos premium e
              tecnologia que facilita sua vida. Agende online em segundos!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => setPublicPage('booking')}
                className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 text-base px-8 py-6"
              >
                <CalendarCheck className="w-5 h-5" />
                Agendar Agora
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setPublicPage('services')}
                className="gap-2 text-base px-8 py-6"
              >
                Conheça Nossos Serviços
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                4.9/5 avaliações
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                2.000+ clientes
              </span>
              <span className="flex items-center gap-1.5">
                <Award className="w-4 h-4" />
                5 anos de mercado
              </span>
            </div>
          </motion.div>

          {/* Decorative Elements */}
          <motion.div
            className="hidden lg:block absolute right-12 top-1/2 -translate-y-1/2 text-8xl opacity-10"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 0.1, x: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            ✂️
          </motion.div>
          <motion.div
            className="hidden lg:block absolute left-12 bottom-12 text-6xl opacity-10"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 0.1, x: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
          >
            💇‍♀️
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            {...fadeInUp}
          >
            <Badge variant="secondary" className="mb-3">Por que nos escolher</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Tudo que você precisa em um só lugar
            </h2>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
              Combinamos tecnologia e talento para oferecer a melhor experiência em beleza
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            {...staggerContainer}
          >
            {features.map((feature) => (
              <motion.div key={feature.title} {...staggerItem}>
                <Card className="h-full border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300 group">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            {...fadeInUp}
          >
            <Badge variant="secondary" className="mb-3">Nossos Serviços</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Serviços que amamos fazer
            </h2>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            {...staggerContainer}
          >
            {displayServices.map((service: any, i: number) => (
              <motion.div key={service.id || i} {...staggerItem}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 group cursor-pointer"
                  onClick={() => {
                    if (service.id) {
                      useAppStore.getState().setBookingServiceId(service.id);
                    }
                    setPublicPage('booking');
                  }}
                >
                  <CardContent className="p-6">
                    <Badge variant="outline" className="mb-3 text-xs">
                      {service.category || 'Serviço'}
                    </Badge>
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                      {service.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <Clock className="w-4 h-4" />
                      {service.duration} min
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-primary">
                        {formatBRL(service.price)}
                      </span>
                      <Button size="sm" variant="ghost" className="text-primary gap-1 group-hover:gap-2 transition-all">
                        Agendar <ChevronRight className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="text-center mt-8"
            {...fadeInUp}
          >
            <Button
              variant="outline"
              size="lg"
              onClick={() => setPublicPage('services')}
              className="gap-2"
            >
              Ver Todos os Serviços
              <ChevronRight className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            {...fadeInUp}
          >
            <Badge variant="secondary" className="mb-3">Depoimentos</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              O que nossos clientes dizem
            </h2>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            {...staggerContainer}
          >
            {(testimonials.length > 0 ? testimonials : []).slice(0, 3).map((t: any) => (
              <motion.div key={t.id} {...staggerItem}>
                <Card className="h-full border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-1 mb-4">
                      {Array.from({ length: t.rating || 5 }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-sm leading-relaxed mb-4 text-muted-foreground">
                      &ldquo;{t.content}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                        {t.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            {testimonials.length === 0 && (
              <div className="col-span-3 text-center text-muted-foreground py-8">
                Carregando depoimentos...
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/10 via-primary/5 to-beauty-pink-light/20 dark:from-primary/20 dark:via-primary/10 dark:to-beauty-pink-dark/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div {...fadeInUp}>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Pronta para se sentir incrível? ✨
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Agende agora mesmo e descubra por que mais de 2.000 clientes nos escolhem
              como seu salão de beleza favorito.
            </p>
            <Button
              size="lg"
              onClick={() => setPublicPage('booking')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 text-base px-10 py-6"
            >
              <CalendarCheck className="w-5 h-5" />
              Agendar Horário
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <span className="text-lg font-bold">
                  Beauty<span className="text-primary">Pro</span>
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Plataforma completa para gestão de salões de beleza.
              </p>
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Instagram className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Facebook className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Youtube className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-sm font-semibold mb-3">Navegação</h4>
              <div className="flex flex-col gap-2">
                {['landing', 'about', 'services', 'blog', 'contact'].map((page) => (
                  <button
                    key={page}
                    onClick={() => setPublicPage(page as any)}
                    className="text-sm text-muted-foreground hover:text-foreground text-left transition-colors"
                  >
                    {page === 'landing' ? 'Início' : page === 'about' ? 'Sobre' : page === 'services' ? 'Serviços' : page === 'blog' ? 'Blog' : 'Contato'}
                  </button>
                ))}
              </div>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-sm font-semibold mb-3">Serviços</h4>
              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <span>Corte Feminino</span>
                <span>Coloração</span>
                <span>Manicure & Pedicure</span>
                <span>Estética Facial</span>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-sm font-semibold mb-3">Contato</h4>
              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <span>(11) 3456-7890</span>
                <span>contato@studiobeauty.com.br</span>
                <span>Rua Augusta, 1200</span>
                <span>Consolação, São Paulo - SP</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              Feito com ❤️ por BeautyPro © {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
