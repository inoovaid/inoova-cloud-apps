import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const TENANT_ID = 'tenant_demo_01';
const BRANCH_ID = 'branch_main_01';

async function main() {
  const existing = await prisma.tenant.findFirst({ where: { id: TENANT_ID } });
  if (existing) {
    console.log('Database already seeded');
    return;
  }

  console.log('Seeding database...');

  await prisma.tenant.create({ data: { id: TENANT_ID, name: 'Studio Beauty São Bento', slug: 'saobento', plan: 'pro', phone: '(11) 3456-7890', email: 'contato@studiobeauty.com.br', address: 'Rua Augusta, 1200 - Consolação', city: 'São Paulo', state: 'SP', zipCode: '01305-100' } });
  await prisma.branch.create({ data: { id: BRANCH_ID, tenantId: TENANT_ID, name: 'Matriz - Consolação', address: 'Rua Augusta, 1200', phone: '(11) 3456-7890' } });
  await prisma.user.createMany({ data: [
    { id: 'user_01', tenantId: TENANT_ID, email: 'admin@studiobeauty.com.br', name: 'Patrícia Santos', role: 'owner' },
    { id: 'user_02', tenantId: TENANT_ID, email: 'gerente@studiobeauty.com.br', name: 'Marcos Oliveira', role: 'manager' },
    { id: 'user_03', tenantId: TENANT_ID, email: 'recepcao@studiobeauty.com.br', name: 'Luciana Lima', role: 'receptionist' },
  ] });

  await prisma.professional.createMany({ data: [
    { id: 'pro_01', tenantId: TENANT_ID, branchId: BRANCH_ID, name: 'Ana Silva', specialty: 'Cabelereira', color: '#f472b6' },
    { id: 'pro_02', tenantId: TENANT_ID, branchId: BRANCH_ID, name: 'Carlos Mendes', specialty: 'Barbeiro', color: '#60a5fa' },
    { id: 'pro_03', tenantId: TENANT_ID, branchId: BRANCH_ID, name: 'Juliana Costa', specialty: 'Manicure / Pedicure', color: '#34d399' },
    { id: 'pro_04', tenantId: TENANT_ID, branchId: BRANCH_ID, name: 'Roberto Lima', specialty: 'Esteticista', color: '#fbbf24' },
    { id: 'pro_05', tenantId: TENANT_ID, branchId: BRANCH_ID, name: 'Fernanda Oliveira', specialty: 'Cabelereira Senior', color: '#a78bfa' },
  ] });

  await prisma.service.createMany({ data: [
    { id: 'srv_01', tenantId: TENANT_ID, name: 'Corte Feminino', category: 'Cabelo', duration: 60, price: 80, cost: 10 },
    { id: 'srv_02', tenantId: TENANT_ID, name: 'Corte Masculino', category: 'Cabelo', duration: 30, price: 45, cost: 5 },
    { id: 'srv_03', tenantId: TENANT_ID, name: 'Coloração', category: 'Cabelo', duration: 120, price: 150, cost: 35 },
    { id: 'srv_04', tenantId: TENANT_ID, name: 'Mechas / Luzes', category: 'Cabelo', duration: 180, price: 250, cost: 50 },
    { id: 'srv_05', tenantId: TENANT_ID, name: 'Hidratação', category: 'Cabelo', duration: 60, price: 70, cost: 15 },
    { id: 'srv_06', tenantId: TENANT_ID, name: 'Escova Progressiva', category: 'Cabelo', duration: 180, price: 300, cost: 60 },
    { id: 'srv_07', tenantId: TENANT_ID, name: 'Manicure', category: 'Unhas', duration: 45, price: 40, cost: 8 },
    { id: 'srv_08', tenantId: TENANT_ID, name: 'Pedicure', category: 'Unhas', duration: 45, price: 45, cost: 10 },
    { id: 'srv_09', tenantId: TENANT_ID, name: 'Unhas em Gel', category: 'Unhas', duration: 90, price: 120, cost: 25 },
    { id: 'srv_10', tenantId: TENANT_ID, name: 'Limpeza de Pele', category: 'Estética', duration: 60, price: 120, cost: 20 },
    { id: 'srv_11', tenantId: TENANT_ID, name: 'Barba', category: 'Barba', duration: 30, price: 35, cost: 5 },
    { id: 'srv_12', tenantId: TENANT_ID, name: 'Sobrancelha', category: 'Estética', duration: 20, price: 30, cost: 5 },
  ] });

  await prisma.client.createMany({ data: [
    { id: 'cli_01', tenantId: TENANT_ID, name: 'Maria Santos', phone: '(11) 99111-2222', birthday: new Date('1988-03-15'), source: 'Instagram', totalVisits: 24, totalSpent: 3200, avgTicket: 133, lastVisitAt: new Date('2025-01-20') },
    { id: 'cli_02', tenantId: TENANT_ID, name: 'João Pereira', phone: '(11) 99222-3333', birthday: new Date('1992-07-22'), source: 'Indicação', totalVisits: 18, totalSpent: 2100, avgTicket: 117, lastVisitAt: new Date('2025-01-25') },
    { id: 'cli_03', tenantId: TENANT_ID, name: 'Camila Rodrigues', phone: '(11) 99333-4444', birthday: new Date('1995-11-08'), source: 'Google', totalVisits: 42, totalSpent: 8500, avgTicket: 202, lastVisitAt: new Date('2025-01-28') },
    { id: 'cli_04', tenantId: TENANT_ID, name: 'Pedro Almeida', phone: '(11) 99444-5555', birthday: new Date('1985-01-30'), source: 'WhatsApp', totalVisits: 8, totalSpent: 720, avgTicket: 90, lastVisitAt: new Date('2024-11-10') },
    { id: 'cli_05', tenantId: TENANT_ID, name: 'Beatriz Souza', phone: '(11) 99555-6666', birthday: new Date('1990-05-12'), source: 'Instagram', totalVisits: 36, totalSpent: 6200, avgTicket: 172, lastVisitAt: new Date('2025-02-01') },
    { id: 'cli_06', tenantId: TENANT_ID, name: 'Lucas Ferreira', phone: '(11) 99666-7777', birthday: new Date('1998-09-25'), source: 'Google', totalVisits: 3, totalSpent: 250, avgTicket: 83, lastVisitAt: new Date('2024-10-15') },
    { id: 'cli_07', tenantId: TENANT_ID, name: 'Isabela Martins', phone: '(11) 99777-8888', birthday: new Date('1987-12-03'), source: 'Indicação', totalVisits: 30, totalSpent: 5400, avgTicket: 180, lastVisitAt: new Date('2025-01-15') },
    { id: 'cli_08', tenantId: TENANT_ID, name: 'Ricardo Gomes', phone: '(11) 99888-9999', birthday: new Date('1993-04-18'), source: 'WhatsApp', totalVisits: 12, totalSpent: 1560, avgTicket: 130, lastVisitAt: new Date('2025-02-05') },
    { id: 'cli_09', tenantId: TENANT_ID, name: 'Amanda Lima', phone: '(11) 99999-0000', birthday: new Date('1996-08-30'), source: 'Instagram', totalVisits: 5, totalSpent: 380, avgTicket: 76, lastVisitAt: new Date('2024-09-20') },
    { id: 'cli_10', tenantId: TENANT_ID, name: 'Thiago Barbosa', phone: '(11) 99000-1111', birthday: new Date('1991-02-14'), source: 'Google', totalVisits: 15, totalSpent: 1800, avgTicket: 120, lastVisitAt: new Date('2025-01-30') },
    { id: 'cli_11', tenantId: TENANT_ID, name: 'Fernanda Dias', phone: '(11) 99111-3333', birthday: new Date('1989-06-21'), source: 'Indicação', totalVisits: 50, totalSpent: 12000, avgTicket: 240, lastVisitAt: new Date('2025-02-10') },
    { id: 'cli_12', tenantId: TENANT_ID, name: 'Gabriel Costa', phone: '(11) 99222-4444', birthday: new Date('1994-10-05'), source: 'WhatsApp', totalVisits: 2, totalSpent: 120, avgTicket: 60, lastVisitAt: new Date('2024-08-01') },
  ] });

  await prisma.clientTag.createMany({ data: [
    { id: 'tag_01', tenantId: TENANT_ID, name: 'VIP', color: '#f59e0b', isAuto: true, rule: '{"type": "totalSpent", "min": 5000}' },
    { id: 'tag_02', tenantId: TENANT_ID, name: 'Inativo 60d', color: '#ef4444', isAuto: true, rule: '{"type": "inactive", "days": 60}' },
    { id: 'tag_03', tenantId: TENANT_ID, name: 'Alto Ticket', color: '#10b981', isAuto: true, rule: '{"type": "avgTicket", "min": 150}' },
    { id: 'tag_04', tenantId: TENANT_ID, name: 'Novo Cliente', color: '#3b82f6', isAuto: true, rule: '{"type": "totalVisits", "max": 3}' },
    { id: 'tag_05', tenantId: TENANT_ID, name: 'Frequente', color: '#8b5cf6', isAuto: true, rule: '{"type": "totalVisits", "min": 20}' },
  ] });

  await prisma.clientTagAssignment.createMany({ data: [
    { clientId: 'cli_03', tagId: 'tag_01' }, { clientId: 'cli_05', tagId: 'tag_01' },
    { clientId: 'cli_07', tagId: 'tag_01' }, { clientId: 'cli_11', tagId: 'tag_01' },
    { clientId: 'cli_04', tagId: 'tag_02' }, { clientId: 'cli_06', tagId: 'tag_02' },
    { clientId: 'cli_09', tagId: 'tag_02' }, { clientId: 'cli_12', tagId: 'tag_02' },
    { clientId: 'cli_03', tagId: 'tag_03' }, { clientId: 'cli_05', tagId: 'tag_03' },
    { clientId: 'cli_07', tagId: 'tag_03' }, { clientId: 'cli_11', tagId: 'tag_03' },
    { clientId: 'cli_06', tagId: 'tag_04' }, { clientId: 'cli_12', tagId: 'tag_04' },
    { clientId: 'cli_01', tagId: 'tag_05' }, { clientId: 'cli_03', tagId: 'tag_05' },
    { clientId: 'cli_05', tagId: 'tag_05' }, { clientId: 'cli_07', tagId: 'tag_05' },
    { clientId: 'cli_11', tagId: 'tag_05' },
  ] });

  await prisma.product.createMany({ data: [
    { id: 'prod_01', tenantId: TENANT_ID, name: 'Shampoo Hidratante 500ml', brand: "L'Oréal", category: 'Shampoo', price: 65, cost: 28, stock: 45, minStock: 10 },
    { id: 'prod_02', tenantId: TENANT_ID, name: 'Condicionador Reparador 500ml', brand: "L'Oréal", category: 'Condicionador', price: 70, cost: 30, stock: 38, minStock: 10 },
    { id: 'prod_03', tenantId: TENANT_ID, name: 'Tinta Absoluto N7', brand: 'Wella', category: 'Tinta', price: 55, cost: 22, stock: 12, minStock: 5 },
    { id: 'prod_04', tenantId: TENANT_ID, name: 'Máscara Capilar 250g', brand: 'Kerastase', category: 'Tratamento', price: 120, cost: 55, stock: 20, minStock: 5 },
    { id: 'prod_05', tenantId: TENANT_ID, name: 'Óleo Argan 60ml', brand: 'Moroccanoil', category: 'Finalizador', price: 95, cost: 42, stock: 15, minStock: 5 },
    { id: 'prod_06', tenantId: TENANT_ID, name: 'Esmalte Gel Vermelho', brand: 'Gelish', category: 'Esmalte', price: 35, cost: 12, stock: 50, minStock: 15 },
    { id: 'prod_07', tenantId: TENANT_ID, name: 'Pomada Modeladora 100g', brand: 'Schwarzkopf', category: 'Barba', price: 45, cost: 18, stock: 25, minStock: 8 },
    { id: 'prod_08', tenantId: TENANT_ID, name: 'Protetor Térmico 200ml', brand: 'Redken', category: 'Finalizador', price: 85, cost: 38, stock: 3, minStock: 5 },
  ] });

  // Today's appointments
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayAppts = [
    { clientId: 'cli_05', professionalId: 'pro_01', startTime: '09:00', endTime: '10:00', status: 'completed' },
    { clientId: 'cli_02', professionalId: 'pro_02', startTime: '09:00', endTime: '09:30', status: 'completed' },
    { clientId: 'cli_03', professionalId: 'pro_05', startTime: '09:30', endTime: '12:30', status: 'in_progress' },
    { clientId: 'cli_07', professionalId: 'pro_03', startTime: '10:00', endTime: '11:30', status: 'in_progress' },
    { clientId: 'cli_08', professionalId: 'pro_01', startTime: '10:30', endTime: '12:30', status: 'confirmed' },
    { clientId: 'cli_10', professionalId: 'pro_02', startTime: '10:30', endTime: '11:00', status: 'confirmed' },
    { clientId: 'cli_01', professionalId: 'pro_04', startTime: '11:00', endTime: '12:00', status: 'confirmed' },
    { clientId: 'cli_11', professionalId: 'pro_05', startTime: '13:00', endTime: '16:00', status: 'scheduled' },
    { clientId: 'cli_04', professionalId: 'pro_03', startTime: '13:00', endTime: '14:30', status: 'scheduled' },
    { clientId: 'cli_06', professionalId: 'pro_01', startTime: '14:00', endTime: '15:00', status: 'scheduled' },
    { clientId: 'cli_09', professionalId: 'pro_04', startTime: '14:00', endTime: '15:00', status: 'scheduled' },
    { clientId: 'cli_12', professionalId: 'pro_02', startTime: '15:00', endTime: '15:30', status: 'scheduled' },
  ];
  for (let i = 0; i < todayAppts.length; i++) {
    const a = todayAppts[i];
    await prisma.appointment.create({ data: {
      id: `appt_today_${String(i + 1).padStart(2, '0')}`, tenantId: TENANT_ID, branchId: BRANCH_ID,
      clientId: a.clientId, professionalId: a.professionalId, date: today,
      startTime: a.startTime, endTime: a.endTime, status: a.status,
      reminderSent24h: a.status !== 'scheduled', reminderSent1h: a.status === 'completed' || a.status === 'in_progress',
    } });
  }

  // Historical appointments (simplified)
  for (let d = 1; d <= 30; d++) {
    const pastDate = new Date(today); pastDate.setDate(pastDate.getDate() - d);
    const n = Math.floor(Math.random() * 5) + 3;
    for (let j = 0; j < n; j++) {
      const profs = ['pro_01', 'pro_02', 'pro_03', 'pro_04', 'pro_05'];
      const clis = ['cli_01','cli_02','cli_03','cli_04','cli_05','cli_06','cli_07','cli_08','cli_09','cli_10','cli_11','cli_12'];
      const h = Math.floor(Math.random() * 9) + 8;
      const m = Math.random() > 0.5 ? '00' : '30';
      await prisma.appointment.create({ data: {
        id: `appt_p_${d}_${j}`, tenantId: TENANT_ID, branchId: BRANCH_ID,
        clientId: clis[Math.floor(Math.random() * clis.length)],
        professionalId: profs[Math.floor(Math.random() * profs.length)],
        date: pastDate, startTime: `${String(h).padStart(2,'0')}:${m}`,
        endTime: `${String(h + (Math.random()>0.5?1:2)).padStart(2,'0')}:${m}`,
        status: 'completed', reminderSent24h: true, reminderSent1h: true,
      } });
    }
  }

  await prisma.automation.createMany({ data: [
    { id: 'auto_01', tenantId: TENANT_ID, name: 'Lembrete 24h antes', type: 'reminder_24h', channel: 'whatsapp', template: 'Olá {client_name}! Lembrete: seu agendamento é amanhã às {time} com {professional_name}.', isActive: true },
    { id: 'auto_02', tenantId: TENANT_ID, name: 'Lembrete 1h antes', type: 'reminder_1h', channel: 'whatsapp', template: '{client_name}, seu horário com {professional_name} é em 1h!', isActive: true },
    { id: 'auto_03', tenantId: TENANT_ID, name: 'Win-back Inativos 60d', type: 'win_back', channel: 'whatsapp', template: 'Sentimos sua falta, {client_name}! Volte com 15% OFF: cupom VOLTA15!', isActive: true, triggerRule: '{"inactiveDays": 60}' },
    { id: 'auto_04', tenantId: TENANT_ID, name: 'Feliz Aniversário!', type: 'birthday', channel: 'whatsapp', template: 'Feliz aniversário, {client_name}! 20% OFF em qualquer serviço!', isActive: true },
    { id: 'auto_05', tenantId: TENANT_ID, name: 'Pedido de Avaliação', type: 'review_request', channel: 'whatsapp', template: 'Obrigado pela visita, {client_name}! Avalie-nos: https://g.page/r/review_link', isActive: true },
    { id: 'auto_06', tenantId: TENANT_ID, name: 'Alerta Estoque Baixo', type: 'stock_alert', channel: 'email', template: 'Produto {product_name} estoque baixo: {stock} un.', isActive: true, triggerRule: '{"minStock": true}' },
  ] });

  await prisma.commissionRule.createMany({ data: [
    { id: 'comm_01', tenantId: TENANT_ID, type: 'service', serviceCategory: 'Cabelo', percent: 60 },
    { id: 'comm_02', tenantId: TENANT_ID, type: 'service', serviceCategory: 'Unhas', percent: 50 },
    { id: 'comm_03', tenantId: TENANT_ID, type: 'service', serviceCategory: 'Estética', percent: 55 },
    { id: 'comm_04', tenantId: TENANT_ID, type: 'product', percent: 40 },
  ] });

  // Historical sales
  for (let i = 1; i <= 30; i++) {
    const dayDate = new Date(); dayDate.setDate(dayDate.getDate() - (30 - i));
    const n = Math.floor(Math.random() * 5) + 2;
    for (let j = 0; j < n; j++) {
      const clis = ['cli_01','cli_02','cli_03','cli_04','cli_05','cli_06','cli_07','cli_08','cli_09','cli_10','cli_11','cli_12'];
      const pros = ['pro_01','pro_02','pro_03','pro_04','pro_05'];
      const total = Math.floor(Math.random() * 200) + 50;
      await prisma.sale.create({ data: {
        tenantId: TENANT_ID, branchId: BRANCH_ID,
        clientId: clis[Math.floor(Math.random() * clis.length)],
        professionalId: pros[Math.floor(Math.random() * pros.length)],
        total, discount: Math.random() > 0.7 ? Math.floor(total * 0.1) : 0,
        paymentMethod: ['cash','credit','debit','pix'][Math.floor(Math.random() * 4)],
        status: 'completed', createdAt: dayDate,
      } });
    }
  }

  await prisma.smartSuggestion.createMany({ data: [
    { id: 'sug_01', tenantId: TENANT_ID, type: 'inactive_vip', priority: 'urgent', title: 'Cliente VIP inativa há 60+ dias', description: 'Pedro Almeida (VIP) não visita desde Nov/2024. Contato imediato recomendado.', action: 'send_whatsapp', clientId: 'cli_04', metadata: '{"inactiveDays":82}' },
    { id: 'sug_02', tenantId: TENANT_ID, type: 'inactive_vip', priority: 'high', title: 'Cliente inativa há 5 meses', description: 'Amanda Lima não aparece desde Set/2024. Envie cupom 15% OFF.', action: 'apply_coupon', clientId: 'cli_09', metadata: '{"inactiveDays":145}' },
    { id: 'sug_03', tenantId: TENANT_ID, type: 'birthday', priority: 'medium', title: 'Aniversário próximo', description: 'Pedro Almeida faz aniversário em breve. Envie oferta especial.', action: 'send_whatsapp', clientId: 'cli_04', metadata: '{"birthday":"01-30"}' },
    { id: 'sug_04', tenantId: TENANT_ID, type: 'high_value', priority: 'medium', title: 'Oportunidade de Upsell', description: 'Fernanda Dias gastou R$ 12.000. Ofereça pacote VIP Premium.', action: 'call', clientId: 'cli_11', metadata: '{"totalSpent":12000}' },
    { id: 'sug_05', tenantId: TENANT_ID, type: 'inactive_vip', priority: 'urgent', title: 'Estoque crítico: Protetor Térmico', description: 'Protetor Térmico Redken: apenas 3 unidades. Mínimo: 5.', action: 'reorder', metadata: '{"productId":"prod_08","stock":3}' },
    { id: 'sug_06', tenantId: TENANT_ID, type: 'inactive_vip', priority: 'high', title: 'Reativação: Lucas Ferreira', description: 'Apenas 2 visitas. Envie campanha de boas-vindas.', action: 'send_whatsapp', clientId: 'cli_12', metadata: '{"totalVisits":2}' },
  ] });

  // Blog Posts
  await prisma.blogPost.createMany({ data: [
    { id: 'blog_01', tenantId: TENANT_ID, title: '5 Tendências de Cabelo para 2025', slug: 'tendencias-cabelo-2025', excerpt: 'Descubra os cortes e cores que vão dominar o ano!', content: '# 5 Tendências de Cabelo para 2025\n\nO ano de 2025 promete revolucionar o mundo da beleza com cortes ousados e cores vibrantes.\n\n## 1. Bob Curtinho\nO bob curto continua em alta, agora com camadas mais texturizadas e movimento natural.\n\n## 2. Balayage Natural\nO balayage em tons naturais como mel e caramelo traz iluminação sutil ao cabelo.\n\n## 3. Franja Cortina\nA franja cortina é perfeita para quem quer mudar sem compromisso.\n\n## 4. Cores Fantasia Pastel\nTons lavanda, rosa quartzo e azul celeste em versões delicadas.\n\n## 5. Cabelo Natural e Poderoso\nCacheados e crespos assumindo sua textura natural com orgulho!', category: 'Tendências', author: 'Ana Silva', isPublished: true, publishedAt: new Date('2025-01-15') },
    { id: 'blog_02', tenantId: TENANT_ID, title: 'Como Cuidar do Cabelo no Inverno', slug: 'cuidar-cabelo-inverno', excerpt: 'Dicas essenciais para manter os fios hidratados e protegidos.', content: '# Como Cuidar do Cabelo no Inverno\n\nO frio e a baixa umidade ressecam os fios. Confira nossas dicas:\n\n## Hidratação Semanal\nUse máscaras hidratantes uma vez por semana.\n\n## Evite Água Muito Quente\nA água quente remove a oleosidade natural do couro cabeludo.\n\n## Proteção Térmica\nSempre use protetor antes do secador ou chapinha.\n\n## Óleos Vegetais\nAplicar óleo de argan ou coco nas pontas ajuda a selar a cutícula.', category: 'Cuidados', author: 'Fernanda Oliveira', isPublished: true, publishedAt: new Date('2025-01-20') },
    { id: 'blog_03', tenantId: TENANT_ID, title: 'Unhas de Inverno: As Cores da Estação', slug: 'unhas-inverno-cores', excerpt: 'Burgundy, nude escuro e verde militar são as estrelas da estação.', content: '# Unhas de Inverno\n\nAs cores escuras e sofisticadas dominam a estação mais fria do ano.\n\n## Burgundy\nO vermelho escuro é clássico e elegante.\n\n## Verde Militar\nPara quem ousa, o verde escuro é surpreendente.\n\n## Nude Escuro\nMinimalismo chique para o dia a dia.', category: 'Tendências', author: 'Juliana Costa', isPublished: true, publishedAt: new Date('2025-02-01') },
    { id: 'blog_04', tenantId: TENANT_ID, title: 'Barba: Guia Completo de Cuidados', slug: 'barba-guia-cuidados', excerpt: 'Do corte à hidratação, tudo que o homem precisa saber.', content: '# Guia Completo de Barba\n\n## Hidratação\nUse óleo de barba diariamente.\n\n## Modelagem\nVisite seu barbeiro a cada 15 dias.\n\n## Produtos\nInvista em balm e pomada de qualidade.', category: 'Barba', author: 'Carlos Mendes', isPublished: true, publishedAt: new Date('2025-02-05') },
    { id: 'blog_05', tenantId: TENANT_ID, title: 'Pele Glowing: Rotina de Skincare', slug: 'pele-glowing-skincare', excerpt: 'Passo a passo para uma pele iluminada e saudável.', content: '# Rotina de Skincare\n\n## Limpeza\nLimpe o rosto duas vezes ao dia.\n\n## Tônico\nEquilibre o pH da pele.\n\n## Sérum\nVitamina C pela manhã, retinol à noite.\n\n## Hidratante\nEssencial para manter a barreira cutânea.\n\n## Protetor Solar\nNunca pule! FPS 50+ é o ideal.', category: 'Estética', author: 'Roberto Lima', isPublished: true, publishedAt: new Date('2025-02-10') },
    { id: 'blog_06', tenantId: TENANT_ID, title: 'Rascunho: Novidades de Março', slug: 'novidades-marco-2025', excerpt: 'Em breve...', content: 'Rascunho de novidades', category: 'Novidades', author: 'Patrícia Santos', isPublished: false },
  ] });

  // Testimonials
  await prisma.testimonial.createMany({ data: [
    { id: 'test_01', tenantId: TENANT_ID, name: 'Camila Rodrigues', role: 'Cliente há 3 anos', content: 'O Studio Beauty mudou minha relação com cuidado pessoal! Profissionais incríveis e atendimento de primeiro mundo.', rating: 5 },
    { id: 'test_02', tenantId: TENANT_ID, name: 'Fernanda Dias', role: 'Cliente VIP', content: 'Sempre saio de lá me sentindo outra pessoa. A qualidade dos produtos e o carinho da equipe são incomparáveis.', rating: 5 },
    { id: 'test_03', tenantId: TENANT_ID, name: 'Beatriz Souza', role: 'Cliente há 2 anos', content: 'Amei a escova progressiva! Resultado natural e duradouro. Recomendo demais!', rating: 5 },
    { id: 'test_04', tenantId: TENANT_ID, name: 'Ricardo Gomes', role: 'Cliente regular', content: 'Melhor barbearia que já fui. Ambiente agradável e profissionais muito competentes.', rating: 4 },
    { id: 'test_05', tenantId: TENANT_ID, name: 'Isabela Martins', role: 'Cliente há 4 anos', content: 'As unhas em gel ficam perfeitas por semanas! Não troco por nada. Equipe maravilhosa!', rating: 5 },
  ] });

  console.log('✅ Database seeded successfully!');
}

main().catch(e => { console.error('Seed error:', e); process.exit(1); }).finally(() => prisma.$disconnect());
