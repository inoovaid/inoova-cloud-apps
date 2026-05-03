'use client'

import { useNavigationStore, type Page } from '@/store/navigation'
import { cn } from '@/lib/utils'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import {
  LayoutDashboard,
  DollarSign,
  Receipt,
  Users,
  Percent,
  Zap,
  BarChart3,
  Settings,
  TrendingUp,
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const navItems: { page: Page; label: string; icon: React.ElementType }[] = [
  { page: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { page: 'financeiro', label: 'Financeiro', icon: DollarSign },
  { page: 'contas', label: 'Contas', icon: Receipt },
  { page: 'clientes', label: 'Clientes', icon: Users },
  { page: 'comissoes', label: 'Comissões', icon: Percent },
  { page: 'automacoes', label: 'Automações', icon: Zap },
  { page: 'relatorios', label: 'Relatórios', icon: BarChart3 },
  { page: 'configuracoes', label: 'Configurações', icon: Settings },
]

export function AppSidebar() {
  const { currentPage, setCurrentPage } = useNavigationStore()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[active=true]:bg-emerald-600 data-[active=true]:text-white hover:bg-emerald-50 dark:hover:bg-emerald-950"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-emerald-600 text-white group-data-[collapsible=icon]:size-6">
                <TrendingUp className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-bold">FinanceFlow</span>
                <span className="truncate text-xs text-muted-foreground">CRM Financeiro</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.page}>
                  <SidebarMenuButton
                    isActive={currentPage === item.page}
                    onClick={() => setCurrentPage(item.page)}
                    tooltip={item.label}
                    className={cn(
                      'cursor-pointer transition-all duration-200',
                      currentPage === item.page &&
                        'bg-emerald-100 text-emerald-900 font-medium dark:bg-emerald-900/30 dark:text-emerald-400'
                    )}
                  >
                    <item.icon className="size-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <Avatar className="size-8">
                <AvatarFallback className="bg-emerald-600 text-white text-xs">
                  CA
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Carlos Admin</span>
                <span className="truncate text-xs text-muted-foreground">
                  carlos@financeflow.com
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
