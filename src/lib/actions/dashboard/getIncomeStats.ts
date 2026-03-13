"use server";

import { cache } from "react";
import { createClient } from "@/lib/actions/supabase/server";
import { logger } from "@/lib/logger";

export interface MonthlyIncome {
	month: string;
	totalIncome: number;
}

/**
 * Get monthly income statistics for a given year using the get_income_stats RPC function
 */
export const getIncomeStats = cache(async (year: number): Promise<MonthlyIncome[]> => {
	try {
		const supabase = await createClient();

		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			throw new Error("Unauthorized");
		}

		// Call the Supabase RPC function
		const { data, error } = await supabase.rpc("get_income_stats", {
			p_year: year,
			p_user_id: user.id,
		});

		if (error) {
			throw error;
		}

		return (data as MonthlyIncome[]) || [];
	} catch (err) {
		logger.error("getIncomeStats", err);
		// Return empty array on error to prevent UI crashes
		return [];
	}
});
