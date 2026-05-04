'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import {
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileBarChart,
} from 'lucide-react'
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '@/lib/format'
import { motion } from 'framer-motion'

interface Account {
  id: string
  description: string
  amount: number
  dueDate: string
  paymentDate: string | null
  status: string
  type: string
  client?: { id: string; name: string } | null
  accountPlan?: { id: string; name: string; type: string } | null
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#6366f1', '#64748b']

export function RelatoriosPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const fetchAccounts = useCallback(() => {
    const params = new URLSearchParams()
    if (statusFilter !== 'all') params.set('status', statusFilter)
    if (typeFilter !== 'all') params.set('type', typeFilter)
    if (startDate) params.set('startDate', startDate)
    if (endDate) params.set('endDate', endDate)
    setLoading(true)
    return fetch(`/api/accounts?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setAccounts(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [statusFilter, typeFilter, startDate, endDate])

  useEffect(() => {
    fetchAccounts()
  }, [fetchAccounts])

  const totalReceitas = accounts
    .filter((a) => a.type === 'receber')
    .reduce((s, a) => s + a.amount, 0)
  const totalDespesas = accounts
    .filter((a) => a.type === 'pagar')
    .reduce((s, a) => s + a.amount, 0)
  const saldo = totalReceitas - totalDespesas

  const statusData = [
    { name: 'Paga', value: accounts.filter((a) => a.status === 'paga').length, color: '#10b981' },
    { name: 'Pendente', value: accounts.filter((a) => a.status === 'pendente').length, color: '#f59e0b' },
    { name: 'Vencida', value: accounts.filter((a) => a.status === 'vencida').length, color: '#ef4444' },
    { name: 'Cancelada', value: accounts.filter((a) => a.status === 'cancelada').length, color: '#64748b' },
  ]

  const monthlyData: { month: string; receitas: number; despesas: number }[] = []
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthName = monthDate.toLocaleDateString('pt-BR', {
      month: 'short',
      year: '2-digit',
    })
    const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
    const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59)

    const monthAccounts = accounts.filter((a) => {
      const d = new Date(a.dueDate)
      return d >= monthStart && d <= monthEnd
    })

    monthlyData.push({
      month: monthName,
      receitas: monthAccounts
        .filter((a) => a.type === 'receber')
        .reduce((s, a) => s + a.amount, 0),
      despesas: monthAccounts
        .filter((a) => a.type === 'pagar')
        .reduce((s, a) => s + a.amount, 0),
    })
  }

  const summaryCards = [
    {
      title: 'Total Receitas',
      value: totalReceitas,
      icon: TrendingUp,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/50',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/50',
    },
    {
      title: 'Total Despesas',
      value: totalDespesas,
      icon: TrendingDown,
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-950/50',
      iconBg: 'bg-red-100 dark:bg-red-900/50',
    },
    {
      title: 'Saldo',
      value: saldo,
      icon: DollarSign,
      color: saldo >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400',
      bg: saldo >= 0 ? 'bg-emerald-50 dark:bg-emerald-950/50' : 'bg-red-50 dark:bg-red-950/50',
      iconBg: saldo >= 0 ? 'bg-emerald-100 dark:bg-emerald-900/50' : 'bg-red-100 dark:bg-red-900/50',
    },
  ]

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Relatórios</h2>
          <p className="text-sm text-muted-foreground">
            Análise detalhada das suas finanças
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="mr-2 size-4" />
          Exportar PDF
        </Button>
      </motion.div>

      {/* Filters */}
      <motion.div variants={item} className="flex flex-wrap gap-2 items-center">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-36 h-9">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pagar">Despesas</SelectItem>
            <SelectItem value="receber">Receitas</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36 h-9">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="paga">Paga</SelectItem>
            <SelectItem value="vencida">Vencida</SelectItem>
            <SelectItem value="cancelada">Cancelada</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="date"
          className="h-9 w-36"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <Input
          type="date"
          className="h-9 w-36"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={item} className="grid gap-4 sm:grid-cols-3">
        {summaryCards.map((card) => (
          <Card key={card.title} className={`${card.bg} border-0 shadow-sm`}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                  <p className={`text-2xl font-bold ${card.color}`}>{formatCurrency(card.value)}</p>
                </div>
                <div className={`rounded-xl p-3 ${card.iconBg}`}>
                  <card.icon className={`size-5 ${card.color}`} />
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
            <CardTitle className="text-base">Receitas vs Despesas (Mensal)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                  <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ backgroundColor: 'var(--popover)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                  <Bar dataKey="receitas" fill="#10b981" name="Receitas" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="despesas" fill="#ef4444" name="Despesas" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Distribuição por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'var(--popover)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Detailed Table */}
      <motion.div variants={item}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Fluxo de Caixa Detalhado</CardTitle>
            <CardDescription>{accounts.length} registros</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[400px] overflow-y-auto">
              {loading ? (
                <div className="p-6 space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : accounts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <FileBarChart className="size-10 mb-3 opacity-30" />
                  <p className="font-medium">Nenhum dado encontrado</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="hidden md:table-cell">Cliente</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead className="hidden sm:table-cell">Vencimento</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accounts.map((account) => (
                      <TableRow key={account.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium max-w-[200px] truncate">
                          {account.description}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                          {account.client?.name || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={
                              account.type === 'receber'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            }
                          >
                            {account.type === 'receber' ? 'Receita' : 'Despesa'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm font-medium">
                          {formatCurrency(account.amount)}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                          {formatDate(account.dueDate)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary" className={`${getStatusColor(account.status)} text-xs`}>
                            {getStatusLabel(account.status)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="font-bold bg-muted/30">
                      <TableCell colSpan={2}>Total</TableCell>
                      <TableCell />
                      <TableCell className="text-right font-mono text-sm">
                        {formatCurrency(saldo)}
                      </TableCell>
                      <TableCell colSpan={2} />
                    </TableRow>
                  </TableBody>
                </Table>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
