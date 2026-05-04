'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  User,
  Users,
  Shield,
  Bell,
  Mail,
  Plus,
  Trash2,
  Save,
} from 'lucide-react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuthStore } from '@/stores/auth-store';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ─── Constants ───────────────────────────────────────────────────────────────

const ROLE_BADGE_COLORS: Record<string, string> = {
  admin: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  instructor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  student: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20',
};

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  instructor: 'Instrutor',
  student: 'Aluno',
};

// ─── Mock Users ──────────────────────────────────────────────────────────────

interface MockUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
}

const INITIAL_MOCK_USERS: MockUser[] = [
  { id: 'user-1', name: 'Admin Sistema', email: 'admin@techcrm.com', role: 'admin', status: 'active' },
  { id: 'user-2', name: 'Instrutor Front-end', email: 'instrutor1@techcrm.com', role: 'instructor', status: 'active' },
  { id: 'user-3', name: 'Instrutor Back-end', email: 'instrutor2@techcrm.com', role: 'instructor', status: 'active' },
  { id: 'user-4', name: 'Aluno Demo 1', email: 'aluno1@techcrm.com', role: 'student', status: 'active' },
  { id: 'user-5', name: 'Aluno Demo 2', email: 'aluno2@techcrm.com', role: 'student', status: 'inactive' },
];

// ─── Permission Matrix ───────────────────────────────────────────────────────

const FEATURES = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'students', label: 'Alunos' },
  { id: 'courses', label: 'Cursos' },
  { id: 'enrollments', label: 'Matrículas' },
  { id: 'financial', label: 'Financeiro' },
  { id: 'pipeline', label: 'CRM / Pipeline' },
  { id: 'reports', label: 'Relatórios' },
  { id: 'automations', label: 'Automações' },
  { id: 'settings', label: 'Configurações' },
];

const DEFAULT_PERMISSIONS: Record<string, Record<string, boolean>> = {
  admin: Object.fromEntries(FEATURES.map(f => [f.id, true])),
  instructor: Object.fromEntries(FEATURES.map(f => [f.id, ['dashboard', 'students', 'courses', 'enrollments', 'reports'].includes(f.id)])),
  student: Object.fromEntries(FEATURES.map(f => [f.id, ['dashboard'].includes(f.id)])),
};

// ─── Notification Preferences ────────────────────────────────────────────────

interface NotificationPref {
  id: string;
  label: string;
  enabled: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationPref[] = [
  { id: 'new_enrollments', label: 'Novas matrículas', enabled: true },
  { id: 'payments_received', label: 'Pagamentos recebidos', enabled: true },
  { id: 'courses_completed', label: 'Cursos concluídos', enabled: true },
  { id: 'new_leads', label: 'Leads novos', enabled: true },
  { id: 'overdue_payments', label: 'Pagamentos em atraso', enabled: true },
  { id: 'weekly_reports', label: 'Relatórios semanais', enabled: false },
  { id: 'system_updates', label: 'Atualizações do sistema', enabled: false },
];

// ─── Settings Page ───────────────────────────────────────────────────────────

export function SettingsPage() {
  const { user } = useAuthStore();

  // Profile state
  const [profileName, setProfileName] = useState(user?.name || 'Admin Sistema');

  // Users state
  const [mockUsers, setMockUsers] = useState<MockUser[]>(INITIAL_MOCK_USERS);
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('student');

  // Permissions state
  const [permissions, setPermissions] = useState(DEFAULT_PERMISSIONS);

  // Notifications state
  const [notificationPrefs, setNotificationPrefs] = useState(INITIAL_NOTIFICATIONS);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);

  // ─── Profile ─────────────────────────────────────────────────────────

  const userInitials = profileName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleSaveProfile = () => {
    toast.success('Perfil atualizado com sucesso!');
  };

  // ─── Add User ────────────────────────────────────────────────────────

  const handleAddUser = () => {
    if (!newUserName.trim() || !newUserEmail.trim()) {
      toast.error('Preencha todos os campos');
      return;
    }
    const newUser: MockUser = {
      id: `user-${Date.now()}`,
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      role: newUserRole,
      status: 'active',
    };
    setMockUsers(prev => [...prev, newUser]);
    setAddUserOpen(false);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserRole('student');
    toast.success(`Usuário "${newUser.name}" adicionado`);
  };

  const handleDeleteUser = (userId: string) => {
    setMockUsers(prev => prev.filter(u => u.id !== userId));
    toast.success('Usuário removido');
  };

  // ─── Permissions ─────────────────────────────────────────────────────

  const handlePermissionChange = (role: string, featureId: string, checked: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [featureId]: checked,
      },
    }));
  };

  const handleSavePermissions = () => {
    toast.success('Permissões atualizadas com sucesso!');
  };

  // ─── Notifications ───────────────────────────────────────────────────

  const handleToggleNotification = (id: string) => {
    setNotificationPrefs(prev =>
      prev.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p)
    );
  };

  const handleSaveNotifications = () => {
    toast.success('Preferências de notificação salvas!');
  };

  // ─── Render ──────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
        <p className="text-sm text-muted-foreground">
          Personalize o sistema, notificações e preferências da sua conta.
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="flex-wrap">
          <TabsTrigger value="profile">
            <User className="size-4 mr-1.5" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="size-4 mr-1.5" />
            Usuários
          </TabsTrigger>
          <TabsTrigger value="permissions">
            <Shield className="size-4 mr-1.5" />
            Permissões
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="size-4 mr-1.5" />
            Notificações
          </TabsTrigger>
        </TabsList>

        {/* ─── Tab 1: Perfil ──────────────────────────────────────────── */}
        <TabsContent value="profile">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <Card className="max-w-2xl">
              <CardHeader>
                <CardTitle>Informações do Perfil</CardTitle>
                <CardDescription>Gerencie as informações da sua conta.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-5">
                  <Avatar className="size-20 border-2 border-border">
                    <AvatarFallback className="bg-emerald-500/15 text-2xl font-bold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-lg font-semibold">{profileName}</p>
                    <p className="text-sm text-muted-foreground">{user?.email || 'admin@techcrm.com'}</p>
                    <Badge variant="outline" className={cn('mt-1', ROLE_BADGE_COLORS[user?.role || 'admin'])}>
                      {ROLE_LABELS[user?.role || 'admin']}
                    </Badge>
                  </div>
                </div>

                <Separator />

                {/* Form Fields */}
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label>Nome</Label>
                    <Input
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="Seu nome completo"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label>Email</Label>
                    <Input
                      value={user?.email || 'admin@techcrm.com'}
                      readOnly
                      className="bg-muted/50 cursor-not-allowed"
                    />
                    <p className="text-[11px] text-muted-foreground">O email não pode ser alterado.</p>
                  </div>

                  <div className="grid gap-2">
                    <Label>Função</Label>
                    <Input
                      value={ROLE_LABELS[user?.role || 'admin']}
                      readOnly
                      className="bg-muted/50 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveProfile}>
                    <Save className="size-4 mr-2" />
                    Salvar alterações
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ─── Tab 2: Usuários ────────────────────────────────────────── */}
        <TabsContent value="users">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                  <CardTitle>Gerenciamento de Usuários</CardTitle>
                  <CardDescription>Adicione e gerencie os usuários do sistema.</CardDescription>
                </div>
                <Button size="sm" onClick={() => setAddUserOpen(true)}>
                  <Plus className="size-4" />
                  Adicionar Usuário
                </Button>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Função</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockUsers.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="size-8 border border-border">
                                <AvatarFallback className="bg-muted text-xs font-medium">
                                  {u.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium text-sm">{u.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn('text-xs', ROLE_BADGE_COLORS[u.role])}>
                              {ROLE_LABELS[u.role]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn(
                              'text-xs',
                              u.status === 'active'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                : 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20'
                            )}>
                              {u.status === 'active' ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {u.role !== 'admin' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 text-red-600 hover:text-red-700 hover:bg-red-500/10"
                                onClick={() => handleDeleteUser(u.id)}
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Add User Dialog */}
          <Dialog open={addUserOpen} onOpenChange={setAddUserOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Adicionar Usuário</DialogTitle>
                <DialogDescription>
                  Adicione um novo usuário ao sistema.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-2">
                <div className="grid gap-2">
                  <Label>Nome</Label>
                  <Input
                    placeholder="Nome completo"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="email@exemplo.com"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Função</Label>
                  <Select value={newUserRole} onValueChange={setNewUserRole}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="instructor">Instrutor</SelectItem>
                      <SelectItem value="student">Aluno</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddUserOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddUser}>
                  Adicionar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* ─── Tab 3: Permissões ──────────────────────────────────────── */}
        <TabsContent value="permissions">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Matriz de Permissões</CardTitle>
                <CardDescription>Configure as permissões de acesso para cada função.</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[180px]">Funcionalidade</TableHead>
                        <TableHead className="text-center">
                          <div className="flex flex-col items-center gap-1">
                            <Badge variant="outline" className={cn('text-xs', ROLE_BADGE_COLORS.admin)}>
                              Admin
                            </Badge>
                          </div>
                        </TableHead>
                        <TableHead className="text-center">
                          <div className="flex flex-col items-center gap-1">
                            <Badge variant="outline" className={cn('text-xs', ROLE_BADGE_COLORS.instructor)}>
                              Instrutor
                            </Badge>
                          </div>
                        </TableHead>
                        <TableHead className="text-center">
                          <div className="flex flex-col items-center gap-1">
                            <Badge variant="outline" className={cn('text-xs', ROLE_BADGE_COLORS.student)}>
                              Aluno
                            </Badge>
                          </div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {FEATURES.map((feature) => (
                        <TableRow key={feature.id}>
                          <TableCell className="font-medium text-sm">{feature.label}</TableCell>
                          {['admin', 'instructor', 'student'].map((role) => (
                            <TableCell key={role} className="text-center">
                              <div className="flex justify-center">
                                <Checkbox
                                  checked={permissions[role]?.[feature.id] ?? false}
                                  onCheckedChange={(checked) =>
                                    handlePermissionChange(role, feature.id, checked === true)
                                  }
                                  disabled={role === 'admin'}
                                  className={cn(
                                    role === 'admin' && 'opacity-60'
                                  )}
                                />
                              </div>
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex justify-end mt-6">
                  <Button onClick={handleSavePermissions}>
                    <Save className="size-4 mr-2" />
                    Salvar Permissões
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* ─── Tab 4: Notificações ─────────────────────────────────────── */}
        <TabsContent value="notifications">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="max-w-2xl space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle>Tipos de Notificação</CardTitle>
                <CardDescription>Escolha quais eventos devem gerar notificações.</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  {notificationPrefs.map((pref) => (
                    <div key={pref.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Bell className={cn(
                          'size-4',
                          pref.enabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'
                        )} />
                        <Label htmlFor={pref.id} className="text-sm cursor-pointer">
                          {pref.label}
                        </Label>
                      </div>
                      <Switch
                        id={pref.id}
                        checked={pref.enabled}
                        onCheckedChange={() => handleToggleNotification(pref.id)}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Canais de Notificação</CardTitle>
                <CardDescription>Escolha como deseja receber as notificações.</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className={cn(
                        'size-4',
                        emailNotifications ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'
                      )} />
                      <div>
                        <Label htmlFor="email-channel" className="text-sm cursor-pointer">Notificações por Email</Label>
                        <p className="text-[11px] text-muted-foreground">Receba notificações no seu email</p>
                      </div>
                    </div>
                    <Switch
                      id="email-channel"
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Bell className={cn(
                        'size-4',
                        pushNotifications ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'
                      )} />
                      <div>
                        <Label htmlFor="push-channel" className="text-sm cursor-pointer">Notificações Push</Label>
                        <p className="text-[11px] text-muted-foreground">Receba notificações no navegador</p>
                      </div>
                    </div>
                    <Switch
                      id="push-channel"
                      checked={pushNotifications}
                      onCheckedChange={setPushNotifications}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={handleSaveNotifications}>
                <Save className="size-4 mr-2" />
                Salvar Preferências
              </Button>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
