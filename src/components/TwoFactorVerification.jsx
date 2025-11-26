import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function TwoFactorVerification() {
  const { signIn, tempUser, setRequires2FA } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [useBackupCode, setUseBackupCode] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Please enter your verification code');
      return;
    }

    setLoading(true);
    setError('');

    // For demo purposes, accept any 6-digit code or backup code
    if ((!useBackupCode && code.length === 6 && /^\d+$/.test(code)) || 
        (useBackupCode && code.trim() !== '')) {
      // Simulate successful verification
      setTimeout(() => {
        setRequires2FA(false);
        setLoading(false);
      }, 1000);
    } else {
      setError(useBackupCode ? 'Invalid backup code' : 'Please enter a valid 6-digit code');
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setRequires2FA(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="bg-blue-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Two-Factor Authentication</h2>
          <p className="text-gray-600 mt-2">
            {useBackupCode ? 'Enter your backup code' : 'Enter the 6-digit code from your authenticator app'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {useBackupCode ? 'Backup Code' : 'Verification Code'}
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => 
                useBackupCode 
                  ? setCode(e.target.value.toUpperCase())
                  : setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
              }
              placeholder={useBackupCode ? "Enter 8-character backup code" : "000000"}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-xl font-mono tracking-widest focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 font-medium transition disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Verifying...
              </>
            ) : (
              'Verify & Continue'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setUseBackupCode(!useBackupCode)}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            {useBackupCode ? 'Use authenticator app' : 'Use backup code'}
          </button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-blue-800 text-sm font-medium">Demo Information</p>
              <p className="text-blue-700 text-xs mt-1">
                For demonstration purposes, you can enter any 6-digit number for verification code, 
                or any text for backup code.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={handleCancel}
            className="text-gray-600 hover:text-gray-800 text-sm"
          >
            ← Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default TwoFactorVerification;