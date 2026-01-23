import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return new NextResponse('Missing image URL', { status: 400 });
  }

  try {
    let fetchUrl = imageUrl;
    
    // Handle Google Drive URLs - convert to direct download link
    if (imageUrl.includes('drive.google.com') || imageUrl.includes('docs.google.com')) {
      let fileId = '';
      
      // Extract file ID from various Google Drive URL formats
      const fileMatch = imageUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (fileMatch) {
        fileId = fileMatch[1];
      } else {
        const idMatch = imageUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
        if (idMatch) fileId = idMatch[1];
      }
      
      if (fileId) {
        // Use Google Drive's direct download endpoint
        fetchUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
      }
    }

    // Fetch the image with proper headers
    const imageResponse = await fetch(fetchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LinkedInBot/1.0; +https://www.linkedin.com/help/linkedin)',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      },
      cache: 'force-cache',
    });

    if (!imageResponse.ok) {
      console.error('Failed to fetch image:', imageResponse.status, imageResponse.statusText);
      // Return placeholder image
      return NextResponse.redirect(new URL('/images/placeholder.jpg', request.url));
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=604800, s-maxage=604800, stale-while-revalidate=86400',
        'CDN-Cache-Control': 'max-age=604800',
        'Vercel-CDN-Cache-Control': 'max-age=604800',
      },
    });
  } catch (error) {
    console.error('Error proxying image:', error);
    // Return placeholder instead of error
    return NextResponse.redirect(new URL('/images/placeholder.jpg', request.url));
  }
}
