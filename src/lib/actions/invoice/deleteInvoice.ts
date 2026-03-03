"use server";

import { db } from "@/db";
import { invoice } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { verifySession } from "@/lib/verifySession";
import { revalidatePath } from "next/cache";

interface DeleteResult {
	success: boolean;
	message?: string;
}

/**
 * Delete an invoice by ID
 */
export async function deleteInvoice(invoiceId: string): Promise<DeleteResult> {
	// Input validation
	if (!invoiceId || typeof invoiceId !== "string") {
		return { success: false, message: "Invalid invoice ID" };
	}

	try {
		const user = await verifySession();
		if (!user) return { success: false, message: "Unauthorized" };

		const result = await db
			.delete(invoice)
			.where(and(eq(invoice.id, invoiceId), eq(invoice.userId, user.id)));

		// Check if any rows were affected
		if ((result as { rowCount?: number }).rowCount === 0) {
			return { success: false, message: "Invoice not found" };
		}

		revalidatePath("/dashboard/invoices");

		return { success: true };
	} catch (err) {
		console.error("Error deleting invoice:", err);
		return { success: false, message: "Failed to delete invoice" };
	}
}

