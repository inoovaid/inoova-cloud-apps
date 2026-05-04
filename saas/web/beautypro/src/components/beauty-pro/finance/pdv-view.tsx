'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProfessionals, useClients, useServices, useProducts, formatBRL } from '@/lib/hooks';
import type { ServiceItem, ProductItem } from '@/lib/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, Plus, Minus, Trash2, CreditCard, Banknote, QrCode, Pencil, Loader2, Package, Scissors, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CartItem {
  id: string;
  name: string;
  type: 'service' | 'product';
  price: number;
  quantity: number;
  professionalId?: string;
  duration?: number;
}

interface CatalogItem {
  id: string;
  name: string;
  type: 'service' | 'product';
  price: number;
  duration?: number;
  category?: string | null;
  stock?: number;
}

type CatalogFilter = 'all' | 'service' | 'product';

const paymentMethods = [
  { id: 'cash', label: 'Dinheiro', icon: Banknote },
  { id: 'credit', label: 'Crédito', icon: CreditCard },
  { id: 'debit', label: 'Débito', icon: CreditCard },
  { id: 'pix', label: 'Pix', icon: QrCode },
];

export function PDVView() {
  const { data: professionals } = useProfessionals();
  const { data: clients } = useClients();
  const { data: services } = useServices();
  const { data: products } = useProducts();
  const queryClient = useQueryClient();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [catalogFilter, setCatalogFilter] = useState<CatalogFilter>('all');
  const [discountType, setDiscountType] = useState<'fixed' | 'percent'>('fixed');
  const [discountValue, setDiscountValue] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [selectedClient, setSelectedClient] = useState('');
  const [saleComplete, setSaleComplete] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  // Edit service dialog
  const [editingItem, setEditingItem] = useState<CartItem | null>(null);
  const [editPrice, setEditPrice] = useState(0);
  const [editDuration, setEditDuration] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Build catalog from real API data
  const catalog = useMemo<CatalogItem[]>(() => {
    const items: CatalogItem[] = [];

    if (services) {
      for (const s of services) {
        items.push({
          id: s.id,
          name: s.name,
          type: 'service',
          price: s.price,
          duration: s.duration,
          category: s.category,
        });
      }
    }

    if (products) {
      for (const p of products) {
        items.push({
          id: p.id,
          name: p.name,
          type: 'product',
          price: p.price,
          category: p.category,
          stock: p.stock,
        });
      }
    }

    return items;
  }, [services, products]);

  const filteredCatalog = useMemo(() => {
    let filtered = catalog;

    // Apply type filter
    if (catalogFilter !== 'all') {
      filtered = filtered.filter((item) => item.type === catalogFilter);
    }

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(term) ||
        (item.category && item.category.toLowerCase().includes(term))
      );
    }

    return filtered;
  }, [catalog, catalogFilter, searchTerm]);

  const addToCart = (item: CatalogItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, {
        id: item.id,
        name: item.name,
        type: item.type,
        price: item.price,
        quantity: 1,
        duration: item.duration,
      }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => (c.id === id ? { ...c, quantity: Math.max(0, c.quantity + delta) } : c))
        .filter((c) => c.quantity > 0)
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((c) => c.id !== id));
  };

  const updateItemProfessional = (itemId: string, professionalId: string) => {
    setCart((prev) =>
      prev.map((c) => c.id === itemId ? { ...c, professionalId: professionalId || undefined } : c)
    );
  };

  const handleEditItem = (item: CartItem) => {
    setEditingItem(item);
    setEditPrice(item.price);
    setEditDuration(item.duration || 30);
    setEditDialogOpen(true);
  };

  const saveEditItem = () => {
    if (!editingItem) return;
    setCart((prev) =>
      prev.map((c) =>
        c.id === editingItem.id
          ? { ...c, price: editPrice, duration: editDuration }
          : c
      )
    );
    setEditDialogOpen(false);
    setEditingItem(null);
  };

  const subtotal = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);
  const discount = discountType === 'fixed'
    ? discountValue
    : (subtotal * discountValue) / 100;
  const total = Math.max(0, subtotal - discount);

  const handleCompleteSale = async () => {
    if (cart.length === 0) return;
    setIsCompleting(true);

    try {
      const items = cart.map((item) => ({
        productId: item.type === 'product' ? item.id : null,
        type: item.type,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
        commissionPercent: 0,
      }));

      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: selectedClient || null,
          professionalId: cart[0]?.professionalId || null,
          items,
          discount,
          paymentMethod,
        }),
      });

      if (!res.ok) throw new Error('Failed to create sale');

      setSaleComplete(true);

      // Invalidate all relevant queries so data refreshes across the app
      await queryClient.invalidateQueries({ queryKey: ['finance', 'sales'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      await queryClient.invalidateQueries({ queryKey: ['clients'] });
      await queryClient.invalidateQueries({ queryKey: ['products'] });

      setTimeout(() => {
        setCart([]);
        setDiscountValue(0);
        setSaleComplete(false);
        setSelectedClient('');
      }, 2000);
    } catch (error) {
      console.error('Sale error:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  const isLoading = !services && !products;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-4"
    >
      {/* Left: Catalog */}
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar serviço ou produto..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-1.5 mt-2">
              <Button
                variant={catalogFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                className="text-xs h-7"
                onClick={() => setCatalogFilter('all')}
              >
                <LayoutGrid className="w-3 h-3 mr-1" />
                Todos
              </Button>
              <Button
                variant={catalogFilter === 'service' ? 'default' : 'outline'}
                size="sm"
                className="text-xs h-7"
                onClick={() => setCatalogFilter('service')}
              >
                <Scissors className="w-3 h-3 mr-1" />
                Serviços
              </Button>
              <Button
                variant={catalogFilter === 'product' ? 'default' : 'outline'}
                size="sm"
                className="text-xs h-7"
                onClick={() => setCatalogFilter('product')}
              >
                <Package className="w-3 h-3 mr-1" />
                Produtos
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="p-3 rounded-lg border border-border animate-pulse">
                    <div className="h-4 bg-muted rounded w-16 mb-2" />
                    <div className="h-4 bg-muted rounded w-3/4 mb-1" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : filteredCatalog.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Nenhum item encontrado
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[600px] overflow-y-auto">
                {filteredCatalog.map((item) => (
                  <motion.button
                    key={item.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => addToCart(item)}
                    className={cn(
                      'p-3 rounded-lg border border-border text-left hover:border-primary/30 hover:bg-primary/5 transition-colors',
                      cart.some((c) => c.id === item.id) && 'border-primary/30 bg-primary/5'
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <Badge
                        variant="secondary"
                        className={cn(
                          'text-[10px] mb-1',
                          item.type === 'service'
                            ? 'bg-primary/10 text-primary'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        )}
                      >
                        {item.type === 'service' ? 'Serviço' : 'Produto'}
                      </Badge>
                      {cart.some((c) => c.id === item.id) && (
                        <span className="text-xs font-bold text-primary">
                          ×{cart.find((c) => c.id === item.id)?.quantity}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium mt-1 leading-tight">{item.name}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm font-bold text-primary">{formatBRL(item.price)}</p>
                      {item.type === 'service' && item.duration ? (
                        <span className="text-[10px] text-muted-foreground">{item.duration}min</span>
                      ) : item.type === 'product' && item.stock !== undefined ? (
                        <span className={cn(
                          'text-[10px]',
                          item.stock <= 5 ? 'text-red-500 font-medium' : 'text-muted-foreground'
                        )}>
                          Estoque: {item.stock}
                        </span>
                      ) : null}
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right: Cart */}
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Carrinho</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {cart.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Nenhum item adicionado
              </div>
            ) : (
              <div className="space-y-2 mb-4 max-h-72 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="p-2.5 bg-muted/50 rounded-lg space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatBRL(item.price)} × {item.quantity} = {formatBRL(item.price * item.quantity)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        onClick={() => handleEditItem(item)}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Professional assignment per item */}
                    <div className="flex items-center gap-1.5">
                      <select
                        className="h-6 text-[10px] rounded border border-input bg-transparent px-1.5 flex-1"
                        value={item.professionalId || ''}
                        onChange={(e) => updateItemProfessional(item.id, e.target.value)}
                      >
                        <option value="">Profissional...</option>
                        {professionals?.filter(p => p.isActive).map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                      <div className="flex items-center gap-0.5">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, -1)}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-xs font-medium w-5 text-center">{item.quantity}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.id, 1)}>
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeFromCart(item.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Separator className="my-3" />

            {/* Client Selection */}
            <div className="space-y-2">
              <div>
                <label className="text-xs text-muted-foreground">Cliente</label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                >
                  <option value="">Selecionar cliente</option>
                  {clients?.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <Separator className="my-3" />

            {/* Discount */}
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Desconto</label>
              <div className="flex gap-1.5">
                <Select value={discountType} onValueChange={(v: 'fixed' | 'percent') => setDiscountType(v)}>
                  <SelectTrigger className="h-9 w-[90px] sm:w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">R$ Fixo</SelectItem>
                    <SelectItem value="percent">% Perc</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min={0}
                  max={discountType === 'percent' ? 100 : subtotal}
                  value={discountValue || ''}
                  onChange={(e) => setDiscountValue(Number(e.target.value) || 0)}
                  placeholder="0"
                  className="h-9 flex-1"
                />
              </div>
            </div>

            <Separator className="my-3" />

            {/* Payment Method */}
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Forma de Pagamento</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {paymentMethods.map((pm) => (
                  <Button
                    key={pm.id}
                    variant={paymentMethod === pm.id ? 'default' : 'outline'}
                    size="sm"
                    className="text-[10px] h-9 flex-col gap-0.5"
                    onClick={() => setPaymentMethod(pm.id)}
                  >
                    <pm.icon className="w-3.5 h-3.5" />
                    {pm.label}
                  </Button>
                ))}
              </div>
            </div>

            <Separator className="my-3" />

            {/* Totals */}
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatBRL(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Desconto {discountType === 'percent' ? `(${discountValue}%)` : ''}
                  </span>
                  <span className="text-emerald-600">-{formatBRL(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-1">
                <span>Total</span>
                <span className="text-primary">{formatBRL(total)}</span>
              </div>
            </div>

            <Button
              className="w-full mt-4 h-11 text-sm font-semibold"
              disabled={cart.length === 0 || saleComplete || isCompleting}
              onClick={handleCompleteSale}
            >
              {isCompleting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
              ) : saleComplete ? (
                '✓ Venda Concluída!'
              ) : (
                'Finalizar Venda'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Edit item dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Editar Item</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">{editingItem.name}</Label>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-price" className="text-sm">Preço (R$)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  min={0}
                  step={0.01}
                  value={editPrice}
                  onChange={(e) => setEditPrice(Number(e.target.value) || 0)}
                  className="h-9"
                />
              </div>
              {editingItem.type === 'service' && (
                <div className="space-y-1.5">
                  <Label htmlFor="edit-duration" className="text-sm">Duração (minutos)</Label>
                  <Input
                    id="edit-duration"
                    type="number"
                    min={5}
                    step={5}
                    value={editDuration}
                    onChange={(e) => setEditDuration(Number(e.target.value) || 30)}
                    className="h-9"
                  />
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button size="sm" onClick={saveEditItem}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
