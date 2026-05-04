// ============================================================
// BeautyPro CRM — seed.js
// Período: Maio 2025 → Abril 2026
// ============================================================

const { PrismaClient } = require('@prisma/client');
const { randomUUID } = require('crypto');

const prisma = new PrismaClient();

// ─── Helpers ─────────────────────────────────────────────────

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function formatTime(totalMinutes) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// Seasonal multiplier: more movement in Dec/Jan/Jun/Jul
function seasonalFactor(month) {
  const factors = {
    0: 0.8,  // Jan (slow post-festivities)
    1: 0.9,  // Feb
    2: 1.0,  // Mar
    3: 1.0,  // Apr
    4: 1.1,  // May (Dia das Mães)
    5: 1.2,  // Jun (festas juninas)
    6: 1.1,  // Jul (férias)
    7: 0.9,  // Aug
    8: 1.0,  // Sep
    9: 1.0,  // Oct
    10: 1.1, // Nov (Black Friday / pré-fim de ano)
    11: 1.4, // Dec (festas de fim de ano)
  };
  return factors[month] ?? 1.0;
}

// ─── Static Data ──────────────────────────────────────────────

const TIME_SLOTS_MINUTES = [
  9 * 60, 9 * 60 + 30, 10 * 60, 10 * 60 + 30,
  11 * 60, 11 * 60 + 30, 14 * 60, 14 * 60 + 30,
  15 * 60, 15 * 60 + 30, 16 * 60, 16 * 60 + 30,
  17 * 60, 17 * 60 + 30,
];

const APPOINTMENT_STATUSES = [
  'completed', 'completed', 'completed', 'completed', 'completed',
  'confirmed', 'cancelled', 'no_show',
];

const PAYMENT_METHODS = ['pix', 'pix', 'pix', 'credit', 'credit', 'debit', 'cash'];

const CANCELLATION_REASONS = [
  'Emergência pessoal', 'Doença', 'Viagem imprevista',
  'Mudança de planos', 'Problema de saúde', 'Compromisso de trabalho',
];

// ─── Main ─────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Iniciando seed BeautyPro CRM...\n');

  // ── Cleanup (ordem inversa de FKs) ──────────────────────────
  console.log('🗑️  Limpando dados anteriores...');
  await prisma.automationLog.deleteMany();
  await prisma.smartSuggestion.deleteMany();
  await prisma.financialRecord.deleteMany();
  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.appointmentService.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.clientTagAssignment.deleteMany();
  await prisma.clientTag.deleteMany();
  await prisma.client.deleteMany();
  await prisma.commissionRule.deleteMany();
  await prisma.automation.deleteMany();
  await prisma.testimonial.deleteMany();
  await prisma.blogPost.deleteMany();
  await prisma.product.deleteMany();
  await prisma.service.deleteMany();
  await prisma.professional.deleteMany();
  await prisma.user.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.tenant.deleteMany();
  console.log('✅ Dados anteriores removidos.\n');

  // ══════════════════════════════════════════════════════════════
  // TENANT
  // ══════════════════════════════════════════════════════════════
  const tenant = await prisma.tenant.create({
    data: {
      name: 'BeautyPro Salão',
      slug: 'beautypro',
      plan: 'pro',
      phone: '(11) 3000-9000',
      email: 'contato@beautyprosalon.com.br',
      address: 'Rua das Flores, 123',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01310-100',
      timezone: 'America/Sao_Paulo',
      isActive: true,
    },
  });
  console.log(`✅ Tenant: ${tenant.name}`);

  // ══════════════════════════════════════════════════════════════
  // BRANCHES
  // ══════════════════════════════════════════════════════════════
  const [branch1, branch2] = await Promise.all([
    prisma.branch.create({
      data: {
        tenantId: tenant.id,
        name: 'Unidade Jardins',
        address: 'Rua das Flores, 123 — Jardins, São Paulo',
        phone: '(11) 3333-0001',
        isActive: true,
      },
    }),
    prisma.branch.create({
      data: {
        tenantId: tenant.id,
        name: 'Unidade Moema',
        address: 'Av. Ibirapuera, 456 — Moema, São Paulo',
        phone: '(11) 3333-0002',
        isActive: true,
      },
    }),
  ]);
  console.log('✅ Unidades criadas: Jardins + Moema');

  // ══════════════════════════════════════════════════════════════
  // USERS
  // ══════════════════════════════════════════════════════════════
  await Promise.all([
    prisma.user.create({ data: { tenantId: tenant.id, email: 'dono@beautypro.com',      name: 'Rodrigo Mendes',  role: 'owner',        phone: '(11) 99900-0001', password: 'demo123', isActive: true } }),
    prisma.user.create({ data: { tenantId: tenant.id, email: 'gerente@beautypro.com',   name: 'Fernanda Lima',   role: 'manager',      phone: '(11) 99900-0002', password: 'demo123', isActive: true } }),
    prisma.user.create({ data: { tenantId: tenant.id, email: 'recepcao@beautypro.com',  name: 'Camila Souza',    role: 'receptionist', phone: '(11) 99900-0003', password: 'demo123', isActive: true } }),
    prisma.user.create({ data: { tenantId: tenant.id, email: 'julia@beautypro.com',     name: 'Júlia Costa',     role: 'professional', phone: '(11) 99900-0004', password: 'demo123', isActive: true } }),
    prisma.user.create({ data: { tenantId: tenant.id, email: 'marcos@beautypro.com',    name: 'Marcos Barbosa',  role: 'professional', phone: '(11) 99900-0005', password: 'demo123', isActive: true } }),
    prisma.user.create({ data: { tenantId: tenant.id, email: 'aline@beautypro.com',     name: 'Aline Ferreira',  role: 'professional', phone: '(11) 99900-0006', password: 'demo123', isActive: true } }),
    prisma.user.create({ data: { tenantId: tenant.id, email: 'patricia@beautypro.com',  name: 'Patricia Rocha',  role: 'professional', phone: '(11) 99900-0007', password: 'demo123', isActive: true } }),
  ]);
  console.log('✅ Usuários criados');

  // ══════════════════════════════════════════════════════════════
  // PROFESSIONALS
  // ══════════════════════════════════════════════════════════════
  const professionalsInput = [
    { name: 'Júlia Costa',     email: 'julia@beautypro.com',    specialty: 'Cabelereira',  color: '#f472b6', phone: '(11) 97001-0001', branchId: branch1.id },
    { name: 'Marcos Barbosa',  email: 'marcos@beautypro.com',   specialty: 'Barbeiro',     color: '#60a5fa', phone: '(11) 97001-0002', branchId: branch1.id },
    { name: 'Aline Ferreira',  email: 'aline@beautypro.com',    specialty: 'Manicure',     color: '#34d399', phone: '(11) 97001-0003', branchId: branch1.id },
    { name: 'Patricia Rocha',  email: 'patricia@beautypro.com', specialty: 'Esteticista',  color: '#fbbf24', phone: '(11) 97001-0004', branchId: branch2.id },
    { name: 'Roberto Silva',   email: 'roberto@beautypro.com',  specialty: 'Cabelereiro',  color: '#a78bfa', phone: '(11) 97001-0005', branchId: branch2.id },
    { name: 'Beatriz Alves',   email: 'beatriz@beautypro.com',  specialty: 'Sobrancelha',  color: '#fb923c', phone: '(11) 97001-0006', branchId: branch2.id },
    { name: 'Sandra Melo',     email: 'sandra@beautypro.com',   specialty: 'Manicure',     color: '#e879f9', phone: '(11) 97001-0007', branchId: branch2.id },
  ];

  const professionals = await Promise.all(
    professionalsInput.map(p =>
      prisma.professional.create({
        data: {
          tenantId: tenant.id,
          branchId: p.branchId,
          name: p.name,
          email: p.email,
          specialty: p.specialty,
          color: p.color,
          phone: p.phone,
          bio: `Especialista em ${p.specialty} com mais de 5 anos de experiência.`,
          isActive: true,
        },
      })
    )
  );
  console.log(`✅ Profissionais criados: ${professionals.length}`);

  // ══════════════════════════════════════════════════════════════
  // SERVICES
  // ══════════════════════════════════════════════════════════════
  const servicesInput = [
    { name: 'Corte Feminino',              category: 'Cabelo',      duration: 60,  price: 120,  cost: 20  },
    { name: 'Corte Masculino',             category: 'Cabelo',      duration: 30,  price: 60,   cost: 10  },
    { name: 'Coloração Completa',          category: 'Cabelo',      duration: 180, price: 350,  cost: 80  },
    { name: 'Mechas / Luzes',              category: 'Cabelo',      duration: 150, price: 280,  cost: 60  },
    { name: 'Hidratação Capilar',          category: 'Cabelo',      duration: 60,  price: 100,  cost: 25  },
    { name: 'Escova Progressiva',          category: 'Cabelo',      duration: 180, price: 320,  cost: 70  },
    { name: 'Escova Simples',              category: 'Cabelo',      duration: 60,  price: 80,   cost: 15  },
    { name: 'Manicure',                    category: 'Unhas',       duration: 45,  price: 50,   cost: 10  },
    { name: 'Pedicure',                    category: 'Unhas',       duration: 60,  price: 60,   cost: 12  },
    { name: 'Manicure + Pedicure',         category: 'Unhas',       duration: 90,  price: 100,  cost: 20  },
    { name: 'Spa dos Pés',                 category: 'Unhas',       duration: 60,  price: 80,   cost: 15  },
    { name: 'Alongamento de Unhas',        category: 'Unhas',       duration: 120, price: 180,  cost: 35  },
    { name: 'Limpeza de Pele',             category: 'Estética',    duration: 60,  price: 150,  cost: 30  },
    { name: 'Depilação Corpo Inteiro',     category: 'Estética',    duration: 90,  price: 200,  cost: 40  },
    { name: 'Design de Sobrancelha',       category: 'Sobrancelha', duration: 30,  price: 45,   cost: 8   },
    { name: 'Micropigmentação Sobrancelha',category: 'Sobrancelha', duration: 120, price: 600,  cost: 100 },
    { name: 'Barba',                       category: 'Barba',       duration: 30,  price: 45,   cost: 8   },
    { name: 'Corte + Barba',              category: 'Barba',       duration: 60,  price: 95,   cost: 18  },
    { name: 'Botox Capilar',              category: 'Cabelo',      duration: 120, price: 250,  cost: 60  },
    { name: 'Penteado para Festas',       category: 'Cabelo',      duration: 90,  price: 180,  cost: 30  },
  ];

  const services = await Promise.all(
    servicesInput.map(s =>
      prisma.service.create({
        data: { tenantId: tenant.id, ...s, isActive: true },
      })
    )
  );
  console.log(`✅ Serviços criados: ${services.length}`);

  // ══════════════════════════════════════════════════════════════
  // PRODUCTS
  // ══════════════════════════════════════════════════════════════
  const productsInput = [
    { name: 'Shampoo Hidratante 300ml',         brand: 'TresEmmé',      category: 'Shampoo',      sku: 'SH001', price: 45,  cost: 22, stock: 30, minStock: 8  },
    { name: 'Condicionador Reconstrutor 300ml', brand: 'TresEmmé',      category: 'Condicionador',sku: 'CO001', price: 45,  cost: 22, stock: 25, minStock: 8  },
    { name: 'Máscara de Hidratação 500g',       brand: 'Cadiveu',       category: 'Tratamento',   sku: 'TR001', price: 89,  cost: 42, stock: 20, minStock: 5  },
    { name: 'Óleo de Argan 60ml',               brand: 'Phytogen',      category: 'Tratamento',   sku: 'TR002', price: 120, cost: 55, stock: 15, minStock: 4  },
    { name: 'Tinta Louro Claro 60g',            brand: 'Wella',         category: 'Tinta',        sku: 'TN001', price: 35,  cost: 15, stock: 50, minStock: 10 },
    { name: 'Tinta Castanho Médio 60g',         brand: 'Wella',         category: 'Tinta',        sku: 'TN002', price: 35,  cost: 15, stock: 50, minStock: 10 },
    { name: 'Tinta Preto Natural 60g',          brand: 'Wella',         category: 'Tinta',        sku: 'TN003', price: 35,  cost: 15, stock: 40, minStock: 10 },
    { name: 'Tinta Ruivo Intenso 60g',          brand: 'Igora',         category: 'Tinta',        sku: 'TN004', price: 38,  cost: 17, stock: 30, minStock: 8  },
    { name: 'Água Oxigenada 20 vol 900ml',       brand: 'Inoar',        category: 'Tinta',        sku: 'TN010', price: 28,  cost: 12, stock: 30, minStock: 8  },
    { name: 'Esmalte Vermelho Clássico',         brand: 'Risqué',       category: 'Esmalte',      sku: 'ES001', price: 12,  cost: 5,  stock: 60, minStock: 15 },
    { name: 'Esmalte Rosa Ballet',               brand: 'Risqué',       category: 'Esmalte',      sku: 'ES002', price: 12,  cost: 5,  stock: 60, minStock: 15 },
    { name: 'Esmalte Nude Perfeito',             brand: 'Impala',       category: 'Esmalte',      sku: 'ES003', price: 12,  cost: 5,  stock: 55, minStock: 15 },
    { name: 'Esmalte Azul Marinho',              brand: 'Impala',       category: 'Esmalte',      sku: 'ES004', price: 12,  cost: 5,  stock: 45, minStock: 10 },
    { name: 'Base Fortalecedora para Unhas',     brand: 'Impala',       category: 'Esmalte',      sku: 'ES010', price: 15,  cost: 6,  stock: 40, minStock: 10 },
    { name: 'Removedor de Esmalte 100ml',        brand: 'Kolene',       category: 'Unhas',        sku: 'UN001', price: 8,   cost: 3,  stock: 50, minStock: 10 },
    { name: 'Protetor Solar FPS 50 200ml',       brand: 'Sundown',      category: 'Estética',     sku: 'ET001', price: 65,  cost: 30, stock: 20, minStock: 5  },
    { name: 'Sérum Anti-Idade 30ml',             brand: 'Nivea',        category: 'Estética',     sku: 'ET002', price: 95,  cost: 45, stock: 15, minStock: 4  },
    { name: 'Cera para Depilação 400g',          brand: 'Depileve',     category: 'Depilação',    sku: 'DE001', price: 55,  cost: 25, stock: 25, minStock: 5  },
    { name: 'Gel para Barba 200ml',              brand: 'Gillette',     category: 'Barba',        sku: 'BA001', price: 30,  cost: 12, stock: 20, minStock: 5  },
    { name: 'Pomada Modeladora 120g',            brand: 'Red Iron',     category: 'Barba',        sku: 'BA002', price: 45,  cost: 20, stock: 18, minStock: 5  },
    { name: 'Leave-in Reparador 200ml',          brand: 'Elseve',       category: 'Tratamento',   sku: 'TR003', price: 35,  cost: 15, stock: 30, minStock: 8  },
    { name: 'Finalizador Capilar 150ml',         brand: 'Kérastase',    category: 'Tratamento',   sku: 'TR004', price: 120, cost: 55, stock: 12, minStock: 4  },
    { name: 'Escova de Cabelo Profissional',     brand: 'Denman',       category: 'Acessório',    sku: 'AC001', price: 75,  cost: 35, stock: 10, minStock: 3  },
    { name: 'Vitamina Capilar 30 cápsulas',      brand: 'Pantogar',     category: 'Suplemento',   sku: 'SU001', price: 180, cost: 85, stock: 10, minStock: 3  },
    { name: 'Botox Capilar 1kg',                 brand: 'Inoar',        category: 'Tratamento',   sku: 'TR005', price: 250, cost: 110, stock: 8, minStock: 3  },
    { name: 'Shampoo Anti-Caspa 400ml',          brand: 'Head & Shoulders', category: 'Shampoo',  sku: 'SH002', price: 38,  cost: 18, stock: 25, minStock: 6  },
    { name: 'Condicionador Liso Perfeito 400ml', brand: 'Pantene',      category: 'Condicionador',sku: 'CO002', price: 35,  cost: 16, stock: 22, minStock: 6  },
    { name: 'Kit Cauterização Capilar',          brand: 'Lowell',       category: 'Tratamento',   sku: 'TR006', price: 95,  cost: 45, stock: 12, minStock: 4  },
    { name: 'Pó Descolorante 500g',              brand: 'Wella',        category: 'Tinta',        sku: 'TN020', price: 65,  cost: 28, stock: 20, minStock: 5  },
    { name: 'Hidratante Corporal 400ml',         brand: 'Neutrogena',   category: 'Estética',     sku: 'ET003', price: 55,  cost: 25, stock: 18, minStock: 4  },
  ];

  const products = await Promise.all(
    productsInput.map(p =>
      prisma.product.create({
        data: { tenantId: tenant.id, ...p, isActive: true },
      })
    )
  );
  console.log(`✅ Produtos criados: ${products.length}`);

  // ══════════════════════════════════════════════════════════════
  // CLIENTS (60 clientes)
  // ══════════════════════════════════════════════════════════════
  const clientsInput = [
    // Feminino
    { name: 'Ana Carolina Santos',     email: 'ana.santos@email.com',     phone: '(11) 98001-0001', source: 'Instagram',  birthday: new Date('1992-03-15') },
    { name: 'Mariana Oliveira',        email: 'mariana.oli@email.com',    phone: '(11) 98001-0002', source: 'Indicação',  birthday: new Date('1988-07-22') },
    { name: 'Fernanda Costa',          email: 'fernanda.c@email.com',     phone: '(11) 98001-0003', source: 'Google',     birthday: new Date('1995-11-08') },
    { name: 'Juliana Pereira',         email: 'juliana.p@email.com',      phone: '(11) 98001-0004', source: 'Instagram',  birthday: new Date('1990-05-30') },
    { name: 'Patrícia Lima',           email: 'patricia.lima@email.com',  phone: '(11) 98001-0005', source: 'Indicação',  birthday: new Date('1985-01-17') },
    { name: 'Roberta Silva',           email: 'roberta.s@email.com',      phone: '(11) 98001-0006', source: 'Google',     birthday: new Date('1993-09-04') },
    { name: 'Camila Rodrigues',        email: 'camila.r@email.com',       phone: '(11) 98001-0007', source: 'Facebook',   birthday: new Date('1997-12-20') },
    { name: 'Priscila Mendes',         email: 'priscila.m@email.com',     phone: '(11) 98001-0008', source: 'Instagram',  birthday: new Date('1991-06-14') },
    { name: 'Renata Gomes',            email: 'renata.g@email.com',       phone: '(11) 98001-0009', source: 'Indicação',  birthday: new Date('1987-02-28') },
    { name: 'Daniela Alves',           email: 'daniela.a@email.com',      phone: '(11) 98001-0010', source: 'Google',     birthday: new Date('1994-08-11') },
    { name: 'Tatiana Souza',           email: 'tatiana.s@email.com',      phone: '(11) 98001-0011', source: 'Instagram',  birthday: new Date('1989-04-03') },
    { name: 'Vanessa Ferreira',        email: 'vanessa.f@email.com',      phone: '(11) 98001-0012', source: 'Indicação',  birthday: new Date('1996-10-25') },
    { name: 'Beatriz Cardoso',         email: 'beatriz.c@email.com',      phone: '(11) 98001-0013', source: 'Walk-in',    birthday: new Date('1993-07-09') },
    { name: 'Larissa Martins',         email: 'larissa.m@email.com',      phone: '(11) 98001-0014', source: 'Google',     birthday: new Date('1998-03-27') },
    { name: 'Aline Barbosa',           email: 'aline.b@email.com',        phone: '(11) 98001-0015', source: 'Instagram',  birthday: new Date('1991-11-16') },
    { name: 'Cristiane Dias',          email: 'cristiane.d@email.com',    phone: '(11) 98001-0016', source: 'Facebook',   birthday: new Date('1986-05-08') },
    { name: 'Simone Vieira',           email: 'simone.v@email.com',       phone: '(11) 98001-0017', source: 'Indicação',  birthday: new Date('1984-09-19') },
    { name: 'Gabriela Castro',         email: 'gabriela.c@email.com',     phone: '(11) 98001-0018', source: 'Google',     birthday: new Date('1999-01-30') },
    { name: 'Elaine Ribeiro',          email: 'elaine.r@email.com',       phone: '(11) 98001-0019', source: 'Instagram',  birthday: new Date('1990-06-22') },
    { name: 'Mônica Teixeira',         email: 'monica.t@email.com',       phone: '(11) 98001-0020', source: 'Indicação',  birthday: new Date('1988-12-05') },
    { name: 'Carolina Nascimento',     email: 'carol.n@email.com',        phone: '(11) 98001-0021', source: 'Google',     birthday: new Date('1995-04-18') },
    { name: 'Amanda Rocha',            email: 'amanda.r@email.com',       phone: '(11) 98001-0022', source: 'Instagram',  birthday: new Date('1992-08-07') },
    { name: 'Bruna Araújo',            email: 'bruna.a@email.com',        phone: '(11) 98001-0023', source: 'Walk-in',    birthday: new Date('1997-02-14') },
    { name: 'Sabrina Carvalho',        email: 'sabrina.c@email.com',      phone: '(11) 98001-0024', source: 'Facebook',   birthday: new Date('1993-10-01') },
    { name: 'Isabela Moura',           email: 'isabela.m@email.com',      phone: '(11) 98001-0025', source: 'Google',     birthday: new Date('1996-07-13') },
    { name: 'Nathalia Torres',         email: 'nathalia.t@email.com',     phone: '(11) 98001-0026', source: 'Indicação',  birthday: new Date('1989-11-29') },
    { name: 'Andressa Lima',           email: 'andressa.l@email.com',     phone: '(11) 98001-0027', source: 'Instagram',  birthday: new Date('1994-03-10') },
    { name: 'Thaís Campos',            email: 'thais.c@email.com',        phone: '(11) 98001-0028', source: 'Google',     birthday: new Date('1991-09-23') },
    { name: 'Letícia Freitas',         email: 'leticia.f@email.com',      phone: '(11) 98001-0029', source: 'Indicação',  birthday: new Date('1998-05-06') },
    { name: 'Viviane Santos',          email: 'viviane.s@email.com',      phone: '(11) 98001-0030', source: 'Walk-in',    birthday: new Date('1987-01-24') },
    { name: 'Raquel Nascimento',       email: 'raquel.n@email.com',       phone: '(11) 98001-0031', source: 'Google',     birthday: new Date('1990-07-31') },
    { name: 'Sandra Vieira',           email: 'sandra.v@email.com',       phone: '(11) 98001-0032', source: 'Indicação',  birthday: new Date('1983-03-20') },
    { name: 'Luciana Pinto',           email: 'luciana.p@email.com',      phone: '(11) 98001-0033', source: 'Instagram',  birthday: new Date('1992-12-12') },
    { name: 'Adriana Medeiros',        email: 'adriana.m@email.com',      phone: '(11) 98001-0034', source: 'Facebook',   birthday: new Date('1986-08-26') },
    { name: 'Denise Correia',          email: 'denise.c@email.com',       phone: '(11) 98001-0035', source: 'Google',     birthday: new Date('1994-04-09') },
    { name: 'Flávia Barros',           email: 'flavia.b@email.com',       phone: '(11) 98001-0036', source: 'Indicação',  birthday: new Date('1989-10-17') },
    { name: 'Karina Duarte',           email: 'karina.d@email.com',       phone: '(11) 98001-0037', source: 'Instagram',  birthday: new Date('1997-06-02') },
    { name: 'Lúcia Melo',              email: 'lucia.m@email.com',        phone: '(11) 98001-0038', source: 'Google',     birthday: new Date('1982-02-15') },
    { name: 'Maria Cristina Alves',    email: 'maria.ca@email.com',       phone: '(11) 98001-0039', source: 'Indicação',  birthday: new Date('1979-11-08') },
    { name: 'Paula Vasconcelos',       email: 'paula.v@email.com',        phone: '(11) 98001-0040', source: 'Google',     birthday: new Date('1995-09-14') },
    { name: 'Regina Pires',            email: 'regina.p@email.com',       phone: '(11) 98001-0041', source: 'Walk-in',    birthday: new Date('1981-05-28') },
    { name: 'Suzana Fontes',           email: 'suzana.f@email.com',       phone: '(11) 98001-0042', source: 'Google',     birthday: new Date('1993-03-07') },
    { name: 'Tereza Caldas',           email: 'tereza.c@email.com',       phone: '(11) 98001-0043', source: 'Instagram',  birthday: new Date('1988-01-19') },
    // Masculino
    { name: 'Carlos Eduardo Ferreira', email: 'carlos.f@email.com',       phone: '(11) 97001-0101', source: 'Google',     birthday: new Date('1990-06-10') },
    { name: 'Bruno Martins',           email: 'bruno.m@email.com',        phone: '(11) 97001-0102', source: 'Instagram',  birthday: new Date('1993-11-22') },
    { name: 'Diego Almeida',           email: 'diego.a@email.com',        phone: '(11) 97001-0103', source: 'Indicação',  birthday: new Date('1988-04-05') },
    { name: 'Rafael Costa',            email: 'rafael.c@email.com',       phone: '(11) 97001-0104', source: 'Walk-in',    birthday: new Date('1995-08-17') },
    { name: 'Lucas Oliveira',          email: 'lucas.o@email.com',        phone: '(11) 97001-0105', source: 'Google',     birthday: new Date('1997-02-03') },
    { name: 'Felipe Souza',            email: 'felipe.s@email.com',       phone: '(11) 97001-0106', source: 'Facebook',   birthday: new Date('1991-07-29') },
    { name: 'Thiago Rodrigues',        email: 'thiago.r@email.com',       phone: '(11) 97001-0107', source: 'Indicação',  birthday: new Date('1986-12-14') },
    { name: 'Gustavo Lima',            email: 'gustavo.l@email.com',      phone: '(11) 97001-0108', source: 'Instagram',  birthday: new Date('1992-09-08') },
    { name: 'Henrique Barbosa',        email: 'henrique.b@email.com',     phone: '(11) 97001-0109', source: 'Google',     birthday: new Date('1994-03-25') },
    { name: 'Mateus Pereira',          email: 'mateus.p@email.com',       phone: '(11) 97001-0110', source: 'Walk-in',    birthday: new Date('1998-10-12') },
    { name: 'André Machado',           email: 'andre.mach@email.com',     phone: '(11) 97001-0111', source: 'Google',     birthday: new Date('1989-05-20') },
    { name: 'Victor Ramos',            email: 'victor.r@email.com',       phone: '(11) 97001-0112', source: 'Indicação',  birthday: new Date('1996-01-07') },
    { name: 'Leandro Assis',           email: 'leandro.a@email.com',      phone: '(11) 97001-0113', source: 'Instagram',  birthday: new Date('1987-08-31') },
    { name: 'Fernando Nunes',          email: 'fernando.n@email.com',     phone: '(11) 97001-0114', source: 'Google',     birthday: new Date('1993-04-16') },
    { name: 'Ricardo Tavares',         email: 'ricardo.t@email.com',      phone: '(11) 97001-0115', source: 'Walk-in',    birthday: new Date('1985-11-03') },
    { name: 'Eduardo Castro',          email: 'eduardo.ca@email.com',     phone: '(11) 97001-0116', source: 'Facebook',   birthday: new Date('1991-07-14') },
    { name: 'Gabriel Peixoto',         email: 'gabriel.p@email.com',      phone: '(11) 97001-0117', source: 'Indicação',  birthday: new Date('1999-02-26') },
  ];

  const clients = await Promise.all(
    clientsInput.map((c, i) =>
      prisma.client.create({
        data: {
          tenantId: tenant.id,
          name: c.name,
          email: c.email,
          phone: c.phone,
          birthday: c.birthday,
          source: c.source,
          notes: i % 6 === 0 ? 'Prefere produtos sem amônia e sulfato.' : i % 9 === 0 ? 'Sensível a produtos fortes. Sempre testar antes.' : null,
          isActive: true,
          loyaltyPoints: randomBetween(0, 800),
          preferredProId: professionals[i % professionals.length].id,
        },
      })
    )
  );
  console.log(`✅ Clientes criados: ${clients.length}`);

  // ══════════════════════════════════════════════════════════════
  // CLIENT TAGS
  // ══════════════════════════════════════════════════════════════
  const [tagVip, tagAltoTicket, tagInativo, tagAniversariante, tagFiel] = await Promise.all([
    prisma.clientTag.create({ data: { tenantId: tenant.id, name: 'VIP',            color: '#f59e0b', isAuto: false } }),
    prisma.clientTag.create({ data: { tenantId: tenant.id, name: 'Alto Ticket',    color: '#10b981', isAuto: true,  rule: JSON.stringify({ type: 'high_ticket', minAvg: 200 }) } }),
    prisma.clientTag.create({ data: { tenantId: tenant.id, name: 'Inativo 60d',    color: '#ef4444', isAuto: true,  rule: JSON.stringify({ type: 'inactive', days: 60 }) } }),
    prisma.clientTag.create({ data: { tenantId: tenant.id, name: 'Aniversariante', color: '#8b5cf6', isAuto: true,  rule: JSON.stringify({ type: 'birthday_month' }) } }),
    prisma.clientTag.create({ data: { tenantId: tenant.id, name: 'Fiel',           color: '#3b82f6', isAuto: true,  rule: JSON.stringify({ type: 'loyal', minVisits: 10 }) } }),
  ]);

  const tagAssignments = [];
  clients.forEach((c, i) => {
    if (i % 5 === 0) tagAssignments.push({ clientId: c.id, tagId: tagVip.id });
    if (i % 3 === 0) tagAssignments.push({ clientId: c.id, tagId: tagAltoTicket.id });
    if (i % 8 === 0) tagAssignments.push({ clientId: c.id, tagId: tagInativo.id });
    if (i % 7 === 0) tagAssignments.push({ clientId: c.id, tagId: tagAniversariante.id });
    if (i % 4 === 0) tagAssignments.push({ clientId: c.id, tagId: tagFiel.id });
  });

  // Deduplicate (same client can't have same tag twice)
  const seenTags = new Set();
  const uniqueTagAssignments = tagAssignments.filter(a => {
    const key = `${a.clientId}-${a.tagId}`;
    if (seenTags.has(key)) return false;
    seenTags.add(key);
    return true;
  });

  await Promise.all(
    uniqueTagAssignments.map(a =>
      prisma.clientTagAssignment.create({ data: { clientId: a.clientId, tagId: a.tagId } })
    )
  );
  console.log(`✅ Tags criadas: 5 | Atribuições: ${uniqueTagAssignments.length}`);

  // ══════════════════════════════════════════════════════════════
  // COMMISSION RULES
  // ══════════════════════════════════════════════════════════════
  await Promise.all([
    ...professionals.map(p =>
      prisma.commissionRule.create({
        data: {
          tenantId: tenant.id,
          professionalId: p.id,
          type: 'service',
          percent: randomBetween(28, 40),
          isActive: true,
        },
      })
    ),
    prisma.commissionRule.create({ data: { tenantId: tenant.id, type: 'product', percent: 10, isActive: true } }),
    prisma.commissionRule.create({ data: { tenantId: tenant.id, type: 'service', serviceCategory: 'Cabelo',      percent: 35, isActive: true } }),
    prisma.commissionRule.create({ data: { tenantId: tenant.id, type: 'service', serviceCategory: 'Unhas',       percent: 30, isActive: true } }),
    prisma.commissionRule.create({ data: { tenantId: tenant.id, type: 'service', serviceCategory: 'Estética',    percent: 32, isActive: true } }),
    prisma.commissionRule.create({ data: { tenantId: tenant.id, type: 'service', serviceCategory: 'Sobrancelha', percent: 28, isActive: true } }),
  ]);
  console.log('✅ Regras de comissão criadas');

  // ══════════════════════════════════════════════════════════════
  // APPOINTMENTS + SALES (Maio 2025 → Abril 2026)
  // ══════════════════════════════════════════════════════════════
  console.log('\n📅 Gerando agendamentos e vendas para 12 meses...');

  let totalAppointments = 0;
  let totalSales = 0;

  const currentDate = new Date('2025-05-01');
  const endDate    = new Date('2026-04-30');

  while (currentDate <= endDate) {
    const dow = currentDate.getDay(); // 0=Dom, 6=Sáb
    if (dow === 0) { // Closed Sundays
      currentDate.setDate(currentDate.getDate() + 1);
      continue;
    }

    const month   = currentDate.getMonth();
    const factor  = seasonalFactor(month);
    const isSat   = dow === 6;
    const baseMin = isSat ? 2 : 4;
    const baseMax = isSat ? 5 : 8;
    const apptCount = Math.round(randomBetween(baseMin, baseMax) * factor);

    const usedSlots = new Set();

    for (let i = 0; i < apptCount; i++) {
      const client       = pickRandom(clients);
      const professional = pickRandom(professionals);
      const branch       = professional.branchId === branch1.id ? branch1 : branch2;
      const service      = pickRandom(services);
      const status       = pickRandom(APPOINTMENT_STATUSES);

      // Pick a unique(ish) time slot per professional per day
      let slotMin = pickRandom(TIME_SLOTS_MINUTES);
      const slotKey = `${professional.id}-${slotMin}`;
      if (usedSlots.has(slotKey)) {
        // try one more slot
        slotMin = pickRandom(TIME_SLOTS_MINUTES);
      }
      usedSlots.add(`${professional.id}-${slotMin}`);

      const startTime = formatTime(slotMin);
      const endMin    = slotMin + service.duration;
      const endTime   = formatTime(endMin);

      const apptDate = new Date(currentDate);

      const appointment = await prisma.appointment.create({
        data: {
          tenantId:       tenant.id,
          branchId:       branch.id,
          clientId:       client.id,
          professionalId: professional.id,
          date:           apptDate,
          startTime,
          endTime,
          status,
          confirmedAt:       ['completed', 'confirmed', 'in_progress'].includes(status) ? apptDate : null,
          reminderSent24h:   ['completed', 'confirmed'].includes(status),
          reminderSent1h:    status === 'completed',
          reviewRequested:   status === 'completed',
          notes:             i % 12 === 0 ? 'Cliente solicitou produto específico sem amônia.' : null,
          cancellationReason: status === 'cancelled' ? pickRandom(CANCELLATION_REASONS) : null,
          createdAt:         addDays(apptDate, -randomBetween(1, 7)),
        },
      });

      await prisma.appointmentService.create({
        data: {
          appointmentId:  appointment.id,
          serviceId:      service.id,
          professionalId: professional.id,
          price:          service.price,
          duration:       service.duration,
        },
      });

      totalAppointments++;

      // ── Sale for completed appointments ──────────────────────
      if (status === 'completed') {
        const paymentMethod  = pickRandom(PAYMENT_METHODS);
        const hasDiscount    = Math.random() < 0.12;
        const discount       = hasDiscount ? randomBetween(5, Math.min(50, service.price * 0.2)) : 0;
        const svcTotal       = service.price - discount;
        const commissionPct  = randomBetween(28, 40);
        const commissionAmt  = svcTotal * commissionPct / 100;

        // Occasional product add-on sale (18% chance)
        const addProduct    = Math.random() < 0.18;
        const productItem   = addProduct ? pickRandom(products) : null;
        const productQty    = addProduct ? randomBetween(1, 2) : 0;
        const productTotal  = addProduct ? productItem.price * productQty : 0;
        const grandTotal    = svcTotal + productTotal;

        const sale = await prisma.sale.create({
          data: {
            tenantId:       tenant.id,
            branchId:       branch.id,
            clientId:       client.id,
            professionalId: professional.id,
            total:          grandTotal,
            discount,
            paymentMethod,
            status:         'completed',
            createdAt:      apptDate,
          },
        });

        await prisma.saleItem.create({
          data: {
            saleId:           sale.id,
            type:             'service',
            name:             service.name,
            quantity:         1,
            unitPrice:        service.price,
            total:            svcTotal,
            commissionPercent: commissionPct,
            commissionAmount:  commissionAmt,
          },
        });

        if (addProduct && productItem) {
          await prisma.saleItem.create({
            data: {
              saleId:            sale.id,
              productId:         productItem.id,
              type:              'product',
              name:              productItem.name,
              quantity:          productQty,
              unitPrice:         productItem.price,
              total:             productTotal,
              commissionPercent: 10,
              commissionAmount:  productTotal * 0.1,
            },
          });
        }

        totalSales++;
      }
    }

    // Progress indicator every ~30 days
    if (currentDate.getDate() === 1 && currentDate.getMonth() % 3 === 0) {
      console.log(`   → ${currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })} processado...`);
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  console.log(`✅ Agendamentos criados: ${totalAppointments}`);
  console.log(`✅ Vendas criadas:       ${totalSales}`);

  // ══════════════════════════════════════════════════════════════
  // FINANCIAL RECORDS (Maio 2025 → Abril 2026)
  // ══════════════════════════════════════════════════════════════
  console.log('\n💰 Gerando registros financeiros mensais...');
  const financialBatch = [];

  for (let m = 0; m < 12; m++) {
    // JavaScript wraps month > 11 automatically
    const year      = m < 8 ? 2025 : 2026;
    const month     = (4 + m) % 12; // May=4, Jun=5, ..., Apr=3
    const factor    = seasonalFactor(month);
    const isPast    = new Date(year, month, 28) < new Date();

    const mkDate = (d) => new Date(year, month, d);

    // ── Despesas Fixas ───────────────────────────────────────────
    financialBatch.push(
      { type: 'despesa', category: 'Aluguel',           description: 'Aluguel Unidade Jardins',         amount: 8500,                             dueDate: mkDate(10), paidAt: isPast ? mkDate(10) : null, status: isPast ? 'paid' : 'pending', accountPlan: 'Despesas Fixas' },
      { type: 'despesa', category: 'Aluguel',           description: 'Aluguel Unidade Moema',           amount: 7200,                             dueDate: mkDate(10), paidAt: isPast ? mkDate(10) : null, status: isPast ? 'paid' : 'pending', accountPlan: 'Despesas Fixas' },
      { type: 'despesa', category: 'Salários',          description: 'Folha de Pagamento',              amount: 19500 + randomBetween(-600, 800),  dueDate: mkDate(5),  paidAt: isPast ? mkDate(5)  : null, status: isPast ? 'paid' : 'pending', accountPlan: 'Despesas Fixas' },
      { type: 'despesa', category: 'Pró-Labore',        description: 'Pró-Labore Sócios',              amount: 6000,                             dueDate: mkDate(5),  paidAt: isPast ? mkDate(5)  : null, status: isPast ? 'paid' : 'pending', accountPlan: 'Despesas Fixas' },
      { type: 'despesa', category: 'Energia Elétrica',  description: 'Conta de Energia — Jardins',      amount: 1300 + randomBetween(-120, 200),   dueDate: mkDate(15), paidAt: isPast ? mkDate(15) : null, status: isPast ? 'paid' : 'pending', accountPlan: 'Despesas Fixas' },
      { type: 'despesa', category: 'Energia Elétrica',  description: 'Conta de Energia — Moema',        amount: 1100 + randomBetween(-100, 180),   dueDate: mkDate(15), paidAt: isPast ? mkDate(15) : null, status: isPast ? 'paid' : 'pending', accountPlan: 'Despesas Fixas' },
      { type: 'despesa', category: 'Água',              description: 'Conta de Água e Esgoto',          amount: 420  + randomBetween(-30,  60),    dueDate: mkDate(20), paidAt: isPast ? mkDate(20) : null, status: isPast ? 'paid' : 'pending', accountPlan: 'Despesas Fixas' },
      { type: 'despesa', category: 'Internet/Telefone', description: 'Internet Fibra + PABX',           amount: 480,                              dueDate: mkDate(15), paidAt: isPast ? mkDate(15) : null, status: isPast ? 'paid' : 'pending', accountPlan: 'Despesas Fixas' },
      { type: 'despesa', category: 'Software',          description: 'BeautyPro CRM — Assinatura Pro',  amount: 299,                              dueDate: mkDate(1),  paidAt: isPast ? mkDate(1)  : null, status: isPast ? 'paid' : 'pending', accountPlan: 'Despesas Fixas' },
      { type: 'despesa', category: 'Seguro',            description: 'Seguro Empresarial',              amount: 350,                              dueDate: mkDate(1),  paidAt: isPast ? mkDate(1)  : null, status: isPast ? 'paid' : 'pending', accountPlan: 'Despesas Fixas' },
      { type: 'despesa', category: 'Contador',          description: 'Honorários Contabilidade',        amount: 800,                              dueDate: mkDate(5),  paidAt: isPast ? mkDate(5)  : null, status: isPast ? 'paid' : 'pending', accountPlan: 'Despesas Fixas' },
      // ── Despesas Variáveis ────────────────────────────────────────
      { type: 'despesa', category: 'Material',          description: 'Compra de Insumos e Produtos',    amount: Math.round(3800 * factor) + randomBetween(-400, 600), dueDate: mkDate(20), paidAt: isPast ? mkDate(20) : null, status: isPast ? 'paid' : 'pending', accountPlan: 'Despesas Variáveis' },
      { type: 'despesa', category: 'Marketing',         description: 'Anúncios Instagram + Google Ads', amount: Math.round(1800 * factor) + randomBetween(-200, 400), dueDate: mkDate(1),  paidAt: isPast ? mkDate(1)  : null, status: isPast ? 'paid' : 'pending', accountPlan: 'Despesas Variáveis' },
      { type: 'despesa', category: 'Limpeza',           description: 'Serviço de Limpeza e Higiene',    amount: 900,                              dueDate: mkDate(10), paidAt: isPast ? mkDate(10) : null, status: isPast ? 'paid' : 'pending', accountPlan: 'Despesas Variáveis' },
      { type: 'despesa', category: 'Embalagens',        description: 'Embalagens e Material de Apoio',  amount: 380  + randomBetween(-50, 100),    dueDate: mkDate(20), paidAt: isPast ? mkDate(20) : null, status: isPast ? 'paid' : 'pending', accountPlan: 'Despesas Variáveis' },
      // ── Receitas ──────────────────────────────────────────────────
      { type: 'receita', category: 'Serviços',   description: 'Receita Serviços — 1ª Quinzena', amount: Math.round(19000 * factor) + randomBetween(-1500, 3000), dueDate: mkDate(15), paidAt: isPast ? mkDate(15) : null, status: isPast ? 'paid' : 'pending', accountPlan: 'Receitas' },
      { type: 'receita', category: 'Serviços',   description: 'Receita Serviços — 2ª Quinzena', amount: Math.round(18500 * factor) + randomBetween(-1500, 3000), dueDate: mkDate(28), paidAt: isPast ? mkDate(28) : null, status: isPast ? 'paid' : 'pending', accountPlan: 'Receitas' },
      { type: 'receita', category: 'Produtos',   description: 'Venda de Produtos Salão',        amount: Math.round(4200  * factor) + randomBetween(-500,  1200), dueDate: mkDate(28), paidAt: isPast ? mkDate(28) : null, status: isPast ? 'paid' : 'pending', accountPlan: 'Receitas' },
      { type: 'receita', category: 'Pacotes',    description: 'Venda de Pacotes e Combos',      amount: Math.round(2800  * factor) + randomBetween(-400,  800),  dueDate: mkDate(28), paidAt: isPast ? mkDate(28) : null, status: isPast ? 'paid' : 'pending', accountPlan: 'Receitas' },
    );

    // Extra expenses in specific months
    if (month === 11) { // Dezembro
      financialBatch.push({ type: 'despesa', category: 'Decoração', description: 'Decoração Festas de Fim de Ano', amount: 1200, dueDate: mkDate(1), paidAt: isPast ? mkDate(1) : null, status: isPast ? 'paid' : 'pending', accountPlan: 'Despesas Variáveis' });
      financialBatch.push({ type: 'receita', category: 'Serviços',  description: 'Extra — Penteados para Festas', amount: 6800, dueDate: mkDate(20), paidAt: isPast ? mkDate(20) : null, status: isPast ? 'paid' : 'pending', accountPlan: 'Receitas' });
    }
    if (month === 4) { // Maio (Dia das Mães)
      financialBatch.push({ type: 'receita', category: 'Pacotes',   description: 'Pacotes Dia das Mães', amount: 4500, dueDate: mkDate(12), paidAt: isPast ? mkDate(12) : null, status: isPast ? 'paid' : 'pending', accountPlan: 'Receitas' });
    }
    if (month === 5) { // Junho
      financialBatch.push({ type: 'despesa', category: 'Eventos',   description: 'Festa Junina Interna', amount: 1500, dueDate: mkDate(15), paidAt: isPast ? mkDate(15) : null, status: isPast ? 'paid' : 'pending', accountPlan: 'Despesas Variáveis' });
    }
  }

  // Upcoming / pending extras
  financialBatch.push(
    { type: 'despesa', category: 'Equipamentos', description: 'Manutenção Cadeiras e Lavatórios',   amount: 2200, dueDate: new Date('2026-05-15'), paidAt: null, status: 'pending', accountPlan: 'Despesas Variáveis' },
    { type: 'despesa', category: 'Reforma',      description: 'Pintura e Revitalização — Jardins',  amount: 5500, dueDate: new Date('2026-05-20'), paidAt: null, status: 'pending', accountPlan: 'Despesas Variáveis' },
    { type: 'receita', category: 'Serviços',     description: 'Receita Serviços — Mai/2026 (parcial)', amount: 9000, dueDate: new Date('2026-05-15'), paidAt: null, status: 'pending', accountPlan: 'Receitas' },
  );

  await Promise.all(
    financialBatch.map(r =>
      prisma.financialRecord.create({
        data: { tenantId: tenant.id, ...r },
      })
    )
  );
  console.log(`✅ Registros financeiros criados: ${financialBatch.length}`);

  // ══════════════════════════════════════════════════════════════
  // AUTOMATIONS + LOGS
  // ══════════════════════════════════════════════════════════════
  const automations = await Promise.all([
    prisma.automation.create({ data: { tenantId: tenant.id, name: 'Lembrete 24h',           type: 'reminder_24h',   channel: 'whatsapp', template: 'Olá {{nome}}! 💇 Lembrando do seu agendamento *amanhã* às {{horario}} com {{profissional}}. Confirme respondendo SIM ou entre em contato para reagendar.', isActive: true, schedule: '0 10 * * *' } }),
    prisma.automation.create({ data: { tenantId: tenant.id, name: 'Lembrete 1h',             type: 'reminder_1h',    channel: 'whatsapp', template: 'Oi {{nome}}! ⏰ Seu horário é daqui a 1 hora. Te esperamos! Qualquer dúvida, é só chamar.', isActive: true } }),
    prisma.automation.create({ data: { tenantId: tenant.id, name: 'Feliz Aniversário',        type: 'birthday',       channel: 'whatsapp', template: '🎂 Feliz Aniversário, {{nome}}! Como presente especial, temos *20% de desconto* no seu próximo serviço. Use o código *ANIVER20* ao agendar. Bjs! 💕', isActive: true, schedule: '0 9 * * *' } }),
    prisma.automation.create({ data: { tenantId: tenant.id, name: 'Avaliação pós-visita',     type: 'review_request', channel: 'whatsapp', template: 'Obrigada pela visita, {{nome}}! 😊 O que achou do atendimento? Deixe sua avaliação: {{link_avaliacao}}. Sua opinião é muito importante para nós!', isActive: true } }),
    prisma.automation.create({ data: { tenantId: tenant.id, name: 'Reativação 60 dias',       type: 'win_back',       channel: 'whatsapp', template: 'Saudades de você, {{nome}}! 💆‍♀️ Faz um tempinho que não aparecer por aqui. Que tal agendar com *15% de desconto*? Use: *VOLTEI15*', isActive: true, triggerRule: JSON.stringify({ inactiveDays: 60 }), schedule: '0 10 * * 1' } }),
    prisma.automation.create({ data: { tenantId: tenant.id, name: 'Alerta Estoque Baixo',     type: 'stock_alert',    channel: 'email',    template: '⚠️ Atenção! O produto *{{produto}}* está com estoque baixo ({{quantidade}} unidades). Hora de reabastecer!', isActive: true, schedule: '0 8 * * *' } }),
    prisma.automation.create({ data: { tenantId: tenant.id, name: 'Campanha Dia das Mães',    type: 'win_back',       channel: 'whatsapp', template: '💐 Dia das Mães chegando, {{nome}}! Presenteie quem você ama com nossos vouchers especiais. Consulte-nos! 🎁', isActive: false, schedule: '0 9 * * 1' } }),
  ]);

  const logStatuses = ['sent', 'sent', 'sent', 'sent', 'failed', 'skipped'];
  const automationLogs = [];
  for (const automation of automations) {
    const logCount = randomBetween(20, 60);
    for (let i = 0; i < logCount; i++) {
      const logDate = addDays(new Date('2025-05-01'), randomBetween(0, 364));
      const st      = pickRandom(logStatuses);
      automationLogs.push({
        automationId: automation.id,
        clientId:     pickRandom(clients).id,
        status:       st,
        channel:      automation.channel,
        message:      st !== 'failed' ? `Mensagem ${automation.type} enviada com sucesso.` : null,
        error:        st === 'failed' ? 'Número não encontrado no WhatsApp.' : null,
        createdAt:    logDate,
      });
    }
  }

  await Promise.all(
    automationLogs.map(l => prisma.automationLog.create({ data: l }))
  );
  console.log(`✅ Automações: ${automations.length} | Logs: ${automationLogs.length}`);

  // ══════════════════════════════════════════════════════════════
  // SMART SUGGESTIONS
  // ══════════════════════════════════════════════════════════════
  await Promise.all([
    prisma.smartSuggestion.create({ data: { tenantId: tenant.id, type: 'inactive_vip',  priority: 'urgent', title: '5 clientes VIP inativos há +60 dias', description: 'Esses clientes têm ticket médio acima de R$ 500. Uma mensagem personalizada pode reativá-los rapidamente.', action: 'send_whatsapp', clientId: clients[0].id, metadata: JSON.stringify({ count: 5, avgTicket: 520 }), isRead: false, isResolved: false } }),
    prisma.smartSuggestion.create({ data: { tenantId: tenant.id, type: 'birthday',       priority: 'high',   title: '4 aniversariantes esta semana', description: 'Envie uma mensagem personalizada e ofereça um desconto especial para fidelizá-los ainda mais!', action: 'send_whatsapp', metadata: JSON.stringify({ count: 4 }), isRead: false, isResolved: false } }),
    prisma.smartSuggestion.create({ data: { tenantId: tenant.id, type: 'win_back',       priority: 'medium', title: '14 clientes sem visita há +45 dias', description: 'Uma campanha de reativação pode gerar receita estimada de R$ 2.800. Envie um cupom de 15% de desconto.', action: 'apply_coupon', metadata: JSON.stringify({ count: 14, estimatedRevenue: 2800 }), isRead: false, isResolved: false } }),
    prisma.smartSuggestion.create({ data: { tenantId: tenant.id, type: 'stock_alert',    priority: 'high',   title: 'Botox Capilar com estoque crítico', description: 'Apenas 3 unidades em estoque. Reordene antes de acabar para não perder atendimentos.', action: 'call', metadata: JSON.stringify({ product: 'Botox Capilar 1kg', stock: 3, minStock: 3 }), isRead: true, isResolved: false } }),
    prisma.smartSuggestion.create({ data: { tenantId: tenant.id, type: 'high_value',     priority: 'medium', title: '9 clientes com alto potencial de fidelização', description: 'Visitaram apenas 1x mas com ticket acima de R$ 300. Uma ação de fidelidade agora pode transformá-los em clientes recorrentes.', action: 'send_whatsapp', metadata: JSON.stringify({ count: 9, avgTicket: 340 }), isRead: false, isResolved: false } }),
    prisma.smartSuggestion.create({ data: { tenantId: tenant.id, type: 'inactive_vip',  priority: 'low',    title: 'Receita potencial de R$ 12.000 em inativos', description: 'Baseado no histórico, os clientes inativos podem gerar essa receita se reativados. Use automações!', action: 'send_whatsapp', metadata: JSON.stringify({ estimatedRevenue: 12000 }), isRead: true, isResolved: true, resolvedAt: new Date('2026-01-15') } }),
  ]);
  console.log('✅ Smart Suggestions criadas');

  // ══════════════════════════════════════════════════════════════
  // BLOG POSTS
  // ══════════════════════════════════════════════════════════════
  await Promise.all([
    prisma.blogPost.create({ data: { tenantId: tenant.id, title: '5 Tendências de Coloração para 2025',              slug: 'tendencias-coloracao-2025',                excerpt: 'Descubra as cores que vão dominar os salões este ano.',                          content: '## As Cores do Ano\n\nO ano de 2025 traz tons terrosos, louro mel e o chamado "chocolate glaze" como os grandes favoritos...',        category: 'Tendências',  author: 'Júlia Costa',    isPublished: true,  publishedAt: new Date('2025-05-10') } }),
    prisma.blogPost.create({ data: { tenantId: tenant.id, title: 'Como Cuidar do Cabelo Colorido em Casa',           slug: 'cuidar-cabelo-colorido-casa',               excerpt: 'Dicas essenciais para manter a cor vibrante por mais tempo.',                   content: '## Cuidados Pós-Coloração\n\nManter o cabelo colorido saudável em casa requer rotina e os produtos certos...',                        category: 'Dicas',       author: 'Júlia Costa',    isPublished: true,  publishedAt: new Date('2025-06-05') } }),
    prisma.blogPost.create({ data: { tenantId: tenant.id, title: 'Manicure Perfeita: Guia Completo Passo a Passo',   slug: 'manicure-perfeita-passo-a-passo',           excerpt: 'Técnicas profissionais para unhas sempre impecáveis.',                          content: '## Preparação é Tudo\n\nUma manicure duradoura começa pela preparação correta da cutícula e lixamento...',                           category: 'Dicas',       author: 'Aline Ferreira', isPublished: true,  publishedAt: new Date('2025-07-12') } }),
    prisma.blogPost.create({ data: { tenantId: tenant.id, title: 'Hidratação Capilar: Por que é Tão Importante?',    slug: 'beneficios-hidratacao-capilar',             excerpt: 'Entenda por que hidratar regularmente transforma o cabelo.',                    content: '## Cabelo Ressecado x Hidratado\n\nA diferença entre um cabelo saudável e um fragilizado está na hidratação constante...',             category: 'Cuidados',    author: 'Roberto Silva',  isPublished: true,  publishedAt: new Date('2025-08-20') } }),
    prisma.blogPost.create({ data: { tenantId: tenant.id, title: 'Sobrancelha: Qual o Formato Ideal para seu Rosto?',slug: 'design-sobrancelha-formato-rosto',          excerpt: 'Aprenda a identificar o formato ideal para cada tipo de rosto.',               content: '## Os 6 Formatos de Rosto\n\nOval, redondo, quadrado, coração, losango e oblongo — cada um pede um design diferente...',              category: 'Dicas',       author: 'Beatriz Alves',  isPublished: true,  publishedAt: new Date('2025-09-15') } }),
    prisma.blogPost.create({ data: { tenantId: tenant.id, title: 'Barba na Moda: Estilos para 2025',                 slug: 'barba-na-moda-estilos-2025',                excerpt: 'Do cavanhaque ao degradê, qual estilo combina com você?',                       content: '## Tendências de Barba\n\nO barbudo tradicional deu lugar a estilos mais trabalhados. Veja os favoritos da temporada...',               category: 'Tendências',  author: 'Marcos Barbosa', isPublished: true,  publishedAt: new Date('2025-10-08') } }),
    prisma.blogPost.create({ data: { tenantId: tenant.id, title: 'Limpeza de Pele: Essencial no Outono e Inverno',   slug: 'limpeza-pele-outono-inverno',               excerpt: 'No frio, a pele precisa de cuidados extras. Saiba por quê.',                   content: '## A Pele nas Estações Frias\n\nCom a queda da temperatura, a produção de sebo muda e a pele pede uma limpeza mais profunda...',       category: 'Cuidados',    author: 'Patricia Rocha', isPublished: true,  publishedAt: new Date('2025-07-30') } }),
    prisma.blogPost.create({ data: { tenantId: tenant.id, title: 'Escova Progressiva vs. Botox Capilar: Qual Escolher?', slug: 'escova-progressiva-vs-botox-capilar', excerpt: 'Entenda as diferenças e escolha o tratamento certo para seus cabelos.',          content: '## Progressiva ou Botox?\n\nAmbos alisam, mas de formas bem diferentes. A escova progressiva usa formol ou similares...',             category: 'Dicas',       author: 'Júlia Costa',    isPublished: true,  publishedAt: new Date('2025-11-22') } }),
    prisma.blogPost.create({ data: { tenantId: tenant.id, title: 'Penteados para o Verão 2026',                      slug: 'penteados-verao-2026',                      excerpt: 'Inspirações leves e práticas para os dias quentes.',                            content: '## Praticidade com Estilo\n\nO verão pede penteados que suportem o calor sem perder a elegância. Confira as inspirações...',           category: 'Tendências',  author: 'Júlia Costa',    isPublished: true,  publishedAt: new Date('2025-12-10') } }),
    prisma.blogPost.create({ data: { tenantId: tenant.id, title: 'Alongamento de Unhas: Técnicas e Cuidados',        slug: 'alongamento-unhas-tecnicas-cuidados',       excerpt: 'Tudo o que você precisa saber antes de fazer o alongamento.',                  content: '## Gel, Fibra ou Acrílico?\n\nCada técnica de alongamento tem vantagens específicas. Veja qual é ideal para o seu estilo de vida...', category: 'Dicas',       author: 'Sandra Melo',   isPublished: false, publishedAt: null } }),
    prisma.blogPost.create({ data: { tenantId: tenant.id, title: '5 Erros Mais Comuns na Coloração em Casa',         slug: 'erros-coloracao-cabelo-casa',               excerpt: 'Evite esses erros para não estragar seu cabelo na hora de colorir.',           content: '## Erro #1: Não Fazer o Teste de Mecha\n\nAntes de qualquer coloração, o teste de mecha é indispensável para avaliar o resultado...',  category: 'Dicas',       author: 'Roberto Silva',  isPublished: false, publishedAt: null } }),
  ]);
  console.log('✅ Blog posts criados: 11');

  // ══════════════════════════════════════════════════════════════
  // TESTIMONIALS
  // ══════════════════════════════════════════════════════════════
  await Promise.all([
    prisma.testimonial.create({ data: { tenantId: tenant.id, name: 'Ana Carolina Santos',     role: 'Cliente há 3 anos',    content: 'O melhor salão que já frequentei! Profissionais incríveis, ambiente acolhedor e resultado sempre impecável. Não troco por nada!', rating: 5, isActive: true } }),
    prisma.testimonial.create({ data: { tenantId: tenant.id, name: 'Mariana Oliveira',         role: 'Cliente há 2 anos',    content: 'A Júlia é uma artista! Ela sempre entende exatamente o que quero e entrega um resultado ainda melhor. Super recomendo!', rating: 5, isActive: true } }),
    prisma.testimonial.create({ data: { tenantId: tenant.id, name: 'Carlos Eduardo Ferreira',  role: 'Cliente há 1 ano',     content: 'Fui pela primeira vez para fazer barba e nunca mais quis ir a outro lugar. O Marcos é excelente, atendimento cinco estrelas.', rating: 5, isActive: true } }),
    prisma.testimonial.create({ data: { tenantId: tenant.id, name: 'Fernanda Costa',           role: 'Cliente há 4 anos',    content: 'Ambiente sofisticado, equipe super qualificada e sempre atualizada com as tendências. Vale cada centavo. Recomendo!', rating: 5, isActive: true } }),
    prisma.testimonial.create({ data: { tenantId: tenant.id, name: 'Juliana Pereira',          role: 'Cliente há 8 meses',   content: 'Encontrei o salão pelo Instagram e fui experimentar. Me surpreendi com a qualidade da manicure e do atendimento. Voltarei sempre!', rating: 5, isActive: true } }),
    prisma.testimonial.create({ data: { tenantId: tenant.id, name: 'Rafael Costa',             role: 'Cliente há 2 anos',    content: 'Corte e barba sempre perfeitos. O Marcos é um artista mesmo. Sigo as dicas de manutenção e meu cabelo ficou bem mais saudável.', rating: 5, isActive: true } }),
    prisma.testimonial.create({ data: { tenantId: tenant.id, name: 'Roberta Silva',            role: 'Cliente há 1,5 anos',  content: 'Fiz escova progressiva e adorei o resultado. Durou muito mais do que esperava e o cabelo ficou lindo. Voltarei com certeza!', rating: 5, isActive: true } }),
    prisma.testimonial.create({ data: { tenantId: tenant.id, name: 'Gustavo Lima',             role: 'Cliente há 6 meses',   content: 'Fui por indicação de um amigo e não me arrependo. Atendimento top, preço justo e sai de lá se sentindo uma outra pessoa!', rating: 4, isActive: true } }),
  ]);
  console.log('✅ Depoimentos criados: 8');

  // ══════════════════════════════════════════════════════════════
  // SUMMARY
  // ══════════════════════════════════════════════════════════════
  console.log('\n🎉 ══════════════════════════════════════════════');
  console.log('   SEED CONCLUÍDO COM SUCESSO!');
  console.log('   ══════════════════════════════════════════════');
  console.log(`   📅 Período:            Maio 2025 → Abril 2026`);
  console.log(`   🏢 Tenant:             ${tenant.name}`);
  console.log(`   🏪 Unidades:           2 (Jardins + Moema)`);
  console.log(`   👤 Usuários:           7`);
  console.log(`   💼 Profissionais:      ${professionals.length}`);
  console.log(`   🛎  Serviços:           ${services.length}`);
  console.log(`   📦 Produtos:           ${products.length}`);
  console.log(`   👥 Clientes:           ${clients.length}`);
  console.log(`   🏷  Tags (atribuições): ${uniqueTagAssignments.length}`);
  console.log(`   📅 Agendamentos:       ${totalAppointments}`);
  console.log(`   💰 Vendas:             ${totalSales}`);
  console.log(`   📊 Financeiro:         ${financialBatch.length} lançamentos`);
  console.log(`   🤖 Automações:         ${automations.length} | Logs: ${automationLogs.length}`);
  console.log('');
}

main()
  .catch(e => {
    console.error('\n❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
