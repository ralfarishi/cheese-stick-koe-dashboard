"use server";

import { db } from "@/db";
import { invoice } from "@/db/schema";
import { eq, and, ne, sql } from "drizzle-orm";
import { verifySession } from "@/lib/verifySession";
import { updateInvoiceSchema } from "@/lib/validations";
import { logger } from "@/lib/logger";

interface UpdateResult {
	success: boolean;
	error?: string;
}

/**
 * Update an existing invoice with items using RPC transaction
 */
export async function updateInvoice(input: unknown): Promise<UpdateResult> {
	// Zod validation
	const parsed = updateInvoiceSchema.safeParse(input);
	if (!parsed.success) {
		return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
	}

	const { invoiceId, invoiceData, items } = parsed.data;

	try {
		const user = await verifySession();
		if (!user) return { success: false, error: "Unauthorized" };

		// Check if invoice number already exists (excluding current invoice)
		const [existing] = await db
			.select({ id: invoice.id })
			.from(invoice)
			.where(
				and(
					eq(invoice.invoiceNumber, invoiceData.invoiceNumber),
					ne(invoice.id, invoiceId),
					eq(invoice.userId, user.id),
				),
			)
			.limit(1);

		if (existing) {
			return { success: false, error: "Invoice number already existed!" };
		}

		// Also check that the invoice to update belongs to user
		const [currentInvoice] = await db
			.select({ id: invoice.id })
			.from(invoice)
			.where(and(eq(invoice.id, invoiceId), eq(invoice.userId, user.id)))
			.limit(1);

		if (!currentInvoice) {
			return { success: false, error: "Invoice not found or unauthorized" };
		}

		// Prepare data for RPC
		const invoicePayload = {
			invoiceNumber: invoiceData.invoiceNumber,
			buyerName: invoiceData.buyerName,
			invoiceDate: invoiceData.invoiceDate.toISOString(),
			shipping: invoiceData.shipping,
			discount: invoiceData.discount,
			totalPrice: invoiceData.totalPrice,
			status: invoiceData.status,
			userId: user.id,
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
				invoicePayload,
			)}::jsonb, ${JSON.stringify(itemsPayload)}::jsonb)`,
		);

		return { success: true };
	} catch (err) {
		logger.error("updateInvoice", err);
		return { success: false, error: "Failed to update invoice" };
	}
}
