import { create } from 'zustand';
import { CRMPage } from '@/lib/types';

interface CRMState {
  currentPage: CRMPage;
  sidebarOpen: boolean;
  setPage: (page: CRMPage) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useCRMStore = create<CRMState>((set) => ({
  currentPage: 'dashboard',
  sidebarOpen: true,
  setPage: (page) => set({ currentPage: page }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
