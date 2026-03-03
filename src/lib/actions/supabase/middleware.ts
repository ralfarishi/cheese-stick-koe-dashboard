import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

interface UpdateSessionResult {
	response: NextResponse;
	user: any; // Using any for now to match the payload, will refine if necessary
}

export async function updateSession(request: NextRequest): Promise<UpdateSessionResult> {
	let response = NextResponse.next({
		request: {
			headers: request.headers,
		},
	});

	const supabase = createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				get(name: string) {
					return request.cookies.get(name)?.value;
				},
				set(name: string, value: string, options: any) {
					request.cookies.set({
						name,
						value,
						...options,
						httpOnly: true,
						secure: process.env.NODE_ENV === "production",
					});
					response = NextResponse.next({
						request: {
							headers: request.headers,
						},
					});
					response.cookies.set({
						name,
						value,
						...options,
						httpOnly: true,
						secure: process.env.NODE_ENV === "production",
					});
				},
				remove(name: string, options: any) {
					request.cookies.set({
						name,
						value: "",
						...options,
						httpOnly: true,
						secure: process.env.NODE_ENV === "production",
					});
					response = NextResponse.next({
						request: {
							headers: request.headers,
						},
					});
					response.cookies.set({
						name,
						value: "",
						...options,
						httpOnly: true,
						secure: process.env.NODE_ENV === "production",
					});
				},
			},
		},
	);

	// Refresh session if expired and verify user securely
	const {
		data: { user },
	} = await supabase.auth.getUser();

	return { response, user };
}

