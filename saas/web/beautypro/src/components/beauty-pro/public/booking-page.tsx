'use client';

import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Calendar } from '@/components/ui/calendar';
import { Separator } from '@/components/ui/separator';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/lib/store';
import { formatBRL } from '@/lib/hooks';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  User,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Scissors,
  Sparkles,
  Phone,
  Mail,
  PartyPopper,
} from 'lucide-react';

interface Service {
  id: string;
  name: string;
  category: string | null;
  duration: number;
  price: number;
  description: string | null;
  isActive: boolean;
}

interface Professional {
  id: string;
  name: string;
  specialty: string | null;
  color: string | null;
  bio: string | null;
  phone: string | null;
}

const stepLabels = ['Serviço', 'Profissional', 'Data/Hora', 'Confirmar'];
const stepIcons = [Scissors, User, CalendarDays, CheckCircle2];

const timeSlots = [];
for (let h = 8; h < 18; h++) {
  timeSlots.push(`${h.toString().padStart(2, '0')}:00`);
  timeSlots.push(`${h.toString().padStart(2, '0')}:30`);
}

export function BookingPage() {
  const {
    bookingStep,
    setBookingStep,
    bookingServiceId,
    setBookingServiceId,
    bookingProfessionalId,
    setBookingProfessionalId,
    bookingDate,
    setBookingDate,
    bookingTime,
    setBookingTime,
  } = useAppStore();

  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [bookingComplete, setBookingComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch services grouped by category
  const { data: servicesGrouped, isLoading: servicesLoading } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const res = await fetch('/api/services');
      if (!res.ok) throw new Error('Failed to fetch services');
      return res.json() as Promise<Record<string, Service[]>>;
    },
  });

  // Fetch professionals
  const { data: professionals, isLoading: professionalsLoading } = useQuery({
    queryKey: ['team'],
    queryFn: async () => {
      const res = await fetch('/api/professionals');
      if (!res.ok) throw new Error('Failed to fetch professionals');
      return res.json() as Promise<Professional[]>;
    },
  });

  const allServices = useMemo(() => {
    if (!servicesGrouped) return [];
    return Object.values(servicesGrouped).flat();
  }, [servicesGrouped]);

  const selectedService = useMemo(() => {
    return allServices.find((s) => s.id === bookingServiceId) || null;
  }, [allServices, bookingServiceId]);

  const selectedProfessional = useMemo(() => {
    if (!professionals) return null;
    return professionals.find((p) => p.id === bookingProfessionalId) || null;
  }, [professionals, bookingProfessionalId]);

  // Simulated available slots (random for demo)
  const availableSlots = useMemo(() => {
    if (!bookingDate) return [];
    const seed = bookingDate.split('-').join('');
    const hash = seed.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return timeSlots.filter((_, i) => (hash + i) % 3 !== 0);
  }, [bookingDate]);

  const canGoNext = useMemo(() => {
    switch (bookingStep) {
      case 0: return !!bookingServiceId;
      case 1: return !!bookingProfessionalId;
      case 2: return !!bookingDate && !!bookingTime;
      case 3: return !!clientName && !!clientPhone;
      default: return false;
    }
  }, [bookingStep, bookingServiceId, bookingProfessionalId, bookingDate, bookingTime, clientName, clientPhone]);

  const handleConfirm = useCallback(async () => {
    if (!selectedService || !selectedProfessional || !bookingDate || !bookingTime) return;
    setIsSubmitting(true);

    try {
      // Create client first (or find existing)
      const clientRes = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: clientName,
          phone: clientPhone,
          email: clientEmail || undefined,
          source: 'Agendamento Online',
        }),
      });

      let clientId;
      if (clientRes.ok) {
        const client = await clientRes.json();
        clientId = client.id;
      } else {
        // Try to find existing client
        const clientsRes = await fetch('/api/clients');
        if (clientsRes.ok) {
          const clients = await clientsRes.json();
          const existing = clients.find((c: any) => c.phone === clientPhone);
          clientId = existing?.id;
        }
      }

      if (!clientId) {
        throw new Error('Could not create/find client');
      }

      // Calculate end time
      const [hours, mins] = bookingTime.split(':').map(Number);
      const endMinutes = hours * 60 + mins + (selectedService.duration || 30);
      const endHours = Math.floor(endMinutes / 60);
      const endMins = endMinutes % 60;
      const endTime = `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;

      // Create appointment
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          professionalId: bookingProfessionalId,
          date: bookingDate,
          startTime: bookingTime,
          endTime,
          serviceIds: [bookingServiceId],
          notes: `Agendamento online - ${clientEmail}`,
        }),
      });

      if (!res.ok) throw new Error('Failed to create appointment');

      setBookingComplete(true);
    } catch (error) {
      console.error('Booking error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedService, selectedProfessional, bookingDate, bookingTime, bookingProfessionalId, bookingServiceId, clientName, clientPhone, clientEmail]);

  if (bookingComplete) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="text-center space-y-4"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <PartyPopper className="h-20 w-20 text-rose-500 mx-auto" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-2xl font-bold text-foreground">Agendamento Confirmado!</h2>
            <p className="text-muted-foreground mt-2 max-w-md">
              Seu horário foi reservado com sucesso. Você receberá uma confirmação em breve.
            </p>
            <div className="mt-6 p-4 bg-rose-50 dark:bg-rose-950/30 rounded-lg inline-block">
              <p className="text-sm">
                <span className="font-medium">{selectedService?.name}</span> com{' '}
                <span className="font-medium">{selectedProfessional?.name}</span>
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {bookingDate && new Date(bookingDate + 'T12:00:00').toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })} às {bookingTime}
              </p>
            </div>
          </motion.div>
          <Button
            className="mt-4 bg-rose-500 hover:bg-rose-600 text-white"
            onClick={() => {
              setBookingComplete(false);
              setBookingStep(0);
              setBookingServiceId(null);
              setBookingProfessionalId(null);
              setBookingDate(null);
              setBookingTime(null);
              setClientName('');
              setClientPhone('');
              setClientEmail('');
            }}
          >
            Novo Agendamento
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Progress Bar */}
      <div className="space-y-3">
        <div className="flex justify-between items-center pt-4">
          {stepLabels.map((label, idx) => {
            const Icon = stepIcons[idx];
            const isActive = idx === bookingStep;
            const isCompleted = idx < bookingStep;
            return (
              <div key={label} className="flex flex-col items-center gap-2 flex-1">
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isCompleted
                      ? 'bg-rose-500 text-white'
                      : isActive
                      ? 'bg-rose-100 text-rose-600 ring-2 ring-rose-500'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <span
                  className={`text-[10px] sm:text-xs font-medium ${
                    isActive ? 'text-rose-600' : isCompleted ? 'text-rose-500' : 'text-muted-foreground'
                  }`}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
        <Progress value={((bookingStep + 1) / 4) * 100} className="h-1.5 bg-rose-100 [&>[data-slot=indicator]]:bg-rose-500 mt-2" />
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={bookingStep}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.2 }}
        >
          {/* Step 1: Select Service */}
          {bookingStep === 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Escolha o Serviço</h2>
              {servicesLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-4">
                        <div className="h-20 bg-muted rounded" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                Object.entries(servicesGrouped || {}).map(([category, services]) => (
                  <div key={category}>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                      {category}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(services as Service[]).map((service) => (
                        <Card
                          key={service.id}
                          className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                            bookingServiceId === service.id
                              ? 'ring-2 ring-rose-500 bg-rose-50/50 dark:bg-rose-950/20 border-rose-300'
                              : 'hover:border-rose-200'
                          }`}
                          onClick={() => setBookingServiceId(service.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="font-semibold text-sm">{service.name}</p>
                                {service.description && (
                                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                    {service.description}
                                  </p>
                                )}
                              </div>
                              {bookingServiceId === service.id && (
                                <Badge className="bg-rose-500 text-white shrink-0 ml-2">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Selecionado
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-3">
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3.5 w-3.5" />
                                {service.duration} min
                              </div>
                              <span className="text-sm font-bold text-rose-600">
                                {formatBRL(service.price)}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Step 2: Select Professional */}
          {bookingStep === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Escolha o Profissional</h2>
              {professionalsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-4">
                        <div className="h-24 bg-muted rounded" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(professionals || []).map((pro) => (
                    <Card
                      key={pro.id}
                      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                        bookingProfessionalId === pro.id
                          ? 'ring-2 ring-rose-500 bg-rose-50/50 dark:bg-rose-950/20 border-rose-300'
                          : 'hover:border-rose-200'
                      }`}
                      onClick={() => setBookingProfessionalId(pro.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                            style={{ backgroundColor: pro.color || '#f43f5e' }}
                          >
                            {pro.name.split(' ').map((n) => n[0]).join('')}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm">{pro.name}</p>
                            <p className="text-xs text-muted-foreground">{pro.specialty || 'Profissional'}</p>
                            {pro.bio && (
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                {pro.bio}
                              </p>
                            )}
                          </div>
                          {bookingProfessionalId === pro.id && (
                            <CheckCircle2 className="h-5 w-5 text-rose-500 shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                          <Badge variant="secondary" className="text-[10px]">
                            <Sparkles className="h-3 w-3 mr-1" />
                            Disponível
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Date/Time Selection */}
          {bookingStep === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Escolha Data e Horário</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="p-4 flex justify-center">
                    <Calendar
                      mode="single"
                      selected={bookingDate ? new Date(bookingDate + 'T12:00:00') : undefined}
                      onSelect={(date) => {
                        if (date) {
                          setBookingDate(date.toISOString().split('T')[0]);
                          setBookingTime(null);
                        }
                      }}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      className="rounded-md"
                      classNames={{
                        day_selected: 'bg-rose-500 text-white hover:bg-rose-600',
                        day_today: 'bg-rose-100 text-rose-700',
                      }}
                    />
                  </CardContent>
                </Card>

                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Horários disponíveis
                  </h3>
                  {bookingDate ? (
                    <div className="grid grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-1">
                      {timeSlots.map((time) => {
                        const isAvailable = availableSlots.includes(time);
                        const isSelected = bookingTime === time;
                        return (
                          <Button
                            key={time}
                            variant={isSelected ? 'default' : 'outline'}
                            size="sm"
                            disabled={!isAvailable}
                            className={`h-9 text-xs ${
                              isSelected
                                ? 'bg-rose-500 hover:bg-rose-600 text-white'
                                : isAvailable
                                ? 'hover:border-rose-300 hover:text-rose-600'
                                : 'opacity-40'
                            }`}
                            onClick={() => setBookingTime(time)}
                          >
                            {time}
                          </Button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
                      Selecione uma data primeiro
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {bookingStep === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Confirme o Agendamento</h2>

              <Card className="border-rose-200 bg-rose-50/30 dark:bg-rose-950/10">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Serviço</span>
                    <span className="text-sm font-medium">{selectedService?.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Profissional</span>
                    <span className="text-sm font-medium">{selectedProfessional?.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Data</span>
                    <span className="text-sm font-medium">
                      {bookingDate && new Date(bookingDate + 'T12:00:00').toLocaleDateString('pt-BR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Horário</span>
                    <span className="text-sm font-medium">{bookingTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Duração</span>
                    <span className="text-sm font-medium">{selectedService?.duration} min</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">Valor</span>
                    <span className="text-lg font-bold text-rose-600">
                      {formatBRL(selectedService?.price || 0)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <h3 className="text-sm font-medium">Seus Dados</h3>
                <div className="space-y-3">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Nome completo"
                      className="pl-9 h-10"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                    />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Telefone (ex: 11 99999-9999)"
                      className="pl-9 h-10"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                    />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="E-mail (opcional)"
                      type="email"
                      className="pl-9 h-10"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation buttons */}
      <div className="flex justify-between pt-2">
        <Button
          variant="outline"
          onClick={() => setBookingStep(Math.max(0, bookingStep - 1))}
          disabled={bookingStep === 0}
          className="gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar
        </Button>

        {bookingStep < 3 ? (
          <Button
            className="bg-rose-500 hover:bg-rose-600 text-white gap-1"
            disabled={!canGoNext}
            onClick={() => setBookingStep(bookingStep + 1)}
          >
            Próximo
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            className="bg-rose-500 hover:bg-rose-600 text-white gap-1"
            disabled={!canGoNext || isSubmitting}
            onClick={handleConfirm}
          >
            {isSubmitting ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Sparkles className="h-4 w-4" />
                </motion.div>
                Confirmando...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Confirmar Agendamento
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
