"use server";

import { db } from "@/db";
import { sizeComponent } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import type { ActionResult } from "@/lib/types";
import { verifySession } from "@/lib/verifySession";
import { logger } from "@/lib/logger";

interface DeleteSizeComponentInput {
	id: string;
}

/**
 * Delete a component from a recipe
 */
export const deleteSizeComponent = async ({
	id,
}: DeleteSizeComponentInput): Promise<ActionResult<void>> => {
	// Input validation
	if (!id || typeof id !== "string") {
		return { error: "Component ID is required" };
	}

	try {
		const user = await verifySession();
		if (!user) throw new Error("Unauthorized");

		const result = await db
			.delete(sizeComponent)
			.where(and(eq(sizeComponent.id, id), eq(sizeComponent.userId, user.id)));

		if ((result as { rowCount?: number }).rowCount === 0) {
			return { error: "Component not found" };
		}

		return { success: true, data: undefined };
	} catch (err) {
		logger.error("deleteSizeComponent", err);
		return { error: "Failed to delete recipe component" };
	}
};
