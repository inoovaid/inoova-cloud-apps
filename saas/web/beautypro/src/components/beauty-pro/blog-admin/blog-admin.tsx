'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBlogPosts, formatDateBR } from '@/lib/hooks';
import { useAppStore } from '@/lib/store';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Plus,
  Pencil,
  Trash2,
  FileText,
  Search,
  Eye,
  EyeOff,
  Globe,
  Loader2,
} from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  category: string | null;
  author: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

const blogCategories = ['Tendências', 'Cuidados', 'Barba', 'Estética', 'Novidades'];

const emptyForm = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  coverImage: '',
  category: '',
  author: '',
  isPublished: false,
};

export function BlogAdmin() {
  const { blogPostDialogOpen, setBlogPostDialogOpen, editingBlogPostId, setEditingBlogPostId } = useAppStore();
  const { data: posts, isLoading } = useBlogPosts(true);
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  // Load post data when editing
  useEffect(() => {
    if (editingBlogPostId && posts) {
      const post = (posts as BlogPost[]).find((p) => p.id === editingBlogPostId);
      if (post) {
        setForm({
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt || '',
          content: post.content,
          coverImage: post.coverImage || '',
          category: post.category || '',
          author: post.author || '',
          isPublished: post.isPublished,
        });
      }
    } else if (!editingBlogPostId) {
      setForm(emptyForm);
    }
  }, [editingBlogPostId, posts]);

  // Auto-generate slug from title
  const handleTitleChange = (title: string) => {
    setForm((prev) => ({
      ...prev,
      title,
      slug: title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, ''),
    }));
  };

  const filteredPosts = useMemo(() => {
    if (!posts) return [];
    const allPosts = posts as BlogPost[];
    if (!search) return allPosts;
    const q = search.toLowerCase();
    return allPosts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.author && p.author.toLowerCase().includes(q))
    );
  }, [posts, search]);

  const handleSave = async () => {
    if (!form.title || !form.content) return;
    setIsSaving(true);

    try {
      if (editingBlogPostId) {
        // Update
        const res = await fetch(`/api/blog/${editingBlogPostId}?id=${editingBlogPostId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: form.title,
            slug: form.slug,
            excerpt: form.excerpt || null,
            content: form.content,
            coverImage: form.coverImage || null,
            category: form.category || null,
            author: form.author || null,
            isPublished: form.isPublished,
          }),
        });
        if (!res.ok) throw new Error('Failed to update post');
      } else {
        // Create
        const res = await fetch('/api/blog', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: form.title,
            slug: form.slug,
            excerpt: form.excerpt || null,
            content: form.content,
            coverImage: form.coverImage || null,
            category: form.category || null,
            author: form.author || null,
            isPublished: form.isPublished,
          }),
        });
        if (!res.ok) throw new Error('Failed to create post');
      }

      queryClient.invalidateQueries({ queryKey: ['blog'] });
      setBlogPostDialogOpen(false);
      setEditingBlogPostId(null);
      setForm(emptyForm);
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/blog/${deleteId}?id=${deleteId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete post');
      queryClient.invalidateQueries({ queryKey: ['blog'] });
      setDeleteId(null);
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const openNewPost = () => {
    setForm(emptyForm);
    setEditingBlogPostId(null);
    setBlogPostDialogOpen(true);
  };

  const openEditPost = (id: string) => {
    setEditingBlogPostId(id);
    setBlogPostDialogOpen(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="h-96 bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-rose-500" />
              Posts do Blog
            </CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar posts..."
                  className="pl-8 h-9 w-full sm:w-[220px]"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button
                className="bg-rose-500 hover:bg-rose-600 text-white h-9"
                size="sm"
                onClick={openNewPost}
              >
                <Plus className="h-4 w-4 mr-1" />
                Novo Post
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Título</TableHead>
                  <TableHead className="hidden md:table-cell">Categoria</TableHead>
                  <TableHead className="hidden lg:table-cell">Autor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPosts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm line-clamp-1">{post.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          /{post.slug}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {post.category ? (
                        <Badge variant="secondary" className="text-[10px]">
                          {post.category}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {post.author || '—'}
                    </TableCell>
                    <TableCell>
                      {post.isPublished ? (
                        <Badge className="bg-emerald-100 text-emerald-800 text-[10px]">
                          <Eye className="h-3 w-3 mr-1" />
                          Publicado
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px]">
                          <EyeOff className="h-3 w-3 mr-1" />
                          Rascunho
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                      {formatDateBR(post.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEditPost(post.id)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeleteId(post.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredPosts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Nenhum post encontrado
            </div>
          )}
        </CardContent>
      </Card>

      {/* Blog Post Form Dialog */}
      <Dialog open={blogPostDialogOpen} onOpenChange={(open) => {
        setBlogPostDialogOpen(open);
        if (!open) {
          setEditingBlogPostId(null);
          setForm(emptyForm);
        }
      }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-rose-500" />
              {editingBlogPostId ? 'Editar Post' : 'Novo Post'}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {editingBlogPostId ? 'Editar o post do blog' : 'Criar um novo post do blog'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                placeholder="Título do post"
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
              />
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                placeholder="slug-do-post"
                value={form.slug}
                onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">Gerado automaticamente a partir do título</p>
            </div>

            {/* Excerpt */}
            <div className="space-y-2">
              <Label htmlFor="excerpt">Resumo</Label>
              <Textarea
                id="excerpt"
                placeholder="Breve resumo do post..."
                rows={2}
                value={form.excerpt}
                onChange={(e) => setForm((prev) => ({ ...prev, excerpt: e.target.value }))}
              />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content">Conteúdo (Markdown) *</Label>
              <Textarea
                id="content"
                placeholder="Escreva o conteúdo do post em Markdown..."
                rows={8}
                className="font-mono text-sm"
                value={form.content}
                onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
              />
            </div>

            {/* Category + Author row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select
                  value={form.category}
                  onValueChange={(val) => setForm((prev) => ({ ...prev, category: val }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {blogCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="author">Autor</Label>
                <Input
                  id="author"
                  placeholder="Nome do autor"
                  value={form.author}
                  onChange={(e) => setForm((prev) => ({ ...prev, author: e.target.value }))}
                />
              </div>
            </div>

            {/* Cover Image */}
            <div className="space-y-2">
              <Label htmlFor="coverImage">URL da Imagem de Capa</Label>
              <Input
                id="coverImage"
                placeholder="https://..."
                value={form.coverImage}
                onChange={(e) => setForm((prev) => ({ ...prev, coverImage: e.target.value }))}
              />
            </div>

            {/* Published toggle */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Switch
                id="isPublished"
                checked={form.isPublished}
                onCheckedChange={(checked) => setForm((prev) => ({ ...prev, isPublished: checked }))}
              />
              <div>
                <Label htmlFor="isPublished" className="cursor-pointer">
                  Publicar imediatamente
                </Label>
                <p className="text-xs text-muted-foreground">
                  {form.isPublished
                    ? 'O post ficará visível no site'
                    : 'O post será salvo como rascunho'}
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setBlogPostDialogOpen(false);
                setEditingBlogPostId(null);
                setForm(emptyForm);
              }}
            >
              Cancelar
            </Button>
            <Button
              className="bg-rose-500 hover:bg-rose-600 text-white"
              disabled={!form.title || !form.content || isSaving}
              onClick={handleSave}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : editingBlogPostId ? (
                'Salvar Alterações'
              ) : (
                'Criar Post'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Post</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este post? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
