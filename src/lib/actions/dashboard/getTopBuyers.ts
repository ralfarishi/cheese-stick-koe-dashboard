"use server";

import { cache } from "react";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import { verifySession } from "@/lib/verifySession";
import { logger } from "@/lib/logger";

export interface TopBuyerStat {
	buyerName: string;
	totalOrders: number;
	totalSpent: number;
}

interface DBRow {
	buyer_name: string;
	total_orders: string | number;
	total_spent: string | number;
}

/**
 * Get top buyers ranked by total spent
 */
export const getTopBuyers = cache(async (limit: number = 5): Promise<TopBuyerStat[]> => {
	try {
		const user = await verifySession();
		if (!user) throw new Error("Unauthorized");

		// Call the RPC function via raw SQL
		const result = await db.execute(sql`SELECT * FROM get_top_buyers(${limit}, ${user.id})`);

		const data = (
			Array.isArray(result) ? result : (result as { rows?: DBRow[] }).rows || []
		) as DBRow[];

		return data.map((item) => ({
			buyerName: item.buyer_name,
			totalOrders: Number(item.total_orders) || 0,
			totalSpent: Number(item.total_spent) || 0,
		}));
	} catch (err) {
		logger.error("getTopBuyers", err);
		return [];
	}
});
