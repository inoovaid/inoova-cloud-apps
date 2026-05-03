'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
import { DollarSign, Clock, CheckCircle2, Percent } from 'lucide-react'
import { formatCurrency, getStatusColor, getStatusLabel, formatDate } from '@/lib/format'
import { motion } from 'framer-motion'

interface Commission {
  id: string
  amount: number
  percentage: number
  status: string
  paidAt: string | null
  createdAt: string
  user: { id: string; name: string; email: string }
  account: { id: string; description: string; amount: number; status: string; type: string }
}

interface User {
  id: string
  name: string
  email: string
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export function ComissoesPage() {
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [userFilter, setUserFilter] = useState<string>('all')

  useEffect(() => {
    fetch('/api/commissions')
      .then((res) => res.json())
      .then((data) => {
        setCommissions(Array.isArray(data) ? data : [])
        const uniqueUsers = Array.from(
          new Map(
            (Array.isArray(data) ? data : []).map((c: Commission) => [
              c.user.id,
              c.user,
            ])
          ).entries()
        )
        setUsers(uniqueUsers)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filtered = userFilter === 'all'
    ? commissions
    : commissions.filter((c) => c.user.id === userFilter)

  const totalComissoes = filtered.reduce((s, c) => s + c.amount, 0)
  const totalPendentes = filtered
    .filter((c) => c.status === 'pendente')
    .reduce((s, c) => s + c.amount, 0)
  const totalPagas = filtered
    .filter((c) => c.status === 'paga')
    .reduce((s, c) => s + c.amount, 0)

  const summaryCards = [
    {
      title: 'Total Comissões',
      value: totalComissoes,
      icon: Percent,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/50',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/50',
    },
    {
      title: 'Pendentes',
      value: totalPendentes,
      icon: Clock,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/50',
      iconBg: 'bg-amber-100 dark:bg-amber-900/50',
    },
    {
      title: 'Pagas',
      value: totalPagas,
      icon: CheckCircle2,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/50',
      iconBg: 'bg-blue-100 dark:bg-blue-900/50',
    },
  ]

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Comissões</h2>
          <p className="text-sm text-muted-foreground">
            Acompanhe as comissões da equipe
          </p>
        </div>
        <Select value={userFilter} onValueChange={setUserFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por usuário" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os usuários</SelectItem>
            {users.map((u) => (
              <SelectItem key={u.id} value={u.id}>
                {u.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

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

      <motion.div variants={item}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Detalhamento</CardTitle>
            <CardDescription>
              {filtered.length} comissões encontradas
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[400px] overflow-y-auto">
              {loading ? (
                <div className="p-6 space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead className="hidden md:table-cell">Conta</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead className="text-center">Percentual</TableHead>
                      <TableHead className="hidden sm:table-cell">Data</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((comm) => (
                      <TableRow key={comm.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{comm.user.name}</p>
                            <p className="text-xs text-muted-foreground">{comm.user.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground max-w-[200px] truncate">
                          {comm.account.description}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm font-medium">
                          {formatCurrency(comm.amount)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="text-xs">
                            {comm.percentage}%
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                          {formatDate(comm.createdAt)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="secondary"
                            className={`${getStatusColor(comm.status)} text-xs`}
                          >
                            {getStatusLabel(comm.status)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="font-bold bg-muted/30">
                      <TableCell colSpan={2} className="text-sm">
                        Total
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">
                        {formatCurrency(totalComissoes)}
                      </TableCell>
                      <TableCell colSpan={3} />
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
