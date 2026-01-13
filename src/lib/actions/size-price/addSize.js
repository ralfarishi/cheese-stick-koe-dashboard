"use server";

import { db } from "@/db";
import { productSizePrice } from "@/db/schema";

/**
 * Add a new product size with price
 * @param {Object} params
 * @param {string} params.size - Size name (e.g., "Small", "Medium", "Large")
 * @param {number} params.price - Price for this size
 * @returns {Promise<{data?: Object, error?: Object}>}
 */
export async function addSize({ size, price }) {
	// Input validation
	if (!size || typeof size !== "string" || !size.trim()) {
		return { error: { message: "Size name is required" } };
	}

	const parsedPrice = parseInt(price);
	if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
		return { error: { message: "Price must be a valid positive number" } };
	}

	const safeSize = size.trim();

	if (safeSize.length > 100) {
		return { error: { message: "Size name is too long (max 100 characters)" } };
	}

	try {
		const [data] = await db
			.insert(productSizePrice)
			.values({ size: safeSize, price: parsedPrice })
			.returning();

		return { data, error: null };
	} catch (err) {
		console.error("Error adding size:", err);
		return { error: { message: "Failed to add size" } };
	}
}

