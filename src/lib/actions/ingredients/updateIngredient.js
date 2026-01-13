"use server";

import { db } from "@/db";
import { ingredient } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Update ingredient details (name and unit only - price is updated via updateIngredientPrice)
 * @param {Object} params
 * @param {string} params.id - Ingredient ID
 * @param {string} params.name - New ingredient name
 * @param {string} params.unit - New unit of measurement
 * @returns {Promise<{success?: boolean, data?: Object, error?: string}>}
 */
export const updateIngredient = async ({ id, name, unit }) => {
	// Input validation
	if (!id || typeof id !== "string") {
		return { error: "Ingredient ID is required" };
	}
	if (!name?.trim()) {
		return { error: "Ingredient name is required" };
	}
	if (!unit?.trim()) {
		return { error: "Unit is required" };
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
			.update(ingredient)
			.set({
				name: safeName,
				unit: safeUnit,
			})
			.where(eq(ingredient.id, id))
			.returning();

		if (!data) {
			return { error: "Ingredient not found" };
		}

		return { success: true, data };
	} catch (err) {
		if (err.code === "23505") {
			return { error: `Ingredient "${safeName}" already exists` };
		}
		console.error("Error updating ingredient:", err);
		return { error: "Failed to update ingredient" };
	}
};
