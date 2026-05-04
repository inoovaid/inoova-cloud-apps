'use client';

import { useQuery } from '@tanstack/react-query';

// ---- Types ----
export interface DashboardData {
  todayRevenue: number;
  todayAppointments: number;
  avgTicket: number;
  activeClientsCount: number;
  appointmentsByStatus: Record<string, number>;
  revenueChart: { date: string; revenue: number }[];
  topClients: any[];
  upcomingAppointments: any[];
  lowStockProducts: any[];
  recentSales: any[];
  teamPerformance: { name: string; color: string; count: number }[];
  popularServices: { name: string; category: string; count: number }[];
  clientSegments: { name: string; color: string; count: number }[];
  upcomingBirthdays: { id: string; name: string; phone: string; birthday: string; day: number }[];
  smartSuggestions: any[];
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
}

export interface AppointmentToday {
  id: string;
  startTime: string;
  endTime: string;
  clientName: string;
  services: string[];
  professionalName: string;
  professionalColor: string;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
}

export interface TopClient {
  id: string;
  rank: number;
  name: string;
  totalSpent: number;
  visitCount: number;
  tags: { name: string; color: string }[];
}

export interface CalendarAppointment {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  clientName: string;
  services: string[];
  professionalName: string;
  professionalColor: string;
  status: string;
}

export interface ClientRow {
  id: string;
  name: string;
  phone: string;
  email: string;
  totalSpent: number;
  totalVisits: number;
  avgTicket: number;
  lastVisitAt: string;
  tags: { id: string; tag: { name: string; color: string } }[];
  source: string;
  loyaltyPoints: number;
  notes: string;
  createdAt: string;
}

export interface ProfessionalCard {
  id: string;
  name: string;
  email: string;
  specialty: string;
  color: string;
  isActive: boolean;
  todayAppointments: number;
  monthRevenue: number;
  commissionType: string;
  commissionPercent: number;
}

export interface SaleRow {
  id: string;
  date: string;
  clientName: string;
  professionalName: string;
  items: string;
  total: number;
  paymentMethod: string;
  status: string;
}

export interface AutomationCard {
  id: string;
  name: string;
  type: string;
  channel: string;
  isActive: boolean;
  triggerRule: string;
  template: string;
  lastRunAt: string;
  recentExecutions: number;
}

export interface SmartSuggestion {
  id: string;
  type: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  description: string;
  action: string;
  clientId: string | null;
  clientName: string | null;
  isRead: boolean;
  isResolved: boolean;
}

// ---- React Query Hooks (Real API) ----

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard');
      if (!res.ok) throw new Error('Failed to fetch dashboard');
      return res.json() as Promise<DashboardData>;
    },
    staleTime: 60 * 1000,
  });
}

export function useKPIData() {
  const { data, ...rest } = useDashboard();
  return {
    data: data ? {
      revenue: data.todayRevenue,
      revenueChange: 12.5,
      appointments: data.todayAppointments,
      appointmentsChange: 8.3,
      avgTicket: data.avgTicket,
      avgTicketChange: -2.1,
      activeClients: data.activeClientsCount,
      activeClientsChange: 5.7,
    } : undefined,
    ...rest,
  };
}

export function useRevenueData() {
  const { data, ...rest } = useDashboard();
  return {
    data: data?.revenueChart || [],
    ...rest,
  };
}

export function useAppointmentsToday() {
  const { data, ...rest } = useDashboard();
  return {
    data: data?.upcomingAppointments?.map((a: any) => ({
      id: a.id,
      startTime: a.startTime,
      endTime: a.endTime,
      clientName: a.client?.name || 'N/A',
      services: a.services?.map((s: any) => s.service?.name || s.name || 'Serviço') || [],
      professionalName: a.professional?.name || 'N/A',
      professionalColor: a.professional?.color || '#888',
      status: a.status,
    })) || [],
    ...rest,
  };
}

export function useTopClients() {
  const { data, ...rest } = useDashboard();
  return {
    data: data?.topClients?.map((c: any, i: number) => ({
      id: c.id,
      rank: i + 1,
      name: c.name,
      totalSpent: c.totalSpent,
      visitCount: c.totalVisits,
      tags: c.tags?.map((t: any) => ({ name: t.tag?.name || t.name, color: t.tag?.color || t.color || '#888' })) || [],
    })) || [],
    ...rest,
  };
}

export function useCalendarData() {
  return useQuery({
    queryKey: ['calendar'],
    queryFn: async () => {
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 30);
      const endDate = new Date(today);
      endDate.setDate(today.getDate() + 90);

      const res = await fetch(`/api/appointments?startDate=${startDate.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}`);
      if (!res.ok) throw new Error('Failed to fetch calendar');
      const appointments = await res.json();
      return appointments.map((a: any) => ({
        id: a.id,
        date: new Date(a.date).toISOString().split('T')[0],
        startTime: a.startTime,
        endTime: a.endTime,
        clientName: a.client?.name || 'N/A',
        services: a.services?.map((s: any) => s.service?.name || 'Serviço') || [],
        professionalName: a.professional?.name || 'N/A',
        professionalColor: a.professional?.color || '#888',
        status: a.status,
      })) as CalendarAppointment[];
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useClients() {
  return useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const res = await fetch('/api/clients');
      if (!res.ok) throw new Error('Failed to fetch clients');
      return res.json() as Promise<ClientRow[]>;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useClientDetail(clientId: string | null) {
  return useQuery({
    queryKey: ['clients', clientId],
    queryFn: async () => {
      if (!clientId) return null;
      const res = await fetch('/api/clients');
      if (!res.ok) throw new Error('Failed to fetch client');
      const clients = await res.json();
      return clients.find((c: any) => c.id === clientId) || null;
    },
    enabled: !!clientId,
  });
}

export function useProfessionals() {
  return useQuery({
    queryKey: ['team'],
    queryFn: async () => {
      const res = await fetch('/api/professionals');
      if (!res.ok) throw new Error('Failed to fetch professionals');
      const data = await res.json();
      return data.map((p: any) => ({
        id: p.id,
        name: p.name,
        email: p.email || '',
        specialty: p.specialty || '',
        color: p.color || '#888',
        isActive: p.isActive,
        todayAppointments: p._count?.appointments || 0,
        monthRevenue: 0,
        commissionType: 'service',
        commissionPercent: 50,
      })) as ProfessionalCard[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useSales() {
  return useQuery({
    queryKey: ['finance', 'sales'],
    queryFn: async () => {
      const res = await fetch('/api/sales');
      if (!res.ok) throw new Error('Failed to fetch sales');
      const data = await res.json();
      return (Array.isArray(data) ? data : []).map((s: any) => ({
        id: s.id,
        date: s.createdAt,
        clientName: s.client?.name || 'N/A',
        professionalName: s.professional?.name || 'N/A',
        items: s.items?.map((i: any) => i.name).join(', ') || 'Venda',
        total: s.total,
        paymentMethod: s.paymentMethod,
        status: s.status,
      })) as SaleRow[];
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useAutomations() {
  return useQuery({
    queryKey: ['automations'],
    queryFn: async () => {
      const res = await fetch('/api/automations');
      if (!res.ok) throw new Error('Failed to fetch automations');
      const data = await res.json();
      return (Array.isArray(data) ? data : []).map((a: any) => ({
        id: a.id,
        name: a.name,
        type: a.type,
        channel: a.channel,
        isActive: a.isActive,
        triggerRule: a.triggerRule || '',
        template: a.template || '',
        lastRunAt: a.lastRunAt || '',
        recentExecutions: a.logs?.length || 0,
      })) as AutomationCard[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useSmartSuggestions() {
  return useQuery({
    queryKey: ['smart-ai', 'suggestions'],
    queryFn: async () => {
      const res = await fetch('/api/smart-ai');
      if (!res.ok) throw new Error('Failed to fetch suggestions');
      const data = await res.json();
      return (data.suggestions || []).map((s: any) => ({
        id: s.id,
        type: s.type,
        priority: s.priority,
        title: s.title,
        description: s.description,
        action: s.action || '',
        clientId: s.clientId,
        clientName: null,
        isRead: s.isRead || false,
        isResolved: s.isResolved || false,
      })) as SmartSuggestion[];
    },
    staleTime: 2 * 60 * 1000,
  });
}

// ---- Products, Services, Blog & Testimonials Hooks ----

export interface ServiceItem {
  id: string;
  name: string;
  category: string | null;
  duration: number;
  price: number;
  cost: number;
  description: string | null;
  isActive: boolean;
}

export function useServices() {
  return useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const res = await fetch('/api/services');
      if (!res.ok) throw new Error('Failed to fetch services');
      const grouped = await res.json() as Record<string, ServiceItem[]>;
      // Flatten grouped response into a single array
      return Object.values(grouped).flat();
    },
    staleTime: 5 * 60 * 1000,
  });
}

export interface ProductItem {
  id: string;
  name: string;
  brand: string | null;
  category: string | null;
  sku: string | null;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  isActive: boolean;
}

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Failed to fetch products');
      return res.json() as ProductItem[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useBlogPosts(all = false) {
  return useQuery({
    queryKey: ['blog', all ? 'all' : 'published'],
    queryFn: async () => {
      const res = await fetch(`/api/blog${all ? '?all=true' : ''}`);
      if (!res.ok) throw new Error('Failed to fetch blog posts');
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useTestimonials() {
  return useQuery({
    queryKey: ['testimonials'],
    queryFn: async () => {
      const res = await fetch('/api/testimonials');
      if (!res.ok) throw new Error('Failed to fetch testimonials');
      return res.json();
    },
    staleTime: 10 * 60 * 1000,
  });
}

// ---- Users Hooks ----

export interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
}

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      return data as UserRow[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

// ---- Financial Records Hooks ----

export interface FinancialRecordRow {
  id: string;
  type: string;
  category: string;
  description: string;
  amount: number;
  dueDate: string;
  paidAt: string | null;
  status: string;
  accountPlan: string | null;
  notes: string | null;
  createdAt: string;
}

export interface FinancialSummary {
  overdue: number;
  overdueCount: number;
  dueToday: number;
  dueTodayCount: number;
  dueTomorrow: number;
  dueTomorrowCount: number;
  received: number;
  receivedCount: number;
  total: number;
  totalCount: number;
  allPending: number;
  allPendingCount: number;
}

export interface FinancialData {
  records: FinancialRecordRow[];
  summary: FinancialSummary;
  monthlyData: Record<string, { receitas: number; despesas: number; saldo: number }>;
  accountPlans: string[];
}

export function useFinancial(params?: { type?: string; status?: string; startDate?: string; endDate?: string; accountPlan?: string }) {
  const searchParams = new URLSearchParams();
  if (params?.type) searchParams.set('type', params.type);
  if (params?.status) searchParams.set('status', params.status);
  if (params?.startDate) searchParams.set('startDate', params.startDate);
  if (params?.endDate) searchParams.set('endDate', params.endDate);
  if (params?.accountPlan) searchParams.set('accountPlan', params.accountPlan);

  const qs = searchParams.toString();
  return useQuery({
    queryKey: ['financial', params],
    queryFn: async () => {
      const res = await fetch(`/api/financial${qs ? `?${qs}` : ''}`);
      if (!res.ok) throw new Error('Failed to fetch financial data');
      return res.json() as Promise<FinancialData>;
    },
    staleTime: 2 * 60 * 1000,
  });
}

// ---- Utility Functions ----

export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDateBR(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function formatDateTimeBR(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    scheduled: 'Agendado',
    confirmed: 'Confirmado',
    in_progress: 'Em Andamento',
    completed: 'Concluído',
    cancelled: 'Cancelado',
    no_show: 'Não Compareceu',
    refunded: 'Reembolsado',
    partial_refund: 'Reembolso Parcial',
  };
  return map[status] || status;
}

export function statusColor(status: string): string {
  const map: Record<string, string> = {
    completed: 'bg-emerald-100 text-emerald-800',
    in_progress: 'bg-amber-100 text-amber-800',
    confirmed: 'bg-sky-100 text-sky-800',
    scheduled: 'bg-slate-100 text-slate-700',
    cancelled: 'bg-red-100 text-red-800',
    no_show: 'bg-orange-100 text-orange-800',
    refunded: 'bg-purple-100 text-purple-800',
    partial_refund: 'bg-amber-100 text-amber-800',
  };
  return map[status] || 'bg-gray-100 text-gray-800';
}

export function paymentMethodLabel(method: string): string {
  const map: Record<string, string> = {
    cash: 'Dinheiro',
    credit: 'Cartão Crédito',
    debit: 'Cartão Débito',
    pix: 'Pix',
  };
  return map[method] || method;
}
