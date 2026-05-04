'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign,
  Clock,
  AlertTriangle,
  TrendingUp,
  CreditCard,
  FileText,
  Smartphone,
  Plus,
  Trash2,
  Pencil,
  Search,
  X,
  CheckCircle2,
  MoreHorizontal,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
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
} from '@/components/ui/dropdown-menu';
import { DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useDataStore } from '@/stores/data-store';
import { Payment } from '@/lib/types';
import { cn } from '@/lib/utils';

// ─── Constants ───────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 10;

const STATUS_CONFIG: Record<Payment['status'], { label: string; className: string }> = {
  paid: { label: 'Pago', className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  pending: { label: 'Pendente', className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
  overdue: { label: 'Em Atraso', className: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' },
  cancelled: { label: 'Cancelado', className: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20' },
};

const METHOD_CONFIG: Record<Payment['method'], { label: string; icon: React.ElementType }> = {
  credit_card: { label: 'Cartão', icon: CreditCard },
  boleto: { label: 'Boleto', icon: FileText },
  pix: { label: 'Pix', icon: Smartphone },
};

const PIE_COLORS = ['#10b981', '#f59e0b', '#06b6d4'];

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

function getMonthKey(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

const MONTH_LABELS: Record<string, string> = {
  '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Abr',
  '05': 'Mai', '06': 'Jun', '07': 'Jul', '08': 'Ago',
  '09': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez',
};

// ─── KPI Card ────────────────────────────────────────────────────────────────

interface KPICardProps {
  label: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  accentBg: string;
  accentColor: string;
}

function KPICard({ label, value, subtitle, icon: Icon, accentBg, accentColor }: KPICardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <Card className="relative overflow-hidden">
        <CardContent className="p-4 flex items-center gap-4">
          <div className={cn('flex size-11 shrink-0 items-center justify-center rounded-xl', accentBg)}>
            <Icon className={cn('size-5', accentColor)} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-xl font-bold tracking-tight">{value}</p>
            {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Chart Card ──────────────────────────────────────────────────────────────

function ChartCard({ title, description, children, className }: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={className}
    >
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent className="pt-0">{children}</CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Custom Tooltip ──────────────────────────────────────────────────────────

function CustomBarTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color?: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-background px-3 py-2 shadow-md">
      <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
      {payload.map((entry, idx) => (
        <p key={idx} className="text-sm font-semibold" style={{ color: entry.color }}>
          {entry.name}: {formatBRL(entry.value)}
        </p>
      ))}
    </div>
  );
}

// ─── Form Types ──────────────────────────────────────────────────────────────

interface PaymentFormData {
  studentId: string;
  amount: number;
  method: Payment['method'];
  description: string;
  dueDate: string;
  status: Payment['status'];
  paidAt: string;
}

const emptyForm: PaymentFormData = {
  studentId: '',
  amount: 0,
  method: 'pix',
  description: '',
  dueDate: new Date().toISOString().split('T')[0],
  status: 'pending',
  paidAt: '',
};

// ─── Financial Page ──────────────────────────────────────────────────────────

export function FinancialPage() {
  const { payments, students, addPayment, updatePayment, deletePayment } = useDataStore();

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');

  // Pagination
  const [page, setPage] = useState(1);

  // Dialogs
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Form state
  const [form, setForm] = useState<PaymentFormData>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form errors
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof PaymentFormData, string>>>({});

  // ─── KPI Stats ─────────────────────────────────────────────────────────

  const kpiStats = useMemo(() => {
    const paidPayments = payments.filter((p) => p.status === 'paid');
    const pendingPayments = payments.filter((p) => p.status === 'pending');
    const overduePayments = payments.filter((p) => p.status === 'overdue');

    const totalRevenue = paidPayments.reduce((sum, p) => sum + p.amount, 0);
    const pendingTotal = pendingPayments.reduce((sum, p) => sum + p.amount, 0);
    const overdueTotal = overduePayments.reduce((sum, p) => sum + p.amount, 0);
    const avgTicket = paidPayments.length > 0 ? totalRevenue / paidPayments.length : 0;

    return { totalRevenue, pendingCount: pendingPayments.length, pendingTotal, overdueCount: overduePayments.length, overdueTotal, avgTicket };
  }, [payments]);

  // ─── Chart Data ────────────────────────────────────────────────────────

  const monthlyRevenueData = useMemo(() => {
    const paidPayments = payments.filter((p) => p.status === 'paid');
    const monthMap: Record<string, number> = {};

    paidPayments.forEach((p) => {
      const key = getMonthKey(p.paidAt || p.createdAt);
      monthMap[key] = (monthMap[key] || 0) + p.amount;
    });

    return Object.entries(monthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, amount]) => {
        const [year, month] = key.split('-');
        return {
          month: `${MONTH_LABELS[month]}/${year.slice(2)}`,
          receita: Math.round(amount * 100) / 100,
        };
      });
  }, [payments]);

  const methodChartData = useMemo(() => {
    const counts = { credit_card: 0, boleto: 0, pix: 0 };
    payments.forEach((p) => {
      counts[p.method]++;
    });
    return [
      { name: 'Cartão', value: counts.credit_card },
      { name: 'Boleto', value: counts.boleto },
      { name: 'Pix', value: counts.pix },
    ];
  }, [payments]);

  // ─── Filtered data ─────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let result = [...payments];

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter((p) => p.studentName.toLowerCase().includes(q));
    }

    if (statusFilter !== 'all') {
      result = result.filter((p) => p.status === statusFilter);
    }

    if (methodFilter !== 'all') {
      result = result.filter((p) => p.method === methodFilter);
    }

    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [payments, search, statusFilter, methodFilter]);

  // ─── Pagination ────────────────────────────────────────────────────────

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handlePageChange = (p: number) => {
    setPage(Math.max(1, Math.min(p, totalPages)));
  };

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setMethodFilter('all');
    setPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };
  const handleStatusFilterChange = (val: string) => {
    setStatusFilter(val);
    setPage(1);
  };
  const handleMethodFilterChange = (val: string) => {
    setMethodFilter(val);
    setPage(1);
  };

  // ─── Add Payment ───────────────────────────────────────────────────────

  const openAdd = () => {
    setForm(emptyForm);
    setFormErrors({});
    setAddOpen(true);
  };

  const validateForm = (isEdit = false): boolean => {
    const e: Partial<Record<keyof PaymentFormData, string>> = {};
    if (!form.studentId) e.studentId = 'Selecione um aluno';
    if (!form.amount || form.amount <= 0) e.amount = 'Informe um valor válido';
    if (!form.dueDate) e.dueDate = 'Informe a data de vencimento';
    if (isEdit && form.status === 'paid' && !form.paidAt) e.paidAt = 'Informe a data de pagamento';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAddSave = () => {
    if (!validateForm()) return;
    const student = students.find((s) => s.id === form.studentId);
    if (!student) return;

    addPayment({
      studentId: student.id,
      studentName: student.name,
      amount: form.amount,
      method: form.method,
      description: form.description || undefined,
      dueDate: new Date(form.dueDate + 'T12:00:00Z').toISOString(),
      status: form.status,
      paidAt: form.status === 'paid' && form.paidAt ? new Date(form.paidAt + 'T12:00:00Z').toISOString() : undefined,
    });

    setAddOpen(false);
    setForm(emptyForm);
  };

  // ─── Edit Payment ──────────────────────────────────────────────────────

  const openEdit = (payment: Payment) => {
    setEditingId(payment.id);
    setForm({
      studentId: payment.studentId,
      amount: payment.amount,
      method: payment.method,
      description: payment.description || '',
      dueDate: payment.dueDate.split('T')[0],
      status: payment.status,
      paidAt: payment.paidAt ? payment.paidAt.split('T')[0] : '',
    });
    setFormErrors({});
    setEditOpen(true);
  };

  const handleEditSave = () => {
    if (!validateForm(true)) return;
    if (!editingId) return;

    const student = students.find((s) => s.id === form.studentId);

    updatePayment(editingId, {
      studentId: form.studentId,
      studentName: student?.name ?? payments.find(p => p.id === editingId)?.studentName ?? '',
      amount: form.amount,
      method: form.method,
      description: form.description || undefined,
      dueDate: new Date(form.dueDate + 'T12:00:00Z').toISOString(),
      status: form.status,
      paidAt: form.status === 'paid' && form.paidAt ? new Date(form.paidAt + 'T12:00:00Z').toISOString() : undefined,
    });

    setEditOpen(false);
    setEditingId(null);
  };

  // ─── Mark as Paid ──────────────────────────────────────────────────────

  const markAsPaid = (payment: Payment) => {
    updatePayment(payment.id, {
      status: 'paid',
      paidAt: new Date().toISOString(),
    });
  };

  // ─── Delete ────────────────────────────────────────────────────────────

  const openDelete = (id: string) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deletePayment(deleteId);
    }
    setDeleteOpen(false);
    setDeleteId(null);
  };

  // ─── Render ────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Financeiro</h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe receitas, pagamentos e inadimplências em um só lugar.
          </p>
        </div>
        <Button onClick={openAdd} className="shrink-0">
          <Plus className="size-4" />
          Novo Pagamento
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Receita Total"
          value={formatBRL(kpiStats.totalRevenue)}
          icon={DollarSign}
          accentBg="bg-green-500/15"
          accentColor="text-green-600 dark:text-green-400"
        />
        <KPICard
          label="Pagamentos Pendentes"
          value={String(kpiStats.pendingCount)}
          subtitle={formatBRL(kpiStats.pendingTotal)}
          icon={Clock}
          accentBg="bg-amber-500/15"
          accentColor="text-amber-600 dark:text-amber-400"
        />
        <KPICard
          label="Pagamentos em Atraso"
          value={String(kpiStats.overdueCount)}
          subtitle={formatBRL(kpiStats.overdueTotal)}
          icon={AlertTriangle}
          accentBg="bg-red-500/15"
          accentColor="text-red-600 dark:text-red-400"
        />
        <KPICard
          label="Ticket Médio"
          value={formatBRL(kpiStats.avgTicket)}
          icon={TrendingUp}
          accentBg="bg-emerald-500/15"
          accentColor="text-emerald-600 dark:text-emerald-400"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Receita por Mês - Bar Chart */}
        <ChartCard title="Receita por Mês" description="Receita de pagamentos recebidos agrupados por mês">
          <div className="h-72">
            {monthlyRevenueData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Nenhum pagamento recebido ainda.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyRevenueData} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                  <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Bar dataKey="receita" name="Receita" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartCard>

        {/* Pagamentos por Método - Pie Chart */}
        <ChartCard title="Pagamentos por Método" description="Distribuição de pagamentos por forma de pagamento">
          <div className="h-72 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={methodChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  dataKey="value"
                  nameKey="name"
                  paddingAngle={3}
                  stroke="none"
                >
                  {methodChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => `${value} pagamento${value !== 1 ? 's' : ''}`}
                  contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--background))' }}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  iconSize={8}
                  formatter={(value: string) => <span className="text-xs text-foreground">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por aluno..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
          {search && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
        <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="paid">Pago</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="overdue">Em Atraso</SelectItem>
            <SelectItem value="cancelled">Cancelado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={methodFilter} onValueChange={handleMethodFilterChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar método" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="credit_card">Cartão</SelectItem>
            <SelectItem value="boleto">Boleto</SelectItem>
            <SelectItem value="pix">Pix</SelectItem>
          </SelectContent>
        </Select>
        {(search || statusFilter !== 'all' || methodFilter !== 'all') && (
          <Button variant="ghost" size="sm" onClick={resetFilters} className="text-xs">
            <X className="size-3.5 mr-1" />
            Limpar filtros
          </Button>
        )}
        <span className="text-xs text-muted-foreground">
          {filtered.length} pagamento{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="rounded-lg border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aluno</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead className="hidden md:table-cell">Descrição</TableHead>
                  <TableHead className="hidden sm:table-cell">Vencimento</TableHead>
                  <TableHead className="hidden lg:table-cell">Pagamento</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence mode="popLayout">
                  {paginated.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                        Nenhum pagamento encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginated.map((payment) => {
                      const statusCfg = STATUS_CONFIG[payment.status];
                      const methodCfg = METHOD_CONFIG[payment.method];
                      const MethodIcon = methodCfg.icon;
                      return (
                        <motion.tr
                          key={payment.id}
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="hover:bg-muted/50 border-b transition-colors"
                        >
                          <TableCell>
                            <span className="font-medium text-sm truncate max-w-[150px] block">
                              {payment.studentName}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm font-semibold">{formatBRL(payment.amount)}</span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn('text-xs', statusCfg.className)}>
                              {statusCfg.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <MethodIcon className="size-3.5 text-muted-foreground" />
                              <span className="text-sm">{methodCfg.label}</span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <span className="text-sm text-muted-foreground truncate max-w-[160px] block">
                              {payment.description || '—'}
                            </span>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                            {formatDate(payment.dueDate)}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                            {payment.paidAt ? formatDate(payment.paidAt) : '—'}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="size-8">
                                  <span className="sr-only">Ações</span>
                                  <MoreHorizontal className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {(payment.status === 'pending' || payment.status === 'overdue') && (
                                  <>
                                    <DropdownMenuItem onClick={() => markAsPaid(payment)}>
                                      <CheckCircle2 className="size-4 mr-2 text-emerald-600" />
                                      Marcar como Pago
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                  </>
                                )}
                                <DropdownMenuItem onClick={() => openEdit(payment)}>
                                  <Pencil className="size-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => openDelete(payment.id)}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="size-4 mr-2" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </motion.tr>
                      );
                    })
                  )}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
        </div>
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} de {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="size-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
              .reduce<(number | string)[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...');
                acc.push(p);
                return acc;
              }, [])
              .map((p, idx) =>
                typeof p === 'string' ? (
                  <span key={`ellipsis-${idx}`} className="px-1 text-xs text-muted-foreground">...</span>
                ) : (
                  <Button
                    key={p}
                    variant={currentPage === p ? 'default' : 'outline'}
                    size="icon"
                    className="size-8 text-xs"
                    onClick={() => handlePageChange(p)}
                  >
                    {p}
                  </Button>
                )
              )}
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ─── Add Payment Dialog ──────────────────────────────────────────── */}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Pagamento</DialogTitle>
            <DialogDescription>
              Registre um novo pagamento no sistema.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Aluno</Label>
              <Select
                value={form.studentId}
                onValueChange={(v) => setForm((f) => ({ ...f, studentId: v }))}
              >
                <SelectTrigger aria-invalid={!!formErrors.studentId}>
                  <SelectValue placeholder="Selecione um aluno" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {students.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.studentId && <p className="text-xs text-destructive">{formErrors.studentId}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Valor (R$)</Label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder="0,00"
                  value={form.amount || ''}
                  onChange={(e) => setForm((f) => ({ ...f, amount: parseFloat(e.target.value) || 0 }))}
                  aria-invalid={!!formErrors.amount}
                />
                {formErrors.amount && <p className="text-xs text-destructive">{formErrors.amount}</p>}
              </div>
              <div className="grid gap-2">
                <Label>Método</Label>
                <Select
                  value={form.method}
                  onValueChange={(v) => setForm((f) => ({ ...f, method: v as Payment['method'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credit_card">Cartão</SelectItem>
                    <SelectItem value="boleto">Boleto</SelectItem>
                    <SelectItem value="pix">Pix</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Descrição</Label>
              <Input
                placeholder="Ex: Matrícula - Front-end Completo"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Vencimento</Label>
                <Input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                  aria-invalid={!!formErrors.dueDate}
                />
                {formErrors.dueDate && <p className="text-xs text-destructive">{formErrors.dueDate}</p>}
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm((f) => ({ ...f, status: v as Payment['status'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="paid">Pago</SelectItem>
                    <SelectItem value="overdue">Em Atraso</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddSave}>
              Criar Pagamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Edit Payment Dialog ─────────────────────────────────────────── */}

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Pagamento</DialogTitle>
            <DialogDescription>
              Atualize as informações do pagamento.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Aluno</Label>
              <Select
                value={form.studentId}
                onValueChange={(v) => setForm((f) => ({ ...f, studentId: v }))}
              >
                <SelectTrigger aria-invalid={!!formErrors.studentId}>
                  <SelectValue placeholder="Selecione um aluno" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {students.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.studentId && <p className="text-xs text-destructive">{formErrors.studentId}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Valor (R$)</Label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder="0,00"
                  value={form.amount || ''}
                  onChange={(e) => setForm((f) => ({ ...f, amount: parseFloat(e.target.value) || 0 }))}
                  aria-invalid={!!formErrors.amount}
                />
                {formErrors.amount && <p className="text-xs text-destructive">{formErrors.amount}</p>}
              </div>
              <div className="grid gap-2">
                <Label>Método</Label>
                <Select
                  value={form.method}
                  onValueChange={(v) => setForm((f) => ({ ...f, method: v as Payment['method'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credit_card">Cartão</SelectItem>
                    <SelectItem value="boleto">Boleto</SelectItem>
                    <SelectItem value="pix">Pix</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Descrição</Label>
              <Input
                placeholder="Ex: Matrícula - Front-end Completo"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Vencimento</Label>
                <Input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                  aria-invalid={!!formErrors.dueDate}
                />
                {formErrors.dueDate && <p className="text-xs text-destructive">{formErrors.dueDate}</p>}
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm((f) => ({ ...f, status: v as Payment['status'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="paid">Pago</SelectItem>
                    <SelectItem value="overdue">Em Atraso</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {form.status === 'paid' && (
              <div className="grid gap-2">
                <Label>Data de Pagamento</Label>
                <Input
                  type="date"
                  value={form.paidAt}
                  onChange={(e) => setForm((f) => ({ ...f, paidAt: e.target.value }))}
                  aria-invalid={!!formErrors.paidAt}
                />
                {formErrors.paidAt && <p className="text-xs text-destructive">{formErrors.paidAt}</p>}
              </div>
            )}
          </div>

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

      {/* ─── Delete Confirmation ─────────────────────────────────────────── */}

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este pagamento? Esta ação não pode ser desfeita.
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
