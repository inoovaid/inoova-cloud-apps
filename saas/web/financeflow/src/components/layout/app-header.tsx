'use client'

import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Bell, Search, Sun, Moon, LogOut, User, Settings, CreditCard } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useNavigationStore } from '@/store/navigation'
import { useAuthStore } from '@/store/auth'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useEffect, useState } from 'react'

const pageLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  financeiro: 'Financeiro',
  contas: 'Contas',
  clientes: 'Clientes',
  comissoes: 'Comissões',
  automacoes: 'Automações',
  relatorios: 'Relatórios',
  configuracoes: 'Configurações',
}

interface Notification {
  id: string
  title: string
  message: string
  read: boolean
  type: string
  createdAt: string
}

export function AppHeader() {
  const { currentPage, setCurrentPage } = useNavigationStore()
  const { theme, setTheme } = useTheme()
  const { user, logout, setShowLoginDialog, setShowProfileDialog } = useAuthStore()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)

  useEffect(() => {
    fetch('/api/notifications')
      .then((res) => res.json())
      .then((data) => {
        setNotifications(data)
        setUnreadCount(data.filter((n: Notification) => !n.read).length)
      })
      .catch(() => {})
  }, [])

  const markAllRead = async () => {
    await fetch('/api/notifications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ all: true }),
    })
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
    setShowNotifications(false)
  }

  const displayName = user?.name || 'Usuário'
  const avatarFallback = user?.avatar || displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <h1 className="text-lg font-semibold hidden sm:block">
        {pageLabels[currentPage] || 'Dashboard'}
      </h1>

      <div className="ml-auto flex items-center gap-2">
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar..."
            className="w-56 pl-8 h-9 bg-muted/50"
          />
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Alternar tema</span>
        </Button>

        <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="size-4" />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 size-5 p-0 flex items-center justify-center text-[10px]"
                >
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              Notificações
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-6"
                  onClick={markAllRead}
                >
                  Marcar todas como lidas
                </Button>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Nenhuma notificação
              </div>
            ) : (
              notifications.slice(0, 5).map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={`flex flex-col items-start gap-1 p-3 ${
                    !notification.read ? 'bg-muted/50' : ''
                  }`}
                >
                  <span className="font-medium text-sm">{notification.title}</span>
                  <span className="text-xs text-muted-foreground line-clamp-1">
                    {notification.message}
                  </span>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Account Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 px-2 gap-2">
              <Avatar className="size-7">
                <AvatarFallback className="bg-emerald-600 text-white text-[10px] font-bold">
                  {avatarFallback}
                </AvatarFallback>
              </Avatar>
              <span className="hidden lg:inline-flex text-sm font-medium max-w-[120px] truncate">
                {displayName}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel className="flex items-center gap-3">
              <Avatar className="size-10">
                <AvatarFallback className="bg-emerald-600 text-white text-sm font-bold">
                  {avatarFallback}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{displayName}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setShowProfileDialog(true)}>
              <User className="mr-2 size-4" />
              Meu Perfil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setCurrentPage('configuracoes')}>
              <Settings className="mr-2 size-4" />
              Configurações
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setCurrentPage('financeiro')}>
              <CreditCard className="mr-2 size-4" />
              Financeiro
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={logout}
              className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30"
            >
              <LogOut className="mr-2 size-4" />
              Sair da conta
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
