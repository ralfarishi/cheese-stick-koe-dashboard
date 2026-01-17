"use server";

import { db } from "@/db";
import { invoice } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { InvoiceStatus } from "@/lib/types";

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
	status: string
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
		const result = await db.update(invoice).set({ status }).where(eq(invoice.id, invoiceId));

		if ((result as { rowCount?: number }).rowCount === 0) {
			return { success: false, error: "Invoice not found" };
		}

		revalidatePath("/dashboard/invoices");
		return { success: true };
	} catch (err) {
		console.error("Error updating invoice status:", err);
		return { success: false, error: "Failed to update invoice status" };
	}
}
