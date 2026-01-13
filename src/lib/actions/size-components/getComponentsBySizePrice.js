"use server";

import { cache } from "react";
import { db } from "@/db";
import { sizeComponent, ingredient } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Get recipe components for a specific size price
 * @param {Object} params
 * @param {string} params.sizePriceId - ProductSizePrice ID
 * @returns {Promise<{data: Array, totalCOGS?: number, error?: string}>}
 */
export const getComponentsBySizePrice = cache(async ({ sizePriceId } = {}) => {
	// Input validation
	if (!sizePriceId || typeof sizePriceId !== "string") {
		return { error: "Size Price ID is required", data: [] };
	}

	try {
		// Get components with ingredient details using join
		const data = await db
			.select({
				id: sizeComponent.id,
				quantityNeeded: sizeComponent.quantityNeeded,
				ingredient: {
					id: ingredient.id,
					name: ingredient.name,
					unit: ingredient.unit,
					costPerUnit: ingredient.costPerUnit,
				},
			})
			.from(sizeComponent)
			.leftJoin(ingredient, eq(sizeComponent.ingredientId, ingredient.id))
			.where(eq(sizeComponent.sizePriceId, sizePriceId));

		// Calculate individual component costs and total COGS
		const componentsWithCost = data.map((comp) => ({
			...comp,
			calculatedCost: comp.quantityNeeded * (comp.ingredient?.costPerUnit || 0),
		}));

		const totalCOGS = componentsWithCost.reduce((sum, comp) => sum + comp.calculatedCost, 0);

		return { data: componentsWithCost, totalCOGS };
	} catch (err) {
		console.error("Error fetching size components:", err);
		return { error: "Failed to fetch recipe components", data: [] };
	}
});
