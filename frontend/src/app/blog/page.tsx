'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Calendar, User, MoreHorizontal, ThumbsUp, MessageCircle, Share2, Globe, Clock, Eye } from 'lucide-react';
import { blogAPI } from '@/lib/api';
import { formatDate, getImageUrl } from '@/lib/utils';
import { Loading, Skeleton, Pagination, Badge } from '@/components/ui';

export default function BlogPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['blogs', page, search, category],
    queryFn: async () => {
      const response = await blogAPI.getAll({
        page,
        limit: 12,
        search,
        category,
      });
      return response.data;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['blog-categories'],
    queryFn: async () => {
      const response = await blogAPI.getCategories();
      return response.data.data || [];
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  // Calculate reading time based on word count (average 200 words per minute)
  const calculateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.trim().split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return minutes;
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-[#004aad]/5 to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#ff7620]/5 rounded-full blur-3xl -mr-40 -mt-40 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#004aad]/5 rounded-full blur-3xl -ml-40 -mb-40 pointer-events-none" />

      {/* Header */}
      <section className="relative pt-20 pb-12 text-center z-10">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block py-1 px-3 rounded-full bg-[#004aad]/10 text-[#004aad] text-sm font-semibold mb-4">
              Research & Knowledge Hub
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[#004aad]">
              Blog & Insights
            </h1>
            <p className="text-lg md:text-xl text-orange-500 font-semibold mb-4">
              ORIYET — Redefining the research culture in Bangladesh
            </p>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Stay updated with the latest research trends, tutorials, and academic insights to accelerate your career.
            </p>

            {/* Search */}
            <form onSubmit={handleSearch} className="max-w-xl mx-auto relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 group-focus-within:text-[#004aad] transition-colors" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for articles, topics, or trends..."
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

      {/* Blog Grid */}
      <section className="container-custom pb-24 relative z-10">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 h-full flex flex-col">
                  <Skeleton className="h-56 w-full flex-shrink-0" />
                  <div className="p-6 space-y-4 flex-grow flex flex-col">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : data?.posts?.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {data.posts.map((post: any) => (
                  <Link key={post.id} href={`/blog/${post.slug}`} className="block h-full">
                    <article className="group bg-white rounded-2xl overflow-hidden shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-300 h-full border border-gray-100 flex flex-col hover:-translate-y-1">
                      {post.thumbnail ? (
                        <div className="relative h-60 w-full overflow-hidden flex-shrink-0">
                          <img
                            src={getImageUrl(post.thumbnail)}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                      ) : (
                        <div className="relative h-60 w-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <Image src="/images/placeholder-blog.jpg" alt="Blog" fill className="object-cover opacity-50" />
                        </div>
                      )}

                      <div className="p-5 flex flex-col flex-grow">
                        <div className="flex items-center justify-between text-xs font-medium text-gray-500 mb-4">
                          <span className="flex items-center text-[#ff7620] bg-[#ff7620]/10 px-2 py-1 rounded-md">
                            {post.category || 'Research'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {calculateReadingTime(post.content || post.excerpt || '')} min read
                          </span>
                        </div>

                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-[#004aad] transition-colors leading-tight">
                          {post.title}
                        </h3>

                        <p className="text-gray-600 text-sm line-clamp-3 mb-6 flex-grow leading-relaxed">
                          {post.excerpt}
                        </p>

                        <div className="pt-5 border-t border-gray-100 flex items-center justify-between mt-auto">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden relative border border-gray-200">
                              {post.author?.avatar ? (
                                <Image src={getImageUrl(post.author.avatar)} alt={post.author.name} fill className="object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-[#004aad]/10 text-[#004aad] font-bold text-xs">
                                  {post.author?.name?.charAt(0) || 'O'}
                                </div>
                              )}
                            </div>
                            <span className="text-sm font-medium text-gray-900 line-clamp-1 max-w-[80px] sm:max-w-[100px]">
                              {post.author?.name || 'ORIYET Team'}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400 font-medium whitespace-nowrap">
                            {formatDate(post.createdAt)}
                          </span>
                        </div>
                      </div>
                    </article>
                  </Link>
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
                <Search className="w-8 h-8 text-[#004aad]" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No articles found</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-8 text-lg">
                {search ? `We couldn't find any articles matching "${search}".` : 'Check back later for new articles.'}
              </p>
              <button
                onClick={() => { setSearch(''); setPage(1) }}
                className="px-6 py-3 bg-[#004aad] text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
