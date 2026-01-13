"use server";

import { db } from "@/db";
import { sql } from "drizzle-orm";

/**
 * Update ingredient price with audit logging via RPC transaction
 * @returns {Promise<{success?: boolean, error?: string, oldPrice?: number, newPrice?: number, historyId?: string}>}
 */
export const updateIngredientPrice = async ({ id, newPrice, reason }) => {
	// Input validation
	if (!id || typeof id !== "string") {
		return { error: "Ingredient ID is required" };
	}
	const price = Math.round(parseFloat(newPrice));
	if (Number.isNaN(price) || price < 0) {
		return { error: "New price must be a valid positive number" };
	}

	// Sanitize reason
	const safeReason = reason?.trim() || null;

	try {
		// Call the transactional RPC function via raw SQL
		const result = await db.execute(
			sql`SELECT update_ingredient_price(${id}::uuid, ${price}, ${safeReason}) as result`
		);

		// Drizzle returns array directly, not { rows: [] }
		const data = result[0]?.result ?? result.rows?.[0]?.result;

		// RPC returns JSON with success/error info
		if (!data?.success) {
			return { error: data?.error || "Failed to update ingredient price" };
		}

		return {
			success: true,
			oldPrice: data.old_price,
			newPrice: data.new_price,
			historyId: data.history_id,
		};
	} catch (err) {
		console.error("Error updating ingredient price:", err);
		return { error: "Failed to update ingredient price" };
	}
};
