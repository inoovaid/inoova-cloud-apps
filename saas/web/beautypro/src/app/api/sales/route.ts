import { db } from '@/lib/db';

const TENANT_ID = 'tenant_demo_01';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: any = { tenantId: TENANT_ID };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate).toISOString();
      }
      if (endDate) {
        // Include the entire end day
        const end = new Date(endDate);
        end.setDate(end.getDate() + 1);
        where.createdAt.lt = end.toISOString();
      }
    }

    const sales = await db.sale.findMany({
      where,
      include: {
        items: true,
        client: { select: { id: true, name: true, phone: true } },
        professional: { select: { id: true, name: true, color: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return Response.json(sales);
  } catch (error) {
    console.error('Sales GET error:', error);
    return Response.json(
      { error: 'Failed to fetch sales', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clientId, professionalId, branchId, items, discount, paymentMethod, notes } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return Response.json({ error: 'At least one item is required' }, { status: 400 });
    }

    // Calculate totals
    let total = 0;
    const saleItemsData = [];

    for (const item of items) {
      const itemTotal = (item.unitPrice || 0) * (item.quantity || 1);
      total += itemTotal;

      saleItemsData.push({
        productId: item.productId || null,
        type: item.type || 'service',
        name: item.name || '',
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice || 0,
        total: itemTotal,
        commissionPercent: item.commissionPercent || 0,
        commissionAmount: (itemTotal * (item.commissionPercent || 0)) / 100,
      });
    }

    const saleDiscount = discount || 0;
    const saleTotal = total - saleDiscount;

    const sale = await db.sale.create({
      data: {
        tenantId: TENANT_ID,
        branchId: branchId || null,
        clientId: clientId || null,
        professionalId: professionalId || null,
        total: saleTotal,
        discount: saleDiscount,
        paymentMethod: paymentMethod || null,
        notes: notes || null,
        status: 'completed',
        items: {
          create: saleItemsData,
        },
      },
      include: {
        items: true,
        client: { select: { id: true, name: true, phone: true } },
        professional: { select: { id: true, name: true, color: true } },
      },
    });

    // Update client stats if clientId provided
    if (clientId) {
      const clientSales = await db.sale.findMany({
        where: { tenantId: TENANT_ID, clientId, status: 'completed' },
        select: { total: true },
      });

      const totalSpent = clientSales.reduce((sum, s) => sum + s.total, 0);
      const totalVisits = clientSales.length;
      const avgTicket = totalVisits > 0 ? totalSpent / totalVisits : 0;

      await db.client.update({
        where: { id: clientId },
        data: {
          totalSpent,
          totalVisits,
          avgTicket,
          lastVisitAt: new Date(),
        },
      });
    }

    // Update product stock for product items
    for (const item of sale.items) {
      if (item.type === 'product' && item.productId) {
        await db.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }
    }

    return Response.json(sale, { status: 201 });
  } catch (error) {
    console.error('Sales POST error:', error);
    return Response.json(
      { error: 'Failed to create sale', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
