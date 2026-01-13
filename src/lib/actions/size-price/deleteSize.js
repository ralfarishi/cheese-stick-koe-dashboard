"use server";

import { db } from "@/db";
import { productSizePrice } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * Delete a product size by ID
 * @param {string} sizeId - UUID of the size to delete
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export async function deleteSize(sizeId) {
	// Input validation
	if (!sizeId || typeof sizeId !== "string") {
		return { success: false, message: "Invalid size ID" };
	}

	try {
		const result = await db.delete(productSizePrice).where(eq(productSizePrice.id, sizeId));

		if (result.rowCount === 0) {
			return { success: false, message: "Size not found" };
		}

		revalidatePath("/dashboard/size-pricing");

		return { success: true };
	} catch (err) {
		// Check for foreign key constraint violation
		if (err.code === "23503") {
			return { success: false, message: "Cannot delete size: it is used in invoices or recipes" };
		}
		console.error("Error deleting size:", err);
		return { success: false, message: "Failed to delete size" };
	}
}

