'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Shield,
  Sun,
  Moon,
  Bell,
  BellOff,
  MessageSquare,
  Save,
  Lock,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';

export function SettingsPage() {
  const { theme, toggleTheme, currentUser, setCurrentUser } = useAppStore();

  // Profile from store
  const [profileName, setProfileName] = useState(currentUser.name);
  const [profileEmail, setProfileEmail] = useState(currentUser.email);
  const [profilePhone, setProfilePhone] = useState(currentUser.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Notification preferences
  const [notifications, setNotifications] = useState({
    emailNewBooking: true,
    emailCancellation: true,
    emailReminder: true,
    whatsappNewBooking: true,
    whatsappReminder: true,
    whatsappPromo: false,
    pushNewBooking: true,
    pushCancellation: true,
  });

  const roleLabels: Record<string, string> = {
    administrator: 'Administrador',
    employee: 'Funcionário',
    finance: 'Finanças',
    client: 'Cliente',
  };

  const roleColors: Record<string, string> = {
    administrator: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
    employee: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    finance: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    client: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    await new Promise((r) => setTimeout(r, 800));
    // Update store with new profile data
    setCurrentUser({
      ...currentUser,
      name: profileName,
      email: profileEmail,
      phone: profilePhone,
      avatarInitials: profileName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
    });
    setIsSavingProfile(false);
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('As senhas não conferem');
      return;
    }
    setIsSavingPassword(true);
    await new Promise((r) => setTimeout(r, 800));
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setIsSavingPassword(false);
  };

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Profile Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Meu Perfil
            </CardTitle>
            <CardDescription>Gerencie suas informações pessoais</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                  {currentUser.avatarInitials || profileName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-lg font-semibold">{profileName}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={`text-xs ${roleColors[currentUser.role] || ''}`}>
                    {roleLabels[currentUser.role] || currentUser.role}
                  </Badge>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="settings-name" className="text-sm font-medium">
                    Nome
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="settings-name"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="h-9 pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="settings-email" className="text-sm font-medium">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="settings-email"
                      type="email"
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      className="h-9 pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="settings-phone" className="text-sm font-medium">
                    Telefone
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="settings-phone"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className="h-9 pl-9"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" size="sm" disabled={isSavingProfile}>
                  {isSavingProfile ? (
                    <span className="animate-spin mr-1.5">⏳</span>
                  ) : (
                    <Save className="w-4 h-4 mr-1" />
                  )}
                  Salvar Perfil
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Password Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              Alterar Senha
            </CardTitle>
            <CardDescription>Atualize sua senha de acesso</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSavePassword} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="current-password" className="text-sm font-medium">
                  Senha Atual
                </Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="h-9"
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="new-password" className="text-sm font-medium">
                    Nova Senha
                  </Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="h-9"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirm-password" className="text-sm font-medium">
                    Confirmar Nova Senha
                  </Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-9"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" size="sm" disabled={isSavingPassword}>
                  {isSavingPassword ? (
                    <span className="animate-spin mr-1.5">⏳</span>
                  ) : (
                    <Lock className="w-4 h-4 mr-1" />
                  )}
                  Alterar Senha
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Theme Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              {theme === 'light' ? (
                <Sun className="w-5 h-5 text-amber-500" />
              ) : (
                <Moon className="w-5 h-5 text-slate-300" />
              )}
              Aparência
            </CardTitle>
            <CardDescription>Personalize a aparência do sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                {theme === 'light' ? (
                  <Sun className="w-5 h-5 text-amber-500" />
                ) : (
                  <Moon className="w-5 h-5 text-slate-300" />
                )}
                <div>
                  <p className="text-sm font-medium">
                    {theme === 'light' ? 'Tema Claro' : 'Tema Escuro'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {theme === 'light'
                      ? 'Interface clara e luminosa'
                      : 'Interface escura para reduzir o cansaço visual'}
                  </p>
                </div>
              </div>
              <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Notifications Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Notificações
            </CardTitle>
            <CardDescription>Configure suas preferências de notificação</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Email notifications */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <h4 className="text-sm font-semibold">Email</h4>
              </div>
              <div className="space-y-3 pl-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">Novo agendamento</p>
                    <p className="text-xs text-muted-foreground">Receber email quando um agendamento for criado</p>
                  </div>
                  <Switch
                    checked={notifications.emailNewBooking}
                    onCheckedChange={() => toggleNotification('emailNewBooking')}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">Cancelamento</p>
                    <p className="text-xs text-muted-foreground">Receber email quando um agendamento for cancelado</p>
                  </div>
                  <Switch
                    checked={notifications.emailCancellation}
                    onCheckedChange={() => toggleNotification('emailCancellation')}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">Lembrete diário</p>
                    <p className="text-xs text-muted-foreground">Resumo diário dos agendamentos</p>
                  </div>
                  <Switch
                    checked={notifications.emailReminder}
                    onCheckedChange={() => toggleNotification('emailReminder')}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* WhatsApp notifications */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-4 h-4 text-emerald-500" />
                <h4 className="text-sm font-semibold">WhatsApp</h4>
              </div>
              <div className="space-y-3 pl-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">Novo agendamento</p>
                    <p className="text-xs text-muted-foreground">Notificação via WhatsApp para novos agendamentos</p>
                  </div>
                  <Switch
                    checked={notifications.whatsappNewBooking}
                    onCheckedChange={() => toggleNotification('whatsappNewBooking')}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">Lembrete de agendamento</p>
                    <p className="text-xs text-muted-foreground">Lembrete automático antes do horário</p>
                  </div>
                  <Switch
                    checked={notifications.whatsappReminder}
                    onCheckedChange={() => toggleNotification('whatsappReminder')}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">Promoções e marketing</p>
                    <p className="text-xs text-muted-foreground">Campanhas promocionais para clientes</p>
                  </div>
                  <Switch
                    checked={notifications.whatsappPromo}
                    onCheckedChange={() => toggleNotification('whatsappPromo')}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Push notifications */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Bell className="w-4 h-4 text-sky-500" />
                <h4 className="text-sm font-semibold">Push</h4>
              </div>
              <div className="space-y-3 pl-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">Novo agendamento</p>
                    <p className="text-xs text-muted-foreground">Notificação push instantânea</p>
                  </div>
                  <Switch
                    checked={notifications.pushNewBooking}
                    onCheckedChange={() => toggleNotification('pushNewBooking')}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">Cancelamento</p>
                    <p className="text-xs text-muted-foreground">Alerta de cancelamento em tempo real</p>
                  </div>
                  <Switch
                    checked={notifications.pushCancellation}
                    onCheckedChange={() => toggleNotification('pushCancellation')}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
