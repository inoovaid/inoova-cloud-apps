import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const accountPlanId = searchParams.get('accountPlanId')
    const search = searchParams.get('search')
    const clientId = searchParams.get('clientId')

    const where: Record<string, unknown> = {
      parentAccountId: null,
    }

    if (status) where.status = status
    if (type) where.type = type
    if (accountPlanId) where.accountPlanId = accountPlanId
    if (clientId) where.clientId = clientId
    if (search) {
      where.OR = [
        { description: { contains: search } },
        { client: { name: { contains: search } } },
      ]
    }

    if (startDate || endDate) {
      where.dueDate = {}
      if (startDate) (where.dueDate as Record<string, unknown>).gte = new Date(startDate)
      if (endDate) (where.dueDate as Record<string, unknown>).lte = new Date(endDate)
    }

    const accounts = await db.account.findMany({
      where,
      include: {
        client: true,
        accountPlan: true,
        creator: { select: { id: true, name: true } },
        commissions: { include: { user: { select: { id: true, name: true } } } },
      },
      orderBy: { dueDate: 'asc' },
    })

    return NextResponse.json(accounts)
  } catch (error) {
    console.error('Error fetching accounts:', error)
    return NextResponse.json({ error: 'Erro ao buscar contas' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      description,
      amount,
      type,
      dueDate,
      clientId,
      accountPlanId,
      tags,
      notes,
      recurring,
      recurringCycle,
      installmentNumber,
      totalInstallments,
    } = body

    const tenant = await db.tenant.findFirst()
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant não encontrado' }, { status: 404 })
    }

    const creator = await db.user.findFirst()
    const account = await db.account.create({
      data: {
        description,
        amount: parseFloat(amount),
        type,
        dueDate: new Date(dueDate),
        status: 'pendente',
        clientId: clientId || null,
        accountPlanId: accountPlanId || null,
        tenantId: tenant.id,
        creatorId: creator?.id || null,
        tags: tags || '',
        notes: notes || '',
        recurring: recurring || false,
        recurringCycle: recurringCycle || null,
        installmentNumber: installmentNumber || null,
        totalInstallments: totalInstallments || null,
      },
      include: {
        client: true,
        accountPlan: true,
        creator: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json(account, { status: 201 })
  } catch (error) {
    console.error('Error creating account:', error)
    return NextResponse.json({ error: 'Erro ao criar conta' }, { status: 500 })
  }
}
