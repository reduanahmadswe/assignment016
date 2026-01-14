'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Mail, Shield, Ban, CheckCircle, Users } from 'lucide-react';
import { adminAPI } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import {
  Card,
  Button,
  Input,
  Loading,
  Badge,
  Pagination,
  Modal
} from '@/components/ui';

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('all'); // 'all' by default for tabs
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [actionType, setActionType] = useState<'role' | 'status' | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, search, role],
    queryFn: async () => {
      const response = await adminAPI.getUsers({
        page,
        limit: 10,
        search,
        role: role === 'all' ? '' : role,
      });
      return response.data;
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: number; role: string }) => {
      await adminAPI.updateUserRole(userId, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setSelectedUser(null);
      setActionType(null);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: number; isActive: boolean }) => {
      await adminAPI.updateUserStatus(userId, isActive);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setSelectedUser(null);
      setActionType(null);
    },
  });

  const handleUpdateRole = (newRole: string) => {
    if (selectedUser) {
      updateRoleMutation.mutate({
        userId: selectedUser.id,
        role: newRole,
      });
    }
  };

  const handleToggleStatus = () => {
    if (selectedUser) {
      updateStatusMutation.mutate({
        userId: selectedUser.id,
        isActive: selectedUser.status === 'active' ? false : true,
      });
    }
  };

  const tabs = [
    { id: 'all', label: 'All Users' },
    { id: 'user', label: 'Regular Users' },
    { id: 'admin', label: 'Admins' },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-[1.5rem] border border-gray-100 shadow-sm mt-10">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">User Management</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">Manage user roles, statuses, and permissions.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-full sm:w-auto bg-blue-50 text-blue-700 px-4 py-2.5 rounded-xl text-sm font-bold border border-blue-100 flex items-center justify-center">
            <Users className="w-4 h-4 mr-2" />
            Total Users: {data?.pagination?.total || 0}
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white border border-gray-100 rounded-[1.5rem] shadow-sm overflow-hidden flex flex-col h-full">
        {/* Filters and Search */}
        <div className="p-4 sm:p-5 border-b border-gray-100 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Role Tabs - Scrollable on mobile */}
            <div className="flex items-center gap-1 bg-gray-50/80 p-1 rounded-xl overflow-x-auto no-scrollbar w-full lg:w-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setRole(tab.id);
                    setPage(1);
                  }}
                  className={`flex-shrink-0 px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all whitespace-nowrap ${role === tab.id
                    ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full lg:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 border border-transparent focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 rounded-xl transition-all outline-none"
              />
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/50">
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User Details</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Joined Date</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Events Joined</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <Loading />
                  </td>
                </tr>
              ) : data?.users?.length > 0 ? (
                data.users.map((user: any) => (
                  <tr key={user.id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-white flex-shrink-0">
                          {(user?.name?.charAt(0) ?? user?.email?.charAt(0) ?? 'U').toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 truncate max-w-[200px]">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate max-w-[200px]">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={user.role === 'admin' ? 'primary' : 'secondary'} className="capitalize px-2.5 py-0.5 font-bold">
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${user.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className={`text-sm font-bold ${user.status === 'active' ? 'text-green-700' : 'text-red-700'} capitalize`}>
                          {user.status || 'Active'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 pl-10">
                      {user.events_count || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setActionType('role');
                          }}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Change Role"
                        >
                          <Shield className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setActionType('status');
                          }}
                          className={`p-2 rounded-lg transition-colors ${user.status === 'active'
                            ? 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                            : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                            }`}
                          title={user.status === 'active' ? 'Suspend User' : 'Activate User'}
                        >
                          {user.status === 'active' ? (
                            <Ban className="w-4 h-4" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                        </button>
                        <a
                          href={`mailto:${user.email}`}
                          className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Send Email"
                        >
                          <Mail className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">No users found</h3>
                    <p className="text-gray-500 max-w-sm mx-auto text-sm">
                      {search ? `No users matching "${search}"` : "No users exist in the system yet."}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data?.pagination?.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-50 bg-gray-50/30">
            <Pagination
              currentPage={page}
              totalPages={data.pagination.totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {/* Change Role Modal */}
      <Modal
        isOpen={actionType === 'role' && selectedUser !== null}
        onClose={() => {
          setSelectedUser(null);
          setActionType(null);
        }}
        title="Change User Role"
        description={`Modify access permissions for ${selectedUser?.name}`}
      >
        <div className="space-y-4 mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => handleUpdateRole('user')}
              className={`p-4 rounded-xl border-2 text-left transition-all ${selectedUser?.role === 'user'
                ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200'
                : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                }`}
            >
              <div className="block mb-2 text-primary-600 bg-primary-100 w-fit p-2 rounded-lg">
                <Users className="w-5 h-5" />
              </div>
              <div className="font-bold text-gray-900">User</div>
              <div className="text-xs text-gray-500 mt-1">Standard member access. Can view events and manage profile.</div>
            </button>
            <button
              onClick={() => handleUpdateRole('admin')}
              className={`p-4 rounded-xl border-2 text-left transition-all ${selectedUser?.role === 'admin'
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                }`}
            >
              <div className="block mb-2 text-blue-600 bg-blue-100 w-fit p-2 rounded-lg">
                <Shield className="w-5 h-5" />
              </div>
              <div className="font-bold text-gray-900">Admin</div>
              <div className="text-xs text-gray-500 mt-1">Full system access. Can manage users, events, and settings.</div>
            </button>
          </div>
        </div>
      </Modal>

      {/* Status Toggle Modal */}
      <Modal
        isOpen={actionType === 'status' && selectedUser !== null}
        onClose={() => {
          setSelectedUser(null);
          setActionType(null);
        }}
        title={selectedUser?.status === 'active' ? 'Suspend Account' : 'Activate Account'}
        description={
          selectedUser?.status === 'active'
            ? `Are you sure you want to suspend access for ${selectedUser?.name}? They will no longer be able to log in.`
            : `Are you sure you want to reactivate ${selectedUser?.name}? They will regain access immediately.`
        }
      >
        <div className="flex gap-3 mt-6 justify-end">
          <Button
            variant="outline"
            onClick={() => {
              setSelectedUser(null);
              setActionType(null);
            }}
          >
            Cancel
          </Button>
          <Button
            variant={selectedUser?.status === 'active' ? 'danger' : 'primary'}
            onClick={handleToggleStatus}
            isLoading={updateStatusMutation.isPending}
          >
            {selectedUser?.status === 'active' ? 'Suspend User' : 'Activate User'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
