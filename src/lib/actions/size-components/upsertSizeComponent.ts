"use server";

import { db } from "@/db";
import { sizeComponent } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import type { SizeComponent, ActionResult } from "@/lib/types";

interface UpsertSizeComponentInput {
	sizePriceId: string;
	ingredientId: string;
	quantityNeeded: string | number;
}

/**
 * Upsert a recipe component (add or update ingredient in recipe)
 */
export const upsertSizeComponent = async ({
	sizePriceId,
	ingredientId,
	quantityNeeded,
}: UpsertSizeComponentInput): Promise<ActionResult<SizeComponent>> => {
	// Input validation
	if (!sizePriceId || typeof sizePriceId !== "string") {
		return { error: "Size Price ID is required" };
	}
	if (!ingredientId || typeof ingredientId !== "string") {
		return { error: "Ingredient ID is required" };
	}
	const quantity = parseFloat(String(quantityNeeded));
	if (Number.isNaN(quantity) || quantity <= 0) {
		return { error: "Quantity needed must be a positive number" };
	}

	try {
		// Check if component already exists
		const [existing] = await db
			.select({ id: sizeComponent.id })
			.from(sizeComponent)
			.where(
				and(
					eq(sizeComponent.sizePriceId, sizePriceId),
					eq(sizeComponent.ingredientId, ingredientId)
				)
			)
			.limit(1);

		let data: SizeComponent;

		if (existing) {
			// Update existing
			[data] = await db
				.update(sizeComponent)
				.set({ quantityNeeded: quantity })
				.where(eq(sizeComponent.id, existing.id))
				.returning();
		} else {
			// Insert new
			[data] = await db
				.insert(sizeComponent)
				.values({
					sizePriceId,
					ingredientId,
					quantityNeeded: quantity,
				})
				.returning();
		}

		return { success: true, data };
	} catch (err) {
		console.error("Error upserting size component:", err);
		return { error: "Failed to save recipe component" };
	}
};
