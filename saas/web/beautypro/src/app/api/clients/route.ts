import { db } from '@/lib/db';

const TENANT_ID = 'tenant_demo_01';

export async function GET() {
  try {
    const clients = await db.client.findMany({
      where: { tenantId: TENANT_ID },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return Response.json(clients);
  } catch (error) {
    console.error('Clients GET error:', error);
    return Response.json(
      { error: 'Failed to fetch clients', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, birthday, notes, preferredProId, source } = body;

    if (!name) {
      return Response.json({ error: 'Nome é obrigatório' }, { status: 400 });
    }

    const client = await db.client.create({
      data: {
        tenantId: TENANT_ID,
        name,
        email: email || null,
        phone: phone || null,
        birthday: birthday ? new Date(birthday) : null,
        notes: notes || null,
        preferredProId: preferredProId || null,
        source: source || null,
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return Response.json(client, { status: 201 });
  } catch (error) {
    console.error('Clients POST error:', error);
    return Response.json(
      { error: 'Failed to create client', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, email, phone, birthday, notes, preferredProId, source } = body;

    if (!id) {
      return Response.json({ error: 'ID é obrigatório' }, { status: 400 });
    }

    const existing = await db.client.findFirst({
      where: { id, tenantId: TENANT_ID },
    });

    if (!existing) {
      return Response.json({ error: 'Cliente não encontrado' }, { status: 404 });
    }

    const client = await db.client.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email: email || null }),
        ...(phone !== undefined && { phone: phone || null }),
        ...(birthday !== undefined && { birthday: birthday ? new Date(birthday) : null }),
        ...(notes !== undefined && { notes: notes || null }),
        ...(preferredProId !== undefined && { preferredProId: preferredProId || null }),
        ...(source !== undefined && { source: source || null }),
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return Response.json(client);
  } catch (error) {
    console.error('Clients PUT error:', error);
    return Response.json(
      { error: 'Failed to update client', details: error instanceof Error ? error.message : 'Unknown error' },
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

    const existing = await db.client.findFirst({
      where: { id, tenantId: TENANT_ID },
    });

    if (!existing) {
      return Response.json({ error: 'Cliente não encontrado' }, { status: 404 });
    }

    // Delete tag assignments first
    await db.clientTagAssignment.deleteMany({
      where: { clientId: id },
    });

    await db.client.delete({
      where: { id },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Clients DELETE error:', error);
    return Response.json(
      { error: 'Failed to delete client', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
