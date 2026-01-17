"use server";

import { db } from "@/db";
import { rateLimit } from "@/db/schema";
import { desc } from "drizzle-orm";
import type { RateLimit } from "@/lib/types";

interface FormattedRateLimit extends Omit<RateLimit, "firstAttempt" | "lockedUntil"> {
	firstAttempt: number;
	lockedUntil: number | null;
}

interface GetRateLimitsResult {
	data: FormattedRateLimit[];
	error?: string;
}

/**
 * Get all rate limit records for admin dashboard
 */
export async function getRateLimits(): Promise<GetRateLimitsResult> {
	try {
		const data = await db.select().from(rateLimit).orderBy(desc(rateLimit.firstAttempt));

		// Convert BigInt to number for serialization (already handled by schema mode: 'number')
		const formattedData: FormattedRateLimit[] = data.map((record) => ({
			...record,
			firstAttempt: Number(record.firstAttempt),
			lockedUntil: record.lockedUntil ? Number(record.lockedUntil) : null,
		}));

		return { data: formattedData };
	} catch (err) {
		console.error("Error fetching rate limits:", err);
		return { data: [], error: "Failed to fetch rate limits" };
	}
}
