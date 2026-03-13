/**
 * Structured logger - environment-aware, never leaks sensitive data in production.
 * Replaces raw console.error across all server actions.
 */

const isDev = process.env.NODE_ENV !== "production";

const sanitize = (context: string, err: unknown): string => {
	if (isDev) return String(err);
	// In production, only log the context label — never the raw error
	return context;
};

export const logger = {
	error: (context: string, err?: unknown): void => {
		if (isDev) {
			console.error(`[ERROR] ${context}:`, err);
		} else {
			// Production: structured message only, no stack traces
			console.error(`[ERROR] ${sanitize(context, err)}`);
		}
	},
	warn: (context: string, detail?: unknown): void => {
		if (isDev) {
			console.warn(`[WARN] ${context}:`, detail);
		}
	},
} as const;
