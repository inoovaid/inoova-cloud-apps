import { db } from '@/lib/db';

const TENANT_ID = 'tenant_demo_01';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const accountPlan = searchParams.get('accountPlan');

    const where: any = { tenantId: TENANT_ID };

    if (type) where.type = type;
    if (status) where.status = status;
    if (accountPlan) where.accountPlan = accountPlan;
    if (startDate || endDate) {
      where.dueDate = {};
      if (startDate) where.dueDate.gte = new Date(startDate);
      if (endDate) where.dueDate.lte = new Date(endDate);
    }

    const records = await db.financialRecord.findMany({
      where,
      orderBy: { dueDate: 'desc' },
    });

    // Compute summary stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

    const allRecords = await db.financialRecord.findMany({
      where: { tenantId: TENANT_ID },
    });

    const overdue = allRecords.filter(
      (r) => r.type === 'receita' && r.status === 'pending' && new Date(r.dueDate) < today
    );
    const dueToday = allRecords.filter(
      (r) => r.status === 'pending' && new Date(r.dueDate) >= today && new Date(r.dueDate) < tomorrow
    );
    const dueTomorrow = allRecords.filter(
      (r) => r.status === 'pending' && new Date(r.dueDate) >= tomorrow && new Date(r.dueDate) < dayAfterTomorrow
    );
    const received = allRecords.filter((r) => r.status === 'paid');
    const allPending = allRecords.filter((r) => r.status === 'pending');

    const summary = {
      overdue: overdue.reduce((s, r) => s + r.amount, 0),
      overdueCount: overdue.length,
      dueToday: dueToday.reduce((s, r) => s + r.amount, 0),
      dueTodayCount: dueToday.length,
      dueTomorrow: dueTomorrow.reduce((s, r) => s + r.amount, 0),
      dueTomorrowCount: dueTomorrow.length,
      received: received.reduce((s, r) => s + r.amount, 0),
      receivedCount: received.length,
      total: allRecords.reduce((s, r) => s + r.amount, 0),
      totalCount: allRecords.length,
      allPending: allPending.reduce((s, r) => s + r.amount, 0),
      allPendingCount: allPending.length,
    };

    // Monthly report data
    const monthlyData: Record<string, { receitas: number; despesas: number; saldo: number }> = {};
    for (const r of allRecords) {
      const month = new Date(r.dueDate).toISOString().substring(0, 7);
      if (!monthlyData[month]) monthlyData[month] = { receitas: 0, despesas: 0, saldo: 0 };
      if (r.type === 'receita' && r.status === 'paid') {
        monthlyData[month].receitas += r.amount;
      } else if (r.type === 'despesa' && r.status === 'paid') {
        monthlyData[month].despesas += r.amount;
      }
    }
    for (const month of Object.keys(monthlyData)) {
      monthlyData[month].saldo = monthlyData[month].receitas - monthlyData[month].despesas;
    }

    const accountPlans = [...new Set(allRecords.map((r) => r.accountPlan).filter(Boolean))] as string[];

    return Response.json({
      records,
      summary,
      monthlyData,
      accountPlans,
    });
  } catch (error) {
    console.error('Financial GET error:', error);
    return Response.json(
      { error: 'Failed to fetch financial records', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, category, description, amount, dueDate, paidAt, status, accountPlan, notes } = body;

    if (!description || !amount || !dueDate) {
      return Response.json({ error: 'Descrição, valor e data de vencimento são obrigatórios' }, { status: 400 });
    }

    const record = await db.financialRecord.create({
      data: {
        tenantId: TENANT_ID,
        type: type || 'receita',
        category: category || 'Outros',
        description,
        amount: parseFloat(amount),
        dueDate: new Date(dueDate),
        paidAt: paidAt ? new Date(paidAt) : null,
        status: status || 'pending',
        accountPlan: accountPlan || null,
        notes: notes || null,
      },
    });

    return Response.json(record, { status: 201 });
  } catch (error) {
    console.error('Financial POST error:', error);
    return Response.json(
      { error: 'Failed to create financial record', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, type, category, description, amount, dueDate, paidAt, status, accountPlan, notes } = body;

    if (!id) {
      return Response.json({ error: 'ID é obrigatório' }, { status: 400 });
    }

    const existing = await db.financialRecord.findFirst({
      where: { id, tenantId: TENANT_ID },
    });

    if (!existing) {
      return Response.json({ error: 'Registro não encontrado' }, { status: 404 });
    }

    const record = await db.financialRecord.update({
      where: { id },
      data: {
        ...(type !== undefined && { type }),
        ...(category !== undefined && { category }),
        ...(description !== undefined && { description }),
        ...(amount !== undefined && { amount: parseFloat(amount) }),
        ...(dueDate !== undefined && { dueDate: new Date(dueDate) }),
        ...(paidAt !== undefined && { paidAt: paidAt ? new Date(paidAt) : null }),
        ...(status !== undefined && { status }),
        ...(accountPlan !== undefined && { accountPlan: accountPlan || null }),
        ...(notes !== undefined && { notes: notes || null }),
      },
    });

    return Response.json(record);
  } catch (error) {
    console.error('Financial PUT error:', error);
    return Response.json(
      { error: 'Failed to update financial record', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return Response.json({ error: 'ID é obrigatório' }, { status: 400 });
    }

    const existing = await db.financialRecord.findFirst({
      where: { id, tenantId: TENANT_ID },
    });

    if (!existing) {
      return Response.json({ error: 'Registro não encontrado' }, { status: 404 });
    }

    await db.financialRecord.delete({ where: { id } });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Financial DELETE error:', error);
    return Response.json(
      { error: 'Failed to delete financial record', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
