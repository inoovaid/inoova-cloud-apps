'use client';

import { useAppStore } from '@/lib/store';
import { useQuery } from '@tanstack/react-query';
import { formatBRL } from '@/lib/hooks';
import { motion } from 'framer-motion';
import {
  Clock,
  CalendarCheck,
  Scissors,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' } as any,
  transition: { duration: 0.5 },
};

const categoryIcons: Record<string, string> = {
  'Cabelo': '💇‍♀️',
  'Unhas': '💅',
  'Estética': '✨',
  'Barba': '🧔',
  'Outros': '🌟',
};

export function ServicesPage() {
  const { setPublicPage, setBookingServiceId } = useAppStore();

  const { data: groupedServices, isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const res = await fetch('/api/services');
      if (!res.ok) throw new Error('Failed to fetch services');
      return res.json() as Promise<Record<string, any[]>>;
    },
    staleTime: 5 * 60 * 1000,
  });

  const categories = groupedServices ? Object.keys(groupedServices) : [];

  const handleBookService = (serviceId: string) => {
    setBookingServiceId(serviceId);
    setPublicPage('booking');
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-beauty-pink-light/20 dark:from-primary/20 dark:via-primary/10 dark:to-beauty-pink-dark/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <motion.div
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="secondary" className="mb-4">Nossos Serviços</Badge>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              Serviços que <span className="text-primary">encantam</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Do corte à coloração, da manicure à estética — temos tudo para você se sentir incrível.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services */}
      <section className="py-12 sm:py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-4 w-16 mb-3" />
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/3 mb-4" />
                    <div className="flex justify-between">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-9 w-20" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {groupedServices && categories.length > 0 && (
            <Tabs defaultValue={categories[0]} className="w-full">
              <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1 mb-8">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Todos
                </TabsTrigger>
                {categories.map((cat) => (
                  <TabsTrigger
                    key={cat}
                    value={cat}
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5"
                  >
                    <span>{categoryIcons[cat] || '🌟'}</span>
                    {cat}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="all">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {categories.map((cat) =>
                    groupedServices[cat].map((service: any) => (
                      <ServiceCard
                        key={service.id}
                        service={service}
                        onBook={handleBookService}
                      />
                    ))
                  )}
                </div>
              </TabsContent>

              {categories.map((cat) => (
                <TabsContent key={cat} value={cat}>
                  <div className="mb-6 flex items-center gap-2">
                    <span className="text-2xl">{categoryIcons[cat] || '🌟'}</span>
                    <h2 className="text-2xl font-bold">{cat}</h2>
                    <Badge variant="secondary" className="ml-2">
                      {groupedServices[cat].length} serviço{groupedServices[cat].length > 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {groupedServices[cat].map((service: any) => (
                      <ServiceCard
                        key={service.id}
                        service={service}
                        onBook={handleBookService}
                      />
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          )}

          {!isLoading && (!groupedServices || categories.length === 0) && (
            <div className="text-center py-12">
              <Scissors className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum serviço encontrado</h3>
              <p className="text-muted-foreground">Os serviços serão carregados em breve.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function ServiceCard({ service, onBook }: { service: any; onBook: (id: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <Card className="h-full hover:shadow-lg transition-all duration-300 group">
        <CardContent className="p-6 flex flex-col h-full">
          <Badge variant="outline" className="w-fit mb-3 text-xs">
            {service.category || 'Serviço'}
          </Badge>
          <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
            {service.name}
          </h3>
          {service.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {service.description}
            </p>
          )}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Clock className="w-4 h-4" />
            {service.duration} min
          </div>
          <div className="mt-auto flex items-center justify-between">
            <span className="text-xl font-bold text-primary">
              {formatBRL(service.price)}
            </span>
            <Button
              size="sm"
              onClick={() => onBook(service.id)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1"
            >
              <CalendarCheck className="w-4 h-4" />
              Agendar
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
