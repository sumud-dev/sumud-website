import { NextRequest, NextResponse } from 'next/server';
import { getPosts } from '@/src/actions/posts.actions';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const status = searchParams.get('status') || 'published';
    const response = await getPosts({
      search: searchParams.get('search') || undefined,
      status: status as 'draft' | 'published' | 'archived',
      language: searchParams.get('language') || 'en',
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50,
    });

    if (!response.success) {
      return NextResponse.json(
        { error: response.error || 'Failed to fetch articles' },
        { status: 500 }
      );
    }

    const { posts, pagination } = response.result;

    // Transform posts to match expected article format
    const articles = posts
      .filter(post => post.title && post.slug) // Filter out incomplete articles
      .map((post) => ({
        id: post.id,
        slug: post.slug,
        title: post.title || '',
        excerpt: post.excerpt || '',
        category: 'article',
        status: post.status || 'published',
        publishedAt: post.publishedAt,
        updatedAt: post.updatedAt,
        image: post.featuredImage,
        author: post.authorName ? { name: post.authorName } : undefined,
      }));

    return NextResponse.json({ 
      data: articles, 
      total: pagination.totalItems 
    });
  } catch (error) {
    console.error('Error in articles API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}
