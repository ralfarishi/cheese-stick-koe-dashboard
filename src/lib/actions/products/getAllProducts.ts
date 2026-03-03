"use server";

import { cache } from "react";
import { db } from "@/db";
import { product } from "@/db/schema";
import { ilike, asc, desc, count, eq, and } from "drizzle-orm";
import { escapeForLike } from "@/lib/utils";
import { verifySession } from "@/lib/verifySession";
import type { Product, PaginatedResult, PaginationParams, SortOrder } from "@/lib/types";

// Valid sort columns whitelist
const VALID_SORT_COLUMNS = ["name", "createdAt"] as const;
type ProductSortColumn = (typeof VALID_SORT_COLUMNS)[number];

interface GetAllProductsParams extends PaginationParams {
	sortBy?: ProductSortColumn;
}

/**
 * Get paginated list of products with optional search and sorting
 */
export const getAllProducts = cache(
	async ({
		page = 1,
		limit = 10,
		query = "",
		sortOrder = "asc",
		sortBy = "name",
	}: GetAllProductsParams = {}): Promise<PaginatedResult<Product>> => {
		// Input validation and sanitization
		const safePage = Math.max(1, Math.floor(Number(page)) || 1);
		const safeLimit = Math.min(100, Math.max(1, Math.floor(Number(limit)) || 10));
		const safeQuery = escapeForLike(typeof query === "string" ? query.trim() : "");
		const safeSort: SortOrder = sortOrder === "desc" ? "desc" : "asc";
		const safeSortBy = VALID_SORT_COLUMNS.includes(sortBy as ProductSortColumn)
			? (sortBy as ProductSortColumn)
			: "name";

		const offset = (safePage - 1) * safeLimit;

		try {
			const user = await verifySession();
			if (!user) throw new Error("Unauthorized");

			// Build where clause for search and isolation
			const searchClause = safeQuery ? ilike(product.name, `%${safeQuery}%`) : undefined;
			const userClause = eq(product.userId, user.id);
			const whereClause = searchClause ? and(searchClause, userClause) : userClause;

			// Get total count
			const [{ total }] = await db.select({ total: count() }).from(product).where(whereClause);

			// Build order by
			const sortColumn = safeSortBy === "createdAt" ? product.createdAt : product.name;
			const orderBy = safeSort === "asc" ? asc(sortColumn) : desc(sortColumn);

			// Get paginated data
			const data = await db
				.select({
					id: product.id,
					userId: product.userId,
					name: product.name,
					description: product.description,
					createdAt: product.createdAt,
				})
				.from(product)
				.where(whereClause)
				.orderBy(orderBy)
				.limit(safeLimit)
				.offset(offset);

			const totalPages = total ? Math.ceil(total / safeLimit) : 0;

			return { data, error: null, count: total, totalPages };
		} catch (err: unknown) {
			const error = err as Error;
			return { data: [], error: error.message, count: 0, totalPages: 0 };
		}
	},
);

