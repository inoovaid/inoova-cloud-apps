'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Pencil,
  Trash2,
  Receipt,
  ArrowDownCircle,
  ArrowUpCircle,
  Layers,
  RefreshCw,
  Inbox,
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
  status: string
  type: string
  recurring: boolean
  recurringCycle: string | null
  installmentNumber: number | null
  totalInstallments: number | null
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

function AccountsTable({
  accounts,
  onEdit,
  onDelete,
  loading,
}: {
  accounts: Account[]
  onEdit: (a: Account) => void
  onDelete: (id: string) => void
  loading: boolean
}) {
  if (loading) {
    return (
      <div className="p-6 space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (accounts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Inbox className="size-10 mb-3 opacity-30" />
        <p className="font-medium">Nenhum registro encontrado</p>
      </div>
    )
  }

  return (
    <div className="max-h-[400px] overflow-y-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Descrição</TableHead>
            <TableHead className="hidden md:table-cell">Cliente</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead className="hidden sm:table-cell">Vencimento</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {accounts.map((account) => (
            <TableRow key={account.id} className="hover:bg-muted/50">
              <TableCell className="font-medium max-w-[220px] truncate">
                {account.description}
              </TableCell>
              <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                {account.client?.name || '-'}
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
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="icon" className="size-8" onClick={() => onEdit(account)}>
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => onDelete(account.id)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export function ContasPage() {
  const [allAccounts, setAllAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editAccount, setEditAccount] = useState<Account | null>(null)
  const { toast } = useToast()

  const fetchAccounts = useCallback(() => {
    setLoading(true)
    fetch('/api/accounts')
      .then((res) => res.json())
      .then((data) => {
        setAllAccounts(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchAccounts()
  }, [fetchAccounts])

  const contasPagar = allAccounts.filter((a) => a.type === 'pagar' && a.installmentNumber === null)
  const contasReceber = allAccounts.filter((a) => a.type === 'receber' && a.installmentNumber === null)
  const parcelamentos = allAccounts.filter((a) => a.installmentNumber && a.installmentNumber > 0)
  const recorrencias = allAccounts.filter((a) => a.recurring)

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

  const tabSummary = (items: Account[]) => {
    const total = items.reduce((s, a) => s + a.amount, 0)
    return (
      <div className="flex items-center justify-between px-4 py-2 text-sm">
        <span className="text-muted-foreground">{items.length} registros</span>
        <span className="font-semibold">{formatCurrency(total)}</span>
      </div>
    )
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Gestão de Contas</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie contas a pagar, receber, parcelamentos e recorrências
          </p>
        </div>
      </motion.div>

      <motion.div variants={item}>
        <Tabs defaultValue="pagar" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pagar" className="gap-2">
              <ArrowDownCircle className="size-4 text-red-500" />
              <span className="hidden sm:inline">A Pagar</span>
            </TabsTrigger>
            <TabsTrigger value="receber" className="gap-2">
              <ArrowUpCircle className="size-4 text-emerald-500" />
              <span className="hidden sm:inline">A Receber</span>
            </TabsTrigger>
            <TabsTrigger value="parcelas" className="gap-2">
              <Layers className="size-4 text-blue-500" />
              <span className="hidden sm:inline">Parcelas</span>
            </TabsTrigger>
            <TabsTrigger value="recorrencias" className="gap-2">
              <RefreshCw className="size-4 text-purple-500" />
              <span className="hidden sm:inline">Recorrências</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pagar">
            <Card>
              {tabSummary(contasPagar)}
              <CardContent className="p-0">
                <AccountsTable
                  accounts={contasPagar}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  loading={loading}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="receber">
            <Card>
              {tabSummary(contasReceber)}
              <CardContent className="p-0">
                <AccountsTable
                  accounts={contasReceber}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  loading={loading}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="parcelas">
            <Card>
              {tabSummary(parcelamentos)}
              <CardContent className="p-0">
                <div className="max-h-[400px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Descrição</TableHead>
                        <TableHead className="hidden md:table-cell">Cliente</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                        <TableHead>Parcela</TableHead>
                        <TableHead className="hidden sm:table-cell">Vencimento</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        [...Array(5)].map((_, i) => (
                          <Skeleton key={i} className="h-12 w-full" />
                        ))
                      ) : parcelamentos.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7}>
                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                              <Layers className="size-10 mb-3 opacity-30" />
                              <p className="font-medium">Nenhum parcelamento encontrado</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        parcelamentos.map((account) => (
                          <TableRow key={account.id} className="hover:bg-muted/50">
                            <TableCell className="font-medium max-w-[220px] truncate">
                              {account.description}
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                              {account.client?.name || '-'}
                            </TableCell>
                            <TableCell className="text-right font-mono text-sm font-medium">
                              {formatCurrency(account.amount)}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {account.installmentNumber}/{account.totalInstallments}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                              {formatDate(account.dueDate)}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="secondary" className={`${getStatusColor(account.status)} text-xs`}>
                                {getStatusLabel(account.status)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="icon" className="size-8" onClick={() => handleEdit(account)}>
                                  <Pencil className="size-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="size-8 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(account.id)}>
                                  <Trash2 className="size-3.5" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recorrencias">
            <Card>
              {tabSummary(recorrencias)}
              <CardContent className="p-0">
                <div className="max-h-[400px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Descrição</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                        <TableHead>Ciclo</TableHead>
                        <TableHead className="hidden sm:table-cell">Vencimento</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        [...Array(5)].map((_, i) => (
                          <Skeleton key={i} className="h-12 w-full" />
                        ))
                      ) : recorrencias.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6}>
                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                              <RefreshCw className="size-10 mb-3 opacity-30" />
                              <p className="font-medium">Nenhuma recorrência encontrada</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        recorrencias.map((account) => (
                          <TableRow key={account.id} className="hover:bg-muted/50">
                            <TableCell className="font-medium max-w-[220px] truncate">
                              {account.description}
                            </TableCell>
                            <TableCell className="text-right font-mono text-sm font-medium">
                              {formatCurrency(account.amount)}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs capitalize">
                                {account.recurringCycle}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                              {formatDate(account.dueDate)}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="secondary" className={`${getStatusColor(account.status)} text-xs`}>
                                {getStatusLabel(account.status)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="icon" className="size-8" onClick={() => handleEdit(account)}>
                                  <Pencil className="size-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="size-8 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(account.id)}>
                                  <Trash2 className="size-3.5" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
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
