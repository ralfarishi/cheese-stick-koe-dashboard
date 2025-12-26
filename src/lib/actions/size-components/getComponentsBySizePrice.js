"use server";

import { cache } from "react";
import { createClient } from "@/lib/actions/supabase/server";

/**
 * Get recipe components for a specific size price
 * @param {Object} params
 * @param {string} params.sizePriceId - ProductSizePrice ID
 * @returns {Object} Recipe components with ingredient details
 */
export const getComponentsBySizePrice = cache(async ({ sizePriceId } = {}) => {
	if (!sizePriceId) {
		return { error: "Size Price ID is required", data: [] };
	}

	const supabase = await createClient();

	const { data, error } = await supabase
		.from("SizeComponent")
		.select(
			`
			id,
			quantityNeeded,
			ingredient:Ingredient (
				id,
				name,
				unit,
				costPerUnit
			)
		`
		)
		.eq("sizePriceId", sizePriceId);

	if (error) {
		console.error("Error fetching size components:", error);
		return { error: "Failed to fetch recipe components", data: [] };
	}

	// Calculate individual component costs and total COGS
	const componentsWithCost = data.map((comp) => ({
		...comp,
		calculatedCost: comp.quantityNeeded * (comp.ingredient?.costPerUnit || 0),
	}));

	const totalCOGS = componentsWithCost.reduce((sum, comp) => sum + comp.calculatedCost, 0);

	return { data: componentsWithCost, totalCOGS };
});
