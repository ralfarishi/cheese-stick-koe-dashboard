"use server";

import { createClient } from "@/lib/actions/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { formatLockoutTime } from "@/lib/utils";
import { checkRateLimit, recordFailedAttempt, clearAttempts } from "@/lib/rateLimit";

interface AuthResult {
	error?: string;
}

export async function login(formData: FormData): Promise<AuthResult | never> {
	const email = formData.get("email") as string;
	const password = formData.get("password") as string;

	// Rate limiting check
	const rateLimitResult = await checkRateLimit(email);

	if (!rateLimitResult.allowed) {
		const lockoutTime = formatLockoutTime(rateLimitResult.resetTime ?? 0);
		return {
			error: `Too many login attempts. Please try again in ${lockoutTime}.`,
		};
	}

	const supabase = await createClient();

	const { error } = await supabase.auth.signInWithPassword({
		email,
		password,
	});

	if (error) {
		// Record failed attempt
		await recordFailedAttempt(email);

		// Get updated rate limit info
		const updatedLimit = await checkRateLimit(email);

		if (updatedLimit.remainingAttempts > 0) {
			return {
				error: "Invalid email or password. Please try again.",
			};
		} else {
			return {
				error: "Too many failed attempts. Your account has been temporarily locked.",
			};
		}
	}

	// Clear attempts on successful login
	await clearAttempts(email);

	revalidatePath("/", "layout");
	redirect("/dashboard");
}

export async function logout(): Promise<AuthResult | never> {
	const supabase = await createClient();

	const { error } = await supabase.auth.signOut();

	if (error) {
		return { error: error.message };
	}

	revalidatePath("/", "layout");
	redirect("/");
}

export async function getSession() {
	const supabase = await createClient();

	const {
		data: { session },
	} = await supabase.auth.getSession();

	return session;
}
