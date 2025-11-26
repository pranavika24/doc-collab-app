import React, { createContext, useContext, useEffect, useState } from "react";
import pb from "../utils/pocketbaseClient";
import { TwoFactorAuth } from "../utils/twoFactorAuth";

const AuthContext = createContext();
export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(pb.authStore.model);
  const [loading, setLoading] = useState(true);
  const [requires2FA, setRequires2FA] = useState(false);
  const [tempUser, setTempUser] = useState(null);

  // Correct PocketBase listener
  useEffect(() => {
    setUser(pb.authStore.model);
    setLoading(false);

    const removeListener = pb.authStore.onChange(() => {
      setUser(pb.authStore.model);
      setLoading(false);
    });

    return removeListener;
  }, []);

  // Signup
  const signUp = async (email, password, username) => {
    try {
      const data = {
        email,
        password,
        passwordConfirm: password,
        username,
        twoFactorEnabled: false,
        twoFactorSecret: "",
        backupCodes: [],
      };

      const userData = await pb.collection("users").create(data);
      await pb.collection("users").authWithPassword(email, password);
      return { data: userData, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  // Login
  const signIn = async (email, password, token = null) => {
    try {
      const result = await pb.collection("users").authWithPassword(email, password);
      const userRecord = result.record;

      if (userRecord.twoFactorEnabled && !token) {
        setTempUser(result);
        setRequires2FA(true);
        return { data: null, error: "2FA_REQUIRED" };
      }

      if (userRecord.twoFactorEnabled && token) {
        const valid = TwoFactorAuth.verifyToken(
          userRecord.twoFactorSecret,
          token
        );

        if (!valid) {
          const backup = userRecord.backupCodes || [];
          const backupOK = TwoFactorAuth.verifyBackupCode(backup, token);

          if (!backupOK) {
            pb.authStore.clear();
            return { data: null, error: "Invalid 2FA code" };
          }

          // remove used backup code
          await pb.collection("users").update(userRecord.id, {
            backupCodes: backup,
          });
        }
      }

      setRequires2FA(false);
      setTempUser(null);
      return { data: result, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  };

  const signOut = () => {
    pb.authStore.clear();
    setRequires2FA(false);
    setTempUser(null);
  };

  const setup2FA = async () => {
    try {
      const secret = TwoFactorAuth.generateSecret(user.email);
      const qr = await TwoFactorAuth.generateQRCode(secret);
      const backup = TwoFactorAuth.generateBackupCodes();

      return {
        secret: secret.base32,
        qrCode: qr,
        backupCodes: backup,
      };
    } catch (err) {
      console.log("2FA setup error:", err);
      return null;
    }
  };

  const enable2FA = async (secret, backupCodes) => {
    try {
      await pb.collection("users").update(user.id, {
        twoFactorEnabled: true,
        twoFactorSecret: secret,
        backupCodes,
      });
      return true;
    } catch {
      return false;
    }
  };

  const disable2FA = async () => {
    try {
      await pb.collection("users").update(user.id, {
        twoFactorEnabled: false,
        twoFactorSecret: "",
        backupCodes: [],
      });
      return true;
    } catch {
      return false;
    }
  };

  const value = {
    user,
    loading,
    requires2FA,
    tempUser,
    signUp,
    signIn,
    signOut,
    setup2FA,
    enable2FA,
    disable2FA,
    setRequires2FA,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
