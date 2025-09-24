import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";

export async function middleware(req) {
	const res = NextResponse.next();
	const supabase = createMiddlewareClient({ req, res });

	const {
		data: { session },
	} = await supabase.auth.getSession();

	const { pathname } = req.nextUrl;

	if (session && pathname === "/") {
		return NextResponse.redirect(new URL("/dashboard", req.url));
	}

	// trying to access protected route
	if (!session && pathname.startsWith("/dashboard")) {
		return NextResponse.redirect(new URL("/", req.url));
	}

	return res;
}

export const config = {
	matcher: ["/", "/dashboard/:path*"],
};
