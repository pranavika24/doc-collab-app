import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { TwoFactorAuth } from '../utils/twoFactorAuth';

function TwoFactorSetup({ onComplete, onCancel }) {
  const { user, setup2FA, enable2FA } = useAuth();
  const [step, setStep] = useState(1);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoCode, setDemoCode] = useState('');

  useEffect(() => {
    initialize2FASetup();
  }, []);

  const initialize2FASetup = async () => {
    setLoading(true);
    const setupData = await setup2FA();
    if (setupData) {
      setQrCode(setupData.qrCode);
      setSecret(setupData.secret);
      setBackupCodes(setupData.backupCodes);
      
      // For demo purposes, show the expected code
      const demoCode = TwoFactorAuth.generateDemoCode(setupData.secret);
      setDemoCode(demoCode);
    }
    setLoading(false);
  };

  const verifyAndEnable = async () => {
    if (!verificationCode.trim()) {
      setError('Please enter the verification code');
      return;
    }

    setLoading(true);
    setError('');

    const isValid = TwoFactorAuth.verifyToken(secret, verificationCode);
    
    if (isValid) {
      const success = await enable2FA(secret, backupCodes);
      if (success) {
        setStep(3);
      } else {
        setError('Failed to enable 2FA. Please try again.');
      }
    } else {
      setError(`Invalid verification code. For demo, try: ${demoCode}`);
    }
    setLoading(false);
  };

  const copyBackupCodes = () => {
    const codesText = backupCodes.join('\n');
    navigator.clipboard.writeText(codesText);
    alert('Backup codes copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Setting up 2FA...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Two-Factor Authentication</h2>

        {step === 1 && (
          <div className="space-y-4">
            <p className="text-gray-600">
              Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.)
            </p>
            
            <div className="text-center">
              <img src={qrCode} alt="QR Code" className="mx-auto mb-4 border rounded-lg" />
              <p className="text-sm text-gray-500 mb-2">Or enter this code manually:</p>
              <code className="bg-gray-100 px-3 py-2 rounded text-sm font-mono block mx-auto w-fit">
                {secret}
              </code>
              
              {/* Demo info - remove in production */}
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-yellow-800">
                  <strong>Demo:</strong> Use code <code className="font-bold">{demoCode}</code> for verification
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={onCancel}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => setStep(2)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-gray-600">
              Enter the 6-digit code from your authenticator app to verify setup.
            </p>

            <div>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="w-full px-3 py-2 border border-gray-300 rounded text-center text-xl font-mono tracking-widest focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={6}
              />
              {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
            </div>

            <div className="flex justify-between space-x-3 pt-4">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
              >
                Back
              </button>
              <button
                onClick={verifyAndEnable}
                disabled={loading || verificationCode.length !== 6}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify & Enable'}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="text-green-600 mr-3">✓</div>
                <p className="text-green-800 font-medium">Two-Factor Authentication Enabled!</p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">Backup Codes</h3>
              <p className="text-yellow-700 text-sm mb-3">
                Save these backup codes in a secure place. You can use them to access your account if you lose your authenticator app.
              </p>
              
              <div className="bg-white rounded border border-yellow-300 p-3 mb-3">
                {backupCodes.map((code, index) => (
                  <div key={index} className="font-mono text-sm text-center py-1">
                    {code}
                  </div>
                ))}
              </div>

              <button
                onClick={copyBackupCodes}
                className="w-full bg-yellow-600 text-white py-2 px-3 rounded text-sm hover:bg-yellow-700 transition"
              >
                Copy Backup Codes
              </button>
            </div>

            <div className="flex justify-end">
              <button
                onClick={onComplete}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                Complete Setup
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TwoFactorSetup;