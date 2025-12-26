"use server";

import { createClient } from "@/lib/actions/supabase/server";

/**
 * Delete a component from a recipe
 * @param {Object} params
 * @param {string} params.id - SizeComponent ID to delete
 * @returns {Object} Success/error response
 */
export const deleteSizeComponent = async ({ id }) => {
	if (!id) {
		return { error: "Component ID is required" };
	}

	const supabase = await createClient();

	const { error } = await supabase.from("SizeComponent").delete().eq("id", id);

	if (error) {
		console.error("Error deleting size component:", error);
		return { error: "Failed to delete recipe component" };
	}

	return { success: true };
};
