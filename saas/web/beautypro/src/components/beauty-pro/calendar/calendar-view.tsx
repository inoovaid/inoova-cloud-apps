'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCalendarData, useProfessionals, useClients, useServices, statusLabel } from '@/lib/hooks';
import { useAppStore } from '@/lib/store';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  MapPin,
  AlertCircle,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  CalendarIcon,
  Scissors,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';

const DAYS_PT = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 08:00 - 19:00
const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const h = i + 6;
  return `${String(h).padStart(2, '0')}:00`;
}).concat(Array.from({ length: 24 }, (_, i) => {
  const h = i + 6;
  return `${String(h).padStart(2, '0')}:30`;
})).sort();

interface AppointmentItem {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  clientName: string;
  services: string[];
  professionalName: string;
  professionalColor: string;
  status: string;
  professionalId?: string;
  clientId?: string;
  notes?: string;
  serviceIds?: string[];
}

function calculateEndTime(startTime: string, durationMinutes: number): string {
  const [h, m] = startTime.split(':').map(Number);
  const totalMinutes = h * 60 + m + durationMinutes;
  const newH = Math.floor(totalMinutes / 60);
  const newM = totalMinutes % 60;
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
}

function calculateDuration(startTime: string, endTime: string): number {
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  return (eh * 60 + em) - (sh * 60 + sm);
}

// Zod schema for appointment form
const appointmentSchema = z.object({
  clientId: z.string().min(1, 'Cliente é obrigatório'),
  professionalId: z.string().min(1, 'Profissional é obrigatório'),
  date: z.string().min(1, 'Data é obrigatória'),
  startTime: z.string().min(1, 'Horário de início é obrigatório'),
  endTime: z.string().min(1, 'Horário de término é obrigatório'),
  notes: z.string().optional(),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

// ─── Appointment Form Dialog ────────────────────────────────────────────────

function AppointmentFormDialog() {
  const { appointmentDialogOpen, setAppointmentDialogOpen, editingAppointmentId, setEditingAppointmentId } = useAppStore();
  const { data: clients } = useClients();
  const { data: professionals } = useProfessionals();
  const { data: services } = useServices();
  const { data: calendarData } = useCalendarData();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);

  const isEditing = !!editingAppointmentId;

  // Find the editing appointment from calendar data
  const editingAppointment = useMemo(() => {
    if (!editingAppointmentId || !calendarData) return null;
    return calendarData.find((a: any) => a.id === editingAppointmentId) || null;
  }, [editingAppointmentId, calendarData]);

  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      clientId: '',
      professionalId: '',
      date: '',
      startTime: '',
      endTime: '',
      notes: '',
    },
  });

  // Watch startTime and selected services to auto-calculate endTime
  const watchedStartTime = form.watch('startTime');
  const watchedProfessionalId = form.watch('professionalId');

  // Auto-calculate end time based on selected services total duration
  useEffect(() => {
    if (!watchedStartTime || selectedServiceIds.length === 0) return;
    const selectedServices = services?.filter((s) => selectedServiceIds.includes(s.id)) || [];
    const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0);
    if (totalDuration > 0) {
      const newEndTime = calculateEndTime(watchedStartTime, totalDuration);
      form.setValue('endTime', newEndTime);
    }
  }, [watchedStartTime, selectedServiceIds, services, form]);

  // Populate form when editing
  useEffect(() => {
    if (editingAppointment && isEditing && appointmentDialogOpen) {
      form.reset({
        clientId: editingAppointment.clientId || '',
        professionalId: editingAppointment.professionalId || '',
        date: editingAppointment.date || '',
        startTime: editingAppointment.startTime || '',
        endTime: editingAppointment.endTime || '',
        notes: (editingAppointment as any).notes || '',
      });
      setSelectedServiceIds((editingAppointment as any).serviceIds || []);
    } else if (!appointmentDialogOpen) {
      form.reset({
        clientId: '',
        professionalId: '',
        date: '',
        startTime: '',
        endTime: '',
        notes: '',
      });
      setSelectedServiceIds([]);
    }
  }, [editingAppointment, isEditing, appointmentDialogOpen, form]);

  const handleClose = () => {
    setAppointmentDialogOpen(false);
    setEditingAppointmentId(null);
    setSelectedServiceIds([]);
    form.reset();
  };

  const toggleService = (serviceId: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const onSubmit = async (data: AppointmentFormData) => {
    setIsSaving(true);
    try {
      const payload = {
        clientId: data.clientId,
        professionalId: data.professionalId,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        notes: data.notes || null,
        serviceIds: selectedServiceIds,
      };

      if (isEditing && editingAppointmentId) {
        const res = await fetch('/api/appointments', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingAppointmentId, ...payload }),
        });
        if (!res.ok) throw new Error('Failed to update appointment');
      } else {
        const res = await fetch('/api/appointments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to create appointment');
      }

      await queryClient.invalidateQueries({ queryKey: ['calendar'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      handleClose();
    } catch (error) {
      console.error('Save appointment error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Group services by category for the checkboxes
  const servicesByCategory = useMemo(() => {
    if (!services) return {};
    const grouped: Record<string, typeof services> = {};
    for (const s of services) {
      const cat = s.category || 'Outros';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(s);
    }
    return grouped;
  }, [services]);

  // Date picker state
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  return (
    <Dialog open={appointmentDialogOpen} onOpenChange={(open) => !isSaving && !open && handleClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Agendamento' : 'Novo Agendamento'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Atualize as informações do agendamento' : 'Preencha os dados do novo agendamento'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Client selection */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">
              Cliente <span className="text-red-500">*</span>
            </Label>
            <Select
              value={form.watch('clientId') || ''}
              onValueChange={(value) => form.setValue('clientId', value)}
            >
              <SelectTrigger className="h-9 w-full">
                <SelectValue placeholder="Selecione o cliente" />
              </SelectTrigger>
              <SelectContent>
                {clients?.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.clientId && (
              <p className="text-xs text-red-500">{form.formState.errors.clientId.message}</p>
            )}
          </div>

          {/* Professional selection */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">
              Profissional <span className="text-red-500">*</span>
            </Label>
            <Select
              value={form.watch('professionalId') || ''}
              onValueChange={(value) => form.setValue('professionalId', value)}
            >
              <SelectTrigger className="h-9 w-full">
                <SelectValue placeholder="Selecione o profissional" />
              </SelectTrigger>
              <SelectContent>
                {professionals?.filter((p) => p.isActive).map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                      {p.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.professionalId && (
              <p className="text-xs text-red-500">{form.formState.errors.professionalId.message}</p>
            )}
          </div>

          {/* Service selection (checkboxes grouped by category) */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Serviços</Label>
            <div className="border rounded-lg p-3 max-h-48 overflow-y-auto space-y-3">
              {Object.keys(servicesByCategory).length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-2">Nenhum serviço disponível</p>
              )}
              {Object.entries(servicesByCategory).map(([category, svcs]) => (
                <div key={category}>
                  <p className="text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">{category}</p>
                  <div className="space-y-1.5">
                    {svcs.map((s) => (
                      <label
                        key={s.id}
                        className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 rounded px-1 py-0.5"
                      >
                        <Checkbox
                          checked={selectedServiceIds.includes(s.id)}
                          onCheckedChange={() => toggleService(s.id)}
                        />
                        <span className="flex-1">{s.name}</span>
                        <span className="text-xs text-muted-foreground">{s.duration}min</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {selectedServiceIds.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Duração total: {services?.filter((s) => selectedServiceIds.includes(s.id)).reduce((sum, s) => sum + s.duration, 0)}min
              </p>
            )}
          </div>

          {/* Date picker */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">
              Data <span className="text-red-500">*</span>
            </Label>
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  type="button"
                  className={cn(
                    'h-9 w-full justify-start text-left font-normal',
                    !form.watch('date') && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {form.watch('date')
                    ? format(new Date(form.watch('date') + 'T12:00:00'), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                    : 'Selecione a data'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={form.watch('date') ? new Date(form.watch('date') + 'T12:00:00') : undefined}
                  onSelect={(date) => {
                    if (date) {
                      form.setValue('date', date.toISOString().split('T')[0]);
                    }
                    setDatePickerOpen(false);
                  }}
                  locale={ptBR}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {form.formState.errors.date && (
              <p className="text-xs text-red-500">{form.formState.errors.date.message}</p>
            )}
          </div>

          {/* Start and End time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                Início <span className="text-red-500">*</span>
              </Label>
              <Select
                value={form.watch('startTime') || ''}
                onValueChange={(value) => form.setValue('startTime', value)}
              >
                <SelectTrigger className="h-9 w-full">
                  <SelectValue placeholder="Início" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_SLOTS.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.startTime && (
                <p className="text-xs text-red-500">{form.formState.errors.startTime.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                Término <span className="text-red-500">*</span>
              </Label>
              <Select
                value={form.watch('endTime') || ''}
                onValueChange={(value) => form.setValue('endTime', value)}
              >
                <SelectTrigger className="h-9 w-full">
                  <SelectValue placeholder="Término" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_SLOTS.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.endTime && (
                <p className="text-xs text-red-500">{form.formState.errors.endTime.message}</p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Observações</Label>
            <Textarea
              placeholder="Observações sobre o agendamento..."
              {...form.register('notes')}
              className="min-h-[60px] text-sm"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={handleClose} disabled={isSaving}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={isSaving}>
              {isSaving && <Loader2 className="w-3 h-3 animate-spin mr-1.5" />}
              {isEditing ? 'Salvar Alterações' : 'Criar Agendamento'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Appointment Detail Dialog ───────────────────────────────────────────────

function AppointmentDetailDialog({
  appointment,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: {
  appointment: AppointmentItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (appointment: AppointmentItem) => void;
  onDelete: (appointment: AppointmentItem) => void;
}) {
  if (!appointment) return null;

  const formatDateBR = (dateStr: string) => {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Detalhes do Agendamento</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: appointment.professionalColor }} />
            <span className="text-sm font-medium">{appointment.clientName}</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarIcon className="w-4 h-4" />
              <span>{formatDateBR(appointment.date)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{appointment.startTime} - {appointment.endTime}</span>
              <span className="text-xs">({calculateDuration(appointment.startTime, appointment.endTime)}min)</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="w-4 h-4" />
              <span>{appointment.professionalName}</span>
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">Serviços</p>
            <div className="flex flex-wrap gap-1">
              {appointment.services.map((s) => (
                <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">Status</p>
            <Badge variant="secondary">{statusLabel(appointment.status)}</Badge>
          </div>

          {appointment.notes && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Observações</p>
              <p className="text-sm bg-muted/50 rounded-lg p-2">{appointment.notes}</p>
            </div>
          )}

          <div className="text-xs text-muted-foreground flex items-center gap-1 pt-2">
            <MapPin className="w-3 h-3" />
            Arraste no calendário para remarcar
          </div>
        </div>

        <DialogFooter className="flex-row gap-2 sm:justify-between">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(appointment)}
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            Excluir
          </Button>
          <Button
            size="sm"
            onClick={() => onEdit(appointment)}
          >
            <Pencil className="w-3.5 h-3.5 mr-1.5" />
            Editar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Calendar View ──────────────────────────────────────────────────────

export function CalendarView() {
  const { data, isLoading } = useCalendarData();
  const { data: professionals } = useProfessionals();
  const queryClient = useQueryClient();
  const { setAppointmentDialogOpen, setEditingAppointmentId } = useAppStore();
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedPro, setSelectedPro] = useState('all');
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [draggedAppointment, setDraggedAppointment] = useState<AppointmentItem | null>(null);
  const [rescheduleDialog, setRescheduleDialog] = useState<{
    open: boolean;
    appointment: AppointmentItem | null;
    newDate: string;
    newTime: string;
  }>({ open: false, appointment: null, newDate: '', newTime: '' });
  const [isRescheduling, setIsRescheduling] = useState(false);

  // Delete confirmation
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    appointment: AppointmentItem | null;
  }>({ open: false, appointment: null });
  const [isDeleting, setIsDeleting] = useState(false);

  const professionalFilters = useMemo(() => {
    const filters = [{ id: 'all', name: 'Todos', color: '#6b7280' }];
    if (professionals) {
      for (const p of professionals) {
        filters.push({ id: p.name, name: p.name, color: p.color });
      }
    }
    return filters;
  }, [professionals]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const weekDays = useMemo(() => {
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - now.getDay() + 1 + weekOffset * 7);
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  }, [weekOffset]);

  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter((apt) => {
      if (selectedPro !== 'all' && apt.professionalName !== selectedPro) return false;
      return weekDays.some((d) => d.toISOString().split('T')[0] === apt.date);
    });
  }, [data, selectedPro, weekDays]);

  const getAppointmentsForSlot = useCallback((dateStr: string, hour: number) => {
    return filteredData.filter((apt) => {
      if (apt.date !== dateStr) return false;
      const startHour = parseInt(apt.startTime.split(':')[0]);
      const endHour = parseInt(apt.endTime.split(':')[0]);
      return hour >= startHour && hour < endHour;
    });
  }, [filteredData]);

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const apt = filteredData.find((a) => a.id === active.id);
    if (apt) {
      setDraggedAppointment(apt as AppointmentItem);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setDraggedAppointment(null);

    if (!over || !over.data.current) return;

    const apt = filteredData.find((a) => a.id === active.id);
    if (!apt) return;

    const dropData = over.data.current as { date: string; hour: number };

    // Calculate new time
    const durationMinutes = calculateDuration(apt.startTime, apt.endTime);
    const newStartTime = `${String(dropData.hour).padStart(2, '0')}:00`;
    const newEndTime = calculateEndTime(newStartTime, durationMinutes);
    const newDate = dropData.date;

    // Don't show dialog if dropped on same slot
    if (newDate === apt.date && newStartTime === apt.startTime) return;

    setRescheduleDialog({
      open: true,
      appointment: apt as AppointmentItem,
      newDate,
      newTime: newStartTime,
    });
  };

  const handleConfirmReschedule = async () => {
    if (!rescheduleDialog.appointment) return;
    setIsRescheduling(true);

    try {
      const apt = rescheduleDialog.appointment;
      const durationMinutes = calculateDuration(apt.startTime, apt.endTime);
      const newEndTime = calculateEndTime(rescheduleDialog.newTime, durationMinutes);

      await fetch('/api/appointments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: apt.id,
          date: rescheduleDialog.newDate,
          startTime: rescheduleDialog.newTime,
          endTime: newEndTime,
        }),
      });

      await queryClient.invalidateQueries({ queryKey: ['calendar'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    } catch (error) {
      console.error('Reschedule error:', error);
    } finally {
      setIsRescheduling(false);
      setRescheduleDialog({ open: false, appointment: null, newDate: '', newTime: '' });
    }
  };

  const handleAppointmentClick = (apt: AppointmentItem) => {
    setSelectedAppointment(apt);
    setDetailOpen(true);
  };

  const handleEditAppointment = (apt: AppointmentItem) => {
    setDetailOpen(false);
    setSelectedAppointment(null);
    setEditingAppointmentId(apt.id);
    setAppointmentDialogOpen(true);
  };

  const handleDeleteClick = (apt: AppointmentItem) => {
    setDetailOpen(false);
    setDeleteDialog({ open: true, appointment: apt });
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialog.appointment) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/appointments?id=${deleteDialog.appointment.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete appointment');

      await queryClient.invalidateQueries({ queryKey: ['calendar'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    } catch (error) {
      console.error('Delete appointment error:', error);
    } finally {
      setIsDeleting(false);
      setDeleteDialog({ open: false, appointment: null });
      setSelectedAppointment(null);
    }
  };

  const handleNewAppointment = () => {
    setEditingAppointmentId(null);
    setAppointmentDialogOpen(true);
  };

  const formatDateBR = (dateStr: string) => {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="h-[600px] bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setWeekOffset((o) => o - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-base font-semibold">
                {weekDays[0]?.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} -{' '}
                {weekDays[5]?.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
              </CardTitle>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setWeekOffset((o) => o + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              {weekOffset !== 0 && (
                <Button variant="ghost" size="sm" onClick={() => setWeekOffset(0)} className="text-xs">
                  Hoje
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Professional filter tabs */}
              <div className="flex gap-1 flex-wrap">
                {professionalFilters.map((pro) => (
                  <Button
                    key={pro.id}
                    variant={selectedPro === pro.id ? 'default' : 'outline'}
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => setSelectedPro(pro.id)}
                  >
                    <div className="w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: pro.color }} />
                    {pro.name}
                  </Button>
                ))}
              </div>

              {/* New Appointment button */}
              <Button size="sm" className="h-7 text-xs" onClick={handleNewAppointment}>
                <Plus className="w-3.5 h-3.5 mr-1" />
                Novo Agendamento
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <ScrollArea className="h-[560px]">
            <div className="min-w-[600px] sm:min-w-[700px]">
              {/* Day headers */}
              <div className="grid grid-cols-[60px_repeat(6,1fr)] border-b border-border">
                <div className="p-2" />
                {weekDays.map((day, idx) => {
                  const isToday = day.toDateString() === now.toDateString();
                  return (
                    <div key={idx} className={cn('p-2 text-center border-l border-border', isToday && 'bg-primary/5')}>
                      <p className="text-xs text-muted-foreground">{DAYS_PT[idx]}</p>
                      <p className={cn('text-sm font-semibold', isToday && 'text-primary')}>
                        {day.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Time grid with DnD */}
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                {HOURS.map((hour) => {
                  const isCurrentHour = hour === currentHour && weekOffset === 0;
                  return (
                    <div key={hour} className="grid grid-cols-[60px_repeat(6,1fr)] border-b border-border/50 relative">
                      <div className="p-1 text-right pr-3">
                        <span className="text-[11px] text-muted-foreground">
                          {String(hour).padStart(2, '0')}:00
                        </span>
                      </div>

                      {weekDays.map((day, dayIdx) => {
                        const dateStr = day.toISOString().split('T')[0];
                        const appts = getAppointmentsForSlot(dateStr, hour);
                        const isToday = day.toDateString() === now.toDateString();

                        return (
                          <div
                            key={dayIdx}
                            id={`slot-${dateStr}-${hour}`}
                            data-date={dateStr}
                            data-hour={hour}
                            className={cn(
                              'min-h-[48px] border-l border-border/50 p-0.5 relative transition-colors',
                              isToday && 'bg-primary/[0.02]',
                              isCurrentHour && isToday && 'bg-primary/[0.04]'
                            )}
                          >
                            {/* Drop zone */}
                            <div
                              className="absolute inset-0"
                              data-date={dateStr}
                              data-hour={hour}
                            />

                            {/* Current time indicator */}
                            {isCurrentHour && isToday && (
                              <div
                                className="absolute left-0 right-0 h-0.5 bg-red-500 z-10"
                                style={{ top: `${(currentMinute / 60) * 100}%` }}
                              >
                                <div className="absolute -left-1 -top-1 w-2 h-2 rounded-full bg-red-500" />
                              </div>
                            )}

                            {appts.map((apt) => (
                              <motion.div
                                key={apt.id}
                                id={apt.id}
                                className={cn(
                                  'w-full text-left rounded-md px-1.5 py-1 text-[10px] leading-tight cursor-grab active:cursor-grabbing hover:opacity-80 transition-opacity',
                                  draggedAppointment?.id === apt.id && 'opacity-40'
                                )}
                                style={{
                                  backgroundColor: apt.professionalColor + '20',
                                  borderLeft: `3px solid ${apt.professionalColor}`,
                                }}
                                onClick={() => handleAppointmentClick(apt as AppointmentItem)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <p className="font-semibold truncate" style={{ color: apt.professionalColor }}>
                                  {apt.clientName}
                                </p>
                                <p className="text-muted-foreground truncate">
                                  {apt.startTime} {apt.services[0]}
                                </p>
                              </motion.div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}

                <DragOverlay>
                  {draggedAppointment && (
                    <div
                      className="rounded-md px-2 py-1.5 text-xs shadow-lg border border-border"
                      style={{
                        backgroundColor: draggedAppointment.professionalColor + '30',
                        borderLeft: `3px solid ${draggedAppointment.professionalColor}`,
                        minWidth: 120,
                      }}
                    >
                      <p className="font-semibold" style={{ color: draggedAppointment.professionalColor }}>
                        {draggedAppointment.clientName}
                      </p>
                      <p className="text-muted-foreground">{draggedAppointment.startTime}</p>
                    </div>
                  )}
                </DragOverlay>
              </DndContext>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Appointment detail dialog */}
      <AppointmentDetailDialog
        appointment={selectedAppointment}
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) setSelectedAppointment(null);
        }}
        onEdit={handleEditAppointment}
        onDelete={handleDeleteClick}
      />

      {/* Appointment form dialog (add/edit) */}
      <AppointmentFormDialog />

      {/* Reschedule confirmation dialog */}
      <Dialog open={rescheduleDialog.open} onOpenChange={(open) => !isRescheduling && setRescheduleDialog((prev) => ({ ...prev, open }))}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              Confirmar Remarcação
            </DialogTitle>
            <DialogDescription>
              Deseja remarcar este agendamento?
            </DialogDescription>
          </DialogHeader>
          {rescheduleDialog.appointment && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-muted/50 space-y-1">
                <p className="text-sm font-medium">{rescheduleDialog.appointment.clientName}</p>
                <p className="text-xs text-muted-foreground">
                  De: {formatDateBR(rescheduleDialog.appointment.date)} às {rescheduleDialog.appointment.startTime}
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  Para: {formatDateBR(rescheduleDialog.newDate)} às {rescheduleDialog.newTime}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" size="sm" disabled={isRescheduling} onClick={() => setRescheduleDialog((prev) => ({ ...prev, open: false }))}>
              Cancelar
            </Button>
            <Button size="sm" disabled={isRescheduling} onClick={handleConfirmReschedule}>
              {isRescheduling ? 'Remarcando...' : 'Confirmar Remarcação'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => !isDeleting && setDeleteDialog({ open, appointment: open ? deleteDialog.appointment : null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Excluir Agendamento
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o agendamento de <strong>{deleteDialog.appointment?.clientName}</strong>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  Excluindo...
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  Excluir
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
