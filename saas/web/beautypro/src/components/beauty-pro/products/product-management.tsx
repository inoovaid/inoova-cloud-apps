'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useProducts, formatBRL, type ProductItem } from '@/lib/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import {
  Package,
  Plus,
  Pencil,
  Trash2,
  Search,
  AlertTriangle,
  Loader2,
  Tag,
  DollarSign,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ---- Category badge colors ----
const categoryColors: Record<string, string> = {
  'Shampoo': 'bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300',
  'Condicionador': 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  'Tinta': 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  'Tratamento': 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
  'Finalizador': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  'Esmalte': 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/40 dark:text-fuchsia-300',
  'Barba': 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300',
  'Cabelos': 'bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300',
  'Pele': 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  'Unhas': 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  'Maquiagem': 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
  'Corpo': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  'Acessorios': 'bg-slate-100 text-slate-800 dark:bg-slate-900/40 dark:text-slate-300',
};

const defaultCategoryColor = 'bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-300';

function getCategoryColor(category: string | null): string {
  if (!category) return defaultCategoryColor;
  return categoryColors[category] || defaultCategoryColor;
}

// ---- Zod Schema ----
const productSchema = z.object({
  name: z.string().min(1, 'Nome e obrigatorio'),
  brand: z.string().optional(),
  category: z.string().optional(),
  sku: z.string().optional(),
  price: z.coerce.number().min(0, 'Preco deve ser >= 0').optional().default(0),
  cost: z.coerce.number().min(0, 'Custo deve ser >= 0').optional().default(0),
  stock: z.coerce.number().int().min(0, 'Estoque deve ser >= 0').optional().default(0),
  minStock: z.coerce.number().int().min(0, 'Estoque minimo deve ser >= 0').optional().default(5),
});

type ProductFormData = z.infer<typeof productSchema>;

// ---- Product Form Dialog ----
interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingProduct: ProductItem | null;
}

function ProductFormDialog({ open, onOpenChange, editingProduct }: ProductFormDialogProps) {
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const isEditing = !!editingProduct;

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      brand: '',
      category: '',
      sku: '',
      price: 0,
      cost: 0,
      stock: 0,
      minStock: 5,
    },
  });

  // Reset form when dialog opens/closes or editing product changes
  useEffect(() => {
    if (open) {
      if (editingProduct) {
        form.reset({
          name: editingProduct.name,
          brand: editingProduct.brand || '',
          category: editingProduct.category || '',
          sku: editingProduct.sku || '',
          price: editingProduct.price,
          cost: editingProduct.cost,
          stock: editingProduct.stock,
          minStock: editingProduct.minStock,
        });
      } else {
        form.reset({
          name: '',
          brand: '',
          category: '',
          sku: '',
          price: 0,
          cost: 0,
          stock: 0,
          minStock: 5,
        });
      }
    }
  }, [open, editingProduct, form]);

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
  };

  const onSubmit = async (data: ProductFormData) => {
    setIsSaving(true);
    try {
      const payload = {
        name: data.name,
        brand: data.brand || null,
        category: data.category || null,
        sku: data.sku || null,
        price: data.price,
        cost: data.cost,
        stock: data.stock,
        minStock: data.minStock,
      };

      if (isEditing && editingProduct) {
        const res = await fetch('/api/products', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingProduct.id, ...payload }),
        });
        if (!res.ok) throw new Error('Failed to update product');
      } else {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to create product');
      }

      await queryClient.invalidateQueries({ queryKey: ['products'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      handleClose();
    } catch (error) {
      console.error('Save product error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!isSaving && !v) handleClose(); }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Atualize as informacoes do produto' : 'Preencha os dados do novo produto'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="prod-name" className="text-sm font-medium">
              Nome <span className="text-red-500">*</span>
            </Label>
            <Input
              id="prod-name"
              placeholder="Ex: Shampoo Hidratante"
              {...form.register('name')}
              className="h-9"
            />
            {form.formState.errors.name && (
              <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>

          {/* Brand + Category */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="prod-brand" className="text-sm font-medium">Marca</Label>
              <Input
                id="prod-brand"
                placeholder="Ex: L&apos;Oreal"
                {...form.register('brand')}
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="prod-category" className="text-sm font-medium">Categoria</Label>
              <Input
                id="prod-category"
                placeholder="Ex: Cabelos"
                {...form.register('category')}
                className="h-9"
              />
            </div>
          </div>

          {/* SKU */}
          <div className="space-y-1.5">
            <Label htmlFor="prod-sku" className="text-sm font-medium">SKU</Label>
            <Input
              id="prod-sku"
              placeholder="Ex: SH-HID-001"
              {...form.register('sku')}
              className="h-9"
            />
          </div>

          {/* Price + Cost */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="prod-price" className="text-sm font-medium">Preco (R$)</Label>
              <Input
                id="prod-price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                {...form.register('price')}
                className="h-9"
              />
              {form.formState.errors.price && (
                <p className="text-xs text-red-500">{form.formState.errors.price.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="prod-cost" className="text-sm font-medium">Custo (R$)</Label>
              <Input
                id="prod-cost"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                {...form.register('cost')}
                className="h-9"
              />
              {form.formState.errors.cost && (
                <p className="text-xs text-red-500">{form.formState.errors.cost.message}</p>
              )}
            </div>
          </div>

          {/* Stock + Min Stock */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="prod-stock" className="text-sm font-medium">Estoque</Label>
              <Input
                id="prod-stock"
                type="number"
                min="0"
                step="1"
                placeholder="0"
                {...form.register('stock')}
                className="h-9"
              />
              {form.formState.errors.stock && (
                <p className="text-xs text-red-500">{form.formState.errors.stock.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="prod-minstock" className="text-sm font-medium">Estoque Minimo</Label>
              <Input
                id="prod-minstock"
                type="number"
                min="0"
                step="1"
                placeholder="5"
                {...form.register('minStock')}
                className="h-9"
              />
              {form.formState.errors.minStock && (
                <p className="text-xs text-red-500">{form.formState.errors.minStock.message}</p>
              )}
            </div>
          </div>

          {/* Profit margin preview */}
          {(() => {
            const priceVal = form.watch('price') || 0;
            const costVal = form.watch('cost') || 0;
            const margin = priceVal - costVal;
            const marginPct = priceVal > 0 ? (margin / priceVal) * 100 : 0;
            return (
              <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Margem de lucro</span>
                  <span className={cn(
                    'font-semibold',
                    margin > 0 ? 'text-emerald-600 dark:text-emerald-400' : margin < 0 ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'
                  )}>
                    {formatBRL(margin)} ({marginPct.toFixed(1)}%)
                  </span>
                </div>
              </div>
            );
          })()}

          <DialogFooter>
            <Button type="button" variant="outline" size="sm" onClick={handleClose} disabled={isSaving}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={isSaving}>
              {isSaving && <Loader2 className="w-3 h-3 animate-spin mr-1.5" />}
              {isEditing ? 'Salvar Alteracoes' : 'Criar Produto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---- Main Product Management Component ----
export function ProductManagement() {
  const { data: products, isLoading } = useProducts();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Extract unique categories from products
  const categories = useMemo(() => {
    if (!products) return [];
    const cats = new Set<string>();
    products.forEach((p) => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats).sort();
  }, [products]);

  // Filtered products
  const filtered = useMemo(() => {
    if (!products) return [];
    let result = products;

    if (categoryFilter !== 'all') {
      result = result.filter((p) => p.category === categoryFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.brand && p.brand.toLowerCase().includes(q)) ||
          (p.sku && p.sku.toLowerCase().includes(q)) ||
          (p.category && p.category.toLowerCase().includes(q))
      );
    }

    return result;
  }, [products, categoryFilter, search]);

  const handleCreate = () => {
    setEditingProduct(null);
    setDialogOpen(true);
  };

  const handleEdit = (product: ProductItem) => {
    setEditingProduct(product);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    setIsDeleting(true);
    try {
      await fetch(`/api/products?id=${deleteConfirmId}`, { method: 'DELETE' });
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    } catch (error) {
      console.error('Error deleting product:', error);
    } finally {
      setIsDeleting(false);
      setDeleteConfirmId(null);
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-64 bg-muted animate-pulse rounded-md" />
          <div className="h-9 w-32 bg-muted animate-pulse rounded-md" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-5">
                <div className="h-36 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const totalProducts = products?.length || 0;
  const lowStockCount = products?.filter((p) => p.stock <= p.minStock).length || 0;

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <p className="text-sm text-muted-foreground">
            {totalProducts} produto{totalProducts !== 1 ? 's' : ''} cadastrado{totalProducts !== 1 ? 's' : ''}
            {lowStockCount > 0 && (
              <span className="ml-2 text-red-600 dark:text-red-400 font-medium">
                ({lowStockCount} com estoque baixo)
              </span>
            )}
          </p>
        </div>
        <Button onClick={handleCreate} size="sm" className="gap-1.5 shrink-0">
          <Plus className="w-4 h-4" />
          Novo Produto
        </Button>
      </div>

      {/* Search + Category Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar produto, marca, SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <Button
            variant={categoryFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            className="h-8 text-xs"
            onClick={() => setCategoryFilter('all')}
          >
            Todos
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={categoryFilter === cat ? 'default' : 'outline'}
              size="sm"
              className="h-8 text-xs gap-1"
              onClick={() => setCategoryFilter(cat)}
            >
              <Tag className="w-3 h-3" />
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="p-4 rounded-full bg-muted mb-4">
            <Package className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-lg font-medium text-muted-foreground">Nenhum produto encontrado</p>
          <p className="text-sm text-muted-foreground mt-1">
            {search || categoryFilter !== 'all'
              ? 'Tente ajustar os filtros de busca'
              : 'Clique em "Novo Produto" para comecar'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((product, idx) => {
            const isLowStock = product.stock <= product.minStock;
            const margin = product.price - product.cost;
            const marginPct = product.price > 0 ? (margin / product.price) * 100 : 0;

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(idx * 0.05, 0.4) }}
              >
                <Card className={cn('group hover:shadow-md transition-shadow h-full flex flex-col', isLowStock && 'border-red-200 dark:border-red-900/50')}>
                  <CardContent className="p-4 flex flex-col flex-1">
                    {/* Top: Name + Category Badge */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm truncate">{product.name}</p>
                        {product.brand && (
                          <p className="text-xs text-muted-foreground truncate">{product.brand}</p>
                        )}
                      </div>
                      {product.category && (
                        <Badge
                          variant="secondary"
                          className={cn('text-[10px] px-1.5 py-0 shrink-0', getCategoryColor(product.category))}
                        >
                          {product.category}
                        </Badge>
                      )}
                    </div>

                    {/* SKU */}
                    {product.sku && (
                      <p className="text-[11px] text-muted-foreground font-mono mb-2">
                        SKU: {product.sku}
                      </p>
                    )}

                    {/* Price / Cost / Margin */}
                    <div className="space-y-1 mb-3 p-2.5 rounded-lg bg-muted/40 border border-border/30">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Preco</span>
                        <span className="text-sm font-bold">{formatBRL(product.price)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Custo</span>
                        <span className="text-xs text-muted-foreground">{formatBRL(product.cost)}</span>
                      </div>
                      <div className="border-t border-border/40 pt-1 mt-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Margem</span>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            <span className={cn(
                              'text-xs font-semibold',
                              margin > 0 ? 'text-emerald-600 dark:text-emerald-400' : margin < 0 ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'
                            )}>
                              {formatBRL(margin)} ({marginPct.toFixed(0)}%)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stock */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-muted-foreground">Estoque</span>
                      <div className="flex items-center gap-1.5">
                        {isLowStock && (
                          <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                        )}
                        <Badge
                          variant={isLowStock ? 'destructive' : 'secondary'}
                          className="text-[11px] px-1.5 py-0"
                        >
                          {product.stock} un.
                        </Badge>
                        {isLowStock && (
                          <span className="text-[10px] text-red-600 dark:text-red-400 font-medium">
                            Min: {product.minStock}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Spacer to push actions to bottom */}
                    <div className="flex-1" />

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-3 border-t border-border/50 mt-auto">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1.5 text-xs flex-1"
                        onClick={() => handleEdit(product)}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1.5 text-xs flex-1 text-destructive hover:text-destructive"
                        onClick={() => setDeleteConfirmId(product.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Excluir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Product Form Dialog */}
      <ProductFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingProduct={editingProduct}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => { if (!open) setDeleteConfirmId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Produto</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este produto? Esta acao nao pode ser desfeita. O produto sera marcado como inativo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
