"use server";

import { db } from "@/db";
import { ingredient } from "@/db/schema";

/**
 * Add a new ingredient to the database
 * @returns {Promise<{success?: boolean, data?: Object, error?: string}>}
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

	const safeName = name.trim();
	const safeUnit = unit.trim();

	// Validate length limits
	if (safeName.length > 255) {
		return { error: "Ingredient name is too long (max 255 characters)" };
	}
	if (safeUnit.length > 50) {
		return { error: "Unit is too long (max 50 characters)" };
	}

	try {
		const [data] = await db
			.insert(ingredient)
			.values({
				name: safeName,
				unit: safeUnit,
				costPerUnit: cost,
			})
			.returning();

		return { success: true, data };
	} catch (err) {
		if (err.code === "23505") {
			return { error: `Ingredient "${safeName}" already exists` };
		}
		console.error("Error adding ingredient:", err);
		return { error: "Failed to add ingredient" };
	}
};
