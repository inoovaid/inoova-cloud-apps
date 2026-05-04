'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useProfessionals, formatBRL } from '@/lib/hooks';
import { useAppStore } from '@/lib/store';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Calendar, DollarSign, Percent, Plus, Pencil, Trash2, Mail } from 'lucide-react';

export function TeamList() {
  const { data, isLoading } = useProfessionals();
  const { setProfessionalDialogOpen, setEditingProfessionalId } = useAppStore();
  const queryClient = useQueryClient();

  const handleNewProfessional = () => {
    setEditingProfessionalId(null);
    setProfessionalDialogOpen(true);
  };

  const handleEdit = (proId: string) => {
    setEditingProfessionalId(proId);
    setProfessionalDialogOpen(true);
  };

  const handleDelete = async (proId: string) => {
    if (!confirm('Tem certeza que deseja excluir este profissional?')) return;
    try {
      const res = await fetch(`/api/professionals?id=${proId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      await queryClient.invalidateQueries({ queryKey: ['team'] });
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleToggleActive = async (proId: string, isActive: boolean) => {
    try {
      const res = await fetch('/api/professionals', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: proId, isActive: !isActive }),
      });
      if (!res.ok) throw new Error('Failed to toggle');
      await queryClient.invalidateQueries({ queryKey: ['team'] });
    } catch (error) {
      console.error('Toggle error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <div className="h-9 w-40 bg-muted rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-40 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={handleNewProfessional}>
          <Plus className="w-4 h-4 mr-1" />
          Novo Profissional
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((pro, idx) => (
          <motion.div
            key={pro.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className={pro.isActive ? '' : 'opacity-60'}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: pro.color }}
                    >
                      {pro.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-semibold">{pro.name}</p>
                      <p className="text-xs text-muted-foreground">{pro.specialty}</p>
                      {pro.email && (
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Mail className="w-2.5 h-2.5" />
                          {pro.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <Switch
                    checked={pro.isActive}
                    onCheckedChange={() => handleToggleActive(pro.id, pro.isActive)}
                  />
                </div>

                <div className="space-y-3">
                  {/* Commission */}
                  <div className="flex items-center justify-between p-2.5 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Percent className="w-3.5 h-3.5" />
                      Comissão
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {pro.commissionPercent}% {pro.commissionType === 'service' ? 'serviço' : 'produto'}
                    </Badge>
                  </div>

                  {/* Today's appointments */}
                  <div className="flex items-center justify-between p-2.5 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" />
                      Hoje
                    </div>
                    <span className="text-sm font-semibold">
                      {pro.todayAppointments} agendamentos
                    </span>
                  </div>

                  {/* Month revenue */}
                  <div className="flex items-center justify-between p-2.5 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <DollarSign className="w-3.5 h-3.5" />
                      Este mês
                    </div>
                    <span className="text-sm font-semibold">
                      {formatBRL(pro.monthRevenue)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-1 mt-4 pt-3 border-t border-border/50">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 min-w-[44px] text-xs"
                    onClick={() => handleEdit(pro.id)}
                  >
                    <Pencil className="w-3.5 h-3.5 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 min-w-[44px] text-xs text-destructive hover:text-destructive"
                    onClick={() => handleDelete(pro.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    Excluir
                  </Button>
                </div>

                {!pro.isActive && (
                  <div className="mt-3 text-center">
                    <Badge variant="secondary" className="text-xs text-muted-foreground">
                      Profissional inativo
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
