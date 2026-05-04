import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const automations = await db.automationRule.findMany({
      include: {
        tenant: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(automations)
  } catch (error) {
    console.error('Error fetching automations:', error)
    return NextResponse.json({ error: 'Erro ao buscar automações' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, trigger, condition, action, actionParams } = body

    const tenant = await db.tenant.findFirst()
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant não encontrado' }, { status: 404 })
    }

    const automation = await db.automationRule.create({
      data: {
        name,
        trigger,
        condition: condition ? JSON.stringify(condition) : null,
        action,
        actionParams: actionParams ? JSON.stringify(actionParams) : null,
        active: true,
        tenantId: tenant.id,
      },
    })

    return NextResponse.json(automation, { status: 201 })
  } catch (error) {
    console.error('Error creating automation:', error)
    return NextResponse.json({ error: 'Erro ao criar automação' }, { status: 500 })
  }
}
