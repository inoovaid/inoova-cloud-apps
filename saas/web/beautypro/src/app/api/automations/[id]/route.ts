import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const automation = await db.automationRule.update({
      where: { id },
      data: {
        ...(body.active !== undefined && { active: body.active }),
        ...(body.name !== undefined && { name: body.name }),
        ...(body.trigger !== undefined && { trigger: body.trigger }),
        ...(body.action !== undefined && { action: body.action }),
        ...(body.condition !== undefined && {
          condition: body.condition ? JSON.stringify(body.condition) : null,
        }),
        ...(body.actionParams !== undefined && {
          actionParams: body.actionParams
            ? JSON.stringify(body.actionParams)
            : null,
        }),
      },
    })

    return NextResponse.json(automation)
  } catch (error) {
    console.error('Error updating automation:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar automação' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await db.automationRule.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting automation:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir automação' },
      { status: 500 }
    )
  }
}
