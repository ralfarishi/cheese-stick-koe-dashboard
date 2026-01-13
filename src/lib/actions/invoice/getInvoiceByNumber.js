"use server";

import { cache } from "react";
import { db } from "@/db";
import { invoice, invoiceItem, product, productSizePrice } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Get invoice with all items, product names, and size prices by invoice number
 * @param {string} invoiceNumber - Invoice number to look up
 * @returns {Promise<{data?: Object, error?: any}>}
 */
export const getInvoiceByNumber = cache(async (invoiceNumber) => {
	// Input validation
	if (!invoiceNumber || typeof invoiceNumber !== "string") {
		return { error: "Invalid invoice number" };
	}

	const safeInvoiceNumber = invoiceNumber.trim();
	if (!safeInvoiceNumber) {
		return { error: "Invoice number is required" };
	}

	try {
		// Get invoice with items using relational query
		const result = await db.query.invoice.findFirst({
			where: eq(invoice.invoiceNumber, safeInvoiceNumber),
			with: {
				items: true,
			},
		});

		if (!result) {
			return { error: "Invoice not found" };
		}

		// Get product and size price details for each item
		const itemsWithDetails = await Promise.all(
			result.items.map(async (item) => {
				const [productData] = await db
					.select({ id: product.id, name: product.name })
					.from(product)
					.where(eq(product.id, item.productId))
					.limit(1);

				const [sizePriceData] = await db
					.select({
						id: productSizePrice.id,
						price: productSizePrice.price,
						size: productSizePrice.size,
					})
					.from(productSizePrice)
					.where(eq(productSizePrice.id, item.sizePriceId))
					.limit(1);

				return {
					...item,
					product: productData || null,
					sizePrice: sizePriceData || null,
				};
			})
		);

		return {
			data: {
				...result,
				items: itemsWithDetails,
			},
		};
	} catch (err) {
		console.error("Error fetching invoice by number:", err);
		return { error: "Failed to fetch invoice" };
	}
});

export const preloadInvoice = async (invoiceNumber) => {
	void getInvoiceByNumber(invoiceNumber);
};
