import { createClient } from "@/lib/actions/supabase/server";

export async function verifySession() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session;
}
