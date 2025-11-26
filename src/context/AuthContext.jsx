import React, { createContext, useContext, useEffect, useState } from 'react';
import { pb } from '../utils/pocketbaseClient';
import { TwoFactorAuth } from '../utils/twoFactorAuth';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requires2FA, setRequires2FA] = useState(false);
  const [tempUser, setTempUser] = useState(null);

  useEffect(() => {
    setUser(pb.authStore.model);
    setLoading(false);

    pb.authStore.onChange((auth) => {
      setUser(pb.authStore.model);
      setLoading(false);
    });
  }, []);

  const signUp = async (email, password, username) => {
    const data = {
      email: email,
      password: password,
      passwordConfirm: password,
      username: username,
      twoFactorEnabled: false,
      twoFactorSecret: '',
      backupCodes: []
    };

    try {
      const userData = await pb.collection('users').create(data);
      await pb.collection('users').authWithPassword(email, password);
      return { data: userData, error: null };
    } catch (error) {
      return { data: null, error: error };
    }
  };

  const signIn = async (email, password, twoFactorToken = null) => {
    try {
      const userData = await pb.collection('users').authWithPassword(email, password);
      
      // Check if 2FA is enabled
      if (userData.record.twoFactorEnabled && !twoFactorToken) {
        setTempUser(userData);
        setRequires2FA(true);
        return { data: null, error: '2FA_REQUIRED' };
      }

      // Verify 2FA token if provided
      if (userData.record.twoFactorEnabled && twoFactorToken) {
        const isValid = TwoFactorAuth.verifyToken(
          userData.record.twoFactorSecret,
          twoFactorToken
        );

        if (!isValid) {
          // Check backup codes
          const backupCodes = userData.record.backupCodes || [];
          if (!TwoFactorAuth.verifyBackupCode(backupCodes, twoFactorToken)) {
            await pb.authStore.clear();
            return { data: null, error: 'Invalid 2FA code' };
          } else {
            // Update backup codes in database
            await pb.collection('users').update(userData.record.id, {
              backupCodes: backupCodes
            });
          }
        }
      }

      setRequires2FA(false);
      setTempUser(null);
      return { data: userData, error: null };
    } catch (error) {
      return { data: null, error: error };
    }
  };

  const signOut = async () => {
    pb.authStore.clear();
    setRequires2FA(false);
    setTempUser(null);
  };

  const setup2FA = async () => {
    if (!user) return null;

    try {
      const secret = TwoFactorAuth.generateSecret(user.email);
      const qrCode = await TwoFactorAuth.generateQRCode(secret);
      const backupCodes = TwoFactorAuth.generateBackupCodes();

      // Store secret and backup codes temporarily
      return {
        secret: secret.base32,
        qrCode,
        backupCodes
      };
    } catch (error) {
      console.error('Error setting up 2FA:', error);
      return null;
    }
  };

  const enable2FA = async (token, backupCodes) => {
    if (!user) return false;

    try {
      await pb.collection('users').update(user.id, {
        twoFactorEnabled: true,
        twoFactorSecret: token,
        backupCodes: backupCodes
      });
      return true;
    } catch (error) {
      console.error('Error enabling 2FA:', error);
      return false;
    }
  };

  const disable2FA = async () => {
    if (!user) return false;

    try {
      await pb.collection('users').update(user.id, {
        twoFactorEnabled: false,
        twoFactorSecret: '',
        backupCodes: []
      });
      return true;
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      return false;
    }
  };

  const value = {
    user,
    signUp,
    signIn,
    signOut,
    requires2FA,
    tempUser,
    setRequires2FA,
    setup2FA,
    enable2FA,
    disable2FA
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}