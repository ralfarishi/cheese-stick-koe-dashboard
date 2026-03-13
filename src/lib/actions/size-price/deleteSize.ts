"use server";

import { db } from "@/db";
import { productSizePrice } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { verifySession } from "@/lib/verifySession";
import { revalidatePath } from "next/cache";
import { logger } from "@/lib/logger";

interface DeleteResult {
	success: boolean;
	message?: string;
}

/**
 * Delete a product size by ID
 */
export async function deleteSize(sizeId: string): Promise<DeleteResult> {
	// Input validation
	if (!sizeId || typeof sizeId !== "string") {
		return { success: false, message: "Invalid size ID" };
	}

	try {
		const user = await verifySession();
		if (!user) throw new Error("Unauthorized");

		const result = await db
			.delete(productSizePrice)
			.where(and(eq(productSizePrice.id, sizeId), eq(productSizePrice.userId, user.id)));

		if ((result as { rowCount?: number }).rowCount === 0) {
			return { success: false, message: "Size not found" };
		}

		revalidatePath("/dashboard/size-pricing");

		return { success: true };
	} catch (err: unknown) {
		const error = err as { code?: string };
		// Check for foreign key constraint violation
		if (error.code === "23503") {
			return { success: false, message: "Cannot delete size: it is used in invoices or recipes" };
		}
		logger.error("deleteSize", err);
		return { success: false, message: "Failed to delete size" };
	}
}

