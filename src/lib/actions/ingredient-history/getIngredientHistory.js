"use server";

import { cache } from "react";
import { createClient } from "@/lib/actions/supabase/server";

/**
 * Get price change history for an ingredient
 * @param {Object} params
 * @param {string} params.ingredientId - Ingredient ID
 * @param {number} params.limit - Max records to return (default 20)
 * @returns {Object} History records sorted by date descending
 */
export const getIngredientHistory = cache(async ({ ingredientId, limit = 20 } = {}) => {
	if (!ingredientId) {
		return { error: "Ingredient ID is required", data: [] };
	}

	const supabase = await createClient();

	const { data, error } = await supabase
		.from("IngredientHistory")
		.select("id, oldPrice, newPrice, reason, changedAt")
		.eq("ingredientId", ingredientId)
		.order("changedAt", { ascending: false })
		.limit(limit);

	if (error) {
		console.error("Error fetching ingredient history:", error);
		return { error: "Failed to fetch price history", data: [] };
	}

	return { data };
});
