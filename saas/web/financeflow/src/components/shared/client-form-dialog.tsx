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
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'

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
  address: string | null
  zipCode: string | null
}

interface ClientFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  client: Client | null
  onSave: () => void
}

export function ClientFormDialog({
  open,
  onOpenChange,
  client,
  onSave,
}: ClientFormDialogProps) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    cpfCnpj: '',
    city: '',
    state: '',
    tags: '',
    notes: '',
    address: '',
    zipCode: '',
  })
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      if (client) {
        setForm({
          name: client.name,
          email: client.email || '',
          phone: client.phone || '',
          cpfCnpj: client.cpfCnpj || '',
          city: client.city || '',
          state: client.state || '',
          tags: client.tags || '',
          notes: client.notes || '',
          address: client.address || '',
          zipCode: client.zipCode || '',
        })
      } else {
        setForm({
          name: '',
          email: '',
          phone: '',
          cpfCnpj: '',
          city: '',
          state: '',
          tags: '',
          notes: '',
          address: '',
          zipCode: '',
        })
      }
    }
  }, [open, client])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      toast({ title: 'Informe o nome do cliente', variant: 'destructive' })
      return
    }

    setLoading(true)
    try {
      const url = client ? `/api/clients/${client.id}` : '/api/clients'
      const method = client ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) throw new Error()

      toast({
        title: client
          ? 'Cliente atualizado com sucesso!'
          : 'Cliente criado com sucesso!',
      })
      onSave()
    } catch {
      toast({
        title: client ? 'Erro ao atualizar cliente' : 'Erro ao criar cliente',
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
            {client ? 'Editar Cliente' : 'Novo Cliente'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Nome *</Label>
            <Input
              placeholder="Nome do cliente"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="email@exemplo.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input
                placeholder="(00) 00000-0000"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>CPF/CNPJ</Label>
            <Input
              placeholder="000.000.000-00"
              value={form.cpfCnpj}
              onChange={(e) => setForm({ ...form, cpfCnpj: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Endereço</Label>
            <Input
              placeholder="Rua, número, complemento"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Cidade</Label>
              <Input
                placeholder="Cidade"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Input
                placeholder="UF"
                maxLength={2}
                value={form.state}
                onChange={(e) =>
                  setForm({ ...form, state: e.target.value.toUpperCase() })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>CEP</Label>
              <Input
                placeholder="00000-000"
                value={form.zipCode}
                onChange={(e) => setForm({ ...form, zipCode: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <Input
              placeholder="Ex: vip, empresa, parceiro (separadas por vírgula)"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              placeholder="Notas sobre o cliente..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={loading}
            >
              {loading
                ? 'Salvando...'
                : client
                ? 'Salvar Alterações'
                : 'Criar Cliente'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
