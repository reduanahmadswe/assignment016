'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button, Input, Loading, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import LexicalEditor from '@/components/ui/LexicalEditor';
import { Image as ImageIcon, Tag, ArrowLeft } from 'lucide-react';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  thumbnail?: string | null;
  tags?: string[];
  status: 'draft' | 'published';
  author?: { name: string } | null;
  views?: number;
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

// Function to get Google Drive thumbnail URL (same as other pages)
const getGoogleDriveThumbnailUrl = (url: string) => {
  if (!url) return '';

  if (!url.includes('drive.google.com') && !url.includes('docs.google.com')) {
    return url;
  }

  let fileId = '';
  const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) fileId = fileMatch[1];

  if (!fileId) {
    const openMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (openMatch) fileId = openMatch[1];
  }

  if (!fileId) {
    const ucMatch = url.match(/\/uc\?.*id=([a-zA-Z0-9_-]+)/);
    if (ucMatch) fileId = ucMatch[1];
  }

  if (fileId) {
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`;
  }

  return url;
};

export default function EditBlogPostPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const queryClient = useQueryClient();

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

  const { data, isLoading } = useQuery<BlogPost>({
    queryKey: ['admin-blog-post', id],
    queryFn: () => api.get(`/blogs/${id}`).then((res) => res.data?.data as BlogPost),
  });

  useEffect(() => {
    if (data) {
      const p = data;
      setFormData({
        title: p.title,
        excerpt: p.excerpt || '',
        content: p.content,
        thumbnail: p.thumbnail || '',
        meta_title: '',
        meta_description: '',
        tags: typeof p.tags === 'string' ? p.tags : (p.tags || []).join(', '),
        status: p.status,
      });
      setImagePreview(p.thumbnail || null);
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: (payload: any) => api.put(`/blogs/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog'] });
      queryClient.invalidateQueries({ queryKey: ['admin-blog-post', id] });
      router.push('/admin/blog');
    },
  });

  const handleThumbnailPreview = (url: string) => {
    setImagePreview(url || null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tagsArray = formData.tags
      .split(',')
      .map((t) => t.trim())
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

    updateMutation.mutate(payload);
  };

  if (isLoading) {
    return <Loading text="Loading post..." />;
  }

  if (!data) {
    return (
      <div className="space-y-4">
        <p className="text-gray-600">Post not found.</p>
        <Button variant="outline" onClick={() => router.push('/admin/blog')}>Back to list</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-[1.5rem] border border-gray-100 shadow-sm mt-10">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/admin/blog')}
            className="rounded-xl h-10 w-10 p-0 flex items-center justify-center hover:bg-gray-50 border-gray-200"
          >
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">Edit Post</h1>
            <p className="text-sm sm:text-base text-gray-500 mt-1 font-medium">Update blog content and settings</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-[1.5rem] border-gray-100 shadow-sm overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-6 py-4">
              <CardTitle className="text-lg font-bold">Post Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 p-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter post title"
                  required
                  className="w-full rounded-xl text-lg font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Excerpt *</label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium"
                  placeholder="Brief summary of the post..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Content *</label>
                <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary-500">
                  <LexicalEditor
                    value={formData.content}
                    onChange={(html) => setFormData({ ...formData, content: html })}
                    placeholder="Write your post content..."
                    className="bg-white min-h-[400px]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[1.5rem] border-gray-100 shadow-sm overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-6 py-4">
              <CardTitle className="text-lg font-bold">SEO & Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Meta Title</label>
                  <input
                    type="text"
                    value={formData.meta_title}
                    onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium"
                    placeholder="Optional SEO title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Tags</label>
                  <div className="relative">
                    <Input
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="technology, news, update"
                      className="w-full rounded-xl pl-10"
                    />
                    <Tag className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Meta Description</label>
                <textarea
                  value={formData.meta_description}
                  onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium"
                  placeholder="Optional SEO description"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="rounded-[1.5rem] border-gray-100 shadow-sm overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-6 py-4">
              <CardTitle className="text-lg font-bold">Featured Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Image URL</label>
                <Input
                  type="url"
                  value={formData.thumbnail}
                  onChange={(e) => {
                    setFormData({ ...formData, thumbnail: e.target.value });
                    handleThumbnailPreview(e.target.value);
                  }}
                  placeholder="https://example.com/image.jpg"
                  className="w-full rounded-xl"
                />
              </div>

              <div className="aspect-video w-full bg-gray-50 rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center relative">
                {imagePreview ? (
                  <img src={getGoogleDriveThumbnailUrl(imagePreview)} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="text-gray-400 flex flex-col items-center">
                    <ImageIcon className="w-10 h-10 mb-2" />
                    <span className="text-sm font-medium">No image preview</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[1.5rem] border-gray-100 shadow-sm overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-6 py-4">
              <CardTitle className="text-lg font-bold">Publication</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <label className="block text-sm font-bold text-gray-700 mb-3">Status</label>
              <div className="flex flex-col gap-3">
                <label className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all ${formData.status === 'published'
                  ? 'bg-primary-50 border-primary-200 ring-1 ring-primary-500'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}>
                  <input
                    type="radio"
                    name="status"
                    value="published"
                    checked={formData.status === 'published'}
                    onChange={() => setFormData({ ...formData, status: 'published' })}
                    className="hidden"
                  />
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center mr-3 ${formData.status === 'published' ? 'border-primary-500 bg-primary-500' : 'border-gray-400'
                    }`}>
                    {formData.status === 'published' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                  <div>
                    <span className={`block text-sm font-bold ${formData.status === 'published' ? 'text-primary-900' : 'text-gray-700'}`}>Published</span>
                    <span className="text-xs text-gray-500">Visible to all users</span>
                  </div>
                </label>

                <label className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all ${formData.status === 'draft'
                  ? 'bg-gray-100 border-gray-300 ring-1 ring-gray-400'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}>
                  <input
                    type="radio"
                    name="status"
                    value="draft"
                    checked={formData.status === 'draft'}
                    onChange={() => setFormData({ ...formData, status: 'draft' })}
                    className="hidden"
                  />
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center mr-3 ${formData.status === 'draft' ? 'border-gray-500 bg-gray-500' : 'border-gray-400'
                    }`}>
                    {formData.status === 'draft' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                  <div>
                    <span className={`block text-sm font-bold ${formData.status === 'draft' ? 'text-gray-900' : 'text-gray-700'}`}>Draft</span>
                    <span className="text-xs text-gray-500">Only visible to admins</span>
                  </div>
                </label>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3 pt-4 lg:pt-0">
            <Button
              type="submit"
              className="w-full rounded-xl py-6 font-bold text-lg shadow-lg shadow-primary-500/30"
              isLoading={updateMutation.isPending}
            >
              {updateMutation.isPending ? 'Updating...' : 'Update Post'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/blog')}
              className="w-full rounded-xl py-6 font-bold border-gray-200 bg-white hover:bg-gray-50 text-gray-600"
            >
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
