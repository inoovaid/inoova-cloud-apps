'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'

interface Account {
  id: string
  description: string
  amount: number
  dueDate: string
  type: string
  status: string
  clientId: string | null
  accountPlanId: string | null
  tags: string
  notes: string | null
  recurring: boolean
  recurringCycle: string | null
  client?: { id: string; name: string } | null
  accountPlan?: { id: string; name: string; type: string } | null
}

interface Client {
  id: string
  name: string
}

interface AccountPlan {
  id: string
  name: string
  type: string
}

interface AccountFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  account: Account | null
  onSave: () => void
}

export function AccountFormDialog({
  open,
  onOpenChange,
  account,
  onSave,
}: AccountFormDialogProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [plans, setPlans] = useState<AccountPlan[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    description: '',
    amount: '',
    type: 'receber',
    dueDate: '',
    clientId: '',
    accountPlanId: '',
    tags: '',
    notes: '',
    recurring: false,
    recurringCycle: 'mensal',
  })
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      fetch('/api/clients')
        .then((r) => r.json())
        .then((d) => setClients(Array.isArray(d) ? d : []))
      fetch('/api/account-plans')
        .then((r) => r.json())
        .then((d) => setPlans(Array.isArray(d) ? d : []))

      if (account) {
        setForm({
          description: account.description,
          amount: String(account.amount),
          type: account.type,
          dueDate: account.dueDate ? account.dueDate.split('T')[0] : '',
          clientId: account.clientId || '',
          accountPlanId: account.accountPlanId || '',
          tags: account.tags || '',
          notes: account.notes || '',
          recurring: account.recurring,
          recurringCycle: account.recurringCycle || 'mensal',
        })
      } else {
        setForm({
          description: '',
          amount: '',
          type: 'receber',
          dueDate: new Date().toISOString().split('T')[0],
          clientId: '',
          accountPlanId: '',
          tags: '',
          notes: '',
          recurring: false,
          recurringCycle: 'mensal',
        })
      }
    }
  }, [open, account])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.description.trim()) {
      toast({ title: 'Informe a descrição', variant: 'destructive' })
      return
    }
    if (!form.amount || isNaN(parseFloat(form.amount))) {
      toast({ title: 'Informe um valor válido', variant: 'destructive' })
      return
    }
    if (!form.dueDate) {
      toast({ title: 'Informe a data de vencimento', variant: 'destructive' })
      return
    }

    setLoading(true)
    try {
      const url = account ? `/api/accounts/${account.id}` : '/api/accounts'
      const method = account ? 'PUT' : 'POST'
      const body: Record<string, unknown> = { ...form }
      if (!form.clientId) body.clientId = null
      if (!form.accountPlanId) body.accountPlanId = null

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) throw new Error()

      toast({
        title: account ? 'Conta atualizada com sucesso!' : 'Conta criada com sucesso!',
      })
      onSave()
    } catch {
      toast({
        title: account ? 'Erro ao atualizar conta' : 'Erro ao criar conta',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {account ? 'Editar Conta' : 'Nova Conta'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Descrição *</Label>
            <Input
              placeholder="Ex: Aluguel do escritório"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Valor (R$) *</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0,00"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo *</Label>
              <Select
                value={form.type}
                onValueChange={(v) => setForm({ ...form, type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="receber">A Receber</SelectItem>
                  <SelectItem value="pagar">A Pagar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Vencimento *</Label>
              <Input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Cliente</Label>
              <Select
                value={form.clientId}
                onValueChange={(v) => setForm({ ...form, clientId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar..." />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Plano de Conta</Label>
            <Select
              value={form.accountPlanId}
              onValueChange={(v) => setForm({ ...form, accountPlanId: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecionar..." />
              </SelectTrigger>
              <SelectContent>
                {plans.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} ({p.type === 'receita' ? 'Receita' : 'Despesa'})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {account && (
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={account.status}
                onValueChange={(v) => {
                  // Update status via API
                  fetch(`/api/accounts/${account.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: v }),
                  })
                  toast({ title: 'Status atualizado!' })
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="paga">Paga</SelectItem>
                  <SelectItem value="vencida">Vencida</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Tags</Label>
            <Input
              placeholder="Ex: urgente, fixo, contrato (separadas por vírgula)"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              placeholder="Notas adicionais..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg border">
            <Switch
              checked={form.recurring}
              onCheckedChange={(v) => setForm({ ...form, recurring: v })}
            />
            <div>
              <Label className="cursor-pointer">Conta Recorrente</Label>
              <p className="text-xs text-muted-foreground">
                Marque se esta conta se repete periodicamente
              </p>
            </div>
            {form.recurring && (
              <Select
                value={form.recurringCycle}
                onValueChange={(v) => setForm({ ...form, recurringCycle: v })}
              >
                <SelectTrigger className="w-28 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semanal">Semanal</SelectItem>
                  <SelectItem value="mensal">Mensal</SelectItem>
                  <SelectItem value="anual">Anual</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={loading}
            >
              {loading ? 'Salvando...' : account ? 'Salvar Alterações' : 'Criar Conta'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
