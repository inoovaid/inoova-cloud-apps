'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useAppStore, type DashboardCardId } from '@/lib/store';
import { GripVertical, Eye, EyeOff, RotateCcw } from 'lucide-react';
import { useState } from 'react';
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
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const cardLabels: Record<DashboardCardId, { label: string; group: string }> = {
  'kpi-revenue': { label: 'Faturamento Hoje', group: 'KPIs' },
  'kpi-appointments': { label: 'Agendamentos Hoje', group: 'KPIs' },
  'kpi-avgTicket': { label: 'Ticket Médio', group: 'KPIs' },
  'kpi-clients': { label: 'Clientes Ativos', group: 'KPIs' },
  'revenue-chart': { label: 'Gráfico de Faturamento', group: 'Gráficos' },
  'appointments-today': { label: 'Agendamentos de Hoje', group: 'Listas' },
  'top-clients': { label: 'Top Clientes', group: 'Listas' },
  'low-stock': { label: 'Estoque Baixo', group: 'Alertas' },
  'recent-sales': { label: 'Vendas Recentes', group: 'Listas' },
  'team-performance': { label: 'Performance da Equipe', group: 'Gráficos' },
  'smart-suggestions': { label: 'Sugestões Inteligentes', group: 'AI' },
  'upcoming-birthdays': { label: 'Aniversariantes', group: 'Listas' },
  'client-segments': { label: 'Segmentos de Clientes', group: 'Gráficos' },
  'popular-services': { label: 'Serviços Populares', group: 'Gráficos' },
  'automation-status': { label: 'Status Automações', group: 'AI' },
  'weekly-comparison': { label: 'Comparação Semanal', group: 'Gráficos' },
};

const allCardIds: DashboardCardId[] = Object.keys(cardLabels) as DashboardCardId[];

function SortableCardItem({ id, isActive, onToggle }: { id: DashboardCardId; isActive: boolean; onToggle: (id: DashboardCardId) => void }) {
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
    opacity: isDragging ? 0.5 : 1,
  };

  const cardInfo = cardLabels[id];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-2.5 rounded-lg border border-border/50 bg-card hover:bg-accent/50 transition-colors"
    >
      <button
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-4 h-4" />
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{cardInfo?.label || id}</p>
        <Badge variant="secondary" className="text-[10px] mt-0.5">{cardInfo?.group || 'Outros'}</Badge>
      </div>
      <Checkbox
        checked={isActive}
        onCheckedChange={() => onToggle(id)}
      />
    </div>
  );
}

interface DashboardCustomizerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DashboardCustomizer({ open, onOpenChange }: DashboardCustomizerProps) {
  const { dashboardCards, setDashboardCards } = useAppStore();
  const [localCards, setLocalCards] = useState<DashboardCardId[]>(dashboardCards);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleToggle = (id: DashboardCardId) => {
    setLocalCards((prev) => {
      if (prev.includes(id)) {
        return prev.filter((c) => c !== id);
      }
      return [...prev, id];
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setLocalCards((items) => {
        const oldIndex = items.indexOf(active.id as DashboardCardId);
        const newIndex = items.indexOf(over.id as DashboardCardId);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSave = () => {
    setDashboardCards(localCards);
    onOpenChange(false);
  };

  const handleReset = () => {
    const defaultCards: DashboardCardId[] = [
      'kpi-revenue', 'kpi-appointments', 'kpi-avgTicket', 'kpi-clients',
      'revenue-chart', 'appointments-today', 'top-clients',
      'low-stock', 'recent-sales', 'smart-suggestions',
    ];
    setLocalCards(defaultCards);
  };

  // Include all cards but inactive ones at bottom
  const orderedCards = [
    ...localCards,
    ...allCardIds.filter((id) => !localCards.includes(id)),
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Personalizar Dashboard
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Arraste para reordenar. Marque/desmarque para mostrar/ocultar.
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-2 py-2">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={orderedCards} strategy={verticalListSortingStrategy}>
              {orderedCards.map((id) => (
                <SortableCardItem
                  key={id}
                  id={id}
                  isActive={localCards.includes(id)}
                  onToggle={handleToggle}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>

        <div className="flex items-center justify-between pt-3 border-t">
          <Button variant="ghost" size="sm" onClick={handleReset} className="text-xs">
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Restaurar Padrão
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button size="sm" onClick={handleSave}>
              Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
