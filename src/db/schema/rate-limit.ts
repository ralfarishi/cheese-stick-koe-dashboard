import { pgTable, text, integer, bigint, timestamp } from "drizzle-orm/pg-core";

/**
 * RateLimit table - tracks login attempts for brute force protection
 */
export const rateLimit = pgTable("RateLimit", {
	identifier: text("identifier").primaryKey(), // Email or IP address
	attempts: integer("attempts").default(0).notNull(),
	firstAttempt: bigint("firstAttempt", { mode: "number" }).notNull(),
	lockedUntil: bigint("lockedUntil", { mode: "number" }),
	createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
});
