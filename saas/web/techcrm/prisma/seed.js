const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // ── Admin User ──
  const admin = await prisma.user.upsert({
    where: { email: 'admin@techcrm.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@techcrm.com',
      password: '$2b$10$YourBcryptHashHere',
      role: 'admin',
    },
  });
  console.log('✅ Admin user created');

  // ── Instructors ──
  const instructor1 = await prisma.user.upsert({
    where: { email: 'instructor1@techcrm.com' },
    update: {},
    create: {
      name: 'João Silva',
      email: 'instructor1@techcrm.com',
      password: '$2b$10$YourBcryptHashHere',
      role: 'instructor',
    },
  });

  const instructor2 = await prisma.user.upsert({
    where: { email: 'instructor2@techcrm.com' },
    update: {},
    create: {
      name: 'Maria Santos',
      email: 'instructor2@techcrm.com',
      password: '$2b$10$YourBcryptHashHere',
      role: 'instructor',
    },
  });
  console.log('✅ Instructors created');

  // ── Students ──
  const students = [];
  const studentData = [
    { name: 'Carlos Oliveira', email: 'carlos@email.com', phone: '+5511999990001', status: 'active' },
    { name: 'Ana Costa', email: 'ana@email.com', phone: '+5511999990002', status: 'active' },
    { name: 'Pedro Almeida', email: 'pedro@email.com', phone: '+5511999990003', status: 'active' },
    { name: 'Julia Ferreira', email: 'julia@email.com', phone: '+5511999990004', status: 'inactive' },
    { name: 'Rafael Lima', email: 'rafael@email.com', phone: '+5511999990005', status: 'active' },
  ];

  for (const s of studentData) {
    const student = await prisma.student.upsert({
      where: { email: s.email },
      update: {},
      create: s,
    });
    students.push(student);
  }
  console.log(`✅ ${students.length} students created`);

  // ── Courses ──
  const courses = [];

  const course1 = await prisma.course.upsert({
    where: { id: 'clr000000000000000000001' },
    update: {},
    create: {
      id: 'clr000000000000000000001',
      name: 'React Avançado',
      description: 'Domine React com hooks, context, performance e padrões modernos.',
      level: 'advanced',
      category: 'frontend',
      thumbnail: '/images/courses/react-advanced.jpg',
      duration: 40,
      price: 299.9,
      status: 'published',
    },
  });
  courses.push(course1);

  const course2 = await prisma.course.upsert({
    where: { id: 'clr000000000000000000002' },
    update: {},
    create: {
      id: 'clr000000000000000000002',
      name: 'Node.js do Zero',
      description: 'Aprenda Node.js desde o básico até APIs RESTful completas.',
      level: 'beginner',
      category: 'backend',
      thumbnail: '/images/courses/node-zero.jpg',
      duration: 32,
      price: 199.9,
      status: 'published',
    },
  });
  courses.push(course2);

  const course3 = await prisma.course.upsert({
    where: { id: 'clr000000000000000000003' },
    update: {},
    create: {
      id: 'clr000000000000000000003',
      name: 'Testes com Jest e Cypress',
      description: 'Testes unitários e E2E para aplicações modernas.',
      level: 'intermediate',
      category: 'qa',
      thumbnail: '/images/courses/testing.jpg',
      duration: 24,
      price: 249.9,
      status: 'published',
    },
  });
  courses.push(course3);

  const course4 = await prisma.course.upsert({
    where: { id: 'clr000000000000000000004' },
    update: {},
    create: {
      id: 'clr000000000000000000004',
      name: 'Docker e Kubernetes',
      description: 'Containerização e orquestração para desenvolvedores.',
      level: 'intermediate',
      category: 'devops',
      thumbnail: '/images/courses/k8s.jpg',
      duration: 36,
      price: 349.9,
      status: 'published',
    },
  });
  courses.push(course4);

  const course5 = await prisma.course.upsert({
    where: { id: 'clr000000000000000000005' },
    update: {},
    create: {
      id: 'clr000000000000000000005',
      name: 'Inteligência Artificial com Python',
      description: 'Machine Learning e IA prática com Python e TensorFlow.',
      level: 'advanced',
      category: 'ia',
      thumbnail: '/images/courses/ai-python.jpg',
      duration: 48,
      price: 399.9,
      status: 'published',
    },
  });
  courses.push(course5);

  console.log(`✅ ${courses.length} courses created`);

  // ── Modules & Lessons ──
  const modules = [];

  // React Avançado modules
  const m1 = await prisma.module.upsert({
    where: { id: 'clm000000000000000000001' },
    update: {},
    create: {
      id: 'clm000000000000000000001',
      name: 'Fundamentos de React 19',
      description: 'Novidades do React 19 e Server Components',
      order: 1,
      course: { connect: { id: course1.id } },
      lessons: {
        create: [
          { id: 'cls000000000000000000001', name: 'O que há de novo no React 19', description: 'Overview das novidades', type: 'video', content: 'Video sobre React 19', videoUrl: 'https://example.com/react19-intro', duration: 45, order: 1 },
          { id: 'cls000000000000000000002', name: 'Server Components na prática', description: 'Entenda Server Components', type: 'text', content: '<h1>Server Components</h1><p>...</p>', duration: 30, order: 2 },
          { id: 'cls000000000000000000003', name: 'Actions e Formulários', description: 'Server Actions para formulários', type: 'video', content: 'Video sobre Actions', videoUrl: 'https://example.com/actions', duration: 50, order: 3 },
        ],
      },
    },
  });
  modules.push(m1);

  await prisma.module.upsert({
    where: { id: 'clm000000000000000000002' },
    update: {},
    create: {
      id: 'clm000000000000000000002',
      name: 'Estado e Context API',
      description: 'Gerenciamento de estado global',
      order: 2,
      course: { connect: { id: course1.id } },
      lessons: {
        create: [
          { id: 'cls000000000000000000004', name: 'Context API avançado', description: 'Padrões de Context', type: 'text', content: '<h1>Context API</h1><p>...</p>', duration: 35, order: 1 },
          { id: 'cls000000000000000000005', name: 'Zustand vs Jotai', description: 'Comparação de bibliotecas', type: 'video', content: 'Comparação', videoUrl: 'https://example.com/state-libraries', duration: 40, order: 2 },
        ],
      },
    },
  });

  // Node.js do Zero modules
  await prisma.module.upsert({
    where: { id: 'clm000000000000000000003' },
    update: {},
    create: {
      id: 'clm000000000000000000003',
      name: 'Introdução ao Node.js',
      description: 'Setup e conceitos básicos',
      order: 1,
      course: { connect: { id: course2.id } },
      lessons: {
        create: [
          { id: 'cls000000000000000000006', name: 'Instalação e configuração', description: 'Preparar o ambiente', type: 'video', content: 'Setup do ambiente', videoUrl: 'https://example.com/node-setup', duration: 25, order: 1 },
          { id: 'cls000000000000000000007', name: 'Módulos e npm', description: 'Sistema de módulos', type: 'text', content: '<h1>Módulos Node</h1><p>...</p>', duration: 20, order: 2 },
        ],
      },
    },
  });

  await prisma.module.upsert({
    where: { id: 'clm000000000000000000004' },
    update: {},
    create: {
      id: 'clm000000000000000000004',
      name: 'APIs RESTful',
      description: 'Criar APIs completas com Express',
      order: 2,
      course: { connect: { id: course2.id } },
      lessons: {
        create: [
          { id: 'cls000000000000000000008', name: 'Express.js básico', description: 'Primeiro servidor', type: 'video', content: 'Express básico', videoUrl: 'https://example.com/express-basics', duration: 55, order: 1 },
          { id: 'cls000000000000000000009', name: 'Rotas e Middleware', description: 'Estrutura de rotas', type: 'text', content: '<h1>Middleware</h1><p>...</p>', duration: 40, order: 2 },
          { id: 'cls000000000000000000010', name: 'CRUD com MongoDB', description: 'Operações CRUD', type: 'video', content: 'CRUD MongoDB', videoUrl: 'https://example.com/crud-mongo', duration: 60, order: 3 },
        ],
      },
    },
  });

  console.log(`✅ Modules with lessons created`);

  // ── Enrollments ──
  for (let i = 0; i < students.length; i++) {
    await prisma.enrollment.upsert({
      where: { id: `cle000000000000000000${String(i + 1).padStart(2, '0')}` },
      update: {},
      create: {
        id: `cle000000000000000000${String(i + 1).padStart(2, '0')}`,
        student: { connect: { id: students[i].id } },
        course: { connect: { id: courses[i % courses.length].id } },
        progress: i === 0 ? 75.5 : i === 1 ? 30.0 : 0,
        status: 'active',
      },
    });
  }
  console.log(`✅ ${students.length} enrollments created`);

  // ── Payments ──
  for (let i = 0; i < students.length; i++) {
    await prisma.payment.upsert({
      where: { id: `clp000000000000000000${String(i + 1).padStart(2, '0')}` },
      update: {},
      create: {
        id: `clp000000000000000000${String(i + 1).padStart(2, '0')}`,
        student: { connect: { id: students[i].id } },
        amount: courses[i % courses.length].price,
        status: i === 0 ? 'paid' : 'pending',
        method: i === 0 ? 'pix' : 'credit_card',
        description: `Pagamento - ${courses[i % courses.length].name}`,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        paidAt: i === 0 ? new Date() : null,
      },
    });
  }
  console.log(`✅ ${students.length} payments created`);

  // ── Leads ──
  const leads = [];
  const leadData = [
    { name: 'Empresa TechSolutions', email: 'contato@techsolutions.com', phone: '+551133330001', source: 'website', status: 'qualified', value: 15000 },
    { name: 'Startup InovaApp', email: 'ceo@inovaapp.com.br', phone: '+551133330002', source: 'referral', status: 'proposal', value: 8500 },
    { name: 'Corp Digital Ltda', email: 'rh@corporal.com', phone: '+551133330003', source: 'ads', status: 'negotiation', value: 25000 },
    { name: 'Academia Code', email: 'admin@codeacademy.com', phone: '+551133330004', source: 'social', status: 'won', value: 12000 },
    { name: 'Consulting Pro', email: 'info@consultingpro.com', phone: null, source: 'website', status: 'new', value: 5000 },
  ];

  for (let i = 0; i < leadData.length; i++) {
    const lead = await prisma.lead.upsert({
      where: { id: `clr${String(i + 1).padStart(17, '0')}` },
      update: {},
      create: {
        id: `clr${String(i + 1).padStart(17, '0')}`,
        ...leadData[i],
        notes: `Lead importado - ${leadData[i].source}`,
        user: { connect: { id: i < 2 ? instructor1.id : instructor2.id } },
      },
    });
    leads.push(lead);
  }
  console.log(`✅ ${leads.length} leads created`);

  // ── Notifications ──
  const notifications = [
    { userId: admin.id, title: 'Bem-vindo!', message: 'Sua conta foi criada com sucesso.', type: 'success' },
    { userId: instructor1.id, title: 'Novo Lead', message: 'Você recebeu um novo lead qualificado.', type: 'info' },
    { userId: instructor2.id, title: 'Pagamento Recebido', message: 'Pagamento confirmado para Ana Costa.', type: 'success' },
  ];

  for (const n of notifications) {
    await prisma.notification.upsert({
      where: { id: `cln000000000000000000${String(notifications.indexOf(n) + 1).padStart(2, '0')}` },
      update: {},
      create: {
        id: `cln000000000000000000${String(notifications.indexOf(n) + 1).padStart(2, '0')}`,
        ...n,
      },
    });
  }
  console.log(`✅ ${notifications.length} notifications created`);

  console.log('\n🎉 Database seeding completed successfully!');
  console.log(`   - ${1 + 2} users (1 admin, 2 instructors)`);
  console.log(`   - ${students.length} students`);
  console.log(`   - ${courses.length} courses`);
  console.log(`   - 4 modules with 10 lessons`);
  console.log(`   - ${students.length} enrollments`);
  console.log(`   - ${students.length} payments`);
  console.log(`   - ${leads.length} leads`);
  console.log(`   - ${notifications.length} notifications`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
