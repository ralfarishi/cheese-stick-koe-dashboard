"use server";

import { cache } from "react";
import { db } from "@/db";
import { invoice, invoiceItem, product, productSizePrice } from "@/db/schema";
import { eq, or, ilike, asc, desc, count } from "drizzle-orm";
import { escapeForLike } from "@/lib/utils";

/**
 * Get paginated list of invoices with optional search and sorting
 * @returns {Promise<{data: Array, error?: any, count: number, totalPages: number}>}
 */
export const getAllInvoice = cache(
	async ({ page = 1, limit = 10, query = "", sortOrder = "desc" } = {}) => {
		// Input validation and sanitization
		const safePage = Math.max(1, Math.floor(Number(page)) || 1);
		const safeLimit = Math.min(100, Math.max(1, Math.floor(Number(limit)) || 10));
		const safeQuery = escapeForLike(typeof query === "string" ? query.trim() : "");
		const safeSort = sortOrder === "asc" ? "asc" : "desc";

		const offset = (safePage - 1) * safeLimit;

		try {
			// Build where clause for search
			const whereClause = safeQuery
				? or(
						ilike(invoice.invoiceNumber, `%${safeQuery}%`),
						ilike(invoice.buyerName, `%${safeQuery}%`)
				  )
				: undefined;

			// Get total count
			const [{ total }] = await db.select({ total: count() }).from(invoice).where(whereClause);

			// Get paginated data
			const data = await db
				.select({
					id: invoice.id,
					invoiceNumber: invoice.invoiceNumber,
					buyerName: invoice.buyerName,
					totalPrice: invoice.totalPrice,
					invoiceDate: invoice.invoiceDate,
					status: invoice.status,
					createdAt: invoice.createdAt,
				})
				.from(invoice)
				.where(whereClause)
				.orderBy(safeSort === "asc" ? asc(invoice.invoiceNumber) : desc(invoice.invoiceNumber))
				.limit(safeLimit)
				.offset(offset);

			const totalPages = total ? Math.ceil(total / safeLimit) : 0;

			return { data, error: null, count: total, totalPages };
		} catch (err) {
			console.error("Error fetching invoices:", err);
			return { data: [], error: err.message, count: 0, totalPages: 0 };
		}
	}
);

