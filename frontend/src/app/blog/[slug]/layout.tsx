import { Metadata } from 'next';
import { blogAPI } from '@/lib/api';
import { getImageUrl } from '@/lib/utils';

interface Props {
  params: { slug: string };
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params;
  
  try {
    // Fetch blog post data server-side
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/blogs/slug/${slug}`,
      { 
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    if (!response.ok) {
      return {
        title: 'Blog Not Found - ORIYET',
        description: 'The blog post you are looking for could not be found.',
      };
    }

    const data = await response.json();
    const post = data.data;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const pageUrl = `${appUrl}/blog/${post.slug}`;
    const imageUrl = post.thumbnail 
      ? (post.thumbnail.startsWith('http') ? post.thumbnail : `${appUrl}${post.thumbnail}`)
      : `${appUrl}/images/og-default.jpg`;
    
    const description = post.excerpt || post.title;
    const title = `${post.title} - ORIYET Blog`;

    return {
      title,
      description,
      openGraph: {
        title: post.title,
        description,
        url: pageUrl,
        siteName: 'ORIYET',
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: post.title,
          },
        ],
        locale: 'en_US',
        type: 'article',
        publishedTime: post.publishedAt,
        authors: post.author?.name ? [post.author.name] : undefined,
        tags: typeof post.tags === 'string' 
          ? post.tags.split(',').map((t: string) => t.trim()) 
          : post.tags,
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description,
        images: [imageUrl],
        creator: post.author?.name ? `@${post.author.name.replace(/\s+/g, '')}` : undefined,
      },
      alternates: {
        canonical: pageUrl,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Blog - ORIYET',
      description: 'Read the latest research articles and insights from ORIYET.',
    };
  }
}

export default function BlogPostLayout({ children }: Props) {
  return <>{children}</>;
}
