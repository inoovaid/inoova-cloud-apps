import { Student, Course, Module, Lesson, Enrollment, Payment, Lead, Automation, Notification } from './types';

const cuid = () => Math.random().toString(36).substring(2, 10) + Date.now().toString(36);

// ==================== COURSES ====================
const createLessons = (modulePrefix: string, count: number): Lesson[] =>
  Array.from({ length: count }, (_, i) => ({
    id: cuid(),
    name: `${modulePrefix} - Aula ${i + 1}: ${['Introdução', 'Conceitos Fundamentais', 'Prática Guiada', 'Exercícios', 'Projeto Prático', 'Revisão', 'Desafio', 'Avaliação'][i % 8]}`,
    description: `Nesta aula vamos aprender os conceitos de ${modulePrefix.toLowerCase()} - parte ${i + 1}`,
    type: (['video', 'text', 'video', 'quiz', 'video', 'pdf', 'video', 'video'] as const)[i % 8],
    videoUrl: i % 3 === 0 ? `https://example.com/video/${modulePrefix}-${i + 1}` : undefined,
    duration: [45, 30, 60, 20, 55, 35, 50, 25][i % 8],
    order: i + 1,
  }));

const createModules = (courseName: string, moduleNames: string[]): Module[] =>
  moduleNames.map((name, i) => ({
    id: cuid(),
    name,
    description: `Módulo de ${name} do curso ${courseName}`,
    order: i + 1,
    lessons: createLessons(name, 6 + Math.floor(Math.random() * 4)),
  }));

export const MOCK_COURSES: Course[] = [
  {
    id: 'course-frontend',
    name: 'Front-end Completo',
    description: 'Domine HTML, CSS, JavaScript, React, Vue.js e as melhores práticas de desenvolvimento front-end. Do básico ao avançado com projetos reais.',
    level: 'beginner',
    category: 'frontend',
    thumbnail: '/courses/frontend.svg',
    duration: 120,
    price: 297,
    status: 'published',
    modules: createModules('Front-end Completo', [
      'Fundamentos HTML5 & CSS3',
      'JavaScript Moderno ES6+',
      'React.js & Next.js',
      'Vue.js & Nuxt.js',
      'TypeScript Avançado',
      'Testes & Performance',
    ]),
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-12-01T10:00:00Z',
  },
  {
    id: 'course-backend',
    name: 'Back-end Completo',
    description: 'Aprenda Node.js, Python, APIs REST, GraphQL, banco de dados e arquitetura de software. Torne-se um desenvolvedor back-end completo.',
    level: 'intermediate',
    category: 'backend',
    thumbnail: '/courses/backend.svg',
    duration: 140,
    price: 347,
    status: 'published',
    modules: createModules('Back-end Completo', [
      'Node.js & Express',
      'Python & FastAPI',
      'APIs REST & GraphQL',
      'Banco de Dados SQL & NoSQL',
      'Arquitetura & Microsserviços',
      'DevOps para Back-end',
    ]),
    createdAt: '2025-02-10T10:00:00Z',
    updatedAt: '2025-11-20T10:00:00Z',
  },
  {
    id: 'course-qa',
    name: 'QA Completo',
    description: 'Qualidade de software, testes automatizados, CI/CD e garantia de qualidade. Aprenda Selenium, Cypress, Playwright e muito mais.',
    level: 'beginner',
    category: 'qa',
    thumbnail: '/courses/qa.svg',
    duration: 80,
    price: 247,
    status: 'published',
    modules: createModules('QA Completo', [
      'Fundamentos de QA',
      'Testes Manuais & Automatizados',
      'Selenium & WebDriver',
      'Cypress & Playwright',
      'Testes de Performance',
      'CI/CD & Quality Gates',
    ]),
    createdAt: '2025-03-05T10:00:00Z',
    updatedAt: '2025-10-15T10:00:00Z',
  },
  {
    id: 'course-devops',
    name: 'DevOps Completo',
    description: 'Docker, Kubernetes, AWS, CI/CD, Terraform e Infrastructure as Code. Do desenvolvimento à produção com eficiência.',
    level: 'advanced',
    category: 'devops',
    thumbnail: '/courses/devops.svg',
    duration: 100,
    price: 397,
    status: 'published',
    modules: createModules('DevOps Completo', [
      'Linux & Shell Script',
      'Docker & Containers',
      'Kubernetes & Orquestração',
      'AWS & Cloud Computing',
      'CI/CD Pipelines',
      'Terraform & IaC',
    ]),
    createdAt: '2025-04-01T10:00:00Z',
    updatedAt: '2025-09-30T10:00:00Z',
  },
  {
    id: 'course-data',
    name: 'Dados Completo',
    description: 'Ciência de dados, engenharia de dados, SQL, Python para dados, Power BI e machine learning. Transforme dados em insights.',
    level: 'intermediate',
    category: 'data',
    thumbnail: '/courses/data.svg',
    duration: 130,
    price: 347,
    status: 'published',
    modules: createModules('Dados Completo', [
      'SQL & Banco de Dados',
      'Python para Dados',
      'Estatística & Análise',
      'Engenharia de Dados',
      'Power BI & Visualização',
      'Machine Learning',
    ]),
    createdAt: '2025-05-10T10:00:00Z',
    updatedAt: '2025-08-25T10:00:00Z',
  },
  {
    id: 'course-ia',
    name: 'IA Completo',
    description: 'Inteligência artificial, deep learning, NLP, visão computacional e LLMs. Domine as tecnologias que estão transformando o mundo.',
    level: 'advanced',
    category: 'ia',
    thumbnail: '/courses/ia.svg',
    duration: 150,
    price: 497,
    status: 'published',
    modules: createModules('IA Completo', [
      'Fundamentos de IA & ML',
      'Deep Learning & Redes Neurais',
      'NLP & Processamento de Texto',
      'Visão Computacional',
      'LLMs & Prompt Engineering',
      'MLOps & Deploy de Modelos',
    ]),
    createdAt: '2025-06-01T10:00:00Z',
    updatedAt: '2025-07-20T10:00:00Z',
  },
];

// ==================== STUDENTS ====================
const firstNames = ['Ana', 'Carlos', 'Maria', 'João', 'Fernanda', 'Rafael', 'Patricia', 'Lucas', 'Camila', 'Bruno', 'Juliana', 'Thiago', 'Larissa', 'Gabriel', 'Amanda', 'Diego', 'Vanessa', 'Felipe', 'Beatriz', 'André', 'Daniela', 'Marcos', 'Letícia', 'Rodrigo', 'Natália', 'Eduardo', 'Isabela', 'Leonardo', 'Priscila', 'Gustavo'];
const lastNames = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Lima', 'Costa', 'Ferreira', 'Rodrigues', 'Almeida', 'Nascimento', 'Pereira', 'Araújo', 'Barbosa', 'Moraes', 'Ribeiro', 'Martins', 'Gomes', 'Carvalho', 'Rocha', 'Dias'];

export const MOCK_STUDENTS: Student[] = Array.from({ length: 50 }, (_, i) => ({
  id: `student-${i + 1}`,
  name: `${firstNames[i % firstNames.length]} ${lastNames[(i * 3 + 7) % lastNames.length]}`,
  email: `${firstNames[i % firstNames.length].toLowerCase()}.${lastNames[(i * 3 + 7) % lastNames.length].toLowerCase()}@email.com`,
  phone: `(11) 9${String(Math.floor(Math.random() * 9000) + 1000)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
  status: (['active', 'active', 'active', 'inactive', 'suspended'] as const)[i % 5],
  createdAt: new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
  updatedAt: new Date(2026, Math.floor(Math.random() * 5), Math.floor(Math.random() * 28) + 1).toISOString(),
}));

// ==================== ENROLLMENTS ====================
export const MOCK_ENROLLMENTS: Enrollment[] = Array.from({ length: 80 }, (_, i) => {
  const student = MOCK_STUDENTS[i % MOCK_STUDENTS.length];
  const course = MOCK_COURSES[i % MOCK_COURSES.length];
  const progress = Math.min(100, Math.floor(Math.random() * 100));
  return {
    id: `enrollment-${i + 1}`,
    studentId: student.id,
    studentName: student.name,
    courseId: course.id,
    courseName: course.name,
    progress,
    status: progress === 100 ? 'completed' : progress > 0 ? 'active' : 'active',
    enrolledAt: new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
    completedAt: progress === 100 ? new Date(2026, Math.floor(Math.random() * 5), Math.floor(Math.random() * 28) + 1).toISOString() : undefined,
  };
});

// ==================== PAYMENTS ====================
export const MOCK_PAYMENTS: Payment[] = Array.from({ length: 120 }, (_, i) => {
  const student = MOCK_STUDENTS[i % MOCK_STUDENTS.length];
  const course = MOCK_COURSES[i % MOCK_COURSES.length];
  const status = (['paid', 'paid', 'paid', 'pending', 'overdue', 'cancelled'] as const)[i % 6];
  return {
    id: `payment-${i + 1}`,
    studentId: student.id,
    studentName: student.name,
    amount: course.price * (0.5 + Math.random() * 0.5),
    status,
    method: (['credit_card', 'pix', 'boleto'] as const)[i % 3],
    description: `Matrícula - ${course.name}`,
    dueDate: new Date(2026, Math.floor(Math.random() * 6), Math.floor(Math.random() * 28) + 1).toISOString(),
    paidAt: status === 'paid' ? new Date(2026, Math.floor(Math.random() * 4), Math.floor(Math.random() * 28) + 1).toISOString() : undefined,
    createdAt: new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
  };
});

// ==================== LEADS ====================
export const MOCK_LEADS: Lead[] = Array.from({ length: 30 }, (_, i) => ({
  id: `lead-${i + 1}`,
  name: `${firstNames[(i + 5) % firstNames.length]} ${lastNames[(i + 10) % lastNames.length]}`,
  email: `${firstNames[(i + 5) % firstNames.length].toLowerCase()}.${lastNames[(i + 10) % lastNames.length].toLowerCase()}@empresa.com`,
  phone: `(21) 9${String(Math.floor(Math.random() * 9000) + 1000)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
  source: (['website', 'referral', 'social', 'ads'] as const)[i % 4],
  status: (['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'] as const)[i % 7],
  notes: `Interessado em ${(MOCK_COURSES[i % MOCK_COURSES.length]).name}. Contato inicial realizado.`,
  value: MOCK_COURSES[i % MOCK_COURSES.length].price,
  userId: i % 3 === 0 ? 'user-1' : undefined,
  createdAt: new Date(2026, Math.floor(Math.random() * 5), Math.floor(Math.random() * 28) + 1).toISOString(),
  updatedAt: new Date(2026, Math.floor(Math.random() * 5), Math.floor(Math.random() * 28) + 1).toISOString(),
}));

// ==================== AUTOMATIONS ====================
export const MOCK_AUTOMATIONS: Automation[] = [
  { id: 'auto-1', name: 'Email de boas-vindas', type: 'email', trigger: 'enrollment_created', action: 'Enviar email de boas-vindas ao aluno', status: 'active', createdAt: '2025-01-01T10:00:00Z' },
  { id: 'auto-2', name: 'Notificação de pagamento', type: 'notification', trigger: 'payment_received', action: 'Notificar equipe financeira', status: 'active', createdAt: '2025-01-01T10:00:00Z' },
  { id: 'auto-3', name: 'Certificado automático', type: 'email', trigger: 'course_completed', action: 'Enviar certificado por email', status: 'active', createdAt: '2025-02-01T10:00:00Z' },
  { id: 'auto-4', name: 'Follow-up de lead', type: 'email', trigger: 'lead_created', action: 'Enviar email de apresentação', status: 'active', createdAt: '2025-03-01T10:00:00Z' },
  { id: 'auto-5', name: 'Lembrete de inatividade', type: 'notification', trigger: 'student_inactive', action: 'Notificar aluno sobre progresso', status: 'inactive', createdAt: '2025-04-01T10:00:00Z' },
  { id: 'auto-6', name: 'Webhook de matrícula', type: 'webhook', trigger: 'enrollment_created', action: 'POST para sistema externo', status: 'active', createdAt: '2025-05-01T10:00:00Z' },
];

// ==================== NOTIFICATIONS ====================
export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'notif-1', title: 'Novo aluno inscrito', message: 'Ana Silva se inscreveu no curso Front-end Completo', type: 'info', read: false, createdAt: '2026-05-03T14:30:00Z' },
  { id: 'notif-2', title: 'Pagamento recebido', message: 'Pagamento de R$ 297,00 recebido via PIX', type: 'success', read: false, createdAt: '2026-05-03T13:00:00Z' },
  { id: 'notif-3', title: 'Curso concluído', message: 'Carlos Santos concluiu o curso Back-end Completo', type: 'success', read: false, createdAt: '2026-05-03T11:00:00Z' },
  { id: 'notif-4', title: 'Pagamento em atraso', message: '2 pagamentos estão em atraso há mais de 7 dias', type: 'warning', read: true, createdAt: '2026-05-02T16:00:00Z' },
  { id: 'notif-5', title: 'Novo lead capturado', message: 'Lead Fernanda Oliveira capturado pelo site', type: 'info', read: true, createdAt: '2026-05-02T10:00:00Z' },
];

// ==================== DASHBOARD STATS ====================
export const MOCK_DASHBOARD_STATS = {
  activeStudents: MOCK_STUDENTS.filter(s => s.status === 'active').length,
  newEnrollments: 23,
  monthlyRevenue: MOCK_PAYMENTS.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0),
  completionRate: Math.round(MOCK_ENROLLMENTS.filter(e => e.status === 'completed').length / MOCK_ENROLLMENTS.length * 100),
  revenueByMonth: [
    { month: 'Jan', revenue: 18500 },
    { month: 'Fev', revenue: 22300 },
    { month: 'Mar', revenue: 19800 },
    { month: 'Abr', revenue: 27600 },
    { month: 'Mai', revenue: 31200 },
    { month: 'Jun', revenue: 28900 },
    { month: 'Jul', revenue: 33400 },
    { month: 'Ago', revenue: 29100 },
    { month: 'Set', revenue: 35800 },
    { month: 'Out', revenue: 38200 },
    { month: 'Nov', revenue: 41500 },
    { month: 'Dez', revenue: 44800 },
  ],
  enrollmentsByMonth: [
    { month: 'Jan', count: 45 },
    { month: 'Fev', count: 52 },
    { month: 'Mar', count: 48 },
    { month: 'Abr', count: 61 },
    { month: 'Mai', count: 55 },
    { month: 'Jun', count: 67 },
    { month: 'Jul', count: 72 },
    { month: 'Ago', count: 63 },
    { month: 'Set', count: 78 },
    { month: 'Out', count: 85 },
    { month: 'Nov', count: 91 },
    { month: 'Dez', count: 96 },
  ],
  studentsByCourse: MOCK_COURSES.map(c => ({
    name: c.name.replace(' Completo', ''),
    students: MOCK_ENROLLMENTS.filter(e => e.courseId === c.id).length,
  })),
  revenueByCourse: MOCK_COURSES.map(c => ({
    name: c.name.replace(' Completo', ''),
    revenue: MOCK_PAYMENTS.filter(p => p.description?.includes(c.name) && p.status === 'paid').reduce((sum, p) => sum + p.amount, 0),
  })),
  recentActivities: [
    { id: '1', type: 'enrollment', description: 'Ana Silva se inscreveu em Front-end Completo', time: 'Há 5 minutos' },
    { id: '2', type: 'payment', description: 'Pagamento de R$ 297,00 recebido de Carlos Santos', time: 'Há 15 minutos' },
    { id: '3', type: 'completion', description: 'Maria Oliveira concluiu Back-end Completo', time: 'Há 1 hora' },
    { id: '4', type: 'lead', description: 'Novo lead: Fernando Costa (via website)', time: 'Há 2 horas' },
    { id: '5', type: 'enrollment', description: 'João Lima se inscreveu em QA Completo', time: 'Há 3 horas' },
    { id: '6', type: 'payment', description: 'Pagamento de R$ 497,00 recebido via PIX', time: 'Há 4 horas' },
    { id: '7', type: 'completion', description: '5 alunos concluíram DevOps Completo hoje', time: 'Há 5 horas' },
    { id: '8', type: 'lead', description: 'Lead qualificado: Tech Solutions Corp', time: 'Há 6 horas' },
  ],
};
