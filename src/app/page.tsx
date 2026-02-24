import { redirect } from "next/navigation";

import { createClient } from "@/lib/actions/supabase/server";

import LoginForm from "./_components/LoginForm";

export default async function LoginPage() {
	const supabase = await createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (user) {
		redirect("/dashboard");
	}

	return <LoginForm />;
}

