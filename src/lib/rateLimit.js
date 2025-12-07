import { createServiceRoleClient } from "@/lib/actions/supabase/server";

// Configuration
const MAX_ATTEMPTS = 5; // Maximum login attempts
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes in milliseconds
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes lockout

/**
 * Mask identifier for logging (prevent PII exposure)
 * @param {string} identifier - Email or IP address
 * @returns {string} Masked identifier
 */
function maskIdentifier(identifier) {
	if (!identifier || typeof identifier !== "string") {
		return "***";
	}

	if (identifier.includes("@")) {
		const parts = identifier.split("@");
		const username = parts[0];
		const domain = parts[1] || "***";
		return `${username.substring(0, 2)}***@${domain}`;
	}

	return `${identifier.substring(0, 3)}***`;
}

/**
 * Validate and sanitize identifier
 * @param {string} identifier - Email or IP address
 * @returns {string} Sanitized identifier
 * @throws {Error} If identifier is invalid
 */
function validateIdentifier(identifier) {
	if (!identifier || typeof identifier !== "string") {
		throw new Error("Invalid identifier: must be a non-empty string");
	}

	const trimmed = identifier.trim();

	if (trimmed.length === 0) {
		throw new Error("Invalid identifier: cannot be empty");
	}

	if (trimmed.length > 255) {
		throw new Error("Invalid identifier: exceeds maximum length of 255 characters");
	}

	// Basic email or IP validation
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;

	if (!emailRegex.test(trimmed) && !ipRegex.test(trimmed)) {
		throw new Error("Invalid identifier: must be a valid email or IP address");
	}

	return trimmed;
}

/**
 * Check if login attempt is allowed
 * @param {string} identifier - Email or IP address
 * @returns {Promise<{ allowed: boolean, remainingAttempts: number, resetTime: number | null }>}
 */
export async function checkRateLimit(identifier) {
	// Validate and sanitize input
	const sanitizedIdentifier = validateIdentifier(identifier);

	const supabase = createServiceRoleClient();
	const now = Date.now();

	const { data: record, error } = await supabase
		.from("RateLimit")
		.select("*")
		.eq("identifier", sanitizedIdentifier)
		.single();

	// No previous attempts or error (treat error as no attempts for resilience)
	if (!record || error) {
		return {
			allowed: true,
			remainingAttempts: MAX_ATTEMPTS - 1,
			resetTime: null,
		};
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
		await supabase.from("RateLimit").delete().eq("identifier", sanitizedIdentifier);
		return {
			allowed: true,
			remainingAttempts: MAX_ATTEMPTS - 1,
			resetTime: null,
		};
	}

	// Check if max attempts reached
	if (record.attempts >= MAX_ATTEMPTS) {
		const lockedUntil = record.firstAttempt + LOCKOUT_MS;
		await supabase.from("RateLimit").update({ lockedUntil }).eq("identifier", sanitizedIdentifier);

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
export async function recordFailedAttempt(identifier) {
	// Validate and sanitize input
	const sanitizedIdentifier = validateIdentifier(identifier);

	const supabase = createServiceRoleClient();
	const now = Date.now();

	const { data: record } = await supabase
		.from("RateLimit")
		.select("*")
		.eq("identifier", sanitizedIdentifier)
		.single();

	if (!record || now - record.firstAttempt > WINDOW_MS) {
		// First attempt or window expired - Upsert
		const { error: upsertError } = await supabase.from("RateLimit").upsert(
			{
				identifier: sanitizedIdentifier,
				attempts: 1,
				firstAttempt: now,
				lockedUntil: null,
			},
			{
				onConflict: "identifier", // Explicitly specify conflict column
			}
		);
		if (upsertError) {
			// Error handled silently - rate limiting continues
		}
	} else {
		// Increment attempts
		const { error: updateError } = await supabase
			.from("RateLimit")
			.update({ attempts: record.attempts + 1 })
			.eq("identifier", sanitizedIdentifier);
		if (updateError) {
			// Error handled silently - rate limiting continues
		}
	}
}

/**
 * Clear attempts for successful login
 * @param {string} identifier - Email or IP address
 */
export async function clearAttempts(identifier) {
	// Validate and sanitize input
	const sanitizedIdentifier = validateIdentifier(identifier);

	const supabase = createServiceRoleClient();
	await supabase.from("RateLimit").delete().eq("identifier", sanitizedIdentifier);
}
