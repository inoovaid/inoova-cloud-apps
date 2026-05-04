import { db } from '@/lib/db';

const TENANT_ID = 'tenant_demo_01';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const post = await db.blogPost.findFirst({
      where: { id, tenantId: TENANT_ID },
    });

    if (!post) {
      return Response.json({ error: 'Post not found' }, { status: 404 });
    }

    return Response.json(post);
  } catch (error) {
    console.error('Blog GET by ID error:', error);
    return Response.json(
      { error: 'Failed to fetch blog post' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, slug, excerpt, content, coverImage, category, author, isPublished } = body;

    if (slug) {
      const existing = await db.blogPost.findFirst({
        where: { slug, NOT: { id } },
      });
      if (existing) {
        return Response.json({ error: 'Slug already exists' }, { status: 409 });
      }
    }

    const post = await db.blogPost.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(slug !== undefined && { slug }),
        ...(excerpt !== undefined && { excerpt }),
        ...(content !== undefined && { content }),
        ...(coverImage !== undefined && { coverImage }),
        ...(category !== undefined && { category }),
        ...(author !== undefined && { author }),
        ...(isPublished !== undefined && {
          isPublished,
          publishedAt: isPublished ? new Date() : null,
        }),
      },
    });

    return Response.json(post);
  } catch (error) {
    console.error('Blog PUT error:', error);
    return Response.json(
      { error: 'Failed to update blog post', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.blogPost.delete({ where: { id } });
    return Response.json({ success: true });
  } catch (error) {
    console.error('Blog DELETE error:', error);
    return Response.json(
      { error: 'Failed to delete blog post' },
      { status: 500 }
    );
  }
}
