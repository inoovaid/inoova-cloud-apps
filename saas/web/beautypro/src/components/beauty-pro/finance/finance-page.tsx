'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useFinancial, formatBRL, formatDateBR } from '@/lib/hooks';
import type { FinancialData, FinancialRecordRow } from '@/lib/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Calendar,
  FileText,
  Plus,
  Pencil,
  Trash2,
  Download,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ---- Status helpers ----
const financialStatusLabel: Record<string, string> = {
  pending: 'Pendente',
  paid: 'Pago',
  overdue: 'Vencido',
  cancelled: 'Cancelado',
};

const financialStatusColor: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  paid: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  overdue: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  cancelled: 'bg-gray-100 text-gray-600 dark:bg-gray-800/30 dark:text-gray-400',
};

const typeLabel: Record<string, string> = {
  receita: 'Receita',
  despesa: 'Despesa',
};

// ---- Summary card config ----
const summaryCards = [
  { key: 'overdue', label: 'Vencidas', countKey: 'overdueCount', accent: 'border-l-red-500', icon: AlertTriangle, iconColor: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/20' },
  { key: 'dueToday', label: 'Vence Hoje', countKey: 'dueTodayCount', accent: 'border-l-orange-500', icon: Calendar, iconColor: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/20' },
  { key: 'dueTomorrow', label: 'Vence Amanhã', countKey: 'dueTomorrowCount', accent: 'border-l-yellow-500', icon: Calendar, iconColor: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-950/20' },
  { key: 'received', label: 'Recebidas', countKey: 'receivedCount', accent: 'border-l-emerald-500', icon: TrendingUp, iconColor: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
  { key: 'total', label: 'Total', countKey: 'totalCount', accent: 'border-l-blue-500', icon: DollarSign, iconColor: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/20' },
  { key: 'allPending', label: 'Todas Pendentes', countKey: 'allPendingCount', accent: 'border-l-purple-500', icon: TrendingDown, iconColor: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/20' },
] as const;

// ---- Form state ----
interface FormState {
  type: string;
  category: string;
  description: string;
  amount: string;
  dueDate: string;
  accountPlan: string;
  notes: string;
  status: string;
}

const emptyForm: FormState = {
  type: 'receita',
  category: '',
  description: '',
  amount: '',
  dueDate: '',
  accountPlan: '',
  notes: '',
  status: 'pending',
};

// ---- Report Dialog ----
function ReportDialog({
  open,
  onOpenChange,
  data,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: FinancialData | undefined;
}) {
  const monthlyData = data?.monthlyData;
  const chartData = useMemo(() => {
    if (!monthlyData) return [];
    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, val]) => ({
        month,
        Receitas: val.receitas,
        Despesas: val.despesas,
        Saldo: val.saldo,
      }));
  }, [monthlyData]);

  const handleExport = () => {
    if (!data?.monthlyData) return;
    const lines: string[] = [
      'Relatório Anual - BeautyPro CRM',
      '================================',
      '',
    ];
    for (const [month, val] of Object.entries(data.monthlyData).sort(([a], [b]) => a.localeCompare(b))) {
      lines.push(`Mês: ${month}`);
      lines.push(`  Receitas: ${formatBRL(val.receitas)}`);
      lines.push(`  Despesas: ${formatBRL(val.despesas)}`);
      lines.push(`  Saldo: ${formatBRL(val.saldo)}`);
      lines.push('');
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'relatorio-financeiro.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Relatório Anual
          </DialogTitle>
          <DialogDescription>Resumo mensal de receitas, despesas e saldo.</DialogDescription>
        </DialogHeader>

        {chartData.length > 0 ? (
          <div className="space-y-6">
            {/* Bar chart */}
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(value: number, name: string) => [formatBRL(value), name]}
                    labelFormatter={(label: string) => `Mês: ${label}`}
                  />
                  <Legend />
                  <Bar dataKey="Receitas" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Saldo" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Monthly table */}
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mês</TableHead>
                    <TableHead className="text-right">Receitas</TableHead>
                    <TableHead className="text-right">Despesas</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {chartData.map((row) => (
                    <TableRow key={row.month}>
                      <TableCell className="font-medium text-sm">{row.month}</TableCell>
                      <TableCell className="text-right text-sm text-emerald-600 dark:text-emerald-400">
                        {formatBRL(row.Receitas)}
                      </TableCell>
                      <TableCell className="text-right text-sm text-red-600 dark:text-red-400">
                        {formatBRL(row.Despesas)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          'text-right text-sm font-semibold',
                          row.Saldo >= 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-red-600 dark:text-red-400'
                        )}
                      >
                        {formatBRL(row.Saldo)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground text-sm">
            Nenhum dado mensal disponível
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button size="sm" onClick={handleExport} disabled={chartData.length === 0}>
            <Download className="w-4 h-4 mr-1.5" />
            Exportar TXT
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---- Main component ----
export function FinancePage() {
  const queryClient = useQueryClient();

  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterAccountPlan, setFilterAccountPlan] = useState('all');

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FinancialRecordRow | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  // Report dialog
  const [reportOpen, setReportOpen] = useState(false);

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Build query params
  const queryParams = useMemo(() => {
    const params: Record<string, string> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (filterAccountPlan && filterAccountPlan !== 'all') params.accountPlan = filterAccountPlan;
    return params;
  }, [startDate, endDate, filterAccountPlan]);

  const { data, isLoading } = useFinancial(queryParams);

  // Open dialog for create
  const handleAdd = () => {
    setEditingRecord(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  // Open dialog for edit
  const handleEdit = (record: FinancialRecordRow) => {
    setEditingRecord(record);
    setForm({
      type: record.type,
      category: record.category,
      description: record.description,
      amount: String(record.amount),
      dueDate: record.dueDate ? record.dueDate.split('T')[0] : '',
      accountPlan: record.accountPlan || '',
      notes: record.notes || '',
      status: record.status,
    });
    setDialogOpen(true);
  };

  // Save (create or update)
  const handleSave = async () => {
    if (!form.description || !form.amount || !form.dueDate) return;
    setSaving(true);
    try {
      const payload = {
        ...(editingRecord ? { id: editingRecord.id } : {}),
        type: form.type,
        category: form.category || 'Outros',
        description: form.description,
        amount: form.amount,
        dueDate: form.dueDate,
        accountPlan: form.accountPlan || null,
        notes: form.notes || null,
        status: form.status,
      };

      const res = await fetch('/api/financial', {
        method: editingRecord ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to save record');

      setDialogOpen(false);
      await queryClient.invalidateQueries({ queryKey: ['financial'] });
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  // Delete
  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/financial?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setDeletingId(null);
      await queryClient.invalidateQueries({ queryKey: ['financial'] });
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setDeleting(false);
    }
  };

  // ---- Render ----
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Top Filters Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-end gap-3">
            <Button onClick={handleAdd} className="shrink-0">
              <Plus className="w-4 h-4 mr-1.5" />
              Adicionar Conta
            </Button>

            <div className="flex items-center gap-2">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Início</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-9 w-[140px]"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Fim</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-9 w-[140px]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Plano de Conta</Label>
              <Select value={filterAccountPlan} onValueChange={setFilterAccountPlan}>
                <SelectTrigger className="h-9 w-[180px]">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {data?.accountPlans?.map((plan) => (
                    <SelectItem key={plan} value={plan}>
                      {plan}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              className="shrink-0"
              onClick={() => setReportOpen(true)}
            >
              <FileText className="w-4 h-4 mr-1.5" />
              Relatório
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {summaryCards.map((card, i) => {
          const Icon = card.icon;
          const amount = data?.summary?.[card.key as keyof typeof data.summary] ?? 0;
          const count = data?.summary?.[card.countKey as keyof typeof data.summary] ?? 0;

          return (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className={cn('border-l-4', card.accent, 'overflow-hidden')}>
                <CardContent className="p-4">
                  <div className={cn('rounded-lg p-2.5 inline-flex mb-2', card.bg)}>
                    <Icon className={cn('w-4 h-4', card.iconColor)} />
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">{card.label}</p>
                  <p className="text-lg font-bold mt-0.5">{formatBRL(amount)}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {count} registro{count !== 1 ? 's' : ''}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Financial Records List */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Registros Financeiros
            </CardTitle>
            {data?.records && (
              <Badge variant="secondary" className="text-xs">
                {data.records.length} registro{data.records.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : !data?.records || data.records.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              <DollarSign className="w-10 h-10 mx-auto mb-3 opacity-30" />
              Nenhum Registro Encontrado
            </div>
          ) : (
            <div className="rounded-lg border border-border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="hidden sm:table-cell">Categoria</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead className="hidden md:table-cell">Vencimento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.records.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="text-sm font-medium max-w-[200px] truncate">
                        {record.description}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={cn(
                            'text-[10px]',
                            record.type === 'receita'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          )}
                        >
                          {record.type === 'receita' ? (
                            <TrendingUp className="w-3 h-3 mr-1" />
                          ) : (
                            <TrendingDown className="w-3 h-3 mr-1" />
                          )}
                          {typeLabel[record.type] || record.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                        {record.category}
                      </TableCell>
                      <TableCell
                        className={cn(
                          'text-sm font-semibold',
                          record.type === 'receita'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-red-600 dark:text-red-400'
                        )}
                      >
                        {record.type === 'despesa' ? '- ' : ''}
                        {formatBRL(record.amount)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {formatDateBR(record.dueDate)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={cn('text-[10px]', financialStatusColor[record.status] || '')}
                        >
                          {financialStatusLabel[record.status] || record.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEdit(record)}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDeletingId(record.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Record Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              {editingRecord ? 'Editar Registro' : 'Adicionar Conta'}
            </DialogTitle>
            <DialogDescription>
              {editingRecord
                ? 'Atualize os dados do registro financeiro.'
                : 'Preencha os dados para criar um novo registro financeiro.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Type */}
            <div className="space-y-1.5">
              <Label className="text-sm">Tipo</Label>
              <Select
                value={form.type}
                onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="receita">
                    <span className="flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                      Receita
                    </span>
                  </SelectItem>
                  <SelectItem value="despesa">
                    <span className="flex items-center gap-1.5">
                      <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                      Despesa
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="text-sm">
                Descrição <span className="text-destructive">*</span>
              </Label>
              <Input
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Ex: Pagamento fornecedor"
                className="h-9"
              />
            </div>

            {/* Category + Amount row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm">Categoria</Label>
                <Input
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  placeholder="Ex: Aluguel"
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">
                  Valor (R$) <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                  placeholder="0,00"
                  className="h-9"
                />
              </div>
            </div>

            {/* Due Date + Account Plan row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm">
                  Vencimento <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Plano de Conta</Label>
                <Select
                  value={form.accountPlan}
                  onValueChange={(v) => setForm((f) => ({ ...f, accountPlan: v }))}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Selecionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    {data?.accountPlans?.map((plan) => (
                      <SelectItem key={plan} value={plan}>
                        {plan}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <Label className="text-sm">Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="paid">Pago</SelectItem>
                  <SelectItem value="overdue">Vencido</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label className="text-sm">Observações</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Notas adicionais..."
                rows={3}
                className="text-sm resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDialogOpen(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving || !form.description || !form.amount || !form.dueDate}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
              ) : null}
              {editingRecord ? 'Salvar Alterações' : 'Criar Registro'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              Confirmar Exclusão
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeletingId(null)}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deletingId && handleDelete(deletingId)}
              disabled={deleting}
            >
              {deleting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
              ) : null}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Dialog */}
      <ReportDialog open={reportOpen} onOpenChange={setReportOpen} data={data} />
    </motion.div>
  );
}
