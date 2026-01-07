import { NextRequest, NextResponse } from 'next/server';
import { getPosts } from '@/src/actions/article.actions';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const status = searchParams.get('status') || 'published';
    const result = await getPosts({
      search: searchParams.get('search') || undefined,
      status: status as 'draft' | 'published' | 'archived',
      language: searchParams.get('language') || 'en',
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to fetch articles' },
        { status: 500 }
      );
    }

    // Transform posts to match expected article format
    const articles = result.posts.map((post) => ({
      id: post.id,
      slug: post.slug,
      title: post.title || '',
      excerpt: post.excerpt || '',
      category: post.category?.name || 'uncategorized',
      status: post.status || 'published',
      publishedAt: post.published_at,
      updatedAt: post.updated_at,
      image: post.featuredImage,
      author: post.authorName ? { name: post.authorName } : undefined,
    }));

    return NextResponse.json({ data: articles, total: result.total });
  } catch (error) {
    console.error('Error in articles API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}
