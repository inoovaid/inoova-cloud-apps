'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useProducts, formatBRL } from '@/lib/hooks';
import { useAppStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  X,
  Package,
  Tag,
  Star,
  Check,
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  brand: string | null;
  category: string | null;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  sku: string | null;
  isActive: boolean;
}

const categoryColors: Record<string, string> = {
  Shampoo: 'bg-teal-100 text-teal-800',
  Tinta: 'bg-rose-100 text-rose-800',
  Tratamento: 'bg-purple-100 text-purple-800',
  Finalizador: 'bg-amber-100 text-amber-800',
  'Cuidados Capilares': 'bg-sky-100 text-sky-800',
  Barbearia: 'bg-stone-100 text-stone-800',
  Unhas: 'bg-pink-100 text-pink-800',
  Maquiagem: 'bg-fuchsia-100 text-fuchsia-800',
};

export function ShoppingPage() {
  const { data: products, isLoading } = useProducts();
  const { cart, addToCart, removeFromCart, clearCart } = useAppStore();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const categories = useMemo(() => {
    if (!products) return [];
    const cats = new Set<string>();
    (products as Product[]).forEach((p) => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats).sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    let result = [...(products as Product[])];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.brand && p.brand.toLowerCase().includes(q)) ||
          (p.category && p.category.toLowerCase().includes(q))
      );
    }

    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    return result;
  }, [products, search, selectedCategory]);

  const cartItems = useMemo(() => {
    if (!products) return [];
    return cart
      .map((item) => {
        const product = (products as Product[]).find((p) => p.id === item.productId);
        if (!product) return null;
        return { ...product, quantity: item.quantity };
      })
      .filter(Boolean) as (Product & { quantity: number })[];
  }, [cart, products]);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-40 bg-muted rounded mb-3" />
              <div className="h-4 bg-muted rounded w-3/4 mb-2" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with search and cart button */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar produtos, marcas..."
            className="pl-9 h-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          className="relative h-10"
          onClick={() => setCartOpen(true)}
        >
          <ShoppingBag className="h-4 w-4 mr-2" />
          Carrinho
          {totalItems > 0 && (
            <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center bg-rose-500 text-white text-[10px]">
              {totalItems}
            </Badge>
          )}
        </Button>
      </div>

      {/* Category filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          size="sm"
          className={`shrink-0 ${selectedCategory === 'all' ? 'bg-rose-500 hover:bg-rose-600' : ''}`}
          onClick={() => setSelectedCategory('all')}
        >
          <Tag className="h-3.5 w-3.5 mr-1.5" />
          Todos
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={selectedCategory === cat ? 'default' : 'outline'}
            size="sm"
            className={`shrink-0 ${selectedCategory === cat ? 'bg-rose-500 hover:bg-rose-600' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Products grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence>
          {filteredProducts.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: idx * 0.05 }}
              layout
            >
              <Card
                className="group cursor-pointer hover:shadow-md transition-all duration-200 overflow-hidden border-border/50 hover:border-rose-200"
                onClick={() => setSelectedProduct(product)}
              >
                <CardContent className="p-0">
                  {/* Product image placeholder */}
                  <div className="h-40 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30 flex items-center justify-center relative">
                    <Package className="h-12 w-12 text-rose-300 dark:text-rose-700" />
                    {product.category && (
                      <Badge
                        className={`absolute top-2 left-2 text-[10px] ${
                          categoryColors[product.category] || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {product.category}
                      </Badge>
                    )}
                    {product.stock <= product.minStock && product.stock > 0 && (
                      <Badge className="absolute top-2 right-2 text-[10px] bg-amber-100 text-amber-800">
                        Últimas unidades
                      </Badge>
                    )}
                  </div>

                  <div className="p-4">
                    {product.brand && (
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                        {product.brand}
                      </p>
                    )}
                    <h3 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-rose-600 transition-colors">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-rose-600">
                        {formatBRL(product.price)}
                      </span>
                      {product.stock > 0 ? (
                        <span className="text-xs text-emerald-600 flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          Em estoque
                        </span>
                      ) : (
                        <span className="text-xs text-red-500">Indisponível</span>
                      )}
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="p-4 pt-0">
                  <Button
                    className="w-full bg-rose-500 hover:bg-rose-600 text-white"
                    size="sm"
                    disabled={product.stock <= 0}
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(product.id);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-16">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Nenhum produto encontrado</p>
        </div>
      )}

      {/* Cart Drawer */}
      <Sheet open={cartOpen} onOpenChange={setCartOpen}>
        <SheetContent className="w-full sm:max-w-md flex flex-col">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-rose-500" />
              Carrinho de Compras
              {totalItems > 0 && (
                <Badge className="bg-rose-500 text-white">{totalItems}</Badge>
              )}
            </SheetTitle>
          </SheetHeader>

          {cartItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
              <ShoppingBag className="h-16 w-16 mb-4 opacity-30" />
              <p className="text-lg font-medium mb-1">Carrinho vazio</p>
              <p className="text-sm">Adicione produtos para começar</p>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1 -mx-6 px-6">
                <div className="space-y-3 py-4">
                  <AnimatePresence>
                    {cartItems.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex gap-3 p-3 rounded-lg bg-muted/50 border border-border/50"
                      >
                        <div className="w-16 h-16 rounded-md bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30 flex items-center justify-center shrink-0">
                          <Package className="h-6 w-6 text-rose-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                          {item.brand && (
                            <p className="text-xs text-muted-foreground">{item.brand}</p>
                          )}
                          <p className="text-sm font-semibold text-rose-600 mt-1">
                            {formatBRL(item.price)}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => {
                                const currentQty = cart.find((c) => c.productId === item.id)?.quantity || 1;
                                if (currentQty <= 1) {
                                  removeFromCart(item.id);
                                } else {
                                  removeFromCart(item.id);
                                  addToCart(item.id, currentQty - 1);
                                }
                              }}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-6 text-center text-sm font-medium">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => addToCart(item.id, 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </ScrollArea>

              <div className="border-t pt-4 mt-auto">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">Subtotal</span>
                  <span className="text-sm font-medium">{formatBRL(subtotal)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between items-center mb-4">
                  <span className="text-base font-semibold">Total</span>
                  <span className="text-lg font-bold text-rose-600">{formatBRL(subtotal)}</span>
                </div>

                <SheetFooter className="gap-2 sm:gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      clearCart();
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Limpar
                  </Button>
                  <Button className="flex-1 bg-rose-500 hover:bg-rose-600 text-white">
                    Finalizar Compra
                  </Button>
                </SheetFooter>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Product Detail Dialog */}
      <Dialog
        open={!!selectedProduct}
        onOpenChange={(open) => !open && setSelectedProduct(null)}
      >
        <DialogContent className="sm:max-w-lg">
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{selectedProduct.name}</DialogTitle>
                <DialogDescription className="sr-only">
                  Detalhes do produto {selectedProduct.name}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="h-52 rounded-lg bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30 flex items-center justify-center">
                  <Package className="h-20 w-20 text-rose-300 dark:text-rose-700" />
                </div>

                <div className="space-y-3">
                  {selectedProduct.brand && (
                    <p className="text-sm text-muted-foreground uppercase tracking-wider">
                      {selectedProduct.brand}
                    </p>
                  )}

                  {selectedProduct.category && (
                    <Badge
                      className={
                        categoryColors[selectedProduct.category] || 'bg-gray-100 text-gray-800'
                      }
                    >
                      {selectedProduct.category}
                    </Badge>
                  )}

                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className="h-4 w-4 text-amber-400 fill-amber-400"
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">(4.8)</span>
                  </div>

                  <div className="text-2xl font-bold text-rose-600">
                    {formatBRL(selectedProduct.price)}
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedProduct.stock > 0 ? (
                      <Badge className="bg-emerald-100 text-emerald-800">
                        <Check className="h-3 w-3 mr-1" />
                        Em estoque ({selectedProduct.stock} unidades)
                      </Badge>
                    ) : (
                      <Badge variant="destructive">Indisponível</Badge>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground">
                    Produto de alta qualidade para cuidados profissionais. 
                    Ideal para uso em salão ou em casa.
                  </p>
                </div>

                <Button
                  className="w-full bg-rose-500 hover:bg-rose-600 text-white h-11"
                  disabled={selectedProduct.stock <= 0}
                  onClick={() => {
                    addToCart(selectedProduct.id);
                    setSelectedProduct(null);
                  }}
                >
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Adicionar ao Carrinho
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
