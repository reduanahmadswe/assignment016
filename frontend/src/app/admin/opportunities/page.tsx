'use client';
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { Trash, Edit, Plus, ChevronLeft, ChevronRight, Briefcase, MapPin, Clock, Calendar, Users, Search } from 'lucide-react';

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
    const [searchQuery, setSearchQuery] = useState('');

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

    if (loading) return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex justify-center items-center">
            <div className="text-center">
                <Loading />
                <p className="text-gray-500 font-medium mt-4 text-sm sm:text-base">Loading opportunities...</p>
            </div>
        </div>
    );

    // Filter opportunities based on search
    const filteredOpportunities = opportunities.filter(opp =>
        opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.location?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
            {/* Main Container - Responsive padding and max-width */}
            <div className="w-full max-w-[2000px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 2xl:px-16 py-4 sm:py-6 md:py-8 lg:py-10">

                {/* Header Section - Responsive flex layout */}
                {/* Header Section */}
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                            Manage Opportunities
                        </h1>
                        <p className="text-sm text-gray-500 mt-1 font-medium">
                            Create and manage internships, fellowships, and job opportunities
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
                        <div className="relative flex-1 sm:min-w-[320px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search opportunities..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 text-sm sm:text-base bg-white border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 rounded-xl transition-all outline-none placeholder:text-gray-400 font-medium min-h-[44px] shadow-sm"
                            />
                        </div>

                        <Button
                            onClick={() => {
                                setEditingId(null);
                                setFormData({ title: '', type: 'INTERNSHIP', description: '', location: '', duration: '', deadline: '', banner: '', status: 'open' });
                                setIsModalOpen(true);
                            }}
                            className="w-full sm:w-auto min-h-[44px] font-bold text-sm sm:text-base whitespace-nowrap"
                        >
                            <Plus size={18} className="mr-2" /> Add New
                        </Button>
                    </div>
                </div>



                {/* Opportunities Grid/List - Responsive layout */}
                <div className="space-y-3 sm:space-y-4">
                    {filteredOpportunities.length === 0 ? (
                        <div className="text-center py-12 sm:py-16 md:py-20 bg-white rounded-xl sm:rounded-2xl border-2 border-dashed border-gray-200">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary-50 to-indigo-50 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                <Briefcase className="w-6 h-6 sm:w-8 sm:h-8" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-black text-gray-900 mb-1 sm:mb-2">
                                {searchQuery ? 'No opportunities found' : 'No Opportunities Yet'}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6 max-w-sm mx-auto px-4">
                                {searchQuery
                                    ? 'Try adjusting your search criteria'
                                    : 'Get started by creating a new opportunity for potential candidates.'
                                }
                            </p>
                            {!searchQuery && (
                                <Button
                                    onClick={() => {
                                        setEditingId(null);
                                        setFormData({ title: '', type: 'INTERNSHIP', description: '', location: '', duration: '', deadline: '', banner: '', status: 'open' });
                                        setIsModalOpen(true);
                                    }}
                                    className="min-h-[44px]"
                                >
                                    <Plus size={18} className="mr-2" /> Create First Opportunity
                                </Button>
                            )}
                        </div>
                    ) : (
                        filteredOpportunities.map(opp => (
                            <div
                                key={opp.id}
                                className="bg-white rounded-xl sm:rounded-2xl border-2 border-gray-100 hover:border-primary-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group"
                            >
                                {/* Card Content - Responsive padding and layout */}
                                <div className="p-4 sm:p-5 md:p-6">
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                        {/* Left Section - Opportunity Details */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start gap-3 sm:gap-4 mb-3">
                                                <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-primary-50 to-indigo-50 text-primary-600 flex-shrink-0">
                                                    <Briefcase className="w-5 h-5 sm:w-6 sm:h-6" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-bold text-base sm:text-lg md:text-xl text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                                                        {opp.title}
                                                    </h3>
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <Badge
                                                            variant={opp.type === 'INTERNSHIP' ? 'primary' : opp.type === 'FELLOWSHIP' ? 'secondary' : 'default'}
                                                            className="text-xs font-bold"
                                                        >
                                                            {opp.type}
                                                        </Badge>
                                                        <Badge
                                                            variant={opp.status === 'open' ? 'success' : 'default'}
                                                            className="text-xs font-bold capitalize"
                                                        >
                                                            {opp.status}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Metadata - Responsive grid */}
                                            <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                                                {opp.location && (
                                                    <div className="flex items-center gap-1.5 font-semibold">
                                                        <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                                                        <span className="truncate">{opp.location}</span>
                                                    </div>
                                                )}
                                                {opp.duration && (
                                                    <div className="flex items-center gap-1.5 font-semibold">
                                                        <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                                                        <span className="truncate">{opp.duration}</span>
                                                    </div>
                                                )}
                                                {opp.deadline && (
                                                    <div className="flex items-center gap-1.5 font-semibold">
                                                        <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                                                        <span className="truncate">
                                                            {new Date(opp.deadline).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1.5 font-semibold">
                                                    <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                                                    <span>{opp._count?.applications || 0} Applications</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Section - Action Buttons */}
                                        <div className="flex sm:flex-row gap-2 sm:gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 lg:border-l lg:pl-6 border-gray-100">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleEdit(opp)}
                                                className="flex-1 sm:flex-none min-h-[44px] font-bold"
                                            >
                                                <Edit className="w-4 h-4 sm:mr-2" />
                                                <span className="hidden sm:inline">Edit</span>
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="danger"
                                                onClick={() => handleDelete(opp.id)}
                                                className="flex-1 sm:flex-none min-h-[44px] font-bold"
                                            >
                                                <Trash className="w-4 h-4 sm:mr-2" />
                                                <span className="hidden sm:inline">Delete</span>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination - Responsive layout */}
                {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 mt-6 sm:mt-8">
                        <Button
                            variant="outline"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            className="w-full sm:w-auto min-h-[44px] font-bold"
                        >
                            <ChevronLeft className="w-4 h-4 mr-2" /> Previous
                        </Button>
                        <span className="text-sm sm:text-base text-gray-600 font-semibold px-4">
                            Page {currentPage} of {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            className="w-full sm:w-auto min-h-[44px] font-bold"
                        >
                            Next <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                )}
            </div>

            {/* Create/Edit Modal - Responsive design */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingId ? 'Edit Opportunity' : 'New Opportunity'}
                size="3xl"
            >
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 p-4 sm:p-6">
                    {/* Title and Type - Same Line */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            label="Title"
                            required
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            className="min-h-[44px]"
                        />

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Type</label>
                            <select
                                className="w-full border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 rounded-xl px-4 py-3 text-sm sm:text-base font-medium min-h-[44px] transition-all outline-none"
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option value="INTERNSHIP">Internship</option>
                                <option value="FELLOWSHIP">Fellowship</option>
                                <option value="PROGRAM">Program</option>
                                <option value="JOB">Job</option>
                            </select>
                        </div>
                    </div>

                    {/* Location, Duration, Deadline - Same Line */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Input
                            label="Location"
                            value={formData.location}
                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                            className="min-h-[44px]"
                            placeholder="e.g., Remote, Dhaka"
                        />
                        <Input
                            label="Duration"
                            value={formData.duration}
                            onChange={e => setFormData({ ...formData, duration: e.target.value })}
                            className="min-h-[44px]"
                            placeholder="e.g., 3 months"
                        />
                        <Input
                            label="Deadline"
                            type="date"
                            value={formData.deadline}
                            onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                            className="min-h-[44px]"
                        />
                    </div>

                    <Input
                        label="Banner URL"
                        value={formData.banner}
                        onChange={e => setFormData({ ...formData, banner: e.target.value })}
                        placeholder="https://example.com/image.jpg"
                        className="min-h-[44px]"
                    />

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                        <textarea
                            className="w-full border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 rounded-xl px-4 py-3 text-sm sm:text-base font-medium min-h-[120px] sm:min-h-[140px] transition-all outline-none resize-none"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Describe the opportunity..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
                        <select
                            className="w-full border-2 border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 rounded-xl px-4 py-3 text-sm sm:text-base font-medium min-h-[44px] transition-all outline-none"
                            value={formData.status}
                            onChange={e => setFormData({ ...formData, status: e.target.value })}
                        >
                            <option value="open">Open</option>
                            <option value="closed">Closed</option>
                        </select>
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t-2 border-gray-100">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsModalOpen(false)}
                            className="w-full sm:w-auto min-h-[44px] font-bold"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="w-full sm:w-auto min-h-[44px] font-bold"
                        >
                            {editingId ? 'Update Opportunity' : 'Create Opportunity'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal - Responsive design */}
            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Delete">
                <div className="p-4 sm:p-6">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Trash className="w-6 h-6 sm:w-7 sm:h-7 text-red-600" />
                    </div>
                    <p className="text-sm sm:text-base text-gray-600 text-center mb-6 sm:mb-8">
                        Are you sure you want to delete this opportunity? This action cannot be undone and all applications will be lost.
                    </p>
                    <div className="flex flex-col-reverse sm:flex-row justify-center gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="w-full sm:w-auto min-h-[44px] font-bold"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            onClick={confirmDelete}
                            className="w-full sm:w-auto min-h-[44px] font-bold"
                        >
                            Delete Permanently
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
