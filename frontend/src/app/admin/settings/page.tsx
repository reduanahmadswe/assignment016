'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Save,
  Globe,
  Mail,
  CreditCard,
  Bell,
  CheckCircle,
  AlertCircle,
  Upload,
  Image as ImageIcon,
  Building,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  Settings as SettingsIcon,
  ShieldCheck,
  Zap,
  DollarSign
} from 'lucide-react';
import { api } from '@/lib/api';
import { Button, Input, Loading, Alert, Badge } from '@/components/ui';

interface SiteSettings {
  siteName: string;
  siteDescription: string;
  siteLogo: string | null;
  siteFavicon: string | null;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  socialFacebook: string;
  socialTwitter: string;
  socialLinkedin: string;
  socialInstagram: string;
  socialYoutube: string;
}

interface PaymentSettings {
  uddoktapayEnabled: boolean;
  uddoktapayApiKey: string;
  uddoktapayApiUrl: string;
  platformFeePercentage: number;
  minimumWithdrawal: number;
  currency: string;
}

interface EmailSettings {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  fromEmail: string;
  fromName: string;
  emailFooter: string;
}

interface NotificationSettings {
  emailOnRegistration: boolean;
  emailOnPayment: boolean;
  emailOnCertificate: boolean;
  emailEventReminder: boolean;
  reminderHoursBefore: number;
}

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('general');
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // General Settings State
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    siteName: '',
    siteDescription: '',
    siteLogo: null,
    siteFavicon: null,
    contactEmail: '',
    contactPhone: '',
    contactAddress: '',
    socialFacebook: '',
    socialTwitter: '',
    socialLinkedin: '',
    socialInstagram: '',
    socialYoutube: '',
  });

  // Payment Settings State
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    uddoktapayEnabled: true,
    uddoktapayApiKey: '',
    uddoktapayApiUrl: '',
    platformFeePercentage: 5,
    minimumWithdrawal: 500,
    currency: 'BDT',
  });

  // Email Settings State
  const [emailSettings, setEmailSettings] = useState<EmailSettings>({
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    fromEmail: '',
    fromName: '',
    emailFooter: '',
  });

  // Notification Settings State
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailOnRegistration: true,
    emailOnPayment: true,
    emailOnCertificate: true,
    emailEventReminder: true,
    reminderHoursBefore: 24,
  });

  const { isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const res = await api.get('/admin/settings');
      if (res.data) {
        setSiteSettings(res.data.site || siteSettings);
        setPaymentSettings(res.data.payment || paymentSettings);
        setEmailSettings(res.data.email || emailSettings);
        setNotificationSettings(res.data.notifications || notificationSettings);
      }
      return res.data;
    },
  });

  const saveSiteMutation = useMutation({
    mutationFn: (data: FormData) => api.put('/admin/settings/site', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    onSuccess: () => {
      setSuccess('Site settings saved successfully');
      setTimeout(() => setSuccess(null), 3000);
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
    },
    onError: () => setError('Failed to save site settings'),
  });

  const savePaymentMutation = useMutation({
    mutationFn: (data: PaymentSettings) => api.put('/admin/settings/payment', data),
    onSuccess: () => {
      setSuccess('Payment settings saved successfully');
      setTimeout(() => setSuccess(null), 3000);
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
    },
    onError: () => setError('Failed to save payment settings'),
  });

  const saveEmailMutation = useMutation({
    mutationFn: (data: EmailSettings) => api.put('/admin/settings/email', data),
    onSuccess: () => {
      setSuccess('Email settings saved successfully');
      setTimeout(() => setSuccess(null), 3000);
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
    },
    onError: () => setError('Failed to save email settings'),
  });

  const saveNotificationMutation = useMutation({
    mutationFn: (data: NotificationSettings) => api.put('/admin/settings/notifications', data),
    onSuccess: () => {
      setSuccess('Notification settings saved successfully');
      setTimeout(() => setSuccess(null), 3000);
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
    },
    onError: () => setError('Failed to save notification settings'),
  });

  const testEmailMutation = useMutation({
    mutationFn: () => api.post('/admin/settings/test-email'),
    onSuccess: () => {
      setSuccess('Test email sent successfully');
      setTimeout(() => setSuccess(null), 3000);
    },
    onError: () => setError('Failed to send test email'),
  });

  const handleSaveSite = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);

    const formData = new FormData();
    Object.entries(siteSettings).forEach(([key, value]) => {
      if (value !== null) {
        formData.append(key, value.toString());
      }
    });

    saveSiteMutation.mutate(formData);
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);
    savePaymentMutation.mutate(paymentSettings);
  };

  const handleSaveEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);
    saveEmailMutation.mutate(emailSettings);
  };

  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);
    saveNotificationMutation.mutate(notificationSettings);
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Globe, desc: 'Site identity & social links' },
    { id: 'payment', label: 'Payment', icon: CreditCard, desc: 'Gateways & fees' },
    { id: 'email', label: 'Email', icon: Mail, desc: 'SMTP & templates' },
    { id: 'notifications', label: 'Notifications', icon: Bell, desc: 'Alert preferences' },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loading text="Loading platform settings..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-[1.5rem] border border-gray-100 shadow-sm mt-10">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
            Platform Settings
          </h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">Configure and manage your system preferences.</p>
        </div>
      </div>

      {/* Alerts */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center shadow-sm animate-fade-in text-sm font-medium">
          <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center shadow-sm animate-fade-in text-sm font-medium">
          <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Sidebar Navigation */}
        <div className="w-full lg:w-64 flex-shrink-0 space-y-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 flex lg:block gap-2 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 lg:w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${isActive
                  ? 'bg-white shadow-md text-[#004aad] ring-1 ring-gray-100'
                  : 'text-gray-500 hover:bg-white hover:shadow-sm hover:text-gray-700'
                  }`}
              >
                <div className={`p-2 rounded-lg ${isActive ? 'bg-blue-50' : 'bg-gray-100'}`}>
                  <Icon className={`w-5 h-5 ${isActive ? 'text-[#004aad]' : 'text-gray-500'}`} />
                </div>
                <div className="hidden sm:block">
                  <span className="block font-bold text-sm sm:text-base">{tab.label}</span>
                  <span className="text-xs opacity-75 hidden lg:block">{tab.desc}</span>
                </div>
                <span className="block sm:hidden font-bold text-sm">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          {/* General Settings */}
          {activeTab === 'general' && (
            <form onSubmit={handleSaveSite} className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 p-4 sm:p-8 space-y-8 animate-fade-in">
              <div className="border-b border-gray-100 pb-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900">Site Information</h2>
                <p className="text-sm text-gray-500 mt-1">Basic details about your platform.</p>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:gap-8">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Site Logo
                  </label>
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    <div className="w-24 h-24 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden relative group shrink-0">
                      {siteSettings.siteLogo ? (
                        <img src={siteSettings.siteLogo} alt="Logo" className="w-full h-full object-contain p-2" />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-gray-300" />
                      )}
                    </div>
                    <div className="flex-1 text-center sm:text-left w-full sm:w-auto">
                      <label className="inline-flex w-full sm:w-auto justify-center items-center px-4 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm text-sm font-bold text-gray-700 hover:bg-gray-50 focus:outline-none cursor-pointer transition-colors">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload New Logo
                        <input type="file" accept="image/*" className="hidden" />
                      </label>
                      <p className="text-xs text-gray-500 mt-2 font-medium">Recommended size: 512x512px. Max size: 2MB.</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Input
                      label="Site Name"
                      value={siteSettings.siteName}
                      onChange={(e) => setSiteSettings({ ...siteSettings, siteName: e.target.value })}
                      placeholder="ORIYET"
                      className="font-bold"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">
                      Site Description
                    </label>
                    <textarea
                      value={siteSettings.siteDescription}
                      onChange={(e) => setSiteSettings({ ...siteSettings, siteDescription: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#004aad]/20 focus:border-[#004aad] transition-all outline-none resize-none text-sm bg-gray-50/50 focus:bg-white"
                      placeholder="A brief description of your platform..."
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-8 pb-2">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Building className="w-5 h-5 text-gray-400" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Contact Email"
                    type="email"
                    value={siteSettings.contactEmail}
                    onChange={(e) => setSiteSettings({ ...siteSettings, contactEmail: e.target.value })}
                    placeholder="contact@oriyet.com"
                    leftIcon={<Mail className="w-4 h-4 text-gray-400" />}
                  />
                  <Input
                    label="Contact Phone"
                    value={siteSettings.contactPhone}
                    onChange={(e) => setSiteSettings({ ...siteSettings, contactPhone: e.target.value })}
                    placeholder="+880 1234 567890"
                  />
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">
                      Contact Address
                    </label>
                    <textarea
                      value={siteSettings.contactAddress}
                      onChange={(e) => setSiteSettings({ ...siteSettings, contactAddress: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#004aad]/20 focus:border-[#004aad] transition-all outline-none resize-none text-sm bg-gray-50/50 focus:bg-white"
                      placeholder="Your office address..."
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-8 pb-2">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-gray-400" />
                  Social Media Links
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Facebook"
                    value={siteSettings.socialFacebook}
                    onChange={(e) => setSiteSettings({ ...siteSettings, socialFacebook: e.target.value })}
                    placeholder="https://facebook.com/..."
                    leftIcon={<Facebook className="w-4 h-4 text-blue-600" />}
                  />
                  <Input
                    label="Twitter"
                    value={siteSettings.socialTwitter}
                    onChange={(e) => setSiteSettings({ ...siteSettings, socialTwitter: e.target.value })}
                    placeholder="https://twitter.com/..."
                    leftIcon={<Twitter className="w-4 h-4 text-sky-500" />}
                  />
                  <Input
                    label="LinkedIn"
                    value={siteSettings.socialLinkedin}
                    onChange={(e) => setSiteSettings({ ...siteSettings, socialLinkedin: e.target.value })}
                    placeholder="https://linkedin.com/company/..."
                    leftIcon={<Linkedin className="w-4 h-4 text-blue-700" />}
                  />
                  <Input
                    label="Instagram"
                    value={siteSettings.socialInstagram}
                    onChange={(e) => setSiteSettings({ ...siteSettings, socialInstagram: e.target.value })}
                    placeholder="https://instagram.com/..."
                    leftIcon={<Instagram className="w-4 h-4 text-pink-600" />}
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-end gap-3">
                <Button type="button" variant="outline" className="w-full sm:w-auto h-12" onClick={() => { }}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={saveSiteMutation.isPending} className="shadow-lg shadow-blue-900/20 bg-[#004aad] hover:bg-[#003366] text-white font-bold h-12 w-full sm:w-auto rounded-xl px-8">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </form>
          )}

          {/* Payment Settings */}
          {activeTab === 'payment' && (
            <form onSubmit={handleSavePayment} className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 p-4 sm:p-8 space-y-8 animate-fade-in">
              <div className="border-b border-gray-100 pb-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900">Payment Gateway</h2>
                <p className="text-sm text-gray-500 mt-1">Configure automated payment processing.</p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 block">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-xl shadow-sm text-blue-600 shrink-0">
                      <Zap className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">UddoktaPay Integration</h3>
                      <p className="text-sm text-blue-700 mt-1 max-w-sm">Primary payment gateway for local transactions.</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer mt-2 sm:mt-0">
                    <input
                      type="checkbox"
                      checked={paymentSettings.uddoktapayEnabled}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, uddoktapayEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {paymentSettings.uddoktapayEnabled && (
                  <div className="mt-8 space-y-5 animate-in slide-in-from-top-4 duration-300">
                    <Input
                      label="API Key"
                      type="password"
                      value={paymentSettings.uddoktapayApiKey}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, uddoktapayApiKey: e.target.value })}
                      placeholder="UDDOKTA_KEY_..."
                      className="bg-white border-blue-100 focus:border-blue-300"
                    />
                    <Input
                      label="API URL"
                      value={paymentSettings.uddoktapayApiUrl}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, uddoktapayApiUrl: e.target.value })}
                      placeholder="https://sandbox.uddoktapay.com/api/checkout-v2"
                      className="bg-white border-blue-100 focus:border-blue-300"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-gray-400" />
                  Fees & Currency
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Platform Fee (%)"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={isNaN(paymentSettings.platformFeePercentage) ? '' : paymentSettings.platformFeePercentage}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, platformFeePercentage: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
                    helperText="Percentage deducted from each transaction."
                  />
                  <Input
                    label="Currency Code"
                    value={paymentSettings.currency}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, currency: e.target.value })}
                    placeholder="BDT"
                    className="uppercase font-mono"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 flex justify-end">
                <Button type="submit" isLoading={savePaymentMutation.isPending} className="shadow-lg shadow-blue-900/20 bg-[#004aad] hover:bg-[#003366] text-white font-bold h-12 w-full sm:w-auto rounded-xl px-8">
                  <Save className="w-4 h-4 mr-2" />
                  Save Configuration
                </Button>
              </div>
            </form>
          )}

          {/* Email Settings */}
          {activeTab === 'email' && (
            <form onSubmit={handleSaveEmail} className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 p-4 sm:p-8 space-y-8 animate-fade-in">
              <div className="border-b border-gray-100 pb-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900">Email Configuration</h2>
                <p className="text-sm text-gray-500 mt-1">Configure SMTP settings for outgoing emails.</p>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="bg-gray-50 p-6 sm:p-8 rounded-2xl border border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2 text-lg">
                    <Mail className="w-5 h-5 text-gray-500" />
                    SMTP Server Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <Input
                        label="SMTP Host"
                        value={emailSettings.smtpHost}
                        onChange={(e) => setEmailSettings({ ...emailSettings, smtpHost: e.target.value })}
                        placeholder="smtp.gmail.com"
                        className="bg-white"
                      />
                    </div>
                    <Input
                      label="SMTP Port"
                      type="number"
                      value={emailSettings.smtpPort}
                      onChange={(e) => setEmailSettings({ ...emailSettings, smtpPort: parseInt(e.target.value) })}
                      placeholder="587"
                      className="bg-white"
                    />
                    <Input
                      label="SMTP Username"
                      value={emailSettings.smtpUser}
                      onChange={(e) => setEmailSettings({ ...emailSettings, smtpUser: e.target.value })}
                      placeholder="email@example.com"
                      className="bg-white"
                    />
                    <div className="md:col-span-2">
                      <Input
                        label="SMTP Password"
                        type="password"
                        value={emailSettings.smtpPassword}
                        onChange={(e) => setEmailSettings({ ...emailSettings, smtpPassword: e.target.value })}
                        placeholder="********"
                        className="bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6 pt-2">
                  <h3 className="font-bold text-gray-900 mb-4 text-lg">Sender Profile</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="From Email"
                      type="email"
                      value={emailSettings.fromEmail}
                      onChange={(e) => setEmailSettings({ ...emailSettings, fromEmail: e.target.value })}
                      placeholder="noreply@oriyet.com"
                    />
                    <Input
                      label="From Name"
                      value={emailSettings.fromName}
                      onChange={(e) => setEmailSettings({ ...emailSettings, fromName: e.target.value })}
                      placeholder="ORIYET Team"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">
                      Email Footer Text
                    </label>
                    <textarea
                      value={emailSettings.emailFooter}
                      onChange={(e) => setEmailSettings({ ...emailSettings, emailFooter: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#004aad]/20 focus:border-[#004aad] transition-all outline-none resize-none text-sm"
                      placeholder="e.g. Sent with love by ORIYET"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => testEmailMutation.mutate()}
                  isLoading={testEmailMutation.isPending}
                  className="w-full sm:w-auto h-12 rounded-xl"
                >
                  Send Test Email
                </Button>
                <Button type="submit" isLoading={saveEmailMutation.isPending} className="shadow-lg shadow-blue-900/20 bg-[#004aad] hover:bg-[#003366] text-white font-bold h-12 w-full sm:w-auto rounded-xl px-8">
                  <Save className="w-4 h-4 mr-2" />
                  Save Configuration
                </Button>
              </div>
            </form>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <form onSubmit={handleSaveNotifications} className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 p-4 sm:p-8 space-y-8 animate-fade-in">
              <div className="border-b border-gray-100 pb-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900">Notification Preferences</h2>
                <p className="text-sm text-gray-500 mt-1">Control when and how users receive automated emails.</p>
              </div>

              <div className="space-y-4">
                {[
                  { id: 'emailOnRegistration', label: 'Registration Confirmation', desc: 'Send confirmation email immediately upon successful event registration.', key: 'emailOnRegistration' },
                  { id: 'emailOnPayment', label: 'Payment Receipt', desc: 'Send digital receipt when a payment transaction is completed.', key: 'emailOnPayment' },
                  { id: 'emailOnCertificate', label: 'Certificate Delivery', desc: 'Notify users via email when their event certificate is ready for download.', key: 'emailOnCertificate' },
                  { id: 'emailEventReminder', label: 'Event Reminders', desc: 'Send automated reminders to attendees before the event starts.', key: 'emailEventReminder' },
                ].map((item) => (
                  <div key={item.id} className="flex items-start p-5 rounded-2xl border border-gray-100 hover:border-blue-100 hover:bg-blue-50/30 transition-all duration-300">
                    <div className="flex w-full items-start justify-between gap-4">
                      <div className="pointer-events-none">
                        <label htmlFor={item.id} className="font-bold text-gray-900 text-lg">
                          {item.label}
                        </label>
                        <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{item.desc}</p>
                      </div>
                      <div className="flex items-center h-6 shrink-0 mt-1">
                        <input
                          id={item.id}
                          type="checkbox"
                          checked={(notificationSettings as any)[item.key]}
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, [item.key]: e.target.checked })}
                          className="w-6 h-6 rounded border-gray-300 text-[#004aad] focus:ring-[#004aad] transition-colors cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {notificationSettings.emailEventReminder && (
                <div className="mt-4 p-6 bg-blue-50/50 rounded-2xl border border-blue-100 animate-in fade-in slide-in-from-top-2">
                  <h4 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Reminder Schedule
                  </h4>
                  <div className="max-w-xs">
                    <Input
                      label="Hours Before Event"
                      type="number"
                      min="1"
                      max="168"
                      value={notificationSettings.reminderHoursBefore}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, reminderHoursBefore: parseInt(e.target.value) })}
                      helperText="Example: 24 for 1 day before"
                      className="bg-white border-blue-200 focus:border-blue-400"
                    />
                  </div>
                </div>
              )}

              <div className="pt-6 border-t border-gray-100 flex justify-end">
                <Button type="submit" isLoading={saveNotificationMutation.isPending} className="shadow-lg shadow-blue-900/20 bg-[#004aad] hover:bg-[#003366] text-white font-bold h-12 w-full sm:w-auto rounded-xl px-8">
                  <Save className="w-4 h-4 mr-2" />
                  Save Preferences
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
