import { cache } from "react";
import { createClient } from "@/lib/actions/supabase/server";

/**
 * Verify session and return the authenticated user.
 * Wrapped with React.cache() for per-request deduplication
 */
export const verifySession = cache(async () => {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	return user;
});

