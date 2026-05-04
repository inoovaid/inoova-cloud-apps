'use client';

import { useAppStore, type CRMTab } from '@/lib/store';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Scissors,
  DollarSign,
  Bot,
  Brain,
  X,
  ShoppingBag,
  Package,
  FileText,
  Settings,
  ChevronRight,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';

const mainNavItems: { id: CRMTab; label: string; icon: React.ElementType; badge?: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'calendar', label: 'Agenda', icon: Calendar },
  { id: 'clients', label: 'Clientes', icon: Users },
  { id: 'team', label: 'Equipe', icon: Scissors },
  { id: 'finance', label: 'Financeiro', icon: DollarSign },
  { id: 'sales', label: 'Vendas', icon: ShoppingBag },
  { id: 'shopping-admin', label: 'Produtos', icon: Package },
  { id: 'blog-admin', label: 'Blog', icon: FileText },
  { id: 'automations', label: 'Automações', icon: Bot },
  { id: 'smart-ai', label: 'Smart AI', icon: Brain, badge: 'AI' },
];

const roleLabels: Record<string, string> = {
  administrator: 'Administrador',
  employee: 'Funcionário',
  finance: 'Finanças',
  client: 'Cliente',
};

export function AppSidebar() {
  const { activeTab, setActiveTab, sidebarOpen, setSidebarOpen, currentUser } = useAppStore();
  const isMobile = useIsMobile();

  // Desktop: sidebarOpen=false → collapsed icon rail (60px); sidebarOpen=true → full (256px)
  // Mobile: sidebarOpen=false → hidden off-screen; sidebarOpen=true → full overlay
  const isCollapsed = !isMobile && !sidebarOpen;

  const handleNavClick = (tab: CRMTab) => {
    setActiveTab(tab);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const initials = currentUser.avatarInitials || currentUser.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  // Shared spring config for the sidebar width/position animation
  const sidebarSpring = { type: 'spring' as const, damping: 26, stiffness: 220, mass: 0.75 };

  return (
    <>
      {/* ── Mobile overlay backdrop ── */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar ── */}
      <motion.aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full bg-card border-r border-border/50 flex flex-col',
          'shadow-xl shadow-black/[0.03]',
          'overflow-hidden'
        )}
        initial={false}
        animate={{
          width: isMobile ? 280 : (isCollapsed ? 60 : 256),
          x: isMobile && !sidebarOpen ? -300 : 0,
        }}
        transition={sidebarSpring}
      >
        {/* ── Header (close button on mobile, spacer on desktop) ── */}
        <div className={cn(
          'h-14 flex items-center shrink-0',
          isMobile ? 'justify-between px-4' : 'px-3'
        )}>
          {/* Mobile: app name + close */}
          {isMobile && (
            <>
              <span className="text-sm font-bold tracking-tight text-foreground">
                Menu
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          )}
          {/* Desktop collapsed: subtle divider line (visual anchor) */}
          {!isMobile && isCollapsed && (
            <div className="w-full flex justify-center pt-1">
              <div className="w-5 h-[2px] rounded-full bg-primary/20" />
            </div>
          )}
        </div>

        <Separator className="opacity-40" />

        {/* ── Main Navigation ── */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto overflow-x-hidden">
          <AnimatePresence initial={false}>
            {!isCollapsed && (
              <motion.p
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 6 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.15, ease: 'easeInOut' }}
                className="px-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/40 overflow-hidden whitespace-nowrap"
              >
                Menu
              </motion.p>
            )}
          </AnimatePresence>

          <TooltipProvider delayDuration={isCollapsed ? 0 : 700}>
            {mainNavItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>
                    <motion.button
                      onClick={() => handleNavClick(item.id)}
                      className={cn(
                        'group w-full flex items-center gap-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 relative',
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                        isCollapsed ? 'justify-center px-0 py-2' : 'px-2.5 py-2'
                      )}
                      whileTap={{ scale: 0.96 }}
                    >
                      <div className={cn(
                        'flex items-center justify-center w-7 h-7 rounded-md transition-colors duration-150 shrink-0',
                        isActive
                          ? 'bg-primary/15 text-primary'
                          : 'text-muted-foreground/60 group-hover:text-foreground group-hover:bg-accent/80'
                      )}>
                        <Icon className="w-[15px] h-[15px]" />
                      </div>
                      <AnimatePresence initial={false}>
                        {!isCollapsed && (
                          <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 'auto' }}
                            exit={{ opacity: 0, width: 0 }}
                            transition={{ duration: 0.15, ease: 'easeInOut' }}
                            className="flex-1 text-left overflow-hidden whitespace-nowrap"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                      {!isCollapsed && item.badge && (
                        <Badge
                          variant="secondary"
                          className="text-[9px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-0 font-semibold"
                        >
                          {item.badge}
                        </Badge>
                      )}
                      {isActive && (
                        <motion.div
                          layoutId="activeSidebarNav"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-primary rounded-r-full"
                          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                        />
                      )}
                    </motion.button>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={8} className="text-xs font-medium">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </TooltipProvider>
        </nav>

        <Separator className="opacity-40" />

        {/* ── Bottom section ── */}
        <div className={cn('px-2 py-3 space-y-1 shrink-0')}>
          {/* Settings */}
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                onClick={() => handleNavClick('settings')}
                className={cn(
                  'group w-full flex items-center gap-2.5 rounded-lg text-[13px] font-medium transition-all duration-150',
                  activeTab === 'settings'
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                  isCollapsed ? 'justify-center px-0 py-2' : 'px-2.5 py-2'
                )}
                whileTap={{ scale: 0.96 }}
              >
                <div className={cn(
                  'flex items-center justify-center w-7 h-7 rounded-md transition-colors duration-150 shrink-0',
                  activeTab === 'settings'
                    ? 'bg-primary/15 text-primary'
                    : 'text-muted-foreground/60 group-hover:text-foreground group-hover:bg-accent/80'
                )}>
                  <Settings className="w-[15px] h-[15px]" />
                </div>
                <AnimatePresence initial={false}>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.15, ease: 'easeInOut' }}
                      className="overflow-hidden whitespace-nowrap"
                    >
                      Configurações
                    </motion.span>
                  )}
                </AnimatePresence>
                {activeTab === 'settings' && (
                  <motion.div
                    layoutId="activeSidebarNav"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-primary rounded-r-full"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
              </motion.button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8} className="text-xs font-medium">
              Configurações
            </TooltipContent>
          </Tooltip>

          <Separator className="my-1.5 opacity-30" />

          {/* User profile */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => handleNavClick('team')}
                className={cn(
                  'w-full flex items-center gap-2.5 rounded-lg hover:bg-accent/50 transition-all duration-150 group',
                  isCollapsed ? 'justify-center p-1.5' : 'p-2'
                )}
                aria-label="Ver perfil da equipe"
              >
                <Avatar className={cn(
                  'ring-1 ring-primary/10 group-hover:ring-primary/20 transition-all shrink-0',
                  isCollapsed ? 'h-7 w-7' : 'h-8 w-8'
                )}>
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-primary text-[10px] font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <AnimatePresence initial={false}>
                  {!isCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.15, ease: 'easeInOut' }}
                      className="flex-1 min-w-0 text-left overflow-hidden"
                    >
                      <p className="text-[13px] font-medium truncate leading-tight">{currentUser.name}</p>
                      <p className="text-[10px] text-muted-foreground leading-tight">
                        {roleLabels[currentUser.role] || currentUser.role}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
                {!isCollapsed && (
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8} className="text-xs font-medium">
              {currentUser.name}
            </TooltipContent>
          </Tooltip>
        </div>
      </motion.aside>
    </>
  );
}
