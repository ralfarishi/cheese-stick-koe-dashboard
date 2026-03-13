"use server";

import { db } from "@/db";
import { invoice } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { verifySession } from "@/lib/verifySession";
import { revalidatePath } from "next/cache";
import type { InvoiceStatus } from "@/lib/types";
import { logger } from "@/lib/logger";

// Valid status values for invoice
const VALID_STATUSES: InvoiceStatus[] = ["pending", "success", "canceled"];

interface UpdateStatusResult {
	success: boolean;
	error?: string;
}

/**
 * Update the status of an invoice
 */
export async function updateInvoiceStatus(
	invoiceId: string,
	status: string,
): Promise<UpdateStatusResult> {
	// Input validation
	if (!invoiceId || typeof invoiceId !== "string") {
		return { success: false, error: "Invalid invoice ID" };
	}

	if (!status || !VALID_STATUSES.includes(status as InvoiceStatus)) {
		return {
			success: false,
			error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
		};
	}

	try {
		const user = await verifySession();
		if (!user) return { success: false, error: "Unauthorized" };

		const result = await db
			.update(invoice)
			.set({ status })
			.where(and(eq(invoice.id, invoiceId), eq(invoice.userId, user.id)));

		if ((result as { rowCount?: number }).rowCount === 0) {
			return { success: false, error: "Invoice not found" };
		}

		revalidatePath("/dashboard/invoices");
		return { success: true };
	} catch (err) {
		logger.error("updateInvoiceStatus", err);
		return { success: false, error: "Failed to update invoice status" };
	}
}
