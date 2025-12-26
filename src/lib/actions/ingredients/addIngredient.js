"use server";

import { createClient } from "@/lib/actions/supabase/server";

/**
 * Add a new ingredient to the database
 * @param {Object} params
 * @param {string} params.name - Ingredient name
 * @param {string} params.unit - Unit of measurement (e.g., "gr", "ml", "pcs")
 * @param {number} params.costPerUnit - Initial cost per unit
 * @returns {Object} Success/error response
 */
export const addIngredient = async ({ name, unit, costPerUnit }) => {
	// Input validation
	if (!name?.trim()) {
		return { error: "Ingredient name is required" };
	}
	if (!unit?.trim()) {
		return { error: "Unit is required" };
	}
	const cost = parseFloat(costPerUnit);
	if (Number.isNaN(cost) || cost < 0) {
		return { error: "Cost per unit must be a valid positive number" };
	}

	const supabase = await createClient();

	const { data, error } = await supabase
		.from("Ingredient")
		.insert({
			name: name.trim(),
			unit: unit.trim(),
			costPerUnit: cost,
		})
		.select()
		.single();

	if (error) {
		// Specific check for duplicate names (Postgres error code 23505)
		if (error.code === "23505") {
			return { error: `Ingredient "${name}" already exists` };
		}
		console.error("Error adding ingredient:", error);
		return { error: "Failed to add ingredient" };
	}

	return { success: true, data };
};
