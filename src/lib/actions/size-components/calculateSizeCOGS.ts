"use server";

import { db } from "@/db";
import { sql } from "drizzle-orm";

interface CalculateCOGSInput {
	sizePriceId: string;
}

interface CalculateCOGSResult {
	cogs: number;
	error?: string;
}

/**
 * Calculate COGS for a size price using the RPC function
 */
export const calculateSizeCOGS = async ({
	sizePriceId,
}: CalculateCOGSInput): Promise<CalculateCOGSResult> => {
	// Input validation
	if (!sizePriceId || typeof sizePriceId !== "string") {
		return { error: "Size Price ID is required", cogs: 0 };
	}

	try {
		const result = await db.execute(sql`SELECT calculate_size_cogs(${sizePriceId}::uuid) as cogs`);

		const row = result[0] as { cogs?: number } | undefined;
		const rowsResult = (result as unknown as { rows?: Array<{ cogs?: number }> }).rows;
		const cogs = row?.cogs ?? rowsResult?.[0]?.cogs;

		return { cogs: cogs || 0 };
	} catch (err) {
		console.error("Error calculating COGS:", err);
		return { error: "Failed to calculate COGS", cogs: 0 };
	}
};
