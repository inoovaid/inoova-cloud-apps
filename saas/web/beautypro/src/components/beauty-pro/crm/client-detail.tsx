'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/lib/store';
import { useClientDetail, formatBRL, formatDateBR } from '@/lib/hooks';
import { Phone, Mail, Calendar, DollarSign, Star, Clock, MessageCircle, Tag, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

export function ClientDetail() {
  const { selectedClientId, setSelectedClientId } = useAppStore();
  const { data: client } = useClientDetail(selectedClientId);

  return (
    <Sheet open={!!selectedClientId} onOpenChange={() => setSelectedClientId(null)}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Perfil do Cliente</SheetTitle>
        </SheetHeader>

        {client && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 mt-4"
          >
            {/* Header */}
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary text-lg font-bold shrink-0">
                {client.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold">{client.name}</h3>
                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                  {client.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" /> {client.phone}
                    </span>
                  )}
                </div>
                {client.email && (
                  <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                    <Mail className="w-3.5 h-3.5" /> {client.email}
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Membro desde {formatDateBR(client.createdAt)}
                </p>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5">
              {client.tags.map((tag) => (
                <Badge
                  key={tag.name}
                  variant="secondary"
                  style={{ backgroundColor: tag.color + '20', color: tag.color }}
                >
                  {tag.name}
                </Badge>
              ))}
              {client.source && (
                <Badge variant="outline" className="text-xs">
                  <Tag className="w-3 h-3 mr-1" /> {client.source}
                </Badge>
              )}
            </div>

            <Separator />

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                  <DollarSign className="w-3.5 h-3.5" /> Total Gasto
                </div>
                <p className="text-lg font-bold">{formatBRL(client.totalSpent)}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                  <Star className="w-3.5 h-3.5" /> Ticket Médio
                </div>
                <p className="text-lg font-bold">{formatBRL(client.avgTicket)}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                  <Calendar className="w-3.5 h-3.5" /> Total Visitas
                </div>
                <p className="text-lg font-bold">{client.totalVisits}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                  <Clock className="w-3.5 h-3.5" /> Última Visita
                </div>
                <p className="text-lg font-bold text-sm">{formatDateBR(client.lastVisitAt)}</p>
              </div>
            </div>

            <Separator />

            {/* Notes */}
            {client.notes && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Observações</h4>
                <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                  {client.notes}
                </p>
              </div>
            )}

            {/* Loyalty */}
            <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
              <span className="text-sm font-medium">Pontos de Fidelidade</span>
              <Badge className="bg-primary text-primary-foreground">{client.loyaltyPoints} pts</Badge>
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" size="sm" className="text-xs">
                <MessageCircle className="w-3.5 h-3.5 mr-1" /> WhatsApp
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                <Tag className="w-3.5 h-3.5 mr-1" /> Cupom
              </Button>
              <Button variant="outline" size="sm" className="text-xs">
                <UserPlus className="w-3.5 h-3.5 mr-1" /> Agendar
              </Button>
            </div>
          </motion.div>
        )}
      </SheetContent>
    </Sheet>
  );
}
