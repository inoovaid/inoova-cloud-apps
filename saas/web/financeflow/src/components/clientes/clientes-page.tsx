'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  UserPlus,
  Search,
  Pencil,
  Trash2,
  Building2,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Users,
} from 'lucide-react'
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '@/lib/format'
import { ClientFormDialog } from '@/components/shared/client-form-dialog'
import { useToast } from '@/hooks/use-toast'
import { motion } from 'framer-motion'

interface Client {
  id: string
  name: string
  email: string | null
  phone: string | null
  cpfCnpj: string | null
  city: string | null
  state: string | null
  tags: string
  notes: string | null
  _count: { accounts: number }
}

interface ClientDetail extends Client {
  accounts: {
    id: string
    description: string
    amount: number
    dueDate: string
    status: string
    type: string
  }[]
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export function ClientesPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editClient, setEditClient] = useState<Client | null>(null)
  const [detailClient, setDetailClient] = useState<ClientDetail | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const { toast } = useToast()

  const fetchClients = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (searchTerm) params.set('search', searchTerm)

    fetch(`/api/clients?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setClients(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [searchTerm])

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) return
    try {
      await fetch(`/api/clients/${id}`, { method: 'DELETE' })
      toast({ title: 'Cliente excluído com sucesso!' })
      fetchClients()
    } catch {
      toast({ title: 'Erro ao excluir cliente', variant: 'destructive' })
    }
  }

  const handleEdit = (client: Client) => {
    setEditClient(client)
    setDialogOpen(true)
  }

  const handleSave = () => {
    setDialogOpen(false)
    setEditClient(null)
    fetchClients()
  }

  const openDetail = async (client: Client) => {
    setDetailOpen(true)
    setDetailLoading(true)
    try {
      const res = await fetch(`/api/clients/${client.id}`)
      const data = await res.json()
      setDetailClient(data)
    } catch {
      toast({ title: 'Erro ao carregar detalhes', variant: 'destructive' })
    } finally {
      setDetailLoading(false)
    }
  }

  const totalRecebido = detailClient
    ? detailClient.accounts
        .filter((a) => a.type === 'receber' && a.status === 'paga')
        .reduce((s, a) => s + a.amount, 0)
    : 0
  const totalPendente = detailClient
    ? detailClient.accounts
        .filter((a) => a.status === 'pendente')
        .reduce((s, a) => s + a.amount, 0)
    : 0

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Clientes</h2>
          <p className="text-sm text-muted-foreground">
            {clients.length} clientes cadastrados
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Buscar clientes..."
              className="pl-8 h-9 w-56"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={() => {
              setEditClient(null)
              setDialogOpen(true)
            }}
          >
            <UserPlus className="mr-2 size-4" />
            Novo Cliente
          </Button>
        </div>
      </motion.div>

      <motion.div variants={item} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading ? (
          [...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
          ))
        ) : clients.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Users className="size-12 mb-4 opacity-30" />
            <p className="text-lg font-medium">Nenhum cliente encontrado</p>
            <p className="text-sm">Adicione um novo cliente para começar</p>
          </div>
        ) : (
          clients.map((client) => (
            <Card
              key={client.id}
              className="hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => openDetail(client)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm truncate max-w-[150px]">
                        {client.name}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                        {client.cpfCnpj || '-'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEdit(client)
                      }}
                    >
                      <Pencil className="size-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-red-500"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(client.id)
                      }}
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  {client.city && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="size-3" />
                      {client.city}, {client.state || ''}
                    </div>
                  )}
                  {client.email && (
                    <div className="flex items-center gap-1.5 truncate">
                      <Mail className="size-3 shrink-0" />
                      {client.email}
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="size-3" />
                      {client.phone}
                    </div>
                  )}
                </div>
                <div className="mt-3 pt-3 border-t flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {client._count.accounts} contas
                  </span>
                  <div className="flex gap-1">
                    {client.tags.split(',').filter(Boolean).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0">
                        {tag.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </motion.div>

      {/* Client Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="size-5" />
              {detailClient?.name}
            </DialogTitle>
          </DialogHeader>

          {detailLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : detailClient ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                {detailClient.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="size-4 text-muted-foreground" />
                    <span>{detailClient.email}</span>
                  </div>
                )}
                {detailClient.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="size-4 text-muted-foreground" />
                    <span>{detailClient.phone}</span>
                  </div>
                )}
                {detailClient.cpfCnpj && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="size-4 text-muted-foreground" />
                    <span>{detailClient.cpfCnpj}</span>
                  </div>
                )}
                {detailClient.city && (
                  <div className="flex items-center gap-2">
                    <MapPin className="size-4 text-muted-foreground" />
                    <span>{detailClient.city}, {detailClient.state}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Card className="bg-emerald-50 dark:bg-emerald-950/50 border-0">
                  <CardContent className="p-3 text-center">
                    <p className="text-xs text-muted-foreground">Total Recebido</p>
                    <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                      {formatCurrency(totalRecebido)}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-amber-50 dark:bg-amber-950/50 border-0">
                  <CardContent className="p-3 text-center">
                    <p className="text-xs text-muted-foreground">Total Pendente</p>
                    <p className="text-lg font-bold text-amber-700 dark:text-amber-400">
                      {formatCurrency(totalPendente)}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2">Histórico Financeiro</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {detailClient.accounts.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nenhuma conta registrada
                    </p>
                  ) : (
                    detailClient.accounts.map((acc) => (
                      <div
                        key={acc.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-muted/50 text-sm"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{acc.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(acc.dueDate)} · {acc.type === 'receber' ? 'Receber' : 'Pagar'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          <span className="font-mono font-medium">
                            {formatCurrency(acc.amount)}
                          </span>
                          <Badge
                            variant="secondary"
                            className={`${getStatusColor(acc.status)} text-[10px]`}
                          >
                            {getStatusLabel(acc.status)}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <ClientFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        client={editClient}
        onSave={handleSave}
      />
    </motion.div>
  )
}
