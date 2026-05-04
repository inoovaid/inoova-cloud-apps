import { db } from '@/lib/db';

const TENANT_ID = 'tenant_demo_01';

export async function GET() {
  try {
    const products = await db.product.findMany({
      where: { tenantId: TENANT_ID, isActive: true },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });

    return Response.json(products);
  } catch (error) {
    console.error('Products GET error:', error);
    return Response.json(
      { error: 'Failed to fetch products', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, brand, category, sku, price, cost, stock, minStock } = body;

    if (!name) {
      return Response.json({ error: 'Nome é obrigatório' }, { status: 400 });
    }

    const product = await db.product.create({
      data: {
        tenantId: TENANT_ID,
        name,
        brand: brand || null,
        category: category || null,
        sku: sku || null,
        price: parseFloat(price) || 0,
        cost: parseFloat(cost) || 0,
        stock: parseInt(stock) || 0,
        minStock: parseInt(minStock) || 5,
        isActive: true,
      },
    });

    return Response.json(product, { status: 201 });
  } catch (error) {
    console.error('Products POST error:', error);
    return Response.json(
      { error: 'Failed to create product', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, brand, category, sku, price, cost, stock, minStock, isActive } = body;

    if (!id) {
      return Response.json({ error: 'ID é obrigatório' }, { status: 400 });
    }

    const existing = await db.product.findFirst({
      where: { id, tenantId: TENANT_ID },
    });

    if (!existing) {
      return Response.json({ error: 'Produto não encontrado' }, { status: 404 });
    }

    const product = await db.product.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(brand !== undefined && { brand: brand || null }),
        ...(category !== undefined && { category: category || null }),
        ...(sku !== undefined && { sku: sku || null }),
        ...(price !== undefined && { price: parseFloat(price) || 0 }),
        ...(cost !== undefined && { cost: parseFloat(cost) || 0 }),
        ...(stock !== undefined && { stock: parseInt(stock) || 0 }),
        ...(minStock !== undefined && { minStock: parseInt(minStock) || 5 }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return Response.json(product);
  } catch (error) {
    console.error('Products PUT error:', error);
    return Response.json(
      { error: 'Failed to update product', details: error instanceof Error ? error.message : 'Unknown error' },
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

    const existing = await db.product.findFirst({
      where: { id, tenantId: TENANT_ID },
    });

    if (!existing) {
      return Response.json({ error: 'Produto não encontrado' }, { status: 404 });
    }

    // Soft delete - mark as inactive
    await db.product.update({
      where: { id },
      data: { isActive: false },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Products DELETE error:', error);
    return Response.json(
      { error: 'Failed to delete product', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
