"use server";

import { cache } from "react";
import { db } from "@/db";
import { product } from "@/db/schema";
import { ilike, asc, desc, count } from "drizzle-orm";
import { escapeForLike } from "@/lib/utils";

// Valid sort columns whitelist
const VALID_SORT_COLUMNS = ["name", "createdAt"];

/**
 * Get paginated list of products with optional search and sorting
 * @returns {Promise<{data: Array, error?: any, count: number, totalPages: number}>}
 */
export const getAllProducts = cache(
	async ({ page = 1, limit = 10, query = "", sortOrder = "asc", sortBy = "name" } = {}) => {
		// Input validation and sanitization
		const safePage = Math.max(1, Math.floor(Number(page)) || 1);
		const safeLimit = Math.min(100, Math.max(1, Math.floor(Number(limit)) || 10));
		const safeQuery = escapeForLike(typeof query === "string" ? query.trim() : "");
		const safeSort = sortOrder === "desc" ? "desc" : "asc";
		const safeSortBy = VALID_SORT_COLUMNS.includes(sortBy) ? sortBy : "name";

		const offset = (safePage - 1) * safeLimit;

		try {
			// Build where clause for search
			const whereClause = safeQuery ? ilike(product.name, `%${safeQuery}%`) : undefined;

			// Get total count
			const [{ total }] = await db.select({ total: count() }).from(product).where(whereClause);

			// Build order by
			const sortColumn = safeSortBy === "createdAt" ? product.createdAt : product.name;
			const orderBy = safeSort === "asc" ? asc(sortColumn) : desc(sortColumn);

			// Get paginated data
			const data = await db
				.select({
					id: product.id,
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
		} catch (err) {
			console.error("Error fetching products:", err);
			return { data: [], error: err.message, count: 0, totalPages: 0 };
		}
	}
);

