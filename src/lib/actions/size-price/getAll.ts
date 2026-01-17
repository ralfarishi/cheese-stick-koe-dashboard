"use server";

import { cache } from "react";
import { db } from "@/db";
import { productSizePrice } from "@/db/schema";
import { asc, desc, count } from "drizzle-orm";
import type { ProductSizePrice, PaginatedResult, PaginationParams, SortOrder } from "@/lib/types";

// Valid sort columns whitelist
const VALID_SORT_COLUMNS = ["size", "price", "laborPercent", "createdAt"] as const;
type SizePriceSortColumn = (typeof VALID_SORT_COLUMNS)[number];

interface GetAllSizePriceParams extends Omit<PaginationParams, "query"> {
	sortBy?: SizePriceSortColumn;
}

/**
 * Get paginated list of size prices with sorting
 */
export const getAllSizePrice = cache(
	async ({
		page = 1,
		limit = 10,
		sortOrder = "asc",
		sortBy = "size",
	}: GetAllSizePriceParams = {}): Promise<PaginatedResult<ProductSizePrice>> => {
		// Input validation and sanitization
		const safePage = Math.max(1, Math.floor(Number(page)) || 1);
		const safeLimit = Math.min(100, Math.max(1, Math.floor(Number(limit)) || 10));
		const safeSort: SortOrder = sortOrder === "desc" ? "desc" : "asc";
		const safeSortBy = VALID_SORT_COLUMNS.includes(sortBy as SizePriceSortColumn)
			? (sortBy as SizePriceSortColumn)
			: "size";

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
			} as const;
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
		} catch (err: unknown) {
			const error = err as Error;
			console.error("Error fetching size prices:", err);
			return { data: [], error: error.message, count: 0, totalPages: 0 };
		}
	}
);
