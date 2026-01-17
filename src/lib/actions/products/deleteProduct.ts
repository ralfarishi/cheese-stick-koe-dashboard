"use server";

import { db } from "@/db";
import { product } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

interface DeleteResult {
	success: boolean;
	message?: string;
}

/**
 * Delete a product by ID
 */
export async function deleteProduct(productId: string): Promise<DeleteResult> {
	// Input validation
	if (!productId || typeof productId !== "string") {
		return { success: false, message: "Invalid product ID" };
	}

	try {
		const result = await db.delete(product).where(eq(product.id, productId));

		if ((result as { rowCount?: number }).rowCount === 0) {
			return { success: false, message: "Product not found" };
		}

		revalidatePath("/dashboard/products");

		return { success: true };
	} catch (err: unknown) {
		const error = err as { code?: string };
		// Check for foreign key constraint violation
		if (error.code === "23503") {
			return { success: false, message: "Cannot delete product: it is used in invoices" };
		}
		console.error("Error deleting product:", err);
		return { success: false, message: "Failed to delete product" };
	}
}

