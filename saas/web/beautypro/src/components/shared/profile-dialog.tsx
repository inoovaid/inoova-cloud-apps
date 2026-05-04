'use client'

import { useAuthStore } from '@/store/auth'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { User, Mail, Shield, Calendar, LogOut } from 'lucide-react'

export function ProfileDialog() {
  const { user, showProfileDialog, setShowProfileDialog, logout } = useAuthStore()

  return (
    <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Meu Perfil</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-2">
          {/* Avatar e info principal */}
          <div className="flex flex-col items-center gap-3">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-emerald-600 text-white text-xl font-bold">
                {user?.avatar || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h3 className="text-lg font-semibold">{user?.name}</h3>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
            <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
              Plano Profissional
            </Badge>
          </div>

          <Separator />

          {/* Dados do perfil */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center size-10 rounded-lg bg-muted">
                <User className="size-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">Nome completo</Label>
                <p className="text-sm font-medium">{user?.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center size-10 rounded-lg bg-muted">
                <Mail className="size-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">E-mail</Label>
                <p className="text-sm font-medium">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center size-10 rounded-lg bg-muted">
                <Shield className="size-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">Função</Label>
                <p className="text-sm font-medium">Administrador</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center size-10 rounded-lg bg-muted">
                <Calendar className="size-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground">Membro desde</Label>
                <p className="text-sm font-medium">Maio de 2026</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Token JWT info */}
          <div className="rounded-lg border bg-muted/30 p-3 space-y-1">
            <Label className="text-xs text-muted-foreground">Token JWT (Demo)</Label>
            <p className="text-[10px] font-mono text-muted-foreground break-all leading-relaxed">
              {useAuthStore.getState().token?.substring(0, 60)}...
            </p>
          </div>

          {/* Sair */}
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => {
              logout()
              setShowProfileDialog(false)
            }}
          >
            <LogOut className="mr-2 size-4" />
            Sair da conta
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
