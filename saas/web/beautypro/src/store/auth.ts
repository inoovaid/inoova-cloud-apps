import { create } from 'zustand'

interface AuthState {
  isAuthenticated: boolean
  user: {
    email: string
    name: string
    avatar: string
  } | null
  token: string | null
  showLoginDialog: boolean
  showProfileDialog: boolean
  login: (email: string, password: string) => void
  logout: () => void
  setShowLoginDialog: (show: boolean) => void
  setShowProfileDialog: (show: boolean) => void
}

function extractNameFromEmail(email: string): string {
  const namePart = email.split('@')[0]
  return namePart
    .replace(/[._-]/g, ' ')
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ')
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function generateDemoToken(email: string): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = btoa(
    JSON.stringify({
      sub: email,
      name: extractNameFromEmail(email),
      iat: Date.now(),
      exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    })
  )
  const signature = btoa(`demo-${email}-${Date.now()}`)
  return `${header}.${payload}.${signature}`
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  token: null,
  showLoginDialog: false,
  showProfileDialog: false,

  login: (email: string, _password: string) => {
    const name = extractNameFromEmail(email)
    const token = generateDemoToken(email)

    localStorage.setItem('ff_token', token)
    localStorage.setItem('ff_user', JSON.stringify({ email, name }))

    set({
      isAuthenticated: true,
      user: { email, name, avatar: getInitials(name) },
      token,
      showLoginDialog: false,
    })
  },

  logout: () => {
    localStorage.removeItem('ff_token')
    localStorage.removeItem('ff_user')
    set({ isAuthenticated: false, user: null, token: null })
  },

  setShowLoginDialog: (show) => set({ showLoginDialog: show }),
  setShowProfileDialog: (show) => set({ showProfileDialog: show }),
}))

// Hydrate from localStorage on load
if (typeof window !== 'undefined') {
  const token = localStorage.getItem('ff_token')
  const userData = localStorage.getItem('ff_user')

  if (token && userData) {
    try {
      const user = JSON.parse(userData)
      useAuthStore.setState({
        isAuthenticated: true,
        user: { email: user.email, name: user.name, avatar: getInitials(user.name) },
        token,
      })
    } catch {
      localStorage.removeItem('ff_token')
      localStorage.removeItem('ff_user')
    }
  }
}
