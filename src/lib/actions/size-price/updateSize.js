"use server";

import { db } from "@/db";
import { productSizePrice } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * Update a product size price
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export async function updateSize(id, { size, price, laborPercent }) {
	// Input validation
	if (!id || typeof id !== "string") {
		return { success: false, message: "Invalid size ID" };
	}

	if (!size || typeof size !== "string" || !size.trim()) {
		return { success: false, message: "Size name is required" };
	}

	const parsedPrice = parseInt(price);
	if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
		return { success: false, message: "Price must be a valid positive number" };
	}

	const parsedLaborPercent = parseFloat(laborPercent);
	if (Number.isNaN(parsedLaborPercent) || parsedLaborPercent < 0 || parsedLaborPercent > 100) {
		return { success: false, message: "Labor percent must be between 0 and 100" };
	}

	const safeSize = size.trim();

	try {
		const result = await db
			.update(productSizePrice)
			.set({
				size: safeSize,
				price: parsedPrice,
				laborPercent: parsedLaborPercent,
			})
			.where(eq(productSizePrice.id, id));

		if (result.rowCount === 0) {
			return { success: false, message: "Size not found" };
		}

		revalidatePath("/dashboard/size-pricing");

		return { success: true };
	} catch (err) {
		console.error("Error updating size:", err);
		return { success: false, message: "Failed to update size" };
	}
}
