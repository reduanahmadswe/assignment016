import { Metadata } from 'next';
import { blogAPI } from '@/lib/api';
import { getImageUrl } from '@/lib/utils';

interface Props {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
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
    
    // Handle different image URL formats for social media sharing
    let imageUrl = `${appUrl}/images/og-default.jpg`;
    
    if (post.thumbnail) {
      // If it's a Google Drive link, proxy it through our API
      if (post.thumbnail.includes('drive.google.com') || post.thumbnail.includes('docs.google.com')) {
        imageUrl = `${appUrl}/api/og-image?url=${encodeURIComponent(post.thumbnail)}`;
      }
      // If it's already a full URL (not Google Drive), use it directly
      else if (post.thumbnail.startsWith('http://') || post.thumbnail.startsWith('https://')) {
        imageUrl = post.thumbnail;
      } else {
        // If it's a relative path, make it absolute
        imageUrl = `${appUrl}${post.thumbnail.startsWith('/') ? '' : '/'}${post.thumbnail}`;
      }
    }
    
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
