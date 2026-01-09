'use client';

import { useState, useEffect } from 'react';
import { Shield, Smartphone, Mail, QrCode, Check, X, AlertCircle } from 'lucide-react';
import { authAPI } from '@/lib/api';
import { OTPInput } from '@/components/auth/OTPInput';
import Image from 'next/image';

export default function TwoFactorSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [emailOtpEnabled, setEmailOtpEnabled] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  
  // Setup state
  const [showSetup, setShowSetup] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [setupError, setSetupError] = useState('');
  const [verifyError, setVerifyError] = useState('');
  
  // Disable state
  const [showDisable, setShowDisable] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');
  const [disableToken, setDisableToken] = useState('');
  const [disableError, setDisableError] = useState('');

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await authAPI.get2FAStatus();
      setEmailOtpEnabled(response.data.data.emailOtpEnabled);
      setTwoFactorEnabled(response.data.data.twoFactorEnabled);
    } catch (error) {
      console.error('Failed to fetch 2FA status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetup2FA = async () => {
    try {
      setSetupError('');
      const response = await authAPI.setup2FA();
      setQrCode(response.data.data.qrCode);
      setSecret(response.data.data.secret);
      setShowSetup(true);
    } catch (error: any) {
      setSetupError(error.response?.data?.message || 'Failed to setup 2FA');
    }
  };

  const handleVerifyAndEnable = async (token: string) => {
    try {
      setVerifyError('');
      await authAPI.enable2FA(token);
      setTwoFactorEnabled(true);
      setShowSetup(false);
      setQrCode('');
      setSecret('');
    } catch (error: any) {
      setVerifyError(error.response?.data?.message || 'Invalid token');
    }
  };

  const handleDisable2FA = async () => {
    try {
      setDisableError('');
      await authAPI.disable2FA({
        password: disablePassword,
        token: disableToken,
      });
      setTwoFactorEnabled(false);
      setShowDisable(false);
      setDisablePassword('');
      setDisableToken('');
    } catch (error: any) {
      setDisableError(error.response?.data?.message || 'Failed to disable 2FA');
    }
  };

  const handleToggleEmailOTP = async (enabled: boolean) => {
    try {
      await authAPI.toggleEmailOTP(enabled);
      setEmailOtpEnabled(enabled);
    } catch (error) {
      console.error('Failed to toggle email OTP:', error);
    }
  };

  if (loading) {
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
          <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Two-Factor Authentication</h1>
          <p className="mt-2 text-gray-600">Add an extra layer of security to your account</p>
        </div>

        <div className="space-y-6">
          {/* Email OTP Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Email OTP</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Receive a verification code via email every time you log in
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                      emailOtpEnabled 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {emailOtpEnabled ? (
                        <>
                          <Check className="w-3 h-3" /> Enabled
                        </>
                      ) : (
                        <>
                          <X className="w-3 h-3" /> Disabled
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={emailOtpEnabled}
                  onChange={(e) => handleToggleEmailOTP(e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>

          {/* Authenticator App Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-purple-50 rounded-lg">
                <Smartphone className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">Authenticator App</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Use an authenticator app (Google Authenticator, Authy, etc.) to generate verification codes
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                    twoFactorEnabled 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {twoFactorEnabled ? (
                      <>
                        <Check className="w-3 h-3" /> Enabled
                      </>
                    ) : (
                      <>
                        <X className="w-3 h-3" /> Not Configured
                      </>
                    )}
                  </span>
                </div>

                <div className="mt-4">
                  {!twoFactorEnabled ? (
                    <button
                      onClick={handleSetup2FA}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm flex items-center gap-2"
                    >
                      <QrCode className="w-4 h-4" />
                      Set Up Authenticator
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowDisable(true)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
                    >
                      Disable Authenticator
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Setup Modal */}
        {showSetup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Setup Authenticator</h2>
                <p className="text-sm text-gray-600 mt-2">Scan this QR code with your authenticator app</p>
              </div>

              {setupError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{setupError}</p>
                </div>
              )}

              {qrCode && (
                <div className="mb-6">
                  <div className="flex justify-center mb-4">
                    <Image src={qrCode} alt="QR Code" width={200} height={200} className="rounded-lg border-2 border-gray-200" />
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 text-center mb-1">Or enter this code manually:</p>
                    <p className="text-sm font-mono text-center text-gray-900 break-all select-all">{secret}</p>
                  </div>
                </div>
              )}

              <div className="mb-4">
                <p className="text-sm text-gray-700 mb-3 font-medium text-center">
                  Enter the 6-digit code from your app
                </p>
                <OTPInput
                  length={6}
                  onComplete={handleVerifyAndEnable}
                  error={verifyError}
                />
              </div>

              <button
                onClick={() => {
                  setShowSetup(false);
                  setSetupError('');
                  setVerifyError('');
                }}
                className="w-full py-2 text-gray-600 hover:text-gray-900 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Disable Modal */}
        {showDisable && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Disable Authenticator</h2>
                <p className="text-sm text-gray-600 mt-2">Enter your password and a verification code to disable</p>
              </div>

              {disableError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{disableError}</p>
                </div>
              )}

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    value={disablePassword}
                    onChange={(e) => setDisablePassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter your password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Authenticator Code</label>
                  <input
                    type="text"
                    value={disableToken}
                    onChange={(e) => setDisableToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center text-2xl tracking-wider font-mono"
                    placeholder="000000"
                    maxLength={6}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDisable(false);
                    setDisablePassword('');
                    setDisableToken('');
                    setDisableError('');
                  }}
                  className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDisable2FA}
                  disabled={!disablePassword || disableToken.length !== 6}
                  className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Disable
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
