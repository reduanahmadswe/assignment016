'use client';

import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Calendar, User, Clock, Share2, Facebook, Twitter, Linkedin, Eye } from 'lucide-react';
import { blogAPI } from '@/lib/api';
import { formatDate, getImageUrl } from '@/lib/utils';
import { Loading, Badge } from '@/components/ui';

export default function BlogPostPage() {
  const { slug } = useParams();

  const { data: post, isLoading, error } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: async () => {
      const response = await blogAPI.getBySlug(slug as string);
      return response.data.data;
    },
    enabled: !!slug,
  });

  const { data: relatedPosts } = useQuery({
    queryKey: ['related-posts', slug],
    queryFn: async () => {
      const response = await blogAPI.getRelated(slug as string);
      return response.data.posts;
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return <Loading fullScreen text="Loading article..." />;
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Share2 className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Article Not Found</h2>
          <p className="text-gray-600 mb-6">The article you're looking for doesn't exist or might have been removed.</p>
          <Link href="/blog" className="btn-primary inline-flex">
            Browse Articles
          </Link>
        </div>
      </div>
    );
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  // Improved Layout Structure
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header Section */}
      <section className="bg-white border-b border-gray-100">
        <div className="container-custom py-6 sm:py-10">
          <div className="max-w-4xl mx-auto">
            {/* Back Nav */}
            <Link
              href="/blog"
              className="inline-flex items-center text-gray-500 hover:text-[#004aad] mb-6 sm:mb-8 transition-colors group"
            >
              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#004aad]/10 transition-colors mr-2">
                <ArrowLeft className="w-4 h-4 group-hover:px-0 transition-all" />
              </div>
              <span className="font-medium">Back to Blog</span>
            </Link>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                <Badge variant="primary">{post.tags[0]}</Badge>
              </div>
            )}

            {/* Title - Responsive Scaling */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight tracking-tight">
              {post.title}
            </h1>

            {/* Excerpt */}
            <p className="text-lg sm:text-xl text-gray-500 mb-8 leading-relaxed max-w-3xl">
              {post.excerpt}
            </p>

            {/* Author & Meta Grid */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 py-6 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#004aad] to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-900/10 relative overflow-hidden">
                  {post.author?.avatar ? (
                    <Image src={getImageUrl(post.author.avatar)} alt={post.author.name} fill className="object-cover" />
                  ) : (
                    (post.author?.name || 'U').charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <div className="font-bold text-gray-900">{post.author?.name || 'ORIYET Team'}</div>
                  <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Author</div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full">
                  <Calendar className="w-4 h-4 text-[#004aad]" />
                  <span className="font-medium">{formatDate(post.publishedAt)}</span>
                </div>
                {post.views > 0 && (
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full">
                    <Eye className="w-4 h-4 text-[#004aad]" />
                    <span className="font-medium">{post.views} views</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Image */}
      {post.thumbnail && (
        <div className="container-custom -mt-8 sm:-mt-12 relative z-10 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="aspect-video relative rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl shadow-gray-200/50 block bg-gray-200">
              <Image
                src={getImageUrl(post.thumbnail)}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <section className="container-custom pt-12 pb-20">
        <div className="max-w-3xl mx-auto">
          {/* Article Body */}
          <article className="prose prose-base sm:prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-600 prose-a:text-[#004aad] prose-img:rounded-2xl">
            <div className="blog-content">
              {post.content?.split('\n').map((line: string, index: number) => {
                // Headings
                if (line.startsWith('## ')) {
                  return <h2 key={index} className="text-2xl sm:text-3xl mt-12 mb-6">{line.replace('## ', '')}</h2>;
                }
                if (line.startsWith('### ')) {
                  return <h3 key={index} className="text-xl sm:text-2xl mt-8 mb-4">{line.replace('### ', '')}</h3>;
                }
                if (line.startsWith('#### ')) {
                  return <h4 key={index} className="text-lg sm:text-xl mt-6 mb-3">{line.replace('#### ', '')}</h4>;
                }

                // Lists
                if (line.startsWith('- ')) {
                  return (
                    <ul key={index} className="list-disc pl-5 mb-2">
                      <li className="text-gray-700 leading-relaxed md:leading-loose">
                        {line.replace('- ', '')}
                      </li>
                    </ul>

                  );
                }

                // Bold text
                const boldText = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-900 font-bold">$1</strong>');

                // Empty lines
                if (line.trim() === '') {
                  return <div key={index} className="h-6"></div>;
                }

                // Regular paragraphs
                return (
                  <p
                    key={index}
                    className="text-gray-700 leading-relaxed md:leading-loose mb-6"
                    dangerouslySetInnerHTML={{ __html: boldText }}
                  />
                );
              })}
            </div>
          </article>

          {/* Tags Footer */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-100">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-bold text-gray-900 uppercase tracking-wide">Tags:</span>
                {(typeof post.tags === 'string' ? post.tags.split(',').map((t: string) => t.trim()) : post.tags).map((tag: string) => (
                  <Link
                    key={tag}
                    href={`/blog?tag=${tag}`}
                    className="px-4 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-[#004aad] hover:text-white transition-all"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Share Section */}
          <div className="mt-8 pt-8 border-t border-gray-100">
            <div className="bg-[#f8faff] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <h4 className="font-bold text-gray-900 text-lg mb-1">Share this article</h4>
                <p className="text-sm text-gray-500">Spread the knowledge with your network</p>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white text-[#1877F2] border border-gray-100 flex items-center justify-center hover:scale-110 transition-transform shadow-sm"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white text-[#1DA1F2] border border-gray-100 flex items-center justify-center hover:scale-110 transition-transform shadow-sm"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a
                  href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(post.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white text-[#0A66C2] border border-gray-100 flex items-center justify-center hover:scale-110 transition-transform shadow-sm"
                >
                  <Linkedin className="w-5 h-5 has-tooltip" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts && relatedPosts.length > 0 && (
          <div className="max-w-5xl mx-auto mt-20 sm:mt-24 border-t border-gray-100 pt-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">Related Articles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
              {relatedPosts.map((relatedPost: any) => (
                <Link key={relatedPost.id} href={`/blog/${relatedPost.slug}`} className="group h-full">
                  <article className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col border border-gray-100 hover:-translate-y-1">
                    <div className="aspect-video relative bg-gray-100 overflow-hidden">
                      {relatedPost.thumbnail ? (
                        <Image
                          src={getImageUrl(relatedPost.thumbnail)}
                          alt={relatedPost.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <Image src="/images/placeholder.jpg" alt="No image" fill className="object-cover opacity-50" />
                        </div>
                      )}
                    </div>
                    <div className="p-5 flex flex-col flex-grow">
                      <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-[#004aad] transition-colors line-clamp-2 leading-tight">
                        {relatedPost.title}
                      </h3>
                      <div className="mt-auto pt-4 flex items-center justify-between text-xs font-medium text-gray-500">
                        <span>{formatDate(relatedPost.publishedAt)}</span>
                        {relatedPost.category && (
                          <span className="text-[#ff7620] bg-[#ff7620]/10 px-2 py-0.5 rounded">{relatedPost.category}</span>
                        )}
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
