"use server";

import { db } from "@/db";
import { ingredient } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { ActionResult } from "@/lib/types";

interface DeleteIngredientInput {
	id: string;
}

/**
 * Delete an ingredient from the database
 * Note: Will fail if ingredient is referenced in SizeComponent recipes
 */
export const deleteIngredient = async ({
	id,
}: DeleteIngredientInput): Promise<ActionResult<void>> => {
	// Input validation
	if (!id || typeof id !== "string") {
		return { error: "Ingredient ID is required" };
	}

	try {
		const result = await db.delete(ingredient).where(eq(ingredient.id, id));

		if ((result as { rowCount?: number }).rowCount === 0) {
			return { error: "Ingredient not found" };
		}

		return { success: true, data: undefined };
	} catch (err: unknown) {
		const error = err as { code?: string };
		console.error("Error deleting ingredient:", err);
		// Check for foreign key violation
		if (error.code === "23503") {
			return { error: "Cannot delete ingredient - it is used in recipes" };
		}
		return { error: "Failed to delete ingredient" };
	}
};
