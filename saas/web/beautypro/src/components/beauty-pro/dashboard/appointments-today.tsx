'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppointmentsToday, statusLabel } from '@/lib/hooks';
import { Clock, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const statusColors: Record<string, string> = {
  scheduled: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  in_progress: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  no_show: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export function AppointmentsToday() {
  const { data, isLoading } = useAppointmentsToday();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="h-80 bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Agendamentos de Hoje</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {data.length} agendamentos
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <ScrollArea className="h-80">
            <div className="space-y-2">
              {data.map((apt, idx) => (
                <motion.div
                  key={apt.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-accent/50 transition-colors',
                    apt.status === 'in_progress' && 'border-primary/30 bg-primary/5'
                  )}
                >
                  {/* Time */}
                  <div className="flex items-center gap-1.5 min-w-[90px]">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">
                      {apt.startTime} - {apt.endTime}
                    </span>
                  </div>

                  {/* Color indicator */}
                  <div
                    className="w-1 h-10 rounded-full shrink-0"
                    style={{ backgroundColor: apt.professionalColor }}
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{apt.clientName}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {apt.services.join(', ')}
                    </p>
                  </div>

                  {/* Professional */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <User className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground max-w-[80px] truncate">
                      {apt.professionalName.split(' ')[0]}
                    </span>
                  </div>

                  {/* Status */}
                  <Badge
                    variant="secondary"
                    className={cn('text-[10px] shrink-0', statusColors[apt.status])}
                  >
                    {statusLabel(apt.status)}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  );
}
