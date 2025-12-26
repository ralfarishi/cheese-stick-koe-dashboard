"use server";

import { createClient } from "@/lib/actions/supabase/server";

/**
 * Update ingredient price with audit logging via RPC transaction
 * This creates a history record and updates the price atomically
 * @param {Object} params
 * @param {string} params.id - Ingredient ID
 * @param {number} params.newPrice - New price per unit
 * @param {string} [params.reason] - Optional reason for price change
 * @returns {Object} Success/error response with history info
 */
export const updateIngredientPrice = async ({ id, newPrice, reason }) => {
	// Input validation
	if (!id) {
		return { error: "Ingredient ID is required" };
	}
	const price = parseFloat(newPrice);
	if (Number.isNaN(price) || price < 0) {
		return { error: "New price must be a valid positive number" };
	}

	const supabase = await createClient();

	// Call the transactional RPC function
	const { data, error } = await supabase.rpc("update_ingredient_price", {
		p_ingredient_id: id,
		p_new_price: price,
		p_reason: reason?.trim() || null,
	});

	if (error) {
		console.error("Error updating ingredient price:", error);
		return { error: "Failed to update ingredient price" };
	}

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
};
