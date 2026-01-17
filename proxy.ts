import { updateSession } from "@/lib/actions/supabase/middleware";
import { NextResponse, NextRequest } from "next/server";

export default async function proxy(request: NextRequest) {
	const { response, session } = await updateSession(request);
	const { pathname } = request.nextUrl;

	const isLoginPage = pathname === "/";
	const isDashboard = pathname.startsWith("/dashboard");

	// If login success
	// Redirect authenticated users from login page to dashboard
	if (session && isLoginPage) {
		return NextResponse.redirect(new URL("/dashboard", request.url));
	}

	// If not login
	// Redirect unauthenticated users from dashboard to login
	if (!session && isDashboard) {
		return NextResponse.redirect(new URL("/", request.url));
	}

	return response;
}

export const config = {
	matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
