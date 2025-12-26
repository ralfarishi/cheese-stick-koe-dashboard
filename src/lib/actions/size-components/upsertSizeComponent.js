"use server";

import { createClient } from "@/lib/actions/supabase/server";

/**
 * Upsert a recipe component (add or update ingredient in recipe)
 * @param {Object} params
 * @param {string} params.sizePriceId - ProductSizePrice ID
 * @param {string} params.ingredientId - Ingredient ID
 * @param {number} params.quantityNeeded - Amount of ingredient needed
 * @returns {Object} Success/error response
 */
export const upsertSizeComponent = async ({ sizePriceId, ingredientId, quantityNeeded }) => {
	// Input validation
	if (!sizePriceId) {
		return { error: "Size Price ID is required" };
	}
	if (!ingredientId) {
		return { error: "Ingredient ID is required" };
	}
	const quantity = parseFloat(quantityNeeded);
	if (Number.isNaN(quantity) || quantity <= 0) {
		return { error: "Quantity needed must be a positive number" };
	}

	const supabase = await createClient();

	// Upsert based on unique constraint (sizePriceId, ingredientId)
	const { data, error } = await supabase
		.from("SizeComponent")
		.upsert(
			{
				sizePriceId,
				ingredientId,
				quantityNeeded: quantity,
			},
			{
				onConflict: "sizePriceId,ingredientId",
			}
		)
		.select()
		.single();

	if (error) {
		console.error("Error upserting size component:", error);
		return { error: "Failed to save recipe component" };
	}

	return { success: true, data };
};
