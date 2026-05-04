import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// CRM tabs - removed 'users' as per user request
export type CRMTab = 'dashboard' | 'calendar' | 'clients' | 'team' | 'finance' | 'automations' | 'smart-ai' | 'blog-admin' | 'shopping-admin' | 'sales' | 'settings';

// Alias for backward compatibility
export type Tab = CRMTab;

// Public pages
export type PublicPage = 'landing' | 'about' | 'services' | 'blog' | 'contact' | 'booking' | 'shopping' | 'login';

// App mode
export type AppMode = 'public' | 'crm';

// User profile types
export type UserProfile = 'administrator' | 'employee' | 'finance' | 'client';

// Dashboard card IDs
export type DashboardCardId =
  | 'kpi-revenue' | 'kpi-appointments' | 'kpi-avgTicket' | 'kpi-clients'
  | 'revenue-chart' | 'appointments-today' | 'top-clients'
  | 'low-stock' | 'recent-sales' | 'team-performance'
  | 'smart-suggestions' | 'upcoming-birthdays' | 'automation-status'
  | 'weekly-comparison' | 'client-segments' | 'popular-services';

// Current user info
export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: UserProfile;
  phone?: string;
  avatarInitials?: string;
}

interface AppStore {
  // Mode
  mode: AppMode;
  setMode: (mode: AppMode) => void;

  // CRM
  activeTab: CRMTab;
  setActiveTab: (tab: CRMTab) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  // Public
  publicPage: PublicPage;
  setPublicPage: (page: PublicPage) => void;

  // Selected items
  selectedClientId: string | null;
  setSelectedClientId: (id: string | null) => void;
  selectedProfessionalId: string | null;
  setSelectedProfessionalId: (id: string | null) => void;

  // Auth
  isAuthenticated: boolean;
  currentUser: CurrentUser;
  setCurrentUser: (user: CurrentUser) => void;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;

  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // Dashboard customization
  dashboardCards: DashboardCardId[];
  setDashboardCards: (cards: DashboardCardId[]) => void;

  // Cart
  cart: { productId: string; quantity: number }[];
  addToCart: (productId: string, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;

  // Booking
  bookingStep: number;
  setBookingStep: (step: number) => void;
  bookingServiceId: string | null;
  setBookingServiceId: (id: string | null) => void;
  bookingProfessionalId: string | null;
  setBookingProfessionalId: (id: string | null) => void;
  bookingDate: string | null;
  setBookingDate: (date: string | null) => void;
  bookingTime: string | null;
  setBookingTime: (time: string | null) => void;

  // Dialogs
  clientDialogOpen: boolean;
  setClientDialogOpen: (open: boolean) => void;
  editingClientId: string | null;
  setEditingClientId: (id: string | null) => void;
  professionalDialogOpen: boolean;
  setProfessionalDialogOpen: (open: boolean) => void;
  editingProfessionalId: string | null;
  setEditingProfessionalId: (id: string | null) => void;
  blogPostDialogOpen: boolean;
  setBlogPostDialogOpen: (open: boolean) => void;
  editingBlogPostId: string | null;
  setEditingBlogPostId: (id: string | null) => void;

  // Product dialog
  productDialogOpen: boolean;
  setProductDialogOpen: (open: boolean) => void;
  editingProductId: string | null;
  setEditingProductId: (id: string | null) => void;

  // Appointment dialog
  appointmentDialogOpen: boolean;
  setAppointmentDialogOpen: (open: boolean) => void;
  editingAppointmentId: string | null;
  setEditingAppointmentId: (id: string | null) => void;
}

const defaultDashboardCards: DashboardCardId[] = [
  'kpi-revenue', 'kpi-appointments', 'kpi-avgTicket', 'kpi-clients',
  'revenue-chart', 'appointments-today', 'top-clients',
  'low-stock', 'recent-sales', 'smart-suggestions',
];

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Mode
      mode: 'crm',
      setMode: (mode) => set({ mode }),

      // CRM
      activeTab: 'dashboard',
      setActiveTab: (tab) => set({ activeTab: tab }),
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      // Public
      publicPage: 'landing',
      setPublicPage: (page) => set({ publicPage: page }),

      // Selected items
      selectedClientId: null,
      setSelectedClientId: (id) => set({ selectedClientId: id }),
      selectedProfessionalId: null,
      setSelectedProfessionalId: (id) => set({ selectedProfessionalId: id }),

      // Auth
      isAuthenticated: true,
      currentUser: {
        id: 'user_demo_01',
        name: 'Patrícia Santos',
        email: 'admin@studiobeauty.com.br',
        role: 'administrator' as UserProfile,
        phone: '(11) 99876-5432',
        avatarInitials: 'PS',
      },
      setCurrentUser: (user) => set({ currentUser: user }),
      login: async (email: string, password: string) => {
        if (email && password) {
          try {
            // Try to find user in the database
            const res = await fetch(`/api/users?email=${encodeURIComponent(email)}`);
            if (res.ok) {
              const users = await res.json();
              const user = users.find((u: any) => u.email === email);
              if (user) {
                set({
                  isAuthenticated: true,
                  mode: 'crm',
                  currentUser: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role === 'owner' ? 'administrator' : user.role === 'manager' ? 'finance' : user.role === 'receptionist' ? 'employee' : user.role === 'professional' ? 'employee' : 'client',
                    phone: user.phone,
                    avatarInitials: user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase(),
                  },
                });
                return true;
              }
            }
            // Fallback: any credentials work for demo
            set({
              isAuthenticated: true,
              mode: 'crm',
              currentUser: {
                id: 'user_demo_01',
                name: email.split('@')[0],
                email: email,
                role: 'administrator' as UserProfile,
                avatarInitials: email.substring(0, 2).toUpperCase(),
              },
            });
            return true;
          } catch {
            set({ isAuthenticated: true, mode: 'crm' });
            return true;
          }
        }
        return false;
      },
      logout: () => set({ isAuthenticated: false, mode: 'public', publicPage: 'landing' }),

      // Theme
      theme: 'light',
      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light';
        set({ theme: newTheme });
        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('dark', newTheme === 'dark');
        }
      },

      // Dashboard customization
      dashboardCards: defaultDashboardCards,
      setDashboardCards: (cards) => set({ dashboardCards: cards }),

      // Cart
      cart: [],
      addToCart: (productId, quantity = 1) => {
        const cart = [...get().cart];
        const existing = cart.find((item) => item.productId === productId);
        if (existing) {
          existing.quantity += quantity;
        } else {
          cart.push({ productId, quantity });
        }
        set({ cart });
      },
      removeFromCart: (productId) => {
        set({ cart: get().cart.filter((item) => item.productId !== productId) });
      },
      clearCart: () => set({ cart: [] }),

      // Booking
      bookingStep: 0,
      setBookingStep: (step) => set({ bookingStep: step }),
      bookingServiceId: null,
      setBookingServiceId: (id) => set({ bookingServiceId: id }),
      bookingProfessionalId: null,
      setBookingProfessionalId: (id) => set({ bookingProfessionalId: id }),
      bookingDate: null,
      setBookingDate: (date) => set({ bookingDate: date }),
      bookingTime: null,
      setBookingTime: (time) => set({ bookingTime: time }),

      // Dialogs
      clientDialogOpen: false,
      setClientDialogOpen: (open) => set({ clientDialogOpen: open }),
      editingClientId: null,
      setEditingClientId: (id) => set({ editingClientId: id }),
      professionalDialogOpen: false,
      setProfessionalDialogOpen: (open) => set({ professionalDialogOpen: open }),
      editingProfessionalId: null,
      setEditingProfessionalId: (id) => set({ editingProfessionalId: id }),
      blogPostDialogOpen: false,
      setBlogPostDialogOpen: (open) => set({ blogPostDialogOpen: open }),
      editingBlogPostId: null,
      setEditingBlogPostId: (id) => set({ editingBlogPostId: id }),

      // Product dialog
      productDialogOpen: false,
      setProductDialogOpen: (open) => set({ productDialogOpen: open }),
      editingProductId: null,
      setEditingProductId: (id) => set({ editingProductId: id }),

      // Appointment dialog
      appointmentDialogOpen: false,
      setAppointmentDialogOpen: (open) => set({ appointmentDialogOpen: open }),
      editingAppointmentId: null,
      setEditingAppointmentId: (id) => set({ editingAppointmentId: id }),
    }),
    {
      name: 'beautypro-store',
      partialize: (state) => ({
        theme: state.theme,
        isAuthenticated: state.isAuthenticated,
        mode: state.mode,
        dashboardCards: state.dashboardCards,
        cart: state.cart,
        currentUser: state.currentUser,
      }),
    }
  )
);
