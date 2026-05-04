import { db } from '@/lib/db';

const TENANT_ID = 'tenant_demo_01';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true';

    const where: any = { tenantId: TENANT_ID };
    if (!all) {
      where.isPublished = true;
    }

    const posts = await db.blogPost.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return Response.json(posts);
  } catch (error) {
    console.error('Blog GET error:', error);
    return Response.json(
      { error: 'Failed to fetch blog posts', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, slug, excerpt, content, coverImage, category, author, isPublished } = body;

    if (!title || !content) {
      return Response.json({ error: 'Title and content are required' }, { status: 400 });
    }

    // Generate slug from title if not provided
    const finalSlug = slug || title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Check for slug uniqueness
    const existing = await db.blogPost.findUnique({ where: { slug: finalSlug } });
    if (existing) {
      return Response.json({ error: 'Slug already exists' }, { status: 409 });
    }

    const post = await db.blogPost.create({
      data: {
        tenantId: TENANT_ID,
        title,
        slug: finalSlug,
        excerpt: excerpt || null,
        content,
        coverImage: coverImage || null,
        category: category || null,
        author: author || null,
        isPublished: isPublished || false,
        publishedAt: isPublished ? new Date() : null,
      },
    });

    return Response.json(post, { status: 201 });
  } catch (error) {
    console.error('Blog POST error:', error);
    return Response.json(
      { error: 'Failed to create blog post', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
