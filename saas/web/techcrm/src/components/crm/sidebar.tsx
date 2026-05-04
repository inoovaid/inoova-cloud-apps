'use client';

import { useEffect } from 'react';
import { useTheme } from 'next-themes';
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  ClipboardList,
  DollarSign,
  Users,
  BarChart3,
  Zap,
  Settings,
  LogOut,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Cpu,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { useCRMStore } from '@/stores/crm-store';
import { useIsMobile } from '@/hooks/use-mobile';
import { CRMPage } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface NavItem {
  id: CRMPage;
  label: string;
  icon: React.ElementType;
  separator?: boolean;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'students', label: 'Alunos', icon: GraduationCap },
  { id: 'courses', label: 'Cursos', icon: BookOpen },
  { id: 'enrollments', label: 'Matrículas', icon: ClipboardList },
  { id: 'financial', label: 'Financeiro', icon: DollarSign },
  { id: 'pipeline', label: 'CRM', icon: Users },
  { id: 'reports', label: 'Relatórios', icon: BarChart3 },
  { id: 'automations', label: 'Automações', icon: Zap },
  { id: 'settings', label: 'Configurações', icon: Settings, separator: true },
];

export function CRMSidebar() {
  const { currentPage, sidebarOpen, setPage, toggleSidebar, setSidebarOpen } =
    useCRMStore();
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const isMobile = useIsMobile();

  // On mobile, close sidebar when page changes
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [currentPage, isMobile, setSidebarOpen]);

  // Close sidebar by default on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile, setSidebarOpen]);

  const handleNavClick = (page: CRMPage) => {
    setPage(page);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  const collapsed = !sidebarOpen;

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-border bg-card transition-all duration-300 ease-in-out',
          collapsed ? 'w-[68px]' : 'w-64',
          isMobile && !sidebarOpen && '-translate-x-full',
          isMobile && sidebarOpen && 'translate-x-0'
        )}
      >
        {/* Logo section */}
        <div
          className={cn(
            'flex h-16 shrink-0 items-center border-b border-border px-4',
            collapsed ? 'justify-center' : 'gap-3'
          )}
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-sm">
            <Cpu className="size-5 text-white" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold tracking-tight text-foreground">
              TechCRM
            </span>
          )}
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;

              return (
                <div key={item.id}>
                  {item.separator && (
                    <Separator className="my-2" />
                  )}
                  {collapsed ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn(
                            'relative mx-auto flex size-10 items-center justify-center rounded-lg transition-all',
                            isActive
                              ? 'bg-emerald-500/15 text-emerald-600 shadow-sm dark:bg-emerald-500/20 dark:text-emerald-400'
                              : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                          )}
                          onClick={() => handleNavClick(item.id)}
                        >
                          <Icon className="size-5" />
                          {isActive && (
                            <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-emerald-500" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right" sideOffset={8}>
                        {item.label}
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <Button
                      variant="ghost"
                      className={cn(
                        'relative w-full justify-start gap-3 rounded-lg px-3 transition-all',
                        isActive
                          ? 'bg-emerald-500/15 text-emerald-600 font-medium shadow-sm dark:bg-emerald-500/20 dark:text-emerald-400'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      )}
                      onClick={() => handleNavClick(item.id)}
                    >
                      <Icon className="size-5 shrink-0" />
                      <span className="truncate">{item.label}</span>
                      {isActive && (
                        <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-emerald-500" />
                      )}
                    </Button>
                  )}
                </div>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Bottom section */}
        <div className="shrink-0 border-t border-border p-3">
          {/* Theme toggle + collapse button */}
          <div
            className={cn(
              'flex items-center gap-2',
              collapsed ? 'justify-center' : 'justify-between'
            )}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-9 text-muted-foreground hover:text-foreground"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                >
                  {theme === 'dark' ? (
                    <Sun className="size-4" />
                  ) : (
                    <Moon className="size-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8}>
                {theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
              </TooltipContent>
            </Tooltip>

            {!isMobile && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-9 text-muted-foreground hover:text-foreground"
                    onClick={toggleSidebar}
                  >
                    {sidebarOpen ? (
                      <ChevronLeft className="size-4" />
                    ) : (
                      <ChevronRight className="size-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  {sidebarOpen ? 'Recolher' : 'Expandir'}
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* User info */}
          {!collapsed && (
            <>
              <Separator className="my-3" />
              <div className="flex items-center gap-3 rounded-lg px-2 py-2">
                <Avatar className="size-9 shrink-0 border border-border">
                  <AvatarFallback className="bg-emerald-500/15 text-sm font-medium text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-sm font-medium text-foreground">
                    {user?.name || 'Usuário'}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user?.role === 'admin' ? 'Administrador' : user?.role || 'Usuário'}
                  </p>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={logout}
                    >
                      <LogOut className="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={8}>
                    Sair
                  </TooltipContent>
                </Tooltip>
              </div>
            </>
          )}

          {collapsed && (
            <>
              <Separator className="my-3" />
              <div className="flex flex-col items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Avatar className="size-9 cursor-pointer border border-border">
                      <AvatarFallback className="bg-emerald-500/15 text-xs font-medium text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={8}>
                    <p className="font-medium">{user?.name || 'Usuário'}</p>
                    <p className="text-xs text-muted-foreground">
                      {user?.role === 'admin' ? 'Administrador' : user?.role}
                    </p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-destructive"
                      onClick={logout}
                    >
                      <LogOut className="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={8}>
                    Sair
                  </TooltipContent>
                </Tooltip>
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
