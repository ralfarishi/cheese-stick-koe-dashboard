"use server";

import { createClient } from "@/lib/actions/supabase/server";

export async function getRateLimits() {
	const supabase = await createClient();

	try {
		const { data, error } = await supabase
			.from("RateLimit")
			.select("*")
			.order("firstAttempt", { ascending: false });

		if (error) {
			return { data: [], error: error.message };
		}

		// Convert BigInt to number/string for serialization
		const formattedData = data.map((record) => ({
			...record,
			firstAttempt: Number(record.firstAttempt),
			lockedUntil: record.lockedUntil ? Number(record.lockedUntil) : null,
		}));

		return { data: formattedData };
	} catch (err) {
		return { data: [], error: "Failed to fetch rate limits" };
	}
}
