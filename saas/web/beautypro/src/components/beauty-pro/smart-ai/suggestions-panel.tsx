'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSmartSuggestions } from '@/lib/hooks';
import { useAppStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  Zap,
  MessageCircle,
  Tag,
  User,
  X,
  Brain,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const priorityConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  urgent: { icon: AlertTriangle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' },
  high: { icon: AlertCircle, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  medium: { icon: Info, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  low: { icon: Zap, color: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-100 dark:bg-gray-800' },
};

const priorityLabels: Record<string, string> = {
  urgent: 'Urgente',
  high: 'Alta',
  medium: 'Média',
  low: 'Baixa',
};

const actionConfig: Record<string, { label: string; icon: React.ElementType; variant: 'default' | 'outline' | 'secondary' }> = {
  send_whatsapp: { label: 'Enviar WhatsApp', icon: MessageCircle, variant: 'default' },
  apply_coupon: { label: 'Aplicar Cupom', icon: Tag, variant: 'outline' },
  view_client: { label: 'Ver Cliente', icon: User, variant: 'outline' },
  dismiss: { label: 'Dispensar', icon: X, variant: 'secondary' },
};

export function SuggestionsPanel() {
  const { data, isLoading } = useSmartSuggestions();
  const { setActiveTab, setSelectedClientId } = useAppStore();
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set());

  const handleAction = (suggestion: typeof data extends (infer T)[] | undefined ? T : never) => {
    if (!suggestion) return;

    switch (suggestion.action) {
      case 'view_client':
        if (suggestion.clientId) {
          setSelectedClientId(suggestion.clientId);
          setActiveTab('clients');
        }
        break;
      case 'send_whatsapp':
        // Would trigger WhatsApp message
        break;
      case 'apply_coupon':
        // Would apply coupon
        break;
      default:
        break;
    }
    setResolvedIds((prev) => new Set([...prev, suggestion.id]));
  };

  const handleDismiss = (id: string) => {
    setResolvedIds((prev) => new Set([...prev, id]));
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-24 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) return null;

  const activeSuggestions = data.filter((s) => !resolvedIds.has(s.id));
  const urgentCount = activeSuggestions.filter((s) => s.priority === 'urgent').length;
  const resolvedToday = resolvedIds.size;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeSuggestions.length}</p>
              <p className="text-xs text-muted-foreground">Sugestões Ativas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{urgentCount}</p>
              <p className="text-xs text-muted-foreground">Urgentes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{resolvedToday}</p>
              <p className="text-xs text-muted-foreground">Resolvidas Hoje</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Suggestions list */}
      <AnimatePresence>
        {data.map((suggestion, idx) => {
          const isResolved = resolvedIds.has(suggestion.id);
          const config = priorityConfig[suggestion.priority];
          const PriorityIcon = config.icon;

          return (
            <motion.div
              key={suggestion.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isResolved ? 0.4 : 1, y: 0, scale: isResolved ? 0.98 : 1 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className={cn(isResolved && 'border-dashed')}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    {/* Priority icon */}
                    <div className={cn('p-2 rounded-lg shrink-0', config.bg)}>
                      <PriorityIcon className={cn('w-4 h-4', config.color)} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-semibold">{suggestion.title}</h4>
                        <Badge
                          variant="secondary"
                          className={cn('text-[10px]', config.bg, config.color)}
                        >
                          {priorityLabels[suggestion.priority]}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {suggestion.description}
                      </p>

                      {/* Action buttons */}
                      {!isResolved && (
                        <div className="flex flex-wrap gap-2">
                          {suggestion.action && actionConfig[suggestion.action] && (
                            <Button
                              size="sm"
                              variant={actionConfig[suggestion.action].variant}
                              className="text-xs h-8"
                              onClick={() => handleAction(suggestion)}
                            >
                              {(() => {
                                const ActionIcon = actionConfig[suggestion.action].icon;
                                return <ActionIcon className="w-3.5 h-3.5 mr-1" />;
                              })()}
                              {actionConfig[suggestion.action].label}
                            </Button>
                          )}
                          {suggestion.action !== 'dismiss' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-xs h-8 text-muted-foreground"
                              onClick={() => handleDismiss(suggestion.id)}
                            >
                              <X className="w-3.5 h-3.5 mr-1" /> Dispensar
                            </Button>
                          )}
                          {suggestion.action === 'dismiss' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-xs h-8 text-muted-foreground"
                              onClick={() => handleDismiss(suggestion.id)}
                            >
                              <X className="w-3.5 h-3.5 mr-1" /> Dispensar
                            </Button>
                          )}
                        </div>
                      )}

                      {isResolved && (
                        <Badge variant="secondary" className="text-xs">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Resolvida
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
}
