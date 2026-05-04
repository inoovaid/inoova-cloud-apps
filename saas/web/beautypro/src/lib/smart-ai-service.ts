/**
 * BeautyPro CRM - Smart AI Service
 * 
 * Intelligence engine that analyzes client behavior, identifies patterns,
 * and suggests proactive actions for salon owners.
 * 
 * Key capabilities:
 * - Inactivity detection with VIP priority
 * - Birthday proximity alerts
 * - High-value client upsell opportunities
 * - Stock alert monitoring
 * - Win-back campaign suggestions
 */

import { db } from './db';

const TENANT_ID = 'tenant_demo_01';

interface ClientAnalysis {
  clientId: string;
  clientName: string;
  type: 'inactive_vip' | 'inactive' | 'birthday' | 'high_value' | 'win_back' | 'new_client';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  suggestedAction: 'send_whatsapp' | 'apply_coupon' | 'call' | 'send_email' | 'reorder';
  metadata: Record<string, any>;
}

export async function analyzeClients(): Promise<ClientAnalysis[]> {
  const now = new Date();
  const suggestions: ClientAnalysis[] = [];

  // Fetch all active clients for the tenant
  const clients = await db.client.findMany({
    where: { tenantId: TENANT_ID, isActive: true },
    include: {
      tags: { include: { tag: true } },
      appointments: {
        where: { status: { in: ['scheduled', 'confirmed'] } },
        orderBy: { date: 'asc' },
        take: 1,
      },
    },
  });

  for (const client of clients) {
    const daysSinceLastVisit = client.lastVisitAt
      ? Math.floor((now.getTime() - new Date(client.lastVisitAt).getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    const isVip = client.tags.some(t => t.tag.name === 'VIP');
    const isHighTicket = client.tags.some(t => t.tag.name === 'Alto Ticket');
    const isNewClient = client.tags.some(t => t.tag.name === 'Novo Cliente');

    // ============================================================
    // RULE 1: VIP Client Inactivity (>30 days = urgent, >60 = critical)
    // ============================================================
    if (isVip && daysSinceLastVisit > 30) {
      suggestions.push({
        clientId: client.id,
        clientName: client.name,
        type: 'inactive_vip',
        priority: daysSinceLastVisit > 90 ? 'urgent' : daysSinceLastVisit > 60 ? 'high' : 'medium',
        title: `Cliente VIP inativa há ${daysSinceLastVisit} dias`,
        description: `${client.name} (VIP, R$ ${client.totalSpent.toLocaleString('pt-BR')} em compras) não visita o salão há ${daysSinceLastVisit} dias. ${
          daysSinceLastVisit > 90
            ? 'Risco alto de perda! Contato imediato recomendado.'
            : 'Recomendamos contato com oferta personalizada.'
        }`,
        suggestedAction: daysSinceLastVisit > 90 ? 'call' : 'send_whatsapp',
        metadata: {
          inactiveDays: daysSinceLastVisit,
          totalSpent: client.totalSpent,
          avgTicket: client.avgTicket,
          riskLevel: daysSinceLastVisit > 90 ? 'critical' : daysSinceLastVisit > 60 ? 'high' : 'medium',
        },
      });
    }

    // ============================================================
    // RULE 2: General Inactivity (>60 days, non-VIP)
    // ============================================================
    if (!isVip && daysSinceLastVisit > 60) {
      suggestions.push({
        clientId: client.id,
        clientName: client.name,
        type: 'win_back',
        priority: daysSinceLastVisit > 120 ? 'high' : 'medium',
        title: `Reativação: ${client.name}`,
        description: `${client.name} não visita há ${daysSinceLastVisit} dias. ${
          client.totalVisits <= 3
            ? 'Cliente com poucas visitas - campanha de boas-vindas estendida recomendada.'
            : 'Envie cupom de desconto para reativação.'
        }`,
        suggestedAction: client.totalVisits <= 3 ? 'send_email' : 'apply_coupon',
        metadata: {
          inactiveDays: daysSinceLastVisit,
          totalVisits: client.totalVisits,
          totalSpent: client.totalSpent,
          couponSuggestion: daysSinceLastVisit > 120 ? '25OFF' : '15OFF',
        },
      });
    }

    // ============================================================
    // RULE 3: Birthday within 15 days
    // ============================================================
    if (client.birthday) {
      const birthday = new Date(client.birthday);
      const thisYearBirthday = new Date(now.getFullYear(), birthday.getMonth(), birthday.getDate());
      const daysUntilBirthday = Math.ceil((thisYearBirthday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntilBirthday >= 0 && daysUntilBirthday <= 15) {
        suggestions.push({
          clientId: client.id,
          clientName: client.name,
          type: 'birthday',
          priority: daysUntilBirthday <= 3 ? 'high' : 'medium',
          title: `Aniversário em ${daysUntilBirthday} dias`,
          description: `${client.name} faz aniversário em ${daysUntilBirthday === 0 ? 'HOJE' : `${daysUntilBirthday} dias`}. ${
            isVip ? 'Cliente VIP - ofereça benefício exclusivo!' : 'Envie mensagem com oferta especial de aniversário.'
          }`,
          suggestedAction: 'send_whatsapp',
          metadata: {
            birthday: client.birthday,
            daysUntil: daysUntilBirthday,
            isVip,
            suggestedOffer: isVip ? '30% OFF + Brinde' : '20% OFF',
          },
        });
      }
    }

    // ============================================================
    // RULE 4: High-Value Upsell Opportunity
    // ============================================================
    if (isHighTicket && client.avgTicket > 150 && client.totalVisits >= 20) {
      const nextAppt = client.appointments[0];
      if (nextAppt) {
        suggestions.push({
          clientId: client.id,
          clientName: client.name,
          type: 'high_value',
          priority: 'medium',
          title: `Oportunidade de Upsell: ${client.name}`,
          description: `${client.name} tem ticket médio de R$ ${client.avgTicket.toFixed(2)} e ${client.totalVisits} visitas. Próximo agendamento: ${new Date(nextAppt.date).toLocaleDateString('pt-BR')}. Considere oferecer serviços premium.`,
          suggestedAction: 'send_whatsapp',
          metadata: {
            avgTicket: client.avgTicket,
            totalVisits: client.totalVisits,
            totalSpent: client.totalSpent,
            nextAppointment: nextAppt.date,
          },
        });
      }
    }
  }

  // ============================================================
  // RULE 5: Stock Alerts
  // ============================================================
  const lowStockProducts = await db.product.findMany({
    where: {
      tenantId: TENANT_ID,
      isActive: true,
      stock: { lte: db.product.fields.minStock },
    },
  });

  for (const product of lowStockProducts) {
    suggestions.push({
      clientId: '',
      clientName: '',
      type: 'win_back', // Reusing type, in production would have 'stock_alert'
      priority: product.stock <= 2 ? 'urgent' : 'high',
      title: `Estoque ${product.stock <= 2 ? 'crítico' : 'baixo'}: ${product.name}`,
      description: `${product.name} (${product.brand}) está com ${product.stock} unidades. Mínimo recomendado: ${product.minStock}.`,
      suggestedAction: 'reorder',
      metadata: {
        productId: product.id,
        productName: product.name,
        brand: product.brand,
        currentStock: product.stock,
        minStock: product.minStock,
        costPrice: product.cost,
      },
    });
  }

  // Sort by priority
  const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
  suggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return suggestions;
}

/**
 * Generate a personalized message based on the suggestion type
 */
export function generatePersonalizedMessage(
  type: ClientAnalysis['type'],
  clientName: string,
  metadata: Record<string, any>
): string {
  switch (type) {
    case 'inactive_vip':
      return `Olá ${clientName}! 💎 Sentimos muito sua falta no Studio Beauty! Preparamos uma oferta exclusiva para você: 25% OFF em qualquer serviço. Válido por 7 dias. Agende já! 📞`;
    
    case 'win_back':
      return `${clientName}, faz tempo que não te vemos por aqui! 💇‍♀️ Que tal voltar com estilo? Use o cupom VOLTA${metadata.couponSuggestion || '15'} e ganhe desconto na sua próxima visita!`;
    
    case 'birthday':
      return `Feliz aniversário, ${clientName}! 🎂🎉 O Studio Beauty preparou um presente especial: ${metadata.suggestedOffer || '20% OFF'} em qualquer serviço esta semana. Te esperamos! 🎁`;
    
    case 'high_value':
      return `${clientName}, temos novidades exclusivas para clientes especiais! 🌟 Conheça nossos novos tratamentos premium. Agende uma avaliação gratuita!`;
    
    default:
      return `Olá ${clientName}! Temos uma oferta especial para você no Studio Beauty. Entre em contato!`;
  }
}
