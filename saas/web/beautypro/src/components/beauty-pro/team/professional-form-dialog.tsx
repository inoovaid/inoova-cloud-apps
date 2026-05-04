'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAppStore } from '@/lib/store';
import { useProfessionals } from '@/lib/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Trash2, AlertTriangle, Palette, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

const professionalSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  specialty: z.string().min(1, 'Especialidade é obrigatória'),
  phone: z.string().optional(),
  color: z.string().optional(),
  bio: z.string().optional(),
});

type ProfessionalFormData = z.infer<typeof professionalSchema>;

const colorOptions = [
  '#e11d48', '#0891b2', '#059669', '#d97706', '#7c3aed',
  '#dc2626', '#0284c7', '#16a34a', '#ea580c', '#9333ea',
  '#be185d', '#0d9488', '#ca8a04', '#4f46e5', '#c026d3',
];

export function ProfessionalFormDialog() {
  const { professionalDialogOpen, setProfessionalDialogOpen, editingProfessionalId, setEditingProfessionalId } = useAppStore();
  const { data: professionals } = useProfessionals();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isEditing = !!editingProfessionalId;

  const form = useForm<ProfessionalFormData>({
    resolver: zodResolver(professionalSchema),
    defaultValues: {
      name: '',
      email: '',
      specialty: '',
      phone: '',
      color: colorOptions[0],
      bio: '',
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (editingProfessionalId && professionalDialogOpen) {
      fetch('/api/professionals')
        .then((res) => res.json())
        .then((data) => {
          const pro = data.find((p: any) => p.id === editingProfessionalId);
          if (pro) {
            form.reset({
              name: pro.name || '',
              email: pro.email || '',
              specialty: pro.specialty || '',
              phone: pro.phone || '',
              color: pro.color || colorOptions[0],
              bio: pro.bio || '',
            });
          }
        })
        .catch(console.error);
    } else if (!professionalDialogOpen) {
      form.reset({
        name: '',
        email: '',
        specialty: '',
        phone: '',
        color: colorOptions[0],
        bio: '',
      });
    }
  }, [editingProfessionalId, professionalDialogOpen, form]);

  const handleClose = () => {
    setProfessionalDialogOpen(false);
    setEditingProfessionalId(null);
    setShowDeleteConfirm(false);
    form.reset();
  };

  const onSubmit = async (data: ProfessionalFormData) => {
    setIsSaving(true);
    try {
      const payload = {
        ...data,
        email: data.email || null,
        phone: data.phone || null,
        color: data.color || null,
        bio: data.bio || null,
      };

      if (isEditing && editingProfessionalId) {
        const res = await fetch('/api/professionals', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingProfessionalId, ...payload }),
        });
        if (!res.ok) throw new Error('Failed to update professional');
      } else {
        const res = await fetch('/api/professionals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to create professional');
      }

      await queryClient.invalidateQueries({ queryKey: ['team'] });
      await queryClient.invalidateQueries({ queryKey: ['calendar'] });
      handleClose();
    } catch (error) {
      console.error('Save professional error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editingProfessionalId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/professionals?id=${editingProfessionalId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete professional');

      await queryClient.invalidateQueries({ queryKey: ['team'] });
      await queryClient.invalidateQueries({ queryKey: ['calendar'] });
      handleClose();
    } catch (error) {
      console.error('Delete professional error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const selectedColor = form.watch('color') || colorOptions[0];

  return (
    <Dialog open={professionalDialogOpen} onOpenChange={(open) => !isSaving && !open && handleClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Profissional' : 'Novo Profissional'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Atualize as informações do profissional' : 'Preencha os dados do novo profissional'}
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

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              Email
            </Label>
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
            <p className="text-[10px] text-muted-foreground">Usado para login no sistema</p>
          </div>

          {/* Specialty */}
          <div className="space-y-1.5">
            <Label htmlFor="specialty" className="text-sm font-medium">
              Especialidade <span className="text-red-500">*</span>
            </Label>
            <Input
              id="specialty"
              placeholder="Ex: Cabelereira, Manicure, Barbeiro..."
              {...form.register('specialty')}
              className="h-9"
            />
            {form.formState.errors.specialty && (
              <p className="text-xs text-red-500">{form.formState.errors.specialty.message}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-sm font-medium">Telefone</Label>
            <Input
              id="phone"
              placeholder="(11) 99999-9999"
              {...form.register('phone')}
              className="h-9"
            />
          </div>

          {/* Color picker */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5" />
              Cor no Calendário
            </Label>
            <div className="flex items-center gap-3">
              <div className="flex flex-wrap gap-1.5">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={cn(
                      'w-7 h-7 rounded-full border-2 transition-transform hover:scale-110',
                      selectedColor === color ? 'border-foreground scale-110' : 'border-transparent'
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => form.setValue('color', color)}
                  />
                ))}
              </div>
              <div
                className="w-10 h-10 rounded-lg border border-border shrink-0"
                style={{ backgroundColor: selectedColor }}
              />
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-1.5">
            <Label htmlFor="bio" className="text-sm font-medium">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Breve descrição sobre o profissional..."
              {...form.register('bio')}
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
              Excluir Profissional
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
              {isEditing ? 'Salvar Alterações' : 'Criar Profissional'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
