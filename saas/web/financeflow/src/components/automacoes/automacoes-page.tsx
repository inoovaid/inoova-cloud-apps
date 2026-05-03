'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import {
  Plus,
  Zap,
  Bell,
  RefreshCw,
  Settings,
  Play,
  Pause,
  Trash2,
} from 'lucide-react'
import { getTriggerLabel, getActionLabel } from '@/lib/format'
import { useToast } from '@/hooks/use-toast'
import { motion } from 'framer-motion'

interface AutomationRule {
  id: string
  name: string
  trigger: string
  condition: string | null
  action: string
  actionParams: string | null
  active: boolean
  createdAt: string
  updatedAt: string
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

const triggerOptions = [
  { value: 'vencimento_proximo', label: 'Vencimento Próximo' },
  { value: 'atraso', label: 'Atraso' },
  { value: 'pagamento_recebido', label: 'Pagamento Recebido' },
  { value: 'status_change', label: 'Mudança de Status' },
]

const actionOptions = [
  { value: 'notificar', label: 'Enviar Notificação' },
  { value: 'mudar_status', label: 'Mudar Status' },
  { value: 'enviar_email', label: 'Enviar Email' },
  { value: 'calcular_comissao', label: 'Calcular Comissão' },
]

export function AutomacoesPage() {
  const [automations, setAutomations] = useState<AutomationRule[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [newRule, setNewRule] = useState({
    name: '',
    trigger: 'vencimento_proximo',
    action: 'notificar',
  })
  const { toast } = useToast()

  const fetchAutomations = useCallback(() => {
    setLoading(true)
    fetch('/api/automations')
      .then((res) => res.json())
      .then((data) => {
        setAutomations(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchAutomations()
  }, [fetchAutomations])

  const toggleActive = async (id: string, active: boolean) => {
    try {
      await fetch(`/api/automations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !active }),
      })
      setAutomations((prev) =>
        prev.map((a) => (a.id === id ? { ...a, active: !active } : a))
      )
      toast({
        title: !active ? 'Automação ativada' : 'Automação desativada',
      })
    } catch {
      toast({ title: 'Erro ao atualizar automação', variant: 'destructive' })
    }
  }

  const deleteRule = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta automação?')) return
    try {
      await fetch(`/api/automations/${id}`, { method: 'DELETE' })
      toast({ title: 'Automação excluída com sucesso!' })
      fetchAutomations()
    } catch {
      toast({ title: 'Erro ao excluir automação', variant: 'destructive' })
    }
  }

  const createRule = async () => {
    if (!newRule.name.trim()) {
      toast({ title: 'Informe o nome da automação', variant: 'destructive' })
      return
    }
    try {
      await fetch('/api/automations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRule),
      })
      toast({ title: 'Automação criada com sucesso!' })
      setCreateOpen(false)
      setNewRule({ name: '', trigger: 'vencimento_proximo', action: 'notificar' })
      fetchAutomations()
    } catch {
      toast({ title: 'Erro ao criar automação', variant: 'destructive' })
    }
  }

  const activeCount = automations.filter((a) => a.active).length

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Automações</h2>
          <p className="text-sm text-muted-foreground">
            {automations.length} regras · {activeCount} ativas
          </p>
        </div>
        <Button
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-700"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="mr-2 size-4" />
          Nova Automação
        </Button>
      </motion.div>

      <motion.div variants={item} className="grid gap-4 md:grid-cols-2">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))
        ) : automations.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Zap className="size-12 mb-4 opacity-30" />
            <p className="text-lg font-medium">Nenhuma automação configurada</p>
            <p className="text-sm">Crie sua primeira automação para otimizar processos</p>
          </div>
        ) : (
          automations.map((rule) => (
            <Card
              key={rule.id}
              className={`transition-all ${rule.active ? '' : 'opacity-60'}`}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`rounded-lg p-2 ${
                        rule.active
                          ? 'bg-emerald-100 dark:bg-emerald-900/50'
                          : 'bg-gray-100 dark:bg-gray-800'
                      }`}
                    >
                      <Zap
                        className={`size-4 ${
                          rule.active
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-gray-400'
                        }`}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{rule.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        Criada em {new Date(rule.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={rule.active}
                    onCheckedChange={() => toggleActive(rule.id, rule.active)}
                  />
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="outline" className="text-xs">
                      <Play className="size-2.5 mr-1" />
                      {getTriggerLabel(rule.trigger)}
                    </Badge>
                    <span className="text-muted-foreground">→</span>
                    <Badge variant="outline" className="text-xs">
                      {getActionLabel(rule.action)}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex items-center gap-2">
                    {rule.active ? (
                      <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Ativa
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Pause className="size-3" />
                        Inativa
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => deleteRule(rule.id)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </motion.div>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="size-5" />
              Nova Automação
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                placeholder="Ex: Lembrete de vencimento"
                value={newRule.name}
                onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Gatilho (Trigger)</Label>
              <Select
                value={newRule.trigger}
                onValueChange={(v) => setNewRule({ ...newRule, trigger: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {triggerOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Ação</Label>
              <Select
                value={newRule.action}
                onValueChange={(v) => setNewRule({ ...newRule, action: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {actionOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancelar
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={createRule}
            >
              Criar Automação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
