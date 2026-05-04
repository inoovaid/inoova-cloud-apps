'use client';

import { useState, useMemo } from 'react';
import { useBlogPosts } from '@/lib/hooks';
import { formatDateBR } from '@/lib/hooks';
import { motion } from 'framer-motion';
import {
  Search,
  BookOpen,
  Calendar,
  User,
  Tag,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import ReactMarkdown from 'react-markdown';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' } as any,
  transition: { duration: 0.5 },
};

const categoryColors: Record<string, string> = {
  'Tendências': 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  'Cuidados': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  'Dicas': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

export function BlogPage() {
  const { data: posts = [], isLoading } = useBlogPosts();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<any>(null);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    posts.forEach((p: any) => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats);
  }, [posts]);

  const filteredPosts = useMemo(() => {
    return posts.filter((post: any) => {
      const matchesSearch =
        !search ||
        post.title.toLowerCase().includes(search.toLowerCase()) ||
        post.excerpt?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        !selectedCategory || post.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [posts, search, selectedCategory]);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-beauty-pink-light/20 dark:from-primary/20 dark:via-primary/10 dark:to-beauty-pink-dark/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <motion.div
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="secondary" className="mb-4">Blog</Badge>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
              Dicas e <span className="text-primary">tendências</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Fique por dentro das novidades do mundo da beleza com nosso blog.
            </p>

            {/* Search Bar */}
            <div className="mt-8 max-w-md mx-auto relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar artigos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-8">
              <span className="text-sm text-muted-foreground mr-2">Filtrar:</span>
              <Button
                variant={selectedCategory === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(null)}
                className={selectedCategory === null ? 'bg-primary text-primary-foreground' : ''}
              >
                Todos
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                  className={selectedCategory === cat ? 'bg-primary text-primary-foreground' : ''}
                >
                  {cat}
                </Button>
              ))}
            </div>
          )}

          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <Skeleton className="h-48 rounded-t-lg" />
                  <CardContent className="p-6">
                    <Skeleton className="h-4 w-20 mb-3" />
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-2/3 mb-4" />
                    <div className="flex gap-4">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!isLoading && filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum artigo encontrado</h3>
              <p className="text-muted-foreground">
                Tente ajustar seus filtros ou termos de busca.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post: any, i: number) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <Card
                  className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer group"
                  onClick={() => setSelectedPost(post)}
                >
                  {/* Cover Image Placeholder */}
                  <div className="h-48 bg-gradient-to-br from-primary/10 to-beauty-pink-light/20 dark:from-primary/20 dark:to-beauty-pink-dark/20 flex items-center justify-center rounded-t-lg overflow-hidden">
                    <BookOpen className="w-10 h-10 text-primary/30" />
                  </div>

                  <CardContent className="p-6">
                    {post.category && (
                      <Badge
                        className={`mb-3 text-xs ${categoryColors[post.category] || 'bg-primary/10 text-primary'}`}
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {post.category}
                      </Badge>
                    )}
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {post.author && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {post.author}
                        </span>
                      )}
                      {post.publishedAt && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDateBR(post.publishedAt)}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Post Dialog */}
      <Dialog open={!!selectedPost} onOpenChange={(open) => !open && setSelectedPost(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          {selectedPost && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  {selectedPost.category && (
                    <Badge
                      className={`text-xs ${categoryColors[selectedPost.category] || 'bg-primary/10 text-primary'}`}
                    >
                      {selectedPost.category}
                    </Badge>
                  )}
                </div>
                <DialogTitle className="text-2xl">{selectedPost.title}</DialogTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                  {selectedPost.author && (
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {selectedPost.author}
                    </span>
                  )}
                  {selectedPost.publishedAt && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDateBR(selectedPost.publishedAt)}
                    </span>
                  )}
                </div>
              </DialogHeader>

              <div className="prose prose-sm dark:prose-invert max-w-none mt-4">
                <ReactMarkdown>{selectedPost.content || ''}</ReactMarkdown>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
