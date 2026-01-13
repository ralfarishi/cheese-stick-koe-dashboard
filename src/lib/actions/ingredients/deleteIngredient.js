"use server";

import { db } from "@/db";
import { ingredient } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Delete an ingredient from the database
 * Note: Will fail if ingredient is referenced in SizeComponent recipes
 * @param {Object} params
 * @param {string} params.id - Ingredient ID to delete
 * @returns {Promise<{success?: boolean, error?: string}>}
 */
export const deleteIngredient = async ({ id }) => {
	// Input validation
	if (!id || typeof id !== "string") {
		return { error: "Ingredient ID is required" };
	}

	try {
		const result = await db.delete(ingredient).where(eq(ingredient.id, id));

		if (result.rowCount === 0) {
			return { error: "Ingredient not found" };
		}

		return { success: true };
	} catch (err) {
		console.error("Error deleting ingredient:", err);
		// Check for foreign key violation
		if (err.code === "23503") {
			return { error: "Cannot delete ingredient - it is used in recipes" };
		}
		return { error: "Failed to delete ingredient" };
	}
};
