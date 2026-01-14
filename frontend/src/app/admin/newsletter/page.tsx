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
  Download,
  ExternalLink,
  Newspaper,
  Link as LinkIcon,
  Image as ImageIcon,
  Calendar,
} from 'lucide-react';
import { api, newsletterAPI } from '@/lib/api';
import { Button, Input, Modal, Loading, Spinner, Badge, Pagination } from '@/components/ui';
import { formatDate } from '@/lib/utils';
import toast from '@/lib/toast';

interface Newsletter {
  id: number;
  title: string;
  description?: string;
  thumbnail?: string;
  pdfLink: string;
  startDate?: string;
  endDate?: string;
  isPublished: boolean;
  views: number;
  downloads: number;
  createdAt: string;
  updatedAt: string;
}

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
    // Use thumbnail API - more reliable
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`;
  }

  return url;
};

export default function AdminNewsletterPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isPublished, setIsPublished] = useState('');
  const [page, setPage] = useState(1);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedNewsletter, setSelectedNewsletter] = useState<Newsletter | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    thumbnail: '',
    pdf_link: '',
    start_date: '',
    end_date: '',
    is_published: true,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-newsletters', page, search, isPublished],
    queryFn: () =>
      newsletterAPI.adminGetAll({
        page,
        limit: 10,
        search,
        is_published: isPublished,
      }).then(res => res.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => newsletterAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-newsletters'] });
      closeFormModal();
      toast.success('✅ Newsletter created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create newsletter');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      newsletterAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-newsletters'] });
      closeFormModal();
      toast.success('✅ Newsletter updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update newsletter');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => newsletterAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-newsletters'] });
      setIsDeleteModalOpen(false);
      setSelectedNewsletter(null);
      toast.success('✅ Newsletter deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete newsletter');
    },
  });

  const togglePublishMutation = useMutation({
    mutationFn: (id: number) => newsletterAPI.togglePublish(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-newsletters'] });
      toast.success('✅ Newsletter status updated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    },
  });

  const openFormModal = (newsletter?: Newsletter) => {
    if (newsletter) {
      setSelectedNewsletter(newsletter);
      setFormData({
        title: newsletter.title,
        description: newsletter.description || '',
        thumbnail: newsletter.thumbnail || '',
        pdf_link: newsletter.pdfLink,
        start_date: newsletter.startDate ? new Date(newsletter.startDate).toISOString().split('T')[0] : '',
        end_date: newsletter.endDate ? new Date(newsletter.endDate).toISOString().split('T')[0] : '',
        is_published: newsletter.isPublished,
      });
    } else {
      setSelectedNewsletter(null);
      setFormData({
        title: '',
        description: '',
        thumbnail: '',
        pdf_link: '',
        start_date: '',
        end_date: '',
        is_published: true,
      });
    }
    setIsFormModalOpen(true);
  };

  const closeFormModal = () => {
    setIsFormModalOpen(false);
    setSelectedNewsletter(null);
    setFormData({
      title: '',
      description: '',
      thumbnail: '',
      pdf_link: '',
      start_date: '',
      end_date: '',
      is_published: true,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('❌ Title is required');
      return;
    }

    if (!formData.pdf_link.trim()) {
      toast.error('❌ PDF link is required');
      return;
    }

    if (selectedNewsletter) {
      updateMutation.mutate({ id: selectedNewsletter.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Newspaper className="w-7 h-7 text-[#004aad]" />
            Newsletter Management
          </h1>
          <p className="text-gray-500 mt-1">Manage and publish newsletters</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search newsletters..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004aad]/20 focus:border-[#004aad] bg-white"
            />
          </div>
          <select
            value={isPublished}
            onChange={(e) => {
              setIsPublished(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004aad]/20 focus:border-[#004aad] bg-white"
          >
            <option value="">All Status</option>
            <option value="true">Published</option>
            <option value="false">Draft</option>
          </select>
          <Button
            onClick={() => openFormModal()}
            className="bg-[#004aad] hover:bg-[#003882] text-white whitespace-nowrap"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Newsletter
          </Button>
        </div>
      </div>

      {/* Newsletter List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 flex justify-center">
            <Loading />
          </div>
        ) : data?.newsletters?.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Newsletter
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Stats
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.newsletters.map((newsletter: Newsletter) => (
                    <tr key={newsletter.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 relative">
                            {newsletter.thumbnail ? (
                              <img
                                src={getGoogleDriveThumbnailUrl(newsletter.thumbnail)}
                                alt={newsletter.title}
                                className="absolute inset-0 w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <FileText className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate max-w-xs">
                              {newsletter.title}
                            </h3>
                            {newsletter.description && (
                              <p className="text-sm text-gray-500 truncate max-w-xs">
                                {newsletter.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => togglePublishMutation.mutate(newsletter.id)}
                          className="group"
                        >
                          <Badge
                            variant={newsletter.isPublished ? 'success' : 'warning'}
                            className="cursor-pointer group-hover:opacity-80 transition-opacity"
                          >
                            {newsletter.isPublished ? (
                              <>
                                <Eye className="w-3 h-3 mr-1" />
                                Published
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3 h-3 mr-1" />
                                Draft
                              </>
                            )}
                          </Badge>
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4 text-gray-400" />
                            {newsletter.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <Download className="w-4 h-4 text-gray-400" />
                            {newsletter.downloads}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(newsletter.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => window.open(newsletter.pdfLink, '_blank')}
                            className="p-2 text-gray-500 hover:text-[#004aad] hover:bg-blue-50 rounded-lg transition-colors"
                            title="View PDF"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openFormModal(newsletter)}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedNewsletter(newsletter);
                              setIsDeleteModalOpen(true);
                            }}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data.pagination?.totalPages > 1 && (
              <div className="p-4 border-t border-gray-200 flex justify-center">
                <Pagination
                  currentPage={page}
                  totalPages={data.pagination.totalPages}
                  onPageChange={setPage}
                />
              </div>
            )}
          </>
        ) : (
          <div className="p-12 text-center">
            <Newspaper className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No newsletters found</h3>
            <p className="text-gray-500 mb-6">
              {search ? 'Try adjusting your search or filters' : 'Get started by creating your first newsletter'}
            </p>
            {!search && (
              <Button
                onClick={() => openFormModal()}
                className="bg-[#004aad] hover:bg-[#003882] text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Newsletter
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Form Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={closeFormModal}
        title={selectedNewsletter ? 'Edit Newsletter' : 'Create Newsletter'}
        size="3xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 font-medium min-h-[44px] transition-all"
              placeholder="Enter newsletter title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 resize-none font-medium transition-all"
              placeholder="Enter a brief description (optional)"
            />
          </div>

          {/* Thumbnail Link */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              <ImageIcon className="w-4 h-4 inline mr-1" />
              Thumbnail (Google Drive Link)
            </label>
            <input
              type="url"
              value={formData.thumbnail}
              onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 font-medium min-h-[44px] transition-all"
              placeholder="https://drive.google.com/file/d/..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Paste a Google Drive image link for the thumbnail (optional)
            </p>
          </div>

          {/* PDF Link */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              <LinkIcon className="w-4 h-4 inline mr-1" />
              PDF Link (Google Drive) <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={formData.pdf_link}
              onChange={(e) => setFormData({ ...formData, pdf_link: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 font-medium min-h-[44px] transition-all"
              placeholder="https://drive.google.com/file/d/..."
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Paste the Google Drive link to the PDF file
            </p>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Newsletter Period (Date Range)
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Start Date</label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 font-medium min-h-[44px] transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">End Date</label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 font-medium min-h-[44px] transition-all"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              The time period this newsletter covers (e.g., January 1 - January 15)
            </p>
          </div>

          {/* Publish Status */}
          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_published}
                onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-500/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
            <span className="text-sm font-bold text-gray-700">
              {formData.is_published ? 'Published' : 'Save as Draft'}
            </span>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t-2 border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={closeFormModal}
              className="min-h-[44px] font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary-600 hover:bg-primary-700 text-white min-h-[44px] font-bold"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  {selectedNewsletter ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                selectedNewsletter ? 'Update Newsletter' : 'Create Newsletter'
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedNewsletter(null);
        }}
        title="Delete Newsletter"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete "<span className="font-semibold">{selectedNewsletter?.title}</span>"? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setSelectedNewsletter(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => selectedNewsletter && deleteMutation.mutate(selectedNewsletter.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div >
  );
}
