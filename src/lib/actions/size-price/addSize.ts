"use server";

import { db } from "@/db";
import { productSizePrice } from "@/db/schema";
import type { ProductSizePrice, SizePriceInput, ActionResult } from "@/lib/types";

/**
 * Add a new product size with price
 */
export async function addSize({
	size,
	price,
}: SizePriceInput): Promise<ActionResult<ProductSizePrice>> {
	// Input validation
	if (!size || typeof size !== "string" || !size.trim()) {
		return { error: "Size name is required" };
	}

	const parsedPrice = parseInt(String(price));
	if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
		return { error: "Price must be a valid positive number" };
	}

	const safeSize = size.trim();

	if (safeSize.length > 100) {
		return { error: "Size name is too long (max 100 characters)" };
	}

	try {
		const [data] = await db
			.insert(productSizePrice)
			.values({ size: safeSize, price: parsedPrice })
			.returning();

		return { success: true, data };
	} catch (err) {
		console.error("Error adding size:", err);
		return { error: "Failed to add size" };
	}
}

