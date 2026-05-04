'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTopClients, formatBRL } from '@/lib/hooks';
import { Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

const rankColors = ['text-amber-500', 'text-gray-400', 'text-amber-700'];

export function TopClients() {
  const { data, isLoading } = useTopClients();

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
      transition={{ delay: 0.5 }}
    >
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Top Clientes</CardTitle>
            <Trophy className="w-4 h-4 text-amber-500" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {data.map((client, idx) => (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="flex items-center gap-3"
              >
                {/* Rank */}
                <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <span className={`text-xs font-bold ${rankColors[idx] || 'text-muted-foreground'}`}>
                    {client.rank}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{client.name}</p>
                  <p className="text-xs text-muted-foreground">{client.visitCount} visitas</p>
                </div>

                {/* Tags */}
                <div className="flex gap-1 shrink-0">
                  {client.tags.map((tag) => (
                    <Badge
                      key={tag.name}
                      variant="secondary"
                      className="text-[10px] px-1.5 py-0"
                      style={{ backgroundColor: tag.color + '20', color: tag.color }}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>

                {/* Value */}
                <p className="text-sm font-semibold shrink-0">{formatBRL(client.totalSpent)}</p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
