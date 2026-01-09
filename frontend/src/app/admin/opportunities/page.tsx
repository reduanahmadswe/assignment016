'use client';
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Alert from '@/components/ui/Alert'; // Keeping it even if unused for now, or remove if unused. usage check: not used.
import { Loading } from '@/components/ui/Loading';
import { Trash, Edit, Plus, ChevronLeft, ChevronRight, Briefcase } from 'lucide-react';

interface Opportunity {
    id: number;
    title: string;
    type: string;
    status: string;
    location?: string;
    duration?: string;
    deadline?: string;
    description?: string;
    banner?: string;
    _count?: {
        applications: number;
    }
}

export default function AdminOpportunitiesPage() {
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const [formData, setFormData] = useState({
        title: '',
        type: 'INTERNSHIP',
        description: '',
        location: '',
        duration: '',
        deadline: '',
        banner: '',
        status: 'open'
    });

    useEffect(() => {
        fetchOpportunities();
    }, [currentPage]);

    const fetchOpportunities = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/opportunities/admin/list?page=${currentPage}&limit=${ITEMS_PER_PAGE}`, {
                headers: { 'Authorization': `Bearer ${Cookies.get('accessToken') || localStorage.getItem('token')}` }
            });
            const data = await res.json();
            if (data.success) {
                setOpportunities(data.data.opportunities);
                setTotalPages(data.data.pagination.totalPages);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const url = editingId
            ? `${process.env.NEXT_PUBLIC_API_URL}/opportunities/${editingId}`
            : `${process.env.NEXT_PUBLIC_API_URL}/opportunities`;

        const method = editingId ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Cookies.get('accessToken') || localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                fetchOpportunities();
                setIsModalOpen(false);
                setEditingId(null);
                setFormData({ title: '', type: 'INTERNSHIP', description: '', location: '', duration: '', deadline: '', banner: '', status: 'open' });
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleEdit = (opp: Opportunity) => {
        setEditingId(opp.id);
        setFormData({
            title: opp.title,
            type: opp.type,
            description: opp.description || '',
            location: opp.location || '',
            duration: opp.duration || '',
            deadline: opp.deadline ? new Date(opp.deadline).toISOString().split('T')[0] : '',
            banner: opp.banner || '',
            status: opp.status
        });
        setIsModalOpen(true);
    };

    const handleDelete = (id: number) => {
        setDeleteId(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/opportunities/${deleteId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${Cookies.get('accessToken') || localStorage.getItem('token')}` }
            });
            fetchOpportunities();
            setIsDeleteModalOpen(false);
            setDeleteId(null);
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <Loading />;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Manage Opportunities</h1>
                <Button onClick={() => { setEditingId(null); setFormData({ title: '', type: 'INTERNSHIP', description: '', location: '', duration: '', deadline: '', banner: '', status: 'open' }); setIsModalOpen(true); }}>
                    <Plus size={16} className="mr-2" /> Add New
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {opportunities.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Briefcase size={32} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">No Opportunities Yet</h3>
                        <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                            Get started by creating a new opportunity for potential candidates.
                        </p>
                        <Button onClick={() => { setEditingId(null); setFormData({ title: '', type: 'INTERNSHIP', description: '', location: '', duration: '', deadline: '', banner: '', status: 'open' }); setIsModalOpen(true); }}>
                            <Plus size={16} className="mr-2" /> Create First Opportunity
                        </Button>
                    </div>
                ) : (
                    opportunities.map(opp => (
                        <div key={opp.id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-lg">{opp.title}</h3>
                                <div className="flex gap-2 mt-1">
                                    <Badge variant={opp.type === 'INTERNSHIP' ? 'primary' : 'secondary'}>{opp.type}</Badge>
                                    <Badge variant={opp.status === 'open' ? 'success' : 'default'}>{opp.status}</Badge>
                                </div>
                                <div className="text-sm text-gray-500 mt-1">
                                    {opp.location && <span>📍 {opp.location} • </span>}
                                    <span>Total Applications: {opp._count?.applications || 0}</span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => handleEdit(opp)}><Edit size={16} /></Button>
                                <Button size="sm" variant="danger" onClick={() => handleDelete(opp.id)}><Trash size={16} /></Button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8">
                    <Button
                        variant="outline"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    >
                        <ChevronLeft size={16} className="mr-2" /> Previous
                    </Button>
                    <span className="text-gray-600">
                        Page {currentPage} of {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    >
                        Next <ChevronRight size={16} className="ml-2" />
                    </Button>
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Opportunity' : 'New Opportunity'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input label="Title" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                    <div>
                        <label className="block text-sm font-medium mb-1">Type</label>
                        <select className="w-full border rounded p-2" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                            <option value="INTERNSHIP">Internship</option>
                            <option value="FELLOWSHIP">Fellowship</option>
                            <option value="PROGRAM">Program</option>
                            <option value="JOB">Job</option>
                        </select>
                    </div>
                    <Input label="Location" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                    <Input label="Duration" value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} />
                    <Input label="Deadline" type="date" value={formData.deadline} onChange={e => setFormData({ ...formData, deadline: e.target.value })} />
                    <Input label="Banner URL" value={formData.banner} onChange={e => setFormData({ ...formData, banner: e.target.value })} placeholder="https://..." />

                    <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea className="w-full border rounded p-2 h-32" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Status</label>
                        <select className="w-full border rounded p-2" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                            <option value="open">Open</option>
                            <option value="closed">Closed</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="submit">{editingId ? 'Update' : 'Create'}</Button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Delete">
                <div className="p-4">
                    <p className="text-gray-600 mb-6">Are you sure you want to delete this opportunity? This action cannot be undone.</p>
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                        <Button variant="danger" onClick={confirmDelete}>Delete</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
