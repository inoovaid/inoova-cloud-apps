'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, CheckCircle, Clock, AlertTriangle } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts'
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '@/lib/format'
import { motion } from 'framer-motion'

interface DashboardData {
  receitaTotal: number
  totalPagas: number
  totalPendentes: number
  totalVencidas: number
  contasPagasCount: number
  contasPendentesCount: number
  contasVencidasCount: number
  monthlyData: { month: string; receitas: number; despesas: number }[]
  fluxoData: { month: string; receitas: number; despesas: number; saldo: number }[]
  recentAccounts: {
    id: string
    description: string
    amount: number
    dueDate: string
    status: string
    type: string
    client?: { name: string } | null
  }[]
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard')
      .then((res) => res.json())
      .then((data) => {
        setData(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const kpiCards = [
    {
      title: 'Receita Total',
      value: data?.receitaTotal || 0,
      icon: TrendingUp,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/50',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/50',
    },
    {
      title: 'Contas Pagas',
      value: data?.totalPagas || 0,
      subtitle: `${data?.contasPagasCount || 0} contas`,
      icon: CheckCircle,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/50',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/50',
    },
    {
      title: 'Contas Pendentes',
      value: data?.totalPendentes || 0,
      subtitle: `${data?.contasPendentesCount || 0} contas`,
      icon: Clock,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/50',
      iconBg: 'bg-amber-100 dark:bg-amber-900/50',
    },
    {
      title: 'Contas Vencidas',
      value: data?.totalVencidas || 0,
      subtitle: `${data?.contasVencidasCount || 0} contas`,
      icon: AlertTriangle,
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-950/50',
      iconBg: 'bg-red-100 dark:bg-red-900/50',
    },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* KPI Cards */}
      <motion.div variants={item} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.title} className={`${kpi.bg} border-0 shadow-sm`}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {kpi.title}
                  </p>
                  <p className={`text-2xl font-bold ${kpi.color}`}>
                    {formatCurrency(kpi.value)}
                  </p>
                  {kpi.subtitle && (
                    <p className="text-xs text-muted-foreground">{kpi.subtitle}</p>
                  )}
                </div>
                <div className={`rounded-xl p-3 ${kpi.iconBg}`}>
                  <kpi.icon className={`size-5 ${kpi.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Charts */}
      <motion.div variants={item} className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Entradas vs Saídas</CardTitle>
            <CardDescription>Últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.monthlyData || []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12 }}
                    className="fill-muted-foreground"
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    className="fill-muted-foreground"
                    tickFormatter={(v) =>
                      `${(v / 1000).toFixed(0)}k`
                    }
                  />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    labelStyle={{ color: 'var(--foreground)' }}
                    contentStyle={{
                      backgroundColor: 'var(--popover)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar
                    dataKey="receitas"
                    fill="#10b981"
                    name="Receitas"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="despesas"
                    fill="#ef4444"
                    name="Despesas"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Fluxo de Caixa</CardTitle>
            <CardDescription>Acumulado dos últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.fluxoData || []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12 }}
                    className="fill-muted-foreground"
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    className="fill-muted-foreground"
                    tickFormatter={(v) =>
                      `${(v / 1000).toFixed(0)}k`
                    }
                  />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    labelStyle={{ color: 'var(--foreground)' }}
                    contentStyle={{
                      backgroundColor: 'var(--popover)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                    }}
                  />
                  <defs>
                    <linearGradient id="saldoGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="saldo"
                    stroke="#10b981"
                    fill="url(#saldoGrad)"
                    strokeWidth={2}
                    name="Saldo"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Accounts */}
      <motion.div variants={item}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contas Recentes</CardTitle>
            <CardDescription>Últimas contas cadastradas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="hidden sm:table-cell">Cliente</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="hidden md:table-cell">Vencimento</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.recentAccounts.map((account) => (
                    <TableRow key={account.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {account.description}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">
                        {account.client?.name || '-'}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {formatCurrency(account.amount)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {formatDate(account.dueDate)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="secondary"
                          className={getStatusColor(account.status)}
                        >
                          {getStatusLabel(account.status)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
