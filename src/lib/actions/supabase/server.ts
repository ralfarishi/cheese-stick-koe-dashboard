import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Create Supabase client for authentication operations ONLY
 * For database queries, use Drizzle ORM from '@/db'
 */
export async function createClient(): Promise<SupabaseClient> {
	const cookieStore = await cookies();

	return createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				get(name: string) {
					return cookieStore.get(name)?.value;
				},
				set(name: string, value: string, options: Parameters<typeof cookieStore.set>[2]) {
					try {
						cookieStore.set(name, value, options);
					} catch {
						// Handle cookie setting errors in middleware
					}
				},
				remove(name: string, options: Parameters<typeof cookieStore.set>[2]) {
					try {
						cookieStore.set(name, "", options);
					} catch {
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
