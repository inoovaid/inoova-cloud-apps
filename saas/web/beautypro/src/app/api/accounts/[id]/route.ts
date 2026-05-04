import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const account = await db.account.findUnique({
      where: { id },
      include: {
        client: true,
        accountPlan: true,
        creator: { select: { id: true, name: true } },
        commissions: { include: { user: { select: { id: true, name: true } } } },
        children: {
          include: {
            client: true,
          },
          orderBy: { installmentNumber: 'asc' },
        },
      },
    })

    if (!account) {
      return NextResponse.json({ error: 'Conta não encontrada' }, { status: 404 })
    }

    return NextResponse.json(account)
  } catch (error) {
    console.error('Error fetching account:', error)
    return NextResponse.json({ error: 'Erro ao buscar conta' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const account = await db.account.update({
      where: { id },
      data: {
        ...(body.description !== undefined && { description: body.description }),
        ...(body.amount !== undefined && { amount: parseFloat(body.amount) }),
        ...(body.type !== undefined && { type: body.type }),
        ...(body.dueDate !== undefined && { dueDate: new Date(body.dueDate) }),
        ...(body.paymentDate !== undefined && {
          paymentDate: body.paymentDate ? new Date(body.paymentDate) : null,
        }),
        ...(body.status !== undefined && { status: body.status }),
        ...(body.clientId !== undefined && { clientId: body.clientId || null }),
        ...(body.accountPlanId !== undefined && {
          accountPlanId: body.accountPlanId || null,
        }),
        ...(body.tags !== undefined && { tags: body.tags }),
        ...(body.notes !== undefined && { notes: body.notes }),
        ...(body.recurring !== undefined && { recurring: body.recurring }),
        ...(body.recurringCycle !== undefined && {
          recurringCycle: body.recurringCycle || null,
        }),
      },
      include: {
        client: true,
        accountPlan: true,
        creator: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json(account)
  } catch (error) {
    console.error('Error updating account:', error)
    return NextResponse.json({ error: 'Erro ao atualizar conta' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await db.commission.deleteMany({ where: { accountId: id } })
    await db.account.deleteMany({ where: { parentAccountId: id } })
    await db.account.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting account:', error)
    return NextResponse.json({ error: 'Erro ao excluir conta' }, { status: 500 })
  }
}
