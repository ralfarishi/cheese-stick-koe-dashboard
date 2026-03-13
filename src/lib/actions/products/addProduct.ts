"use server";

import { db } from "@/db";
import { product } from "@/db/schema";
import { ilike, and, eq } from "drizzle-orm";
import type { Product, ProductInput, ActionResult } from "@/lib/types";
import { verifySession } from "@/lib/verifySession";
import { logger } from "@/lib/logger";

/**
 * Add a new product
 */
export async function addProduct({
	name,
	description,
}: ProductInput): Promise<ActionResult<Product>> {
	// Input validation
	if (!name || typeof name !== "string" || !name.trim()) {
		return { error: "Product name is required" };
	}

	const safeName = name.trim();
	const safeDescription = description?.trim() || null;

	// Validate name length
	if (safeName.length > 100) {
		return { error: "Product name is too long (max 100 characters)" };
	}

	try {
		const user = await verifySession();
		if (!user) throw new Error("Unauthorized");

		// Check for duplicate name (case-insensitive) for this specific user
		const [existingProduct] = await db
			.select({ id: product.id })
			.from(product)
			.where(and(eq(product.userId, user.id), ilike(product.name, safeName)))
			.limit(1);

		if (existingProduct) {
			return { error: "Product with this name already exists" };
		}

		// Insert new product
		const [data] = await db
			.insert(product)
			.values({ name: safeName, description: safeDescription, userId: user.id })
			.returning();

		return { success: true, data };
	} catch (err) {
		logger.error("addProduct", err);
		return { error: "Failed to add product" };
	}
}

