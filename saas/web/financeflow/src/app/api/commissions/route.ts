import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}
    if (userId) where.userId = userId
    if (status) where.status = status

    const commissions = await db.commission.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        account: { select: { id: true, description: true, amount: true, status: true, type: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(commissions)
  } catch (error) {
    console.error('Error fetching commissions:', error)
    return NextResponse.json({ error: 'Erro ao buscar comissões' }, { status: 500 })
  }
}
