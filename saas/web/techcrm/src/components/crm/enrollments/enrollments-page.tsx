'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  Trash2,
  ClipboardList,
  Users,
  TrendingUp,
  Pencil,
  X,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
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
import { Slider } from '@/components/ui/slider';
import { useDataStore } from '@/stores/data-store';
import { Enrollment } from '@/lib/types';
import { cn } from '@/lib/utils';

// ─── Constants ───────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 10;

const STATUS_CONFIG: Record<Enrollment['status'], { label: string; className: string }> = {
  active: { label: 'Ativa', className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  completed: { label: 'Concluída', className: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20' },
  cancelled: { label: 'Cancelada', className: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

// ─── New Enrollment Form ─────────────────────────────────────────────────────

interface NewEnrollmentFormData {
  studentId: string;
  courseId: string;
  status: Enrollment['status'];
}

const emptyNewForm: NewEnrollmentFormData = {
  studentId: '',
  courseId: '',
  status: 'active',
};

// ─── Edit Progress Form ──────────────────────────────────────────────────────

interface EditProgressFormData {
  progress: number;
  status: Enrollment['status'];
}

// ─── Stats Card ──────────────────────────────────────────────────────────────

function StatCard({
  title,
  value,
  icon: Icon,
  iconClass,
  subtitle,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  iconClass: string;
  subtitle?: string;
}) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-4">
        <div className={cn('flex size-11 shrink-0 items-center justify-center rounded-xl', iconClass)}>
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{title}</p>
          <p className="text-xl font-bold">{value}</p>
          {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Enrollments Page ────────────────────────────────────────────────────────

export function EnrollmentsPage() {
  const { enrollments, students, courses, addEnrollment, updateEnrollment, deleteEnrollment } = useDataStore();

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Pagination
  const [page, setPage] = useState(1);

  // Dialogs
  const [newOpen, setNewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Form state
  const [newForm, setNewForm] = useState<NewEnrollmentFormData>(emptyNewForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditProgressFormData>({ progress: 0, status: 'active' });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form errors
  const [newErrors, setNewErrors] = useState<Partial<Record<keyof NewEnrollmentFormData, string>>>({});

  // ─── Stats ──────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const total = enrollments.length;
    const completed = enrollments.filter((e) => e.status === 'completed').length;
    const active = enrollments.filter((e) => e.status === 'active').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, active, completionRate };
  }, [enrollments]);

  // ─── Filtered data ─────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let result = [...enrollments];

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (e) =>
          e.studentName.toLowerCase().includes(q) || e.courseName.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter((e) => e.status === statusFilter);
    }

    return result;
  }, [enrollments, search, statusFilter]);

  // ─── Pagination ─────────────────────────────────────────────────────────

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handlePageChange = (p: number) => {
    setPage(Math.max(1, Math.min(p, totalPages)));
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };
  const handleStatusFilterChange = (val: string) => {
    setStatusFilter(val);
    setPage(1);
  };

  // ─── New Enrollment ─────────────────────────────────────────────────────

  const openNew = () => {
    setNewForm(emptyNewForm);
    setNewErrors({});
    setNewOpen(true);
  };

  const validateNew = (): boolean => {
    const e: Partial<Record<keyof NewEnrollmentFormData, string>> = {};
    if (!newForm.studentId) e.studentId = 'Selecione um aluno';
    if (!newForm.courseId) e.courseId = 'Selecione um curso';
    setNewErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNewSave = () => {
    if (!validateNew()) return;

    const student = students.find((s) => s.id === newForm.studentId);
    const course = courses.find((c) => c.id === newForm.courseId);
    if (!student || !course) return;

    addEnrollment({
      studentId: student.id,
      studentName: student.name,
      courseId: course.id,
      courseName: course.name,
      progress: 0,
      status: newForm.status,
      enrolledAt: new Date().toISOString(),
    });

    setNewOpen(false);
    setNewForm(emptyNewForm);
  };

  // ─── Edit Progress ──────────────────────────────────────────────────────

  const openEdit = (enrollment: Enrollment) => {
    setEditingId(enrollment.id);
    setEditForm({
      progress: enrollment.progress,
      status: enrollment.status,
    });
    setEditOpen(true);
  };

  const handleProgressChange = (value: number[]) => {
    const newProgress = value[0];
    setEditForm((f) => {
      // Auto-set status to completed if progress reaches 100%
      if (newProgress === 100) {
        return { ...f, progress: newProgress, status: 'completed' };
      }
      return { ...f, progress: newProgress };
    });
  };

  const handleEditSave = () => {
    if (!editingId) return;

    updateEnrollment(editingId, {
      progress: editForm.progress,
      status: editForm.status,
      completedAt: editForm.status === 'completed' ? new Date().toISOString() : undefined,
    });

    setEditOpen(false);
    setEditingId(null);
  };

  // ─── Delete ─────────────────────────────────────────────────────────────

  const openDelete = (id: string) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteEnrollment(deleteId);
    }
    setDeleteOpen(false);
    setDeleteId(null);
  };

  // ─── Progress bar color ─────────────────────────────────────────────────

  const getProgressColor = (progress: number) => {
    if (progress === 100) return 'bg-green-500';
    if (progress >= 60) return 'bg-emerald-500';
    if (progress >= 30) return 'bg-amber-500';
    return 'bg-red-500';
  };

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Matrículas</h1>
          <p className="text-sm text-muted-foreground">
            Controle matrículas, acompanhe status e gerencie turmas.
          </p>
        </div>
        <Button onClick={openNew} className="shrink-0">
          <Plus className="size-4" />
          Nova Matrícula
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total de Matrículas"
          value={stats.total}
          icon={ClipboardList}
          iconClass="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          title="Taxa de Conclusão"
          value={`${stats.completionRate}%`}
          icon={TrendingUp}
          iconClass="bg-amber-500/15 text-amber-600 dark:text-amber-400"
          subtitle={`${stats.completed} concluídas`}
        />
        <StatCard
          title="Em Andamento"
          value={stats.active}
          icon={Users}
          iconClass="bg-violet-500/15 text-violet-600 dark:text-violet-400"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por aluno ou curso..."
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
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="active">Ativa</SelectItem>
            <SelectItem value="completed">Concluída</SelectItem>
            <SelectItem value="cancelled">Cancelada</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">
          {filtered.length} matrícula{filtered.length !== 1 ? 's' : ''} encontrada{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="rounded-lg border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aluno</TableHead>
                  <TableHead>Curso</TableHead>
                  <TableHead className="w-[180px]">Progresso</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Data de Matrícula</TableHead>
                  <TableHead className="hidden md:table-cell">Data de Conclusão</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence mode="popLayout">
                  {paginated.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                        Nenhuma matrícula encontrada.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginated.map((enrollment) => {
                      const statusCfg = STATUS_CONFIG[enrollment.status];
                      return (
                        <motion.tr
                          key={enrollment.id}
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
                                  {getInitials(enrollment.studentName)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium text-sm truncate max-w-[150px]">
                                {enrollment.studentName}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm truncate max-w-[150px] block">
                              {enrollment.courseName}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress
                                value={enrollment.progress}
                                className="h-2 flex-1"
                              />
                              <span className="text-xs font-medium w-9 text-right">
                                {enrollment.progress}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn('text-xs', statusCfg.className)}>
                              {statusCfg.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                            {formatDate(enrollment.enrolledAt)}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                            {enrollment.completedAt ? formatDate(enrollment.completedAt) : '—'}
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
                                <DropdownMenuItem onClick={() => openEdit(enrollment)}>
                                  <Pencil className="size-4 mr-2" />
                                  Editar Progresso
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => openDelete(enrollment.id)}
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

      {/* ─── New Enrollment Dialog ─────────────────────────────────────────── */}

      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Matrícula</DialogTitle>
            <DialogDescription>
              Selecione o aluno e o curso para criar uma nova matrícula.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Aluno</Label>
              <Select
                value={newForm.studentId}
                onValueChange={(v) => setNewForm((f) => ({ ...f, studentId: v }))}
              >
                <SelectTrigger aria-invalid={!!newErrors.studentId}>
                  <SelectValue placeholder="Selecione um aluno" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {students.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {newErrors.studentId && <p className="text-xs text-destructive">{newErrors.studentId}</p>}
            </div>
            <div className="grid gap-2">
              <Label>Curso</Label>
              <Select
                value={newForm.courseId}
                onValueChange={(v) => setNewForm((f) => ({ ...f, courseId: v }))}
              >
                <SelectTrigger aria-invalid={!!newErrors.courseId}>
                  <SelectValue placeholder="Selecione um curso" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {courses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {newErrors.courseId && <p className="text-xs text-destructive">{newErrors.courseId}</p>}
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select
                value={newForm.status}
                onValueChange={(v) => setNewForm((f) => ({ ...f, status: v as Enrollment['status'] }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativa</SelectItem>
                  <SelectItem value="completed">Concluída</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setNewOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleNewSave}>
              Criar Matrícula
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Edit Progress Dialog ──────────────────────────────────────────── */}

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Progresso</DialogTitle>
            <DialogDescription>
              Ajuste o progresso e o status da matrícula.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-2">
            {/* Progress Slider */}
            <div className="grid gap-3">
              <div className="flex items-center justify-between">
                <Label>Progresso</Label>
                <span className="text-sm font-bold tabular-nums">{editForm.progress}%</span>
              </div>
              <Slider
                value={[editForm.progress]}
                onValueChange={handleProgressChange}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Status Select */}
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select
                value={editForm.status}
                onValueChange={(v) => setEditForm((f) => ({ ...f, status: v as Enrollment['status'] }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativa</SelectItem>
                  <SelectItem value="completed">Concluída</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                </SelectContent>
              </Select>
              {editForm.progress === 100 && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                  Progresso em 100% — status alterado automaticamente para Concluída.
                </p>
              )}
            </div>

            {/* Quick progress buttons */}
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-muted-foreground self-center mr-1">Definir:</span>
              {[0, 25, 50, 75, 100].map((val) => (
                <Button
                  key={val}
                  variant={editForm.progress === val ? 'default' : 'outline'}
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => {
                    const newStatus = val === 100 ? 'completed' : editForm.status;
                    setEditForm({ progress: val, status: newStatus });
                  }}
                >
                  {val}%
                </Button>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditSave}>
              Salvar Alterações
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
              Tem certeza que deseja excluir esta matrícula? Esta ação não pode ser desfeita.
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
    </div>
  );
}
