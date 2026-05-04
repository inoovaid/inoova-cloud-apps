import { db } from './db';

const TENANT_ID = 'tenant_demo_01';
const BRANCH_ID = 'branch_main_01';

const PROFESSIONALS = [
  { id: 'pro_01', tenantId: TENANT_ID, branchId: BRANCH_ID, name: 'Ana Silva', specialty: 'Cabelereira', phone: '(11) 99887-6655', color: '#f472b6', isActive: true },
  { id: 'pro_02', tenantId: TENANT_ID, branchId: BRANCH_ID, name: 'Carlos Mendes', specialty: 'Barbeiro', phone: '(11) 99776-5544', color: '#60a5fa', isActive: true },
  { id: 'pro_03', tenantId: TENANT_ID, branchId: BRANCH_ID, name: 'Juliana Costa', specialty: 'Manicure / Pedicure', phone: '(11) 99665-4433', color: '#34d399', isActive: true },
  { id: 'pro_04', tenantId: TENANT_ID, branchId: BRANCH_ID, name: 'Roberto Lima', specialty: 'Esteticista', phone: '(11) 99554-3322', color: '#fbbf24', isActive: true },
  { id: 'pro_05', tenantId: TENANT_ID, branchId: BRANCH_ID, name: 'Fernanda Oliveira', specialty: 'Cabelereira Senior', phone: '(11) 99443-2211', color: '#a78bfa', isActive: true },
];

const SERVICES = [
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
];

const CLIENTS = [
  { id: 'cli_01', tenantId: TENANT_ID, name: 'Maria Santos', email: 'maria@email.com', phone: '(11) 99111-2222', birthday: '1988-03-15', source: 'Instagram', totalVisits: 24, totalSpent: 3200, avgTicket: 133, lastVisitAt: new Date('2025-01-20'), isActive: true },
  { id: 'cli_02', tenantId: TENANT_ID, name: 'João Pereira', email: 'joao@email.com', phone: '(11) 99222-3333', birthday: '1992-07-22', source: 'Indicação', totalVisits: 18, totalSpent: 2100, avgTicket: 117, lastVisitAt: new Date('2025-01-25'), isActive: true },
  { id: 'cli_03', tenantId: TENANT_ID, name: 'Camila Rodrigues', email: 'camila@email.com', phone: '(11) 99333-4444', birthday: '1995-11-08', source: 'Google', totalVisits: 42, totalSpent: 8500, avgTicket: 202, lastVisitAt: new Date('2025-01-28'), isActive: true },
  { id: 'cli_04', tenantId: TENANT_ID, name: 'Pedro Almeida', email: 'pedro@email.com', phone: '(11) 99444-5555', birthday: '1985-01-30', source: 'WhatsApp', totalVisits: 8, totalSpent: 720, avgTicket: 90, lastVisitAt: new Date('2024-11-10'), isActive: true },
  { id: 'cli_05', tenantId: TENANT_ID, name: 'Beatriz Souza', email: 'bia@email.com', phone: '(11) 99555-6666', birthday: '1990-05-12', source: 'Instagram', totalVisits: 36, totalSpent: 6200, avgTicket: 172, lastVisitAt: new Date('2025-02-01'), isActive: true },
  { id: 'cli_06', tenantId: TENANT_ID, name: 'Lucas Ferreira', email: 'lucas@email.com', phone: '(11) 99666-7777', birthday: '1998-09-25', source: 'Google', totalVisits: 3, totalSpent: 250, avgTicket: 83, lastVisitAt: new Date('2024-10-15'), isActive: true },
  { id: 'cli_07', tenantId: TENANT_ID, name: 'Isabela Martins', email: 'isa@email.com', phone: '(11) 99777-8888', birthday: '1987-12-03', source: 'Indicação', totalVisits: 30, totalSpent: 5400, avgTicket: 180, lastVisitAt: new Date('2025-01-15'), isActive: true },
  { id: 'cli_08', tenantId: TENANT_ID, name: 'Ricardo Gomes', email: 'ricardo@email.com', phone: '(11) 99888-9999', birthday: '1993-04-18', source: 'WhatsApp', totalVisits: 12, totalSpent: 1560, avgTicket: 130, lastVisitAt: new Date('2025-02-05'), isActive: true },
  { id: 'cli_09', tenantId: TENANT_ID, name: 'Amanda Lima', email: 'amanda@email.com', phone: '(11) 99999-0000', birthday: '1996-08-30', source: 'Instagram', totalVisits: 5, totalSpent: 380, avgTicket: 76, lastVisitAt: new Date('2024-09-20'), isActive: true },
  { id: 'cli_10', tenantId: TENANT_ID, name: 'Thiago Barbosa', email: 'thiago@email.com', phone: '(11) 99000-1111', birthday: '1991-02-14', source: 'Google', totalVisits: 15, totalSpent: 1800, avgTicket: 120, lastVisitAt: new Date('2025-01-30'), isActive: true },
  { id: 'cli_11', tenantId: TENANT_ID, name: 'Fernanda Dias', email: 'fer@email.com', phone: '(11) 99111-3333', birthday: '1989-06-21', source: 'Indicação', totalVisits: 50, totalSpent: 12000, avgTicket: 240, lastVisitAt: new Date('2025-02-10'), isActive: true },
  { id: 'cli_12', tenantId: TENANT_ID, name: 'Gabriel Costa', email: 'gabriel@email.com', phone: '(11) 99222-4444', birthday: '1994-10-05', source: 'WhatsApp', totalVisits: 2, totalSpent: 120, avgTicket: 60, lastVisitAt: new Date('2024-08-01'), isActive: true },
];

const TAGS = [
  { id: 'tag_01', tenantId: TENANT_ID, name: 'VIP', color: '#f59e0b', isAuto: true, rule: '{"type": "totalSpent", "min": 5000}' },
  { id: 'tag_02', tenantId: TENANT_ID, name: 'Inativo 60d', color: '#ef4444', isAuto: true, rule: '{"type": "inactive", "days": 60}' },
  { id: 'tag_03', tenantId: TENANT_ID, name: 'Alto Ticket', color: '#10b981', isAuto: true, rule: '{"type": "avgTicket", "min": 150}' },
  { id: 'tag_04', tenantId: TENANT_ID, name: 'Novo Cliente', color: '#3b82f6', isAuto: true, rule: '{"type": "totalVisits", "max": 3}' },
  { id: 'tag_05', tenantId: TENANT_ID, name: 'Frequente', color: '#8b5cf6', isAuto: true, rule: '{"type": "totalVisits", "min": 20}' },
  { id: 'tag_06', tenantId: TENANT_ID, name: 'Aniversariante', color: '#ec4899', isAuto: false, rule: null },
];

const PRODUCTS = [
  { id: 'prod_01', tenantId: TENANT_ID, name: 'Shampoo Hidratante 500ml', brand: 'L\'Oréal', category: 'Shampoo', sku: 'LOR-SH-500', price: 65, cost: 28, stock: 45, minStock: 10 },
  { id: 'prod_02', tenantId: TENANT_ID, name: 'Condicionador Reparador 500ml', brand: 'L\'Oréal', category: 'Condicionador', sku: 'LOR-CD-500', price: 70, cost: 30, stock: 38, minStock: 10 },
  { id: 'prod_03', tenantId: TENANT_ID, name: 'Tinta Absoluto N7', brand: 'Wella', category: 'Tinta', sku: 'WEL-AB-N7', price: 55, cost: 22, stock: 12, minStock: 5 },
  { id: 'prod_04', tenantId: TENANT_ID, name: 'Máscara Capilar 250g', brand: 'Kerastase', category: 'Tratamento', sku: 'KER-MS-250', price: 120, cost: 55, stock: 20, minStock: 5 },
  { id: 'prod_05', tenantId: TENANT_ID, name: 'Óleo Argan 60ml', brand: 'Moroccanoil', category: 'Finalizador', sku: 'MOR-OL-60', price: 95, cost: 42, stock: 15, minStock: 5 },
  { id: 'prod_06', tenantId: TENANT_ID, name: 'Esmalte Gel Vermelho', brand: 'Gelish', category: 'Esmalte', sku: 'GEL-VR-001', price: 35, cost: 12, stock: 50, minStock: 15 },
  { id: 'prod_07', tenantId: TENANT_ID, name: 'Pomada Modeladora 100g', brand: 'Schwarzkopf', category: 'Barba', sku: 'SCH-PM-100', price: 45, cost: 18, stock: 25, minStock: 8 },
  { id: 'prod_08', tenantId: TENANT_ID, name: 'Protetor Térmico 200ml', brand: 'Redken', category: 'Finalizador', sku: 'RED-PT-200', price: 85, cost: 38, stock: 3, minStock: 5 },
];

// Today's schedule (used for both appointment creation and service linking)
const todaySchedule = [
    { clientId: 'cli_05', professionalId: 'pro_01', startTime: '09:00', endTime: '10:00', serviceIds: ['srv_01', 'srv_05'], status: 'completed' },
    { clientId: 'cli_02', professionalId: 'pro_02', startTime: '09:00', endTime: '09:30', serviceIds: ['srv_02', 'srv_11'], status: 'completed' },
    { clientId: 'cli_03', professionalId: 'pro_05', startTime: '09:30', endTime: '12:30', serviceIds: ['srv_04', 'srv_05'], status: 'in_progress' },
    { clientId: 'cli_07', professionalId: 'pro_03', startTime: '10:00', endTime: '11:30', serviceIds: ['srv_07', 'srv_09'], status: 'in_progress' },
    { clientId: 'cli_08', professionalId: 'pro_01', startTime: '10:30', endTime: '12:30', serviceIds: ['srv_03'], status: 'confirmed' },
    { clientId: 'cli_10', professionalId: 'pro_02', startTime: '10:30', endTime: '11:00', serviceIds: ['srv_02'], status: 'confirmed' },
    { clientId: 'cli_01', professionalId: 'pro_04', startTime: '11:00', endTime: '12:00', serviceIds: ['srv_10', 'srv_12'], status: 'confirmed' },
    { clientId: 'cli_11', professionalId: 'pro_05', startTime: '13:00', endTime: '16:00', serviceIds: ['srv_06', 'srv_05'], status: 'scheduled' },
    { clientId: 'cli_04', professionalId: 'pro_03', startTime: '13:00', endTime: '14:30', serviceIds: ['srv_08', 'srv_09'], status: 'scheduled' },
    { clientId: 'cli_06', professionalId: 'pro_01', startTime: '14:00', endTime: '15:00', serviceIds: ['srv_01'], status: 'scheduled' },
    { clientId: 'cli_09', professionalId: 'pro_04', startTime: '14:00', endTime: '15:00', serviceIds: ['srv_10'], status: 'scheduled' },
    { clientId: 'cli_12', professionalId: 'pro_02', startTime: '15:00', endTime: '15:30', serviceIds: ['srv_02', 'srv_11'], status: 'scheduled' },
];

// Generate appointments for today and this week
function generateAppointments() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const appointments: any[] = [];

  todaySchedule.forEach((appt, i) => {
    appointments.push({
      id: `appt_today_${String(i + 1).padStart(2, '0')}`,
      tenantId: TENANT_ID,
      branchId: BRANCH_ID,
      clientId: appt.clientId,
      professionalId: appt.professionalId,
      date: today,
      startTime: appt.startTime,
      endTime: appt.endTime,
      status: appt.status,
      reminderSent24h: appt.status !== 'scheduled',
      reminderSent1h: appt.status === 'completed' || appt.status === 'in_progress',
    });
  });

  // Generate past appointments for historical data
  for (let dayOffset = 1; dayOffset <= 30; dayOffset++) {
    const pastDate = new Date(today);
    pastDate.setDate(pastDate.getDate() - dayOffset);

    const numAppts = Math.floor(Math.random() * 6) + 4;
    const usedSlots: string[] = [];
    const profs = ['pro_01', 'pro_02', 'pro_03', 'pro_04', 'pro_05'];
    const clis = ['cli_01', 'cli_02', 'cli_03', 'cli_04', 'cli_05', 'cli_06', 'cli_07', 'cli_08', 'cli_09', 'cli_10', 'cli_11', 'cli_12'];

    for (let j = 0; j < numAppts; j++) {
      const hour = Math.floor(Math.random() * 9) + 8; // 8-17
      const min = Math.random() > 0.5 ? '00' : '30';
      const start = `${String(hour).padStart(2, '0')}:${min}`;
      const endHour = hour + (Math.random() > 0.5 ? 1 : 2);
      const end = `${String(endHour).padStart(2, '0')}:${min}`;
      const profId = profs[Math.floor(Math.random() * profs.length)];
      const cliId = clis[Math.floor(Math.random() * clis.length)];

      appointments.push({
        id: `appt_past_${dayOffset}_${j}`,
        tenantId: TENANT_ID,
        branchId: BRANCH_ID,
        clientId: cliId,
        professionalId: profId,
        date: pastDate,
        startTime: start,
        endTime: end,
        status: 'completed',
        reminderSent24h: true,
        reminderSent1h: true,
      });
    }
  }

  return appointments;
}

const AUTOMATIONS = [
  { id: 'auto_01', tenantId: TENANT_ID, name: 'Lembrete 24h antes', type: 'reminder_24h', channel: 'whatsapp', template: 'Olá {client_name}! Lembrete: seu agendamento é amanhà às {time} com {professional_name}.', isActive: true },
  { id: 'auto_02', tenantId: TENANT_ID, name: 'Lembrete 1h antes', type: 'reminder_1h', channel: 'whatsapp', template: '{client_name}, seu horário com {professional_name} é em 1h! Te esperamos.', isActive: true },
  { id: 'auto_03', tenantId: TENANT_ID, name: 'Win-back Inativos 60d', type: 'win_back', channel: 'whatsapp', template: 'Sentimos sua falta, {client_name}! 💇‍♀️ Volte com 15% OFF: use o cupom VOLTA15. Válido por 7 dias!', isActive: true, triggerRule: '{"inactiveDays": 60}' },
  { id: 'auto_04', tenantId: TENANT_ID, name: 'Feliz Aniversário!', type: 'birthday', channel: 'whatsapp', template: 'Feliz aniversário, {client_name}! 🎂 Ganhe 20% OFF em qualquer serviço esta semana. Agende já!', isActive: true },
  { id: 'auto_05', tenantId: TENANT_ID, name: 'Pedido de Avaliação', type: 'review_request', channel: 'whatsapp', template: 'Obrigado pela visita, {client_name}! ⭐ Avalie-nos no Google: https://g.page/r/review_link', isActive: true },
  { id: 'auto_06', tenantId: TENANT_ID, name: 'Alerta Estoque Baixo', type: 'stock_alert', channel: 'email', template: 'Produto {product_name} está com estoque baixo: {stock} unidades.', isActive: true, triggerRule: '{"minStock": true}' },
];

const COMMISSION_RULES = [
  { id: 'comm_01', tenantId: TENANT_ID, type: 'service', serviceCategory: 'Cabelo', percent: 60 },
  { id: 'comm_02', tenantId: TENANT_ID, type: 'service', serviceCategory: 'Unhas', percent: 50 },
  { id: 'comm_03', tenantId: TENANT_ID, type: 'service', serviceCategory: 'Estética', percent: 55 },
  { id: 'comm_04', tenantId: TENANT_ID, type: 'product', serviceCategory: null, percent: 40 },
];

export async function seedDatabase() {
  // Check if already seeded
  const existing = await db.tenant.findFirst({ where: { id: TENANT_ID } });
  if (existing) {
    return { message: 'Database already seeded', tenantId: TENANT_ID };
  }

  // Create tenant
  await db.tenant.create({
    data: {
      id: TENANT_ID,
      name: 'Studio Beauty São Bento',
      slug: 'saobento',
      plan: 'pro',
      phone: '(11) 3456-7890',
      email: 'contato@studiobeauty.com.br',
      address: 'Rua Augusta, 1200 - Consolação',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01305-100',
      timezone: 'America/Sao_Paulo',
    },
  });

  // Create branch
  await db.branch.create({
    data: {
      id: BRANCH_ID,
      tenantId: TENANT_ID,
      name: 'Matriz - Consolação',
      address: 'Rua Augusta, 1200 - Consolação',
      phone: '(11) 3456-7890',
    },
  });

  // Create users
  await db.user.createMany({
    data: [
      { id: 'user_01', tenantId: TENANT_ID, email: 'admin@studiobeauty.com.br', name: 'Patrícia Santos', role: 'owner', phone: '(11) 99999-0001' },
      { id: 'user_02', tenantId: TENANT_ID, email: 'gerente@studiobeauty.com.br', name: 'Marcos Oliveira', role: 'manager', phone: '(11) 99999-0002' },
      { id: 'user_03', tenantId: TENANT_ID, email: 'recepcao@studiobeauty.com.br', name: 'Luciana Lima', role: 'receptionist', phone: '(11) 99999-0003' },
    ],
  });

  // Create professionals
  await db.professional.createMany({ data: PROFESSIONALS });

  // Create services
  await db.service.createMany({ data: SERVICES });

  // Create clients
  await db.client.createMany({ data: CLIENTS.map(c => ({
    ...c,
    birthday: c.birthday ? new Date(c.birthday) : null,
    lastVisitAt: c.lastVisitAt,
  })) });

  // Create tags
  await db.clientTag.createMany({ data: TAGS });

  // Assign tags to clients
  const tagAssignments = [
    { clientId: 'cli_03', tagId: 'tag_01' }, // VIP
    { clientId: 'cli_05', tagId: 'tag_01' }, // VIP
    { clientId: 'cli_07', tagId: 'tag_01' }, // VIP
    { clientId: 'cli_11', tagId: 'tag_01' }, // VIP
    { clientId: 'cli_04', tagId: 'tag_02' }, // Inativo 60d
    { clientId: 'cli_06', tagId: 'tag_02' }, // Inativo 60d
    { clientId: 'cli_09', tagId: 'tag_02' }, // Inativo 60d
    { clientId: 'cli_12', tagId: 'tag_02' }, // Inativo 60d
    { clientId: 'cli_03', tagId: 'tag_03' }, // Alto Ticket
    { clientId: 'cli_05', tagId: 'tag_03' }, // Alto Ticket
    { clientId: 'cli_07', tagId: 'tag_03' }, // Alto Ticket
    { clientId: 'cli_11', tagId: 'tag_03' }, // Alto Ticket
    { clientId: 'cli_06', tagId: 'tag_04' }, // Novo Cliente
    { clientId: 'cli_12', tagId: 'tag_04' }, // Novo Cliente
    { clientId: 'cli_01', tagId: 'tag_05' }, // Frequente
    { clientId: 'cli_03', tagId: 'tag_05' }, // Frequente
    { clientId: 'cli_05', tagId: 'tag_05' }, // Frequente
    { clientId: 'cli_07', tagId: 'tag_05' }, // Frequente
    { clientId: 'cli_11', tagId: 'tag_05' }, // Frequente
  ];
  await db.clientTagAssignment.createMany({ data: tagAssignments });

  // Create products
  await db.product.createMany({ data: PRODUCTS });

  // Create appointments
  const appointments = generateAppointments();
  for (const appt of appointments) {
    await db.appointment.create({ data: appt });
  }

  // Create appointment-service relations for today's appointments
  const apptServices: any[] = [];
  const todayAppts = appointments.filter(a => a.id.startsWith('appt_today_'));
  for (const appt of todayAppts) {
    const schedule = todaySchedule.find(s => s.clientId === appt.clientId && s.startTime === appt.startTime);
    if (schedule) {
      schedule.serviceIds.forEach((srvId, i) => {
        const srv = SERVICES.find(s => s.id === srvId);
        if (srv) {
          apptServices.push({
            appointmentId: appt.id,
            serviceId: srvId,
            price: srv.price,
            duration: srv.duration,
          });
        }
      });
    }
  }
  if (apptServices.length > 0) {
    await db.appointmentService.createMany({ data: apptServices });
  }

  // Create automations
  await db.automation.createMany({ data: AUTOMATIONS });

  // Create commission rules
  await db.commissionRule.createMany({ data: COMMISSION_RULES });

  // Create some sales (historical)
  const salesData = [];
  for (let i = 1; i <= 30; i++) {
    const dayDate = new Date();
    dayDate.setDate(dayDate.getDate() - (30 - i));
    const numSales = Math.floor(Math.random() * 5) + 2;
    for (let j = 0; j < numSales; j++) {
      const cliIdx = Math.floor(Math.random() * CLIENTS.length);
      const proIdx = Math.floor(Math.random() * PROFESSIONALS.length);
      const total = Math.floor(Math.random() * 200) + 50;
      salesData.push({
        id: `sale_${i}_${j}`,
        tenantId: TENANT_ID,
        branchId: BRANCH_ID,
        clientId: CLIENTS[cliIdx].id,
        professionalId: PROFESSIONALS[proIdx].id,
        total,
        discount: Math.random() > 0.7 ? Math.floor(total * 0.1) : 0,
        paymentMethod: ['cash', 'credit', 'debit', 'pix'][Math.floor(Math.random() * 4)],
        status: 'completed',
        createdAt: dayDate,
      });
    }
  }
  await db.sale.createMany({ data: salesData });

  // Create smart suggestions
  await db.smartSuggestion.createMany({
    data: [
      { id: 'sug_01', tenantId: TENANT_ID, type: 'inactive_vip', priority: 'urgent', title: 'Cliente VIP inativa há 60+ dias', description: 'Pedro Almeida (VIP) não visita o salão desde Nov/2024. Recomendamos contato imediato com oferta personalizada.', action: 'send_whatsapp', clientId: 'cli_04', metadata: '{"inactiveDays": 82, "totalSpent": 720}' },
      { id: 'sug_02', tenantId: TENANT_ID, type: 'inactive_vip', priority: 'high', title: 'Cliente inativa há 5 meses', description: 'Amanda Lima não aparece desde Set/2024. Envie cupom de 15% OFF para reativação.', action: 'apply_coupon', clientId: 'cli_09', metadata: '{"inactiveDays": 145, "totalSpent": 380}' },
      { id: 'sug_03', tenantId: TENANT_ID, type: 'birthday', priority: 'medium', title: 'Aniversário próximo', description: 'Pedro Almeida faz aniversário em 30/01. Envie mensagem com oferta especial.', action: 'send_whatsapp', clientId: 'cli_04', metadata: '{"birthday": "01-30", "daysUntil": 5}' },
      { id: 'sug_04', tenantId: TENANT_ID, type: 'high_value', priority: 'medium', title: 'Oportunidade de Upsell', description: 'Fernanda Dias gastou R$ 12.000 no total. Considere oferecer pacote VIP Premium.', action: 'call', clientId: 'cli_11', metadata: '{"totalSpent": 12000, "avgTicket": 240}' },
      { id: 'sug_05', tenantId: TENANT_ID, type: 'stock_alert', priority: 'urgent', title: 'Estoque crítico: Protetor Térmico', description: 'Protetor Térmico Redken está com apenas 3 unidades. Mínimo recomendado: 5.', action: 'reorder', metadata: '{"productId": "prod_08", "stock": 3, "minStock": 5}' },
      { id: 'sug_06', tenantId: TENANT_ID, type: 'win_back', priority: 'high', title: 'Reativação: Lucas Ferreira', description: 'Cliente desde Ago/2024, apenas 2 visitas. Envie campanha de boas-vindas estendida.', action: 'send_whatsapp', clientId: 'cli_12', metadata: '{"totalVisits": 2, "inactiveDays": 190}' },
    ],
  });

  // Create blog posts
  const BLOG_POSTS = [
    {
      id: 'blog_01', tenantId: TENANT_ID, title: '5 Tendências de Cabelo para 2025', slug: '5-tendencias-cabelo-2025',
      excerpt: 'Descubra as principais tendências de cabelo que vão dominar o ano de 2025. Do natural ao ousado, há opção para todos os estilos.',
      content: '# 5 Tendências de Cabelo para 2025\n\nO ano de 2025 promete ser incrível para quem ama cuidar dos cabelos! Confira as principais tendências:\n\n## 1. Bob Curtinho\nO corte bob curtinho continua em alta, com versões mais modernas e texturizadas.\n\n## 2. Natural é Tudo\nCabelos naturais, cacheados e crespos ganham cada vez mais destaque.\n\n## 3. Mechas Babylight\nIluminação sutil e natural que valoriza qualquer tom de pele.\n\n## 4. Cores Vibrantes\nRosa, azul e violeta invadem os salões com muito estilo.\n\n## 5. Corte Long Bob\nO LOB continua sendo o queridinho das brasileiras!',
      category: 'Tendências', author: 'Ana Silva', isPublished: true, publishedAt: new Date('2025-01-15'),
    },
    {
      id: 'blog_02', tenantId: TENANT_ID, title: 'Como Cuidar dos Cabelos no Verão', slug: 'cuidar-cabelos-verao',
      excerpt: 'Protetor solar para cabelo, hidratação e outros cuidados essenciais para manter os fios saudáveis durante o verão.',
      content: '# Como Cuidar dos Cabelos no Verão\n\nO verão é a estação mais desafiadora para os cabelos. Sol, mar e piscina podem causar danos irreversíveis.\n\n## Dicas Essenciais\n\n- Use protetor solar capilar todos os dias\n- Hidrate semanalmente com máscaras nutritivas\n- Evite lavar com água muito quente\n- Use leave-in com proteção térmica\n- Faça cronograma capilar completo',
      category: 'Cuidados', author: 'Juliana Costa', isPublished: true, publishedAt: new Date('2025-01-20'),
    },
    {
      id: 'blog_03', tenantId: TENANT_ID, title: 'Unhas em Gel: Tudo o Que Você Precisa Saber', slug: 'unhas-em-gel-guia-completo',
      excerpt: 'Guia completo sobre unhas em gel: vantagens, cuidados, duração e como escolher o melhor profissional.',
      content: '# Unhas em Gel: Guia Completo\n\nAs unhas em gel são uma das técnicas mais populares nos salões brasileiros.\n\n## Vantagens\n- Duração de 3 a 4 semanas\n- Aspecto natural e brilhante\n- Diversas opções de cores e designs\n\n## Cuidados\n- Não use as unhas como ferramenta\n- Hidrate as cutículas diariamente\n- Retoque a cada 15 dias\n\n## Como Escolher o Profissional\nSempre escolha profissionais certificados e salões que sigam normas sanitárias.',
      category: 'Dicas', author: 'Juliana Costa', isPublished: true, publishedAt: new Date('2025-02-01'),
    },
    {
      id: 'blog_04', tenantId: TENANT_ID, title: 'Barba: Tendências Masculinas 2025', slug: 'barba-tendencias-masculinas-2025',
      excerpt: 'Do barbear clássico ao moderno, confira as tendências masculinas para barba e cabelo em 2025.',
      content: '# Barba: Tendências Masculinas 2025\n\nOs homens estão cada vez mais cuidadosos com a aparência. Confira as tendências!\n\n## Barba Natural\nA barba natural bem cuidada é o grande destaque.\n\n## Barba Degradê\nO degradê na barba continua em alta, com transições suaves.\n\n## Bigode Estilizado\nO bigode está de volta com força total!\n\n## Cuidados Essenciais\n- Hidrate a barba diariamente\n- Use óleo específico para barba\n- Apare regularmente para manter o formato',
      category: 'Tendências', author: 'Carlos Mendes', isPublished: true, publishedAt: new Date('2025-02-05'),
    },
    {
      id: 'blog_05', tenantId: TENANT_ID, title: 'Skincare: Rotina Básica para Iniciantes', slug: 'skincare-rotina-basica-iniciantes',
      excerpt: 'Aprenda a montar sua rotina de skincare com produtos essenciais e dicas práticas para uma pele radiante.',
      content: '# Skincare: Rotina Básica para Iniciantes\n\nMontar uma rotina de skincare não precisa ser complicado!\n\n## Passos Essenciais\n\n1. **Limpeza**: Lave o rosto com sabonete adequado\n2. **Tônico**: Equilibra o pH da pele\n3. **Sérum**: Tratamento específico\n4. **Hidratação**: Mantém a pele nutrida\n5. **Protetor Solar**: Nunca esqueça!\n\n## Dicas Extras\n- Beba muita água\n- Durma bem\n- Evite tocar no rosto\n- Troque a fronha do travesseiro frequentemente',
      category: 'Cuidados', author: 'Roberto Lima', isPublished: true, publishedAt: new Date('2025-02-10'),
    },
    {
      id: 'blog_06', tenantId: TENANT_ID, title: 'Escova Progressiva: Mito e Verdade', slug: 'escova-progressiva-mito-verdade',
      excerpt: 'Desvende os mitos e verdades sobre a escova progressiva e saiba se é o tratamento ideal para seu cabelo.',
      content: '# Escova Progressiva: Mito e Verdade\n\nA escova progressiva é um dos tratamentos mais procurados nos salões.\n\n## Mitos\n- "Estraga o cabelo" - Falso, quando feita corretamente\n- "Não pode lavar por 3 dias" - Depende do produto\n\n## Verdades\n- Reduz o volume e alisa os fios\n- Dura de 2 a 4 meses\n- Precisa de manutenção regular\n\n## Quem Pode Fazer?\nPraticamente todos os tipos de cabelo podem se beneficiar, mas consulte sempre um profissional.',
      category: 'Dicas', author: 'Ana Silva', isPublished: false,
    },
  ];

  for (const post of BLOG_POSTS) {
    await db.blogPost.create({ data: post });
  }

  // Create testimonials
  const TESTIMONIALS = [
    { id: 'test_01', tenantId: TENANT_ID, name: 'Camila Rodrigues', role: 'Cliente há 3 anos', content: 'Melhor salão da região! A Ana é incrível, sempre sai de lá me sentindo uma nova pessoa. O atendimento é impecável e o ambiente é super aconchegante.', rating: 5, isActive: true },
    { id: 'test_02', tenantId: TENANT_ID, name: 'Fernanda Dias', role: 'Cliente VIP', content: 'Sou cliente há mais de 2 anos e não troco por nada. Os profissionais são extremamente capacitados e o sistema de agendamento online facilita muito minha vida.', rating: 5, isActive: true },
    { id: 'test_03', tenantId: TENANT_ID, name: 'Beatriz Souza', role: 'Cliente há 2 anos', content: 'Adoro o programa de fidelidade! A cada visita acumulo pontos e consigo descontos incríveis. Os produtos que usam são de primeira qualidade.', rating: 5, isActive: true },
    { id: 'test_04', tenantId: TENANT_ID, name: 'Maria Santos', role: 'Cliente frequente', content: 'A limpeza de pele com o Roberto é sensacional! Minha pele nunca esteve tão bonita. Recomendo de olhos fechados para quem cuida da pele.', rating: 4, isActive: true },
    { id: 'test_05', tenantId: TENANT_ID, name: 'João Pereira', role: 'Cliente há 1 ano', content: 'Como homem, sempre tive dificuldade de encontrar um bom barbeiro. O Carlos é excelente! Ambiente muito agradável e profissional.', rating: 5, isActive: true },
    { id: 'test_06', tenantId: TENANT_ID, name: 'Isabela Martins', role: 'Cliente há 4 anos', content: 'Faço mechas com a Fernanda e sempre ficam perfeitas! Ela entende exatamente o que eu quero. O WhatsApp integrado é super prático para confirmar horários.', rating: 5, isActive: true },
  ];

  for (const t of TESTIMONIALS) {
    await db.testimonial.create({ data: t });
  }

  return { message: 'Database seeded successfully', tenantId: TENANT_ID };
}
