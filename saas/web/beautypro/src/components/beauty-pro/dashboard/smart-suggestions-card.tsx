'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDashboard } from '@/lib/hooks';
import { Brain, Lightbulb, AlertCircle, TrendingUp, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const priorityConfig: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  urgent: { label: 'Urgente', color: 'text-red-700 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30', icon: AlertCircle },
  high: { label: 'Alta', color: 'text-orange-700 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/30', icon: Zap },
  medium: { label: 'Média', color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30', icon: TrendingUp },
  low: { label: 'Baixa', color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30', icon: Lightbulb },
};

const typeIcons: Record<string, React.ElementType> = {
  inactive_vip: AlertCircle,
  birthday: Lightbulb,
  win_back: TrendingUp,
  high_value: Zap,
  stock_alert: AlertCircle,
};

export function SmartSuggestionsCard() {
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

  const suggestions = data?.smartSuggestions || [];

  if (suggestions.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Brain className="w-4 h-4 text-primary" />
              Sugestões Inteligentes
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center py-8 text-muted-foreground text-sm">
            Nenhuma sugestão no momento
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Brain className="w-4 h-4 text-primary" />
              Sugestões Inteligentes
            </CardTitle>
            <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
              {suggestions.length} nova{suggestions.length > 1 ? 's' : ''}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {suggestions.slice(0, 3).map((suggestion: any, idx: number) => {
              const priority = priorityConfig[suggestion.priority] || priorityConfig.medium;
              const PriorityIcon = priority.icon;

              return (
                <motion.div
                  key={suggestion.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-3 rounded-lg border border-border/50 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg ${priority.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                      <PriorityIcon className={`w-4 h-4 ${priority.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium truncate">{suggestion.title}</p>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{suggestion.description}</p>
                      {suggestion.action && (
                        <Badge variant="outline" className="mt-1.5 text-[10px]">
                          {suggestion.action}
                        </Badge>
                      )}
                    </div>
                    <Badge className={`text-[10px] shrink-0 ${priority.bg} ${priority.color} border-0`}>
                      {priority.label}
                    </Badge>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
