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
  const tenant = await db.tenant.create({
    data: {
      name: 'FinanceFlow Corp',
      cnpj: '12.345.678/0001-90',
      plan: 'pro',
    },
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

  // 4. CLIENTS (Mantido original)
  const clients = await Promise.all([
    db.client.create({ data: { name: 'Tech Solutions Ltda', email: 'contato@techsolutions.com', phone: '(11) 99999-1234', cpfCnpj: '98.765.432/0001-10', city: 'São Paulo', state: 'SP', tags: 'empresa,tecnologia', tenantId: tenant.id } }),
    db.client.create({ data: { name: 'Maria Silva', email: 'maria.silva@email.com', phone: '(21) 98888-5678', cpfCnpj: '123.456.789-00', city: 'Rio de Janeiro', state: 'RJ', tags: 'pf,vip', tenantId: tenant.id } }),
    db.client.create({ data: { name: 'Comércio ABC', email: 'financeiro@comercioabc.com', phone: '(31) 97777-9012', cpfCnpj: '45.678.901/0001-23', city: 'Belo Horizonte', state: 'MG', tags: 'empresa,varejo', tenantId: tenant.id } }),
    db.client.create({ data: { name: 'João Oliveira', email: 'joao.oliveira@email.com', phone: '(41) 96666-3456', cpfCnpj: '987.654.321-00', city: 'Curitiba', state: 'PR', tags: 'pf', tenantId: tenant.id } }),
    db.client.create({ data: { name: 'Startup Inova', email: 'contato@startupinova.com', phone: '(51) 95555-7890', cpfCnpj: '56.789.012/0001-34', city: 'Porto Alegre', state: 'RS', tags: 'empresa,startup', tenantId: tenant.id } }),
    db.client.create({ data: { name: 'Restaurante Sabor & Arte', email: 'contato@saborarte.com', phone: '(48) 94444-1234', cpfCnpj: '67.890.123/0001-45', city: 'Florianópolis', state: 'SC', tags: 'empresa,alimentacao', tenantId: tenant.id } }),
    db.client.create({ data: { name: 'Fernanda Costa', email: 'fernanda.costa@email.com', phone: '(61) 93333-5678', cpfCnpj: '321.654.987-00', city: 'Brasília', state: 'DF', tags: 'pf,consultora', tenantId: tenant.id } }),
    db.client.create({ data: { name: 'Imobiliária Premium', email: 'contato@imobpremium.com', phone: '(71) 92222-9012', cpfCnpj: '78.901.234/0001-56', city: 'Salvador', state: 'BA', tags: 'empresa,imobiliaria', tenantId: tenant.id } }),
  ])

  // 5. ACCOUNT PLANS & TAGS (Mantidos originais)
  const accountPlans = await Promise.all([
    db.accountPlan.create({ data: { name: 'Receita de Serviços', type: 'receita', tenantId: tenant.id } }),
    db.accountPlan.create({ data: { name: 'Vendas de Produtos', type: 'receita', tenantId: tenant.id } }),
    db.accountPlan.create({ data: { name: 'Aluguel', type: 'despesa', tenantId: tenant.id } }),
    db.accountPlan.create({ data: { name: 'Salários', type: 'despesa', tenantId: tenant.id } }),
    db.accountPlan.create({ data: { name: 'Software e Licenças', type: 'despesa', tenantId: tenant.id } }),
    db.accountPlan.create({ data: { name: 'Consultoria', type: 'receita', tenantId: tenant.id } }),
    db.accountPlan.create({ data: { name: 'Marketing', type: 'despesa', tenantId: tenant.id } }),
    db.accountPlan.create({ data: { name: 'Fornecedores', type: 'despesa', tenantId: tenant.id } }),
  ])

  await Promise.all([
    db.tag.create({ data: { name: 'Urgente', color: '#ef4444', tenantId: tenant.id } }),
    db.tag.create({ data: { name: 'VIP', color: '#f59e0b', tenantId: tenant.id } }),
    db.tag.create({ data: { name: 'Recorrente', color: '#10b981', tenantId: tenant.id } }),
    db.tag.create({ data: { name: 'Contrato', color: '#3b82f6', tenantId: tenant.id } }),
    db.tag.create({ data: { name: 'Pessoal', color: '#8b5cf6', tenantId: tenant.id } }),
  ])

  // 6. DADOS FINANCEIROS (EXPANDIDO PARA DASHBOARD)
  const now = new Date()
  const daysAgo = (n) => { const d = new Date(now); d.setDate(d.getDate() - n); return d }
  const daysFromNow = (n) => { const d = new Date(now); d.setDate(d.getDate() + n); return d }

  // Helper para normalizar criação de contas
  const createAccounts = async (dataList) => {
    const created = []
    for (const d of dataList) {
      const acc = await db.account.create({
        data: {
          description: d.desc,
          amount: d.amount,
          dueDate: d.dueDate,
          paymentDate: d.paymentDate || undefined,
          status: d.status,
          type: d.type,
          clientId: d.clientId !== null ? clients[d.clientId].id : null,
          accountPlanId: accountPlans[d.planId].id,
          tenantId: tenant.id,
          creatorId: users[d.creatorId].id,
          tags: d.tags || undefined,
          recurring: d.recurring || false,
          recurringCycle: d.recurringCycle || undefined,
          installmentNumber: d.installmentNumber || undefined,
          totalInstallments: d.totalInstallments || undefined,
          parentAccountId: d.parentAccountId || undefined,
        }
      })
      created.push({ id: acc.id, type: d.type, status: d.status, amount: d.amount })
    }
    return created
  }

  // Dados expandidos e organizados para métricas de dashboard
  const accountData = [
    // 🔴 VENCIDAS (Alertas e Inadimplência)
    { desc: 'Manutenção Mensal - Tech Solutions', amount: 5500, dueDate: daysAgo(15), status: 'vencida', type: 'receber', clientId: 0, planId: 0, creatorId: 1, tags: 'empresa,contrato' },
    { desc: 'Consultoria Estratégica - Startup Inova', amount: 12000, dueDate: daysAgo(10), status: 'vencida', type: 'receber', clientId: 4, planId: 5, creatorId: 2, tags: 'empresa,startup' },
    { desc: 'Aluguel Escritório + Condomínio', amount: 8500, dueDate: daysAgo(5), status: 'vencida', type: 'pagar', clientId: null, planId: 2, creatorId: 0, tags: 'fixo' },
    { desc: 'Fatura Cartão PJ - Material', amount: 3200, dueDate: daysAgo(2), status: 'vencida', type: 'pagar', clientId: null, planId: 7, creatorId: 0 },

    // 🟡 VENCE HOJE / AMANHÃ (Atenção Imediata)
    { desc: 'Licença Software Anual', amount: 2400, dueDate: now, status: 'pendente', type: 'pagar', clientId: null, planId: 4, creatorId: 0 },
    { desc: 'Pagamento Projeto Web - Maria Silva', amount: 3500, dueDate: now, status: 'pendente', type: 'receber', clientId: 1, planId: 0, creatorId: 2, tags: 'pf,vip' },
    { desc: 'Marketing Digital - Mês Atual', amount: 4200, dueDate: daysFromNow(1), status: 'pendente', type: 'pagar', clientId: null, planId: 6, creatorId: 0 },
    { desc: 'Hospedagem Cloud - Startup Inova', amount: 1800, dueDate: daysFromNow(1), status: 'pendente', type: 'receber', clientId: 4, planId: 0, creatorId: 1, tags: 'empresa,tecnologia' },

    // 🟠 PENDENTES FUTURAS (Fluxo de Caixa)
    { desc: 'Salários - Equipe Técnica (Dias 05)', amount: 28000, dueDate: daysFromNow(5), status: 'pendente', type: 'pagar', clientId: null, planId: 3, creatorId: 0, tags: 'fixo,team' },
    { desc: 'Projeto E-commerce - Comércio ABC', amount: 18500, dueDate: daysFromNow(7), status: 'pendente', type: 'receber', clientId: 2, planId: 0, creatorId: 2, tags: 'empresa,contrato' },
    { desc: 'Seguro Empresarial Trimestral', amount: 3200, dueDate: daysFromNow(10), status: 'pendente', type: 'pagar', clientId: null, planId: 7, creatorId: 0 },
    { desc: 'Consultoria Financeira - Fernanda Costa', amount: 6000, dueDate: daysFromNow(12), status: 'pendente', type: 'receber', clientId: 6, planId: 5, creatorId: 1, tags: 'pf,consultora' },
    { desc: 'Material de Escritório', amount: 850, dueDate: daysFromNow(15), status: 'pendente', type: 'pagar', clientId: null, planId: 7, creatorId: 0 },
    { desc: 'Gestão de Redes Sociais - Restaurante', amount: 2800, dueDate: daysFromNow(18), status: 'pendente', type: 'receber', clientId: 5, planId: 0, creatorId: 2, tags: 'empresa,alimentacao' },
    { desc: 'Conta de Energia - Escritório', amount: 1200, dueDate: daysFromNow(20), status: 'pendente', type: 'pagar', clientId: null, planId: 7, creatorId: 0 },
    { desc: 'Desenvolvimento App - Fase 2', amount: 15000, dueDate: daysFromNow(25), status: 'pendente', type: 'receber', clientId: 7, planId: 0, creatorId: 1 },
    { desc: 'Comissões Vendas (Dias 28)', amount: 9500, dueDate: daysFromNow(28), status: 'pendente', type: 'pagar', clientId: null, planId: 7, creatorId: 0 },

    // 🟢 PAGAS RECENTES (30-60 dias)
    { desc: 'Desenvolvimento App - Imobiliária Premium', amount: 25000, dueDate: daysAgo(20), paymentDate: daysAgo(18), status: 'paga', type: 'receber', clientId: 7, planId: 0, creatorId: 1 },
    { desc: 'Serviço de Limpeza Semanal', amount: 1500, dueDate: daysAgo(25), paymentDate: daysAgo(23), status: 'paga', type: 'pagar', clientId: null, planId: 7, creatorId: 0 },
    { desc: 'Consultoria Mensal - Tech Solutions', amount: 8000, dueDate: daysAgo(30), paymentDate: daysAgo(28), status: 'paga', type: 'receber', clientId: 0, planId: 5, creatorId: 2 },
    { desc: 'Internet Fibra Empresarial', amount: 450, dueDate: daysAgo(35), paymentDate: daysAgo(33), status: 'paga', type: 'pagar', clientId: null, planId: 4, creatorId: 0 },
    { desc: 'Projeto Landing Page - João Oliveira', amount: 4500, dueDate: daysAgo(40), paymentDate: daysAgo(38), status: 'paga', type: 'receber', clientId: 3, planId: 0, creatorId: 1 },
    { desc: 'Manutenção Ar Condicionado', amount: 780, dueDate: daysAgo(45), paymentDate: daysAgo(43), status: 'paga', type: 'pagar', clientId: null, planId: 7, creatorId: 0 },

    // 📉 HISTÓRICO MENSAL (Últimos 4 meses - Tendência)
    { desc: 'Receita Recorrente - Tech Solutions (Mês Anterior)', amount: 5500, dueDate: daysAgo(45), paymentDate: daysAgo(44), status: 'paga', type: 'receber', clientId: 0, planId: 0, creatorId: 1, tags: 'empresa,recorrente' },
    { desc: 'Salários - Equipe Técnica (Mês Anterior)', amount: 28000, dueDate: daysAgo(40), paymentDate: daysAgo(38), status: 'paga', type: 'pagar', clientId: null, planId: 3, creatorId: 0, tags: 'fixo' },
    { desc: 'Aluguel + Condomínio (Mês Anterior)', amount: 8500, dueDate: daysAgo(40), paymentDate: daysAgo(38), status: 'paga', type: 'pagar', clientId: null, planId: 2, creatorId: 0, tags: 'fixo' },
    { desc: 'Projeto Identidade Visual - Comércio ABC', amount: 9500, dueDate: daysAgo(60), paymentDate: daysAgo(58), status: 'paga', type: 'receber', clientId: 2, planId: 0, creatorId: 2, tags: 'empresa,contrato' },
    { desc: 'Compra de Equipamentos TI', amount: 6200, dueDate: daysAgo(55), paymentDate: daysAgo(53), status: 'paga', type: 'pagar', clientId: null, planId: 7, creatorId: 0, tags: 'investimento' },
    { desc: 'Assessoria Jurídica Mensal', amount: 3000, dueDate: daysAgo(70), paymentDate: daysAgo(68), status: 'paga', type: 'pagar', clientId: null, planId: 7, creatorId: 0 },
    { desc: 'Manutenção Site - Startup Inova (Mês -2)', amount: 2200, dueDate: daysAgo(75), paymentDate: daysAgo(74), status: 'paga', type: 'receber', clientId: 4, planId: 0, creatorId: 1, tags: 'empresa,tecnologia' },
    { desc: 'Vendas de Produtos - Mês -2', amount: 15000, dueDate: daysAgo(60), paymentDate: daysAgo(59), status: 'paga', type: 'receber', clientId: 2, planId: 1, creatorId: 2, tags: 'empresa,varejo' },
    { desc: 'Receita Consultoria - Fernanda Costa (Mês -2)', amount: 6000, dueDate: daysAgo(80), paymentDate: daysAgo(79), status: 'paga', type: 'receber', clientId: 6, planId: 5, creatorId: 1, tags: 'pf,consultora' },
    { desc: 'Despesa Operacional Geral (Mês -3)', amount: 4500, dueDate: daysAgo(90), paymentDate: daysAgo(88), status: 'paga', type: 'pagar', clientId: null, planId: 7, creatorId: 0 },
    { desc: 'Faturamento Serviços Tech Solutions (Mês -3)', amount: 5500, dueDate: daysAgo(90), paymentDate: daysAgo(89), status: 'paga', type: 'receber', clientId: 0, planId: 0, creatorId: 1, tags: 'empresa,recorrente' },
    { desc: 'Faturamento Projeto Web Maria Silva (Mês -3)', amount: 3500, dueDate: daysAgo(85), paymentDate: daysAgo(83), status: 'paga', type: 'receber', clientId: 1, planId: 0, creatorId: 2 },
    { desc: 'Faturamento App Imobiliária (Mês -4)', amount: 25000, dueDate: daysAgo(110), paymentDate: daysAgo(108), status: 'paga', type: 'receber', clientId: 7, planId: 0, creatorId: 1 },
    { desc: 'Faturamento ERP Imobiliária (Mês -4)', amount: 12000, dueDate: daysAgo(120), paymentDate: daysAgo(118), status: 'paga', type: 'receber', clientId: 7, planId: 0, creatorId: 1, tags: 'empresa,contrato' },

    // 🔄 RECURRENTE / SaaS (Base Recorrente)
    { desc: 'Assinatura CRM Pro', amount: 299, dueDate: daysFromNow(3), status: 'pendente', type: 'pagar', clientId: null, planId: 4, creatorId: 0, recurring: true, recurringCycle: 'mensal', tags: 'software,recorrente' },
    { desc: 'Google Workspace Teams', amount: 672, dueDate: daysFromNow(8), status: 'pendente', type: 'pagar', clientId: null, planId: 4, creatorId: 0, recurring: true, recurringCycle: 'mensal', tags: 'software,recorrente' },
    { desc: 'Assinância GitHub Pro', amount: 216, dueDate: daysFromNow(10), status: 'pendente', type: 'pagar', clientId: null, planId: 4, creatorId: 0, recurring: true, recurringCycle: 'mensal', tags: 'software,recorrente' },
    { desc: 'Receita Mensal - Tech Solutions (Próximo)', amount: 5500, dueDate: daysFromNow(30), status: 'pendente', type: 'receber', clientId: 0, planId: 0, creatorId: 1, recurring: true, recurringCycle: 'mensal', tags: 'empresa,recorrente' },
    { desc: 'Receita Mensal - Consultoria Fernanda (Próximo)', amount: 6000, dueDate: daysFromNow(35), status: 'pendente', type: 'receber', clientId: 6, planId: 5, creatorId: 1, recurring: true, recurringCycle: 'mensal', tags: 'pf,recorrente' },
  ]

  const accounts = await createAccounts(accountData)

  // 7. PARCELAMENTOS (Exemplo ERP)
  const installmentParent = await db.account.create({
    data: {
      description: 'Projeto ERP - Imobiliária Premium (Parcelado)',
      amount: 60000, dueDate: now, status: 'pendente', type: 'receber',
      clientId: clients[7].id, accountPlanId: accountPlans[0].id, tenantId: tenant.id, creatorId: users[1].id,
      installmentNumber: 1, totalInstallments: 6, tags: 'empresa,parcelamento,contrato'
    }
  })

  for (let i = 2; i <= 6; i++) {
    await db.account.create({
      data: {
        description: `Parcela ${i}/6 - Projeto ERP Imobiliária Premium`,
        amount: 10000, dueDate: daysFromNow(i * 30), status: 'pendente', type: 'receber',
        clientId: clients[7].id, accountPlanId: accountPlans[0].id, tenantId: tenant.id, creatorId: users[1].id,
        installmentNumber: i, totalInstallments: 6, parentAccountId: installmentParent.id,
        tags: 'empresa,parcelamento,contrato'
      }
    })
  }

  // 8. COMISSÕES (Distribuídas por vendedor/usuário para dashboard de performance)
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
    { userId: users[2].id, accountIdIdx: 11, amount: 2775, percentage: 15, status: 'pendente' },
    { userId: users[2].id, accountIdIdx: 13, amount: 450, percentage: 15, status: 'paga' },
    { userId: users[1].id, accountIdIdx: 28, amount: 600, percentage: 10, status: 'paga' },
    { userId: users[0].id, accountIdIdx: 30, amount: 1500, percentage: 15, status: 'paga' },
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
        }
      })
    }
  }

  // 9. NOTIFICAÇÕES (Simula caixa de entrada)
  await Promise.all([
    db.notification.create({ data: { userId: users[0].id, type: 'vencimento', title: 'Contas Vencidas', message: 'Existem 4 contas vencidas que precisam de atenção.', link: '/financeiro' } }),
    db.notification.create({ data: { userId: users[0].id, type: 'pagamento', title: 'Pagamento Recebido', message: 'Projeto E-commerce - Comércio ABC foi quitado.' } }),
    db.notification.create({ data: { userId: users[1].id, type: 'alerta', title: 'Novo Cliente', message: 'Imobiliária Premium foi adicionada ao sistema.' } }),
    db.notification.create({ data: { userId: users[2].id, type: 'sistema', title: 'Bem-vindo ao FinanceFlow', message: 'Configure seu perfil para começar a usar o sistema.' } }),
    db.notification.create({ data: { userId: users[0].id, type: 'vencimento', title: 'Vencimento Amanhã', message: 'Marketing Digital e Hospedagem Cloud vencem amanhã.' } }),
    db.notification.create({ data: { userId: users[1].id, type: 'comissao', title: 'Comissão Disponível', message: 'Você tem R$ 3.750 em comissões pendentes.' } }),
    db.notification.create({ data: { userId: users[2].id, type: 'financeiro', title: 'Fluxo de Caixa', message: 'Previsão de entrada do próximo mês: R$ 14.500,00' } }),
    db.notification.create({ data: { userId: users[0].id, type: 'sistema', title: 'Backup Concluído', message: 'Backup automático das operações realizadas.' } }),
  ])

  // 10. AUTOMATION RULES (Mantidas originais + 2 extras para dashboard de automação)
  await Promise.all([
    db.automationRule.create({ data: { name: 'Marcar como Vencida', trigger: 'atraso', condition: JSON.stringify({ daysOverdue: 1 }), action: 'mudar_status', actionParams: JSON.stringify({ newStatus: 'vencida' }), active: true, tenantId: tenant.id } }),
    db.automationRule.create({ data: { name: 'Lembrete de Vencimento (3 dias)', trigger: 'vencimento_proximo', condition: JSON.stringify({ daysBefore: 3 }), action: 'notificar', actionParams: JSON.stringify({ messageTemplate: 'A conta {description} vence em {days} dias.' }), active: true, tenantId: tenant.id } }),
    db.automationRule.create({ data: { name: 'Calcular Comissão Automática', trigger: 'pagamento_recebido', condition: JSON.stringify({ minAmount: 1000 }), action: 'calcular_comissao', actionParams: JSON.stringify({ defaultPercentage: 10 }), active: true, tenantId: tenant.id } }),
    db.automationRule.create({ data: { name: 'Notificação de Pagamento', trigger: 'status_change', condition: JSON.stringify({ fromStatus: 'pendente', toStatus: 'paga' }), action: 'notificar', actionParams: JSON.stringify({ messageTemplate: 'Conta {description} foi paga com sucesso!' }), active: true, tenantId: tenant.id } }),
    db.automationRule.create({ data: { name: 'Conciliação Bancária', trigger: 'pagamento_recebido', condition: JSON.stringify({ type: 'receber' }), action: 'conciliar', actionParams: JSON.stringify({ matchField: 'description' }), active: true, tenantId: tenant.id } }),
    db.automationRule.create({ data: { name: 'Alerta de Custo Fixo', trigger: 'vencimento_proximo', condition: JSON.stringify({ planIds: [2,3,7] }), action: 'notificar', actionParams: JSON.stringify({ messageTemplate: 'Despesa fixa próxima do vencimento: {description}' }), active: true, tenantId: tenant.id } }),
  ])

  console.log('✅ Seed completed successfully!')
  console.log(`   Tenant: ${tenant.name}`)
  console.log(`   Users: ${users.length}`)
  console.log(`   Clients: ${clients.length}`)
  console.log(`   Account Plans: ${accountPlans.length}`)
  console.log(`   Accounts: ${accounts.length}`)
  console.log(`   Commissions: ${commissionData.length}`)
  console.log(`   Notifications: 8`)
  console.log(`   Automation Rules: 6`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
