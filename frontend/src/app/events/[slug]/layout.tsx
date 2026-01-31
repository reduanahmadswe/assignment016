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
    const fullUrl = `${apiUrl}/events/slug/${slug}`;
    
    console.log('🔍 Fetching event metadata from:', fullUrl);
    
    const response = await fetch(fullUrl, { 
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log('📡 Response status:', response.status);

    if (!response.ok) {
      console.error('❌ Failed to fetch event:', response.status, response.statusText);
      return {
        title: 'Event Not Found',
        description: 'The event you are looking for could not be found.',
      };
    }

    const data = await response.json();
    const event = data.data;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://oriyet.org';
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') || 'https://api.oriyet.org';
    const pageUrl = `${appUrl}/events/${event.slug}`;
    
    // Handle image URL - Priority: uploaded files > external URLs > Google Drive > default
    let imageUrl = `${appUrl}/images/og-default.jpg`;
    
    if (event.thumbnail) {
      const thumbnail = event.thumbnail.trim();
      
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
    console.log('🔍 Event thumbnail from DB:', event.thumbnail);

    const description = event.description?.substring(0, 160) || event.title;
    
    // Format event dates
    const startDate = new Date(event.startDateTime);
    const endDate = new Date(event.endDateTime);
    const eventDate = startDate.toISOString();

    return {
      title: event.title,
      description,
      openGraph: {
        title: event.title,
        description,
        url: pageUrl,
        siteName: 'ORIYET',
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: event.title,
          },
        ],
        locale: 'en_US',
        type: 'article',
        publishedTime: eventDate,
      },
      twitter: {
        card: 'summary_large_image',
        title: event.title,
        description,
        images: [imageUrl],
        creator: '@ORIYET',
      },
      alternates: {
        canonical: pageUrl,
      },
    };
  } catch (error) {
    console.error('Error generating event metadata:', error);
    return {
      title: 'Event',
      description: 'Discover amazing events and opportunities.',
    };
  }
}

export default function EventLayout({ children }: Props) {
  return <>{children}</>;
}
