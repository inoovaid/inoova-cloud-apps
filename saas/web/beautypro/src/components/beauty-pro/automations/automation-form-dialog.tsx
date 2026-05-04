'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

interface AutomationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingAutomation?: {
    id: string;
    name: string;
    type: string;
    channel: string;
    template: string;
    triggerRule: string;
    isActive: boolean;
  } | null;
}

const automationTypes = [
  { value: 'reminder_24h', label: 'Lembrete 24h' },
  { value: 'reminder_1h', label: 'Lembrete 1h' },
  { value: 'win_back', label: 'Win-back' },
  { value: 'birthday', label: 'Aniversário' },
  { value: 'review_request', label: 'Avaliação' },
  { value: 'stock_alert', label: 'Estoque' },
];

const channelOptions = [
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'email', label: 'E-mail' },
  { value: 'sms', label: 'SMS' },
];

export function AutomationFormDialog({ open, onOpenChange, editingAutomation }: AutomationFormDialogProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    type: 'reminder_24h',
    channel: 'whatsapp',
    template: '',
    triggerRule: '',
    isActive: true,
  });

  useEffect(() => {
    if (editingAutomation) {
      setForm({
        name: editingAutomation.name,
        type: editingAutomation.type,
        channel: editingAutomation.channel,
        template: editingAutomation.template || '',
        triggerRule: editingAutomation.triggerRule || '',
        isActive: editingAutomation.isActive,
      });
    } else {
      setForm({
        name: '',
        type: 'reminder_24h',
        channel: 'whatsapp',
        template: '',
        triggerRule: '',
        isActive: true,
      });
    }
  }, [editingAutomation, open]);

  const handleSubmit = async () => {
    if (!form.name) return;
    setIsSubmitting(true);
    try {
      if (editingAutomation) {
        await fetch('/api/automations', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingAutomation.id, ...form }),
        });
      } else {
        await fetch('/api/automations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      }
      await queryClient.invalidateQueries({ queryKey: ['automations'] });
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving automation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editingAutomation ? 'Editar Automação' : 'Nova Automação'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Nome</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Lembrete 24h" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {automationTypes.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Canal</Label>
              <Select value={form.channel} onValueChange={(v) => setForm({ ...form, channel: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {channelOptions.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Mensagem Template</Label>
            <Textarea value={form.template} onChange={(e) => setForm({ ...form, template: e.target.value })} placeholder="Olá {nome}, seu agendamento..." rows={3} />
          </div>
          <div className="space-y-1.5">
            <Label>Regra de Gatilho</Label>
            <Input value={form.triggerRule} onChange={(e) => setForm({ ...form, triggerRule: e.target.value })} placeholder="Ex: 24h antes do agendamento" />
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} />
            <Label>Ativa</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={!form.name || isSubmitting}>
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
            {editingAutomation ? 'Salvar' : 'Criar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
