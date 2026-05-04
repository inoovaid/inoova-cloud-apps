'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAutomations, formatDateTimeBR } from '@/lib/hooks';
import { AutomationFormDialog } from './automation-form-dialog';
import { motion } from 'framer-motion';
import { MessageCircle, Mail, Smartphone, Zap, Clock, Play, Pencil, Trash2, Plus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';

const channelIcons: Record<string, React.ElementType> = {
  whatsapp: MessageCircle,
  email: Mail,
  sms: Smartphone,
};

const channelColors: Record<string, string> = {
  whatsapp: 'text-emerald-600 dark:text-emerald-400',
  email: 'text-blue-600 dark:text-blue-400',
  sms: 'text-purple-600 dark:text-purple-400',
};

const typeLabels: Record<string, string> = {
  reminder_24h: 'Lembrete 24h',
  reminder_1h: 'Lembrete 1h',
  win_back: 'Win-back',
  birthday: 'Aniversário',
  review_request: 'Avaliação',
  stock_alert: 'Estoque',
};

export function AutomationList() {
  const { data, isLoading } = useAutomations();
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState<{
    id: string;
    name: string;
    type: string;
    channel: string;
    template: string;
    triggerRule: string;
    isActive: boolean;
  } | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleCreate = () => {
    setEditingAutomation(null);
    setDialogOpen(true);
  };

  const handleEdit = (auto: {
    id: string;
    name: string;
    type: string;
    channel: string;
    template: string;
    triggerRule: string;
    isActive: boolean;
  }) => {
    setEditingAutomation(auto);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    setIsDeleting(true);
    try {
      await fetch(`/api/automations?id=${deleteConfirmId}`, { method: 'DELETE' });
      await queryClient.invalidateQueries({ queryKey: ['automations'] });
    } catch (error) {
      console.error('Error deleting automation:', error);
    } finally {
      setIsDeleting(false);
      setDeleteConfirmId(null);
    }
  };

  const handleToggleActive = async (auto: {
    id: string;
    isActive: boolean;
  }) => {
    setTogglingId(auto.id);
    try {
      await fetch('/api/automations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: auto.id, isActive: !auto.isActive }),
      });
      await queryClient.invalidateQueries({ queryKey: ['automations'] });
    } catch (error) {
      console.error('Error toggling automation:', error);
    } finally {
      setTogglingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-40 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) return null;

  return (
    <>
      {/* Header with Create Button */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-muted-foreground">
            {data.length} automação{data.length !== 1 ? 'ões' : ''} configurada{data.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={handleCreate} size="sm" className="gap-1.5">
          <Plus className="w-4 h-4" />
          Nova Automação
        </Button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((auto, idx) => {
          const ChannelIcon = channelIcons[auto.channel] || Zap;
          return (
            <motion.div
              key={auto.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
            >
              <Card className={cn(!auto.isActive && 'opacity-60')}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3 gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={cn('p-1.5 rounded-lg bg-muted shrink-0', channelColors[auto.channel])}>
                        <ChannelIcon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{auto.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {typeLabels[auto.type] || auto.type}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Switch
                        checked={auto.isActive}
                        onCheckedChange={() => handleToggleActive(auto)}
                        disabled={togglingId === auto.id}
                        aria-label={auto.isActive ? 'Desativar automação' : 'Ativar automação'}
                      />
                    </div>
                  </div>

                  {/* Trigger Rule */}
                  <div className="mb-3 p-2 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-0.5">
                      <Zap className="w-3 h-3" />
                      Gatilho
                    </div>
                    <p className="text-xs font-medium">{auto.triggerRule}</p>
                  </div>

                  {/* Template preview */}
                  <div className="mb-3 p-2 bg-muted/30 rounded-lg border border-border/50">
                    <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                      {auto.template}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {auto.lastRunAt ? formatDateTimeBR(auto.lastRunAt) : 'Nunca'}
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <Play className="w-3 h-3 text-muted-foreground" />
                      <span className="font-medium">{auto.recentExecutions}</span>
                      <span className="text-muted-foreground">recentes</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 mt-3 border-t border-border/50">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1.5 text-xs flex-1"
                      onClick={() => handleEdit(auto)}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1.5 text-xs flex-1 text-destructive hover:text-destructive"
                      onClick={() => setDeleteConfirmId(auto.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Excluir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Form Dialog */}
      <AutomationFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingAutomation={editingAutomation}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => { if (!open) setDeleteConfirmId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Automação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta automação? Esta ação não pode ser desfeita e todos os logs relacionados serão removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
