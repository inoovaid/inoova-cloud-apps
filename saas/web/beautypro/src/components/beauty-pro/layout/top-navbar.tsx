'use client';

import { useAppStore, type PublicPage } from '@/lib/store';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun,
  Moon,
  Menu,
  LogIn,
  ShoppingCart,
  Sparkles,
  ChevronRight,
  User,
  Settings,
  LogOut,
  Home,
  Info,
  Scissors,
  BookOpen,
  Phone,
  CalendarCheck,
  Shield,
  Briefcase,
  Coins,
  UserCircle,
  PanelLeft,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';

const publicNavItems: { id: PublicPage; label: string; icon: React.ElementType }[] = [
  { id: 'landing', label: 'Início', icon: Home },
  { id: 'about', label: 'Sobre', icon: Info },
  { id: 'services', label: 'Serviços', icon: Scissors },
  { id: 'blog', label: 'Blog', icon: BookOpen },
  { id: 'contact', label: 'Contato', icon: Phone },
];

const crmTabLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  calendar: 'Agenda',
  clients: 'Clientes',
  team: 'Equipe',
  finance: 'Financeiro',
  automations: 'Automações',
  'smart-ai': 'Smart AI',
  'blog-admin': 'Blog',
  'shopping-admin': 'Produtos',
  sales: 'Vendas',
  settings: 'Configurações',
};

const roleConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  administrator: { label: 'Administrador', icon: Shield, color: 'text-rose-500' },
  employee: { label: 'Funcionário', icon: Briefcase, color: 'text-blue-500' },
  finance: { label: 'Finanças', icon: Coins, color: 'text-amber-500' },
  client: { label: 'Cliente', icon: UserCircle, color: 'text-emerald-500' },
};

export function TopNavbar() {
  const {
    mode,
    activeTab,
    publicPage,
    setActiveTab,
    setPublicPage,
    theme,
    toggleTheme,
    cart,
    isAuthenticated,
    login,
    logout,
    currentUser,
    sidebarOpen,
    setSidebarOpen,
  } = useAppStore();
  const isMobile = useIsMobile();

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const initials = currentUser.avatarInitials || currentUser.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const currentRole = roleConfig[currentUser.role] || roleConfig.client;

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-[60] w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60"
    >
      <div className="flex h-14 items-center px-3 sm:px-5 lg:px-6 max-w-[1800px] mx-auto gap-2">
        {/* ── Sidebar Toggle Button ── */}
        {mode === 'crm' && (
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={cn(
                  'relative flex items-center justify-center shrink-0',
                  'h-8 w-8 rounded-md',
                  'text-muted-foreground hover:text-foreground',
                  'hover:bg-accent/70 active:bg-accent',
                  'transition-colors duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                )}
                aria-label={sidebarOpen ? 'Recolher menu lateral' : 'Expandir menu lateral'}
                whileTap={{ scale: 0.88 }}
                whileHover={{ scale: 1.05 }}
              >
                <span className="relative h-[18px] w-[18px] flex items-center justify-center">
                  <AnimatePresence mode="wait" initial={false}>
                    {isMobile ? (
                      <motion.span
                        key="hamburger"
                        initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                        animate={{ rotate: 0, opacity: 1, scale: 1 }}
                        exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <Menu className="h-[18px] w-[18px]" />
                      </motion.span>
                    ) : (
                      <motion.span
                        key="panel"
                        initial={{ rotate: sidebarOpen ? -90 : 90, opacity: 0, scale: 0.5 }}
                        animate={{ rotate: 0, opacity: 1, scale: 1 }}
                        exit={{ rotate: sidebarOpen ? 90 : -90, opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <PanelLeft className="h-[18px] w-[18px]" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </span>
              </motion.button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              {sidebarOpen ? 'Recolher menu (Ctrl+B)' : 'Expandir menu (Ctrl+B)'}
            </TooltipContent>
          </Tooltip>
        )}

        {/* ── Logo ── */}
        <button
          className="flex items-center gap-2 sm:mr-6 shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => {
            if (mode === 'crm') {
              setActiveTab('dashboard');
            } else {
              setPublicPage('landing');
            }
          }}
          aria-label={mode === 'crm' ? 'Ir para Dashboard' : 'Ir para página inicial'}
        >
          <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
          </div>
          <span className="text-base font-bold tracking-tight hidden sm:inline">
            {mode === 'crm' ? (
              <>
                Beauty<span className="text-primary">Pro</span>
                <Badge variant="secondary" className="ml-1.5 text-[9px] px-1.5 py-0 bg-primary/10 text-primary">
                  CRM
                </Badge>
              </>
            ) : (
              <>
                Beauty<span className="text-primary">Pro</span>
              </>
            )}
          </span>
        </button>

        {/* ── Public Mode Nav Links (desktop) ── */}
        {mode === 'public' && !isMobile && (
          <nav className="flex items-center gap-0.5">
            {publicNavItems.map((item) => {
              const isActive = publicPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setPublicPage(item.id)}
                  className={cn(
                    'relative px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  )}
                >
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId="publicNavIndicator"
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>
        )}

        {/* ── CRM Mode Breadcrumb (desktop) ── */}
        {mode === 'crm' && !isMobile && (
          <div className="hidden md:flex items-center gap-1.5 text-sm text-muted-foreground">
            <span className="text-xs">CRM</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground font-medium text-xs">
              {crmTabLabels[activeTab] || activeTab}
            </span>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* ── Right side actions ── */}
        <div className="flex items-center gap-1.5">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="relative h-8 w-8 rounded-md"
          >
            <AnimatePresence mode="wait">
              {theme === 'light' ? (
                <motion.div
                  key="sun"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Sun className="h-4 w-4" />
                </motion.div>
              ) : (
                <motion.div
                  key="moon"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Moon className="h-4 w-4" />
                </motion.div>
              )}
            </AnimatePresence>
            <span className="sr-only">Alternar tema</span>
          </Button>

          {/* Public mode specific items */}
          {mode === 'public' && (
            <>
              {/* Cart */}
              <Button
                variant="ghost"
                size="icon"
                className="relative h-8 w-8 rounded-md"
                onClick={() => setPublicPage('shopping')}
              >
                <ShoppingCart className="h-4 w-4" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 min-w-4 rounded-full p-0 flex items-center justify-center text-[9px] bg-primary text-primary-foreground">
                    {cartCount}
                  </Badge>
                )}
                <span className="sr-only">Carrinho</span>
              </Button>

              {/* Agendar CTA (desktop) */}
              {!isMobile && (
                <Button
                  size="sm"
                  onClick={() => setPublicPage('booking')}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 h-8 text-xs"
                >
                  <CalendarCheck className="w-3.5 h-3.5" />
                  Agendar
                </Button>
              )}

              {/* Login Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPublicPage('login')}
                className="gap-1.5 h-8 text-xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                {!isMobile && 'Entrar'}
              </Button>
            </>
          )}

          {/* CRM mode: User Avatar Dropdown */}
          {mode === 'crm' && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-md p-0">
                  <Avatar className="h-7 w-7 ring-1 ring-primary/15">
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-primary text-[10px] font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex items-center gap-2.5 p-0.5">
                    <Avatar className="h-9 w-9 ring-1 ring-primary/15">
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-primary text-xs font-bold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{currentUser.name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{currentUser.email}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <currentRole.icon className={cn('w-3 h-3', currentRole.color)} />
                        <span className={cn('text-[10px] font-medium', currentRole.color)}>
                          {currentRole.label}
                        </span>
                      </div>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setActiveTab('team')} className="cursor-pointer text-sm">
                  <User className="mr-2 h-4 w-4" />
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab('settings')} className="cursor-pointer text-sm">
                  <Settings className="mr-2 h-4 w-4" />
                  Configurações
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer text-rose-600 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950/30 text-sm">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Mobile hamburger menu (public mode) */}
          {mode === 'public' && isMobile && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Beauty<span className="text-primary">Pro</span>
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6 flex flex-col gap-1">
                  {publicNavItems.map((item) => {
                    const isActive = publicPage === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setPublicPage(item.id)}
                        className={cn(
                          'flex items-center gap-3 w-full px-3 py-3 rounded-lg text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        )}
                      >
                        <item.icon className="w-5 h-5" />
                        {item.label}
                      </button>
                    );
                  })}
                  <Separator className="my-3" />
                  <Button
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                    onClick={() => setPublicPage('booking')}
                  >
                    <CalendarCheck className="w-4 h-4" />
                    Agendar Agora
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full gap-2 mt-2"
                    onClick={() => setPublicPage('login')}
                  >
                    <LogIn className="w-4 h-4" />
                    Entrar
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </motion.header>
  );
}
