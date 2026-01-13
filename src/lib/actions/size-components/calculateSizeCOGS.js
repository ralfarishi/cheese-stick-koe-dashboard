"use server";

import { db } from "@/db";
import { sql } from "drizzle-orm";

/**
 * Calculate COGS for a size price using the RPC function
 * @param {Object} params
 * @param {string} params.sizePriceId - ProductSizePrice ID
 * @returns {Promise<{cogs: number, error?: string}>}
 */
export const calculateSizeCOGS = async ({ sizePriceId }) => {
	// Input validation
	if (!sizePriceId || typeof sizePriceId !== "string") {
		return { error: "Size Price ID is required", cogs: 0 };
	}

	try {
		const result = await db.execute(sql`SELECT calculate_size_cogs(${sizePriceId}::uuid) as cogs`);

		const cogs = result[0]?.cogs ?? result.rows?.[0]?.cogs;

		return { cogs: cogs || 0 };
	} catch (err) {
		console.error("Error calculating COGS:", err);
		return { error: "Failed to calculate COGS", cogs: 0 };
	}
};
