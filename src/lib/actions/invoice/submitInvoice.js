"use server";

import { db } from "@/db";
import { invoice } from "@/db/schema";
import { eq, and, ne, sql } from "drizzle-orm";

/**
 * Submit a new invoice with items using RPC transaction
 * @param {Object} params
 * @returns {Promise<{success?: boolean, error?: string, invoice?: Object, message?: string}>}
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
}) => {
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
	const shipping = Number.isNaN(parseInt(shippingPrice)) ? 0 : parseInt(shippingPrice);
	const discount = Number.isNaN(parseInt(discountAmount)) ? 0 : parseInt(discountAmount);
	const total = Number.isNaN(parseInt(totalPrice)) ? 0 : parseInt(totalPrice);

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
			subtotal: item.total,
			discountAmount: item.discountAmount || 0,
		}));

		// Call RPC function via raw SQL (preserves transaction logic)
		const result = await db.execute(
			sql`SELECT create_invoice(${JSON.stringify(invoiceData)}::jsonb, ${JSON.stringify(
				itemsData
			)}::jsonb) as invoice`
		);

		const invoiceResult = result[0]?.invoice ?? result.rows?.[0]?.invoice;

		return { success: true, message: "Invoice has been created", invoice: invoiceResult };
	} catch (err) {
		console.error("Error creating invoice:", err);
		return { error: "Something went wrong while saving invoice!" };
	}
};

