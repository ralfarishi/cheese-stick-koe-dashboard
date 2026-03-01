"use server";

import { cache } from "react";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export interface TopProductStat {
	productName: string;
	size: string;
	totalQuantity: number;
	totalRevenue: number;
}

interface DBRow {
	product_name: string;
	size: string;
	total_quantity: string | number;
	total_revenue: string | number;
}

/**
 * Get top performing products grouped by size
 */
export const getTopProducts = cache(async (limit: number = 5): Promise<TopProductStat[]> => {
	try {
		// Call the RPC function via raw SQL
		const result = await db.execute(sql`SELECT * FROM get_top_products(${limit})`);

		const data = (
			Array.isArray(result) ? result : (result as { rows?: DBRow[] }).rows || []
		) as DBRow[];

		return data.map((item) => ({
			productName: item.product_name,
			size: item.size,
			totalQuantity: Number(item.total_quantity) || 0,
			totalRevenue: Number(item.total_revenue) || 0,
		}));
	} catch (err) {
		console.error("Error fetching top products:", err);
		return [];
	}
});
