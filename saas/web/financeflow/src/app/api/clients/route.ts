import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')

    const where: Record<string, unknown> = {}
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { cpfCnpj: { contains: search } },
        { city: { contains: search } },
      ]
    }

    const clients = await db.client.findMany({
      where,
      include: {
        _count: { select: { accounts: true } },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(clients)
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json({ error: 'Erro ao buscar clientes' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, cpfCnpj, city, state, tags, notes, address, zipCode } = body

    const tenant = await db.tenant.findFirst()
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant não encontrado' }, { status: 404 })
    }

    const client = await db.client.create({
      data: {
        name,
        email: email || null,
        phone: phone || null,
        cpfCnpj: cpfCnpj || null,
        city: city || null,
        state: state || null,
        tags: tags || '',
        notes: notes || '',
        address: address || null,
        zipCode: zipCode || null,
        tenantId: tenant.id,
      },
    })

    return NextResponse.json(client, { status: 201 })
  } catch (error) {
    console.error('Error creating client:', error)
    return NextResponse.json({ error: 'Erro ao criar cliente' }, { status: 500 })
  }
}
