const { db } = require('@/lib/db')
const { hash } = require('bcryptjs')

async function main() {
  console.log('🌱 Seeding database...')

  // Clean up
  await db.commission.deleteMany()
  await db.notification.deleteMany()
  await db.account.deleteMany()
  await db.accountPlan.deleteMany()
  await db.client.deleteMany()
  await db.user.deleteMany()
  await db.automationRule.deleteMany()
  await db.tag.deleteMany()
  await db.tenant.deleteMany()

  // ============ TENANT ============

  const tenant = await db.tenant.upsert({
    where: { id: "tenant-1" },
    update: {},
    create: {
      id: "tenant-1",
      name: "FinanceFlow Corp",
      cnpj: "12.345.678/0001-90",
      plan: "pro"
    }
  })

  
  // ============ USERS ============
  const passwordHash = await hash('123456', 10)

  const users = await Promise.all([
    db.user.create({
      data: {
        name: 'Carlos Admin',
        email: 'carlos@financeflow.com',
        password: passwordHash,
        role: 'admin',
        tenantId: tenant.id,
      },
    }),
    db.user.create({
      data: {
        name: 'Ana Financeiro',
        email: 'ana@financeflow.com',
        password: passwordHash,
        role: 'financeiro',
        tenantId: tenant.id,
      },
    }),
    db.user.create({
      data: {
        name: 'Pedro Vendedor',
        email: 'pedro@financeflow.com',
        password: passwordHash,
        role: 'vendedor',
        tenantId: tenant.id,
      },
    }),
  ])

  // ============ CLIENTS ============
  const clients = await Promise.all([
    db.client.create({
      data: {
        name: 'Tech Solutions Ltda',
        email: 'contato@techsolutions.com',
        phone: '(11) 99999-1234',
        cpfCnpj: '98.765.432/0001-10',
        city: 'São Paulo',
        state: 'SP',
        tags: 'empresa,tecnologia',
        tenantId: tenant.id,
      },
    }),
    db.client.create({
      data: {
        name: 'Maria Silva',
        email: 'maria.silva@email.com',
        phone: '(21) 98888-5678',
        cpfCnpj: '123.456.789-00',
        city: 'Rio de Janeiro',
        state: 'RJ',
        tags: 'pf,vip',
        tenantId: tenant.id,
      },
    }),
    db.client.create({
      data: {
        name: 'Comércio ABC',
        email: 'financeiro@comercioabc.com',
        phone: '(31) 97777-9012',
        cpfCnpj: '45.678.901/0001-23',
        city: 'Belo Horizonte',
        state: 'MG',
        tags: 'empresa,varejo',
        tenantId: tenant.id,
      },
    }),
    db.client.create({
      data: {
        name: 'João Oliveira',
        email: 'joao.oliveira@email.com',
        phone: '(41) 96666-3456',
        cpfCnpj: '987.654.321-00',
        city: 'Curitiba',
        state: 'PR',
        tags: 'pf',
        tenantId: tenant.id,
      },
    }),
    db.client.create({
      data: {
        name: 'Startup Inova',
        email: 'contato@startuinova.com',
        phone: '(51) 95555-7890',
        cpfCnpj: '56.789.012/0001-34',
        city: 'Porto Alegre',
        state: 'RS',
        tags: 'empresa,startup',
        tenantId: tenant.id,
      },
    }),
    db.client.create({
      data: {
        name: 'Restaurante Sabor & Arte',
        email: 'contato@saborarte.com',
        phone: '(48) 94444-1234',
        cpfCnpj: '67.890.123/0001-45',
        city: 'Florianópolis',
        state: 'SC',
        tags: 'empresa,alimentacao',
        tenantId: tenant.id,
      },
    }),
    db.client.create({
      data: {
        name: 'Fernanda Costa',
        email: 'fernanda.costa@email.com',
        phone: '(61) 93333-5678',
        cpfCnpj: '321.654.987-00',
        city: 'Brasília',
        state: 'DF',
        tags: 'pf,consultora',
        tenantId: tenant.id,
      },
    }),
    db.client.create({
      data: {
        name: 'Imobiliária Premium',
        email: 'contato@imobpremium.com',
        phone: '(71) 92222-9012',
        cpfCnpj: '78.901.234/0001-56',
        city: 'Salvador',
        state: 'BA',
        tags: 'empresa,imobiliaria',
        tenantId: tenant.id,
      },
    }),

    db.client.create({ data: { name: 'Clínica Saúde Total',      email: 'admin@clinicasaude.com',     phone: '(11) 91111-2233', cpfCnpj: '11.222.333/0001-44', city: 'São Paulo',      state: 'SP', tags: 'empresa,saude',       tenantId: tenant.id } }),
    db.client.create({ data: { name: 'Edu Academy',              email: 'financeiro@eduacademy.com',  phone: '(21) 90000-5566', cpfCnpj: '22.333.444/0001-55', city: 'Rio de Janeiro', state: 'RJ', tags: 'empresa,educacao',    tenantId: tenant.id } }),
    db.client.create({ data: { name: 'Ricardo Mendes',           email: 'ricardo.mendes@email.com',   phone: '(11) 98765-4321', cpfCnpj: '456.789.123-00',     city: 'Campinas',       state: 'SP', tags: 'pf,vip',              tenantId: tenant.id } }),
    db.client.create({ data: { name: 'Logística Rápida Ltda',    email: 'ops@logisticarapida.com',    phone: '(19) 97654-3210', cpfCnpj: '33.444.555/0001-66', city: 'Campinas',       state: 'SP', tags: 'empresa,logistica',   tenantId: tenant.id } }),

  ])

  // ============ ACCOUNT PLANS ============
  const accountPlans = await Promise.all([
    db.accountPlan.create({ data: { name: 'Receita de Serviços', type: 'receita', tenantId: tenant.id } }),
    db.accountPlan.create({ data: { name: 'Vendas de Produtos', type: 'receita', tenantId: tenant.id } }),
    db.accountPlan.create({ data: { name: 'Aluguel', type: 'despesa', tenantId: tenant.id } }),
    db.accountPlan.create({ data: { name: 'Salários', type: 'despesa', tenantId: tenant.id } }),
    db.accountPlan.create({ data: { name: 'Software e Licenças', type: 'despesa', tenantId: tenant.id } }),
    db.accountPlan.create({ data: { name: 'Consultoria', type: 'receita', tenantId: tenant.id } }),
    db.accountPlan.create({ data: { name: 'Marketing', type: 'despesa', tenantId: tenant.id } }),
    db.accountPlan.create({ data: { name: 'Fornecedores', type: 'despesa', tenantId: tenant.id } }),
    db.accountPlan.create({ data: { name: 'Projetos Especiais',  type: 'receita', tenantId: tenant.id } }), // 8
    db.accountPlan.create({ data: { name: 'Infraestrutura',      type: 'despesa', tenantId: tenant.id } }), // 9
  ])

  // ============ TAGS ============
  await Promise.all([
    db.tag.create({ data: { name: 'Urgente', color: '#ef4444', tenantId: tenant.id } }),
    db.tag.create({ data: { name: 'VIP', color: '#f59e0b', tenantId: tenant.id } }),
    db.tag.create({ data: { name: 'Recorrente', color: '#10b981', tenantId: tenant.id } }),
    db.tag.create({ data: { name: 'Contrato', color: '#3b82f6', tenantId: tenant.id } }),
    db.tag.create({ data: { name: 'Pessoal', color: '#8b5cf6', tenantId: tenant.id } }),
  ])

  // ============ ACCOUNTS (Financial Records) ============
  const now = new Date()
  const accounts = []

  // Helper to create dates relative to now
  const daysFromNow = (days) => {
    const d = new Date(now)
    d.setDate(d.getDate() + days)
    return d
  }
  const daysAgo = (days) => daysFromNow(-days)

  // Create accounts with varied statuses and dates
  const accountData = [
    // Vencidas (overdue) - accounts to receive
    { desc: 'Manutenção Mensal - Tech Solutions', amount: 5500, dueDate: daysAgo(15), status: 'vencida', type: 'receber', clientId: 0, planId: 0, tags: 'empresa,contrato', creatorId: 1 },
    { desc: 'Consultoria Estratégica - Startup Inova', amount: 12000, dueDate: daysAgo(10), status: 'vencida', type: 'receber', clientId: 4, planId: 5, tags: 'empresa,startup', creatorId: 2 },
    { desc: 'Aluguel Escritório', amount: 8500, dueDate: daysAgo(5), status: 'vencida', type: 'pagar', clientId: null, planId: 2, tags: 'fixo', creatorId: 0 },

    // Vence hoje
    { desc: 'Licença Software Anual', amount: 2400, dueDate: now, status: 'pendente', type: 'pagar', clientId: null, planId: 4, tags: 'software', creatorId: 0 },
    { desc: 'Pagamento Projeto Web - Maria Silva', amount: 3500, dueDate: now, status: 'pendente', type: 'receber', clientId: 1, planId: 0, tags: 'pf,vip', creatorId: 2 },

    // Vence amanhã
    { desc: 'Marketing Digital - Mês Atual', amount: 4200, dueDate: daysFromNow(1), status: 'pendente', type: 'pagar', clientId: null, planId: 6, tags: 'marketing', creatorId: 0 },
    { desc: 'Hospedagem Cloud - Startup Inova', amount: 1800, dueDate: daysFromNow(1), status: 'pendente', type: 'receber', clientId: 4, planId: 0, tags: 'empresa,tecnologia', creatorId: 1 },

    // Pendentes futuras
    { desc: 'Salários - Equipe Técnica', amount: 28000, dueDate: daysFromNow(5), status: 'pendente', type: 'pagar', clientId: null, planId: 3, tags: 'fixo,team', creatorId: 0 },
    { desc: 'Projeto E-commerce - Comércio ABC', amount: 18500, dueDate: daysFromNow(7), status: 'pendente', type: 'receber', clientId: 2, planId: 0, tags: 'empresa,contrato', creatorId: 2 },
    { desc: 'Seguro Empresarial', amount: 3200, dueDate: daysFromNow(10), status: 'pendente', type: 'pagar', clientId: null, planId: 7, tags: 'fixo', creatorId: 0 },
    { desc: 'Consultoria Financeira - Fernanda Costa', amount: 6000, dueDate: daysFromNow(12), status: 'pendente', type: 'receber', clientId: 6, planId: 5, tags: 'pf,consultora', creatorId: 1 },
    { desc: 'Material de Escritório', amount: 850, dueDate: daysFromNow(15), status: 'pendente', type: 'pagar', clientId: null, planId: 7, tags: '', creatorId: 0 },
    { desc: 'Gestão de Redes Sociais - Restaurante', amount: 2800, dueDate: daysFromNow(18), status: 'pendente', type: 'receber', clientId: 5, planId: 0, tags: 'empresa,alimentacao', creatorId: 2 },
    { desc: 'Conta de Energia', amount: 1200, dueDate: daysFromNow(20), status: 'pendente', type: 'pagar', clientId: null, planId: 7, tags: 'fixo', creatorId: 0 },

    // Pagas (received/paid)
    { desc: 'Desenvolvimento App - Imobiliária Premium', amount: 25000, dueDate: daysAgo(20), paymentDate: daysAgo(18), status: 'paga', type: 'receber', clientId: 7, planId: 0, tags: 'empresa,imobiliaria', creatorId: 1 },
    { desc: 'Serviço de Limpeza', amount: 1500, dueDate: daysAgo(25), paymentDate: daysAgo(23), status: 'paga', type: 'pagar', clientId: null, planId: 7, tags: '', creatorId: 0 },
    { desc: 'Consultoria Mensal - Tech Solutions', amount: 8000, dueDate: daysAgo(30), paymentDate: daysAgo(28), status: 'paga', type: 'receber', clientId: 0, planId: 5, tags: 'empresa,contrato', creatorId: 2 },
    { desc: 'Internet Fibra', amount: 450, dueDate: daysAgo(35), paymentDate: daysAgo(33), status: 'paga', type: 'pagar', clientId: null, planId: 4, tags: 'fixo', creatorId: 0 },
    { desc: 'Projeto Landing Page - João Oliveira', amount: 4500, dueDate: daysAgo(40), paymentDate: daysAgo(38), status: 'paga', type: 'receber', clientId: 3, planId: 0, tags: 'pf', creatorId: 1 },
    { desc: 'Manutenção Ar Condicionado', amount: 780, dueDate: daysAgo(45), paymentDate: daysAgo(43), status: 'paga', type: 'pagar', clientId: null, planId: 7, tags: '', creatorId: 0 },

    // Previous month - paid
    { desc: 'Receita Recorrente - Tech Solutions (Mês Anterior)', amount: 5500, dueDate: daysAgo(45), paymentDate: daysAgo(44), status: 'paga', type: 'receber', clientId: 0, planId: 0, tags: 'empresa,recorrente', creatorId: 1 },
    { desc: 'Salários (Mês Anterior)', amount: 28000, dueDate: daysAgo(35), paymentDate: daysAgo(34), status: 'paga', type: 'pagar', clientId: null, planId: 3, tags: 'fixo', creatorId: 0 },
    { desc: 'Aluguel (Mês Anterior)', amount: 8500, dueDate: daysAgo(35), paymentDate: daysAgo(33), status: 'paga', type: 'pagar', clientId: null, planId: 2, tags: 'fixo', creatorId: 0 },

    // More historical paid
    { desc: 'Projeto de Identidade Visual - Comércio ABC', amount: 9500, dueDate: daysAgo(60), paymentDate: daysAgo(58), status: 'paga', type: 'receber', clientId: 2, planId: 0, tags: 'empresa,contrato', creatorId: 2 },
    { desc: 'Compra de Equipamentos', amount: 6200, dueDate: daysAgo(55), paymentDate: daysAgo(53), status: 'paga', type: 'pagar', clientId: null, planId: 7, tags: 'investimento', creatorId: 0 },
    { desc: 'Assessoria Jurídica', amount: 3000, dueDate: daysAgo(70), paymentDate: daysAgo(68), status: 'paga', type: 'pagar', clientId: null, planId: 7, tags: '', creatorId: 0 },
    { desc: 'Manutenção Site - Startup Inova', amount: 2200, dueDate: daysAgo(75), paymentDate: daysAgo(74), status: 'paga', type: 'receber', clientId: 4, planId: 0, tags: 'empresa,tecnologia', creatorId: 1 },
    { desc: 'Vendas de Produtos - Mês Anterior', amount: 15000, dueDate: daysAgo(50), paymentDate: daysAgo(49), status: 'paga', type: 'receber', clientId: 2, planId: 1, tags: 'empresa,varejo', creatorId: 2 },

    // Recurring accounts
    { desc: 'Assinatura CRM Pro', amount: 299, dueDate: daysFromNow(3), status: 'pendente', type: 'pagar', clientId: null, planId: 4, tags: 'software,recorrente', creatorId: 0, recurring: true, recurringCycle: 'mensal' },
    { desc: 'Google Workspace', amount: 672, dueDate: daysFromNow(8), status: 'pendente', type: 'pagar', clientId: null, planId: 4, tags: 'software,recorrente', creatorId: 0, recurring: true, recurringCycle: 'mensal' },

    { desc: 'Salários – Mai/Ano Anterior',              amount: 24000, dueDate: dateAt(12,  5), paymentDate: dateAt(12,  5), status: 'paga', type: 'pagar',   clientId: null, planId: 3, tags: 'fixo',                creatorId: 0 },
    { desc: 'Aluguel Escritório – Mai/Ano Anterior',    amount:  7500, dueDate: dateAt(12,  1), paymentDate: dateAt(12,  1), status: 'paga', type: 'pagar',   clientId: null, planId: 2, tags: 'fixo',                creatorId: 0 },
    { desc: 'Manutenção Mensal – Tech Solutions',       amount:  5000, dueDate: dateAt(12, 10), paymentDate: dateAt(12, 12), status: 'paga', type: 'receber', clientId: 0,    planId: 0, tags: 'empresa,contrato',    creatorId: 1 },
    { desc: 'Consultoria Mensal – Startup Inova',       amount:  4500, dueDate: dateAt(12, 15), paymentDate: dateAt(12, 17), status: 'paga', type: 'receber', clientId: 4,    planId: 5, tags: 'empresa,startup',     creatorId: 2 },
    { desc: 'Marketing Digital – Mai/Ano Anterior',     amount:  3800, dueDate: dateAt(12,  8), paymentDate: dateAt(12,  9), status: 'paga', type: 'pagar',   clientId: null, planId: 6, tags: 'marketing',           creatorId: 0 },
    { desc: 'Software – Mai/Ano Anterior',              amount:   890, dueDate: dateAt(12, 10), paymentDate: dateAt(12, 10), status: 'paga', type: 'pagar',   clientId: null, planId: 4, tags: 'software,recorrente', creatorId: 0 },
    { desc: 'Projeto Website – João Oliveira',          amount:  6000, dueDate: dateAt(12, 20), paymentDate: dateAt(12, 22), status: 'paga', type: 'receber', clientId: 3,    planId: 0, tags: 'pf',                  creatorId: 1 },
    { desc: 'Fornecedor Gráfica – Mai/Ano Anterior',    amount:  1200, dueDate: dateAt(12, 25), paymentDate: dateAt(12, 25), status: 'paga', type: 'pagar',   clientId: null, planId: 7, tags: '',                    creatorId: 0 },
    { desc: 'Vendas Produtos – Mai/Ano Anterior',       amount:  8500, dueDate: dateAt(12, 28), paymentDate: dateAt(12, 28), status: 'paga', type: 'receber', clientId: 2,    planId: 1, tags: 'empresa,varejo',      creatorId: 2 },
 
    // ── MÊS 11 (junho) ───────────────────────────────────────────────────
    { desc: 'Salários – Jun',                           amount: 24000, dueDate: dateAt(11,  5), paymentDate: dateAt(11,  5), status: 'paga', type: 'pagar',   clientId: null, planId: 3, tags: 'fixo',                creatorId: 0 },
    { desc: 'Aluguel Escritório – Jun',                 amount:  7500, dueDate: dateAt(11,  1), paymentDate: dateAt(11,  1), status: 'paga', type: 'pagar',   clientId: null, planId: 2, tags: 'fixo',                creatorId: 0 },
    { desc: 'Manutenção Mensal – Tech Solutions – Jun', amount:  5000, dueDate: dateAt(11, 10), paymentDate: dateAt(11, 12), status: 'paga', type: 'receber', clientId: 0,    planId: 0, tags: 'empresa,contrato',    creatorId: 1 },
    { desc: 'Projeto App Mobile – Clínica Saúde Total', amount: 18000, dueDate: dateAt(11, 15), paymentDate: dateAt(11, 18), status: 'paga', type: 'receber', clientId: 8,    planId: 8, tags: 'empresa,saude',       creatorId: 2 },
    { desc: 'Marketing Digital – Jun',                  amount:  3800, dueDate: dateAt(11,  8), paymentDate: dateAt(11,  8), status: 'paga', type: 'pagar',   clientId: null, planId: 6, tags: 'marketing',           creatorId: 0 },
    { desc: 'Software – Jun',                           amount:   890, dueDate: dateAt(11, 10), paymentDate: dateAt(11, 10), status: 'paga', type: 'pagar',   clientId: null, planId: 4, tags: 'software,recorrente', creatorId: 0 },
    { desc: 'Consultoria Estratégica – Comércio ABC',   amount:  7200, dueDate: dateAt(11, 20), paymentDate: dateAt(11, 21), status: 'paga', type: 'receber', clientId: 2,    planId: 5, tags: 'empresa,varejo',      creatorId: 1 },
    { desc: 'Internet e Telefonia – Jun',               amount:   650, dueDate: dateAt(11, 12), paymentDate: dateAt(11, 12), status: 'paga', type: 'pagar',   clientId: null, planId: 9, tags: 'fixo',                creatorId: 0 },
    { desc: 'Vendas Produtos – Jun',                    amount:  9200, dueDate: dateAt(11, 28), paymentDate: dateAt(11, 29), status: 'paga', type: 'receber', clientId: 2,    planId: 1, tags: 'empresa,varejo',      creatorId: 2 },
    { desc: 'Energia Elétrica – Jun',                   amount:  1100, dueDate: dateAt(11, 15), paymentDate: dateAt(11, 15), status: 'paga', type: 'pagar',   clientId: null, planId: 9, tags: 'fixo',                creatorId: 0 },
 
    // ── MÊS 10 (julho) ───────────────────────────────────────────────────
    { desc: 'Salários – Jul',                           amount: 25000, dueDate: dateAt(10,  5), paymentDate: dateAt(10,  5), status: 'paga', type: 'pagar',   clientId: null, planId: 3, tags: 'fixo',                creatorId: 0 },
    { desc: 'Aluguel Escritório – Jul',                 amount:  7500, dueDate: dateAt(10,  1), paymentDate: dateAt(10,  1), status: 'paga', type: 'pagar',   clientId: null, planId: 2, tags: 'fixo',                creatorId: 0 },
    { desc: 'Manutenção Mensal – Tech Solutions – Jul', amount:  5000, dueDate: dateAt(10, 10), paymentDate: dateAt(10, 11), status: 'paga', type: 'receber', clientId: 0,    planId: 0, tags: 'empresa,contrato',    creatorId: 1 },
    { desc: 'Gestão Redes Sociais – Restaurante – Jul', amount:  2800, dueDate: dateAt(10, 18), paymentDate: dateAt(10, 20), status: 'paga', type: 'receber', clientId: 5,    planId: 0, tags: 'empresa,alimentacao', creatorId: 2 },
    { desc: 'Marketing Digital – Jul',                  amount:  4000, dueDate: dateAt(10,  8), paymentDate: dateAt(10,  8), status: 'paga', type: 'pagar',   clientId: null, planId: 6, tags: 'marketing',           creatorId: 0 },
    { desc: 'Software – Jul',                           amount:   890, dueDate: dateAt(10, 10), paymentDate: dateAt(10, 10), status: 'paga', type: 'pagar',   clientId: null, planId: 4, tags: 'software,recorrente', creatorId: 0 },
    { desc: 'Projeto E-learning – Edu Academy',         amount: 22000, dueDate: dateAt(10, 20), paymentDate: dateAt(10, 22), status: 'paga', type: 'receber', clientId: 9,    planId: 8, tags: 'empresa,educacao',    creatorId: 1 },
    { desc: 'Internet e Telefonia – Jul',               amount:   650, dueDate: dateAt(10, 12), paymentDate: dateAt(10, 12), status: 'paga', type: 'pagar',   clientId: null, planId: 9, tags: 'fixo',                creatorId: 0 },
    { desc: 'Energia Elétrica – Jul',                   amount:  1100, dueDate: dateAt(10, 15), paymentDate: dateAt(10, 15), status: 'paga', type: 'pagar',   clientId: null, planId: 9, tags: 'fixo',                creatorId: 0 },
    { desc: 'Vendas Produtos – Jul',                    amount: 10500, dueDate: dateAt(10, 28), paymentDate: dateAt(10, 28), status: 'paga', type: 'receber', clientId: 2,    planId: 1, tags: 'empresa,varejo',      creatorId: 2 },
 
    // ── MÊS 9 (agosto) ───────────────────────────────────────────────────
    { desc: 'Salários – Ago',                           amount: 25000, dueDate: dateAt(9,  5), paymentDate: dateAt(9,  5), status: 'paga', type: 'pagar',   clientId: null, planId: 3, tags: 'fixo',                creatorId: 0 },
    { desc: 'Aluguel Escritório – Ago',                 amount:  7800, dueDate: dateAt(9,  1), paymentDate: dateAt(9,  1), status: 'paga', type: 'pagar',   clientId: null, planId: 2, tags: 'fixo',                creatorId: 0 },
    { desc: 'Manutenção Mensal – Tech Solutions – Ago', amount:  5200, dueDate: dateAt(9, 10), paymentDate: dateAt(9, 11), status: 'paga', type: 'receber', clientId: 0,    planId: 0, tags: 'empresa,contrato',    creatorId: 1 },
    { desc: 'Consultoria – Fernanda Costa – Ago',       amount:  6000, dueDate: dateAt(9, 12), paymentDate: dateAt(9, 14), status: 'paga', type: 'receber', clientId: 6,    planId: 5, tags: 'pf,consultora',       creatorId: 1 },
    { desc: 'Marketing Digital – Ago',                  amount:  4000, dueDate: dateAt(9,  8), paymentDate: dateAt(9,  9), status: 'paga', type: 'pagar',   clientId: null, planId: 6, tags: 'marketing',           creatorId: 0 },
    { desc: 'Software – Ago',                           amount:   890, dueDate: dateAt(9, 10), paymentDate: dateAt(9, 10), status: 'paga', type: 'pagar',   clientId: null, planId: 4, tags: 'software,recorrente', creatorId: 0 },
    { desc: 'Hospedagem Cloud – Startup Inova – Ago',   amount:  1800, dueDate: dateAt(9, 15), paymentDate: dateAt(9, 16), status: 'paga', type: 'receber', clientId: 4,    planId: 0, tags: 'empresa,tecnologia',  creatorId: 1 },
    { desc: 'Compra de Equipamentos – Ago',             amount:  8500, dueDate: dateAt(9, 20), paymentDate: dateAt(9, 20), status: 'paga', type: 'pagar',   clientId: null, planId: 9, tags: 'investimento',        creatorId: 0 },
    { desc: 'Internet e Telefonia – Ago',               amount:   650, dueDate: dateAt(9, 12), paymentDate: dateAt(9, 12), status: 'paga', type: 'pagar',   clientId: null, planId: 9, tags: 'fixo',                creatorId: 0 },
    { desc: 'Vendas Produtos – Ago',                    amount: 11200, dueDate: dateAt(9, 28), paymentDate: dateAt(9, 28), status: 'paga', type: 'receber', clientId: 2,    planId: 1, tags: 'empresa,varejo',      creatorId: 2 },
    { desc: 'Projeto Identidade Visual – Ricardo M.',   amount:  9500, dueDate: dateAt(9, 25), paymentDate: dateAt(9, 26), status: 'paga', type: 'receber', clientId: 10,   planId: 8, tags: 'pf,vip',              creatorId: 2 },
 
    // ── MÊS 8 (setembro) ─────────────────────────────────────────────────
    { desc: 'Salários – Set',                           amount: 25000, dueDate: dateAt(8,  5), paymentDate: dateAt(8,  5), status: 'paga', type: 'pagar',   clientId: null, planId: 3, tags: 'fixo',                creatorId: 0 },
    { desc: 'Aluguel Escritório – Set',                 amount:  7800, dueDate: dateAt(8,  1), paymentDate: dateAt(8,  1), status: 'paga', type: 'pagar',   clientId: null, planId: 2, tags: 'fixo',                creatorId: 0 },
    { desc: 'Manutenção Mensal – Tech Solutions – Set', amount:  5200, dueDate: dateAt(8, 10), paymentDate: dateAt(8, 12), status: 'paga', type: 'receber', clientId: 0,    planId: 0, tags: 'empresa,contrato',    creatorId: 1 },
    { desc: 'Gestão Redes Sociais – Restaurante – Set', amount:  2800, dueDate: dateAt(8, 18), paymentDate: dateAt(8, 20), status: 'paga', type: 'receber', clientId: 5,    planId: 0, tags: 'empresa,alimentacao', creatorId: 2 },
    { desc: 'Marketing Digital – Set',                  amount:  4200, dueDate: dateAt(8,  8), paymentDate: dateAt(8,  8), status: 'paga', type: 'pagar',   clientId: null, planId: 6, tags: 'marketing',           creatorId: 0 },
    { desc: 'Software – Set',                           amount:   971, dueDate: dateAt(8, 10), paymentDate: dateAt(8, 10), status: 'paga', type: 'pagar',   clientId: null, planId: 4, tags: 'software,recorrente', creatorId: 0 },
    { desc: 'Projeto CRM – Logística Rápida',           amount: 15000, dueDate: dateAt(8, 20), paymentDate: dateAt(8, 22), status: 'paga', type: 'receber', clientId: 11,   planId: 8, tags: 'empresa,logistica',   creatorId: 1 },
    { desc: 'Internet e Telefonia – Set',               amount:   650, dueDate: dateAt(8, 12), paymentDate: dateAt(8, 12), status: 'paga', type: 'pagar',   clientId: null, planId: 9, tags: 'fixo',                creatorId: 0 },
    { desc: 'Energia Elétrica – Set',                   amount:  1150, dueDate: dateAt(8, 15), paymentDate: dateAt(8, 15), status: 'paga', type: 'pagar',   clientId: null, planId: 9, tags: 'fixo',                creatorId: 0 },
    { desc: 'Vendas Produtos – Set',                    amount: 12000, dueDate: dateAt(8, 28), paymentDate: dateAt(8, 28), status: 'paga', type: 'receber', clientId: 2,    planId: 1, tags: 'empresa,varejo',      creatorId: 2 },
 
    // ── MÊS 7 (outubro) ──────────────────────────────────────────────────
    { desc: 'Salários – Out',                           amount: 26000, dueDate: dateAt(7,  5), paymentDate: dateAt(7,  5), status: 'paga', type: 'pagar',   clientId: null, planId: 3, tags: 'fixo',                creatorId: 0 },
    { desc: 'Aluguel Escritório – Out',                 amount:  7800, dueDate: dateAt(7,  1), paymentDate: dateAt(7,  1), status: 'paga', type: 'pagar',   clientId: null, planId: 2, tags: 'fixo',                creatorId: 0 },
    { desc: 'Manutenção Mensal – Tech Solutions – Out', amount:  5500, dueDate: dateAt(7, 10), paymentDate: dateAt(7, 12), status: 'paga', type: 'receber', clientId: 0,    planId: 0, tags: 'empresa,contrato',    creatorId: 1 },
    { desc: 'Consultoria – Startup Inova – Out',        amount: 12000, dueDate: dateAt(7, 15), paymentDate: dateAt(7, 16), status: 'paga', type: 'receber', clientId: 4,    planId: 5, tags: 'empresa,startup',     creatorId: 2 },
    { desc: 'Marketing Digital – Out',                  amount:  4200, dueDate: dateAt(7,  8), paymentDate: dateAt(7,  8), status: 'paga', type: 'pagar',   clientId: null, planId: 6, tags: 'marketing',           creatorId: 0 },
    { desc: 'Software – Out',                           amount:   971, dueDate: dateAt(7, 10), paymentDate: dateAt(7, 10), status: 'paga', type: 'pagar',   clientId: null, planId: 4, tags: 'software,recorrente', creatorId: 0 },
    { desc: 'Hospedagem Cloud – Startup Inova – Out',   amount:  1800, dueDate: dateAt(7, 15), paymentDate: dateAt(7, 16), status: 'paga', type: 'receber', clientId: 4,    planId: 0, tags: 'empresa,tecnologia',  creatorId: 1 },
    { desc: 'Seguro Empresarial – Out',                 amount:  3200, dueDate: dateAt(7, 10), paymentDate: dateAt(7, 10), status: 'paga', type: 'pagar',   clientId: null, planId: 7, tags: 'fixo',                creatorId: 0 },
    { desc: 'Internet e Telefonia – Out',               amount:   650, dueDate: dateAt(7, 12), paymentDate: dateAt(7, 12), status: 'paga', type: 'pagar',   clientId: null, planId: 9, tags: 'fixo',                creatorId: 0 },
    { desc: 'Vendas Produtos – Out',                    amount: 13500, dueDate: dateAt(7, 28), paymentDate: dateAt(7, 28), status: 'paga', type: 'receber', clientId: 2,    planId: 1, tags: 'empresa,varejo',      creatorId: 2 },
    { desc: 'Projeto Dashboard – Clínica Saúde Total',  amount: 11000, dueDate: dateAt(7, 22), paymentDate: dateAt(7, 24), status: 'paga', type: 'receber', clientId: 8,    planId: 8, tags: 'empresa,saude',       creatorId: 1 },
 
    // ── MÊS 6 (novembro) ─────────────────────────────────────────────────
    { desc: 'Salários – Nov',                           amount: 26000, dueDate: dateAt(6,  5), paymentDate: dateAt(6,  5), status: 'paga', type: 'pagar',   clientId: null, planId: 3, tags: 'fixo',                creatorId: 0 },
    { desc: 'Aluguel Escritório – Nov',                 amount:  8000, dueDate: dateAt(6,  1), paymentDate: dateAt(6,  1), status: 'paga', type: 'pagar',   clientId: null, planId: 2, tags: 'fixo',                creatorId: 0 },
    { desc: 'Manutenção Mensal – Tech Solutions – Nov', amount:  5500, dueDate: dateAt(6, 10), paymentDate: dateAt(6, 12), status: 'paga', type: 'receber', clientId: 0,    planId: 0, tags: 'empresa,contrato',    creatorId: 1 },
    { desc: 'Gestão Redes Sociais – Restaurante – Nov', amount:  2800, dueDate: dateAt(6, 18), paymentDate: dateAt(6, 20), status: 'paga', type: 'receber', clientId: 5,    planId: 0, tags: 'empresa,alimentacao', creatorId: 2 },
    { desc: 'Marketing Digital – Nov',                  amount:  5500, dueDate: dateAt(6,  8), paymentDate: dateAt(6,  8), status: 'paga', type: 'pagar',   clientId: null, planId: 6, tags: 'marketing',           creatorId: 0 },
    { desc: 'Software – Nov',                           amount:   971, dueDate: dateAt(6, 10), paymentDate: dateAt(6, 10), status: 'paga', type: 'pagar',   clientId: null, planId: 4, tags: 'software,recorrente', creatorId: 0 },
    { desc: 'Consultoria – Edu Academy – Nov',          amount:  8500, dueDate: dateAt(6, 20), paymentDate: dateAt(6, 21), status: 'paga', type: 'receber', clientId: 9,    planId: 5, tags: 'empresa,educacao',    creatorId: 2 },
    { desc: 'Internet e Telefonia – Nov',               amount:   650, dueDate: dateAt(6, 12), paymentDate: dateAt(6, 12), status: 'paga', type: 'pagar',   clientId: null, planId: 9, tags: 'fixo',                creatorId: 0 },
    { desc: 'Energia Elétrica – Nov',                   amount:  1250, dueDate: dateAt(6, 15), paymentDate: dateAt(6, 15), status: 'paga', type: 'pagar',   clientId: null, planId: 9, tags: 'fixo',                creatorId: 0 },
    { desc: 'Vendas Produtos – Nov',                    amount: 18000, dueDate: dateAt(6, 28), paymentDate: dateAt(6, 28), status: 'paga', type: 'receber', clientId: 2,    planId: 1, tags: 'empresa,varejo',      creatorId: 2 },
    { desc: 'Black Friday – Vendas Especiais',          amount: 32000, dueDate: dateAt(6, 25), paymentDate: dateAt(6, 25), status: 'paga', type: 'receber', clientId: 2,    planId: 1, tags: 'empresa,varejo',      creatorId: 2 },
 
    // ── MÊS 5 (dezembro) ─────────────────────────────────────────────────
    { desc: 'Salários + 13º – Dez',                    amount: 52000, dueDate: dateAt(5,  5), paymentDate: dateAt(5,  5), status: 'paga', type: 'pagar',   clientId: null, planId: 3, tags: 'fixo',                creatorId: 0 },
    { desc: 'Aluguel Escritório – Dez',                amount:  8000, dueDate: dateAt(5,  1), paymentDate: dateAt(5,  1), status: 'paga', type: 'pagar',   clientId: null, planId: 2, tags: 'fixo',                creatorId: 0 },
    { desc: 'Manutenção Mensal – Tech Solutions – Dez',amount:  5500, dueDate: dateAt(5, 10), paymentDate: dateAt(5, 12), status: 'paga', type: 'receber', clientId: 0,    planId: 0, tags: 'empresa,contrato',    creatorId: 1 },
    { desc: 'Projeto Natal – Restaurante Sabor & Arte',amount: 14000, dueDate: dateAt(5, 15), paymentDate: dateAt(5, 16), status: 'paga', type: 'receber', clientId: 5,    planId: 8, tags: 'empresa,alimentacao', creatorId: 2 },
    { desc: 'Marketing Digital – Dez',                 amount:  6000, dueDate: dateAt(5,  8), paymentDate: dateAt(5,  8), status: 'paga', type: 'pagar',   clientId: null, planId: 6, tags: 'marketing',           creatorId: 0 },
    { desc: 'Software – Dez',                          amount:   971, dueDate: dateAt(5, 10), paymentDate: dateAt(5, 10), status: 'paga', type: 'pagar',   clientId: null, planId: 4, tags: 'software,recorrente', creatorId: 0 },
    { desc: 'Consultoria – Fernanda Costa – Dez',      amount:  6000, dueDate: dateAt(5, 12), paymentDate: dateAt(5, 14), status: 'paga', type: 'receber', clientId: 6,    planId: 5, tags: 'pf,consultora',       creatorId: 1 },
    { desc: 'Confraternização Empresa – Dez',          amount:  4500, dueDate: dateAt(5, 20), paymentDate: dateAt(5, 20), status: 'paga', type: 'pagar',   clientId: null, planId: 7, tags: '',                    creatorId: 0 },
    { desc: 'Internet e Telefonia – Dez',              amount:   650, dueDate: dateAt(5, 12), paymentDate: dateAt(5, 12), status: 'paga', type: 'pagar',   clientId: null, planId: 9, tags: 'fixo',                creatorId: 0 },
    { desc: 'Vendas Produtos – Dez',                   amount: 24000, dueDate: dateAt(5, 28), paymentDate: dateAt(5, 28), status: 'paga', type: 'receber', clientId: 2,    planId: 1, tags: 'empresa,varejo',      creatorId: 2 },
    { desc: 'Desenvolvimento App – Imobiliária Premium',amount:25000, dueDate: dateAt(5, 20), paymentDate: dateAt(5, 22), status: 'paga', type: 'receber', clientId: 7,    planId: 8, tags: 'empresa,imobiliaria', creatorId: 1 },
 
    // ── MÊS 4 (janeiro) ──────────────────────────────────────────────────
    { desc: 'Salários – Jan',                           amount: 26000, dueDate: dateAt(4,  5), paymentDate: dateAt(4,  5), status: 'paga', type: 'pagar',   clientId: null, planId: 3, tags: 'fixo',                creatorId: 0 },
    { desc: 'Aluguel Escritório – Jan',                 amount:  8000, dueDate: dateAt(4,  1), paymentDate: dateAt(4,  1), status: 'paga', type: 'pagar',   clientId: null, planId: 2, tags: 'fixo',                creatorId: 0 },
    { desc: 'Manutenção Mensal – Tech Solutions – Jan', amount:  5500, dueDate: dateAt(4, 10), paymentDate: dateAt(4, 12), status: 'paga', type: 'receber', clientId: 0,    planId: 0, tags: 'empresa,contrato',    creatorId: 1 },
    { desc: 'Consultoria – Logística Rápida – Jan',     amount:  9000, dueDate: dateAt(4, 15), paymentDate: dateAt(4, 17), status: 'paga', type: 'receber', clientId: 11,   planId: 5, tags: 'empresa,logistica',   creatorId: 2 },
    { desc: 'Marketing Digital – Jan',                  amount:  4200, dueDate: dateAt(4,  8), paymentDate: dateAt(4,  8), status: 'paga', type: 'pagar',   clientId: null, planId: 6, tags: 'marketing',           creatorId: 0 },
    { desc: 'Software – Jan',                           amount:   971, dueDate: dateAt(4, 10), paymentDate: dateAt(4, 10), status: 'paga', type: 'pagar',   clientId: null, planId: 4, tags: 'software,recorrente', creatorId: 0 },
    { desc: 'Hospedagem Cloud – Startup Inova – Jan',   amount:  1800, dueDate: dateAt(4, 15), paymentDate: dateAt(4, 16), status: 'paga', type: 'receber', clientId: 4,    planId: 0, tags: 'empresa,tecnologia',  creatorId: 1 },
    { desc: 'Internet e Telefonia – Jan',               amount:   650, dueDate: dateAt(4, 12), paymentDate: dateAt(4, 12), status: 'paga', type: 'pagar',   clientId: null, planId: 9, tags: 'fixo',                creatorId: 0 },
    { desc: 'Energia Elétrica – Jan',                   amount:  1300, dueDate: dateAt(4, 15), paymentDate: dateAt(4, 15), status: 'paga', type: 'pagar',   clientId: null, planId: 9, tags: 'fixo',                creatorId: 0 },
    { desc: 'Vendas Produtos – Jan',                    amount: 14000, dueDate: dateAt(4, 28), paymentDate: dateAt(4, 28), status: 'paga', type: 'receber', clientId: 2,    planId: 1, tags: 'empresa,varejo',      creatorId: 2 },
 
    // ── MÊS 3 (fevereiro) ────────────────────────────────────────────────
    { desc: 'Salários – Fev',                           amount: 27000, dueDate: dateAt(3,  5), paymentDate: dateAt(3,  5), status: 'paga', type: 'pagar',   clientId: null, planId: 3, tags: 'fixo',                creatorId: 0 },
    { desc: 'Aluguel Escritório – Fev',                 amount:  8000, dueDate: dateAt(3,  1), paymentDate: dateAt(3,  1), status: 'paga', type: 'pagar',   clientId: null, planId: 2, tags: 'fixo',                creatorId: 0 },
    { desc: 'Manutenção Mensal – Tech Solutions – Fev', amount:  5500, dueDate: dateAt(3, 10), paymentDate: dateAt(3, 11), status: 'paga', type: 'receber', clientId: 0,    planId: 0, tags: 'empresa,contrato',    creatorId: 1 },
    { desc: 'Gestão Redes Sociais – Restaurante – Fev', amount:  2800, dueDate: dateAt(3, 18), paymentDate: dateAt(3, 19), status: 'paga', type: 'receber', clientId: 5,    planId: 0, tags: 'empresa,alimentacao', creatorId: 2 },
    { desc: 'Marketing Digital – Fev',                  amount:  4200, dueDate: dateAt(3,  8), paymentDate: dateAt(3,  8), status: 'paga', type: 'pagar',   clientId: null, planId: 6, tags: 'marketing',           creatorId: 0 },
    { desc: 'Software – Fev',                           amount:   971, dueDate: dateAt(3, 10), paymentDate: dateAt(3, 10), status: 'paga', type: 'pagar',   clientId: null, planId: 4, tags: 'software,recorrente', creatorId: 0 },
    { desc: 'Projeto Landing Page – Maria Silva',       amount:  3500, dueDate: dateAt(3, 20), paymentDate: dateAt(3, 21), status: 'paga', type: 'receber', clientId: 1,    planId: 0, tags: 'pf,vip',              creatorId: 2 },
    { desc: 'Seguro Empresarial – Fev',                 amount:  3200, dueDate: dateAt(3, 10), paymentDate: dateAt(3, 10), status: 'paga', type: 'pagar',   clientId: null, planId: 7, tags: 'fixo',                creatorId: 0 },
    { desc: 'Internet e Telefonia – Fev',               amount:   650, dueDate: dateAt(3, 12), paymentDate: dateAt(3, 12), status: 'paga', type: 'pagar',   clientId: null, planId: 9, tags: 'fixo',                creatorId: 0 },
    { desc: 'Vendas Produtos – Fev',                    amount: 15500, dueDate: dateAt(3, 28), paymentDate: dateAt(3, 28), status: 'paga', type: 'receber', clientId: 2,    planId: 1, tags: 'empresa,varejo',      creatorId: 2 },
    { desc: 'Consultoria ERP – Edu Academy',            amount: 13000, dueDate: dateAt(3, 22), paymentDate: dateAt(3, 23), status: 'paga', type: 'receber', clientId: 9,    planId: 8, tags: 'empresa,educacao',    creatorId: 1 },
 
    // ── MÊS 2 (março) ────────────────────────────────────────────────────
    { desc: 'Salários – Mar',                           amount: 27000, dueDate: dateAt(2,  5), paymentDate: dateAt(2,  5), status: 'paga', type: 'pagar',   clientId: null, planId: 3, tags: 'fixo',                creatorId: 0 },
    { desc: 'Aluguel Escritório – Mar',                 amount:  8500, dueDate: dateAt(2,  1), paymentDate: dateAt(2,  1), status: 'paga', type: 'pagar',   clientId: null, planId: 2, tags: 'fixo',                creatorId: 0 },
    { desc: 'Manutenção Mensal – Tech Solutions – Mar', amount:  5500, dueDate: dateAt(2, 10), paymentDate: dateAt(2, 12), status: 'paga', type: 'receber', clientId: 0,    planId: 0, tags: 'empresa,contrato',    creatorId: 1 },
    { desc: 'Consultoria – Startup Inova – Mar',        amount: 12000, dueDate: dateAt(2, 15), paymentDate: dateAt(2, 17), status: 'paga', type: 'receber', clientId: 4,    planId: 5, tags: 'empresa,startup',     creatorId: 2 },
    { desc: 'Marketing Digital – Mar',                  amount:  4500, dueDate: dateAt(2,  8), paymentDate: dateAt(2,  8), status: 'paga', type: 'pagar',   clientId: null, planId: 6, tags: 'marketing',           creatorId: 0 },
    { desc: 'Software – Mar',                           amount:   971, dueDate: dateAt(2, 10), paymentDate: dateAt(2, 10), status: 'paga', type: 'pagar',   clientId: null, planId: 4, tags: 'software,recorrente', creatorId: 0 },
    { desc: 'Hospedagem Cloud – Startup Inova – Mar',   amount:  1800, dueDate: dateAt(2, 15), paymentDate: dateAt(2, 16), status: 'paga', type: 'receber', clientId: 4,    planId: 0, tags: 'empresa,tecnologia',  creatorId: 1 },
    { desc: 'Projeto ERP – Imobiliária Premium – 1/3',  amount: 20000, dueDate: dateAt(2, 20), paymentDate: dateAt(2, 22), status: 'paga', type: 'receber', clientId: 7,    planId: 8, tags: 'empresa,imobiliaria', creatorId: 1 },
    { desc: 'Internet e Telefonia – Mar',               amount:   650, dueDate: dateAt(2, 12), paymentDate: dateAt(2, 12), status: 'paga', type: 'pagar',   clientId: null, planId: 9, tags: 'fixo',                creatorId: 0 },
    { desc: 'Energia Elétrica – Mar',                   amount:  1200, dueDate: dateAt(2, 15), paymentDate: dateAt(2, 15), status: 'paga', type: 'pagar',   clientId: null, planId: 9, tags: 'fixo',                creatorId: 0 },
    { desc: 'Vendas Produtos – Mar',                    amount: 38000, dueDate: dateAt(2, 28), paymentDate: dateAt(2, 28), status: 'paga', type: 'receber', clientId: 2,    planId: 1, tags: 'empresa,varejo',      creatorId: 2 },
    { desc: 'Consultoria – Fernanda Costa – Mar',       amount:  6000, dueDate: dateAt(2, 12), paymentDate: dateAt(2, 13), status: 'paga', type: 'receber', clientId: 6,    planId: 5, tags: 'pf,consultora',       creatorId: 1 },
 
    // ── MÊS 1 (abril) ────────────────────────────────────────────────────
    { desc: 'Salários – Abr',                           amount: 28000, dueDate: dateAt(1,  5), paymentDate: dateAt(1,  5), status: 'paga', type: 'pagar',   clientId: null, planId: 3, tags: 'fixo',                creatorId: 0 },
    { desc: 'Aluguel Escritório – Abr',                 amount:  8500, dueDate: dateAt(1,  1), paymentDate: dateAt(1,  1), status: 'paga', type: 'pagar',   clientId: null, planId: 2, tags: 'fixo',                creatorId: 0 },
    { desc: 'Manutenção Mensal – Tech Solutions – Abr', amount:  5500, dueDate: dateAt(1, 10), paymentDate: dateAt(1, 11), status: 'paga', type: 'receber', clientId: 0,    planId: 0, tags: 'empresa,contrato',    creatorId: 1 },
    { desc: 'Gestão Redes Sociais – Restaurante – Abr', amount:  2800, dueDate: dateAt(1, 18), paymentDate: dateAt(1, 19), status: 'paga', type: 'receber', clientId: 5,    planId: 0, tags: 'empresa,alimentacao', creatorId: 2 },
    { desc: 'Marketing Digital – Abr',                  amount:  4500, dueDate: dateAt(1,  8), paymentDate: dateAt(1,  8), status: 'paga', type: 'pagar',   clientId: null, planId: 6, tags: 'marketing',           creatorId: 0 },
    { desc: 'Software – Abr',                           amount:   971, dueDate: dateAt(1, 10), paymentDate: dateAt(1, 10), status: 'paga', type: 'pagar',   clientId: null, planId: 4, tags: 'software,recorrente', creatorId: 0 },
    { desc: 'Projeto ERP – Imobiliária Premium – 2/3',  amount: 20000, dueDate: dateAt(1, 20), paymentDate: dateAt(1, 21), status: 'paga', type: 'receber', clientId: 7,    planId: 8, tags: 'empresa,imobiliaria', creatorId: 1 },
    { desc: 'Consultoria – Logística Rápida – Abr',     amount: 45000, dueDate: dateAt(1, 15), paymentDate: dateAt(1, 16), status: 'paga', type: 'receber', clientId: 11,   planId: 5, tags: 'empresa,logistica',   creatorId: 2 },
    { desc: 'Seguro Empresarial – Abr',                 amount:  3200, dueDate: dateAt(1, 10), paymentDate: dateAt(1, 10), status: 'paga', type: 'pagar',   clientId: null, planId: 7, tags: 'fixo',                creatorId: 0 },
    { desc: 'Internet e Telefonia – Abr',               amount:   650, dueDate: dateAt(1, 12), paymentDate: dateAt(1, 12), status: 'paga', type: 'pagar',   clientId: null, planId: 9, tags: 'fixo',                creatorId: 0 },
    { desc: 'Energia Elétrica – Abr',                   amount:  1100, dueDate: dateAt(1, 15), paymentDate: dateAt(1, 15), status: 'paga', type: 'pagar',   clientId: null, planId: 9, tags: 'fixo',                creatorId: 0 },
    { desc: 'Vendas Produtos – Abr',                    amount: 32000, dueDate: dateAt(1, 28), paymentDate: dateAt(1, 28), status: 'paga', type: 'receber', clientId: 2,    planId: 1, tags: 'empresa,varejo',      creatorId: 2 },

    // ── MÊS ATUAL (maio) — vencidas, pagas e pendentes ───────────────────
    // Vencidas
    { desc: 'Manutenção Mensal – Tech Solutions – Mai', amount:  5500, dueDate: daysAgo(15), status: 'vencida', type: 'receber', clientId: 0,    planId: 0, tags: 'empresa,contrato',    creatorId: 1 },
    { desc: 'Consultoria Estratégica – Startup Inova',  amount: 12000, dueDate: daysAgo(10), status: 'vencida', type: 'receber', clientId: 4,    planId: 5, tags: 'empresa,startup',     creatorId: 2 },
    { desc: 'Aluguel Escritório – Mai',                 amount:  8500, dueDate: daysAgo(5),  status: 'vencida', type: 'pagar',   clientId: null, planId: 2, tags: 'fixo',                creatorId: 0 },
 
    // Pagas no mês atual
    { desc: 'Salários – Mai (1ª parcela)',              amount: 14000, dueDate: daysAgo(3), paymentDate: daysAgo(3), status: 'paga', type: 'pagar',   clientId: null, planId: 3, tags: 'fixo',                creatorId: 0 },
    { desc: 'Vendas Produtos – Mai (1ª quinzena)',      amount: 18000, dueDate: daysAgo(2), paymentDate: daysAgo(2), status: 'paga', type: 'receber', clientId: 2,    planId: 1, tags: 'empresa,varejo',      creatorId: 2 },
    { desc: 'Hospedagem Cloud – Startup Inova – Mai',   amount:  1800, dueDate: daysAgo(2), paymentDate: daysAgo(1), status: 'paga', type: 'receber', clientId: 4,    planId: 0, tags: 'empresa,tecnologia',  creatorId: 1 },
    { desc: 'Internet e Telefonia – Mai',               amount:   650, dueDate: daysAgo(1), paymentDate: daysAgo(1), status: 'paga', type: 'pagar',   clientId: null, planId: 9, tags: 'fixo',                creatorId: 0 },
 
    // Vence hoje
    { desc: 'Licença Software Anual',                   amount:  2400, dueDate: now, status: 'pendente', type: 'pagar',   clientId: null, planId: 4, tags: 'software',            creatorId: 0 },
    { desc: 'Pagamento Projeto Web – Maria Silva',      amount:  3500, dueDate: now, status: 'pendente', type: 'receber', clientId: 1,    planId: 0, tags: 'pf,vip',              creatorId: 2 },
 
    // Pendentes futuras
    { desc: 'Marketing Digital – Mai',                  amount:  4500, dueDate: daysFromNow(1),  status: 'pendente', type: 'pagar',   clientId: null, planId: 6, tags: 'marketing',           creatorId: 0 },
    { desc: 'Salários – Mai (2ª parcela)',              amount: 14000, dueDate: daysFromNow(5),  status: 'pendente', type: 'pagar',   clientId: null, planId: 3, tags: 'fixo,team',           creatorId: 0 },
    { desc: 'Projeto E-commerce – Comércio ABC',        amount: 18500, dueDate: daysFromNow(7),  status: 'pendente', type: 'receber', clientId: 2,    planId: 0, tags: 'empresa,contrato',    creatorId: 2 },
    { desc: 'Seguro Empresarial – Mai',                 amount:  3200, dueDate: daysFromNow(10), status: 'pendente', type: 'pagar',   clientId: null, planId: 7, tags: 'fixo',                creatorId: 0 },
    { desc: 'Consultoria Financeira – Fernanda Costa',  amount:  6000, dueDate: daysFromNow(12), status: 'pendente', type: 'receber', clientId: 6,    planId: 5, tags: 'pf,consultora',       creatorId: 1 },
    { desc: 'Gestão Redes Sociais – Restaurante – Mai', amount:  2800, dueDate: daysFromNow(18), status: 'pendente', type: 'receber', clientId: 5,    planId: 0, tags: 'empresa,alimentacao', creatorId: 2 },
    { desc: 'Conta de Energia – Mai',                   amount:  1200, dueDate: daysFromNow(20), status: 'pendente', type: 'pagar',   clientId: null, planId: 9, tags: 'fixo',                creatorId: 0 },
    { desc: 'Projeto ERP – Imobiliária Premium – 3/3',  amount: 20000, dueDate: daysFromNow(25), status: 'pendente', type: 'receber', clientId: 7,    planId: 8, tags: 'empresa,imobiliaria', creatorId: 1 },
    { desc: 'Vendas Produtos – Mai (2ª quinzena)',      amount: 16000, dueDate: daysFromNow(28), status: 'pendente', type: 'receber', clientId: 2,    planId: 1, tags: 'empresa,varejo',      creatorId: 2 },
 
    // Recorrentes
    { desc: 'Assinatura CRM Pro', amount: 299, dueDate: daysFromNow(3), status: 'pendente', type: 'pagar', clientId: null, planId: 4, tags: 'software,recorrente', creatorId: 0, recurring: true, recurringCycle: 'mensal' },
    { desc: 'Google Workspace',   amount: 672, dueDate: daysFromNow(8), status: 'pendente', type: 'pagar', clientId: null, planId: 4, tags: 'software,recorrente', creatorId: 0, recurring: true, recurringCycle: 'mensal' },

  ]

  for (const acc of accountData) {
    const account = await db.account.create({
      data: {
        description: acc.desc,
        amount: acc.amount,
        dueDate: acc.dueDate,
        paymentDate: acc.paymentDate || undefined,
        status: acc.status,
        type: acc.type,
        clientId: acc.clientId !== null ? clients[acc.clientId].id : null,
        accountPlanId: accountPlans[acc.planId].id,
        tenantId: tenant.id,
        creatorId: users[acc.creatorId].id,
        tags: acc.tags,
        recurring: acc.recurring || false,
        recurringCycle: acc.recurringCycle || undefined,
      },
    })
    accounts.push({ id: account.id, type: acc.type, status: acc.status, amount: acc.amount })
  }

  // ============ INSTALLMENTS ============
  // Create an installment plan for a large project
  const installmentParent = await db.account.create({
    data: {
      description: 'Projeto ERP - Imobiliária Premium (Parcelado)',
      amount: 60000,
      dueDate: now,
      status: 'pendente',
      type: 'receber',
      clientId: clients[7].id,
      accountPlanId: accountPlans[0].id,
      tenantId: tenant.id,
      creatorId: users[1].id,
      installmentNumber: 1,
      totalInstallments: 6,
      tags: 'empresa,parcelamento,contrato',
    },
  })

  for (let i = 1; i <= 6; i++) {
    await db.account.create({
      data: {
        description: `Parcela ${i}/6 - Projeto ERP Imobiliária Premium`,
        amount: 10000,
        dueDate: daysFromNow(i * 30),
        status: i <= 1 ? 'pendente' : 'pendente',
        type: 'receber',
        clientId: clients[7].id,
        accountPlanId: accountPlans[0].id,
        tenantId: tenant.id,
        creatorId: users[1].id,
        installmentNumber: i,
        totalInstallments: 6,
        parentAccountId: installmentParent.id,
        tags: 'empresa,parcelamento,contrato',
      },
    })
  }

  // ============ COMMISSIONS ============
  // Create commissions for the sales team
  const commissionData = [
    { userId: users[1].id, accountIdIdx: 0, amount: 550, percentage: 10, status: 'pendente' },
    { userId: users[1].id, accountIdIdx: 1, amount: 1800, percentage: 15, status: 'pendente' },
    { userId: users[0].id, accountIdIdx: 4, amount: 525, percentage: 15, status: 'pendente' },
    { userId: users[1].id, accountIdIdx: 15, amount: 3750, percentage: 15, status: 'paga' },
    { userId: users[0].id, accountIdIdx: 17, amount: 1200, percentage: 15, status: 'paga' },
    { userId: users[1].id, accountIdIdx: 18, amount: 675, percentage: 15, status: 'paga' },
    { userId: users[0].id, accountIdIdx: 24, amount: 1425, percentage: 15, status: 'paga' },
    { userId: users[1].id, accountIdIdx: 25, amount: 2250, percentage: 15, status: 'paga' },
    { userId: users[0].id, accountIdIdx: 7, amount: 2775, percentage: 15, status: 'pendente' },
    { userId: users[1].id, accountIdIdx: 9, amount: 900, percentage: 15, status: 'pendente' },
  ]

  for (const comm of commissionData) {
    const acc = accounts[comm.accountIdIdx]
    if (acc) {
      await db.commission.create({
        data: {
          userId: comm.userId,
          accountId: acc.id,
          amount: comm.amount,
          percentage: comm.percentage,
          status: comm.status,
          paidAt: comm.status === 'paga' ? daysAgo(5) : undefined,
        },
      })
    }
  }

  // ============ NOTIFICATIONS ============
  await Promise.all([
    db.notification.create({
      data: {
        userId: users[0].id,
        type: 'vencimento',
        title: 'Contas Vencidas',
        message: 'Existem 3 contas vencidas que precisam de atenção.',
        link: '/financeiro',
      },
    }),
    db.notification.create({
      data: {
        userId: users[0].id,
        type: 'pagamento',
        title: 'Pagamento Recebido',
        message: 'Projeto E-commerce - Comércio ABC está em aberto.',
      },
    }),
    db.notification.create({
      data: {
        userId: users[1].id,
        type: 'alerta',
        title: 'Novo Cliente Cadastrado',
        message: 'Imobiliária Premium foi adicionada ao sistema.',
      },
    }),
    db.notification.create({
      data: {
        userId: users[2].id,
        type: 'sistema',
        title: 'Bem-vindo ao FinanceFlow',
        message: 'Configure seu perfil para começar a usar o sistema.',
      },
    }),
    db.notification.create({
      data: {
        userId: users[0].id,
        type: 'vencimento',
        title: 'Vencimento Amanhã',
        message: 'Marketing Digital e Hospedagem Cloud vencem amanhã.',
      },
    }),
    db.notification.create({
      data: {
        userId: users[1].id,
        type: 'comissao',
        title: 'Comissão Disponível',
        message: 'Você tem R$ 3.750 em comissões pendentes.',
      },
    }),
  ])

  // ============ AUTOMATION RULES ============
  await Promise.all([
    db.automationRule.create({
      data: {
        name: 'Marcar como Vencida',
        trigger: 'atraso',
        condition: JSON.stringify({ daysOverdue: 1 }),
        action: 'mudar_status',
        actionParams: JSON.stringify({ newStatus: 'vencida' }),
        active: true,
        tenantId: tenant.id,
      },
    }),
    db.automationRule.create({
      data: {
        name: 'Lembrete de Vencimento (3 dias)',
        trigger: 'vencimento_proximo',
        condition: JSON.stringify({ daysBefore: 3 }),
        action: 'notificar',
        actionParams: JSON.stringify({ messageTemplate: 'A conta {description} vence em {days} dias.' }),
        active: true,
        tenantId: tenant.id,
      },
    }),
    db.automationRule.create({
      data: {
        name: 'Calcular Comissão Automática',
        trigger: 'pagamento_recebido',
        condition: JSON.stringify({ minAmount: 1000 }),
        action: 'calcular_comissao',
        actionParams: JSON.stringify({ defaultPercentage: 10 }),
        active: true,
        tenantId: tenant.id,
      },
    }),
    db.automationRule.create({
      data: {
        name: 'Notificação de Pagamento',
        trigger: 'status_change',
        condition: JSON.stringify({ fromStatus: 'pendente', toStatus: 'paga' }),
        action: 'notificar',
        actionParams: JSON.stringify({ messageTemplate: 'Conta {description} foi paga com sucesso!' }),
        active: true,
        tenantId: tenant.id,
      },
    }),
  ])

  console.log('✅ Seed completed successfully!')
  console.log(`   Tenant: ${tenant.name} (${tenant.id})`)
  console.log(`   Users: ${users.length}`)
  console.log(`   Clients: ${clients.length}`)
  console.log(`   Account Plans: ${accountPlans.length}`)
  console.log(`   Accounts: ${accountData.length}`)
  console.log(`   Tags: 5`)
  console.log(`   Notifications: 6`)
  console.log(`   Automation Rules: 4`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })