'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppStore } from '@/lib/store';
import { useUsers } from '@/lib/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

const roleOptions = [
  { value: 'admin', label: 'Administrador' },
  { value: 'funcionario', label: 'Funcionário' },
  { value: 'financeiro', label: 'Financeiro' },
  { value: 'cliente', label: 'Cliente' },
];

export function UserFormDialog() {
  const { userDialogOpen, setUserDialogOpen, editingUserId, setEditingUserId } = useAppStore();
  const { data: users } = useUsers();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('funcionario');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const isEditing = !!editingUserId;

  // Populate form when editing
  useEffect(() => {
    if (editingUserId && users) {
      const user = users.find((u) => u.id === editingUserId);
      if (user) {
        setName(user.name || '');
        setEmail(user.email || '');
        setRole(user.role || 'funcionario');
        setPhone(user.phone || '');
        setPassword('');
      }
    } else if (!userDialogOpen) {
      setName('');
      setEmail('');
      setRole('funcionario');
      setPhone('');
      setPassword('');
    }
  }, [editingUserId, users, userDialogOpen]);

  const handleClose = () => {
    setUserDialogOpen(false);
    setEditingUserId(null);
    setName('');
    setEmail('');
    setRole('funcionario');
    setPhone('');
    setPassword('');
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setIsSaving(true);
    try {
      const payload: Record<string, unknown> = {
        name: name.trim(),
        email: email.trim(),
        role,
        phone: phone.trim() || null,
        password: password.trim() || null,
      };

      if (isEditing && editingUserId) {
        const res = await fetch('/api/users', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingUserId, ...payload }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to update user');
        }
      } else {
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to create user');
        }
      }

      await queryClient.invalidateQueries({ queryKey: ['users'] });
      handleClose();
    } catch (error) {
      console.error('Save user error:', error);
      alert(error instanceof Error ? error.message : 'Erro ao salvar usuário');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={userDialogOpen} onOpenChange={(open) => !isSaving && !open && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Atualize as informações do usuário' : 'Preencha os dados do novo usuário'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="user-name" className="text-sm font-medium">
              Nome <span className="text-red-500">*</span>
            </Label>
            <Input
              id="user-name"
              placeholder="Nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-9"
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="user-email" className="text-sm font-medium">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="user-email"
              type="email"
              placeholder="email@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-9"
              required
            />
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Perfil</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Selecione o perfil" />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <Label htmlFor="user-phone" className="text-sm font-medium">Telefone</Label>
            <Input
              id="user-phone"
              placeholder="(11) 99999-9999"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-9"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="user-password" className="text-sm font-medium">
              {isEditing ? 'Nova Senha (deixe vazio para manter)' : 'Senha'}
            </Label>
            <Input
              id="user-password"
              type="password"
              placeholder={isEditing ? '••••••••' : 'Senha de acesso'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-9"
              {...(!isEditing && { required: true })}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={handleClose} disabled={isSaving}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={isSaving}>
              {isSaving && <Loader2 className="w-3 h-3 animate-spin mr-1.5" />}
              {isEditing ? 'Salvar Alterações' : 'Criar Usuário'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
