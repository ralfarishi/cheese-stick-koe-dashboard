"use server";

import { db } from "@/db";
import { product } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * Delete a product by ID
 * @param {string} productId - UUID of the product to delete
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export async function deleteProduct(productId) {
	// Input validation
	if (!productId || typeof productId !== "string") {
		return { success: false, message: "Invalid product ID" };
	}

	try {
		const result = await db.delete(product).where(eq(product.id, productId));

		if (result.rowCount === 0) {
			return { success: false, message: "Product not found" };
		}

		revalidatePath("/dashboard/products");

		return { success: true };
	} catch (err) {
		// Check for foreign key constraint violation
		if (err.code === "23503") {
			return { success: false, message: "Cannot delete product: it is used in invoices" };
		}
		console.error("Error deleting product:", err);
		return { success: false, message: "Failed to delete product" };
	}
}

