import { NextRequest, NextResponse } from 'next/server';
import { getPostBySlug } from '@/src/actions/posts.actions';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const language = request.nextUrl.searchParams.get('language') || 'en';

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug parameter is required' },
        { status: 400 }
      );
    }

    // Try to find article in the requested language first
    let article = await getPostBySlug(slug, language);

    // If not found, try other languages
    if (!article) {
      const languages = ['fi', 'en'];
      for (const lang of languages) {
        if (lang !== language) {
          article = await getPostBySlug(slug, lang);
          if (article) {
            break;
          }
        }
      }
    }

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(article);
  } catch (error) {
    console.error('Error in article detail API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    );
  }
}
