'use client';

import { useAppStore } from '@/lib/store';
import { motion } from 'framer-motion';
import {
  CalendarCheck,
  Heart,
  Target,
  Eye,
  Sparkles,
  Scissors,
  Star,
  Award,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useProfessionals } from '@/lib/hooks';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' } as any,
  transition: { duration: 0.5 },
};

const staggerItem = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
  viewport: { once: true } as any,
};

const timeline = [
  {
    year: '2020',
    title: 'O Início',
    description: 'Patrícia Santos abre o Studio Beauty com uma visão: unir tecnologia e talento para transformar a experiência de beleza.',
  },
  {
    year: '2021',
    title: 'Crescimento',
    description: 'A equipe cresce para 3 profissionais e mais de 500 clientes atendidos. Lançamos o programa de fidelidade.',
  },
  {
    year: '2022',
    title: 'Expansão',
    description: 'Implementamos o agendamento online e WhatsApp integrado. A base de clientes ultrapassa 1.000.',
  },
  {
    year: '2023',
    title: 'Inovação',
    description: 'Lançamos o app exclusivo e sistema de automações. Reconhecimento como melhor salão da região.',
  },
  {
    year: '2024',
    title: 'Consolidação',
    description: 'Mais de 2.000 clientes ativos, 5 profissionais e expansão para novos serviços de estética.',
  },
  {
    year: '2025',
    title: 'Futuro',
    description: 'Implementação do Smart AI e expansão para novas unidades. O melhor ainda está por vir!',
  },
];

const values = [
  {
    icon: Heart,
    title: 'Paixão',
    description: 'Amamos o que fazemos e isso se reflete em cada detalhe do nosso atendimento.',
  },
  {
    icon: Target,
    title: 'Excelência',
    description: 'Buscamos sempre a perfeição, desde o corte mais simples ao tratamento mais complexo.',
  },
  {
    icon: Eye,
    title: 'Inovação',
    description: 'Estamos sempre à frente, trazendo as últimas tendências e tecnologias para você.',
  },
  {
    icon: Sparkles,
    title: 'Cuidado',
    description: 'Cada cliente é única. Personalizamos cada experiência para suas necessidades.',
  },
];

const professionalColors: Record<string, string> = {
  'pro_01': 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400',
  'pro_02': 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  'pro_03': 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
  'pro_04': 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
  'pro_05': 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400',
};

export function AboutPage() {
  const { setPublicPage } = useAppStore();
  const { data: professionals = [] } = useProfessionals();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-beauty-pink-light/20 dark:from-primary/20 dark:via-primary/10 dark:to-beauty-pink-dark/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <motion.div
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="secondary" className="mb-4">Sobre Nós</Badge>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
              Nossa <span className="text-primary">História</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Há 5 anos transformando vidas através da beleza. Conheça a equipe
              e os valores que fazem do Studio Beauty referência em São Paulo.
            </p>
          </motion.div>

          {/* Image placeholder */}
          <motion.div
            className="mt-12 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-beauty-pink-light/30 dark:from-primary/30 dark:to-beauty-pink-dark/20 h-64 sm:h-80 flex items-center justify-center">
              <div className="text-center">
                <Scissors className="w-16 h-16 text-primary/40 mx-auto mb-4" />
                <p className="text-lg font-medium text-primary/60">Studio Beauty São Bento</p>
                <p className="text-sm text-primary/40">Rua Augusta, 1200 - Consolação</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-12" {...fadeInUp}>
            <Badge variant="secondary" className="mb-3">Nossa Jornada</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Uma história de paixão e dedicação
            </h2>
          </motion.div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-primary/20 -translate-x-1/2" />

            <div className="space-y-8">
              {timeline.map((item, i) => (
                <motion.div
                  key={item.year}
                  className="relative flex items-start gap-6 md:gap-0"
                  initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  {/* Dot */}
                  <div className="absolute left-4 md:left-1/2 w-3 h-3 bg-primary rounded-full -translate-x-1/2 mt-1.5 z-10 ring-4 ring-background" />

                  {/* Content */}
                  <div className={cn(
                    'ml-10 md:ml-0 md:w-[calc(50%-2rem)]',
                    i % 2 === 0 ? 'md:pr-8 md:text-right' : 'md:ml-auto md:pl-8'
                  )}>
                    <Badge className="mb-2 bg-primary/10 text-primary hover:bg-primary/20">
                      {item.year}
                    </Badge>
                    <h3 className="text-lg font-semibold mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-12" {...fadeInUp}>
            <Badge variant="secondary" className="mb-3">Nossa Equipe</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Profissionais que fazem a diferença
            </h2>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
              Cada membro da nossa equipe é especialista em sua área
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {professionals.map((pro, i) => (
              <motion.div
                key={pro.id}
                {...staggerItem}
                transition={{ ...staggerItem.transition, delay: i * 0.1 }}
              >
                <Card className="text-center hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <Avatar className="w-20 h-20 mx-auto mb-4">
                      <AvatarFallback
                        className={cn(
                          'text-xl font-bold',
                          professionalColors[pro.id] || 'bg-primary/10 text-primary'
                        )}
                      >
                        {pro.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-semibold mb-1">{pro.name}</h3>
                    <Badge variant="outline" className="text-xs">
                      {pro.specialty || 'Profissional'}
                    </Badge>
                    <div className="flex items-center justify-center gap-1 mt-3">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} className="w-3 h-3 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-12" {...fadeInUp}>
            <Badge variant="secondary" className="mb-3">Nossos Valores</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              O que nos move
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, i) => (
              <motion.div
                key={value.title}
                {...staggerItem}
                transition={{ ...staggerItem.transition, delay: i * 0.1 }}
              >
                <Card className="h-full text-center hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <value.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                    <p className="text-sm text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-primary/10 via-primary/5 to-beauty-pink-light/20 dark:from-primary/20 dark:via-primary/10 dark:to-beauty-pink-dark/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div {...fadeInUp}>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Venha nos conhecer de perto 💇‍♀️
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Agende uma visita e descubra por que somos referência em beleza e bem-estar.
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
    </div>
  );
}

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ');
}
