'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Eye,
  EyeOff,
  FileText,
  Image as ImageIcon,
  Calendar,
  Tag,
  PenTool,
  MessageSquare,
  BarChart,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Button, Input, Modal, Loading, Badge, Pagination } from '@/components/ui';
import { formatDate } from '@/lib/utils';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  thumbnail?: string | null;
  tags?: string[];
  status: 'draft' | 'published';
  author?: {
    name: string;
  } | null;
  views?: number;
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

// Function to get Google Drive thumbnail URL (same as newsletter page)
const getGoogleDriveThumbnailUrl = (url: string) => {
  if (!url) return '';

  // Check if it's already a direct image URL (not Google Drive)
  if (!url.includes('drive.google.com') && !url.includes('docs.google.com')) {
    return url;
  }

  let fileId = '';

  // Format: https://drive.google.com/file/d/FILE_ID/view
  const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) {
    fileId = fileMatch[1];
  }

  // Format: https://drive.google.com/open?id=FILE_ID
  if (!fileId) {
    const openMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (openMatch) {
      fileId = openMatch[1];
    }
  }

  // Format: https://drive.google.com/uc?id=FILE_ID
  if (!fileId) {
    const ucMatch = url.match(/\/uc\?.*id=([a-zA-Z0-9_-]+)/);
    if (ucMatch) {
      fileId = ucMatch[1];
    }
  }

  if (fileId) {
    // Use thumbnail API - same as newsletter page
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`;
  }

  return url;
};

export default function AdminBlogPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    thumbnail: '',
    meta_title: '',
    meta_description: '',
    tags: '', // comma-separated
    status: 'draft' as 'draft' | 'published',
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-blog', page, search, status],
    queryFn: () =>
      api.get(`/blogs?page=${page}&limit=10&search=${search}&status=${status}`)
        .then(res => res.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/blogs', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog'] });
      closeFormModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      api.put(`/blogs/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog'] });
      closeFormModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/blogs/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog'] });
      setIsDeleteModalOpen(false);
      setSelectedPost(null);
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'draft' | 'published' }) =>
      api.put(`/blogs/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog'] });
    },
  });

  const openCreateModal = () => {
    setSelectedPost(null);
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      thumbnail: '',
      meta_title: '',
      meta_description: '',
      tags: '',
      status: 'draft',
    });
    setImagePreview(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (post: BlogPost) => {
    setSelectedPost(post);
    setFormData({
      title: post.title,
      excerpt: post.excerpt || '',
      content: post.content,
      thumbnail: post.thumbnail || '',
      meta_title: '',
      meta_description: '',
      tags: (post.tags || []).join(', '),
      status: post.status,
    });
    setImagePreview(post.thumbnail || null);
    setIsFormModalOpen(true);
  };

  const closeFormModal = () => {
    setIsFormModalOpen(false);
    setSelectedPost(null);
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      thumbnail: '',
      meta_title: '',
      meta_description: '',
      tags: '',
      status: 'draft',
    });
    setImagePreview(null);
  };

  const handleThumbnailPreview = (url: string) => {
    setImagePreview(url || null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tagsArray = formData.tags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const payload: any = {
      title: formData.title,
      excerpt: formData.excerpt,
      content: formData.content,
      thumbnail: formData.thumbnail || undefined,
      meta_title: formData.meta_title || undefined,
      meta_description: formData.meta_description || undefined,
      tags: tagsArray,
      status: formData.status,
    };

    if (selectedPost) {
      updateMutation.mutate({ id: selectedPost.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loading text="Loading blog content..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-12">

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mt-10">
        {/* Total Posts */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-[1.5rem] p-5 sm:p-6 border border-blue-100 relative overflow-hidden group">
          <div className="absolute top-4 right-4 p-2 bg-blue-200/50 text-blue-700 rounded-xl">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <p className="text-xs sm:text-sm font-bold text-blue-600 mb-1 uppercase tracking-wide">Total Posts</p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900">{data?.stats?.total || 0}</h3>
          <div className="mt-4 flex items-center text-xs sm:text-sm text-blue-700 font-bold">
            <PenTool className="w-4 h-4 mr-1.5" />
            <span>Content Library</span>
          </div>
        </div>

        {/* Published Stats */}
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-[1.5rem] p-5 sm:p-6 border border-emerald-100 relative overflow-hidden group">
          <div className="absolute top-4 right-4 p-2 bg-emerald-200/50 text-emerald-700 rounded-xl">
            <Eye className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <p className="text-xs sm:text-sm font-bold text-emerald-600 mb-1 uppercase tracking-wide">Published</p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900">{data?.stats?.published || 0}</h3>
          <div className="mt-4 flex items-center text-xs sm:text-sm text-emerald-700 font-bold">
            <MessageSquare className="w-4 h-4 mr-1.5" />
            <span>Live Articles</span>
          </div>
        </div>

        {/* Draft Stats */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-[1.5rem] p-5 sm:p-6 border border-amber-100 relative overflow-hidden group">
          <div className="absolute top-4 right-4 p-2 bg-amber-200/50 text-amber-700 rounded-xl">
            <EyeOff className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <p className="text-xs sm:text-sm font-bold text-amber-600 mb-1 uppercase tracking-wide">Drafts</p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900">{data?.stats?.drafts || 0}</h3>
          <div className="mt-4 flex items-center text-xs sm:text-sm text-amber-700 font-bold">
            <PenTool className="w-4 h-4 mr-1.5" />
            <span>Work in Progress</span>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white border border-gray-100 rounded-[1.5rem] shadow-sm overflow-hidden flex flex-col h-full">
        {/* Filters and Search */}
        <div className="p-4 sm:p-5 border-b border-gray-100 bg-gray-50/30">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-md w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search posts by title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm border-gray-200 rounded-xl focus:ring-primary-500 focus:border-primary-500 bg-white"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="w-full sm:w-48">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm font-medium border-gray-200 rounded-xl focus:ring-primary-500 focus:border-primary-500 bg-white cursor-pointer"
                >
                  <option value="">All Statuses</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
              <Link href="/admin/blog/new" className="w-full sm:w-auto">
                <Button className="rounded-xl shadow-md shadow-primary-500/20 w-full sm:w-auto justify-center whitespace-nowrap">
                  <Plus className="w-4 h-4 mr-2" />
                  New Post
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Posts Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Article Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Tags
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Engagement
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data?.posts?.map((post: BlogPost) => (
                <tr key={post.id} className="group hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 border border-gray-200 relative">
                        {post.thumbnail ? (
                          <img
                            src={getGoogleDriveThumbnailUrl(post.thumbnail)}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-gray-900 line-clamp-2 max-w-xs group-hover:text-primary-600 transition-colors">
                          {post.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 flex items-center">
                          by <span className="font-bold ml-1 text-gray-700">{post.author?.name || 'Unknown'}</span>
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {(post.tags || []).slice(0, 2).map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-[10px] px-1.5 border-gray-200 text-gray-600 bg-gray-50 font-bold">{tag}</Badge>
                      ))}
                      {(post.tags || []).length > 2 && (
                        <Badge variant="outline" className="text-[10px] px-1.5 border-gray-200 text-gray-500 font-bold">+{post.tags!.length - 2}</Badge>
                      )}
                      {(!post.tags || post.tags.length === 0) && <span className="text-gray-400 text-xs font-medium">-</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleStatusMutation.mutate({
                        id: post.id,
                        status: post.status === 'published' ? 'draft' : 'published'
                      })}
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                    >
                      <Badge variant={post.status === 'published' ? 'success' : 'warning'} className="capitalize px-2.5 py-0.5 font-bold">
                        {post.status === 'published' ? (
                          <Eye className="w-3 h-3 mr-1" />
                        ) : (
                          <EyeOff className="w-3 h-3 mr-1" />
                        )}
                        {post.status}
                      </Badge>
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <BarChart className="w-4 h-4 mr-1.5 text-gray-400" />
                      <span className="font-bold">{post.views ?? 0}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-gray-500">
                      {post.publishedAt ? (
                        <span className="text-green-700 font-bold">Published<br />{formatDate(post.publishedAt)}</span>
                      ) : (
                        <span className="text-gray-500 font-medium">Created<br />{formatDate(post.createdAt!)}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                      <Link
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Live"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/admin/blog/${post.id}/edit`}
                        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Edit Article"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => {
                          setSelectedPost(post);
                          setIsDeleteModalOpen(true);
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Article"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Empty State */}
          {data?.posts?.length === 0 && (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">No blog posts found</h3>
              <p className="text-gray-500 mb-6 font-medium">Get started by creating your first article.</p>
              <Link href="/admin/blog/new">
                <Button className="rounded-xl">Create Post</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Pagination */}
        {data?.pagination && data.pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-50 bg-gray-50/30">
            <Pagination
              currentPage={page}
              totalPages={data.pagination.totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Article"
        size="sm"
      >
        <div className="space-y-4 mt-2">
          <div className="bg-red-50 p-4 rounded-[1.5rem] flex items-start gap-4">
            <div className="bg-red-100 p-2 rounded-full flex-shrink-0">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h4 className="font-bold text-red-900">Confirm Deletion</h4>
              <p className="text-sm font-medium text-red-700 mt-1">
                Are you sure you want to delete <strong>"{selectedPost?.title}"</strong>? This action is permanent and cannot be undone.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => selectedPost && deleteMutation.mutate(selectedPost.id)}
              isLoading={deleteMutation.isPending}
              className="rounded-xl"
            >
              Delete Forever
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
