"use server";

import { createClient } from "@/lib/actions/supabase/server";

/**
 * Delete an ingredient from the database
 * Note: Will fail if ingredient is referenced in SizeComponent recipes
 * @param {Object} params
 * @param {string} params.id - Ingredient ID to delete
 * @returns {Object} Success/error response
 */
export const deleteIngredient = async ({ id }) => {
	if (!id) {
		return { error: "Ingredient ID is required" };
	}

	const supabase = await createClient();

	const { error } = await supabase.from("Ingredient").delete().eq("id", id);

	if (error) {
		console.error("Error deleting ingredient:", error);
		// Check for foreign key violation
		if (error.code === "23503") {
			return { error: "Cannot delete ingredient - it is used in recipes" };
		}
		return { error: "Failed to delete ingredient" };
	}

	return { success: true };
};
