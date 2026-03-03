"use server";

import { db } from "@/db";
import { product } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { verifySession } from "@/lib/verifySession";
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
		const user = await verifySession();
		if (!user) throw new Error("Unauthorized");

		const result = await db
			.delete(product)
			.where(and(eq(product.id, productId), eq(product.userId, user.id)));

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

