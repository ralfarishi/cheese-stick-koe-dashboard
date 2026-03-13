"use server";

import { db } from "@/db";
import { invoice } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { verifySession } from "@/lib/verifySession";
import { submitInvoiceSchema } from "@/lib/validations";
import { logger } from "@/lib/logger";

interface SubmitInvoiceResult {
	success?: boolean;
	error?: string;
	invoice?: unknown;
	message?: string;
}

/**
 * Submit a new invoice with items using RPC transaction.
 *
 */
export const submitInvoice = async (input: unknown): Promise<SubmitInvoiceResult> => {
	// Server-side auth
	const user = await verifySession();
	if (!user) {
		return { error: "Unauthorized" };
	}

	// Zod validation
	const parsed = submitInvoiceSchema.safeParse(input);
	if (!parsed.success) {
		const firstError = parsed.error.issues[0]?.message ?? "Invalid input";
		return { error: firstError };
	}

	const {
		invoiceNumber,
		buyerName,
		invoiceDate,
		shippingPrice,
		discountAmount,
		totalPrice,
		items,
	} = parsed.data;

	try {
		// Check if invoice number already exists
		const [existing] = await db
			.select({ id: invoice.id })
			.from(invoice)
			.where(eq(invoice.invoiceNumber, invoiceNumber))
			.limit(1);

		if (existing) {
			return { error: "Invoice number already existed!" };
		}

		// Prepare data for RPC
		const invoiceData = {
			invoiceNumber,
			buyerName,
			invoiceDate: invoiceDate.toISOString(),
			shipping: shippingPrice,
			discount: discountAmount,
			totalPrice,
			status: "pending",
			userId: user.id,
		};

		const itemsData = items.map((item) => ({
			productId: item.productId,
			sizePriceId: item.sizePriceId,
			quantity: item.quantity,
			subtotal: item.subtotal,
			discountAmount: item.discountAmount,
		}));

		// Call RPC function via raw SQL (preserves transaction logic)
		const result = await db.execute(
			sql`SELECT create_invoice(${JSON.stringify(invoiceData)}::jsonb, ${JSON.stringify(
				itemsData,
			)}::jsonb) as invoice`,
		);

		const row = result[0] as { invoice?: unknown } | undefined;
		const rowsResult = (result as unknown as { rows?: Array<{ invoice?: unknown }> }).rows;
		const invoiceResult = row?.invoice ?? rowsResult?.[0]?.invoice;

		return { success: true, message: "Invoice has been created", invoice: invoiceResult };
	} catch (err) {
		logger.error("submitInvoice", err);
		return { error: "Something went wrong while saving invoice!" };
	}
};

