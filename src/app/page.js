import { redirect } from "next/navigation";

import { supabaseServer } from "@/lib/supabaseServer";

import LoginForm from "./_components/LoginForm";

export default async function LoginPage() {
	const supabase = await supabaseServer();

	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (session) {
		redirect("/dashboard");
	}

	return <LoginForm />;
}
