/**
 * Simple in-memory rate limiter for login attempts
 * Tracks attempts by identifier (email or IP)
 */

const loginAttempts = new Map();

// Configuration
const MAX_ATTEMPTS = 5; // Maximum login attempts
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes in milliseconds
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes lockout

/**
 * Check if login attempt is allowed
 * @param {string} identifier - Email or IP address
 * @returns {{ allowed: boolean, remainingAttempts: number, resetTime: number | null }}
 */
export function checkRateLimit(identifier) {
  const now = Date.now();
  const record = loginAttempts.get(identifier);

  // No previous attempts
  if (!record) {
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS - 1, resetTime: null };
  }

  // Check if lockout period has expired
  if (record.lockedUntil && now < record.lockedUntil) {
    return {
      allowed: false,
      remainingAttempts: 0,
      resetTime: record.lockedUntil,
    };
  }

  // Check if window has expired
  if (now - record.firstAttempt > WINDOW_MS) {
    // Reset the record
    loginAttempts.delete(identifier);
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS - 1, resetTime: null };
  }

  // Check if max attempts reached
  if (record.attempts >= MAX_ATTEMPTS) {
    const lockedUntil = record.firstAttempt + LOCKOUT_MS;
    loginAttempts.set(identifier, { ...record, lockedUntil });
    return {
      allowed: false,
      remainingAttempts: 0,
      resetTime: lockedUntil,
    };
  }

  return {
    allowed: true,
    remainingAttempts: MAX_ATTEMPTS - record.attempts - 1,
    resetTime: null,
  };
}

/**
 * Record a failed login attempt
 * @param {string} identifier - Email or IP address
 */
export function recordFailedAttempt(identifier) {
  const now = Date.now();
  const record = loginAttempts.get(identifier);

  if (!record || now - record.firstAttempt > WINDOW_MS) {
    // First attempt or window expired
    loginAttempts.set(identifier, {
      attempts: 1,
      firstAttempt: now,
      lockedUntil: null,
    });
  } else {
    // Increment attempts
    loginAttempts.set(identifier, {
      ...record,
      attempts: record.attempts + 1,
    });
  }
}

/**
 * Clear attempts for successful login
 * @param {string} identifier - Email or IP address
 */
export function clearAttempts(identifier) {
  loginAttempts.delete(identifier);
}

/**
 * Format remaining time for user message
 * @param {number} resetTime - Timestamp when lockout expires
 * @returns {string}
 */
export function formatLockoutTime(resetTime) {
  const now = Date.now();
  const remainingMs = resetTime - now;
  const minutes = Math.ceil(remainingMs / 60000);
  
  if (minutes > 60) {
    const hours = Math.floor(minutes / 60);
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }
  
  return `${minutes} minute${minutes > 1 ? 's' : ''}`;
}

// Cleanup old entries every hour
setInterval(() => {
  const now = Date.now();
  for (const [identifier, record] of loginAttempts.entries()) {
    // Remove entries older than lockout period
    if (now - record.firstAttempt > LOCKOUT_MS) {
      loginAttempts.delete(identifier);
    }
  }
}, 60 * 60 * 1000); // Run every hour
