'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
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
  Plus,
  FileText,
  AlertTriangle,
  CalendarClock,
  CalendarCheck,
  CheckCircle2,
  Calculator,
  Receipt,
  Pencil,
  Trash2,
  Search,
} from 'lucide-react'
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '@/lib/format'
import { AccountFormDialog } from '@/components/shared/account-form-dialog'
import { useToast } from '@/hooks/use-toast'
import { motion } from 'framer-motion'

interface Account {
  id: string
  description: string
  amount: number
  dueDate: string
  paymentDate: string | null
  status: string
  type: string
  tags: string
  client?: { id: string; name: string } | null
  accountPlan?: { id: string; name: string; type: string } | null
  creator?: { id: string; name: string } | null
}

interface AccountPlan {
  id: string
  name: string
  type: string
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export function FinanceiroPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [plans, setPlans] = useState<AccountPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editAccount, setEditAccount] = useState<Account | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [planFilter, setPlanFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const { toast } = useToast()

  const fetchAccounts = useCallback(() => {
    const params = new URLSearchParams()
    if (statusFilter !== 'all') params.set('status', statusFilter)
    if (typeFilter !== 'all') params.set('type', typeFilter)
    if (planFilter !== 'all') params.set('accountPlanId', planFilter)
    if (searchTerm) params.set('search', searchTerm)
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
  }, [statusFilter, typeFilter, planFilter, searchTerm, startDate, endDate])

  useEffect(() => {
    fetchAccounts()
  }, [fetchAccounts])

  useEffect(() => {
    fetch('/api/account-plans')
      .then((res) => res.json())
      .then((data) => setPlans(Array.isArray(data) ? data : []))
  }, [])

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const summaryCards = [
    {
      title: 'Vencidas',
      value: accounts.filter(
        (a) => a.status === 'vencida'
      ).reduce((s, a) => s + a.amount, 0),
      count: accounts.filter((a) => a.status === 'vencida').length,
      icon: AlertTriangle,
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-950/50',
      iconBg: 'bg-red-100 dark:bg-red-900/50',
    },
    {
      title: 'Vence Hoje',
      value: accounts.filter(
        (a) => {
          const d = new Date(a.dueDate)
          return (
            a.status === 'pendente' &&
            d.getFullYear() === today.getFullYear() &&
            d.getMonth() === today.getMonth() &&
            d.getDate() === today.getDate()
          )
        }
      ).reduce((s, a) => s + a.amount, 0),
      count: accounts.filter(
        (a) => {
          const d = new Date(a.dueDate)
          return (
            a.status === 'pendente' &&
            d.getFullYear() === today.getFullYear() &&
            d.getMonth() === today.getMonth() &&
            d.getDate() === today.getDate()
          )
        }
      ).length,
      icon: CalendarClock,
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-50 dark:bg-orange-950/50',
      iconBg: 'bg-orange-100 dark:bg-orange-900/50',
    },
    {
      title: 'Vence Amanhã',
      value: accounts.filter(
        (a) => {
          const d = new Date(a.dueDate)
          return (
            a.status === 'pendente' &&
            d.getFullYear() === tomorrow.getFullYear() &&
            d.getMonth() === tomorrow.getMonth() &&
            d.getDate() === tomorrow.getDate()
          )
        }
      ).reduce((s, a) => s + a.amount, 0),
      count: accounts.filter(
        (a) => {
          const d = new Date(a.dueDate)
          return (
            a.status === 'pendente' &&
            d.getFullYear() === tomorrow.getFullYear() &&
            d.getMonth() === tomorrow.getMonth() &&
            d.getDate() === tomorrow.getDate()
          )
        }
      ).length,
      icon: CalendarCheck,
      color: 'text-yellow-600 dark:text-yellow-400',
      bg: 'bg-yellow-50 dark:bg-yellow-950/50',
      iconBg: 'bg-yellow-100 dark:bg-yellow-900/50',
    },
    {
      title: 'Recebidas',
      value: accounts.filter((a) => a.status === 'paga')
        .reduce((s, a) => s + a.amount, 0),
      count: accounts.filter((a) => a.status === 'paga').length,
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/50',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/50',
    },
    {
      title: 'Total Geral',
      value: accounts.reduce((s, a) => s + a.amount, 0),
      count: accounts.length,
      icon: Calculator,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/50',
      iconBg: 'bg-blue-100 dark:bg-blue-900/50',
    },
    {
      title: 'Pendentes',
      value: accounts.filter((a) => a.status === 'pendente')
        .reduce((s, a) => s + a.amount, 0),
      count: accounts.filter((a) => a.status === 'pendente').length,
      icon: Receipt,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950/50',
      iconBg: 'bg-purple-100 dark:bg-purple-900/50',
    },
  ]

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta conta?')) return
    try {
      await fetch(`/api/accounts/${id}`, { method: 'DELETE' })
      toast({ title: 'Conta excluída com sucesso!' })
      fetchAccounts()
    } catch {
      toast({ title: 'Erro ao excluir conta', variant: 'destructive' })
    }
  }

  const handleEdit = (account: Account) => {
    setEditAccount(account)
    setDialogOpen(true)
  }

  const handleSave = () => {
    setDialogOpen(false)
    setEditAccount(null)
    fetchAccounts()
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Filters */}
      <motion.div variants={item} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              className="pl-8 h-9 w-48"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
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
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-36 h-9">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pagar">A Pagar</SelectItem>
              <SelectItem value="receber">A Receber</SelectItem>
            </SelectContent>
          </Select>
          <Select value={planFilter} onValueChange={setPlanFilter}>
            <SelectTrigger className="w-44 h-9">
              <SelectValue placeholder="Plano de Conta" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {plans.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="date"
            className="h-9 w-36"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Data inicial"
          />
          <Input
            type="date"
            className="h-9 w-36"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Data final"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <FileText className="mr-2 size-4" />
            Relatório
          </Button>
          <Button
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={() => {
              setEditAccount(null)
              setDialogOpen(true)
            }}
          >
            <Plus className="mr-2 size-4" />
            Adicionar Conta
          </Button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={item} className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        {summaryCards.map((card) => (
          <Card key={card.title} className={`${card.bg} border-0 shadow-sm`}>
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className={`rounded-lg p-1.5 ${card.iconBg}`}>
                  <card.icon className={`size-3.5 ${card.color}`} />
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  {card.title}
                </span>
              </div>
              <p className={`text-lg font-bold ${card.color}`}>
                {formatCurrency(card.value)}
              </p>
              <p className="text-[10px] text-muted-foreground">{card.count} contas</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Table */}
      <motion.div variants={item}>
        <Card>
          <CardContent className="p-0">
            <div className="max-h-[500px] overflow-y-auto">
              {loading ? (
                <div className="p-6 space-y-3">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : accounts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <Receipt className="size-12 mb-4 opacity-30" />
                  <p className="text-lg font-medium">Nenhum registro encontrado</p>
                  <p className="text-sm">Ajuste os filtros ou adicione uma nova conta</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="hidden md:table-cell">Cliente</TableHead>
                      <TableHead className="hidden lg:table-cell">Plano</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead className="hidden sm:table-cell">Vencimento</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accounts.map((account) => (
                      <TableRow
                        key={account.id}
                        className="hover:bg-muted/50 cursor-pointer transition-colors"
                        onDoubleClick={() => handleEdit(account)}
                      >
                        <TableCell className="font-medium max-w-[200px] truncate">
                          <div className="flex items-center gap-2">
                            {account.type === 'receber' ? (
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            ) : (
                              <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                            )}
                            {account.description}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                          {account.client?.name || '-'}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                          {account.accountPlan?.name || '-'}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm font-medium">
                          {formatCurrency(account.amount)}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                          {formatDate(account.dueDate)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="secondary"
                            className={`${getStatusColor(account.status)} text-xs`}
                          >
                            {getStatusLabel(account.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              onClick={() => handleEdit(account)}
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDelete(account.id)}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <AccountFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        account={editAccount}
        onSave={handleSave}
      />
    </motion.div>
  )
}
