'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import LexicalEditor from '@/components/ui/LexicalEditor';
import { Image as ImageIcon, Tag, ArrowLeft } from 'lucide-react';

// Function to get Google Drive thumbnail URL (same as newsletter & blog list)
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
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`;
  }

  return url;
};

export default function NewBlogPostPage() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    thumbnail: '',
    author_name: '',
    author_image: '',
    author_website: '',
    meta_title: '',
    meta_description: '',
    tags: '', // comma-separated
    status: 'draft' as 'draft' | 'published',
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  const createMutation = useMutation({
    mutationFn: (data: FormData) => api.post('/blogs', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog'] });
      toast.success('Blog post created successfully!');
      router.push('/admin/blog');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to create blog post');
    },
  });

  const handleThumbnailPreview = (url: string) => {
    setImagePreview(url || null);
  };

  const handleThumbnailFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tagsArray = formData.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const formDataObj = new FormData();
    formDataObj.append('title', formData.title);
    formDataObj.append('excerpt', formData.excerpt);
    formDataObj.append('content', formData.content);
    if (thumbnailFile) {
      formDataObj.append('thumbnail', thumbnailFile);
    } else if (formData.thumbnail) {
      formDataObj.append('thumbnail', formData.thumbnail);
    }
    if (formData.author_name) formDataObj.append('author_name', formData.author_name);
    if (formData.author_image) formDataObj.append('author_image', formData.author_image);
    if (formData.author_website) formDataObj.append('author_website', formData.author_website);
    if (formData.meta_title) formDataObj.append('meta_title', formData.meta_title);
    if (formData.meta_description) formDataObj.append('meta_description', formData.meta_description);
    formDataObj.append('tags', JSON.stringify(tagsArray));
    formDataObj.append('status', formData.status);

    createMutation.mutate(formDataObj);
  };

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
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">Create New Post</h1>
            <p className="text-sm sm:text-base text-gray-500 mt-1 font-medium">Compose and publish a new blog post</p>
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
            <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-6 py-4 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-bold">Author Information</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    const res = await api.get('/auth/me');
                    const user = res.data?.user || res.data;
                    setFormData({
                      ...formData,
                      author_name: user.name || '',
                      author_image: user.avatar || '',
                      author_website: '',
                    });
                    toast.success('Profile loaded successfully!');
                  } catch (error) {
                    console.error('Failed to fetch user profile:', error);
                    toast.error('Failed to load profile');
                  }
                }}
                className="text-xs rounded-lg"
              >
                Use My Profile
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Author Name
                </label>
                <Input
                  type="text"
                  value={formData.author_name}
                  onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                  placeholder="Reduan Ahmad"
                  className="w-full rounded-xl"
                />
                <p className="text-xs text-gray-500 mt-1.5">
                  Custom author name for this post
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Author Profile Image <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <Input
                  type="url"
                  value={formData.author_image}
                  onChange={(e) => setFormData({ ...formData, author_image: e.target.value })}
                  placeholder="https://example.com/profile.jpg"
                  className="w-full rounded-xl"
                />
                <p className="text-xs text-gray-500 mt-1.5">
                  Author's profile picture URL (Google Drive link supported)
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Author Website <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <Input
                  type="url"
                  value={formData.author_website}
                  onChange={(e) => setFormData({ ...formData, author_website: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full rounded-xl"
                />
                <p className="text-xs text-gray-500 mt-1.5">
                  Author name will link to this website
                </p>
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
                <label className="block text-sm font-bold text-gray-700 mb-2">Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailFileChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer"
                />
                <p className="text-xs text-gray-500 mt-1.5">
                  Upload an image file (JPG, PNG, WebP) - Max 5MB
                </p>
              </div>

              <div className="relative">
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center">
                  <div className="flex-grow border-t border-gray-200"></div>
                  <span className="flex-shrink mx-4 text-xs font-medium text-gray-400">OR</span>
                  <div className="flex-grow border-t border-gray-200"></div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Image URL</label>
                <Input
                  type="url"
                  value={formData.thumbnail}
                  onChange={(e) => {
                    setFormData({ ...formData, thumbnail: e.target.value });
                    handleThumbnailPreview(e.target.value);
                    setThumbnailFile(null);
                  }}
                  placeholder="https://example.com/image.jpg"
                  className="w-full rounded-xl"
                />
                <p className="text-xs text-gray-500 mt-1.5">
                  Or paste an image URL (Google Drive links supported)
                </p>
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
              isLoading={createMutation.isPending}
            >
              {createMutation.isPending ? 'Publishing...' : 'Publish Post'}
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
