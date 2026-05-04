'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  MoreHorizontal,
  X,
} from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useDataStore } from '@/stores/data-store';
import { Student } from '@/lib/types';
import { cn } from '@/lib/utils';

// ─── Constants ──────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 10;

const STATUS_CONFIG: Record<Student['status'], { label: string; className: string }> = {
  active: { label: 'Ativo', className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  inactive: { label: 'Inativo', className: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20' },
  suspended: { label: 'Suspenso', className: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' },
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(dateStr));
}

type SortField = 'name' | 'email' | 'status' | 'createdAt';
type SortDir = 'asc' | 'desc';

interface StudentFormData {
  name: string;
  email: string;
  phone: string;
  status: Student['status'];
}

const emptyForm: StudentFormData = {
  name: '',
  email: '',
  phone: '',
  status: 'active',
};

// ─── Sort Icon ──────────────────────────────────────────────────────────────

function SortIcon({ field, sortField, sortDir }: { field: SortField; sortField: SortField; sortDir: SortDir }) {
  if (sortField !== field) {
    return <ChevronUp className="size-3.5 opacity-30" />;
  }
  return sortDir === 'asc' ? (
    <ChevronUp className="size-3.5 text-foreground" />
  ) : (
    <ChevronDown className="size-3.5 text-foreground" />
  );
}

// ─── Students Page ──────────────────────────────────────────────────────────

export function StudentsPage() {
  const { students, enrollments, addStudent, updateStudent, deleteStudent } = useDataStore();

  // Search & filter
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Sort
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  // Pagination
  const [page, setPage] = useState(1);

  // Dialogs
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<StudentFormData>(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [profileStudent, setProfileStudent] = useState<Student | null>(null);

  // Form errors
  const [errors, setErrors] = useState<Partial<Record<keyof StudentFormData, string>>>({});

  // ─── Filtered & sorted data ─────────────────────────────────────────────

  const filtered = useMemo(() => {
    let result = [...students];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (s) => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((s) => s.status === statusFilter);
    }

    // Sort
    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'name':
          cmp = a.name.localeCompare(b.name, 'pt-BR');
          break;
        case 'email':
          cmp = a.email.localeCompare(b.email);
          break;
        case 'status':
          cmp = a.status.localeCompare(b.status);
          break;
        case 'createdAt':
          cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [students, search, statusFilter, sortField, sortDir]);

  // ─── Pagination ─────────────────────────────────────────────────────────

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handlePageChange = useCallback((p: number) => {
    setPage(Math.max(1, Math.min(p, totalPages)));
  }, [totalPages]);

  // Reset to page 1 when filters change
  const handleSearchChange = (val: string) => { setSearch(val); setPage(1); };
  const handleStatusFilterChange = (val: string) => { setStatusFilter(val); setPage(1); };

  // ─── Sort ───────────────────────────────────────────────────────────────

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  // ─── Form handlers ──────────────────────────────────────────────────────

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
    setFormOpen(true);
  };

  const openEdit = (student: Student) => {
    setEditingId(student.id);
    setForm({
      name: student.name,
      email: student.email,
      phone: student.phone || '',
      status: student.status,
    });
    setErrors({});
    setFormOpen(true);
  };

  const validate = (): boolean => {
    const e: Partial<Record<keyof StudentFormData, string>> = {};
    if (!form.name.trim()) e.name = 'Nome é obrigatório';
    if (!form.email.trim()) e.email = 'Email é obrigatório';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email inválido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    if (editingId) {
      updateStudent(editingId, {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        status: form.status,
      });
    } else {
      addStudent({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        status: form.status,
      });
    }

    setFormOpen(false);
    setForm(emptyForm);
    setEditingId(null);
  };

  // ─── Delete ─────────────────────────────────────────────────────────────

  const openDelete = (id: string) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteStudent(deleteId);
    }
    setDeleteOpen(false);
    setDeleteId(null);
  };

  // ─── Profile ────────────────────────────────────────────────────────────

  const openProfile = (student: Student) => {
    setProfileStudent(student);
    setProfileOpen(true);
  };

  const studentEnrollments = useMemo(() => {
    if (!profileStudent) return [];
    return enrollments.filter((e) => e.studentId === profileStudent.id);
  }, [profileStudent, enrollments]);

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestão de Alunos</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie seus alunos, acompanhe o progresso e mantenha o engajamento.
          </p>
        </div>
        <Button onClick={openAdd} className="shrink-0">
          <Plus className="size-4" />
          Novo Aluno
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
          {search && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
        <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Filtrar status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="inactive">Inativo</SelectItem>
            <SelectItem value="suspended">Suspenso</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">
          {filtered.length} aluno{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-1">
                    Nome
                    <SortIcon field="name" sortField={sortField} sortDir={sortDir} />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none hidden md:table-cell"
                  onClick={() => handleSort('email')}
                >
                  <div className="flex items-center gap-1">
                    Email
                    <SortIcon field="email" sortField={sortField} sortDir={sortDir} />
                  </div>
                </TableHead>
                <TableHead className="hidden lg:table-cell">Telefone</TableHead>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-1">
                    Status
                    <SortIcon field="status" sortField={sortField} sortDir={sortDir} />
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none hidden sm:table-cell"
                  onClick={() => handleSort('createdAt')}
                >
                  <div className="flex items-center gap-1">
                    Data de Ingresso
                    <SortIcon field="createdAt" sortField={sortField} sortDir={sortDir} />
                  </div>
                </TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence mode="popLayout">
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      Nenhum aluno encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((student) => {
                    const statusCfg = STATUS_CONFIG[student.status];
                    return (
                      <motion.tr
                        key={student.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="hover:bg-muted/50 border-b transition-colors"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="size-8">
                              <AvatarFallback className="text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                {getInitials(student.name)}
                              </AvatarFallback>
                            </Avatar>
                            <button
                              onClick={() => openProfile(student)}
                              className="font-medium text-sm hover:underline underline-offset-2 text-left"
                            >
                              {student.name}
                            </button>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                          {student.email}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                          {student.phone || '—'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn('text-xs', statusCfg.className)}>
                            {statusCfg.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                          {formatDate(student.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="size-8">
                                <span className="sr-only">Ações</span>
                                <MoreHorizontal className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEdit(student)}>
                                <Pencil className="size-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => openDelete(student.id)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="size-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </motion.tr>
                    );
                  })
                )}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} de {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="size-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
              .reduce<(number | string)[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...');
                acc.push(p);
                return acc;
              }, [])
              .map((p, idx) =>
                typeof p === 'string' ? (
                  <span key={`ellipsis-${idx}`} className="px-1 text-xs text-muted-foreground">...</span>
                ) : (
                  <Button
                    key={p}
                    variant={currentPage === p ? 'default' : 'outline'}
                    size="icon"
                    className="size-8 text-xs"
                    onClick={() => handlePageChange(p)}
                  >
                    {p}
                  </Button>
                )
              )}
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ─── Add / Edit Dialog ─────────────────────────────────────────────── */}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Aluno' : 'Novo Aluno'}</DialogTitle>
            <DialogDescription>
              {editingId ? 'Atualize as informações do aluno.' : 'Preencha os dados para cadastrar um novo aluno.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="student-name">Nome</Label>
              <Input
                id="student-name"
                placeholder="Nome completo"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                aria-invalid={!!errors.name}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="student-email">Email</Label>
              <Input
                id="student-email"
                type="email"
                placeholder="email@exemplo.com"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                aria-invalid={!!errors.email}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="student-phone">Telefone</Label>
              <Input
                id="student-phone"
                placeholder="(11) 99999-9999"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v as Student['status'] }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                  <SelectItem value="suspended">Suspenso</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {editingId ? 'Salvar Alterações' : 'Cadastrar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Confirmation ───────────────────────────────────────────── */}

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este aluno? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteId(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-white hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ─── Student Profile Dialog ────────────────────────────────────────── */}

      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="sm:max-w-lg">
          {profileStudent && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <Avatar className="size-10">
                    <AvatarFallback className="text-sm font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      {getInitials(profileStudent.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div>{profileStudent.name}</div>
                    <div className="text-sm font-normal text-muted-foreground">{profileStudent.email}</div>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="grid gap-4 py-2">
                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Telefone</p>
                    <p className="text-sm font-medium">{profileStudent.phone || '—'}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Status</p>
                    <Badge variant="outline" className={cn('text-xs mt-0.5', STATUS_CONFIG[profileStudent.status].className)}>
                      {STATUS_CONFIG[profileStudent.status].label}
                    </Badge>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Data de Ingresso</p>
                    <p className="text-sm font-medium">{formatDate(profileStudent.createdAt)}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Última Atualização</p>
                    <p className="text-sm font-medium">{formatDate(profileStudent.updatedAt)}</p>
                  </div>
                </div>

                {/* Enrollments */}
                {studentEnrollments.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <GraduationCap className="size-4 text-emerald-600" />
                        Matrículas ({studentEnrollments.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="max-h-48 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
                        {studentEnrollments.map((enr) => (
                          <div key={enr.id} className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium truncate max-w-[200px]">{enr.courseName}</p>
                              <span className="text-xs text-muted-foreground">{enr.progress}%</span>
                            </div>
                            <Progress value={enr.progress} className="h-1.5" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {studentEnrollments.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <GraduationCap className="size-8 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground mt-2">Nenhuma matrícula encontrada</p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
