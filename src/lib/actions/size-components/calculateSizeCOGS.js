"use server";

import { createClient } from "@/lib/actions/supabase/server";

/**
 * Calculate COGS for a size price using the RPC function
 * @param {Object} params
 * @param {string} params.sizePriceId - ProductSizePrice ID
 * @returns {Object} COGS calculation result
 */
export const calculateSizeCOGS = async ({ sizePriceId }) => {
	if (!sizePriceId) {
		return { error: "Size Price ID is required", cogs: 0 };
	}

	const supabase = await createClient();

	const { data, error } = await supabase.rpc("calculate_size_cogs", {
		p_size_price_id: sizePriceId,
	});

	if (error) {
		console.error("Error calculating COGS:", error);
		return { error: "Failed to calculate COGS", cogs: 0 };
	}

	return { cogs: data || 0 };
};
