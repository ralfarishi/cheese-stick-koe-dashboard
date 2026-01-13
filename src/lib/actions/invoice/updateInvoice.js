"use server";

import { db } from "@/db";
import { invoice } from "@/db/schema";
import { eq, and, ne, sql } from "drizzle-orm";

/**
 * Update an existing invoice with items using RPC transaction
 * @param {Object} params
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function updateInvoice({ invoiceId, invoiceData, items }) {
	// Input validation
	if (!invoiceId || typeof invoiceId !== "string") {
		return { success: false, error: "Invalid invoice ID" };
	}

	if (!invoiceData || !Array.isArray(items)) {
		return { success: false, error: "Invalid invoice data" };
	}

	try {
		// Check if invoice number already exists (excluding current invoice)
		const [existing] = await db
			.select({ id: invoice.id })
			.from(invoice)
			.where(and(eq(invoice.invoiceNumber, invoiceData.invoiceNumber), ne(invoice.id, invoiceId)))
			.limit(1);

		if (existing) {
			return { success: false, error: "Invoice number already existed!" };
		}

		// Prepare data for RPC
		const invoicePayload = {
			invoiceNumber: invoiceData.invoiceNumber,
			buyerName: invoiceData.buyerName,
			invoiceDate: new Date(invoiceData.invoiceDate).toISOString(),
			shipping: parseInt(invoiceData.shipping) || 0,
			discount: invoiceData.discount,
			totalPrice: invoiceData.totalPrice,
			status: invoiceData.status,
		};

		const itemsPayload = items.map((item) => ({
			productId: item.productId,
			sizePriceId: item.sizePriceId,
			quantity: item.quantity,
			subtotal: item.quantity * (item.price || 0) - (item.discountAmount || 0),
			discountAmount: item.discountAmount || 0,
		}));

		// Call RPC function via raw SQL (preserves transaction logic)
		await db.execute(
			sql`SELECT update_invoice(${invoiceId}::uuid, ${JSON.stringify(
				invoicePayload
			)}::jsonb, ${JSON.stringify(itemsPayload)}::jsonb)`
		);

		return { success: true };
	} catch (err) {
		console.error("Error updating invoice:", err);
		return { success: false, error: err.message || "Failed to update invoice" };
	}
}

