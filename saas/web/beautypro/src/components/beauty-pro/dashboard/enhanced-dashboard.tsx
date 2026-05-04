'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppStore, type DashboardCardId } from '@/lib/store';
import { Settings2, GripVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Existing card components
import { KPICards } from './kpi-cards';
import { RevenueChart } from './revenue-chart';
import { AppointmentsToday } from './appointments-today';
import { TopClients } from './top-clients';

// New card components
import { LowStockCard } from './low-stock-card';
import { RecentSalesCard } from './recent-sales-card';
import { TeamPerformanceCard } from './team-performance-card';
import { SmartSuggestionsCard } from './smart-suggestions-card';
import { UpcomingBirthdaysCard } from './upcoming-birthdays-card';
import { ClientSegmentsCard } from './client-segments-card';
import { PopularServicesCard } from './popular-services-card';
import { DashboardCustomizer } from './dashboard-customizer';

function SortableDashboardCard({ id, children }: { id: DashboardCardId; children: React.ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 50 : 'auto' as const,
  };

  // Determine span based on card type
  const spanClass = getSpanClass(id);

  return (
    <div ref={setNodeRef} style={style} className={spanClass}>
      <div className="relative group">
        {/* Drag handle overlay */}
        <div
          className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <div className="bg-card border border-border rounded-md p-1.5 shadow-sm hover:bg-accent">
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

function getSpanClass(id: DashboardCardId): string {
  switch (id) {
    case 'kpi-revenue':
    case 'kpi-appointments':
    case 'kpi-avgTicket':
    case 'kpi-clients':
      return 'col-span-1';
    case 'revenue-chart':
    case 'team-performance':
    case 'client-segments':
    case 'popular-services':
      return 'col-span-1 lg:col-span-2';
    default:
      return 'col-span-1';
  }
}

function renderCard(id: DashboardCardId) {
  switch (id) {
    case 'kpi-revenue':
    case 'kpi-appointments':
    case 'kpi-avgTicket':
    case 'kpi-clients':
      // KPI cards are rendered as a group
      return null;
    case 'revenue-chart':
      return <RevenueChart />;
    case 'appointments-today':
      return <AppointmentsToday />;
    case 'top-clients':
      return <TopClients />;
    case 'low-stock':
      return <LowStockCard />;
    case 'recent-sales':
      return <RecentSalesCard />;
    case 'team-performance':
      return <TeamPerformanceCard />;
    case 'smart-suggestions':
      return <SmartSuggestionsCard />;
    case 'upcoming-birthdays':
      return <UpcomingBirthdaysCard />;
    case 'client-segments':
      return <ClientSegmentsCard />;
    case 'popular-services':
      return <PopularServicesCard />;
    default:
      return (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground text-sm">
              Card: {id}
            </div>
          </CardContent>
        </Card>
      );
  }
}

export function EnhancedDashboard() {
  const { dashboardCards, setDashboardCards } = useAppStore();
  const [customizerOpen, setCustomizerOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Check if KPI cards are in the dashboard
  const kpiCards: DashboardCardId[] = ['kpi-revenue', 'kpi-appointments', 'kpi-avgTicket', 'kpi-clients'];
  const hasKPIs = kpiCards.some((kpi) => dashboardCards.includes(kpi));

  // Filter out individual KPI cards from sortable list, they render as a group
  const sortableCards = dashboardCards.filter((id) => !kpiCards.includes(id));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = sortableCards.indexOf(active.id as DashboardCardId);
      const newIndex = sortableCards.indexOf(over.id as DashboardCardId);
      const newSortable = arrayMove(sortableCards, oldIndex, newIndex);

      // Reconstruct full cards array, keeping KPIs at their original position
      const newCards: DashboardCardId[] = [];
      let sortableIdx = 0;

      for (const card of dashboardCards) {
        if (kpiCards.includes(card)) {
          newCards.push(card);
        } else {
          if (sortableIdx < newSortable.length) {
            newCards.push(newSortable[sortableIdx]);
          }
          sortableIdx++;
        }
      }

      setDashboardCards(newCards);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with customize button */}
      <div className="flex items-center justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCustomizerOpen(true)}
          className="text-xs"
        >
          <Settings2 className="w-3.5 h-3.5 mr-1.5" />
          Customizar
        </Button>
      </div>

      {/* KPI Cards (rendered as a group) */}
      {hasKPIs && <KPICards />}

      {/* Sortable Dashboard Cards */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={sortableCards} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {sortableCards.map((id) => (
                <SortableDashboardCard key={id} id={id}>
                  {renderCard(id)}
                </SortableDashboardCard>
              ))}
            </AnimatePresence>
          </div>
        </SortableContext>
      </DndContext>

      {/* Customizer Dialog */}
      <DashboardCustomizer open={customizerOpen} onOpenChange={setCustomizerOpen} />
    </div>
  );
}
