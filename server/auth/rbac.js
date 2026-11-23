import crypto from 'node:crypto';

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  EDITOR: 'editor',
  SEO_MANAGER: 'seo_manager',
  REVIEWER: 'reviewer',
};

export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: ['*'],
  [ROLES.EDITOR]: [
    'content:read',
    'content:edit',
    'content:publish',
    'content:rollback',
    'content:schedule',
    'seo:manage',
    'redirects:*',
    'media:*',
    'pages:*',
    'leads:*',
    'audit:read',
  ],
  [ROLES.SEO_MANAGER]: [
    'content:read',
    'seo:manage',
    'redirects:*',
    'media:read',
    'pages:read',
  ],
  [ROLES.REVIEWER]: [
    'content:read',
    'content:preview',
    'pages:read',
  ],
};

export function canUserPerform(role, permission) {
  if (!role) return false;
  if (role === ROLES.SUPER_ADMIN) return true;
  const perms = ROLE_PERMISSIONS[role] || [];
  if (perms.includes('*')) return true;
  if (perms.includes(permission)) return true;
  const [scope] = permission.split(':');
  if (perms.includes(`${scope}:*`)) return true;
  return false;
}

export function hashPassword(password, salt) {
  const s = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, s, 64).toString('hex');
  return { salt: s, hash };
}

export function verifyPassword(password, salt, expectedHash) {
  try {
    const { hash } = hashPassword(password, salt);
    const a = Buffer.from(hash, 'hex');
    const b = Buffer.from(expectedHash, 'hex');
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function signToken(user, secret) {
  const payload = Buffer.from(
    JSON.stringify({
      sub: user.username,
      uid: user.id,
      role: user.role || ROLES.EDITOR,
      name: user.displayName || user.username,
      iat: Date.now(),
      exp: Date.now() + TOKEN_TTL_MS,
    }),
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

export function verifyToken(token, secret) {
  if (!token || !token.includes('.')) return null;
  const [payload, sig] = token.split('.');
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
    if (!data.exp || Date.now() > data.exp) return null;
    return data;
  } catch {
    return null;
  }
}

// In-memory IP rate limiter for login
const loginAttempts = new Map();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 mins
const MAX_ATTEMPTS = 10;

export function checkLoginRateLimit(ip) {
  const now = Date.now();
  const record = loginAttempts.get(ip) || { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
  if (now > record.resetAt) {
    record.count = 0;
    record.resetAt = now + RATE_LIMIT_WINDOW_MS;
  }
  if (record.count >= MAX_ATTEMPTS) {
    const waitSec = Math.ceil((record.resetAt - now) / 1000);
    return { allowed: false, waitSec };
  }
  return { allowed: true };
}

export function recordFailedLogin(ip) {
  const now = Date.now();
  const record = loginAttempts.get(ip) || { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
  if (now > record.resetAt) {
    record.count = 1;
    record.resetAt = now + RATE_LIMIT_WINDOW_MS;
  } else {
    record.count += 1;
  }
  loginAttempts.set(ip, record);
}

export function recordSuccessfulLogin(ip) {
  loginAttempts.delete(ip);
}
