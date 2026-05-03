import { create } from 'zustand'

export type Page =
  | 'dashboard'
  | 'financeiro'
  | 'contas'
  | 'clientes'
  | 'comissoes'
  | 'automacoes'
  | 'relatorios'
  | 'configuracoes'

interface NavigationState {
  currentPage: Page
  setCurrentPage: (page: Page) => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
}

export const useNavigationStore = create<NavigationState>((set) => ({
  currentPage: 'dashboard',
  setCurrentPage: (page) => set({ currentPage: page }),
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}))
