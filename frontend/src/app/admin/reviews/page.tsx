'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, CheckCircle, XCircle, Eye, Trash2, Sparkles } from 'lucide-react';
import { reviewAPI } from '@/lib/api';
import { UserAvatar } from '@/components/UserAvatar';
import toast from '@/lib/toast';
import { formatDate } from '@/lib/utils';

export default function AdminReviewsPage() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('pending');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  // Fetch reviews
  const { data, isLoading } = useQuery({
    queryKey: ['admin-reviews', filter, page],
    queryFn: async () => {
      const isApproved = filter === 'pending' ? false : filter === 'approved' ? true : undefined;
      const response = await reviewAPI.getAllReviews({ isApproved, page, limit: 20 });
      return response.data;
    },
  });

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ['review-stats'],
    queryFn: async () => {
      const response = await reviewAPI.getReviewStats();
      return response.data.stats;
    },
  });

  // Approve/Reject mutation
  const approveMutation = useMutation({
    mutationFn: ({ id, isApproved, isFeatured }: { id: number; isApproved: boolean; isFeatured?: boolean }) =>
      reviewAPI.approveReview(id, isApproved, isFeatured),
    onSuccess: () => {
      toast.success('Review status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['review-stats'] });
    },
    onError: () => {
      toast.error('Failed to update review status');
    },
  });

  const handleApprove = (id: number, isFeatured: boolean = false) => {
    approveMutation.mutate({ id, isApproved: true, isFeatured });
  };

  const handleReject = (id: number) => {
    approveMutation.mutate({ id, isApproved: false });
  };

  const toggleFeatured = (id: number, currentFeatured: boolean) => {
    approveMutation.mutate({ id, isApproved: true, isFeatured: !currentFeatured });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reviews Management</h1>
        <p className="text-gray-600 mt-1">Manage and moderate user reviews</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Reviews</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.approved}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.averageRating}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-yellow-600 fill-yellow-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'pending'
                ? 'bg-orange-100 text-orange-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Pending ({stats?.pending || 0})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'approved'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Approved ({stats?.approved || 0})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'all'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All ({stats?.total || 0})
          </button>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : data?.reviews?.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
            <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews found</h3>
            <p className="text-gray-600">There are no reviews in this category yet.</p>
          </div>
        ) : (
          data?.reviews?.map((review: any) => (
            <div key={review.id} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <UserAvatar name={review.user.name} avatar={review.user.avatar} size="md" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{review.user.name}</h3>
                    <p className="text-sm text-gray-500">{review.user.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {renderStars(review.rating)}
                      <span className="text-sm text-gray-600">({review.rating}/5)</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  {review.isFeatured && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Featured
                    </span>
                  )}
                  {review.isApproved ? (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                      Approved
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                      Pending
                    </span>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-1">Event:</p>
                <p className="text-gray-900">{review.event.title}</p>
              </div>

              {review.comment && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Submitted {formatDate(review.createdAt)}
                </p>

                <div className="flex gap-2">
                  {review.isApproved && (
                    <button
                      onClick={() => toggleFeatured(review.id, review.isFeatured)}
                      disabled={approveMutation.isPending}
                      className={`px-3 py-1.5 rounded-lg font-medium text-sm transition ${
                        review.isFeatured
                          ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Sparkles className="w-4 h-4 inline mr-1" />
                      {review.isFeatured ? 'Unfeature' : 'Feature'}
                    </button>
                  )}

                  {!review.isApproved && (
                    <>
                      <button
                        onClick={() => handleApprove(review.id)}
                        disabled={approveMutation.isPending}
                        className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-medium text-sm transition flex items-center gap-1"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleApprove(review.id, true)}
                        disabled={approveMutation.isPending}
                        className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 font-medium text-sm transition flex items-center gap-1"
                      >
                        <Sparkles className="w-4 h-4" />
                        Approve & Feature
                      </button>
                      <button
                        onClick={() => handleReject(review.id)}
                        disabled={approveMutation.isPending}
                        className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium text-sm transition flex items-center gap-1"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="px-4 py-2 bg-white border border-gray-300 rounded-lg">
            Page {page} of {data.pagination.totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))}
            disabled={page === data.pagination.totalPages}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
      </div>
    </div>
  );
}
