"use server";

import { db } from "@/db";
import { rateLimit } from "@/db/schema";
import { inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

interface DeleteResult {
	success: boolean;
	message: string;
}

/**
 * Delete rate limit records by identifiers
 */
export async function deleteRateLimit(identifiers: string[]): Promise<DeleteResult> {
	// Input validation
	if (!Array.isArray(identifiers) || identifiers.length === 0) {
		return { success: false, message: "No items selected" };
	}

	// Validate all identifiers are strings
	const safeIdentifiers = identifiers.filter((id) => typeof id === "string" && id.trim());
	if (safeIdentifiers.length === 0) {
		return { success: false, message: "Invalid identifiers provided" };
	}

	try {
		const result = await db.delete(rateLimit).where(inArray(rateLimit.identifier, safeIdentifiers));

		revalidatePath("/dashboard/settings/login-attempts");
		return {
			success: true,
			message: `Successfully deleted ${safeIdentifiers.length} record(s)`,
		};
	} catch (err) {
		console.error("Error deleting rate limits:", err);
		return { success: false, message: "An unexpected error occurred" };
	}
}
