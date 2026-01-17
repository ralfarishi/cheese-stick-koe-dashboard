"use server";

import { db } from "@/db";
import { invoice, invoiceItem, product, productSizePrice } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { Invoice } from "@/lib/types";

interface ItemWithDetails {
	id: string;
	invoiceId: string;
	productId: string;
	sizePriceId: string;
	quantity: number;
	subtotal: number;
	discountAmount: number;
	costPerItem: number;
	totalCost: number;
	product: { name: string | null };
	size: { size: string | null };
}

interface GetInvoiceWithItemsResult {
	invoice: Invoice | null;
	items: ItemWithDetails[];
}

/**
 * Get invoice with all items for display/editing
 */
export async function getInvoiceWithItems(invoiceId: string): Promise<GetInvoiceWithItemsResult> {
	// Input validation
	if (!invoiceId || typeof invoiceId !== "string") {
		return { invoice: null, items: [] };
	}

	try {
		// Get invoice
		const [invoiceData] = await db.select().from(invoice).where(eq(invoice.id, invoiceId)).limit(1);

		if (!invoiceData) {
			return { invoice: null, items: [] };
		}

		// Get items with product and size details
		const items = await db
			.select({
				id: invoiceItem.id,
				invoiceId: invoiceItem.invoiceId,
				productId: invoiceItem.productId,
				sizePriceId: invoiceItem.sizePriceId,
				quantity: invoiceItem.quantity,
				subtotal: invoiceItem.subtotal,
				discountAmount: invoiceItem.discountAmount,
				costPerItem: invoiceItem.costPerItem,
				totalCost: invoiceItem.totalCost,
				productName: product.name,
				size: productSizePrice.size,
			})
			.from(invoiceItem)
			.leftJoin(product, eq(invoiceItem.productId, product.id))
			.leftJoin(productSizePrice, eq(invoiceItem.sizePriceId, productSizePrice.id))
			.where(eq(invoiceItem.invoiceId, invoiceId));

		// Transform to match original format
		const formattedItems: ItemWithDetails[] = items.map((item) => ({
			id: item.id,
			invoiceId: item.invoiceId,
			productId: item.productId,
			sizePriceId: item.sizePriceId,
			quantity: item.quantity,
			subtotal: item.subtotal,
			discountAmount: item.discountAmount,
			costPerItem: item.costPerItem,
			totalCost: item.totalCost,
			product: { name: item.productName },
			size: { size: item.size },
		}));

		return { invoice: invoiceData, items: formattedItems };
	} catch (err) {
		console.error("Error fetching invoice with items:", err);
		return { invoice: null, items: [] };
	}
}

