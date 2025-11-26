// src/utils/twoFactorAuth.js - Browser-safe 2FA implementation
import qrcode from "qrcode-generator";

export class TwoFactorAuth {
  // Generate simple secret
  static generateSecret(email) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    let secret = "";

    for (let i = 0; i < 32; i++) {
      secret += chars[Math.floor(Math.random() * chars.length)];
    }

    return {
      base32: secret,
      otpauth_url: `otpauth://totp/DocCollab:${encodeURIComponent(
        email
      )}?secret=${secret}&issuer=DocCollab`
    };
  }

  // Generate QR code that works in browser + Vercel
  static async generateQRCode(secret) {
    try {
      const qr = qrcode(0, "L");
      qr.addData(secret.otpauth_url);
      qr.make();
      return qr.createDataURL();
    } catch (error) {
      console.error("QR generation error:", error);
      return "";
    }
  }

  // Simple verification (demo only)
  static verifyToken(secret, token) {
    if (!token || token.length !== 6 || !/^\d+$/.test(token)) return false;

    const expected = this.generateDemoCode(secret);
    return token === expected;
  }

  static generateDemoCode(secret) {
    const time = Math.floor(Date.now() / 30000);
    return String((time * 12345) % 1000000).padStart(6, "0");
  }

  // Backup codes
  static generateBackupCodes(count = 8) {
    const list = [];
    for (let i = 0; i < count; i++) {
      list.push(Math.random().toString(36).substr(2, 8).toUpperCase());
    }
    return list;
  }

  static verifyBackupCode(list, code) {
    const index = list.indexOf(code);
    if (index === -1) return false;
    list.splice(index, 1);
    return true;
  }
}
