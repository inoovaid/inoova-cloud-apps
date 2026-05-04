import { db } from '@/lib/db';

const TENANT_ID = 'tenant_demo_01';

export async function GET() {
  try {
    const services = await db.service.findMany({
      where: { tenantId: TENANT_ID, isActive: true },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });

    // Group by category
    const grouped: Record<string, typeof services> = {};
    for (const service of services) {
      const category = service.category || 'Outros';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(service);
    }

    return Response.json(grouped);
  } catch (error) {
    console.error('Services GET error:', error);
    return Response.json(
      { error: 'Failed to fetch services', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
