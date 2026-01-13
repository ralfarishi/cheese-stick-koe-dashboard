"use server";

import { db } from "@/db";
import { sizeComponent } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Delete a component from a recipe
 * @param {Object} params
 * @param {string} params.id - SizeComponent ID to delete
 * @returns {Promise<{success?: boolean, error?: string}>}
 */
export const deleteSizeComponent = async ({ id }) => {
	// Input validation
	if (!id || typeof id !== "string") {
		return { error: "Component ID is required" };
	}

	try {
		const result = await db.delete(sizeComponent).where(eq(sizeComponent.id, id));

		if (result.rowCount === 0) {
			return { error: "Component not found" };
		}

		return { success: true };
	} catch (err) {
		console.error("Error deleting size component:", err);
		return { error: "Failed to delete recipe component" };
	}
};
