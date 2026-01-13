import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Create Supabase client for authentication operations ONLY
 * For database queries, use Drizzle ORM from '@/db'
 *
 * @returns {Promise<import('@supabase/supabase-js').SupabaseClient>}
 */
export async function createClient() {
	const cookieStore = await cookies();

	return createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
		{
			cookies: {
				get(name) {
					return cookieStore.get(name)?.value;
				},
				set(name, value, options) {
					try {
						cookieStore.set(name, value, options);
					} catch (error) {
						// Handle cookie setting errors in middleware
					}
				},
				remove(name, options) {
					try {
						cookieStore.set(name, "", options);
					} catch (error) {
						// Handle cookie removal errors in middleware
					}
				},
			},
		}
	);
}

/**
 * Alias for createClient - for clarity in auth operations
 * @deprecated Use createClient() instead
 */
export const createAuthClient = createClient;
