'use client'

import { useAuthStore } from '@/store/auth'
import { useNavigationStore } from '@/store/navigation'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { AppHeader } from '@/components/layout/app-header'
import { LandingPage } from '@/components/landing/landing-page'
import { LoginDialog } from '@/components/shared/login-dialog'
import { ProfileDialog } from '@/components/shared/profile-dialog'
import { DashboardPage } from '@/components/dashboard/dashboard-page'
import { FinanceiroPage } from '@/components/financeiro/financeiro-page'
import { ContasPage } from '@/components/contas/contas-page'
import { ClientesPage } from '@/components/clientes/clientes-page'
import { ComissoesPage } from '@/components/comissoes/comissoes-page'
import { AutomacoesPage } from '@/components/automacoes/automacoes-page'
import { RelatoriosPage } from '@/components/relatorios/relatorios-page'
import { ConfiguracoesPage } from '@/components/configuracoes/configuracoes-page'
import { AnimatePresence, motion } from 'framer-motion'

const pages: Record<string, React.ComponentType> = {
  dashboard: DashboardPage,
  financeiro: FinanceiroPage,
  contas: ContasPage,
  clientes: ClientesPage,
  comissoes: ComissoesPage,
  automacoes: AutomacoesPage,
  relatorios: RelatoriosPage,
  configuracoes: ConfiguracoesPage,
}

export default function Home() {
  const { isAuthenticated } = useAuthStore()
  const { currentPage } = useNavigationStore()
  const PageComponent = pages[currentPage] || DashboardPage

  return (
    <>
      <LoginDialog />
      <ProfileDialog />

      {!isAuthenticated ? (
        <LandingPage />
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <SidebarProvider>
              <AppSidebar />
              <SidebarInset>
                <AppHeader />
                <main className="flex-1 p-4 md:p-6 overflow-auto">
                  <PageComponent />
                </main>
              </SidebarInset>
            </SidebarProvider>
          </motion.div>
        </AnimatePresence>
      )}
    </>
  )
}
