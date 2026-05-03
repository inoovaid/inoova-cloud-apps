import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const notifications = await db.notification.findMany({
      include: {
        user: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    return NextResponse.json(notifications)
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ error: 'Erro ao buscar notificações' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { ids, all } = body

    if (all) {
      await db.notification.updateMany({
        where: { read: false },
        data: { read: true },
      })
    } else if (ids && Array.isArray(ids)) {
      await db.notification.updateMany({
        where: { id: { in: ids } },
        data: { read: true },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error marking notifications:', error)
    return NextResponse.json({ error: 'Erro ao atualizar notificações' }, { status: 500 })
  }
}
