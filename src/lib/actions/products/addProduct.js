"use server";

import { db } from "@/db";
import { product } from "@/db/schema";
import { ilike } from "drizzle-orm";

/**
 * Add a new product
 * @returns {Promise<{data?: Object, error?: Object}>}
 */
export async function addProduct({ name, description }) {
	// Input validation
	if (!name || typeof name !== "string" || !name.trim()) {
		return { error: { message: "Product name is required" } };
	}

	const safeName = name.trim();
	const safeDescription = description?.trim() || null;

	// Validate name length
	if (safeName.length > 100) {
		return { error: { message: "Product name is too long (max 100 characters)" } };
	}

	try {
		// Check for duplicate name (case-insensitive)
		const [existingProduct] = await db
			.select({ id: product.id })
			.from(product)
			.where(ilike(product.name, safeName))
			.limit(1);

		if (existingProduct) {
			return { error: { message: "Product with this name already exists" } };
		}

		// Insert new product
		const [data] = await db
			.insert(product)
			.values({ name: safeName, description: safeDescription })
			.returning();

		return { data, error: null };
	} catch (err) {
		console.error("Error adding product:", err);
		return { error: { message: "Failed to add product" } };
	}
}

