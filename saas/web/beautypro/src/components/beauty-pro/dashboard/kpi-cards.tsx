'use client';

import { Card, CardContent } from '@/components/ui/card';
import { useKPIData, formatBRL } from '@/lib/hooks';
import { DollarSign, Calendar, TrendingUp, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const kpiConfig = [
  {
    key: 'revenue' as const,
    label: 'Faturamento Hoje',
    changeKey: 'revenueChange' as const,
    icon: DollarSign,
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    format: (v: number) => formatBRL(v),
    changePrefix: (v: number) => (v >= 0 ? '+' : ''),
  },
  {
    key: 'appointments' as const,
    label: 'Agendamentos Hoje',
    changeKey: 'appointmentsChange' as const,
    icon: Calendar,
    iconBg: 'bg-teal-100 dark:bg-teal-900/30',
    iconColor: 'text-teal-600 dark:text-teal-400',
    format: (v: number) => v.toString(),
    changePrefix: (v: number) => (v >= 0 ? '+' : ''),
  },
  {
    key: 'avgTicket' as const,
    label: 'Ticket Médio',
    changeKey: 'avgTicketChange' as const,
    icon: TrendingUp,
    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
    iconColor: 'text-amber-600 dark:text-amber-400',
    format: (v: number) => formatBRL(v),
    changePrefix: (v: number) => (v >= 0 ? '+' : ''),
  },
  {
    key: 'activeClients' as const,
    label: 'Clientes Ativos',
    changeKey: 'activeClientsChange' as const,
    icon: Users,
    iconBg: 'bg-pink-100 dark:bg-pink-900/30',
    iconColor: 'text-pink-600 dark:text-pink-400',
    format: (v: number) => v.toString(),
    changePrefix: (v: number) => (v >= 0 ? '+' : ''),
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function KPICards() {
  const { data, isLoading } = useKPIData();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) return null;

  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {kpiConfig.map((kpi) => {
        const value = data[kpi.key];
        const change = data[kpi.changeKey];
        const isPositive = change >= 0;

        return (
          <motion.div key={kpi.key} variants={item}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground font-medium">{kpi.label}</p>
                    <p className="text-2xl font-bold tracking-tight">{kpi.format(value)}</p>
                    <div className="flex items-center gap-1">
                      <span
                        className={`text-xs font-semibold ${
                          isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'
                        }`}
                      >
                        {kpi.changePrefix(change)}{change.toFixed(1)}%
                      </span>
                      <span className="text-xs text-muted-foreground">vs ontem</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-xl ${kpi.iconBg}`}>
                    <kpi.icon className={`w-5 h-5 ${kpi.iconColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
