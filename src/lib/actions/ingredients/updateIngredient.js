"use server";

import { createClient } from "@/lib/actions/supabase/server";

/**
 * Update ingredient details (name and unit only - price is updated via updateIngredientPrice)
 * @param {Object} params
 * @param {string} params.id - Ingredient ID
 * @param {string} params.name - New ingredient name
 * @param {string} params.unit - New unit of measurement
 * @returns {Object} Success/error response
 */
export const updateIngredient = async ({ id, name, unit }) => {
	// Input validation
	if (!id) {
		return { error: "Ingredient ID is required" };
	}
	if (!name?.trim()) {
		return { error: "Ingredient name is required" };
	}
	if (!unit?.trim()) {
		return { error: "Unit is required" };
	}

	const supabase = await createClient();

	const { data, error } = await supabase
		.from("Ingredient")
		.update({
			name: name.trim(),
			unit: unit.trim(),
		})
		.eq("id", id)
		.select()
		.single();

	if (error) {
		if (error.code === "23505") {
			return { error: `Ingredient "${name}" already exists` };
		}
		console.error("Error updating ingredient:", error);
		return { error: "Failed to update ingredient" };
	}

	return { success: true, data };
};
