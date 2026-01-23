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
    // Use production API URL in production, localhost in dev
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.oriyet.org/api';
    const fullUrl = `${apiUrl}/blogs/slug/${slug}`;
    
    console.log('🔍 Fetching metadata from:', fullUrl);
    
    const response = await fetch(fullUrl, { 
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log('📡 Response status:', response.status);

    if (!response.ok) {
      console.error('❌ Failed to fetch blog post:', response.status, response.statusText);
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
    
    // Handle image URL - Priority: uploaded files > external URLs > Google Drive > default
    let imageUrl = `${appUrl}/images/og-default.jpg`;
    
    if (post.thumbnail) {
      const thumbnail = post.thumbnail.trim();
      
      // Priority 1: Local uploaded files
      if (thumbnail.startsWith('/uploads/')) {
        imageUrl = `${apiBaseUrl}${thumbnail}`;
        console.log('📸 Using uploaded image:', imageUrl);
      }
      // Priority 2: Full external URLs
      else if (thumbnail.startsWith('http://') || thumbnail.startsWith('https://')) {
        // Check if it's Google Drive
        if (thumbnail.includes('drive.google.com') || thumbnail.includes('docs.google.com')) {
          const directUrl = getGoogleDriveDirectUrl(thumbnail);
          imageUrl = directUrl || `${appUrl}/api/og-image?url=${encodeURIComponent(thumbnail)}`;
          console.log('📸 Using Google Drive image:', imageUrl);
        } else {
          imageUrl = thumbnail;
          console.log('📸 Using external image:', imageUrl);
        }
      }
      // Priority 3: Relative paths
      else if (thumbnail.startsWith('/')) {
        imageUrl = `${appUrl}${thumbnail}`;
        console.log('📸 Using relative path image:', imageUrl);
      }
    } else {
      console.log('📸 No thumbnail, using default:', imageUrl);
    }
    
    console.log('🔍 Final OG Image URL:', imageUrl);
    console.log('🔍 Post thumbnail from DB:', post.thumbnail);

    
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
