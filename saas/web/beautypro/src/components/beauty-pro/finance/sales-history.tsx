'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useSales, formatBRL, formatDateTimeBR, paymentMethodLabel, statusLabel } from '@/lib/hooks';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Receipt } from 'lucide-react';

const paymentIcons: Record<string, string> = {
  cash: '💵',
  credit: '💳',
  debit: '💳',
  pix: '📱',
};

const statusBadgeClass: Record<string, string> = {
  completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  refunded: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  partial_refund: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

export function SalesHistory() {
  const { data, isLoading } = useSales();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="h-80 bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Receipt className="w-4 h-4" />
              Histórico de Vendas
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              {data.length} vendas
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="hidden sm:table-cell">Profissional</TableHead>
                  <TableHead className="hidden md:table-cell">Itens</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="hidden sm:table-cell">Pagamento</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDateTimeBR(sale.date)}
                    </TableCell>
                    <TableCell className="text-sm font-medium">{sale.clientName}</TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                      {sale.professionalName}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground max-w-[200px] truncate">
                      {sale.items}
                    </TableCell>
                    <TableCell className="text-sm font-semibold">{formatBRL(sale.total)}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="text-sm">
                        {paymentIcons[sale.paymentMethod]} {paymentMethodLabel(sale.paymentMethod)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={cn('text-[10px]', statusBadgeClass[sale.status] || '')}
                      >
                        {statusLabel(sale.status)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
