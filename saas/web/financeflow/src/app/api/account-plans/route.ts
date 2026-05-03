import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const plans = await db.accountPlan.findMany({
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
    })

    return NextResponse.json(plans)
  } catch (error) {
    console.error('Error fetching account plans:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar planos de conta' },
      { status: 500 }
    )
  }
}
