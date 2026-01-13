"use server";

import { cache } from "react";
import { db } from "@/db";
import { ingredientHistory } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

/**
 * Get price change history for an ingredient
 * @param {Object} params
 * @param {string} params.ingredientId - Ingredient ID
 * @param {number} params.limit - Max records to return (default 20)
 * @returns {Promise<{data: Array, error?: string}>}
 */
export const getIngredientHistory = cache(async ({ ingredientId, limit = 20 } = {}) => {
	// Input validation
	if (!ingredientId || typeof ingredientId !== "string") {
		return { error: "Ingredient ID is required", data: [] };
	}

	// Validate limit
	const safeLimit = Math.min(100, Math.max(1, Math.floor(Number(limit)) || 20));

	try {
		const data = await db
			.select({
				id: ingredientHistory.id,
				oldPrice: ingredientHistory.oldPrice,
				newPrice: ingredientHistory.newPrice,
				reason: ingredientHistory.reason,
				changedAt: ingredientHistory.changedAt,
			})
			.from(ingredientHistory)
			.where(eq(ingredientHistory.ingredientId, ingredientId))
			.orderBy(desc(ingredientHistory.changedAt))
			.limit(safeLimit);

		return { data };
	} catch (err) {
		console.error("Error fetching ingredient history:", err);
		return { error: "Failed to fetch price history", data: [] };
	}
});
