'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Search, X, Upload, Globe, Linkedin, Twitter } from 'lucide-react';
import { api } from '@/lib/api';
import { Button, Input, Modal, Loading, Badge, Pagination } from '@/components/ui';

interface Host {
  id: string;
  name: string;
  title: string;
  bio: string;
  photo: string | null;
  email: string;
  phone: string | null;
  website: string | null;
  linkedin: string | null;
  twitter: string | null;
  status: 'active' | 'inactive';
  eventsCount: number;
  createdAt: string;
}

export default function AdminHostsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedHost, setSelectedHost] = useState<Host | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    bio: '',
    email: '',
    phone: '',
    website: '',
    linkedin: '',
    twitter: '',
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-hosts', page, search],
    queryFn: () => api.get(`/admin/hosts?page=${page}&limit=10&search=${search}`).then(res => res.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: FormData) => api.post('/admin/hosts', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-hosts'] });
      closeFormModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) =>
      api.put(`/admin/hosts/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-hosts'] });
      closeFormModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/hosts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-hosts'] });
      setIsDeleteModalOpen(false);
      setSelectedHost(null);
    },
  });

  const openCreateModal = () => {
    setSelectedHost(null);
    setFormData({
      name: '',
      title: '',
      bio: '',
      email: '',
      phone: '',
      website: '',
      linkedin: '',
      twitter: '',
    });
    setPhotoFile(null);
    setPhotoPreview(null);
    setIsFormModalOpen(true);
  };

  const openEditModal = (host: Host) => {
    setSelectedHost(host);
    setFormData({
      name: host.name,
      title: host.title,
      bio: host.bio,
      email: host.email,
      phone: host.phone || '',
      website: host.website || '',
      linkedin: host.linkedin || '',
      twitter: host.twitter || '',
    });
    setPhotoPreview(host.photo);
    setPhotoFile(null);
    setIsFormModalOpen(true);
  };

  const closeFormModal = () => {
    setIsFormModalOpen(false);
    setSelectedHost(null);
    setFormData({
      name: '',
      title: '',
      bio: '',
      email: '',
      phone: '',
      website: '',
      linkedin: '',
      twitter: '',
    });
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const submitData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value) submitData.append(key, value);
    });
    if (photoFile) {
      submitData.append('photo', photoFile);
    }

    if (selectedHost) {
      updateMutation.mutate({ id: selectedHost.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleDelete = () => {
    if (selectedHost) {
      deleteMutation.mutate(selectedHost.id);
    }
  };

  if (isLoading) {
    return <Loading text="Loading hosts..." />;
  }

  return (
    <div className="space-y-6 sm:space-y-8 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-[1.5rem] border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">Hosts & Speakers</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">Manage event hosts and speakers</p>
        </div>
        <Button onClick={openCreateModal} className="w-full sm:w-auto justify-center rounded-xl" leftIcon={<Plus className="w-4 h-4" />}>
          Add Host
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-[1.5rem] p-4 sm:p-5 border border-gray-100 shadow-sm">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search hosts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border-gray-200 rounded-xl focus:ring-primary-500 focus:border-primary-500 bg-white"
          />
        </div>
      </div>

      {/* Hosts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {data?.hosts?.map((host: Host) => (
          <div key={host.id} className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col group">
            <div className="p-5 sm:p-6 flex-1 flex flex-col">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 border-2 border-white shadow-sm ring-1 ring-gray-100">
                  {host.photo ? (
                    <img src={host.photo} alt={host.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl font-bold text-gray-400 bg-gray-50">
                      {(host?.name?.charAt(0) ?? 'H').toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-primary-600 transition-colors">{host.name}</h3>
                  <p className="text-sm text-gray-500 truncate font-medium">{host.title}</p>
                  <Badge variant={host.status === 'active' ? 'success' : 'secondary'} className="mt-1.5 capitalize font-bold px-2 py-0.5">
                    {host.status}
                  </Badge>
                </div>
              </div>

              <p className="mt-4 text-sm text-gray-600 line-clamp-3 leading-relaxed flex-1">{host.bio}</p>

              {/* Social Links */}
              <div className="mt-5 flex items-center gap-3 border-t border-gray-50 pt-4">
                {host.website && (
                  <a href={host.website} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary-600 transition-colors p-1 hover:bg-primary-50 rounded-lg">
                    <Globe className="w-4 h-4" />
                  </a>
                )}
                {host.linkedin && (
                  <a href={host.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600 transition-colors p-1 hover:bg-blue-50 rounded-lg">
                    <Linkedin className="w-4 h-4" />
                  </a>
                )}
                {host.twitter && (
                  <a href={host.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-sky-500 transition-colors p-1 hover:bg-sky-50 rounded-lg">
                    <Twitter className="w-4 h-4" />
                  </a>
                )}
                {!host.website && !host.linkedin && !host.twitter && (
                  <span className="text-xs text-gray-300 font-medium italic">No social links</span>
                )}
              </div>
            </div>

            <div className="px-5 sm:px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">{host.eventsCount} events</span>
              <div className="flex items-center gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEditModal(host)}
                  className="p-2 text-gray-400 hover:text-primary-600 hover:bg-white rounded-lg transition-all shadow-sm border border-transparent hover:border-gray-200"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setSelectedHost(host);
                    setIsDeleteModalOpen(true);
                  }}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition-all shadow-sm border border-transparent hover:border-gray-200"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {data?.hosts?.length === 0 && (
        <div className="text-center py-20 bg-white rounded-[1.5rem] border border-gray-100 border-dashed">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-gray-500 mb-4 font-medium">No hosts found matching your criteria</p>
          <Button onClick={openCreateModal} leftIcon={<Plus className="w-4 h-4" />} className="rounded-xl">
            Add First Host
          </Button>
        </div>
      )}

      {/* Pagination */}
      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="flex justify-center pt-4">
          <Pagination
            currentPage={page}
            totalPages={data.pagination.totalPages}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Form Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={closeFormModal}
        title={selectedHost ? 'Edit Host' : 'Add Host'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Photo Upload */}
          <div className="flex items-center gap-5 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div className="w-20 h-20 rounded-full bg-white overflow-hidden flex-shrink-0 border-4 border-white shadow-sm relative group">
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Upload className="w-8 h-8 text-gray-300 group-hover:text-primary-400 transition-colors" />
                </div>
              )}
            </div>
            <div>
              <label className="cursor-pointer inline-block">
                <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold text-primary-700 bg-primary-50 hover:bg-primary-100 transition-colors ring-1 ring-primary-200">
                  {photoPreview ? 'Change Photo' : 'Upload Photo'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-gray-500 mt-2 font-medium">JPG, PNG up to 2MB. 400x400px recommended.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="Title/Position *"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Senior Developer at XYZ"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Bio *</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent font-medium text-sm"
              placeholder="Brief biography..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Email *"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Input
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
            <Input
              label="Website"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://..."
              leftIcon={<Globe className="w-4 h-4" />}
            />
            <Input
              label="LinkedIn"
              value={formData.linkedin}
              onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
              placeholder="https://linkedin.com/in/..."
              leftIcon={<Linkedin className="w-4 h-4" />}
            />
            <Input
              label="Twitter"
              value={formData.twitter}
              onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
              placeholder="https://twitter.com/..."
              leftIcon={<Twitter className="w-4 h-4" />}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={closeFormModal} className="rounded-xl">
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={createMutation.isPending || updateMutation.isPending}
              className="rounded-xl"
            >
              {selectedHost ? 'Update Host' : 'Add Host'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Host"
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
                Are you sure you want to delete <strong>"{selectedHost?.name}"</strong>? This action cannot be undone.
              </p>
            </div>
          </div>

          {selectedHost && selectedHost.eventsCount > 0 && (
            <div className="p-3 bg-yellow-50 border border-yellow-100 text-yellow-800 rounded-xl text-sm font-medium">
              ⚠️ This host is associated with <strong>{selectedHost.eventsCount}</strong> events. Deleting will remove them from those events.
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              isLoading={deleteMutation.isPending}
              className="rounded-xl"
            >
              Delete Host
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
