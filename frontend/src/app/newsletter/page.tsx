'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, FileText, Download, Eye, Calendar, Newspaper, Share2 } from 'lucide-react';
import { newsletterAPI } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Loading, Pagination } from '@/components/ui';

interface Newsletter {
  id: number;
  title: string;
  slug?: string;
  description?: string;
  thumbnail?: string;
  pdfLink: string;
  startDate?: string;
  endDate?: string;
  views: number;
  downloads: number;
  createdAt: string;
}

// Function to convert Google Drive link to embeddable/viewable format
const getGoogleDriveViewUrl = (url: string) => {
  if (!url) return '';

  // Extract file ID from various Google Drive URL formats
  let fileId = '';

  // Format: https://drive.google.com/file/d/FILE_ID/view
  const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) {
    fileId = fileMatch[1];
  }

  // Format: https://drive.google.com/open?id=FILE_ID
  const openMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (openMatch) {
    fileId = openMatch[1];
  }

  // Format: https://drive.google.com/uc?id=FILE_ID
  const ucMatch = url.match(/\/uc\?.*id=([a-zA-Z0-9_-]+)/);
  if (ucMatch) {
    fileId = ucMatch[1];
  }

  if (fileId) {
    return `https://drive.google.com/file/d/${fileId}/preview`;
  }

  return url;
};

// Function to get Google Drive direct download URL
const getGoogleDriveDownloadUrl = (url: string) => {
  if (!url) return '';

  let fileId = '';

  const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) {
    fileId = fileMatch[1];
  }

  const openMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (openMatch) {
    fileId = openMatch[1];
  }

  const ucMatch = url.match(/\/uc\?.*id=([a-zA-Z0-9_-]+)/);
  if (ucMatch) {
    fileId = ucMatch[1];
  }

  if (fileId) {
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }

  return url;
};

// Function to get Google Drive thumbnail URL
const getGoogleDriveThumbnailUrl = (url: string) => {
  if (!url) return '';

  // Check if it's already a direct image URL (not Google Drive)
  if (!url.includes('drive.google.com') && !url.includes('docs.google.com')) {
    return url;
  }

  let fileId = '';

  const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) {
    fileId = fileMatch[1];
  }

  const openMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (openMatch) {
    fileId = openMatch[1];
  }

  const ucMatch = url.match(/\/uc\?.*id=([a-zA-Z0-9_-]+)/);
  if (ucMatch) {
    fileId = ucMatch[1];
  }

  if (fileId) {
    // Use thumbnail API - same as admin page
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`;
  }

  return url;
};

export default function NewsletterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [viewingNewsletter, setViewingNewsletter] = useState<Newsletter | null>(null);

  // Check if there's a slug in URL on mount
  useEffect(() => {
    const slug = searchParams.get('slug');
    if (slug && !viewingNewsletter) {
      // Fetch newsletter by slug
      newsletterAPI.getBySlug(slug)
        .then(response => {
          setViewingNewsletter(response.data.data);
        })
        .catch(error => {
          console.error('Failed to load newsletter:', error);
          // Remove invalid slug from URL
          router.push('/newsletter');
        });
    }
  }, [searchParams]);

  const { data, isLoading } = useQuery({
    queryKey: ['newsletters', page, search],
    queryFn: async () => {
      const response = await newsletterAPI.getAll({
        page,
        limit: 12,
        search,
      });
      return response.data;
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const handleView = async (newsletter: Newsletter) => {
    setViewingNewsletter(newsletter);

    // Update URL with slug for shareable link
    if (newsletter.slug) {
      router.push(`/newsletter?slug=${newsletter.slug}`, { scroll: false });
    }

    try {
      await newsletterAPI.incrementViews(newsletter.id);
    } catch (error) {
      console.error('Failed to increment views:', error);
    }
  };

  const handleCloseModal = () => {
    setViewingNewsletter(null);
    // Remove slug from URL when closing
    router.push('/newsletter', { scroll: false });
  };

  const handleShare = async (newsletter: Newsletter) => {
    const shareUrl = `${window.location.origin}/newsletter?slug=${newsletter.slug}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: newsletter.title,
          text: newsletter.description || newsletter.title,
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled or error occurred
        copyToClipboard(shareUrl);
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Link copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  };

  const handleDownload = async (newsletter: Newsletter) => {
    try {
      await newsletterAPI.incrementDownloads(newsletter.id);
      window.open(getGoogleDriveDownloadUrl(newsletter.pdfLink), '_blank');
    } catch (error) {
      console.error('Failed to increment downloads:', error);
      window.open(getGoogleDriveDownloadUrl(newsletter.pdfLink), '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-[#004aad]/5 to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#ff7620]/5 rounded-full blur-3xl -mr-40 -mt-40 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#004aad]/5 rounded-full blur-3xl -ml-40 -mb-40 pointer-events-none" />

      {/* Header */}
      <section className="relative pt-20 pb-8 text-center z-10">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block py-1 px-3 rounded-full bg-[#004aad]/10 text-[#004aad] text-sm font-semibold mb-4">
              <Newspaper className="w-4 h-4 inline mr-1" />
              Stay Updated
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[#004aad]">
              Newsletter
            </h1>

            {/* Ibn al-Haytham Quote with Image */}
            <div className="flex flex-col items-center gap-4 my-6">

              <p className="text-lg md:text-xl text-orange-500 font-semibold italic text-center">
                "If learning the truth is the scientist's goal, then he must make himself the enemy of all that he reads" <br />
                <span className="text-base">— Ibn al-Haytham (Alhazen)</span>
              </p>
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-orange-500/20 shadow-lg">
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRtGKl_g7zmuelIML-QAl3Beo1c21XyGyamyQ2o9rOsYebMK0mfGKXSvi9benHI5ejNmNagtgiPEK5hnOL7SMLaPOBxaDUhbux_I0ZfSeo&s=10"
                  alt="Ibn al-Haytham (Alhazen)"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Stay informed with our latest updates, events, and important information
            </p>
          </div>
        </div>
      </section>

      {/* What is Newsletter Section - Redesigned */}
      <section className="relative py-12 z-10">
        <div className="container-custom">
          <div className="max-w-5xl mx-auto">
            {/* Main Info Card */}
            <div className="relative bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">

              <div className="p-8 md:p-12">
                {/* Title with icon */}
                <div className="text-center mb-10">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#004aad] to-[#003882] rounded-2xl shadow-lg mb-4">
                    <Newspaper className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                    নিউজলেটার কী?
                  </h2>
                  <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
                    আমাদের নিউজলেটার একটি নিয়মিত প্রকাশনা যেখানে আমরা আমাদের সাংগঠনিক কার্যক্রম,
                    আসন্ন ইভেন্ট, সাফল্যের গল্প এবং গুরুত্বপূর্ণ ঘোষণাগুলো শেয়ার করি।
                  </p>
                </div>

                {/* Feature Cards */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Why Read */}
                  <div className="group relative bg-gradient-to-br from-[#004aad]/5 to-transparent rounded-2xl p-6 border border-[#004aad]/10 hover:border-[#004aad]/30 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-[#004aad] rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                        <span className="text-2xl">🎯</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-[#004aad] mb-3">
                          কেন আমাদের নিউজলেটার পড়বেন?
                        </h3>
                        <ul className="space-y-2.5">
                          <li className="flex items-center gap-2 text-gray-600">
                            <span className="w-1.5 h-1.5 bg-[#004aad] rounded-full"></span>
                            সর্বশেষ ইভেন্ট এবং প্রোগ্রাম সম্পর্কে আপডেট থাকুন
                          </li>
                          <li className="flex items-center gap-2 text-gray-600">
                            <span className="w-1.5 h-1.5 bg-[#004aad] rounded-full"></span>
                            নতুন সুযোগ সম্পর্কে নোটিফিকেশন পান
                          </li>
                          <li className="flex items-center gap-2 text-gray-600">
                            <span className="w-1.5 h-1.5 bg-[#004aad] rounded-full"></span>
                            সফল অংশগ্রহণকারীদের অভিজ্ঞতা থেকে শিখুন
                          </li>
                          <li className="flex items-center gap-2 text-gray-600">
                            <span className="w-1.5 h-1.5 bg-[#004aad] rounded-full"></span>
                            আমাদের কমিউনিটির সাথে যুক্ত থাকুন
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* What's Inside */}
                  <div className="group relative bg-gradient-to-br from-[#ff7620]/5 to-transparent rounded-2xl p-6 border border-[#ff7620]/10 hover:border-[#ff7620]/30 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-[#ff7620] rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                        <span className="text-2xl">📖</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-[#ff7620] mb-3">
                          নিউজলেটারের ভেতরে কী আছে?
                        </h3>
                        <ul className="space-y-2.5">
                          <li className="flex items-center gap-2 text-gray-600">
                            <span className="w-1.5 h-1.5 bg-[#ff7620] rounded-full"></span>
                            অতীতের ইভেন্টের হাইলাইট এবং ছবি
                          </li>
                          <li className="flex items-center gap-2 text-gray-600">
                            <span className="w-1.5 h-1.5 bg-[#ff7620] rounded-full"></span>
                            আসন্ন প্রোগ্রাম সম্পর্কে বিস্তারিত তথ্য
                          </li>
                          <li className="flex items-center gap-2 text-gray-600">
                            <span className="w-1.5 h-1.5 bg-[#ff7620] rounded-full"></span>
                            শিক্ষণীয় আর্টিকেল এবং টিপস
                          </li>
                          <li className="flex items-center gap-2 text-gray-600">
                            <span className="w-1.5 h-1.5 bg-[#ff7620] rounded-full"></span>
                            বিশেষ ঘোষণা এবং অফার
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CTA Box */}
                <div className="mt-8 bg-gradient-to-r from-[#004aad] to-[#003882] rounded-2xl p-6 text-center">
                  <p className="text-white text-lg flex items-center justify-center gap-2 flex-wrap">
                    <span className="text-2xl">💡</span>
                    <span>Browse any newsletter below by clicking <strong>&quot;View&quot;</strong> to read or <strong>&quot;Download&quot;</strong> to save!</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="relative pb-12 z-10">
        <div className="container-custom">
          <div className="max-w-xl mx-auto">
            <form onSubmit={handleSearch} className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 group-focus-within:text-[#004aad] transition-colors" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search newsletters..."
                className="block w-full pl-11 pr-4 py-4 border-2 border-gray-100 rounded-2xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#004aad]/30 focus:ring-4 focus:ring-[#004aad]/5 transition-all shadow-lg shadow-gray-100/50"
              />
              <button
                type="submit"
                className="absolute inset-y-2 right-2 px-6 bg-[#004aad] hover:bg-[#003882] text-white rounded-xl font-medium transition-colors shadow-md hover:shadow-lg"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Newsletter Grid */}
      <section className="container-custom pb-24 relative z-10">
        <div className="max-w-6xl mx-auto">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 animate-pulse">
                  <div className="h-48 bg-gray-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                    <div className="flex gap-2 pt-2">
                      <div className="h-10 bg-gray-200 rounded flex-1" />
                      <div className="h-10 bg-gray-200 rounded flex-1" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : data?.newsletters?.length > 0 ? (
            <>
              <div className={`grid gap-8 ${data.newsletters.length === 1
                ? 'grid-cols-1 max-w-md mx-auto'
                : data.newsletters.length === 2
                  ? 'grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto'
                  : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                }`}>
                {data.newsletters.map((newsletter: Newsletter) => (
                  <article
                    key={newsletter.id}
                    className="group bg-white rounded-2xl overflow-hidden shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-300 border border-gray-100 flex flex-col hover:-translate-y-1"
                  >
                    {/* Thumbnail */}
                    <div className="relative h-48 w-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-[#004aad]/10 to-[#ff7620]/10">
                      {newsletter.thumbnail ? (
                        <img
                          src={getGoogleDriveThumbnailUrl(newsletter.thumbnail)}
                          alt={newsletter.title}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <FileText className="w-16 h-16 text-[#004aad]/30" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    {/* Content */}
                    <div className="p-5 flex flex-col flex-grow">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#004aad] transition-colors leading-tight">
                        {newsletter.title}
                      </h3>

                      {newsletter.description && (
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3 flex-grow leading-relaxed">
                          {newsletter.description}
                        </p>
                      )}

                      {/* Date Range Badge */}
                      {(newsletter.startDate || newsletter.endDate) && (
                        <div className="mb-3">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#004aad]/10 to-[#ff7620]/10 rounded-lg border border-[#004aad]/20">
                            <Calendar className="w-3.5 h-3.5 text-[#004aad]" />
                            <span className="text-xs font-medium text-gray-700">
                              {newsletter.startDate && newsletter.endDate ? (
                                <>
                                  {formatDate(newsletter.startDate)} — {formatDate(newsletter.endDate)}
                                </>
                              ) : newsletter.startDate ? (
                                <>{formatDate(newsletter.startDate)} থেকে</>
                              ) : (
                                <>{formatDate(newsletter.endDate!)} পর্যন্ত</>
                              )}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Stats */}
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                        <span className="flex items-center gap-1 text-gray-400">
                          প্রকাশ: {formatDate(newsletter.createdAt)}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" />
                            {newsletter.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <Download className="w-3.5 h-3.5" />
                            {newsletter.downloads}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2 border-t border-gray-100">
                        <button
                          onClick={() => handleView(newsletter)}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-[#004aad] hover:bg-[#003882] text-white text-sm font-medium rounded-xl transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                        <button
                          onClick={() => handleDownload(newsletter)}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-[#ff7620] hover:bg-[#e56a1a] text-white text-sm font-medium rounded-xl transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* Pagination */}
              {data.pagination?.totalPages > 1 && (
                <div className="pt-16 pb-8 flex justify-center">
                  <Pagination
                    currentPage={page}
                    totalPages={data.pagination.totalPages}
                    onPageChange={(newPage) => {
                      setPage(newPage);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-xl max-w-2xl mx-auto px-4">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Newspaper className="w-8 h-8 text-[#004aad]" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No newsletters found</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {search
                  ? "No newsletters match your search. Try different keywords."
                  : "There are no newsletters available at the moment. Please check back later."}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* PDF Viewer Modal */}
      {viewingNewsletter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleCloseModal}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col w-full max-w-6xl" style={{ height: '90vh' }}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900 truncate">
                  {viewingNewsletter.title}
                </h3>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => handleShare(viewingNewsletter)}
                  className="flex items-center gap-2 py-2 px-4 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                  title="Share this newsletter"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
                <button
                  onClick={() => handleDownload(viewingNewsletter)}
                  className="flex items-center gap-2 py-2 px-4 bg-[#ff7620] hover:bg-[#e56a1a] text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* PDF Viewer */}
            <div className="flex-1 overflow-hidden bg-white">
              <iframe
                src={getGoogleDriveViewUrl(viewingNewsletter.pdfLink)}
                className="w-full h-full border-0"
                allow="autoplay"
                title={viewingNewsletter.title}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
