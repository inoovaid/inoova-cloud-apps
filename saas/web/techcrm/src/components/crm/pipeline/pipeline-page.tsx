'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash2,
  Pencil,
  ChevronLeft,
  ChevronRight,
  Globe,
  UserPlus,
  Share2,
  Megaphone,
  Eye,
  Clock,
  MoreHorizontal,
  X,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useDataStore } from '@/stores/data-store';
import { Lead } from '@/lib/types';
import { cn } from '@/lib/utils';

// ─── Constants ───────────────────────────────────────────────────────────────

const PIPELINE_STAGES: Lead['status'][] = [
  'new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost',
];

const STAGE_CONFIG: Record<Lead['status'], {
  label: string;
  accentColor: string;
  accentBg: string;
  accentBorder: string;
  headerBg: string;
}> = {
  new: {
    label: 'Novo',
    accentColor: 'text-slate-600 dark:text-slate-400',
    accentBg: 'bg-slate-500/10',
    accentBorder: 'border-l-slate-500',
    headerBg: 'bg-slate-500/8',
  },
  contacted: {
    label: 'Contatado',
    accentColor: 'text-blue-600 dark:text-blue-400',
    accentBg: 'bg-blue-500/10',
    accentBorder: 'border-l-blue-500',
    headerBg: 'bg-blue-500/8',
  },
  qualified: {
    label: 'Qualificado',
    accentColor: 'text-cyan-600 dark:text-cyan-400',
    accentBg: 'bg-cyan-500/10',
    accentBorder: 'border-l-cyan-500',
    headerBg: 'bg-cyan-500/8',
  },
  proposal: {
    label: 'Proposta',
    accentColor: 'text-violet-600 dark:text-violet-400',
    accentBg: 'bg-violet-500/10',
    accentBorder: 'border-l-violet-500',
    headerBg: 'bg-violet-500/8',
  },
  negotiation: {
    label: 'Negociação',
    accentColor: 'text-amber-600 dark:text-amber-400',
    accentBg: 'bg-amber-500/10',
    accentBorder: 'border-l-amber-500',
    headerBg: 'bg-amber-500/8',
  },
  won: {
    label: 'Ganho',
    accentColor: 'text-emerald-600 dark:text-emerald-400',
    accentBg: 'bg-emerald-500/10',
    accentBorder: 'border-l-emerald-500',
    headerBg: 'bg-emerald-500/8',
  },
  lost: {
    label: 'Perdido',
    accentColor: 'text-red-600 dark:text-red-400',
    accentBg: 'bg-red-500/10',
    accentBorder: 'border-l-red-500',
    headerBg: 'bg-red-500/8',
  },
};

const SOURCE_CONFIG: Record<Lead['source'], { label: string; icon: React.ElementType; className: string }> = {
  website: { label: 'Website', icon: Globe, className: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20' },
  referral: { label: 'Indicação', icon: UserPlus, className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  social: { label: 'Social', icon: Share2, className: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20' },
  ads: { label: 'Anúncios', icon: Megaphone, className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatBRL = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(dateStr));
}

function formatRelativeDate(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `Há ${diffDays} dias`;
  if (diffDays < 30) return `Há ${Math.floor(diffDays / 7)} semana${Math.floor(diffDays / 7) > 1 ? 's' : ''}`;
  if (diffDays < 365) return `Há ${Math.floor(diffDays / 30)} mês${Math.floor(diffDays / 30) > 1 ? 'es' : ''}`;
  return `Há ${Math.floor(diffDays / 365)} ano${Math.floor(diffDays / 365) > 1 ? 's' : ''}`;
}

// ─── Form Types ──────────────────────────────────────────────────────────────

interface LeadFormData {
  name: string;
  email: string;
  phone: string;
  source: Lead['source'];
  status: Lead['status'];
  value: number;
  notes: string;
}

const emptyForm: LeadFormData = {
  name: '',
  email: '',
  phone: '',
  source: 'website',
  status: 'new',
  value: 0,
  notes: '',
};

// ─── Lead Card ───────────────────────────────────────────────────────────────

interface LeadCardProps {
  lead: Lead;
  onEdit: (lead: Lead) => void;
  onDetail: (lead: Lead) => void;
  onDelete: (id: string) => void;
  onMoveStatus: (id: string, status: Lead['status']) => void;
}

function LeadCard({ lead, onEdit, onDetail, onDelete, onMoveStatus }: LeadCardProps) {
  const sourceCfg = SOURCE_CONFIG[lead.source];
  const SourceIcon = sourceCfg.icon;
  const stageIdx = PIPELINE_STAGES.indexOf(lead.status);
  const canMoveLeft = stageIdx > 0;
  const canMoveRight = stageIdx < PIPELINE_STAGES.length - 1;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={cn(
          'cursor-pointer border-l-4 transition-shadow hover:shadow-md',
          STAGE_CONFIG[lead.status].accentBorder
        )}
        onClick={() => onDetail(lead)}
      >
        <CardContent className="p-3 space-y-2.5">
          {/* Name + Actions */}
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-semibold leading-tight truncate flex-1">{lead.name}</h4>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="size-6 shrink-0 -mt-0.5 -mr-1">
                  <MoreHorizontal className="size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                {canMoveLeft && (
                  <DropdownMenuItem onClick={() => onMoveStatus(lead.id, PIPELINE_STAGES[stageIdx - 1])}>
                    <ChevronLeft className="size-4 mr-2" />
                    Voltar: {STAGE_CONFIG[PIPELINE_STAGES[stageIdx - 1]].label}
                  </DropdownMenuItem>
                )}
                {canMoveRight && (
                  <DropdownMenuItem onClick={() => onMoveStatus(lead.id, PIPELINE_STAGES[stageIdx + 1])}>
                    <ChevronRight className="size-4 mr-2" />
                    Avançar: {STAGE_CONFIG[PIPELINE_STAGES[stageIdx + 1]].label}
                  </DropdownMenuItem>
                )}
                {(canMoveLeft || canMoveRight) && <DropdownMenuSeparator />}
                <DropdownMenuItem onClick={() => onEdit(lead)}>
                  <Pencil className="size-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(lead.id)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="size-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Email */}
          <p className="text-xs text-muted-foreground truncate">{lead.email}</p>

          {/* Value */}
          <p className="text-sm font-bold">{formatBRL(lead.value)}</p>

          {/* Source badge + date */}
          <div className="flex items-center justify-between gap-2">
            <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0 h-5', sourceCfg.className)}>
              <SourceIcon className="size-3 mr-1" />
              {sourceCfg.label}
            </Badge>
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Clock className="size-3" />
              {formatRelativeDate(lead.createdAt)}
            </span>
          </div>

          {/* Quick move buttons */}
          <div className="flex items-center gap-1 pt-0.5">
            {canMoveLeft && (
              <Button
                variant="outline"
                size="sm"
                className="h-6 text-[10px] px-2 flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveStatus(lead.id, PIPELINE_STAGES[stageIdx - 1]);
                }}
              >
                <ChevronLeft className="size-3" />
              </Button>
            )}
            {canMoveRight && (
              <Button
                variant="outline"
                size="sm"
                className="h-6 text-[10px] px-2 flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveStatus(lead.id, PIPELINE_STAGES[stageIdx + 1]);
                }}
              >
                <ChevronRight className="size-3" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Pipeline Column ─────────────────────────────────────────────────────────

interface PipelineColumnProps {
  status: Lead['status'];
  leads: Lead[];
  onEdit: (lead: Lead) => void;
  onDetail: (lead: Lead) => void;
  onDelete: (id: string) => void;
  onMoveStatus: (id: string, status: Lead['status']) => void;
}

function PipelineColumn({ status, leads, onEdit, onDetail, onDelete, onMoveStatus }: PipelineColumnProps) {
  const config = STAGE_CONFIG[status];
  const totalValue = leads.reduce((sum, l) => sum + l.value, 0);

  return (
    <div className="flex flex-col min-w-[280px] w-[280px] lg:min-w-[300px] lg:w-[300px] shrink-0">
      {/* Column Header */}
      <div className={cn('rounded-t-xl px-4 py-3 border border-b-0', config.headerBg)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={cn('text-sm font-semibold', config.accentColor)}>{config.label}</span>
            <span className={cn(
              'inline-flex size-5 items-center justify-center rounded-full text-[10px] font-bold',
              config.accentBg, config.accentColor
            )}>
              {leads.length}
            </span>
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            {formatBRL(totalValue)}
          </span>
        </div>
      </div>

      {/* Cards */}
      <div className="flex-1 border border-t-0 rounded-b-xl bg-muted/20 p-2 space-y-2 max-h-[calc(100vh-320px)] overflow-y-auto scrollbar-thin">
        <AnimatePresence mode="popLayout">
          {leads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-xs text-muted-foreground">Nenhum lead nesta etapa</p>
            </div>
          ) : (
            leads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                onEdit={onEdit}
                onDetail={onDetail}
                onDelete={onDelete}
                onMoveStatus={onMoveStatus}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Simulated Activity Timeline ─────────────────────────────────────────────

function getSimulatedActivities(lead: Lead) {
  const activities = [];
  const stageIdx = PIPELINE_STAGES.indexOf(lead.status);

  activities.push({
    id: '1',
    type: 'created' as const,
    description: 'Lead criado',
    date: lead.createdAt,
  });

  if (stageIdx >= 1) {
    activities.push({
      id: '2',
      type: 'contacted' as const,
      description: 'Primeiro contato realizado',
      date: new Date(new Date(lead.createdAt).getTime() + 86400000).toISOString(),
    });
  }

  if (stageIdx >= 2) {
    activities.push({
      id: '3',
      type: 'qualified' as const,
      description: 'Lead qualificado',
      date: new Date(new Date(lead.createdAt).getTime() + 86400000 * 3).toISOString(),
    });
  }

  if (stageIdx >= 3) {
    activities.push({
      id: '4',
      type: 'proposal' as const,
      description: 'Proposta enviada',
      date: new Date(new Date(lead.createdAt).getTime() + 86400000 * 5).toISOString(),
    });
  }

  if (stageIdx >= 4) {
    activities.push({
      id: '5',
      type: 'negotiation' as const,
      description: 'Negociação iniciada',
      date: new Date(new Date(lead.createdAt).getTime() + 86400000 * 7).toISOString(),
    });
  }

  if (lead.status === 'won') {
    activities.push({
      id: '6',
      type: 'won' as const,
      description: 'Lead ganho!',
      date: lead.updatedAt,
    });
  }

  if (lead.status === 'lost') {
    activities.push({
      id: '6',
      type: 'lost' as const,
      description: 'Lead perdido',
      date: lead.updatedAt,
    });
  }

  if (lead.notes) {
    activities.push({
      id: '7',
      type: 'note' as const,
      description: lead.notes,
      date: lead.updatedAt,
    });
  }

  return activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

const ACTIVITY_COLORS: Record<string, string> = {
  created: 'bg-slate-500',
  contacted: 'bg-blue-500',
  qualified: 'bg-cyan-500',
  proposal: 'bg-violet-500',
  negotiation: 'bg-amber-500',
  won: 'bg-emerald-500',
  lost: 'bg-red-500',
  note: 'bg-gray-400',
};

// ─── Pipeline Page ───────────────────────────────────────────────────────────

export function PipelinePage() {
  const { leads, addLead, updateLead, deleteLead } = useDataStore();

  // Dialogs
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Form state
  const [form, setForm] = useState<LeadFormData>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [detailLead, setDetailLead] = useState<Lead | null>(null);

  // Form errors
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof LeadFormData, string>>>({});

  // ─── Pipeline Stats ────────────────────────────────────────────────────

  const pipelineValue = useMemo(() => {
    return leads
      .filter((l) => l.status !== 'won' && l.status !== 'lost')
      .reduce((sum, l) => sum + l.value, 0);
  }, [leads]);

  // ─── Grouped Leads ─────────────────────────────────────────────────────

  const groupedLeads = useMemo(() => {
    const groups: Record<Lead['status'], Lead[]> = {
      new: [], contacted: [], qualified: [], proposal: [], negotiation: [], won: [], lost: [],
    };
    leads.forEach((lead) => {
      groups[lead.status].push(lead);
    });
    return groups;
  }, [leads]);

  // ─── Add Lead ──────────────────────────────────────────────────────────

  const openAdd = () => {
    setForm(emptyForm);
    setFormErrors({});
    setAddOpen(true);
  };

  const validateForm = (): boolean => {
    const e: Partial<Record<keyof LeadFormData, string>> = {};
    if (!form.name.trim()) e.name = 'Nome é obrigatório';
    if (!form.email.trim()) e.email = 'Email é obrigatório';
    if (!form.value || form.value <= 0) e.value = 'Informe um valor válido';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAddSave = () => {
    if (!validateForm()) return;

    addLead({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || undefined,
      source: form.source,
      status: form.status,
      value: form.value,
      notes: form.notes.trim() || undefined,
    });

    setAddOpen(false);
    setForm(emptyForm);
  };

  // ─── Edit Lead ─────────────────────────────────────────────────────────

  const openEdit = (lead: Lead) => {
    setEditingId(lead.id);
    setForm({
      name: lead.name,
      email: lead.email,
      phone: lead.phone || '',
      source: lead.source,
      status: lead.status,
      value: lead.value,
      notes: lead.notes || '',
    });
    setFormErrors({});
    setEditOpen(true);
  };

  const handleEditSave = () => {
    if (!validateForm()) return;
    if (!editingId) return;

    updateLead(editingId, {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || undefined,
      source: form.source,
      status: form.status,
      value: form.value,
      notes: form.notes.trim() || undefined,
    });

    setEditOpen(false);
    setEditingId(null);

    // Also update detail if open
    if (detailLead && detailLead.id === editingId) {
      setDetailLead({
        ...detailLead,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        source: form.source,
        status: form.status,
        value: form.value,
        notes: form.notes.trim() || undefined,
        updatedAt: new Date().toISOString(),
      });
    }
  };

  // ─── Detail Lead ───────────────────────────────────────────────────────

  const openDetail = (lead: Lead) => {
    setDetailLead(lead);
    setDetailOpen(true);
  };

  const handleDetailMove = (status: Lead['status']) => {
    if (!detailLead) return;
    updateLead(detailLead.id, { status });
    setDetailLead({ ...detailLead, status, updatedAt: new Date().toISOString() });
  };

  const handleDetailAddNote = (note: string) => {
    if (!detailLead) return;
    const newNotes = detailLead.notes ? `${detailLead.notes}\n${note}` : note;
    updateLead(detailLead.id, { notes: newNotes });
    setDetailLead({ ...detailLead, notes: newNotes, updatedAt: new Date().toISOString() });
  };

  // ─── Move Lead Status ──────────────────────────────────────────────────

  const moveLeadStatus = (id: string, status: Lead['status']) => {
    updateLead(id, { status });
  };

  // ─── Delete ────────────────────────────────────────────────────────────

  const openDelete = (id: string) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteLead(deleteId);
      if (detailLead?.id === deleteId) {
        setDetailOpen(false);
        setDetailLead(null);
      }
    }
    setDeleteOpen(false);
    setDeleteId(null);
  };

  // ─── Lead Form (shared) ────────────────────────────────────────────────

  const renderLeadForm = (isEdit: boolean) => (
    <div className="grid gap-4 py-2">
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Nome</Label>
          <Input
            placeholder="Nome completo"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            aria-invalid={!!formErrors.name}
          />
          {formErrors.name && <p className="text-xs text-destructive">{formErrors.name}</p>}
        </div>
        <div className="grid gap-2">
          <Label>Email</Label>
          <Input
            type="email"
            placeholder="email@exemplo.com"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            aria-invalid={!!formErrors.email}
          />
          {formErrors.email && <p className="text-xs text-destructive">{formErrors.email}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Telefone</Label>
          <Input
            placeholder="(11) 99999-9999"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
        </div>
        <div className="grid gap-2">
          <Label>Origem</Label>
          <Select
            value={form.source}
            onValueChange={(v) => setForm((f) => ({ ...f, source: v as Lead['source'] }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="website">Website</SelectItem>
              <SelectItem value="referral">Indicação</SelectItem>
              <SelectItem value="social">Social</SelectItem>
              <SelectItem value="ads">Anúncios</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Valor (R$)</Label>
          <Input
            type="number"
            min={0}
            step={0.01}
            placeholder="0,00"
            value={form.value || ''}
            onChange={(e) => setForm((f) => ({ ...f, value: parseFloat(e.target.value) || 0 }))}
            aria-invalid={!!formErrors.value}
          />
          {formErrors.value && <p className="text-xs text-destructive">{formErrors.value}</p>}
        </div>
        <div className="grid gap-2">
          <Label>Status</Label>
          <Select
            value={form.status}
            onValueChange={(v) => setForm((f) => ({ ...f, status: v as Lead['status'] }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PIPELINE_STAGES.map((s) => (
                <SelectItem key={s} value={s}>
                  {STAGE_CONFIG[s].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-2">
        <Label>Observações</Label>
        <Textarea
          placeholder="Adicione notas sobre o lead..."
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          rows={3}
        />
      </div>

      {isEdit && editingId && (
        <div className="text-xs text-muted-foreground">
          Criado em: {formatDate(leads.find(l => l.id === editingId)?.createdAt || '')}
        </div>
      )}
    </div>
  );

  // ─── Render ────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">CRM Pipeline</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie leads e oportunidades no funil de vendas visual.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Card className="px-4 py-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Valor Total:</span>
              <span className="text-sm font-bold">{formatBRL(pipelineValue)}</span>
            </div>
          </Card>
          <Button onClick={openAdd} className="shrink-0">
            <Plus className="size-4" />
            Novo Lead
          </Button>
        </div>
      </div>

      {/* Kanban Board - Horizontal scroll on desktop, vertical stack on mobile */}
      <div className="flex flex-col lg:flex-row gap-4 lg:overflow-x-auto lg:pb-4">
        {PIPELINE_STAGES.map((status) => (
          <PipelineColumn
            key={status}
            status={status}
            leads={groupedLeads[status]}
            onEdit={openEdit}
            onDetail={openDetail}
            onDelete={openDelete}
            onMoveStatus={moveLeadStatus}
          />
        ))}
      </div>

      {/* ─── Add Lead Dialog ─────────────────────────────────────────────── */}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo Lead</DialogTitle>
            <DialogDescription>
              Adicione um novo lead ao pipeline de vendas.
            </DialogDescription>
          </DialogHeader>

          {renderLeadForm(false)}

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddSave}>
              Criar Lead
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Edit Lead Dialog ────────────────────────────────────────────── */}

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Lead</DialogTitle>
            <DialogDescription>
              Atualize as informações do lead.
            </DialogDescription>
          </DialogHeader>

          {renderLeadForm(true)}

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

      {/* ─── Lead Detail Dialog ──────────────────────────────────────────── */}

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-lg">
          {detailLead && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  {detailLead.name}
                  <Badge variant="outline" className={cn('text-xs', STAGE_CONFIG[detailLead.status].accentColor, STAGE_CONFIG[detailLead.status].accentBg)}>
                    {STAGE_CONFIG[detailLead.status].label}
                  </Badge>
                </DialogTitle>
                <DialogDescription>
                  Detalhes e histórico do lead
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Lead Info */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium">{detailLead.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Telefone</p>
                    <p className="text-sm font-medium">{detailLead.phone || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Valor</p>
                    <p className="text-sm font-bold">{formatBRL(detailLead.value)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Origem</p>
                    <Badge variant="outline" className={cn('text-xs mt-0.5', SOURCE_CONFIG[detailLead.source].className)}>
                      {SOURCE_CONFIG[detailLead.source].label}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Criado em</p>
                    <p className="text-sm">{formatDate(detailLead.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Atualizado em</p>
                    <p className="text-sm">{formatDate(detailLead.updatedAt)}</p>
                  </div>
                </div>

                {/* Quick Status Change */}
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Mover para:</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {PIPELINE_STAGES.map((s) => (
                      <Button
                        key={s}
                        variant={detailLead.status === s ? 'default' : 'outline'}
                        size="sm"
                        className={cn(
                          'h-7 text-xs',
                          detailLead.status === s && STAGE_CONFIG[s].accentBg,
                          detailLead.status === s && STAGE_CONFIG[s].accentColor,
                          detailLead.status === s && 'border-0'
                        )}
                        onClick={() => handleDetailMove(s)}
                        disabled={detailLead.status === s}
                      >
                        {STAGE_CONFIG[s].label}
                      </Button>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Activity Timeline */}
                <div>
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Clock className="size-4" />
                    Atividades
                  </h4>
                  <ScrollArea className="max-h-48">
                    <div className="space-y-3">
                      {getSimulatedActivities(detailLead).map((activity) => (
                        <div key={activity.id} className="flex items-start gap-3">
                          <div className={cn('size-2 rounded-full mt-1.5 shrink-0', ACTIVITY_COLORS[activity.type] || 'bg-gray-400')} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium">{activity.description}</p>
                            <p className="text-[10px] text-muted-foreground">{formatRelativeDate(activity.date)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                {/* Add Note */}
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Adicionar nota</Label>
                  <div className="flex gap-2">
                    <Input
                      id="detail-note-input"
                      placeholder="Digite uma nota..."
                      className="flex-1 text-sm"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const target = e.target as HTMLInputElement;
                          if (target.value.trim()) {
                            handleDetailAddNote(target.value.trim());
                            target.value = '';
                          }
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const input = document.getElementById('detail-note-input') as HTMLInputElement;
                        if (input?.value.trim()) {
                          handleDetailAddNote(input.value.trim());
                          input.value = '';
                        }
                      }}
                    >
                      Adicionar
                    </Button>
                  </div>
                </div>

                {/* Notes Display */}
                {detailLead.notes && (
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">Observações</Label>
                    <div className="rounded-lg bg-muted/50 p-3 text-sm whitespace-pre-wrap">
                      {detailLead.notes}
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDetailOpen(false);
                    openEdit(detailLead);
                  }}
                >
                  <Pencil className="size-3.5 mr-1" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-600"
                  onClick={() => {
                    setDetailOpen(false);
                    openDelete(detailLead.id);
                  }}
                >
                  <Trash2 className="size-3.5 mr-1" />
                  Excluir
                </Button>
                <Button variant="outline" size="sm" onClick={() => setDetailOpen(false)}>
                  Fechar
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── Delete Confirmation ─────────────────────────────────────────── */}

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este lead? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteId(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-white hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
