"use server";

import { cache } from "react";
import { db } from "@/db";
import { sizeComponent, ingredient } from "@/db/schema";
import { eq } from "drizzle-orm";

interface IngredientData {
	id: string;
	name: string;
	unit: string;
	costPerUnit: number;
}

interface ComponentWithCost {
	id: string;
	quantityNeeded: number;
	ingredient: IngredientData | null;
	calculatedCost: number;
}

interface GetComponentsInput {
	sizePriceId?: string;
}

interface GetComponentsResult {
	data: ComponentWithCost[];
	totalCOGS?: number;
	error?: string;
}

/**
 * Get recipe components for a specific size price
 */
export const getComponentsBySizePrice = cache(
	async ({ sizePriceId }: GetComponentsInput = {}): Promise<GetComponentsResult> => {
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
			const componentsWithCost: ComponentWithCost[] = data.map((comp) => ({
				...comp,
				calculatedCost: comp.quantityNeeded * (comp.ingredient?.costPerUnit || 0),
			}));

			const totalCOGS = componentsWithCost.reduce((sum, comp) => sum + comp.calculatedCost, 0);

			return { data: componentsWithCost, totalCOGS };
		} catch (err) {
			console.error("Error fetching size components:", err);
			return { error: "Failed to fetch recipe components", data: [] };
		}
	}
);
