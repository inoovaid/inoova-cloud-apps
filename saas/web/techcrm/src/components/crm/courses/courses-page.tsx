'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Monitor,
  Server,
  Shield,
  Cloud,
  Database,
  Brain,
  Play,
  FileText,
  FileDown,
  HelpCircle,
  Clock,
  Tag,
  BookOpen,
  ChevronDown,
  ChevronRight,
  X,
  LayoutGrid,
} from 'lucide-react';
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useDataStore } from '@/stores/data-store';
import { Course, Module, Lesson } from '@/lib/types';
import { cn } from '@/lib/utils';

// ─── Constants & Mappings ────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<
  Course['category'],
  { label: string; icon: React.ElementType; bgClass: string; textClass: string; iconBgClass: string }
> = {
  frontend: {
    label: 'Front-end',
    icon: Monitor,
    bgClass: 'bg-violet-500/10',
    textClass: 'text-violet-600 dark:text-violet-400',
    iconBgClass: 'bg-violet-500/15',
  },
  backend: {
    label: 'Back-end',
    icon: Server,
    bgClass: 'bg-emerald-500/10',
    textClass: 'text-emerald-600 dark:text-emerald-400',
    iconBgClass: 'bg-emerald-500/15',
  },
  qa: {
    label: 'QA',
    icon: Shield,
    bgClass: 'bg-amber-500/10',
    textClass: 'text-amber-600 dark:text-amber-400',
    iconBgClass: 'bg-amber-500/15',
  },
  devops: {
    label: 'DevOps',
    icon: Cloud,
    bgClass: 'bg-cyan-500/10',
    textClass: 'text-cyan-600 dark:text-cyan-400',
    iconBgClass: 'bg-cyan-500/15',
  },
  data: {
    label: 'Dados',
    icon: Database,
    bgClass: 'bg-rose-500/10',
    textClass: 'text-rose-600 dark:text-rose-400',
    iconBgClass: 'bg-rose-500/15',
  },
  ia: {
    label: 'IA',
    icon: Brain,
    bgClass: 'bg-purple-500/10',
    textClass: 'text-purple-600 dark:text-purple-400',
    iconBgClass: 'bg-purple-500/15',
  },
};

const LEVEL_CONFIG: Record<Course['level'], { label: string; className: string }> = {
  beginner: { label: 'Iniciante', className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  intermediate: { label: 'Intermediário', className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
  advanced: { label: 'Avançado', className: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' },
};

const STATUS_CONFIG: Record<Course['status'], { label: string; className: string }> = {
  published: { label: 'Publicado', className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  draft: { label: 'Rascunho', className: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20' },
  archived: { label: 'Arquivado', className: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' },
};

const LESSON_TYPE_CONFIG: Record<Lesson['type'], { icon: React.ElementType; label: string }> = {
  video: { icon: Play, label: 'Vídeo' },
  text: { icon: FileText, label: 'Texto' },
  pdf: { icon: FileDown, label: 'PDF' },
  quiz: { icon: HelpCircle, label: 'Quiz' },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function getLessonCount(modules: Module[]): number {
  return modules.reduce((acc, m) => acc + m.lessons.length, 0);
}

// ─── Form Data ───────────────────────────────────────────────────────────────

interface CourseFormData {
  name: string;
  description: string;
  category: Course['category'];
  level: Course['level'];
  duration: number;
  price: number;
  status: Course['status'];
}

const emptyForm: CourseFormData = {
  name: '',
  description: '',
  category: 'frontend',
  level: 'beginner',
  duration: 0,
  price: 0,
  status: 'draft',
};

// ─── Course Card ─────────────────────────────────────────────────────────────

function CourseCard({
  course,
  onEdit,
  onDelete,
  onView,
}: {
  course: Course;
  onEdit: (course: Course) => void;
  onDelete: (id: string) => void;
  onView: (course: Course) => void;
}) {
  const catCfg = CATEGORY_CONFIG[course.category];
  const lvlCfg = LEVEL_CONFIG[course.level];
  const stsCfg = STATUS_CONFIG[course.status];
  const CatIcon = catCfg.icon;
  const moduleCount = course.modules.length;
  const lessonCount = getLessonCount(course.modules);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
    >
      <Card className="group overflow-hidden border transition-shadow hover:shadow-md">
        <CardContent className="p-0">
          {/* Top colored bar + icon */}
          <div className={cn('flex items-center gap-3 px-4 pt-4 pb-3', catCfg.bgClass)}>
            <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-xl', catCfg.iconBgClass)}>
              <CatIcon className={cn('size-5', catCfg.textClass)} />
            </div>
            <div className="min-w-0 flex-1">
              <h3
                className="font-semibold text-sm leading-snug truncate cursor-pointer hover:underline underline-offset-2"
                onClick={() => onView(course)}
              >
                {course.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0 h-5', lvlCfg.className)}>
                  {lvlCfg.label}
                </Badge>
                <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0 h-5', stsCfg.className)}>
                  {stsCfg.label}
                </Badge>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="px-4 pt-3 pb-2">
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {course.description}
            </p>
          </div>

          <Separator className="mx-4" />

          {/* Meta info */}
          <div className="grid grid-cols-3 gap-2 px-4 py-3">
            <div className="flex items-center gap-1.5">
              <Clock className="size-3.5 text-muted-foreground" />
              <span className="text-xs font-medium">{course.duration}h</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Tag className="size-3.5 text-muted-foreground" />
              <span className="text-xs font-medium">{formatBRL(course.price)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <BookOpen className="size-3.5 text-muted-foreground" />
              <span className="text-xs font-medium">{moduleCount} mod</span>
            </div>
          </div>

          <div className="px-4 pb-3">
            <p className="text-[11px] text-muted-foreground">
              {moduleCount} módulo{moduleCount !== 1 ? 's' : ''} &middot; {lessonCount} aula{lessonCount !== 1 ? 's' : ''}
            </p>
          </div>

          <Separator className="mx-4" />

          {/* Actions */}
          <div className="flex items-center gap-2 px-4 py-3">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={() => onView(course)}
            >
              <BookOpen className="size-3.5" />
              Detalhes
            </Button>
            <div className="flex-1" />
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={() => onEdit(course)}
            >
              <Pencil className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 text-red-500 hover:text-red-600"
              onClick={() => onDelete(course.id)}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Course Detail Dialog ────────────────────────────────────────────────────

function CourseDetailDialog({
  course,
  open,
  onOpenChange,
}: {
  course: Course | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!course) return null;

  const catCfg = CATEGORY_CONFIG[course.category];
  const lvlCfg = LEVEL_CONFIG[course.level];
  const stsCfg = STATUS_CONFIG[course.status];
  const CatIcon = catCfg.icon;
  const moduleCount = course.modules.length;
  const lessonCount = getLessonCount(course.modules);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-xl', catCfg.iconBgClass)}>
              <CatIcon className={cn('size-5', catCfg.textClass)} />
            </div>
            <div className="min-w-0">
              <div className="truncate">{course.name}</div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0 h-5', lvlCfg.className)}>
                  {lvlCfg.label}
                </Badge>
                <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0 h-5', stsCfg.className)}>
                  {stsCfg.label}
                </Badge>
              </div>
            </div>
          </DialogTitle>
          <DialogDescription className="sr-only">
            Detalhes do curso {course.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed">{course.description}</p>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-3">
            <div className="rounded-lg border p-3 text-center">
              <p className="text-lg font-bold">{course.duration}h</p>
              <p className="text-[11px] text-muted-foreground">Duração</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <p className="text-lg font-bold">{formatBRL(course.price)}</p>
              <p className="text-[11px] text-muted-foreground">Preço</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <p className="text-lg font-bold">{moduleCount}</p>
              <p className="text-[11px] text-muted-foreground">Módulos</p>
            </div>
            <div className="rounded-lg border p-3 text-center">
              <p className="text-lg font-bold">{lessonCount}</p>
              <p className="text-[11px] text-muted-foreground">Aulas</p>
            </div>
          </div>

          <Separator />

          {/* Modules & Lessons */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <BookOpen className="size-4 text-emerald-600" />
              Conteúdo do Curso
            </h3>
            {course.modules.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <BookOpen className="size-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground mt-2">Nenhum módulo cadastrado</p>
              </div>
            ) : (
              <Accordion type="multiple" className="w-full">
                {course.modules
                  .sort((a, b) => a.order - b.order)
                  .map((mod) => (
                    <AccordionItem key={mod.id} value={mod.id}>
                      <AccordionTrigger className="text-sm hover:no-underline py-2.5">
                        <div className="flex items-center gap-2 text-left">
                          <ChevronRight className="size-3.5 text-muted-foreground" />
                          <span className="font-medium">{mod.name}</span>
                          <Badge variant="secondary" className="text-[10px] px-1.5 h-4">
                            {mod.lessons.length} aula{mod.lessons.length !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-1 pl-5 pb-1">
                          {mod.lessons
                            .sort((a, b) => a.order - b.order)
                            .map((lesson) => {
                              const lessonCfg = LESSON_TYPE_CONFIG[lesson.type];
                              const LessonIcon = lessonCfg.icon;
                              return (
                                <div
                                  key={lesson.id}
                                  className="flex items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-muted/50 transition-colors"
                                >
                                  <LessonIcon className="size-3.5 text-muted-foreground shrink-0" />
                                  <span className="text-xs flex-1 truncate">{lesson.name}</span>
                                  <span className="text-[10px] text-muted-foreground shrink-0">
                                    {lesson.duration}min
                                  </span>
                                  <Badge
                                    variant="outline"
                                    className="text-[9px] px-1 py-0 h-4 shrink-0"
                                  >
                                    {lessonCfg.label}
                                  </Badge>
                                </div>
                              );
                            })}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
              </Accordion>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Courses Page ───────────────────────────────────────────────────────

export function CoursesPage() {
  const { courses, addCourse, updateCourse, deleteCourse } = useDataStore();

  // Search & filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');

  // Dialogs
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  // Form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CourseFormData>(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [detailCourse, setDetailCourse] = useState<Course | null>(null);

  // Form errors
  const [errors, setErrors] = useState<Partial<Record<keyof CourseFormData, string>>>({});

  // ─── Filtered data ─────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let result = [...courses];

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
      );
    }

    if (categoryFilter !== 'all') {
      result = result.filter((c) => c.category === categoryFilter);
    }

    if (levelFilter !== 'all') {
      result = result.filter((c) => c.level === levelFilter);
    }

    return result;
  }, [courses, search, categoryFilter, levelFilter]);

  // ─── Form handlers ──────────────────────────────────────────────────────

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setErrors({});
    setFormOpen(true);
  };

  const openEdit = (course: Course) => {
    setEditingId(course.id);
    setForm({
      name: course.name,
      description: course.description,
      category: course.category,
      level: course.level,
      duration: course.duration,
      price: course.price,
      status: course.status,
    });
    setErrors({});
    setFormOpen(true);
  };

  const validate = (): boolean => {
    const e: Partial<Record<keyof CourseFormData, string>> = {};
    if (!form.name.trim()) e.name = 'Nome é obrigatório';
    if (!form.description.trim()) e.description = 'Descrição é obrigatória';
    if (form.duration <= 0) e.duration = 'Duração deve ser maior que zero';
    if (form.price < 0) e.price = 'Preço não pode ser negativo';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    if (editingId) {
      updateCourse(editingId, {
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.category,
        level: form.level,
        duration: form.duration,
        price: form.price,
        status: form.status,
      });
    } else {
      addCourse({
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.category,
        level: form.level,
        duration: form.duration,
        price: form.price,
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
      deleteCourse(deleteId);
    }
    setDeleteOpen(false);
    setDeleteId(null);
  };

  // ─── Detail ─────────────────────────────────────────────────────────────

  const openDetail = (course: Course) => {
    setDetailCourse(course);
    setDetailOpen(true);
  };

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestão de Cursos</h1>
          <p className="text-sm text-muted-foreground">
            Administre seus cursos, módulos e conteúdos de forma eficiente.
          </p>
        </div>
        <Button onClick={openAdd} className="shrink-0">
          <Plus className="size-4" />
          Novo Curso
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar cursos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="frontend">Front-end</SelectItem>
            <SelectItem value="backend">Back-end</SelectItem>
            <SelectItem value="qa">QA</SelectItem>
            <SelectItem value="devops">DevOps</SelectItem>
            <SelectItem value="data">Dados</SelectItem>
            <SelectItem value="ia">IA</SelectItem>
          </SelectContent>
        </Select>
        <Select value={levelFilter} onValueChange={setLevelFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Nível" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="beginner">Iniciante</SelectItem>
            <SelectItem value="intermediate">Intermediário</SelectItem>
            <SelectItem value="advanced">Avançado</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">
          {filtered.length} curso{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Course Cards Grid */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-emerald-500/10">
              <LayoutGrid className="size-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold mt-4">Nenhum curso encontrado</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Tente ajustar os filtros ou crie um novo curso.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onEdit={openEdit}
                  onDelete={openDelete}
                  onView={openDetail}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* ─── Add / Edit Dialog ─────────────────────────────────────────────── */}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Curso' : 'Novo Curso'}</DialogTitle>
            <DialogDescription>
              {editingId ? 'Atualize as informações do curso.' : 'Preencha os dados para criar um novo curso.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="course-name">Nome</Label>
              <Input
                id="course-name"
                placeholder="Nome do curso"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                aria-invalid={!!errors.name}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="course-description">Descrição</Label>
              <Textarea
                id="course-description"
                placeholder="Descrição do curso"
                rows={3}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                aria-invalid={!!errors.description}
              />
              {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Categoria</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm((f) => ({ ...f, category: v as Course['category'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="frontend">Front-end</SelectItem>
                    <SelectItem value="backend">Back-end</SelectItem>
                    <SelectItem value="qa">QA</SelectItem>
                    <SelectItem value="devops">DevOps</SelectItem>
                    <SelectItem value="data">Dados</SelectItem>
                    <SelectItem value="ia">IA</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Nível</Label>
                <Select
                  value={form.level}
                  onValueChange={(v) => setForm((f) => ({ ...f, level: v as Course['level'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Iniciante</SelectItem>
                    <SelectItem value="intermediate">Intermediário</SelectItem>
                    <SelectItem value="advanced">Avançado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="course-duration">Duração (horas)</Label>
                <Input
                  id="course-duration"
                  type="number"
                  min={0}
                  placeholder="0"
                  value={form.duration || ''}
                  onChange={(e) => setForm((f) => ({ ...f, duration: Number(e.target.value) }))}
                  aria-invalid={!!errors.duration}
                />
                {errors.duration && <p className="text-xs text-destructive">{errors.duration}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="course-price">Preço (R$)</Label>
                <Input
                  id="course-price"
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder="0,00"
                  value={form.price || ''}
                  onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
                  aria-invalid={!!errors.price}
                />
                {errors.price && <p className="text-xs text-destructive">{errors.price}</p>}
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm((f) => ({ ...f, status: v as Course['status'] }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="published">Publicado</SelectItem>
                  <SelectItem value="archived">Arquivado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {editingId ? 'Salvar Alterações' : 'Criar Curso'}
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
              Tem certeza que deseja excluir este curso? Esta ação não pode ser desfeita e todos os módulos e aulas serão perdidos.
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

      {/* ─── Course Detail Dialog ──────────────────────────────────────────── */}

      <CourseDetailDialog
        course={detailCourse}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}
