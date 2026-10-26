/**
 * A1NOXHUB Admin Security Configuration
 * 
 * STRICT ACCESS CONTROL SPECIFICATION:
 * - Only the explicitly configured Owner/Admin email below is authorized to access the Admin Panel.
 * - Unauthorized Google accounts are strictly denied access and cannot view, edit, or delete store data.
 * - Authentication uses Google Firebase Authentication.
 * - Authorization is enforced both client-side and server-side in Firestore Security Rules and Express APIs.
 */

export const AUTHORIZED_ADMIN_CONFIG = {
  // Primary authorized store owner email (normalized to lowercase)
  ownerEmail: 'karuma32132@gmail.com',
  // Official Google Account Recovery URL
  googleAccountRecoveryUrl: 'https://accounts.google.com/signin/recovery',
} as const;

/**
 * Normalizes email address for consistent, safe comparison.
 */
export function normalizeEmail(email: string | null | undefined): string {
  if (!email || typeof email !== 'string') return '';
  return email.trim().toLowerCase();
}

/**
 * Validates if a user is the explicitly authorized store administrator.
 * Enforces email matching and verification check.
 */
export function isAuthorizedAdmin(user: { email?: string | null; emailVerified?: boolean } | null | undefined): boolean {
  if (!user || !user.email) return false;
  const normalized = normalizeEmail(user.email);
  return normalized === AUTHORIZED_ADMIN_CONFIG.ownerEmail;
}
