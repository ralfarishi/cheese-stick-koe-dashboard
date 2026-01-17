"use server";

import { db } from "@/db";
import { ingredient } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { Ingredient, ActionResult } from "@/lib/types";

interface UpdateIngredientInput {
	id: string;
	name: string;
	unit: string;
}

/**
 * Update ingredient details (name and unit only - price is updated via updateIngredientPrice)
 */
export const updateIngredient = async ({
	id,
	name,
	unit,
}: UpdateIngredientInput): Promise<ActionResult<Ingredient>> => {
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
	} catch (err: unknown) {
		const error = err as { code?: string };
		if (error.code === "23505") {
			return { error: `Ingredient "${safeName}" already exists` };
		}
		console.error("Error updating ingredient:", err);
		return { error: "Failed to update ingredient" };
	}
};
