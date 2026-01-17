"use server";

import { cache } from "react";
import { db } from "@/db";
import { sql } from "drizzle-orm";

interface MonthlyCustomerStat {
	month: string;
	totalCustomer: number;
}

interface DBRow {
	month: string;
	total_customer: number | string;
}

/**
 * Get customer statistics for a given year (monthly breakdown)
 */
export const getCustomerStats = cache(
	async (year: number | string): Promise<MonthlyCustomerStat[]> => {
		// Input validation
		const safeYear = Math.floor(Number(year));
		if (Number.isNaN(safeYear) || safeYear < 1900 || safeYear > 2100) {
			return [];
		}

		try {
			// Call existing RPC function via raw SQL
			const result = await db.execute(sql`SELECT * FROM get_customer_stats(${safeYear})`);

			const data = (
				Array.isArray(result) ? result : (result as { rows?: DBRow[] }).rows || []
			) as DBRow[];

			// Initialize all months with 0
			const monthlyCustomers: MonthlyCustomerStat[] = Array.from({ length: 12 }, (_, i) => {
				const date = new Date(safeYear, i, 1);
				return {
					month: date.toLocaleString("en", { month: "short" }),
					totalCustomer: 0,
				};
			});

			// Merge data from DB
			data.forEach((item) => {
				const monthIndex = monthlyCustomers.findIndex((m) => m.month === item.month);
				if (monthIndex !== -1) {
					monthlyCustomers[monthIndex].totalCustomer = Number(item.total_customer) || 0;
				}
			});

			return monthlyCustomers;
		} catch (err) {
			console.error("Error fetching customer stats:", err);
			return [];
		}
	}
);
