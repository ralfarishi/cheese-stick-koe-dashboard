import { supabaseServer } from "@/lib/supabaseServer";

export async function verifySession() {
	const supabase = await supabaseServer();
	const {
		data: { session },
	} = await supabase.auth.getSession();

	return session;
}
