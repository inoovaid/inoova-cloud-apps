'use client';

import { useState } from 'react';
import {
  Search,
  Bell,
  Menu,
  User,
  Settings,
  LogOut,
  Check,
  Info,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useCRMStore } from '@/stores/crm-store';
import { useDataStore } from '@/stores/data-store';
import { useIsMobile } from '@/hooks/use-mobile';
import { CRMPage } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const pageTitles: Record<CRMPage, string> = {
  dashboard: 'Dashboard',
  students: 'Alunos',
  courses: 'Cursos',
  enrollments: 'Matrículas',
  financial: 'Financeiro',
  pipeline: 'CRM Pipeline',
  reports: 'Relatórios',
  automations: 'Automações',
  settings: 'Configurações',
};

function getNotificationIcon(type: string) {
  switch (type) {
    case 'success':
      return <CheckCircle2 className="size-4 text-emerald-500" />;
    case 'warning':
      return <AlertTriangle className="size-4 text-amber-500" />;
    case 'error':
      return <XCircle className="size-4 text-destructive" />;
    default:
      return <Info className="size-4 text-sky-500" />;
  }
}

function formatTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Agora';
  if (diffMins < 60) return `Há ${diffMins} min`;
  if (diffHours < 24) return `Há ${diffHours}h`;
  return `Há ${diffDays}d`;
}

export function CRMHeader() {
  const { currentPage, toggleSidebar } = useCRMStore();
  const { user, logout, setView } = useAuthStore();
  const { notifications, markNotificationRead } = useDataStore();
  const isMobile = useIsMobile();
  const [searchOpen, setSearchOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  const handleProfileClick = () => {
    // Could open a profile modal in the future
  };

  const handleSettingsClick = () => {
    useCRMStore.getState().setPage('settings');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b border-border bg-card/80 px-4 backdrop-blur-md sm:px-6">
      {/* Mobile hamburger */}
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 text-muted-foreground"
          onClick={toggleSidebar}
        >
          <Menu className="size-5" />
        </Button>
      )}

      {/* Page title */}
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold text-foreground sm:text-xl">
          {pageTitles[currentPage]}
        </h1>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search bar */}
      <div className="hidden max-w-xs flex-1 sm:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar alunos, cursos..."
            className="h-9 rounded-lg border-border bg-background pl-9 text-sm placeholder:text-muted-foreground/70 focus-visible:ring-emerald-500/30"
            readOnly
          />
        </div>
      </div>

      {/* Mobile search toggle */}
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 text-muted-foreground"
          onClick={() => setSearchOpen(!searchOpen)}
        >
          <Search className="size-5" />
        </Button>
      )}

      {/* Notification bell */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative shrink-0 text-muted-foreground hover:text-foreground"
          >
            <Bell className="size-5" />
            {unreadCount > 0 && (
              <Badge className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-emerald-500 p-0 text-[10px] font-bold text-white hover:bg-emerald-600">
                {unreadCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          className="w-80 rounded-xl border-border p-0 shadow-lg"
        >
          <div className="flex items-center justify-between px-4 py-3">
            <h3 className="text-sm font-semibold text-foreground">
              Notificações
            </h3>
            {unreadCount > 0 && (
              <Badge
                variant="secondary"
                className="text-xs font-medium text-emerald-600 dark:text-emerald-400"
              >
                {unreadCount} nova{unreadCount > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          <Separator />
          <ScrollArea className="max-h-80">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 py-8">
                <Bell className="size-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  Nenhuma notificação
                </p>
              </div>
            ) : (
              <div className="flex flex-col">
                {notifications.map((notification) => (
                  <button
                    key={notification.id}
                    className={cn(
                      'flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/50',
                      !notification.read && 'bg-emerald-500/5'
                    )}
                    onClick={() => {
                      if (!notification.read) {
                        markNotificationRead(notification.id);
                      }
                    }}
                  >
                    <div className="mt-0.5 shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center gap-2">
                        <p
                          className={cn(
                            'truncate text-sm',
                            !notification.read
                              ? 'font-medium text-foreground'
                              : 'text-foreground/80'
                          )}
                        >
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <span className="size-2 shrink-0 rounded-full bg-emerald-500" />
                        )}
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                        {notification.message}
                      </p>
                      <p className="mt-1 text-[11px] text-muted-foreground/60">
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </PopoverContent>
      </Popover>

      {/* User avatar dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative shrink-0 gap-2 rounded-lg px-2"
          >
            <Avatar className="size-8 border border-border">
              <AvatarFallback className="bg-emerald-500/15 text-xs font-medium text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            {!isMobile && (
              <span className="hidden text-sm font-medium text-foreground lg:inline">
                {user?.name?.split(' ')[0] || 'Usuário'}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-56 rounded-xl"
        >
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-foreground">
                {user?.name || 'Usuário'}
              </p>
              <p className="text-xs text-muted-foreground">
                {user?.email || ''}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              className="cursor-pointer gap-2"
              onClick={handleProfileClick}
            >
              <User className="size-4" />
              Perfil
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer gap-2"
              onClick={handleSettingsClick}
            >
              <Settings className="size-4" />
              Configurações
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer gap-2 text-destructive focus:text-destructive"
            onClick={logout}
          >
            <LogOut className="size-4" />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
