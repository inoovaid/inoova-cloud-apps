import { db } from '@/lib/db';

const TENANT_ID = 'tenant_demo_01';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const professionalId = searchParams.get('professionalId');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: any = { tenantId: TENANT_ID };

    if (date) {
      const dateStart = new Date(date);
      const dateEnd = new Date(dateStart);
      dateEnd.setDate(dateEnd.getDate() + 1);
      where.date = { gte: dateStart.toISOString(), lt: dateEnd.toISOString() };
    } else if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate).toISOString();
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1);
        where.date.lt = end.toISOString();
      }
    }

    if (professionalId) {
      where.professionalId = professionalId;
    }

    if (status) {
      where.status = status;
    }

    const appointments = await db.appointment.findMany({
      where,
      include: {
        client: { select: { id: true, name: true, phone: true } },
        professional: { select: { id: true, name: true, color: true, specialty: true } },
        services: {
          include: {
            service: { select: { id: true, name: true, category: true, price: true, duration: true } },
          },
        },
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });

    return Response.json(appointments);
  } catch (error) {
    console.error('Appointments GET error:', error);
    return Response.json(
      { error: 'Failed to fetch appointments', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clientId, professionalId, date, startTime, endTime, notes, branchId, serviceIds } = body;

    if (!clientId || !professionalId || !date || !startTime || !endTime) {
      return Response.json(
        { error: 'Missing required fields: clientId, professionalId, date, startTime, endTime' },
        { status: 400 }
      );
    }

    const appointment = await db.appointment.create({
      data: {
        tenantId: TENANT_ID,
        branchId: branchId || null,
        clientId,
        professionalId,
        date: new Date(date),
        startTime,
        endTime,
        notes: notes || null,
        status: 'scheduled',
      },
    });

    // Create appointment-service relations if serviceIds provided
    if (serviceIds && Array.isArray(serviceIds) && serviceIds.length > 0) {
      const services = await db.service.findMany({
        where: { id: { in: serviceIds }, tenantId: TENANT_ID },
      });

      const appointmentServices = services.map((srv) => ({
        appointmentId: appointment.id,
        serviceId: srv.id,
        price: srv.price,
        duration: srv.duration,
      }));

      await db.appointmentService.createMany({ data: appointmentServices });
    }

    const fullAppointment = await db.appointment.findUnique({
      where: { id: appointment.id },
      include: {
        client: { select: { id: true, name: true, phone: true } },
        professional: { select: { id: true, name: true, color: true, specialty: true } },
        services: {
          include: {
            service: { select: { id: true, name: true, category: true, price: true, duration: true } },
          },
        },
      },
    });

    return Response.json(fullAppointment, { status: 201 });
  } catch (error) {
    console.error('Appointments POST error:', error);
    return Response.json(
      { error: 'Failed to create appointment', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, date, startTime, endTime, status, notes, professionalId, clientId } = body;

    if (!id) {
      return Response.json({ error: 'ID é obrigatório' }, { status: 400 });
    }

    const existing = await db.appointment.findFirst({
      where: { id, tenantId: TENANT_ID },
    });

    if (!existing) {
      return Response.json({ error: 'Agendamento não encontrado' }, { status: 404 });
    }

    const updateData: any = {};
    if (date !== undefined) updateData.date = new Date(date);
    if (startTime !== undefined) updateData.startTime = startTime;
    if (endTime !== undefined) updateData.endTime = endTime;
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (professionalId !== undefined) updateData.professionalId = professionalId;
    if (clientId !== undefined) updateData.clientId = clientId;

    if (status === 'confirmed' && !existing.confirmedAt) {
      updateData.confirmedAt = new Date();
    }

    const appointment = await db.appointment.update({
      where: { id },
      data: updateData,
      include: {
        client: { select: { id: true, name: true, phone: true } },
        professional: { select: { id: true, name: true, color: true, specialty: true } },
        services: {
          include: {
            service: { select: { id: true, name: true, category: true, price: true, duration: true } },
          },
        },
      },
    });

    return Response.json(appointment);
  } catch (error) {
    console.error('Appointments PUT error:', error);
    return Response.json(
      { error: 'Failed to update appointment', details: error instanceof Error ? error.message : 'Unknown error' },
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

    const existing = await db.appointment.findFirst({
      where: { id, tenantId: TENANT_ID },
    });

    if (!existing) {
      return Response.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // Delete related appointment-service relations first
    await db.appointmentService.deleteMany({
      where: { appointmentId: id },
    });

    await db.appointment.delete({
      where: { id },
    });

    return Response.json({ success: true, id });
  } catch (error) {
    console.error('Appointments DELETE error:', error);
    return Response.json(
      { error: 'Failed to delete appointment', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
