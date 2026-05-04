import { db } from '@/lib/db';

const TENANT_ID = 'tenant_demo_01';

export async function GET() {
  try {
    const automations = await db.automation.findMany({
      where: { tenantId: TENANT_ID },
      include: {
        logs: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return Response.json(automations);
  } catch (error) {
    console.error('Automations GET error:', error);
    return Response.json(
      { error: 'Failed to fetch automations', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, type, channel, template, triggerRule, schedule, isActive } = body;

    if (!name || !type) {
      return Response.json({ error: 'Name and type are required' }, { status: 400 });
    }

    const automation = await db.automation.create({
      data: {
        tenantId: TENANT_ID,
        name,
        type,
        channel: channel || 'whatsapp',
        template: template || null,
        triggerRule: triggerRule || null,
        schedule: schedule || null,
        isActive: isActive !== undefined ? isActive : true,
      },
      include: {
        logs: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    return Response.json(automation, { status: 201 });
  } catch (error) {
    console.error('Automations POST error:', error);
    return Response.json(
      { error: 'Failed to create automation', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, type, channel, template, triggerRule, schedule, isActive } = body;

    if (!id) {
      return Response.json({ error: 'ID is required' }, { status: 400 });
    }

    const existing = await db.automation.findFirst({
      where: { id, tenantId: TENANT_ID },
    });

    if (!existing) {
      return Response.json({ error: 'Automation not found' }, { status: 404 });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (type !== undefined) updateData.type = type;
    if (channel !== undefined) updateData.channel = channel;
    if (template !== undefined) updateData.template = template;
    if (triggerRule !== undefined) updateData.triggerRule = triggerRule;
    if (schedule !== undefined) updateData.schedule = schedule;
    if (isActive !== undefined) updateData.isActive = isActive;

    const automation = await db.automation.update({
      where: { id },
      data: updateData,
      include: {
        logs: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    return Response.json(automation);
  } catch (error) {
    console.error('Automations PUT error:', error);
    return Response.json(
      { error: 'Failed to update automation', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return Response.json({ error: 'ID query parameter is required' }, { status: 400 });
    }

    const existing = await db.automation.findFirst({
      where: { id, tenantId: TENANT_ID },
    });

    if (!existing) {
      return Response.json({ error: 'Automation not found' }, { status: 404 });
    }

    // Delete related logs first
    await db.automationLog.deleteMany({
      where: { automationId: id },
    });

    await db.automation.delete({
      where: { id },
    });

    return Response.json({ success: true, id });
  } catch (error) {
    console.error('Automations DELETE error:', error);
    return Response.json(
      { error: 'Failed to delete automation', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
