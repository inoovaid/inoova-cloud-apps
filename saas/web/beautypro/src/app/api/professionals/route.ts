import { db } from '@/lib/db';

const TENANT_ID = 'tenant_demo_01';

export async function GET() {
  try {
    const professionals = await db.professional.findMany({
      where: { tenantId: TENANT_ID },
      include: {
        branch: { select: { id: true, name: true } },
        _count: {
          select: { appointments: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    const result = professionals.map((pro) => ({
      id: pro.id,
      name: pro.name,
      email: pro.email,
      specialty: pro.specialty,
      phone: pro.phone,
      color: pro.color,
      bio: pro.bio,
      isActive: pro.isActive,
      branch: pro.branch,
      appointmentsCount: pro._count.appointments,
    }));

    return Response.json(result);
  } catch (error) {
    console.error('Professionals GET error:', error);
    return Response.json(
      { error: 'Failed to fetch professionals', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, specialty, phone, color, bio } = body;

    if (!name) {
      return Response.json({ error: 'Nome é obrigatório' }, { status: 400 });
    }

    const professional = await db.professional.create({
      data: {
        tenantId: TENANT_ID,
        name,
        email: email || null,
        specialty: specialty || null,
        phone: phone || null,
        color: color || null,
        bio: bio || null,
        isActive: true,
      },
    });

    return Response.json(professional, { status: 201 });
  } catch (error) {
    console.error('Professionals POST error:', error);
    return Response.json(
      { error: 'Failed to create professional', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, email, specialty, phone, color, bio, isActive } = body;

    if (!id) {
      return Response.json({ error: 'ID é obrigatório' }, { status: 400 });
    }

    const existing = await db.professional.findFirst({
      where: { id, tenantId: TENANT_ID },
    });

    if (!existing) {
      return Response.json({ error: 'Profissional não encontrado' }, { status: 404 });
    }

    const professional = await db.professional.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email: email || null }),
        ...(specialty !== undefined && { specialty: specialty || null }),
        ...(phone !== undefined && { phone: phone || null }),
        ...(color !== undefined && { color: color || null }),
        ...(bio !== undefined && { bio: bio || null }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return Response.json(professional);
  } catch (error) {
    console.error('Professionals PUT error:', error);
    return Response.json(
      { error: 'Failed to update professional', details: error instanceof Error ? error.message : 'Unknown error' },
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

    const existing = await db.professional.findFirst({
      where: { id, tenantId: TENANT_ID },
    });

    if (!existing) {
      return Response.json({ error: 'Profissional não encontrado' }, { status: 404 });
    }

    await db.professional.delete({
      where: { id },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Professionals DELETE error:', error);
    return Response.json(
      { error: 'Failed to delete professional', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
