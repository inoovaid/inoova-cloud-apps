'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { useCRMStore } from '@/stores/crm-store';
import { useIsMobile } from '@/hooks/use-mobile';
import { CRMSidebar } from '@/components/crm/sidebar';
import { CRMHeader } from '@/components/crm/header';
import { CRMPage } from '@/lib/types';
import { DashboardPage } from '@/components/crm/dashboard/dashboard-page';
import { StudentsPage } from '@/components/crm/students/students-page';
import { CoursesPage } from '@/components/crm/courses/courses-page';
import { EnrollmentsPage } from '@/components/crm/enrollments/enrollments-page';
import { FinancialPage } from '@/components/crm/financial/financial-page';
import { PipelinePage } from '@/components/crm/pipeline/pipeline-page';
import { ReportsPage } from '@/components/crm/reports/reports-page';
import { AutomationsPage } from '@/components/crm/automations/automations-page';
import { SettingsPage } from '@/components/crm/settings/settings-page';

// ─── Page Component Map ────────────────────────────────────────────────────

const pageComponents: Record<CRMPage, React.ComponentType> = {
  dashboard: DashboardPage,
  students: StudentsPage,
  courses: CoursesPage,
  enrollments: EnrollmentsPage,
  financial: FinancialPage,
  pipeline: PipelinePage,
  reports: ReportsPage,
  automations: AutomationsPage,
  settings: SettingsPage,
};

// ─── Main CRM Layout ───────────────────────────────────────────────────────

export function CRMLayout() {
  const { currentPage, sidebarOpen } = useCRMStore();
  const isMobile = useIsMobile();

  const PageComponent = pageComponents[currentPage];

  // Calculate sidebar width for content offset
  const sidebarWidth = useMemo(() => {
    if (isMobile) return 0; // No offset on mobile (sidebar overlays)
    return sidebarOpen ? 256 : 68; // w-64 = 256px, collapsed = 68px
  }, [isMobile, sidebarOpen]);

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <CRMSidebar />

      {/* Main content area */}
      <div
        className="flex min-h-screen flex-col transition-all duration-300 ease-in-out"
        style={{ marginLeft: sidebarWidth }}
      >
        {/* Header */}
        <CRMHeader />

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
            >
              <PageComponent />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
