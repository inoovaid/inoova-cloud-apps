'use client'

import { useState } from 'react'
import { useAuthStore } from '@/store/auth'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { TrendingUp, Eye, EyeOff } from 'lucide-react'

export function LoginDialog() {
  const { showLoginDialog, setShowLoginDialog, login } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Informe seu e-mail')
      return
    }
    if (!email.includes('@')) {
      setError('E-mail inválido')
      return
    }
    if (!password.trim()) {
      setError('Informe sua senha')
      return
    }

    setLoading(true)
    // Simula delay de autenticação
    await new Promise((resolve) => setTimeout(resolve, 800))
    login(email, password)
    setLoading(false)
  }

  return (
    <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-2">
            <div className="flex items-center justify-center size-12 rounded-xl bg-emerald-600 text-white">
              <TrendingUp className="size-6" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold">Entrar no FinanceFlow</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Modo demonstração — qualquer e-mail e senha funcionam
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setError('')
              }}
              className="h-11"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Digite qualquer senha"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError('')
                }}
                className="h-11 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive font-medium">{error}</p>
          )}

          <Button type="submit" className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold" disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Entrando...
              </span>
            ) : (
              'Entrar'
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Dica: Use <strong>carlos@financeflow.com</strong> para uma experiência completa
          </p>
        </form>
      </DialogContent>
    </Dialog>
  )
}
