import { db } from '@/lib/db';
import { analyzeClients } from '@/lib/smart-ai-service';

const TENANT_ID = 'tenant_demo_01';

export async function GET() {
  try {
    // Run Smart AI analysis
    const analysis = await analyzeClients();

    // Fetch existing SmartSuggestion records from database
    const existingSuggestions = await db.smartSuggestion.findMany({
      where: { tenantId: TENANT_ID },
      orderBy: [
        { isRead: 'asc' },
        { isResolved: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    return Response.json({
      analysis,
      suggestions: existingSuggestions,
    });
  } catch (error) {
    console.error('Smart AI GET error:', error);
    return Response.json(
      { error: 'Failed to run Smart AI analysis', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
