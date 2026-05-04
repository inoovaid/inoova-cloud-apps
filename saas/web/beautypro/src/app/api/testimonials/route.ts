import { db } from '@/lib/db';

const TENANT_ID = 'tenant_demo_01';

export async function GET() {
  try {
    const testimonials = await db.testimonial.findMany({
      where: { tenantId: TENANT_ID, isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    return Response.json(testimonials);
  } catch (error) {
    console.error('Testimonials GET error:', error);
    return Response.json(
      { error: 'Failed to fetch testimonials', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
