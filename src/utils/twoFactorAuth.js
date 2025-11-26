// src/utils/twoFactorAuth.js - Browser-safe 2FA implementation
import qrcode from "qrcode-generator";

export class TwoFactorAuth {
  // Generate a simple 32-char base32 secret
  static generateSecret(email) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    let secret = "";

    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return {
      base32: secret,
      otpauth_url: `otpauth://totp/DocCollab:${encodeURIComponent(
        email
      )}?secret=${secret}&issuer=DocCollab`,
    };
  }

  // Generate a QR Code (Browser + Vercel compatible)
  static async generateQRCode(secret) {
    try {
      const qr = qrcode(0, "L");
      qr.addData(secret.otpauth_url);
      qr.make();

      // returns base64 PNG image
      return qr.createDataURL();
    } catch (error) {
      console.error("QR generation error:", error);
      return "";
    }
  }

  // Simple demo verification (NOT real TOTP)
  static verifyToken(secret, token) {
    if (!token || token.length !== 6 || !/^\d+$/.test(token)) {
      return false;
    }

    const expected = this.generateDemoCode(secret);
    return token === expected;
  }

  // Simple rotating code — demo only
  static generateDemoCode(secret) {
    const time = Math.floor(Date.now() / 30000); // 30 sec window
    const code = String((time * 12345) % 1000000).padStart(6, "0");
    return code;
  }

  // Generate backup codes
  static generateBackupCodes(count = 8) {
    const codes = [];
    for (let i = 0; i < count; i++) {
      codes.push(Math.random().toString(36).slice(2, 10).toUpperCase());
    }
    return codes;
  }

  // Verify and remove used backup code
  static verifyBackupCode(list, code) {
    const index = list.indexOf(code);
    if (index === -1) return false;
    list.splice(index, 1);
    return true;
  }
}
