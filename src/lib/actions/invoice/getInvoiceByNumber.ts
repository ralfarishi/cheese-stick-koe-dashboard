"use server";

import { cache } from "react";
import { db } from "@/db";
import { invoice, product, productSizePrice } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import type { InvoiceWithItems, ActionResult } from "@/lib/types";

interface ProductData {
	id: string;
	name: string;
}

interface SizePriceData {
	id: string;
	price: number;
	size: string;
}

interface InvoiceItemWithDetails {
	id: string;
	invoiceId: string;
	productId: string;
	sizePriceId: string;
	quantity: number;
	subtotal: number;
	discountAmount: number;
	costPerItem: number;
	totalCost: number;
	product?: ProductData;
	sizePrice?: SizePriceData;
}

/**
 * Get invoice with all items, product names, and size prices by invoice number
 */
export const getInvoiceByNumber = cache(
	async (invoiceNumber: string): Promise<ActionResult<InvoiceWithItems>> => {
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

			// Batch load all products and size prices (avoids N+1 queries)
			const productIds = [...new Set(result.items.map((item) => item.productId))];
			const sizePriceIds = [...new Set(result.items.map((item) => item.sizePriceId))];

			const [products, sizePrices] = await Promise.all([
				productIds.length > 0
					? db
							.select({ id: product.id, name: product.name })
							.from(product)
							.where(inArray(product.id, productIds))
					: Promise.resolve([]),
				sizePriceIds.length > 0
					? db
							.select({
								id: productSizePrice.id,
								price: productSizePrice.price,
								size: productSizePrice.size,
							})
							.from(productSizePrice)
							.where(inArray(productSizePrice.id, sizePriceIds))
					: Promise.resolve([]),
			]);

			// Create lookup maps for O(1) access
			const productMap = new Map(products.map((p) => [p.id, p]));
			const sizePriceMap = new Map(sizePrices.map((sp) => [sp.id, sp]));

			// Map items with their related data
			const itemsWithDetails: InvoiceItemWithDetails[] = result.items.map((item) => ({
				...item,
				product: productMap.get(item.productId) ?? undefined,
				sizePrice: sizePriceMap.get(item.sizePriceId) ?? undefined,
			}));

			return {
				success: true,
				data: {
					...result,
					items: itemsWithDetails,
				},
			};
		} catch {
			return { error: "Failed to fetch invoice" };
		}
	}
);

export const preloadInvoice = async (invoiceNumber: string): Promise<void> => {
	void getInvoiceByNumber(invoiceNumber);
};
