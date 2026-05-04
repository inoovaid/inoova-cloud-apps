import { create } from 'zustand';
import { User } from '@/lib/types';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  view: 'landing' | 'login' | 'register' | 'crm' | 'sobre' | 'blog' | 'contato';
  registeredUser: { name: string; email: string; password: string } | null;
  login: (name: string, email: string) => void;
  register: (name: string, email: string, password: string) => void;
  logout: () => void;
  setView: (view: AuthState['view']) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  view: 'landing',
  registeredUser: null,

  login: (name: string, email: string) => {
    set({
      isAuthenticated: true,
      user: {
        id: 'user-1',
        name,
        email,
        role: 'admin',
        avatar: undefined,
        createdAt: new Date().toISOString(),
      },
      view: 'crm',
    });
  },

  register: (name: string, email: string, password: string) => {
    set({
      registeredUser: { name, email, password },
      view: 'login',
    });
  },

  logout: () => {
    set({ isAuthenticated: false, user: null, view: 'landing' });
  },

  setView: (view) => set({ view }),
}));
