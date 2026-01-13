"use server";

import { cache } from "react";
import { db } from "@/db";
import { productSizePrice } from "@/db/schema";
import { asc, desc, count } from "drizzle-orm";

// Valid sort columns whitelist
const VALID_SORT_COLUMNS = ["size", "price", "laborPercent", "createdAt"];

/**
 * Get paginated list of size prices with sorting
 * @returns {Promise<{data: Array, error?: any, count: number, totalPages: number}>}
 */
export const getAllSizePrice = cache(
	async ({ page = 1, limit = 10, sortOrder = "asc", sortBy = "size" } = {}) => {
		// Input validation and sanitization
		const safePage = Math.max(1, Math.floor(Number(page)) || 1);
		const safeLimit = Math.min(100, Math.max(1, Math.floor(Number(limit)) || 10));
		const safeSort = sortOrder === "desc" ? "desc" : "asc";
		const safeSortBy = VALID_SORT_COLUMNS.includes(sortBy) ? sortBy : "size";

		const offset = (safePage - 1) * safeLimit;

		try {
			// Get total count
			const [{ total }] = await db.select({ total: count() }).from(productSizePrice);

			// Build order by - map column name to schema field
			const sortColumnMap = {
				size: productSizePrice.size,
				price: productSizePrice.price,
				laborPercent: productSizePrice.laborPercent,
				createdAt: productSizePrice.createdAt,
			};
			const sortColumn = sortColumnMap[safeSortBy] || productSizePrice.size;
			const orderBy = safeSort === "asc" ? asc(sortColumn) : desc(sortColumn);

			// Get paginated data
			const data = await db
				.select({
					id: productSizePrice.id,
					size: productSizePrice.size,
					price: productSizePrice.price,
					laborPercent: productSizePrice.laborPercent,
					createdAt: productSizePrice.createdAt,
				})
				.from(productSizePrice)
				.orderBy(orderBy)
				.limit(safeLimit)
				.offset(offset);

			const totalPages = total ? Math.ceil(total / safeLimit) : 0;

			return { data, error: null, count: total, totalPages };
		} catch (err) {
			console.error("Error fetching size prices:", err);
			return { data: [], error: err.message, count: 0, totalPages: 0 };
		}
	}
);
