import { db } from '@/lib/db';

const TENANT_ID = 'tenant_demo_01';

// GET - List all users for tenant
export async function GET() {
  try {
    const users = await db.user.findMany({
      where: { tenantId: TENANT_ID },
      orderBy: { name: 'asc' },
    });

    // Don't expose passwords in list view
    const safeUsers = users.map(({ password: _pw, ...rest }) => rest);

    return Response.json(safeUsers);
  } catch (error) {
    console.error('Users GET error:', error);
    return Response.json(
      { error: 'Failed to fetch users', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST - Create user
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, role, phone, password } = body;

    if (!name || !email) {
      return Response.json({ error: 'Nome e email são obrigatórios' }, { status: 400 });
    }

    // Check for duplicate email in tenant
    const existing = await db.user.findFirst({
      where: { tenantId: TENANT_ID, email },
    });

    if (existing) {
      return Response.json({ error: 'Email já cadastrado neste tenant' }, { status: 409 });
    }

    const user = await db.user.create({
      data: {
        tenantId: TENANT_ID,
        name,
        email,
        role: role || 'funcionario',
        phone: phone || null,
        password: password || null,
      },
    });

    // Don't expose password in response
    const { password: _pw, ...safeUser } = user;
    return Response.json(safeUser, { status: 201 });
  } catch (error) {
    console.error('Users POST error:', error);
    return Response.json(
      { error: 'Failed to create user', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PUT - Update user
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, email, role, phone, password, isActive } = body;

    if (!id) {
      return Response.json({ error: 'ID é obrigatório' }, { status: 400 });
    }

    const existing = await db.user.findFirst({
      where: { id, tenantId: TENANT_ID },
    });

    if (!existing) {
      return Response.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    // If email is changing, check for duplicates
    if (email && email !== existing.email) {
      const duplicate = await db.user.findFirst({
        where: { tenantId: TENANT_ID, email, NOT: { id } },
      });
      if (duplicate) {
        return Response.json({ error: 'Email já cadastrado neste tenant' }, { status: 409 });
      }
    }

    const user = await db.user.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
        ...(role !== undefined && { role }),
        ...(phone !== undefined && { phone: phone || null }),
        ...(password !== undefined && { password: password || null }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    const { password: _pw, ...safeUser } = user;
    return Response.json(safeUser);
  } catch (error) {
    console.error('Users PUT error:', error);
    return Response.json(
      { error: 'Failed to update user', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete user by id query param
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return Response.json({ error: 'ID é obrigatório' }, { status: 400 });
    }

    const existing = await db.user.findFirst({
      where: { id, tenantId: TENANT_ID },
    });

    if (!existing) {
      return Response.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    await db.user.delete({
      where: { id },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Users DELETE error:', error);
    return Response.json(
      { error: 'Failed to delete user', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
