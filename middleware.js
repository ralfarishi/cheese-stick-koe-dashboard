import { updateSession } from "@/lib/actions/supabase/middleware";
import { NextResponse } from "next/server";

export async function middleware(request) {
  const { response, session } = await updateSession(request);
  const { pathname } = request.nextUrl;

  // Ff login success
  // Redirect authenticated users from login page to dashboard
  if (session && pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If not login
  // Redirect unauthenticated users from dashboard to login
  if (!session && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
