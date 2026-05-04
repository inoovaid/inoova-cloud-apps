'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  UserPlus,
  DollarSign,
  Award,
  CreditCard,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import {
  AreaChart,
  Area,
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
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import { MOCK_DASHBOARD_STATS } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatBRL = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

// ─── KPI Card ───────────────────────────────────────────────────────────────

interface KPICardProps {
  label: string;
  value: string;
  change: number;
  icon: React.ElementType;
  accentColor: string;
  accentBg: string;
}

function KPICard({ label, value, change, icon: Icon, accentColor, accentBg }: KPICardProps) {
  const isPositive = change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardDescription className="text-sm font-medium">{label}</CardDescription>
          <div className={cn('flex size-10 items-center justify-center rounded-lg', accentBg)}>
            <Icon className={cn('size-5', accentColor)} />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-2xl font-bold tracking-tight">{value}</div>
          <div className="mt-1 flex items-center gap-1 text-xs">
            {isPositive ? (
              <TrendingUp className="size-3.5 text-emerald-500" />
            ) : (
              <TrendingDown className="size-3.5 text-red-500" />
            )}
            <span className={isPositive ? 'text-emerald-600 font-medium' : 'text-red-600 font-medium'}>
              {isPositive ? '+' : ''}{change}%
            </span>
            <span className="text-muted-foreground">vs mês anterior</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Chart Card ─────────────────────────────────────────────────────────────

interface ChartCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

function ChartCard({ title, description, children, className }: ChartCardProps) {
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

// ─── Activity Icon ──────────────────────────────────────────────────────────

const activityConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  enrollment: { icon: UserPlus, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
  payment: { icon: CreditCard, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-500/10' },
  completion: { icon: Award, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' },
  lead: { icon: Users, color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-500/10' },
};

// ─── Pie Chart Colors ───────────────────────────────────────────────────────

const PIE_COLORS = ['#10b981', '#14b8a6', '#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444'];

// ─── Custom Tooltip ─────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color?: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-background px-3 py-2 shadow-md">
      <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
      {payload.map((entry, idx) => (
        <p key={idx} className="text-sm font-semibold" style={{ color: entry.color }}>
          {entry.name}: {typeof entry.value === 'number' && entry.name?.toLowerCase().includes('receita')
            ? formatBRL(entry.value)
            : entry.value}
        </p>
      ))}
    </div>
  );
}

// ─── Dashboard Page ─────────────────────────────────────────────────────────

export function DashboardPage() {
  const stats = MOCK_DASHBOARD_STATS;

  const kpiCards: KPICardProps[] = useMemo(() => [
    {
      label: 'Alunos Ativos',
      value: stats.activeStudents.toString(),
      change: 12,
      icon: Users,
      accentColor: 'text-emerald-600 dark:text-emerald-400',
      accentBg: 'bg-emerald-500/10',
    },
    {
      label: 'Novas Inscrições',
      value: stats.newEnrollments.toString(),
      change: 8,
      icon: UserPlus,
      accentColor: 'text-sky-600 dark:text-sky-400',
      accentBg: 'bg-sky-500/10',
    },
    {
      label: 'Receita Mensal',
      value: formatBRL(stats.monthlyRevenue),
      change: 15,
      icon: DollarSign,
      accentColor: 'text-green-600 dark:text-green-400',
      accentBg: 'bg-green-500/10',
    },
    {
      label: 'Taxa de Conclusão',
      value: `${stats.completionRate}%`,
      change: 3,
      icon: Award,
      accentColor: 'text-amber-600 dark:text-amber-400',
      accentBg: 'bg-amber-500/10',
    },
  ], [stats]);

  return (
    <div className="space-y-6">
      {/* Page Heading */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Visão geral do seu negócio com métricas e indicadores em tempo real.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi) => (
          <KPICard key={kpi.label} {...kpi} />
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Area Chart */}
        <ChartCard title="Receita Mensal" description="Evolução da receita ao longo dos meses">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.revenueByMonth} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Receita"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Enrollments Bar Chart */}
        <ChartCard title="Inscrições por Mês" description="Número de novas inscrições mensais">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.enrollmentsByMonth} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Inscrições" fill="#14b8a6" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Students by Course */}
        <ChartCard title="Alunos por Curso" description="Distribuição de alunos em cada curso">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.studentsByCourse}
                layout="vertical"
                margin={{ top: 4, right: 16, left: 60, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} className="text-muted-foreground" width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="students" name="Alunos" fill="#10b981" radius={[0, 4, 4, 0]} maxBarSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Revenue by Course - Donut */}
        <ChartCard title="Receita por Curso" description="Distribuição de receita entre cursos">
          <div className="h-72 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.revenueByCourse}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  dataKey="revenue"
                  nameKey="name"
                  paddingAngle={3}
                  stroke="none"
                >
                  {stats.revenueByCourse.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatBRL(value)}
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

      {/* Recent Activities */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Atividades Recentes</CardTitle>
            <CardDescription>Últimas atividades do sistema</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="max-h-96 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
              {stats.recentActivities.map((activity) => {
                const config = activityConfig[activity.type] || activityConfig.lead;
                const ActivityIcon = config.icon;
                return (
                  <div
                    key={activity.id}
                    className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg', config.bg)}>
                      <ActivityIcon className={cn('size-4', config.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-tight truncate">{activity.description}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
