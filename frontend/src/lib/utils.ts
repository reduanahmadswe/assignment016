import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, parseISO } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | null | undefined, formatStr: string = 'MMM dd, yyyy') {
  if (!date) return 'N/A';

  try {
    let d: Date;

    if (typeof date === 'string') {
      // Try parsing ISO string
      d = parseISO(date);

      // If parseISO fails, try creating Date directly
      if (isNaN(d.getTime())) {
        d = new Date(date);
      }
    } else {
      d = date;
    }

    // Check if date is valid
    if (isNaN(d.getTime())) {
      console.warn('Invalid date:', date);
      return 'Invalid Date';
    }

    return format(d, formatStr);
  } catch (error) {
    console.error('Error formatting date:', error, date);
    return 'Invalid Date';
  }
}

export function formatDateTime(date: string | Date | null | undefined) {
  return formatDate(date, 'MMM dd, yyyy hh:mm a');
}

export function formatTimeAgo(date: string | Date | null | undefined) {
  if (!date) return 'N/A';

  try {
    const d = typeof date === 'string' ? parseISO(date) : date;

    if (isNaN(d.getTime())) {
      return 'Invalid Date';
    }

    return formatDistanceToNow(d, { addSuffix: true });
  } catch (error) {
    console.error('Error formatting time ago:', error, date);
    return 'Invalid Date';
  }
}

export function formatCurrency(amount: number, currency: string = 'BDT') {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function truncateText(text: string, length: number = 100) {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + '...';
}

export function getEventTypeLabel(type: string) {
  const labels: Record<string, string> = {
    seminar: 'Seminar',
    workshop: 'Workshop',
    webinar: 'Webinar',
  };
  return labels[type] || type;
}

export function getEventModeLabel(mode: string) {
  const labels: Record<string, string> = {
    online: 'Online',
    offline: 'In-Person',
    hybrid: 'Hybrid',
  };
  return labels[mode] || mode;
}

export function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    upcoming: 'bg-blue-100 text-blue-700',
    ongoing: 'bg-green-100 text-green-700',
    completed: 'bg-gray-100 text-gray-700',
    cancelled: 'bg-red-100 text-red-700',
    open: 'bg-green-100 text-green-700',
    closed: 'bg-red-100 text-red-700',
    full: 'bg-yellow-100 text-yellow-700',
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-green-100 text-green-700',
    completed_payment: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
    refunded: 'bg-purple-100 text-purple-700',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
}

export function getImageUrl(path: string | null | undefined) {
  if (!path) return '/images/placeholder.svg';

  // Handle Google Drive and other Cloud Storage links globally
  if (path.includes('drive.google.com') || path.includes('docs.google.com')) {
    let fileId = '';

    // Format: https://drive.google.com/file/d/FILE_ID/view
    const fileMatch = path.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileMatch) fileId = fileMatch[1];

    if (!fileId) {
      const openMatch = path.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (openMatch) fileId = openMatch[1];
    }

    if (!fileId) {
      const ucMatch = path.match(/\/uc\?.*id=([a-zA-Z0-9_-]+)/);
      if (ucMatch) fileId = ucMatch[1];
    }

    if (fileId) {
      // Use thumbnail API for high quality images globally
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w2000`;
    }
  }

  // Handle Dropbox links
  if (path.includes('dropbox.com')) {
    return path
      .replace('?dl=0', '')
      .replace('?dl=1', '')
      .replace('www.dropbox.com', 'dl.dropboxusercontent.com')
      .replace('dropbox.com', 'dl.dropboxusercontent.com');
  }

  // Handle OneDrive links
  if (path.includes('1drv.ms') || path.includes('onedrive.live.com')) {
    return path.replace('view.aspx', 'embed.aspx').replace('redir', 'embed');
  }

  // Handle uploaded files (local server files)
  if (path.startsWith('/uploads/')) {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') || 'http://localhost:5000';
    return `${baseUrl}${path}`;
  }

  // Handle other absolute URLs and data URIs
  if (path.startsWith('http') || path.startsWith('data:')) return path;

  // Handle other absolute paths (like /images/...)
  if (path.startsWith('/')) return path;

  // Guard against invalid paths (e.g. error messages or text with spaces)
  if (path.includes(' ') || path.length < 3) return '/images/placeholder.svg';

  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, '') || '';
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

export function isBase64Image(path: string | null | undefined): boolean {
  return path?.startsWith('data:') ?? false;
}

export function downloadFile(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
