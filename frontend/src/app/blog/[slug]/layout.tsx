import { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}

// Helper to convert Google Drive URL to direct image URL
function getGoogleDriveDirectUrl(url: string): string {
  if (!url) return '';
  
  let fileId = '';
  const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) {
    fileId = fileMatch[1];
  } else {
    const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idMatch) fileId = idMatch[1];
  }
  
  if (fileId) {
    // Use Google's CDN for direct image access
    return `https://lh3.googleusercontent.com/d/${fileId}=w1200`;
  }
  
  return url;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const response = await fetch(
      `${apiUrl}/blogs/slug/${slug}`,
      { 
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    if (!response.ok) {
      return {
        title: 'Blog Not Found',
        description: 'The blog post you are looking for could not be found.',
      };
    }

    const data = await response.json();
    const post = data.data;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://oriyet.org';
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') || 'https://api.oriyet.org';
    const pageUrl = `${appUrl}/blog/${post.slug}`;
    
    // Handle image URL
    let imageUrl = `${appUrl}/images/og-default.jpg`;
    
    if (post.thumbnail) {
      if (post.thumbnail.includes('drive.google.com') || post.thumbnail.includes('docs.google.com')) {
        // Try Google CDN first, fallback to proxy
        imageUrl = getGoogleDriveDirectUrl(post.thumbnail);
        if (!imageUrl || imageUrl === post.thumbnail) {
          imageUrl = `${appUrl}/api/og-image?url=${encodeURIComponent(post.thumbnail)}`;
        }
      } else if (post.thumbnail.startsWith('http://') || post.thumbnail.startsWith('https://')) {
        imageUrl = post.thumbnail;
      } else if (post.thumbnail.startsWith('/uploads/')) {
        // Use backend URL for uploaded files
        imageUrl = `${apiBaseUrl}${post.thumbnail}`;
      } else {
        imageUrl = `${appUrl}${post.thumbnail.startsWith('/') ? '' : '/'}${post.thumbnail}`;
      }
    }
    
    
    const description = post.excerpt || post.title;

    return {
      title: post.title,
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
            type: 'image/jpeg',
          },
        ],
        locale: 'en_US',
        type: 'article',
        publishedTime: post.publishedAt,
        authors: post.author?.name ? [post.author.name] : ['ORIYET Team'],
        tags: typeof post.tags === 'string' 
          ? post.tags.split(',').map((t: string) => t.trim()) 
          : post.tags || [],
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description,
        images: [imageUrl],
        creator: '@ORIYET',
      },
      alternates: {
        canonical: pageUrl,
      },
    };
  } catch (error) {
    console.error('Error generating blog metadata:', error);
    return {
      title: 'Blog',
      description: 'Read the latest research articles and insights.',
    };
  }
}

export default function BlogPostLayout({ children }: Props) {
  return <>{children}</>;
}
