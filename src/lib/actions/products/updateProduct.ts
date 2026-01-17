"use server";

import { db } from "@/db";
import { product } from "@/db/schema";
import { eq, and, ne, ilike } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { ProductInput } from "@/lib/types";

interface UpdateResult {
	success: boolean;
	message?: string;
}

/**
 * Update an existing product
 */
export async function updateProduct(
	id: string,
	{ name, description }: ProductInput
): Promise<UpdateResult> {
	// Input validation
	if (!id || typeof id !== "string") {
		return { success: false, message: "Invalid product ID" };
	}

	if (!name || typeof name !== "string" || !name.trim()) {
		return { success: false, message: "Product name is required" };
	}

	const safeName = name.trim();
	const safeDescription = description?.trim() || null;

	if (safeName.length > 255) {
		return { success: false, message: "Product name is too long (max 255 characters)" };
	}

	try {
		// Check for duplicate name (excluding current product)
		const [existingProduct] = await db
			.select({ id: product.id })
			.from(product)
			.where(and(ilike(product.name, safeName), ne(product.id, id)))
			.limit(1);

		if (existingProduct) {
			return { success: false, message: "Product with this name already exists" };
		}

		// Update product
		const result = await db
			.update(product)
			.set({ name: safeName, description: safeDescription })
			.where(eq(product.id, id));

		if ((result as { rowCount?: number }).rowCount === 0) {
			return { success: false, message: "Product not found" };
		}

		revalidatePath("/dashboard/products");

		return { success: true };
	} catch (err) {
		console.error("Error updating product:", err);
		return { success: false, message: "Failed to update product" };
	}
}

