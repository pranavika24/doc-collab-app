// src/utils/twoFactorAuth.js - Simple 2FA implementation
import QRCode from 'qrcode';

export class TwoFactorAuth {
  // Generate a simple secret (base32 string)
  static generateSecret(email) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return {
      base32: secret,
      otpauth_url: `otpauth://totp/DocCollab:${encodeURIComponent(email)}?secret=${secret}&issuer=DocCollab`
    };
  }

  // Generate QR code
  static async generateQRCode(secret) {
    try {
      return await QRCode.toDataURL(secret.otpauth_url);
    } catch (error) {
      console.error('Error generating QR code:', error);
      return '';
    }
  }

  // Simple TOTP verification (for demo purposes)
  static verifyToken(secret, token) {
    // For demo, accept any 6-digit code that matches our simple algorithm
    // In production, you'd use a proper TOTP implementation
    if (!token || token.length !== 6 || !/^\d+$/.test(token)) {
      return false;
    }

    // Simple demo verification - in real app, use proper TOTP
    // This is just for demonstration
    const expectedCode = this.generateDemoCode(secret);
    return token === expectedCode;
  }

  // Demo code generation (replace with proper TOTP in production)
  static generateDemoCode(secret) {
    // Simple demo - use first 6 chars of secret as "code"
    // In production, use proper TOTP algorithm
    const timestamp = Math.floor(Date.now() / 30000); // 30-second intervals
    const code = String(timestamp * 12345 % 1000000).padStart(6, '0');
    return code;
  }

  // Generate backup codes
  static generateBackupCodes(count = 8) {
    const codes = [];
    for (let i = 0; i < count; i++) {
      // Generate 8-character backup codes
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  // Verify backup code
  static verifyBackupCode(backupCodes, code) {
    if (!backupCodes || !Array.isArray(backupCodes)) return false;
    
    const index = backupCodes.indexOf(code);
    if (index > -1) {
      // Remove used backup code
      backupCodes.splice(index, 1);
      return true;
    }
    return false;
  }
}