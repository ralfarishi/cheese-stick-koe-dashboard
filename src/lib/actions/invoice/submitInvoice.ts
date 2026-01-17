"use server";

import { db } from "@/db";
import { invoice } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import type { InvoiceInput } from "@/lib/types";

interface User {
	id: string;
}

interface SubmitInvoiceInput extends InvoiceInput {
	shippingPrice: string | number;
	discountAmount?: string | number;
	totalPrice: string | number;
	user: User | null;
}

interface SubmitInvoiceResult {
	success?: boolean;
	error?: string;
	invoice?: unknown;
	message?: string;
}

/**
 * Submit a new invoice with items using RPC transaction
 */
export const submitInvoice = async ({
	invoiceNumber,
	buyerName,
	invoiceDate,
	shippingPrice,
	discountAmount = 0,
	totalPrice,
	items,
	user,
}: SubmitInvoiceInput): Promise<SubmitInvoiceResult> => {
	// Auth validation
	if (!user) {
		return { error: "User is not login!" };
	}

	// Input validation
	if (!invoiceNumber?.trim() || !buyerName?.trim() || !Array.isArray(items) || items.length === 0) {
		return {
			error: "Invoice number, buyer name, and at least one item are required!",
		};
	}

	// Sanitize inputs
	const safeInvoiceNumber = invoiceNumber.trim();
	const safeBuyerName = buyerName.trim();

	// Validate number inputs
	const shipping = Number.isNaN(parseInt(String(shippingPrice)))
		? 0
		: parseInt(String(shippingPrice));
	const discount = Number.isNaN(parseInt(String(discountAmount)))
		? 0
		: parseInt(String(discountAmount));
	const total = Number.isNaN(parseInt(String(totalPrice))) ? 0 : parseInt(String(totalPrice));

	try {
		// Check if invoice number already exists
		const [existing] = await db
			.select({ id: invoice.id })
			.from(invoice)
			.where(eq(invoice.invoiceNumber, safeInvoiceNumber))
			.limit(1);

		if (existing) {
			return { error: "Invoice number already existed!" };
		}

		// Prepare data for RPC
		const invoiceData = {
			invoiceNumber: safeInvoiceNumber,
			buyerName: safeBuyerName,
			invoiceDate: new Date(invoiceDate).toISOString(),
			shipping,
			discount,
			totalPrice: total,
			status: "pending",
			userId: user.id,
		};

		const itemsData = items.map((item) => ({
			productId: item.productId,
			sizePriceId: item.sizePriceId,
			quantity: item.quantity,
			subtotal: item.subtotal,
			discountAmount: item.discountAmount || 0,
		}));

		// Call RPC function via raw SQL (preserves transaction logic)
		const result = await db.execute(
			sql`SELECT create_invoice(${JSON.stringify(invoiceData)}::jsonb, ${JSON.stringify(
				itemsData
			)}::jsonb) as invoice`
		);

		const row = result[0] as { invoice?: unknown } | undefined;
		const rowsResult = (result as unknown as { rows?: Array<{ invoice?: unknown }> }).rows;
		const invoiceResult = row?.invoice ?? rowsResult?.[0]?.invoice;

		return { success: true, message: "Invoice has been created", invoice: invoiceResult };
	} catch (err) {
		console.error("Error creating invoice:", err);
		return { error: "Something went wrong while saving invoice!" };
	}
};

