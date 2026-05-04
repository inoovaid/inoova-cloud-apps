'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  Mail,
  Bell,
  Globe,
  Plus,
  Pencil,
  Trash2,
  Play,
  Power,
  PowerOff,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { useDataStore } from '@/stores/data-store';
import { Automation } from '@/lib/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ─── Constants ───────────────────────────────────────────────────────────────

const TRIGGER_LABELS: Record<string, string> = {
  enrollment_created: 'Nova matrícula',
  payment_received: 'Pagamento recebido',
  course_completed: 'Curso concluído',
  lead_created: 'Novo lead',
  student_inactive: 'Aluno inativo',
};

const TYPE_LABELS: Record<Automation['type'], string> = {
  email: 'E-mail',
  notification: 'Notificação',
  webhook: 'Webhook',
};

const TYPE_ICONS: Record<Automation['type'], React.ElementType> = {
  email: Mail,
  notification: Bell,
  webhook: Globe,
};

const TYPE_COLORS: Record<Automation['type'], { bg: string; text: string }> = {
  email: { bg: 'bg-blue-500/15', text: 'text-blue-600 dark:text-blue-400' },
  notification: { bg: 'bg-amber-500/15', text: 'text-amber-600 dark:text-amber-400' },
  webhook: { bg: 'bg-purple-500/15', text: 'text-purple-600 dark:text-purple-400' },
};

// ─── Form Data ───────────────────────────────────────────────────────────────

interface AutomationFormData {
  name: string;
  type: Automation['type'];
  trigger: string;
  action: string;
  status: Automation['status'];
}

const emptyForm: AutomationFormData = {
  name: '',
  type: 'email',
  trigger: 'enrollment_created',
  action: '',
  status: 'active',
};

// ─── Automations Page ────────────────────────────────────────────────────────

export function AutomationsPage() {
  const { automations, addAutomation, updateAutomation, deleteAutomation } = useDataStore();

  // Dialogs
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Form state
  const [form, setForm] = useState<AutomationFormData>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState('');

  // Form errors
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof AutomationFormData, string>>>({});

  // ─── Stats ────────────────────────────────────────────────────────────

  const activeCount = automations.filter(a => a.status === 'active').length;
  const inactiveCount = automations.filter(a => a.status === 'inactive').length;

  // ─── Add Automation ──────────────────────────────────────────────────

  const openAdd = () => {
    setForm(emptyForm);
    setFormErrors({});
    setAddOpen(true);
  };

  const validateForm = (): boolean => {
    const e: Partial<Record<keyof AutomationFormData, string>> = {};
    if (!form.name.trim()) e.name = 'Nome é obrigatório';
    if (!form.action.trim()) e.action = 'Ação é obrigatória';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAddSave = () => {
    if (!validateForm()) return;
    addAutomation({
      name: form.name.trim(),
      type: form.type,
      trigger: form.trigger,
      action: form.action.trim(),
      status: form.status,
    });
    setAddOpen(false);
    setForm(emptyForm);
  };

  // ─── Edit Automation ─────────────────────────────────────────────────

  const openEdit = (automation: Automation) => {
    setEditingId(automation.id);
    setForm({
      name: automation.name,
      type: automation.type,
      trigger: automation.trigger,
      action: automation.action,
      status: automation.status,
    });
    setFormErrors({});
    setEditOpen(true);
  };

  const handleEditSave = () => {
    if (!validateForm()) return;
    if (!editingId) return;
    updateAutomation(editingId, {
      name: form.name.trim(),
      type: form.type,
      trigger: form.trigger,
      action: form.action.trim(),
      status: form.status,
    });
    setEditOpen(false);
    setEditingId(null);
  };

  // ─── Toggle Status ───────────────────────────────────────────────────

  const handleToggleStatus = (automation: Automation) => {
    const newStatus = automation.status === 'active' ? 'inactive' : 'active';
    updateAutomation(automation.id, { status: newStatus });
    toast.success(
      `Automação "${automation.name}" ${newStatus === 'active' ? 'ativada' : 'desativada'}`
    );
  };

  // ─── Delete ──────────────────────────────────────────────────────────

  const openDelete = (automation: Automation) => {
    setDeleteId(automation.id);
    setDeleteName(automation.name);
    setDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteAutomation(deleteId);
      toast.success('Automação excluída com sucesso');
    }
    setDeleteOpen(false);
    setDeleteId(null);
    setDeleteName('');
  };

  // ─── Test Automation ─────────────────────────────────────────────────

  const handleTest = (automation: Automation) => {
    const typeLabel = TYPE_LABELS[automation.type];
    toast.success(`Automação "${automation.name}" testada com sucesso!`, {
      description: `Tipo: ${typeLabel} | Trigger: ${TRIGGER_LABELS[automation.trigger]}`,
    });
  };

  // ─── Form Fields ─────────────────────────────────────────────────────

  const renderFormFields = () => (
    <div className="grid gap-4 py-2">
      <div className="grid gap-2">
        <Label>Nome</Label>
        <Input
          placeholder="Ex: Email de boas-vindas"
          value={form.name}
          onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
          aria-invalid={!!formErrors.name}
        />
        {formErrors.name && <p className="text-xs text-destructive">{formErrors.name}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Tipo</Label>
          <Select
            value={form.type}
            onValueChange={(v) => setForm(f => ({ ...f, type: v as Automation['type'] }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email">E-mail</SelectItem>
              <SelectItem value="notification">Notificação</SelectItem>
              <SelectItem value="webhook">Webhook</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label>Status</Label>
          <Select
            value={form.status}
            onValueChange={(v) => setForm(f => ({ ...f, status: v as Automation['status'] }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="inactive">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-2">
        <Label>Gatilho</Label>
        <Select
          value={form.trigger}
          onValueChange={(v) => setForm(f => ({ ...f, trigger: v }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(TRIGGER_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label>Ação</Label>
        <Textarea
          placeholder="Descreva a ação que esta automação executa..."
          value={form.action}
          onChange={(e) => setForm(f => ({ ...f, action: e.target.value }))}
          rows={3}
          aria-invalid={!!formErrors.action}
        />
        {formErrors.action && <p className="text-xs text-destructive">{formErrors.action}</p>}
      </div>
    </div>
  );

  // ─── Render ──────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Automações</h1>
          <p className="text-sm text-muted-foreground">
            Configure automações para e-mails, notificações e webhooks.
          </p>
        </div>
        <Button onClick={openAdd} className="shrink-0">
          <Plus className="size-4" />
          Nova Automação
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <Card className="relative overflow-hidden">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15">
                <Power className="size-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Automações Ativas</p>
                <p className="text-xl font-bold tracking-tight">{activeCount}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}>
          <Card className="relative overflow-hidden">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gray-500/15">
                <PowerOff className="size-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Automações Inativas</p>
                <p className="text-xl font-bold tracking-tight">{inactiveCount}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Automation Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {automations.map((automation) => {
            const TypeIcon = TYPE_ICONS[automation.type];
            const typeColor = TYPE_COLORS[automation.type];
            const isActive = automation.status === 'active';

            return (
              <motion.div
                key={automation.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Card className={cn(
                  'h-full transition-colors',
                  !isActive && 'opacity-70'
                )}>
                  <CardContent className="p-5 space-y-4">
                    {/* Header: Icon + Name + Type badge */}
                    <div className="flex items-start gap-3">
                      <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-xl', typeColor.bg)}>
                        <TypeIcon className={cn('size-5', typeColor.text)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold truncate">{automation.name}</h3>
                        <Badge variant="outline" className={cn('text-[10px] mt-1', typeColor.bg, typeColor.text, 'border-0')}>
                          {TYPE_LABELS[automation.type]}
                        </Badge>
                      </div>
                      <Switch
                        checked={isActive}
                        onCheckedChange={() => handleToggleStatus(automation)}
                        aria-label="Ativar/desativar automação"
                      />
                    </div>

                    {/* Trigger */}
                    <div className="space-y-1">
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Gatilho</p>
                      <p className="text-sm">{TRIGGER_LABELS[automation.trigger] || automation.trigger}</p>
                    </div>

                    {/* Action */}
                    <div className="space-y-1">
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Ação</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">{automation.action}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 h-8 text-xs"
                        onClick={() => handleTest(automation)}
                      >
                        <Play className="size-3 mr-1" />
                        Testar
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => openEdit(automation)}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-red-600 hover:text-red-700 hover:bg-red-500/10"
                        onClick={() => openDelete(automation)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Empty state */}
      {automations.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="flex size-16 items-center justify-center rounded-2xl bg-emerald-500/10 mb-4">
            <Zap className="size-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="text-lg font-semibold">Nenhuma automação</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Crie sua primeira automação para automatizar tarefas repetitivas.
          </p>
          <Button onClick={openAdd} className="mt-4">
            <Plus className="size-4" />
            Nova Automação
          </Button>
        </motion.div>
      )}

      {/* ─── Add Automation Dialog ──────────────────────────────────────── */}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Automação</DialogTitle>
            <DialogDescription>
              Configure uma nova automação para o seu sistema.
            </DialogDescription>
          </DialogHeader>
          {renderFormFields()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddSave}>
              Criar Automação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Edit Automation Dialog ─────────────────────────────────────── */}

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Automação</DialogTitle>
            <DialogDescription>
              Atualize as configurações da automação.
            </DialogDescription>
          </DialogHeader>
          {renderFormFields()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditSave}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Confirmation ────────────────────────────────────────── */}

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir automação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a automação <strong>&quot;{deleteName}&quot;</strong>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
