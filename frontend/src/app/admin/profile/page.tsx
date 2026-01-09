'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Mail, Phone, Lock, Image as ImageIcon, Upload } from 'lucide-react';
import { adminAPI } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Loading, Spinner } from '@/components/ui';
import { toast } from 'react-hot-toast';

export default function AdminProfilePage() {
  const queryClient = useQueryClient();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Fetch admin profile
  const { data: profileData, isLoading } = useQuery({
    queryKey: ['admin-profile'],
    queryFn: async () => {
      const response = await adminAPI.get('/profile');
      return response.data.data;
    },
  });

  // Populate form when data is loaded
  useEffect(() => {
    if (profileData) {
      setFormData({
        name: profileData.name || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      // Set avatar preview from server - works for both local and Cloudinary URLs
      if (profileData.avatar) {
        // If it's a Cloudinary URL, use it directly; otherwise prepend localhost
        const avatarUrl = profileData.avatar.startsWith('http') 
          ? profileData.avatar 
          : `http://localhost:5000${profileData.avatar}`;
        setAvatarPreview(avatarUrl);
      }
    }
  }, [profileData]);

  const updateMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      console.log('Uploading avatar:', avatarFile);
      const response = await adminAPI.put('/profile', formData);
      console.log('Update response:', response.data);
      return response.data;
    },
    onSuccess: (data) => {
      console.log('Profile updated:', data);
      toast.success('Profile updated successfully!');
      // Refresh profile data
      queryClient.invalidateQueries({ queryKey: ['admin-profile'] });
      // Clear password fields and avatar
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
      setAvatarFile(null);
      setAvatarPreview('');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || 'Unable to update profile. Please try again.';
      toast.error(message);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate password change if provided
    if (formData.newPassword) {
      if (!formData.currentPassword) {
        toast.error('Current password is required to change password');
        return;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        toast.error('New passwords do not match');
        return;
      }

      if (formData.newPassword.length < 6) {
        toast.error('New password must be at least 6 characters long');
        return;
      }
    }

    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('email', formData.email);
    submitData.append('phone', formData.phone);

    console.log('Avatar file before append:', avatarFile);
    if (avatarFile) {
      submitData.append('avatar', avatarFile);
      console.log('Avatar appended to FormData');
    } else {
      console.log('No avatar file selected');
    }

    if (formData.newPassword) {
      submitData.append('currentPassword', formData.currentPassword);
      submitData.append('newPassword', formData.newPassword);
    }

    // Log FormData contents
    console.log('FormData contents:');
    for (let pair of submitData.entries()) {
      console.log(pair[0] + ': ', pair[1]);
    }

    updateMutation.mutate(submitData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      setAvatarFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Profile</h1>
          <p className="text-gray-600">Manage your account information and security settings</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Information */}
          <Card className="rounded-[1.5rem] border-gray-100 shadow-sm overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary-50 to-primary-100/50 border-b border-primary-100 px-6 py-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <User className="w-5 h-5 text-primary-600" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 p-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  Full Name *
                </label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  required
                  className="rounded-xl w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email Address *
                </label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your.email@example.com"
                  required
                  className="rounded-xl w-full"
                />
                <p className="text-xs text-gray-500 mt-2 font-medium">
                  This email will be used for login and notifications
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Phone Number
                </label>
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+880 1234 567890"
                  className="rounded-xl w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  <ImageIcon className="w-4 h-4 inline mr-1" />
                  Avatar Image
                </label>
                
                {/* Current Avatar Display */}
                {profileData?.avatar && !avatarFile && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-600 font-medium mb-2">Current Avatar:</p>
                    <div className="relative rounded-xl overflow-hidden border border-gray-200 p-4 bg-white">
                      <img
                        src={profileData.avatar.startsWith('http') ? profileData.avatar : `http://localhost:5000${profileData.avatar}`}
                        alt="Current avatar"
                        className="w-24 h-24 object-cover rounded-full mx-auto"
                      />
                    </div>
                  </div>
                )}

                {/* New Avatar Preview */}
                {avatarFile && avatarPreview && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-600 font-medium mb-2">New Avatar Preview:</p>
                    <div className="relative rounded-xl overflow-hidden border-2 border-green-300 p-4 bg-green-50">
                      <img
                        src={avatarPreview}
                        alt="Avatar preview"
                        className="w-32 h-32 object-cover rounded-full mx-auto border-4 border-white shadow-lg"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="rounded-xl w-full"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2 font-medium">
                  Upload an image file (max 5MB, JPG, PNG, GIF, WebP)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Password Change */}
          <Card className="rounded-[1.5rem] border-gray-100 shadow-sm overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100/50 border-b border-orange-100 px-6 py-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Lock className="w-5 h-5 text-orange-600" />
                Change Password
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 p-6">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4">
                <p className="text-sm text-blue-700 font-medium">
                  💡 Leave password fields empty if you don't want to change your password
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Current Password
                </label>
                <Input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  placeholder="Enter your current password"
                  className="rounded-xl w-full"
                  autoComplete="current-password"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  New Password
                </label>
                <Input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  placeholder="Enter new password (min. 6 characters)"
                  className="rounded-xl w-full"
                  autoComplete="new-password"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <Input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your new password"
                  className="rounded-xl w-full"
                  autoComplete="new-password"
                />
              </div>
            </CardContent>
          </Card>

          {/* Account Info Display */}
          <Card className="rounded-[1.5rem] border-gray-100 shadow-sm overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100/50 border-b border-purple-100 px-6 py-4">
              <CardTitle className="text-lg font-bold">Account Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 font-bold mb-1">Role</p>
                  <p className="text-sm font-bold text-gray-900 uppercase">
                    {profileData?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 font-bold mb-1">Account Created</p>
                  <p className="text-sm font-bold text-gray-900">
                    {new Date(profileData?.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              type="submit"
              className="flex-1 rounded-xl py-6 font-bold text-lg shadow-lg shadow-primary-500/30"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Updating...
                </>
              ) : (
                'Update Profile'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
