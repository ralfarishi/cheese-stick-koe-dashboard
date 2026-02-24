import { createClient } from "@/lib/actions/supabase/server";

export async function verifySession() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	return user;
}

