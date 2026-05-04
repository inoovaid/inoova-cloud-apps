'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Users,
  Target,
  DollarSign,
  GraduationCap,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { useDataStore } from '@/stores/data-store';
import { cn } from '@/lib/utils';

// ─── Constants ───────────────────────────────────────────────────────────────

const COLORS = ['#10b981', '#06b6d4', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const MONTH_LABELS: Record<string, string> = {
  '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Abr',
  '05': 'Mai', '06': 'Jun', '07': 'Jul', '08': 'Ago',
  '09': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez',
};

const LEAD_SOURCE_LABELS: Record<string, string> = {
  website: 'Website',
  referral: 'Indicação',
  social: 'Redes Sociais',
  ads: 'Anúncios',
};

const LEAD_STATUS_LABELS: Record<string, string> = {
  new: 'Novo',
  contacted: 'Contatado',
  qualified: 'Qualificado',
  proposal: 'Proposta',
  negotiation: 'Negociação',
  won: 'Ganho',
  lost: 'Perdido',
};

const PIPELINE_STAGES = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won'] as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatBRL = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

function getMonthKey(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
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

function CurrencyTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color?: string }>; label?: string }) {
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

function NumberTooltip({ active, payload, label, suffix = '' }: { active?: boolean; payload?: Array<{ value: number; name: string; color?: string }>; label?: string; suffix?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-background px-3 py-2 shadow-md">
      <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
      {payload.map((entry, idx) => (
        <p key={idx} className="text-sm font-semibold" style={{ color: entry.color }}>
          {entry.name}: {entry.value}{suffix}
        </p>
      ))}
    </div>
  );
}

// ─── Funnel Bar ──────────────────────────────────────────────────────────────

function FunnelStep({ label, count, maxCount, color }: { label: string; count: number; maxCount: number; color: string }) {
  const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="w-28 text-sm text-right text-muted-foreground shrink-0">{label}</div>
      <div className="flex-1 h-8 bg-muted/50 rounded-md overflow-hidden relative">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="h-full rounded-md flex items-center px-3"
          style={{ backgroundColor: color, minWidth: count > 0 ? '2rem' : undefined }}
        >
          <span className="text-xs font-semibold text-white">{count}</span>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Reports Page ────────────────────────────────────────────────────────────

export function ReportsPage() {
  const { payments, enrollments, courses, leads } = useDataStore();
  const [period, setPeriod] = useState('this_month');

  // ─── Period Filtering ────────────────────────────────────────────────

  const periodFilteredPayments = useMemo(() => {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'this_month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'last_quarter':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      case 'this_year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(2020, 0, 1);
    }

    return payments.filter(p => new Date(p.createdAt) >= startDate);
  }, [payments, period]);

  const periodFilteredEnrollments = useMemo(() => {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'this_month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'last_quarter':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      case 'this_year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(2020, 0, 1);
    }

    return enrollments.filter(e => new Date(e.enrolledAt) >= startDate);
  }, [enrollments, period]);

  // ─── Tab 1: Receita por Curso ────────────────────────────────────────

  const revenueByCourse = useMemo(() => {
    const courseMap: Record<string, { name: string; revenue: number; count: number }> = {};

    courses.forEach(c => {
      courseMap[c.id] = { name: c.name, revenue: 0, count: 0 };
    });

    periodFilteredPayments
      .filter(p => p.status === 'paid')
      .forEach(p => {
        // Match payment to course via description or enrollment
        const enrollment = enrollments.find(e => e.studentId === p.studentId);
        if (enrollment && courseMap[enrollment.courseId]) {
          courseMap[enrollment.courseId].revenue += p.amount;
          courseMap[enrollment.courseId].count += 1;
        } else {
          // Try to match from description
          const matchedCourse = courses.find(c => p.description?.includes(c.name));
          if (matchedCourse && courseMap[matchedCourse.id]) {
            courseMap[matchedCourse.id].revenue += p.amount;
            courseMap[matchedCourse.id].count += 1;
          }
        }
      });

    return Object.entries(courseMap)
      .map(([id, data]) => ({
        id,
        name: data.name.replace(' Completo', ''),
        fullName: data.name,
        revenue: Math.round(data.revenue * 100) / 100,
        count: data.count,
        avgTicket: data.count > 0 ? Math.round((data.revenue / data.count) * 100) / 100 : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [periodFilteredPayments, enrollments, courses]);

  const revenueChartData = useMemo(() =>
    revenueByCourse.map(c => ({
      name: c.name,
      receita: c.revenue,
    })),
  [revenueByCourse]);

  const totalRevenue = useMemo(() =>
    revenueByCourse.reduce((sum, c) => sum + c.revenue, 0),
  [revenueByCourse]);

  // ─── Tab 2: Engajamento ──────────────────────────────────────────────

  const enrollmentTrends = useMemo(() => {
    const monthMap: Record<string, number> = {};
    periodFilteredEnrollments.forEach(e => {
      const key = getMonthKey(e.enrolledAt);
      monthMap[key] = (monthMap[key] || 0) + 1;
    });

    return Object.entries(monthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, count]) => {
        const [year, month] = key.split('-');
        return {
          month: `${MONTH_LABELS[month]}/${year.slice(2)}`,
          matriculas: count,
        };
      });
  }, [periodFilteredEnrollments]);

  const avgProgressByCourse = useMemo(() => {
    const courseMap: Record<string, { name: string; totalProgress: number; count: number }> = {};

    courses.forEach(c => {
      courseMap[c.id] = { name: c.name, totalProgress: 0, count: 0 };
    });

    enrollments.forEach(e => {
      if (courseMap[e.courseId]) {
        courseMap[e.courseId].totalProgress += e.progress;
        courseMap[e.courseId].count += 1;
      }
    });

    return Object.entries(courseMap)
      .map(([, data]) => ({
        name: data.name.replace(' Completo', ''),
        progress: data.count > 0 ? Math.round(data.totalProgress / data.count) : 0,
      }))
      .sort((a, b) => b.progress - a.progress);
  }, [enrollments, courses]);

  const mostActiveStudents = useMemo(() => {
    const studentMap: Record<string, { name: string; count: number }> = {};
    enrollments.forEach(e => {
      if (!studentMap[e.studentId]) {
        studentMap[e.studentId] = { name: e.studentName, count: 0 };
      }
      studentMap[e.studentId].count += 1;
    });
    return Object.entries(studentMap)
      .map(([, data]) => data)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [enrollments]);

  // ─── Tab 3: Conclusão ────────────────────────────────────────────────

  const completionByCourse = useMemo(() => {
    const courseMap: Record<string, { name: string; completed: number; total: number }> = {};

    courses.forEach(c => {
      courseMap[c.id] = { name: c.name, completed: 0, total: 0 };
    });

    enrollments.forEach(e => {
      if (courseMap[e.courseId]) {
        courseMap[e.courseId].total += 1;
        if (e.status === 'completed') {
          courseMap[e.courseId].completed += 1;
        }
      }
    });

    return Object.entries(courseMap)
      .map(([, data]) => ({
        name: data.name.replace(' Completo', ''),
        taxa: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
        completed: data.completed,
        total: data.total,
      }))
      .sort((a, b) => b.taxa - a.taxa);
  }, [enrollments, courses]);

  const overallCompletion = useMemo(() => {
    const total = enrollments.length;
    const completed = enrollments.filter(e => e.status === 'completed').length;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }, [enrollments]);

  const conversionFunnel = useMemo(() => {
    const enrolled = enrollments.length;
    const inProgress = enrollments.filter(e => e.status === 'active' && e.progress > 0).length;
    const completed = enrollments.filter(e => e.status === 'completed').length;
    return { enrolled, inProgress, completed };
  }, [enrollments]);

  // ─── Tab 4: Leads ────────────────────────────────────────────────────

  const leadSourceDistribution = useMemo(() => {
    const sourceMap: Record<string, number> = {};
    leads.forEach(l => {
      sourceMap[l.source] = (sourceMap[l.source] || 0) + 1;
    });
    return Object.entries(sourceMap).map(([source, count]) => ({
      name: LEAD_SOURCE_LABELS[source] || source,
      value: count,
    }));
  }, [leads]);

  const conversionBySource = useMemo(() => {
    const sourceMap: Record<string, { total: number; won: number }> = {};
    leads.forEach(l => {
      if (!sourceMap[l.source]) sourceMap[l.source] = { total: 0, won: 0 };
      sourceMap[l.source].total += 1;
      if (l.status === 'won') sourceMap[l.source].won += 1;
    });
    return Object.entries(sourceMap).map(([source, data]) => ({
      name: LEAD_SOURCE_LABELS[source] || source,
      total: data.total,
      won: data.won,
      rate: data.total > 0 ? Math.round((data.won / data.total) * 100) : 0,
    }));
  }, [leads]);

  const pipelineFunnel = useMemo(() => {
    const stageMap: Record<string, number> = {};
    leads.forEach(l => {
      stageMap[l.status] = (stageMap[l.status] || 0) + 1;
    });
    return PIPELINE_STAGES.map(stage => ({
      stage,
      label: LEAD_STATUS_LABELS[stage],
      count: stageMap[stage] || 0,
    }));
  }, [leads]);

  const maxPipelineCount = useMemo(() =>
    Math.max(...pipelineFunnel.map(p => p.count), 1),
  [pipelineFunnel]);

  // ─── KPI Cards ───────────────────────────────────────────────────────

  const paidPaymentsCount = periodFilteredPayments.filter(p => p.status === 'paid').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Relatórios e Análises</h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe métricas de receita, engajamento e conversão.
          </p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="this_month">Este mês</SelectItem>
            <SelectItem value="last_quarter">Último trimestre</SelectItem>
            <SelectItem value="this_year">Este ano</SelectItem>
            <SelectItem value="custom">Personalizado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <Card className="relative overflow-hidden">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-green-500/15">
                <DollarSign className="size-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Receita Total</p>
                <p className="text-xl font-bold tracking-tight">{formatBRL(totalRevenue)}</p>
                <p className="text-[11px] text-muted-foreground">{paidPaymentsCount} pagamentos</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}>
          <Card className="relative overflow-hidden">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15">
                <GraduationCap className="size-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Matrículas</p>
                <p className="text-xl font-bold tracking-tight">{periodFilteredEnrollments.length}</p>
                <p className="text-[11px] text-muted-foreground">no período selecionado</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }}>
          <Card className="relative overflow-hidden">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-cyan-500/15">
                <Target className="size-5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Taxa de Conclusão</p>
                <p className="text-xl font-bold tracking-tight">{overallCompletion}%</p>
                <p className="text-[11px] text-muted-foreground">cursos concluídos</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.15 }}>
          <Card className="relative overflow-hidden">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/15">
                <Users className="size-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Leads</p>
                <p className="text-xl font-bold tracking-tight">{leads.length}</p>
                <p className="text-[11px] text-muted-foreground">{leads.filter(l => l.status === 'won').length} ganhos</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="revenue" className="space-y-6">
        <TabsList className="flex-wrap">
          <TabsTrigger value="revenue">
            <DollarSign className="size-4 mr-1.5" />
            Receita por Curso
          </TabsTrigger>
          <TabsTrigger value="engagement">
            <TrendingUp className="size-4 mr-1.5" />
            Engajamento
          </TabsTrigger>
          <TabsTrigger value="completion">
            <Target className="size-4 mr-1.5" />
            Conclusão
          </TabsTrigger>
          <TabsTrigger value="leads">
            <Users className="size-4 mr-1.5" />
            Leads
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Receita por Curso */}
        <TabsContent value="revenue" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-1">
            <ChartCard title="Receita por Curso" description="Receita total de pagamentos recebidos por curso">
              <div className="h-80">
                {revenueChartData.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    Nenhum dado disponível.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueChartData} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 12 }} className="text-muted-foreground" tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} className="text-muted-foreground" width={90} />
                      <Tooltip content={<CurrencyTooltip />} />
                      <Bar dataKey="receita" name="Receita" fill="#10b981" radius={[0, 4, 4, 0]} maxBarSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </ChartCard>
          </div>

          {/* Revenue Table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Detalhamento por Curso</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Curso</TableHead>
                      <TableHead className="text-right">Receita Total</TableHead>
                      <TableHead className="text-right">Nº Pagamentos</TableHead>
                      <TableHead className="text-right">Ticket Médio</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {revenueByCourse.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell className="font-medium">{course.fullName}</TableCell>
                        <TableCell className="text-right font-semibold">{formatBRL(course.revenue)}</TableCell>
                        <TableCell className="text-right">{course.count}</TableCell>
                        <TableCell className="text-right">{formatBRL(course.avgTicket)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/30">
                      <TableCell className="font-bold">Total</TableCell>
                      <TableCell className="text-right font-bold">{formatBRL(totalRevenue)}</TableCell>
                      <TableCell className="text-right font-bold">{paidPaymentsCount}</TableCell>
                      <TableCell className="text-right font-bold">
                        {formatBRL(paidPaymentsCount > 0 ? totalRevenue / paidPaymentsCount : 0)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Engajamento */}
        <TabsContent value="engagement" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <ChartCard title="Tendência de Matrículas" description="Número de matrículas ao longo do tempo">
              <div className="h-72">
                {enrollmentTrends.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    Nenhum dado disponível.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={enrollmentTrends} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                      <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                      <Tooltip content={<NumberTooltip suffix=" matrículas" />} />
                      <Line type="monotone" dataKey="matriculas" name="Matrículas" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </ChartCard>

            <ChartCard title="Progresso Médio por Curso" description="Média de progresso dos alunos por curso">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={avgProgressByCourse} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                    <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" tickFormatter={(v: number) => `${v}%`} domain={[0, 100]} />
                    <Tooltip content={<NumberTooltip suffix="%" />} />
                    <Bar dataKey="progress" name="Progresso Médio" fill="#06b6d4" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Alunos Mais Ativos</CardTitle>
              <CardDescription>Top 10 alunos por número de matrículas</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {mostActiveStudents.map((student, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className={cn(
                      'flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                      idx === 0 ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400' :
                      idx === 1 ? 'bg-gray-400/15 text-gray-600 dark:text-gray-400' :
                      idx === 2 ? 'bg-orange-500/15 text-orange-600 dark:text-orange-400' :
                      'bg-muted text-muted-foreground'
                    )}>
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{student.name}</p>
                    </div>
                    <Badge variant="outline" className="shrink-0">
                      {student.count} matrícula{student.count !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Conclusão */}
        <TabsContent value="completion" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <ChartCard title="Taxa de Conclusão por Curso" description="Percentual de alunos que concluíram cada curso">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={completionByCourse} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                    <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" tickFormatter={(v: number) => `${v}%`} domain={[0, 100]} />
                    <Tooltip content={<NumberTooltip suffix="%" />} />
                    <Bar dataKey="taxa" name="Taxa de Conclusão" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Tempo Médio de Conclusão</CardTitle>
                <CardDescription>Estimativa de tempo para conclusão por curso</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4 mt-2">
                  {courses.map((course) => {
                    const courseEnrollments = enrollments.filter(e => e.courseId === course.id && e.status === 'completed');
                    const avgDays = courseEnrollments.length > 0
                      ? courseEnrollments.reduce((sum, e) => {
                          const enrolled = new Date(e.enrolledAt);
                          const completed = e.completedAt ? new Date(e.completedAt) : new Date();
                          return sum + Math.max(1, Math.ceil((completed.getTime() - enrolled.getTime()) / (1000 * 60 * 60 * 24)));
                        }, 0) / courseEnrollments.length
                      : 0;

                    return (
                      <div key={course.id} className="flex items-center justify-between">
                        <span className="text-sm truncate">{course.name.replace(' Completo', '')}</span>
                        <span className="text-sm font-semibold shrink-0 ml-4">
                          {avgDays > 0 ? `${Math.round(avgDays)} dias` : '—'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Funil de Conversão</CardTitle>
              <CardDescription>Inscritos → Em andamento → Concluídos</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4 max-w-xl mx-auto">
                <FunnelStep
                  label="Inscritos"
                  count={conversionFunnel.enrolled}
                  maxCount={conversionFunnel.enrolled}
                  color="#06b6d4"
                />
                <FunnelStep
                  label="Em andamento"
                  count={conversionFunnel.inProgress}
                  maxCount={conversionFunnel.enrolled}
                  color="#f59e0b"
                />
                <FunnelStep
                  label="Concluídos"
                  count={conversionFunnel.completed}
                  maxCount={conversionFunnel.enrolled}
                  color="#10b981"
                />
                <div className="flex justify-center gap-6 pt-2 text-xs text-muted-foreground">
                  <span>Inscritos → Em andamento: <strong className="text-foreground">{conversionFunnel.enrolled > 0 ? Math.round((conversionFunnel.inProgress / conversionFunnel.enrolled) * 100) : 0}%</strong></span>
                  <span>Em andamento → Concluídos: <strong className="text-foreground">{conversionFunnel.inProgress > 0 ? Math.round((conversionFunnel.completed / conversionFunnel.inProgress) * 100) : 0}%</strong></span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Leads */}
        <TabsContent value="leads" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <ChartCard title="Distribuição por Fonte" description="Origem dos leads captados">
              <div className="h-72 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={leadSourceDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      dataKey="value"
                      nameKey="name"
                      paddingAngle={3}
                      stroke="none"
                    >
                      {leadSourceDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => `${value} lead${value !== 1 ? 's' : ''}`}
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

            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Conversão por Fonte</CardTitle>
                <CardDescription>Taxa de leads ganhos por origem</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4 mt-2">
                  {conversionBySource.map((source) => (
                    <div key={source.name} className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{source.name}</span>
                          <span className="text-sm font-semibold">{source.rate}%</span>
                        </div>
                        <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${source.rate}%` }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                            className="h-full rounded-full bg-emerald-500"
                          />
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1">
                          {source.won} de {source.total} leads
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Pipeline de Conversão</CardTitle>
              <CardDescription>Novo → Contatado → Qualificado → Proposta → Negociação → Ganho</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3 max-w-2xl mx-auto">
                {pipelineFunnel.map((stage, idx) => (
                  <FunnelStep
                    key={stage.stage}
                    label={stage.label}
                    count={stage.count}
                    maxCount={maxPipelineCount}
                    color={COLORS[idx % COLORS.length]}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
