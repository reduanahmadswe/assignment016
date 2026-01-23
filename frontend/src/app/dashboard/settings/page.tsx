'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Phone, Lock, Eye, EyeOff, Save, ShieldAlert, Trash2 } from 'lucide-react';
import { userAPI } from '@/lib/api';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { setUser } from '@/store/slices/auth.slice';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Button, Input, Alert } from '@/components/ui';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'Password must be at least 6 characters'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onProfileSubmit = async (data: ProfileFormData) => {
    setProfileLoading(true);
    setProfileError('');
    setProfileSuccess('');

    try {
      await userAPI.updateProfile(data);
      // Update local user state
      if (user) {
        dispatch(setUser({ ...user, ...data }));
      }
      setProfileSuccess('Profile updated successfully!');
    } catch (err: any) {
      setProfileError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    setPasswordLoading(true);
    setPasswordError('');
    setPasswordSuccess('');

    try {
      await userAPI.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      setPasswordSuccess('Password changed successfully!');
      passwordForm.reset();
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Account Settings</h1>
        <p className="text-gray-500 mt-1 text-sm sm:text-base">Manage your personal information and security preferences.</p>
      </div>

      {/* Profile Settings */}
      <Card className="border-gray-100 shadow-sm rounded-[1.5rem] overflow-hidden">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100 p-6">
          <CardTitle className="text-xl font-bold text-gray-900">Profile Information</CardTitle>
          <CardDescription className="text-gray-500">Update your public profile details</CardDescription>
        </CardHeader>
        <CardContent className="p-6 sm:p-8">
          {profileSuccess && (
            <Alert variant="success" className="mb-6 rounded-xl" dismissible onDismiss={() => setProfileSuccess('')}>
              {profileSuccess}
            </Alert>
          )}
          {profileError && (
            <Alert variant="error" className="mb-6 rounded-xl" dismissible onDismiss={() => setProfileError('')}>
              {profileError}
            </Alert>
          )}

          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} noValidate className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Full Name"
                placeholder="Your name"
                className="rounded-xl h-12"
                leftIcon={<User className="w-5 h-5 text-gray-400" />}
                error={profileForm.formState.errors.name?.message}
                {...profileForm.register('name')}
              />

              <Input
                label="Phone Number"
                placeholder="+880 1XXXXXXXXX"
                className="rounded-xl h-12"
                leftIcon={<Phone className="w-5 h-5 text-gray-400" />}
                error={profileForm.formState.errors.phone?.message}
                {...profileForm.register('phone')}
              />
            </div>

            <Input
              label="Email Address"
              value={user?.email || ''}
              disabled
              className="rounded-xl h-12 bg-gray-50 text-gray-500"
              leftIcon={<Mail className="w-5 h-5 text-gray-400" />}
              helperText="Email address cannot be changed"
            />

            <div className="pt-2">
              <Button
                type="submit"
                isLoading={profileLoading}
                leftIcon={<Save className="w-4 h-4" />}
                className="w-full sm:w-auto px-8 rounded-xl bg-[#004aad] hover:bg-[#003366] font-bold h-12"
              >
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Password Settings */}
      <Card className="border-gray-100 shadow-sm rounded-[1.5rem] overflow-hidden">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100 p-6">
          <CardTitle className="text-xl font-bold text-gray-900">Security</CardTitle>
          <CardDescription className="text-gray-500">Update your password to keep your account secure</CardDescription>
        </CardHeader>
        <CardContent className="p-6 sm:p-8">
          {passwordSuccess && (
            <Alert variant="success" className="mb-6 rounded-xl" dismissible onDismiss={() => setPasswordSuccess('')}>
              {passwordSuccess}
            </Alert>
          )}
          {passwordError && (
            <Alert variant="error" className="mb-6 rounded-xl" dismissible onDismiss={() => setPasswordError('')}>
              {passwordError}
            </Alert>
          )}

          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} noValidate className="space-y-6 max-w-2xl">
            <Input
              label="Current Password"
              type={showPasswords ? 'text' : 'password'}
              placeholder="Enter current password"
              className="rounded-xl h-12"
              leftIcon={<Lock className="w-5 h-5 text-gray-400" />}
              error={passwordForm.formState.errors.currentPassword?.message}
              {...passwordForm.register('currentPassword')}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="New Password"
                type={showPasswords ? 'text' : 'password'}
                placeholder="Min. 6 characters"
                className="rounded-xl h-12"
                leftIcon={<Lock className="w-5 h-5 text-gray-400" />}
                error={passwordForm.formState.errors.newPassword?.message}
                {...passwordForm.register('newPassword')}
              />

              <Input
                label="Confirm New Password"
                type={showPasswords ? 'text' : 'password'}
                placeholder="Re-enter new password"
                className="rounded-xl h-12"
                leftIcon={<Lock className="w-5 h-5 text-gray-400" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="focus:outline-none p-1 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="Toggle password visibility"
                  >
                    {showPasswords ? <EyeOff className="w-4 h-4 text-gray-500" /> : <Eye className="w-4 h-4 text-gray-500" />}
                  </button>
                }
                error={passwordForm.formState.errors.confirmPassword?.message}
                {...passwordForm.register('confirmPassword')}
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                isLoading={passwordLoading}
                leftIcon={<Lock className="w-4 h-4" />}
                className="w-full sm:w-auto px-8 rounded-xl bg-gray-900 hover:bg-black font-bold h-12"
              >
                Change Password
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-100 shadow-sm rounded-[1.5rem] overflow-hidden bg-red-50/30">
        <CardHeader className="bg-red-50/50 border-b border-red-100 p-6">
          <div className="flex items-center gap-2 text-red-600 mb-1">
            <ShieldAlert className="w-5 h-5" />
            <CardTitle className="text-xl font-bold text-red-700">Danger Zone</CardTitle>
          </div>
          <CardDescription className="text-red-600/70">Irreversible actions for your account</CardDescription>
        </CardHeader>
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="text-sm text-gray-600 max-w-lg leading-relaxed">
              <strong className="block text-gray-900 mb-1">Delete Account</strong>
              Once you delete your account, all of your data including certificates and event registrations will be permanently removed. This action cannot be undone.
            </div>
            <Button variant="danger" className="w-full md:w-auto px-6 rounded-xl font-bold h-12 shadow-sm whitespace-nowrap" leftIcon={<Trash2 className="w-4 h-4" />}>
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
