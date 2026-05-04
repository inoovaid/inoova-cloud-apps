'use client';

import { useEffect, useCallback } from 'react';
import { useAppStore, type CRMTab, type PublicPage } from '@/lib/store';
import { TopNavbar } from '@/components/beauty-pro/layout/top-navbar';
import { AppSidebar } from '@/components/beauty-pro/layout/app-sidebar';
import { EnhancedDashboard } from '@/components/beauty-pro/dashboard/enhanced-dashboard';
import { CalendarView } from '@/components/beauty-pro/calendar/calendar-view';
import { ClientList } from '@/components/beauty-pro/crm/client-list';
import { ClientDetail } from '@/components/beauty-pro/crm/client-detail';
import { ClientFormDialog } from '@/components/beauty-pro/crm/client-form-dialog';
import { TeamList } from '@/components/beauty-pro/team/team-list';
import { ProfessionalFormDialog } from '@/components/beauty-pro/team/professional-form-dialog';
import { PDVView } from '@/components/beauty-pro/finance/pdv-view';
import { SalesHistory } from '@/components/beauty-pro/finance/sales-history';
import { FinancePage } from '@/components/beauty-pro/finance/finance-page';
import { AutomationList } from '@/components/beauty-pro/automations/automation-list';
import { SuggestionsPanel } from '@/components/beauty-pro/smart-ai/suggestions-panel';
import { BlogAdmin } from '@/components/beauty-pro/blog-admin/blog-admin';
import { LandingPage } from '@/components/beauty-pro/public/landing-page';
import { AboutPage } from '@/components/beauty-pro/public/about-page';
import { ServicesPage } from '@/components/beauty-pro/public/services-page';
import { BlogPage } from '@/components/beauty-pro/public/blog-page';
import { ContactPage } from '@/components/beauty-pro/public/contact-page';
import { BookingPage } from '@/components/beauty-pro/public/booking-page';
import { ShoppingPage } from '@/components/beauty-pro/public/shopping-page';
import { LoginPage } from '@/components/beauty-pro/public/login-page';
import { ProductManagement } from '@/components/beauty-pro/products/product-management';
import { SettingsPage } from '@/components/beauty-pro/settings/settings-page';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion, AnimatePresence } from 'framer-motion';

// ---- CRM Tab Components ----
const tabComponents: Record<CRMTab, React.FC> = {
  dashboard: EnhancedDashboard,
  calendar: CalendarView,
  clients: () => <><ClientList /><ClientDetail /><ClientFormDialog /></>,
  team: () => <><TeamList /><ProfessionalFormDialog /></>,
  finance: FinancePage,
  automations: AutomationList,
  'smart-ai': SuggestionsPanel,
  'blog-admin': BlogAdmin,
  'shopping-admin': ProductManagement,
  sales: () => <div className="space-y-6"><PDVView /><SalesHistory /></div>,
  settings: SettingsPage,
};

const tabTitles: Record<CRMTab, string> = {
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

const tabDescriptions: Record<CRMTab, string> = {
  dashboard: 'Visão geral do seu salão — personalize arrastando os cards',
  calendar: 'Gerencie os agendamentos — adicione, edite ou arraste para remarcar',
  clients: 'Gerencie e analise sua base de clientes',
  team: 'Gerencie profissionais e comissões',
  finance: 'Gestão financeira — contas a pagar e receber',
  automations: 'Configure mensagens e gatilhos automáticos',
  'smart-ai': 'Sugestões inteligentes para seu negócio',
  'blog-admin': 'Crie e edite postagens do blog',
  'shopping-admin': 'Gerencie o catálogo de produtos',
  sales: 'Ponto de venda e histórico de vendas',
  settings: 'Configurações do perfil e preferências',
};

// ---- Public Page Components ----
const publicComponents: Record<PublicPage, React.FC> = {
  landing: LandingPage,
  about: AboutPage,
  services: ServicesPage,
  blog: BlogPage,
  contact: ContactPage,
  booking: BookingPage,
  shopping: ShoppingPage,
  login: LoginPage,
};

export default function HomePage() {
  const { mode, activeTab, sidebarOpen, theme } = useAppStore();
  const isMobile = useIsMobile();

  // Apply theme
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Keyboard shortcut: Ctrl+B toggles sidebar
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
      e.preventDefault();
      useAppStore.getState().setSidebarOpen(!useAppStore.getState().sidebarOpen);
    }
  }, []);
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const TabComponent = tabComponents[activeTab];
  const publicPage = useAppStore((s) => s.publicPage);
  const ActivePublicComponent = publicComponents[publicPage];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopNavbar />

      <div className="flex flex-1">
        {mode === 'crm' && <AppSidebar />}

        <main
          className="flex-1 transition-all duration-200 min-w-0"
          style={{
            marginLeft: mode === 'crm' && !isMobile ? (sidebarOpen ? 256 : 60) : 0,
          }}
        >
          {mode === 'public' ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={publicPage}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {ActivePublicComponent && <ActivePublicComponent />}
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="mb-6"
                >
                  <h1 className="text-2xl font-bold tracking-tight">
                    {tabTitles[activeTab] || activeTab}
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    {tabDescriptions[activeTab] || ''}
                  </p>
                </motion.div>
              </AnimatePresence>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {TabComponent && <TabComponent />}
                </motion.div>
              </AnimatePresence>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
