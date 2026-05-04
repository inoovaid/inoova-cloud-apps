'use client';

import { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/store';
import { useClients, useClientDetail } from '@/lib/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Trash2, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

const clientSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  email: z.string().email('Email inválido').or(z.literal('')),
  birthday: z.string().optional(),
  notes: z.string().optional(),
  source: z.string().optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

const sourceOptions = [
  { value: 'Instagram', label: 'Instagram' },
  { value: 'Google', label: 'Google' },
  { value: 'Indicação', label: 'Indicação' },
  { value: 'WhatsApp', label: 'WhatsApp' },
  { value: 'Facebook', label: 'Facebook' },
  { value: 'Outro', label: 'Outro' },
];

export function ClientFormDialog() {
  const { clientDialogOpen, setClientDialogOpen, editingClientId, setEditingClientId } = useAppStore();
  const { data: clients } = useClients();
  const { data: editingClient } = useClientDetail(editingClientId);
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isEditing = !!editingClientId;

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      birthday: '',
      notes: '',
      source: '',
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (editingClient && isEditing) {
      form.reset({
        name: editingClient.name || '',
        phone: editingClient.phone || '',
        email: editingClient.email || '',
        birthday: editingClient.birthday ? new Date(editingClient.birthday).toISOString().split('T')[0] : '',
        notes: editingClient.notes || '',
        source: editingClient.source || '',
      });
    } else if (!clientDialogOpen) {
      form.reset({
        name: '',
        phone: '',
        email: '',
        birthday: '',
        notes: '',
        source: '',
      });
    }
  }, [editingClient, isEditing, clientDialogOpen, form]);

  const handleClose = () => {
    setClientDialogOpen(false);
    setEditingClientId(null);
    setShowDeleteConfirm(false);
    form.reset();
  };

  const onSubmit = async (data: ClientFormData) => {
    setIsSaving(true);
    try {
      const payload = {
        ...data,
        email: data.email || null,
        birthday: data.birthday || null,
        notes: data.notes || null,
        source: data.source || null,
      };

      if (isEditing && editingClientId) {
        const res = await fetch('/api/clients', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingClientId, ...payload }),
        });
        if (!res.ok) throw new Error('Failed to update client');
      } else {
        const res = await fetch('/api/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to create client');
      }

      await queryClient.invalidateQueries({ queryKey: ['clients'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      handleClose();
    } catch (error) {
      console.error('Save client error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editingClientId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/clients?id=${editingClientId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete client');

      await queryClient.invalidateQueries({ queryKey: ['clients'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      handleClose();
    } catch (error) {
      console.error('Delete client error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={clientDialogOpen} onOpenChange={(open) => !isSaving && !open && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Atualize as informações do cliente' : 'Preencha os dados do novo cliente'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-sm font-medium">
              Nome <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Nome completo"
              {...form.register('name')}
              className="h-9"
            />
            {form.formState.errors.name && (
              <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-sm font-medium">
              Telefone <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone"
              placeholder="(11) 99999-9999"
              {...form.register('phone')}
              className="h-9"
            />
            {form.formState.errors.phone && (
              <p className="text-xs text-red-500">{form.formState.errors.phone.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@exemplo.com"
              {...form.register('email')}
              className="h-9"
            />
            {form.formState.errors.email && (
              <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>
            )}
          </div>

          {/* Birthday */}
          <div className="space-y-1.5">
            <Label htmlFor="birthday" className="text-sm font-medium">Aniversário</Label>
            <Input
              id="birthday"
              type="date"
              {...form.register('birthday')}
              className="h-9"
            />
          </div>

          {/* Source */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Como nos encontrou</Label>
            <Select
              value={form.watch('source') || ''}
              onValueChange={(value) => form.setValue('source', value)}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Selecione a origem" />
              </SelectTrigger>
              <SelectContent>
                {sourceOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-sm font-medium">Observações</Label>
            <Textarea
              id="notes"
              placeholder="Preferências, alergias, observações..."
              {...form.register('notes')}
              className="min-h-[80px] text-sm"
            />
          </div>

          {/* Delete button (edit mode) */}
          {isEditing && !showDeleteConfirm && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full text-destructive border-destructive/30 hover:bg-destructive/10"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              Excluir Cliente
            </Button>
          )}

          {/* Delete confirmation */}
          {isEditing && showDeleteConfirm && (
            <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/5 space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                <AlertTriangle className="w-4 h-4" />
                Confirmar exclusão?
              </div>
              <p className="text-xs text-muted-foreground">Esta ação não pode ser desfeita.</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="text-xs flex-1" onClick={() => setShowDeleteConfirm(false)}>
                  Cancelar
                </Button>
                <Button variant="destructive" size="sm" className="text-xs flex-1" disabled={isDeleting} onClick={handleDelete}>
                  {isDeleting ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Trash2 className="w-3 h-3 mr-1" />}
                  Excluir
                </Button>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={handleClose} disabled={isSaving}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={isSaving}>
              {isSaving && <Loader2 className="w-3 h-3 animate-spin mr-1.5" />}
              {isEditing ? 'Salvar Alterações' : 'Criar Cliente'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
