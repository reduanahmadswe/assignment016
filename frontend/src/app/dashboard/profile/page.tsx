'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { User, Mail, Phone, Camera, Save, Shield, Lock, Eye, EyeOff, AlertCircle, Check } from 'lucide-react';
import { userAPI, authAPI } from '@/lib/api';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { updateUser } from '@/store/slices/auth.slice';
import Link from 'next/link';
import { OTPInput } from '@/components/auth/OTPInput';

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Password change states
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordStep, setPasswordStep] = useState<'form' | 'otp'>('form');
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const { data: profileData, isLoading, refetch } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const response = await userAPI.getProfile();
      return response.data.data; // response.data.data because backend returns {success: true, data: profile}
    },
  });

  useEffect(() => {
    if (profileData) {
      setFormData({
        name: profileData.name || user?.name || '',
        phone: profileData.phone || user?.phone || '',
      });
    }
  }, [profileData, user]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await userAPI.updateProfile(data);
      return response.data;
    },
    onSuccess: (data) => {
      dispatch(updateUser(data.data));
      setSuccessMessage('Profile updated successfully!');
      setIsEditing(false);
      refetch(); // Refetch profile data
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error: any) => {
      setErrorMessage(error.response?.data?.message || 'Failed to update profile');
      setTimeout(() => setErrorMessage(''), 3000);
    },
  });

  // Password change OTP mutation
  const sendPasswordOTPMutation = useMutation({
    mutationFn: async () => {
      const response = await authAPI.sendPasswordChangeOTP();
      return response.data;
    },
    onSuccess: () => {
      setPasswordStep('otp');
      setPasswordError('');
    },
    onError: (error: any) => {
      setPasswordError(error.response?.data?.message || 'Failed to send OTP');
    },
  });

  // Verify and change password mutation
  const verifyAndChangePasswordMutation = useMutation({
    mutationFn: async (data: { otp: string; currentPassword: string; newPassword: string }) => {
      const response = await authAPI.verifyAndChangePassword(data);
      return response.data;
    },
    onSuccess: () => {
      setPasswordSuccess('Password changed successfully!');
      setShowPasswordChange(false);
      setPasswordStep('form');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordSuccess(''), 5000);
    },
    onError: (error: any) => {
      setPasswordError(error.response?.data?.message || 'Failed to change password');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  // Password validation
  const validatePassword = () => {
    if (passwordData.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return false;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordData.newPassword)) {
      setPasswordError('Password must contain at least one uppercase, one lowercase, and one number');
      return false;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handlePasswordChangeRequest = () => {
    setPasswordError('');
    if (!validatePassword()) return;
    sendPasswordOTPMutation.mutate();
  };

  const handleOTPComplete = (otp: string) => {
    verifyAndChangePasswordMutation.mutate({
      otp,
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
  };

  const resetPasswordChangeModal = () => {
    setShowPasswordChange(false);
    setPasswordStep('form');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setPasswordError('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="mt-2 text-gray-600">Manage your profile information</p>
        </div>

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {errorMessage}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32"></div>
          <div className="px-8 pb-8">
            <div className="relative -mt-16 mb-6">
              <div className="w-32 h-32 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User className="w-16 h-16 text-gray-400" />
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={!isEditing}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={profileData?.email || ''}
                    disabled
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!isEditing}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder={formData.phone ? "" : "Enter phone number"}
                  />
                </div>
                {!isEditing && !formData.phone && (
                  <p className="mt-1 text-xs text-gray-500">Click "Edit Profile" to add your phone number</p>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                {isEditing ? (
                  <>
                    <button
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                      className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium flex items-center justify-center gap-2"
                    >
                      <Save className="w-5 h-5" />
                      {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setSuccessMessage('');
                        setErrorMessage('');
                        setFormData({
                          name: profileData?.name || user?.name || '',
                          phone: profileData?.phone || user?.phone || '',
                        });
                      }}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSuccessMessage('');
                      setErrorMessage('');
                      setFormData({
                        name: profileData?.name || user?.name || '',
                        phone: profileData?.phone || user?.phone || '',
                      });
                      setIsEditing(true);
                    }}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium cursor-pointer"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Security Settings Card */}
        <div className="mt-6">
          <Link
            href="/dashboard/security"
            className="block bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 overflow-hidden group"
          >
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="p-3.5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl group-hover:scale-110 group-hover:from-blue-100 group-hover:to-indigo-100 transition-all duration-300">
                    <Shield className="w-7 h-7 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      Security & Two-Factor Authentication
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Manage your security settings and enable 2FA
                    </p>
                  </div>
                </div>
                <div className="ml-4">
                  <svg 
                    className="w-6 h-6 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
            {/* Bottom accent line */}
            <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
          </Link>
        </div>

        {/* Password Change Card */}
        {passwordSuccess && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-2">
            <Check className="w-5 h-5" />
            {passwordSuccess}
          </div>
        )}

        <div className="mt-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 overflow-hidden group">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="p-3.5 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl group-hover:scale-110 group-hover:from-orange-100 group-hover:to-red-100 transition-all duration-300">
                    <Lock className="w-7 h-7 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                      Change Password
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Update your password to keep your account secure
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPasswordChange(true)}
                  className="ml-4 px-6 py-2.5 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:from-orange-700 hover:to-red-700 transition-all duration-300 font-semibold text-sm shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                >
                  Change Password
                </button>
              </div>
            </div>
            {/* Bottom accent line */}
            <div className="h-1 bg-gradient-to-r from-orange-500 to-red-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordChange && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 animate-in fade-in slide-in-from-bottom-4">
            {passwordStep === 'form' ? (
              <>
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center p-3 bg-orange-100 rounded-full mb-4">
                    <Lock className="w-8 h-8 text-orange-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Change Password</h2>
                  <p className="text-sm text-gray-600 mt-2">Enter your current and new password</p>
                </div>

                {passwordError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{passwordError}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent pr-12"
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent pr-12"
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters with uppercase, lowercase, and number</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent pr-12"
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={resetPasswordChangeModal}
                    className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePasswordChangeRequest}
                    disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword || sendPasswordOTPMutation.isPending}
                    className="flex-1 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {sendPasswordOTPMutation.isPending ? 'Sending OTP...' : 'Continue'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full mb-4">
                    <Mail className="w-8 h-8 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Verify Your Identity</h2>
                  <p className="text-sm text-gray-600 mt-2">
                    We&apos;ve sent a 6-digit OTP to your email address. Please enter it below.
                  </p>
                </div>

                {passwordError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{passwordError}</p>
                  </div>
                )}

                <div className="mb-6">
                  <OTPInput
                    length={6}
                    onComplete={handleOTPComplete}
                    loading={verifyAndChangePasswordMutation.isPending}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setPasswordStep('form');
                      setPasswordError('');
                    }}
                    className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => sendPasswordOTPMutation.mutate()}
                    disabled={sendPasswordOTPMutation.isPending}
                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium disabled:opacity-50"
                  >
                    Resend OTP
                  </button>
                </div>

                <button
                  onClick={resetPasswordChangeModal}
                  className="w-full mt-3 py-2 text-gray-600 hover:text-gray-900 font-medium"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
