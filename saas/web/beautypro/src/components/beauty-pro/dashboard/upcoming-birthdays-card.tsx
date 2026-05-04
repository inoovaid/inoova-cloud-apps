'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDashboard } from '@/lib/hooks';
import { Cake, Phone } from 'lucide-react';
import { motion } from 'framer-motion';

export function UpcomingBirthdaysCard() {
  const { data, isLoading } = useDashboard();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="h-64 bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  const birthdays = data?.upcomingBirthdays || [];

  if (birthdays.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Cake className="w-4 h-4 text-pink-500" />
              Aniversariantes do Mês
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center py-8 text-muted-foreground text-sm">
            Nenhum aniversariante este mês
          </div>
        </CardContent>
      </Card>
    );
  }

  const monthName = new Date().toLocaleDateString('pt-BR', { month: 'long' });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Cake className="w-4 h-4 text-pink-500" />
              Aniversariantes do Mês
            </CardTitle>
            <span className="text-xs text-muted-foreground capitalize">{monthName}</span>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {birthdays.map((client: any, idx: number) => (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center gap-3 p-2.5 rounded-lg bg-pink-50 dark:bg-pink-950/20 border border-pink-100 dark:border-pink-900/30"
              >
                <div className="w-8 h-8 rounded-full bg-pink-100 dark:bg-pink-900/40 flex items-center justify-center shrink-0 text-pink-600 dark:text-pink-400 text-sm font-bold">
                  {client.day}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{client.name}</p>
                  {client.phone && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Phone className="w-3 h-3" />
                      {client.phone}
                    </div>
                  )}
                </div>
                <Cake className="w-4 h-4 text-pink-400 shrink-0" />
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
