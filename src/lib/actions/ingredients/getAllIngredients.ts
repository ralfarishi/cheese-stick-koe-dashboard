"use server";

import { cache } from "react";
import { db } from "@/db";
import { ingredient } from "@/db/schema";
import { ilike, asc, desc, count } from "drizzle-orm";
import { escapeForLike } from "@/lib/utils";
import type { Ingredient, PaginatedResult, PaginationParams, SortOrder } from "@/lib/types";

// Valid sort columns whitelist
const VALID_SORT_COLUMNS = ["name", "costPerUnit", "createdAt"] as const;
type IngredientSortColumn = (typeof VALID_SORT_COLUMNS)[number];

interface GetAllIngredientsParams extends PaginationParams {
	sortBy?: IngredientSortColumn;
}

/**
 * Get paginated list of ingredients with optional search and sorting
 */
export const getAllIngredients = cache(
	async ({
		page = 1,
		limit = 10,
		query = "",
		sortOrder = "asc",
		sortBy = "name",
	}: GetAllIngredientsParams = {}): Promise<PaginatedResult<Ingredient>> => {
		// Input validation and sanitization
		const safePage = Math.max(1, Math.floor(Number(page)) || 1);
		const safeLimit = Math.min(100, Math.max(1, Math.floor(Number(limit)) || 10));
		const safeQuery = escapeForLike(typeof query === "string" ? query.trim() : "");
		const safeSort: SortOrder = sortOrder === "desc" ? "desc" : "asc";
		const safeSortBy = VALID_SORT_COLUMNS.includes(sortBy as IngredientSortColumn)
			? (sortBy as IngredientSortColumn)
			: "name";

		const offset = (safePage - 1) * safeLimit;

		try {
			// Build where clause for search
			const whereClause = safeQuery ? ilike(ingredient.name, `%${safeQuery}%`) : undefined;

			// Get total count
			const [{ total }] = await db.select({ total: count() }).from(ingredient).where(whereClause);

			// Build order by - map column name to schema field
			const sortColumnMap = {
				name: ingredient.name,
				costPerUnit: ingredient.costPerUnit,
				createdAt: ingredient.createdAt,
			} as const;
			const sortColumn = sortColumnMap[safeSortBy] || ingredient.name;
			const orderBy = safeSort === "asc" ? asc(sortColumn) : desc(sortColumn);

			// Get paginated data
			const data = await db
				.select({
					id: ingredient.id,
					name: ingredient.name,
					unit: ingredient.unit,
					costPerUnit: ingredient.costPerUnit,
					createdAt: ingredient.createdAt,
				})
				.from(ingredient)
				.where(whereClause)
				.orderBy(orderBy)
				.limit(safeLimit)
				.offset(offset);

			const totalPages = total ? Math.ceil(total / safeLimit) : 0;

			return { data, error: null, count: total, totalPages };
		} catch (err: unknown) {
			const error = err as Error;
			console.error("Error fetching ingredients:", err);
			return { data: [], error: error.message, count: 0, totalPages: 0 };
		}
	}
);
