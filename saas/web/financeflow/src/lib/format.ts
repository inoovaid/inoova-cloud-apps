export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d)
}

export function formatDateInput(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'paga':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
    case 'pendente':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
    case 'vencida':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    case 'cancelada':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case 'paga':
      return 'Paga'
    case 'pendente':
      return 'Pendente'
    case 'vencida':
      return 'Vencida'
    case 'cancelada':
      return 'Cancelada'
    default:
      return status
  }
}

export function getTypeLabel(type: string): string {
  switch (type) {
    case 'pagar':
      return 'A Pagar'
    case 'receber':
      return 'A Receber'
    default:
      return type
  }
}

export function getTypeColor(type: string): string {
  switch (type) {
    case 'pagar':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    case 'receber':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function getTriggerLabel(trigger: string): string {
  switch (trigger) {
    case 'vencimento_proximo':
      return 'Vencimento Próximo'
    case 'atraso':
      return 'Atraso'
    case 'pagamento_recebido':
      return 'Pagamento Recebido'
    case 'status_change':
      return 'Mudança de Status'
    default:
      return trigger
  }
}

export function getActionLabel(action: string): string {
  switch (action) {
    case 'notificar':
      return 'Enviar Notificação'
    case 'mudar_status':
      return 'Mudar Status'
    case 'enviar_email':
      return 'Enviar Email'
    case 'calcular_comissao':
      return 'Calcular Comissão'
    default:
      return action
  }
}

export function getRoleBadge(role: string): string {
  switch (role) {
    case 'admin':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
    case 'financeiro':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    case 'vendedor':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function getRoleLabel(role: string): string {
  switch (role) {
    case 'admin':
      return 'Administrador'
    case 'financeiro':
      return 'Financeiro'
    case 'vendedor':
      return 'Vendedor'
    default:
      return role
  }
}
